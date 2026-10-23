import { hashPassword } from '../src/auth.js';
import { query } from '../src/db.js';

export async function createTestTeacher({ name, email, password = 'Password123!' }) {
  const passwordHash = await hashPassword(password);
  const { rows } = await query(
    `INSERT INTO users (display_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'teacher')
     RETURNING id, display_name AS name, email, role, created_at AS "createdAt"`,
    [name, email.toLowerCase(), passwordHash],
  );
  return rows[0];
}
