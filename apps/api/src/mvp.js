import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query } from './db.js';
import { clearSession, hashPassword, requireRole, requireUser, setSession, verifyPassword } from './auth.js';

export const mvp = Router();
const run = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
const idSchema = z.string().uuid();
const registration = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254), password: z.string().min(8).max(128), role: z.enum(['teacher', 'student']) }).strict();
const login = z.object({ email: z.string().email(), password: z.string().min(1) }).strict();
const courseInput = z.object({ title: z.string().trim().min(3).max(200), description: z.string().trim().max(5000), published: z.boolean().optional() }).strict();
const simulationInput = z.object({ title: z.string().trim().min(3).max(200), scenario: z.string().trim().min(10).max(20000), objective: z.string().trim().min(3).max(5000), tutorInstructions: z.string().trim().min(3).max(20000), published: z.boolean().optional() }).strict();
const courseSelect = 'id, title, description, teacher_id AS "teacherId", published, created_at AS "createdAt", updated_at AS "updatedAt"';
const simulationSelect = 'id, course_id AS "courseId", title, clinical_situation AS scenario, academic_challenge AS objective, tutor_instructions AS "tutorInstructions", published, created_at AS "createdAt", updated_at AS "updatedAt"';
const studentSimulationSelect = 'id, course_id AS "courseId", title, clinical_situation AS scenario, academic_challenge AS objective, published, created_at AS "createdAt", updated_at AS "updatedAt"';
const qualified = (columns, alias) => `${alias}.${columns.replaceAll(', ', `, ${alias}.`)}`;

function parse(schema, value, res) {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  res.status(400).json({ error: 'Datos inválidos', details: result.error.flatten().fieldErrors });
  return null;
}
async function ownCourse(id, userId) {
  const { rows } = await query(`SELECT ${courseSelect} FROM courses WHERE id = $1 AND teacher_id = $2`, [id, userId]);
  return rows[0] ?? null;
}

mvp.post('/auth/register', run(async (req, res) => {
  const data = parse(registration, req.body, res); if (!data) return;
  try {
    const hash = await hashPassword(data.password);
    const { rows } = await query('INSERT INTO users (display_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, display_name AS name, email, role, created_at AS "createdAt"', [data.name, data.email.toLowerCase(), hash, data.role]);
    setSession(res, rows[0].id);
    res.status(201).json({ user: rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ese correo ya está registrado' });
    throw error;
  }
}));

mvp.post('/auth/login', run(async (req, res) => {
  const data = parse(login, req.body, res); if (!data) return;
  const { rows } = await query('SELECT id, display_name AS name, email, role, created_at AS "createdAt", password_hash FROM users WHERE email = $1 AND active = true', [data.email.trim().toLowerCase()]);
  const user = rows[0];
  if (!user || !(await verifyPassword(data.password, user.password_hash))) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  delete user.password_hash;
  setSession(res, user.id);
  res.json({ user });
}));
mvp.post('/auth/logout', (_req, res) => { clearSession(res); res.status(204).end(); });
mvp.get('/auth/me', requireUser, (req, res) => res.json({ user: req.user }));

mvp.get('/courses', requireUser, run(async (req, res) => {
  if (req.user.role === 'teacher') {
    const { rows } = await query(`SELECT ${courseSelect} FROM courses WHERE teacher_id = $1 ORDER BY created_at DESC`, [req.user.id]);
    return res.json({ courses: rows });
  }
  const { rows } = await query(`SELECT ${qualified(courseSelect, 'c')}, u.display_name AS "teacherName", EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.id AND e.student_id = $1) AS enrolled FROM courses c JOIN users u ON u.id = c.teacher_id WHERE c.published = true ORDER BY c.created_at DESC`, [req.user.id]);
  res.json({ courses: rows });
}));

mvp.post('/courses', requireUser, requireRole('teacher'), run(async (req, res) => {
  const data = parse(courseInput, req.body, res); if (!data) return;
  const { rows } = await query(`INSERT INTO courses (title, description, teacher_id, published) VALUES ($1, $2, $3, $4) RETURNING ${courseSelect}`, [data.title, data.description, req.user.id, data.published ?? true]);
  res.status(201).json({ course: rows[0] });
}));

mvp.get('/courses/:courseId', requireUser, run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  if (req.user.role === 'teacher') {
    const course = await ownCourse(id, req.user.id);
    return course ? res.json({ course }) : res.status(404).json({ error: 'Curso no encontrado' });
  }
  const { rows } = await query(`SELECT ${qualified(courseSelect, 'c')}, u.display_name AS "teacherName", EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.id AND e.student_id = $2) AS enrolled FROM courses c JOIN users u ON u.id = c.teacher_id WHERE c.id = $1 AND c.published = true`, [id, req.user.id]);
  return rows[0] ? res.json({ course: rows[0] }) : res.status(404).json({ error: 'Curso no encontrado' });
}));

