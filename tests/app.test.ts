import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../src/app.js';

describe('HTTP application', () => {
  it('reports that the process is alive', async () => {
    const response = await request(app).get('/health/live');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok' });
    expect(response.headers['x-request-id']).toBeTypeOf('string');
  });

  it('exposes versioned API metadata', async () => {
    const response = await request(app).get('/api/v1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { name: 'delivery-api', version: 'v1' } });
  });

  it('returns a consistent error envelope for unknown routes', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      status: 'error',
      message: expect.stringContaining('not found'),
    });
  });

  it('requires authentication for protected user routes', async () => {
    const response = await request(app).get('/api/v1/addresses');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 'error',
      message: 'A Bearer access token is required.',
    });
  });
});
