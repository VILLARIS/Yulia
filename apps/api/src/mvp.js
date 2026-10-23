import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { pool, query } from './db.js';
import { clearSession, hashPassword, optionalUser, requireRole, requireUser, setSession, verifyPassword } from './auth.js';
import { extractYouTubeVideoId } from './youtube.js';
import {
  MAX_COVER_BYTES, coverTypeMatchesPath, createCoverPath, createStorage,
  isAllowedCoverType, isCourseCoverPath, matchesCoverSignature,
} from './storage.js';

export function createMvpRouter(options = {}) {
  const router = Router();
  const storage = options.storage ?? createStorage();
  const run = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
const idSchema = z.string().uuid();
const registration = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254), password: z.string().min(8).max(128), role: z.literal('student').optional() }).strict();
const login = z.object({ email: z.string().email(), password: z.string().min(1) }).strict();
const courseInput = z.object({ title: z.string().trim().min(3).max(200), description: z.string().trim().max(5000), published: z.boolean().optional() }).strict();
const simulationInput = z.object({ title: z.string().trim().min(3).max(200), scenario: z.string().trim().min(10).max(20000), objective: z.string().trim().min(3).max(5000), tutorInstructions: z.string().trim().min(3).max(20000), published: z.boolean().optional() }).strict();
const videoInput = z.object({ title: z.string().trim().min(3).max(200), description: z.string().trim().max(5000), youtubeUrl: z.string().trim().min(1).max(2048), published: z.boolean().optional() }).strict();
const coverUploadInput = z.object({ contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']), size: z.number().int().positive().max(MAX_COVER_BYTES) }).strict();
const coverConfirmInput = z.object({ path: z.string().min(1).max(500) }).strict();
const courseSelect = 'id, title, description, teacher_id AS "teacherId", cover_image_path AS "coverImagePath", published, created_at AS "createdAt", updated_at AS "updatedAt"';
const videoSelect = 'id, teacher_id AS "teacherId", title, description, youtube_url AS "youtubeUrl", youtube_video_id AS "youtubeVideoId", published, created_at AS "createdAt", updated_at AS "updatedAt"';
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
function withCover(course) {
  return course ? { ...course, coverImageUrl: course.coverImagePath ? storage.publicUrl(course.coverImagePath) : null } : course;
}
function withCovers(courses) {
  return courses.map(withCover);
}
function storageUnavailable(res) {
  if (storage.available !== false) return false;
  res.status(503).json({ error: 'La carga de portadas no está configurada' });
  return true;
}
async function removeCover(path, courseId) {
  if (!path || !isCourseCoverPath(path, courseId) || storage.available === false) return;
  try {
    await storage.remove(path);
  } catch (error) {
    console.error(`No se pudo eliminar la portada ${path}: ${error.message}`);
  }
}

router.post('/auth/register', run(async (req, res) => {
  const data = parse(registration, req.body, res); if (!data) return;
  try {
    const hash = await hashPassword(data.password);
    const { rows } = await query('INSERT INTO users (display_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, display_name AS name, email, role, created_at AS "createdAt"', [data.name, data.email.toLowerCase(), hash, 'student']);
    setSession(res, rows[0].id);
    res.status(201).json({ user: rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ese correo ya está registrado' });
    throw error;
  }
}));

router.post('/auth/login', run(async (req, res) => {
  const data = parse(login, req.body, res); if (!data) return;
  const { rows } = await query('SELECT id, display_name AS name, email, role, created_at AS "createdAt", password_hash FROM users WHERE email = $1 AND active = true', [data.email.trim().toLowerCase()]);
  const user = rows[0];
  if (!user || !(await verifyPassword(data.password, user.password_hash))) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  delete user.password_hash;
  setSession(res, user.id);
  res.json({ user });
}));
router.post('/auth/logout', (_req, res) => { clearSession(res); res.status(204).end(); });
router.get('/auth/me', requireUser, (req, res) => res.json({ user: req.user }));

// Lectura pública: el catálogo muestra solo cursos publicados. Con sesión de
// docente devuelve sus propios cursos; con sesión de estudiante o como
// visitante, el catálogo publicado con la marca `enrolled` para quien tenga cuenta.
router.get('/courses', optionalUser, run(async (req, res) => {
  if (req.user?.role === 'teacher') {
    const { rows } = await query(`SELECT ${courseSelect} FROM courses WHERE teacher_id = $1 ORDER BY created_at DESC`, [req.user.id]);
    return res.json({ courses: withCovers(rows) });
  }
  const { rows } = await query(`SELECT ${qualified(courseSelect, 'c')}, u.display_name AS "teacherName", EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.id AND e.student_id = $1) AS enrolled FROM courses c JOIN users u ON u.id = c.teacher_id WHERE c.published = true ORDER BY c.created_at DESC`, [req.user?.id ?? null]);
  res.json({ courses: withCovers(rows) });
}));

router.post('/courses', requireUser, requireRole('teacher'), run(async (req, res) => {
  const data = parse(courseInput, req.body, res); if (!data) return;
  if (data.published === true) return res.status(400).json({ error: 'Añade una portada antes de publicar el curso' });
  const { rows } = await query(`INSERT INTO courses (title, description, teacher_id, published) VALUES ($1, $2, $3, false) RETURNING ${courseSelect}`, [data.title, data.description, req.user.id]);
  res.status(201).json({ course: withCover(rows[0]) });
}));

router.get('/courses/:courseId', requireUser, run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  if (req.user.role === 'teacher') {
    const course = await ownCourse(id, req.user.id);
    return course ? res.json({ course: withCover(course) }) : res.status(404).json({ error: 'Curso no encontrado' });
  }
  const { rows } = await query(`SELECT ${qualified(courseSelect, 'c')}, u.display_name AS "teacherName", EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.id AND e.student_id = $2) AS enrolled FROM courses c JOIN users u ON u.id = c.teacher_id WHERE c.id = $1 AND c.published = true`, [id, req.user.id]);
  return rows[0] ? res.json({ course: withCover(rows[0]) }) : res.status(404).json({ error: 'Curso no encontrado' });
}));

router.patch('/courses/:courseId', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  const data = parse(courseInput.partial().refine((value) => Object.keys(value).length > 0), req.body, res); if (!data) return;
  const current = await ownCourse(id, req.user.id);
  if (!current) return res.status(404).json({ error: 'Curso no encontrado' });
  if (data.published === true && !current.published && !current.coverImagePath) {
    return res.status(400).json({ error: 'Añade una portada antes de publicar el curso' });
  }
  const { rows } = await query(`UPDATE courses SET title = COALESCE($3, title), description = COALESCE($4, description), published = COALESCE($5, published), updated_at = now() WHERE id = $1 AND teacher_id = $2 RETURNING ${courseSelect}`, [id, req.user.id, data.title ?? null, data.description ?? null, data.published ?? null]);
  return res.json({ course: withCover(rows[0]) });
}));

