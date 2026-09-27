import 'dotenv/config';
import { z } from 'zod';

const optionalBoolean = z.enum(['true', 'false']).default('false').transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3001),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_SSL: optionalBoolean,
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  RECORDINGS_ENABLED: optionalBoolean,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Configuración de entorno inválida: ${parsed.error.message}`);
}

export const env = parsed.data;

