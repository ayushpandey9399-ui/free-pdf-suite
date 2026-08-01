/**
 * Health endpoint tests.
 * Responsibility: verify the three probes answer with the documented shape, that
 * readiness fails while draining, and that unknown routes return the error envelope.
 */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { buildConfig } from '../src/config/index.js';
import { buildApp } from '../src/core/app.js';
import type { HealthService } from '../src/modules/health/health.service.js';

let app: FastifyInstance;
let healthService: HealthService;

before(async () => {
  const built = await buildApp({
    config: buildConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent', SWAGGER_ENABLED: 'false' }),
  });
  app = built.app;
  healthService = built.healthService;
});

after(async () => {
  await app.close();
});

test('GET /health reports ok with runtime facts', async () => {
  const response = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'freepdfhub-api');
  assert.equal(body.phase, 'phase-0-foundation');
  assert.ok(body.system.node.startsWith('22'), 'runs on Node 22');
  assert.equal(body.dependencies[0].name, 'redis');
  assert.equal(body.dependencies[0].status, 'not_wired');
});

test('GET /live is always alive', async () => {
  const response = await app.inject({ method: 'GET', url: '/live' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().status, 'alive');
});

test('GET /ready is ready, then not ready while draining', async () => {
  const ready = await app.inject({ method: 'GET', url: '/ready' });
  assert.equal(ready.statusCode, 200);
  assert.equal(ready.json().status, 'ready');

  healthService.startDraining();
  const draining = await app.inject({ method: 'GET', url: '/ready' });
  assert.equal(draining.statusCode, 503);
  assert.equal(draining.json().status, 'not_ready');
});

test('unknown routes return the error envelope', async () => {
  const response = await app.inject({ method: 'GET', url: '/does-not-exist' });
  assert.equal(response.statusCode, 404);
  const body = response.json();
  assert.equal(body.error.code, 'E_ROUTE_NOT_FOUND');
  assert.ok(body.error.requestId.length > 0);
});

test('responses carry a correlation id header', async () => {
  const response = await app.inject({ method: 'GET', url: '/live' });
  assert.ok(response.headers['x-request-id']);
  assert.equal(response.headers['x-api-version'], '0.1.0');
});