mvp.patch('/courses/:courseId', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  const data = parse(courseInput.partial().refine((value) => Object.keys(value).length > 0), req.body, res); if (!data) return;
  const { rows } = await query(`UPDATE courses SET title = COALESCE($3, title), description = COALESCE($4, description), published = COALESCE($5, published), updated_at = now() WHERE id = $1 AND teacher_id = $2 RETURNING ${courseSelect}`, [id, req.user.id, data.title ?? null, data.description ?? null, data.published ?? null]);
  return rows[0] ? res.json({ course: rows[0] }) : res.status(404).json({ error: 'Curso no encontrado' });
}));

mvp.post('/courses/:courseId/enroll', requireUser, requireRole('student'), run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  const { rows } = await query('INSERT INTO enrollments (student_id, course_id) SELECT $1, id FROM courses WHERE id = $2 AND published = true ON CONFLICT (student_id, course_id) DO UPDATE SET student_id = EXCLUDED.student_id RETURNING id, student_id AS "studentId", course_id AS "courseId", created_at AS "createdAt"', [req.user.id, id]);
  return rows[0] ? res.json({ enrollment: rows[0] }) : res.status(404).json({ error: 'Curso no disponible' });
}));

mvp.get('/courses/:courseId/simulations', requireUser, run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  if (req.user.role === 'teacher') {
    if (!(await ownCourse(id, req.user.id))) return res.status(404).json({ error: 'Curso no encontrado' });
    const { rows } = await query(`SELECT ${simulationSelect} FROM clinical_cases WHERE course_id = $1 ORDER BY created_at DESC`, [id]);
    return res.json({ simulations: rows });
  }
  const { rows } = await query(`SELECT ${qualified(studentSimulationSelect, 's')} FROM clinical_cases s JOIN courses c ON c.id = s.course_id JOIN enrollments e ON e.course_id = c.id AND e.student_id = $2 WHERE s.course_id = $1 AND s.published = true AND c.published = true ORDER BY s.created_at DESC`, [id, req.user.id]);
  res.json({ simulations: rows });
}));

mvp.post('/courses/:courseId/simulations', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  const data = parse(simulationInput, req.body, res); if (!data) return;
  if (!(await ownCourse(id, req.user.id))) return res.status(404).json({ error: 'Curso no encontrado' });
  const { rows } = await query(`INSERT INTO clinical_cases (course_id, slug, title, subject, difficulty, topic, clinical_situation, academic_challenge, tutor_instructions, rubric_definition, published) VALUES ($1, $2, $3, 'Bioquímica', 'introductorio', $3, $4, $5, $6, '{}'::jsonb, $7) RETURNING ${simulationSelect}`, [id, randomUUID(), data.title, data.scenario, data.objective, data.tutorInstructions, data.published ?? false]);
  res.status(201).json({ simulation: rows[0] });
}));

mvp.get('/simulations/:simulationId', requireUser, run(async (req, res) => {
  const id = parse(idSchema, req.params.simulationId, res); if (!id) return;
  const teacher = req.user.role === 'teacher';
  const { rows } = await query(`SELECT ${qualified(teacher ? simulationSelect : studentSimulationSelect, 's')} FROM clinical_cases s JOIN courses c ON c.id = s.course_id ${teacher ? '' : 'JOIN enrollments e ON e.course_id = c.id AND e.student_id = $2'} WHERE s.id = $1 AND ${teacher ? 'c.teacher_id = $2' : 's.published = true AND c.published = true'}`, [id, req.user.id]);
  return rows[0] ? res.json({ simulation: rows[0] }) : res.status(404).json({ error: 'Simulación no encontrada' });
}));

mvp.patch('/simulations/:simulationId', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.simulationId, res); if (!id) return;
  const data = parse(simulationInput.partial().refine((value) => Object.keys(value).length > 0), req.body, res); if (!data) return;
  const { rows } = await query(`UPDATE clinical_cases s SET title = COALESCE($3, s.title), topic = COALESCE($3, s.topic), clinical_situation = COALESCE($4, s.clinical_situation), academic_challenge = COALESCE($5, s.academic_challenge), tutor_instructions = COALESCE($6, s.tutor_instructions), published = COALESCE($7, s.published), version = s.version + 1, updated_at = now() FROM courses c WHERE s.id = $1 AND c.id = s.course_id AND c.teacher_id = $2 RETURNING ${qualified(simulationSelect, 's')}`, [id, req.user.id, data.title ?? null, data.scenario ?? null, data.objective ?? null, data.tutorInstructions ?? null, data.published ?? null]);
  return rows[0] ? res.json({ simulation: rows[0] }) : res.status(404).json({ error: 'Simulación no encontrada' });
}));
