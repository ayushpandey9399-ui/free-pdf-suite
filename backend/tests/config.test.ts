/**
 * Configuration tests.
 * Responsibility: prove the environment loader validates, coerces and defaults correctly,
 * and that impossible limit combinations fail fast at boot rather than at runtime.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildConfig, ConfigValidationError, parseEnv } from '../src/config/index.js';

test('applies defaults for an empty environment', () => {
  const config = buildConfig({});
  assert.equal(config.env, 'development');
  assert.equal(config.server.port, 8080);
  assert.equal(config.logging.pretty, true, 'development defaults to pretty logs');
  assert.equal(config.cors.origins, true, 'wildcard origins by default');
});

test('production defaults to JSON logs', () => {
  const config = buildConfig({ NODE_ENV: 'production' });
  assert.equal(config.isProduction, true);
  assert.equal(config.logging.pretty, false);
});

test('coerces numbers and booleans from strings', () => {
  const config = buildConfig({ PORT: '9001', SWAGGER_ENABLED: 'false', LOG_PRETTY: '1' });
  assert.equal(config.server.port, 9001);
  assert.equal(config.docs.enabled, false);
  assert.equal(config.logging.pretty, true);
});

test('parses a comma separated CORS allowlist', () => {
  const config = buildConfig({ CORS_ORIGINS: 'https://a.test, https://b.test' });
  assert.deepEqual(config.cors.origins, ['https://a.test', 'https://b.test']);
});

test('rejects an invalid port', () => {
  assert.throws(() => parseEnv({ PORT: 'not-a-port' }), ConfigValidationError);
});

test('rejects an upload limit larger than the body limit', () => {
  assert.throws(
    () => parseEnv({ MAX_UPLOAD_BYTES: '100', BODY_LIMIT_BYTES: '50' }),
    ConfigValidationError,
  );
});
