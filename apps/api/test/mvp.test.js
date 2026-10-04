import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { createApp } from '../src/app.js';
import { query } from '../src/db.js';

test('flujo persistente docente → estudiante y permisos', { skip: !process.env.DATABASE_URL }, async () => {
  const marker = randomUUID();
  const created = { users: [], course: null, simulation: null };
  let server;
  let base;
  const start = async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}/api`;
  };
  const stop = async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  const call = async (path, method = 'GET', body, cookie) => {
    const response = await fetch(`${base}${path}`, { method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = response.status === 204 ? null : await response.json();
    return { status: response.status, data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
  };
  await start();
  try {
    const password = 'Password123!';
    const teacher = await call('/auth/register', 'POST', { name: 'Docente MVP', email: `teacher-${marker}@example.test`, password, role: 'teacher' });
    assert.equal(teacher.status, 201);
    created.users.push(teacher.data.user.id);
    const teacherCookie = teacher.cookie;
    assert.equal((await call('/auth/me', 'GET', null, teacherCookie)).data.user.role, 'teacher');
    const hash = await query('SELECT password_hash FROM users WHERE id = $1', [teacher.data.user.id]);
    assert.notEqual(hash.rows[0].password_hash, password);

    const course = await call('/courses', 'POST', { title: 'Curso de prueba MVP', description: 'Curso persistente', published: true }, teacherCookie);
    assert.equal(course.status, 201);
    created.course = course.data.course.id;
    const simulation = await call(`/courses/${created.course}/simulations`, 'POST', { title: 'Simulación de prueba', scenario: 'Escenario de diez caracteres o más.', objective: 'Razonar el caso', tutorInstructions: 'Guiar mediante preguntas.', published: false }, teacherCookie);
    assert.equal(simulation.status, 201);
    created.simulation = simulation.data.simulation.id;
    const publication = await call(`/simulations/${created.simulation}`, 'PATCH', { published: true }, teacherCookie);
    assert.equal(publication.status, 200);
    assert.equal(publication.data.simulation.published, true);

    const other = await call('/auth/register', 'POST', { name: 'Otra docente', email: `other-${marker}@example.test`, password, role: 'teacher' });
    created.users.push(other.data.user.id);
    assert.equal((await call(`/courses/${created.course}`, 'PATCH', { title: 'Intrusión' }, other.cookie)).status, 404);
    assert.equal((await call(`/simulations/${created.simulation}`, 'PATCH', { title: 'Intrusión' }, other.cookie)).status, 404);

    const student = await call('/auth/register', 'POST', { name: 'Estudiante MVP', email: `student-${marker}@example.test`, password, role: 'student' });
    assert.equal(student.status, 201);
    created.users.push(student.data.user.id);
    assert.equal((await call('/courses', 'GET', null, student.cookie)).data.courses.some((item) => item.id === created.course), true);
    assert.equal((await call(`/simulations/${created.simulation}`, 'GET', null, student.cookie)).status, 404);
    assert.equal((await call(`/courses/${created.course}/enroll`, 'POST', null, student.cookie)).status, 200);
    const list = await call(`/courses/${created.course}/simulations`, 'GET', null, student.cookie);
    assert.equal(list.data.simulations.length, 1);
    assert.equal(list.data.simulations[0].title, 'Simulación de prueba');
    const detail = await call(`/simulations/${created.simulation}`, 'GET', null, student.cookie);
    assert.equal(detail.status, 200);
    assert.equal(detail.data.simulation.scenario, 'Escenario de diez caracteres o más.');
    assert.equal(detail.data.simulation.tutorInstructions, undefined);
    assert.equal((await call('/courses', 'POST', { title: 'Prohibido', description: '' }, student.cookie)).status, 403);

    await stop();
    await start();
    const loggedTeacher = await call('/auth/login', 'POST', { email: `teacher-${marker}@example.test`, password });
    assert.equal(loggedTeacher.status, 200);
    const persisted = await call(`/courses/${created.course}/simulations`, 'GET', null, loggedTeacher.cookie);
    assert.equal(persisted.data.simulations[0].id, created.simulation);
    assert.equal(persisted.data.simulations[0].published, true);
    const loggedStudent = await call('/auth/login', 'POST', { email: `student-${marker}@example.test`, password });
    assert.equal((await call(`/courses/${created.course}/simulations`, 'GET', null, loggedStudent.cookie)).data.simulations.length, 1);
  } finally {
    await stop();
    if (created.course) await query('DELETE FROM enrollments WHERE course_id = $1', [created.course]);
    if (created.simulation) await query('DELETE FROM clinical_cases WHERE id = $1', [created.simulation]);
    if (created.course) await query('DELETE FROM courses WHERE id = $1', [created.course]);
    for (const id of created.users) await query('DELETE FROM users WHERE id = $1', [id]);
  }
});