router.post('/courses/:courseId/cover/upload-url', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  const data = parse(coverUploadInput, req.body, res); if (!data) return;
  if (storageUnavailable(res)) return;
  if (!(await ownCourse(id, req.user.id))) return res.status(404).json({ error: 'Curso no encontrado' });
  if (!isAllowedCoverType(data.contentType)) return res.status(400).json({ error: 'Formato de imagen no permitido' });
  const path = createCoverPath(id, data.contentType);
  const signed = await storage.createSignedUpload(path);
  res.json({
    upload: {
      url: signed.url,
      method: 'PUT',
      headers: { 'Content-Type': data.contentType, 'x-upsert': 'false' },
      path,
      expiresIn: signed.expiresIn,
    },
  });
}));

router.post('/courses/:courseId/cover/confirm', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  const data = parse(coverConfirmInput, req.body, res); if (!data) return;
  if (storageUnavailable(res)) return;
  const course = await ownCourse(id, req.user.id);
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (!isCourseCoverPath(data.path, id)) return res.status(400).json({ error: 'La ruta de la portada no es válida' });

  let metadata;
  try {
    metadata = await storage.stat(data.path);
  } catch (error) {
    if (error.status === 404) return res.status(400).json({ error: 'No encontramos la portada subida' });
    throw error;
  }
  if (!isAllowedCoverType(metadata.contentType) || !coverTypeMatchesPath(metadata.contentType, data.path)) {
    return res.status(400).json({ error: 'La portada debe ser JPG, PNG o WebP' });
  }
  if (!metadata.size || metadata.size > MAX_COVER_BYTES) {
    return res.status(400).json({ error: 'La portada debe pesar como máximo 2 MB' });
  }
  const head = await storage.readHead(data.path);
  if (!matchesCoverSignature(metadata.contentType, head)) {
    return res.status(400).json({ error: 'El contenido del archivo no es una imagen válida' });
  }

  const { rows } = await query(`UPDATE courses SET cover_image_path = $3, updated_at = now() WHERE id = $1 AND teacher_id = $2 RETURNING ${courseSelect}`, [id, req.user.id, data.path]);
  if (course.coverImagePath && course.coverImagePath !== data.path) await removeCover(course.coverImagePath, id);
  res.json({ course: withCover(rows[0]) });
}));

