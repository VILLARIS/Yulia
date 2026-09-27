import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../src/app.js';

test('GET /api/health responde con el estado de la Fase 1', async () => {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.phase, 1);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

