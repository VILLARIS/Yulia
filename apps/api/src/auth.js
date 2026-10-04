import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { env } from './config/env.js';
import { query } from './db.js';

const scrypt = promisify(scryptCallback);
const cookieName = 'bioquimica_session';
const durationSeconds = 60 * 60 * 24 * 7;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [salt, hex] = String(stored).split(':');
  if (!salt || !hex || hex.length !== 128) return false;
  const candidate = await scrypt(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hex, 'hex'));
}

function signature(payload) {
  return createHmac('sha256', env.JWT_SECRET).update(payload).digest('base64url');
}

export function setSession(response, userId) {
  const payload = Buffer.from(JSON.stringify({ id: userId, exp: Date.now() + durationSeconds * 1000 })).toString('base64url');
  response.cookie(cookieName, `${payload}.${signature(payload)}`, {
    httpOnly: true, sameSite: 'lax', secure: env.NODE_ENV === 'production',
    path: '/api', maxAge: durationSeconds * 1000,
  });
}

export function clearSession(response) {
  response.clearCookie(cookieName, { httpOnly: true, sameSite: 'lax', secure: env.NODE_ENV === 'production', path: '/api' });
}

export async function requireUser(request, response, next) {
  try {
    const raw = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
    const token = raw?.slice(cookieName.length + 1);
    const [payload, mac] = token?.split('.') ?? [];
    if (!payload || !mac) return response.status(401).json({ error: 'Inicia sesión para continuar' });
    const expected = Buffer.from(signature(payload));
    const received = Buffer.from(mac);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      return response.status(401).json({ error: 'Sesión inválida' });
    }
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.id || data.exp <= Date.now()) return response.status(401).json({ error: 'Sesión caducada' });
    const { rows } = await query('SELECT id, display_name AS name, email, role, created_at AS "createdAt" FROM users WHERE id = $1 AND active = true', [data.id]);
    if (!rows[0]) return response.status(401).json({ error: 'Usuario no disponible' });
    request.user = rows[0];
    next();
  } catch (error) { next(error); }
}

export function requireRole(role) {
  return (request, response, next) => request.user.role === role
    ? next()
    : response.status(403).json({ error: 'Acceso no autorizado' });
}