router.post('/courses/:courseId/enroll', requireUser, requireRole('student'), run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  const { rows } = await query('INSERT INTO enrollments (student_id, course_id) SELECT $1, id FROM courses WHERE id = $2 AND published = true ON CONFLICT (student_id, course_id) DO UPDATE SET student_id = EXCLUDED.student_id RETURNING id, student_id AS "studentId", course_id AS "courseId", created_at AS "createdAt"', [req.user.id, id]);
  return rows[0] ? res.json({ enrollment: rows[0] }) : res.status(404).json({ error: 'Curso no disponible' });
}));

router.get('/courses/:courseId/simulations', requireUser, run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  if (req.user.role === 'teacher') {
    if (!(await ownCourse(id, req.user.id))) return res.status(404).json({ error: 'Curso no encontrado' });
    const { rows } = await query(`SELECT ${simulationSelect} FROM clinical_cases WHERE course_id = $1 ORDER BY created_at DESC`, [id]);
    return res.json({ simulations: rows });
  }
  const { rows } = await query(`SELECT ${qualified(studentSimulationSelect, 's')} FROM clinical_cases s JOIN courses c ON c.id = s.course_id JOIN enrollments e ON e.course_id = c.id AND e.student_id = $2 WHERE s.course_id = $1 AND s.published = true AND c.published = true ORDER BY s.created_at DESC`, [id, req.user.id]);
  res.json({ simulations: rows });
}));

router.post('/courses/:courseId/simulations', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  const data = parse(simulationInput, req.body, res); if (!data) return;
  if (!(await ownCourse(id, req.user.id))) return res.status(404).json({ error: 'Curso no encontrado' });
  const { rows } = await query(`INSERT INTO clinical_cases (course_id, slug, title, subject, difficulty, topic, clinical_situation, academic_challenge, tutor_instructions, rubric_definition, published) VALUES ($1, $2, $3, 'Bioquímica', 'introductorio', $3, $4, $5, $6, '{}'::jsonb, $7) RETURNING ${simulationSelect}`, [id, randomUUID(), data.title, data.scenario, data.objective, data.tutorInstructions, data.published ?? false]);
  res.status(201).json({ simulation: rows[0] });
}));

router.get('/videos', optionalUser, run(async (req, res) => {
  const onlyPublished = req.query.published === 'true' || req.query.published === '1';
  if (!onlyPublished && req.user?.role === 'teacher') {
    const { rows } = await query(`SELECT ${videoSelect} FROM videos WHERE teacher_id = $1 ORDER BY created_at DESC`, [req.user.id]);
    return res.json({ videos: rows });
  }
  const { rows } = await query(`SELECT ${videoSelect} FROM videos WHERE published = true ORDER BY created_at DESC`);
  res.json({ videos: rows });
}));

router.get('/videos/:videoId', optionalUser, run(async (req, res) => {
  const id = parse(idSchema, req.params.videoId, res); if (!id) return;
  if (req.user?.role === 'teacher') {
    const { rows } = await query(`SELECT ${videoSelect} FROM videos WHERE id = $1 AND teacher_id = $2`, [id, req.user.id]);
    if (rows[0]) return res.json({ video: rows[0] });
  }
  const { rows } = await query(`SELECT ${videoSelect} FROM videos WHERE id = $1 AND published = true`, [id]);
  return rows[0] ? res.json({ video: rows[0] }) : res.status(404).json({ error: 'Video no encontrado' });
}));

router.post('/videos', requireUser, requireRole('teacher'), run(async (req, res) => {
  const data = parse(videoInput, req.body, res); if (!data) return;
  const youtubeVideoId = extractYouTubeVideoId(data.youtubeUrl);
  if (!youtubeVideoId) return res.status(400).json({ error: 'Introduce un enlace válido de YouTube.' });
  const { rows } = await query(`INSERT INTO videos (teacher_id, title, description, youtube_url, youtube_video_id, published) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${videoSelect}`, [req.user.id, data.title, data.description, data.youtubeUrl, youtubeVideoId, data.published ?? false]);
  res.status(201).json({ video: rows[0] });
}));

router.patch('/videos/:videoId', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.videoId, res); if (!id) return;
  const data = parse(videoInput.partial().refine((value) => Object.keys(value).length > 0), req.body, res); if (!data) return;
  const youtubeVideoId = data.youtubeUrl ? extractYouTubeVideoId(data.youtubeUrl) : null;
  if (data.youtubeUrl && !youtubeVideoId) return res.status(400).json({ error: 'Introduce un enlace válido de YouTube.' });
  const { rows } = await query(`UPDATE videos SET title = COALESCE($3, title), description = COALESCE($4, description), youtube_url = COALESCE($5, youtube_url), youtube_video_id = COALESCE($6, youtube_video_id), published = COALESCE($7, published), updated_at = now() WHERE id = $1 AND teacher_id = $2 RETURNING ${videoSelect}`, [id, req.user.id, data.title ?? null, data.description ?? null, data.youtubeUrl ?? null, youtubeVideoId, data.published ?? null]);
  return rows[0] ? res.json({ video: rows[0] }) : res.status(404).json({ error: 'Video no encontrado' });
}));

