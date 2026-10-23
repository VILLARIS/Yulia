import 'dotenv/config';
import { z } from 'zod';

const optionalBoolean = z.enum(['true', 'false']).default('false').transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3001),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_SSL: optionalBoolean,
  JWT_SECRET: z.string().min(32).default('development-only-change-this-secret-before-deploying'),
  GEMINI_MODEL: z.string().min(1).default('gemini-3.5-flash-lite'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_STORAGE_BUCKET: z.string().regex(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/).default('course-covers'),
}).superRefine((value, context) => {
  if (Boolean(value.SUPABASE_URL) !== Boolean(value.SUPABASE_SERVICE_ROLE_KEY)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben configurarse juntas',
      path: ['SUPABASE_URL'],
    });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Configuración de entorno inválida: ${parsed.error.message}`);
}

export const env = parsed.data;
