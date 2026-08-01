/**
 * Registry tests.
 * Responsibility: prove the registry starts empty in Phase 0, exposes its catalogue,
 * and answers 404 for an unknown slug.
 */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { buildConfig } from '../src/config/index.js';
import { buildApp } from '../src/core/app.js';
import { InMemoryToolRegistry } from '../src/modules/registry/registry.service.js';
import { FILE_STATE_TRANSITIONS } from '../src/modules/workspace/workspace.types.js';

let app: FastifyInstance;

before(async () => {
  const built = await buildApp({
    config: buildConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent', SWAGGER_ENABLED: 'false' }),
  });
  app = built.app;
});

after(async () => {
  await app.close();
});

test('GET /v1/tools returns an empty catalogue in Phase 0', async () => {
  const response = await app.inject({ method: 'GET', url: '/v1/tools' });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { count: 0, tools: [] });
});

test('GET /v1/tools/:slug returns 404 for an unknown tool', async () => {
  const response = await app.inject({ method: 'GET', url: '/v1/tools/merge' });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().error.code, 'E_NOT_FOUND');
});

test('registry stores, lists and rejects duplicate manifests', () => {
  const registry = new InMemoryToolRegistry();
  const manifest = {
    slug: 'example',
    title: 'Example',
    version: '1.0.0',
    category: 'platform' as const,
    enabled: true,
    acceptedMimes: ['application/pdf'],
    outputMime: 'application/pdf',
    requires: ['platform.noop'],
    routing: { forceAsync: false, syncBudgetMs: 8000, workerClass: 'light' as const },
    limits: { maxFiles: 1, maxInputBytes: 1024, timeoutMs: 5000 },
  };

  registry.register(manifest);
  assert.equal(registry.size(), 1);
  assert.equal(registry.has('example'), true);
  assert.equal(registry.listSummaries()[0]?.slug, 'example');
  assert.throws(() => registry.register(manifest), /already registered/);
  registry.clear();
  assert.equal(registry.size(), 0);
});

test('file lifecycle state machine is terminal at purged', () => {
  assert.deepEqual(FILE_STATE_TRANSITIONS.purged, []);
  assert.ok(FILE_STATE_TRANSITIONS.received.includes('validated'));
  assert.ok(FILE_STATE_TRANSITIONS.available.includes('downloaded'));
});