router.delete('/videos/:videoId', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.videoId, res); if (!id) return;
  const { rowCount } = await query('DELETE FROM videos WHERE id = $1 AND teacher_id = $2', [id, req.user.id]);
  if (!rowCount) return res.status(404).json({ error: 'Video no encontrado' });
  res.status(204).end();
}));

router.get('/simulations/:simulationId', requireUser, run(async (req, res) => {
  const id = parse(idSchema, req.params.simulationId, res); if (!id) return;
  const teacher = req.user.role === 'teacher';
  const { rows } = await query(`SELECT ${qualified(teacher ? simulationSelect : studentSimulationSelect, 's')} FROM clinical_cases s JOIN courses c ON c.id = s.course_id ${teacher ? '' : 'JOIN enrollments e ON e.course_id = c.id AND e.student_id = $2'} WHERE s.id = $1 AND ${teacher ? 'c.teacher_id = $2' : 's.published = true AND c.published = true'}`, [id, req.user.id]);
  return rows[0] ? res.json({ simulation: rows[0] }) : res.status(404).json({ error: 'Simulación no encontrada' });
}));

router.patch('/simulations/:simulationId', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.simulationId, res); if (!id) return;
  const data = parse(simulationInput.partial().refine((value) => Object.keys(value).length > 0), req.body, res); if (!data) return;
  const { rows } = await query(`UPDATE clinical_cases s SET title = COALESCE($3, s.title), topic = COALESCE($3, s.topic), clinical_situation = COALESCE($4, s.clinical_situation), academic_challenge = COALESCE($5, s.academic_challenge), tutor_instructions = COALESCE($6, s.tutor_instructions), published = COALESCE($7, s.published), version = s.version + 1, updated_at = now() FROM courses c WHERE s.id = $1 AND c.id = s.course_id AND c.teacher_id = $2 RETURNING ${qualified(simulationSelect, 's')}`, [id, req.user.id, data.title ?? null, data.scenario ?? null, data.objective ?? null, data.tutorInstructions ?? null, data.published ?? null]);
  return rows[0] ? res.json({ simulation: rows[0] }) : res.status(404).json({ error: 'Simulación no encontrada' });
}));

// Las sesiones de una simulación (o de un curso) se referencian desde varias
// tablas. El borrado elimina cada nivel de dependencia en orden y dentro de una
// única transacción, de modo que un fallo intermedio deja todo intacto.
async function removeSimulationHistory(client, sessionCondition, value) {
  await client.query(`DELETE FROM rubric_scores WHERE evaluation_id IN (SELECT e.id FROM evaluations e WHERE e.session_id IN (${sessionCondition}))`, [value]);
  await client.query(`DELETE FROM evaluations WHERE session_id IN (${sessionCondition})`, [value]);
  await client.query(`DELETE FROM recording_metadata WHERE session_id IN (${sessionCondition})`, [value]);
  await client.query(`DELETE FROM supervision_events WHERE session_id IN (${sessionCondition})`, [value]);
  await client.query(`DELETE FROM conversation_messages WHERE session_id IN (${sessionCondition})`, [value]);
}

router.delete('/simulations/:simulationId', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.simulationId, res); if (!id) return;
  const { rows } = await query('SELECT s.id FROM clinical_cases s JOIN courses c ON c.id = s.course_id WHERE s.id = $1 AND c.teacher_id = $2', [id, req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Simulación no encontrada' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await removeSimulationHistory(client, 'SELECT id FROM simulation_sessions WHERE clinical_case_id = $1', id);
    await client.query('DELETE FROM simulation_sessions WHERE clinical_case_id = $1', [id]);
    await client.query('DELETE FROM clinical_cases WHERE id = $1', [id]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
  res.status(204).end();
}));

router.delete('/courses/:courseId', requireUser, requireRole('teacher'), run(async (req, res) => {
  const id = parse(idSchema, req.params.courseId, res); if (!id) return;
  const course = await ownCourse(id, req.user.id);
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await removeSimulationHistory(client, 'SELECT id FROM simulation_sessions WHERE clinical_case_id IN (SELECT id FROM clinical_cases WHERE course_id = $1)', id);
    await client.query('DELETE FROM simulation_sessions WHERE clinical_case_id IN (SELECT id FROM clinical_cases WHERE course_id = $1)', [id]);
    await client.query('DELETE FROM clinical_cases WHERE course_id = $1', [id]);
    await client.query('DELETE FROM enrollments WHERE course_id = $1', [id]);
    await client.query('DELETE FROM courses WHERE id = $1', [id]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
  await removeCover(course.coverImagePath, id);
  res.status(204).end();
}));

  return router;
}
