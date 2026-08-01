/**
 * Default configuration values.
 * Responsibility: define the safe baseline the environment loader falls back to,
 * so the service boots with sane limits even when nothing is exported.
 */
import { mibToBytes } from '../utils/bytes.js';

export const configDefaults = {
  NODE_ENV: 'development',
  HOST: '0.0.0.0',
  PORT: 8080,

  LOG_LEVEL: 'info',

  /** Fastify body ceiling, slightly above the upload ceiling to allow envelope overhead. */
  BODY_LIMIT_BYTES: mibToBytes(26),
  /** Largest single uploaded file accepted by the multipart plugin. */
  MAX_UPLOAD_BYTES: mibToBytes(25),
  MAX_UPLOAD_FILES: 20,
  REQUEST_TIMEOUT_MS: 30_000,

  CORS_ORIGINS: '*',

  RATE_LIMIT_MAX: 120,
  RATE_LIMIT_WINDOW_MS: 60_000,

  WORKSPACE_ROOT: '/var/lib/freepdfhub',
  WORKSPACE_UPLOAD_TTL_MS: 15 * 60_000,
  WORKSPACE_OUTPUT_TTL_MS: 60 * 60_000,

  REDIS_URL: 'redis://127.0.0.1:6379',

  SWAGGER_ENABLED: true,
  SHUTDOWN_TIMEOUT_MS: 10_000,
} as const;
