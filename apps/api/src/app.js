import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'bioquimica-nutricional-api', phase: 1 });
  });

  app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'Recurso no encontrado' });
  });
  return app;
}

