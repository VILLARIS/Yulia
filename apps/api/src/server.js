import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db.js';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL es necesaria para iniciar la API');
if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'development-only-change-this-secret-before-deploying') {
  throw new Error('Configura JWT_SECRET antes de iniciar en producción');
}
await pool.query('SELECT 1');
createApp().listen(env.API_PORT, () => {
  console.log(`API disponible en http://localhost:${env.API_PORT}`);
});
