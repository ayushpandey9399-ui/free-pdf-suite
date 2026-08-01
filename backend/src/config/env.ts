/**
 * Environment loader and validator.
 * Responsibility: read process.env once, coerce every value to its real type,
 * validate it with Zod and fail fast with a readable report when something is wrong.
 * No other file is allowed to read process.env directly.
 */
import { z } from 'zod';
import { configDefaults } from './defaults.js';

/** Coerce common truthy strings into a boolean. */
const booleanish = z
  .union([z.boolean(), z.string()])
  .transform((value) =>
    typeof value === 'boolean' ? value : ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase()),
  );

/** Positive integer from an environment string. */
const positiveInt = z.coerce.number().int().positive();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default(configDefaults.NODE_ENV),
  HOST: z.string().min(1).default(configDefaults.HOST),
  PORT: positiveInt.max(65_535).default(configDefaults.PORT),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default(configDefaults.LOG_LEVEL),
  /** When unset, pretty printing follows NODE_ENV (pretty in development only). */
  LOG_PRETTY: booleanish.optional(),

  BODY_LIMIT_BYTES: positiveInt.default(configDefaults.BODY_LIMIT_BYTES),
  MAX_UPLOAD_BYTES: positiveInt.default(configDefaults.MAX_UPLOAD_BYTES),
  MAX_UPLOAD_FILES: positiveInt.default(configDefaults.MAX_UPLOAD_FILES),
  REQUEST_TIMEOUT_MS: positiveInt.default(configDefaults.REQUEST_TIMEOUT_MS),

  CORS_ORIGINS: z.string().default(configDefaults.CORS_ORIGINS),

  RATE_LIMIT_MAX: positiveInt.default(configDefaults.RATE_LIMIT_MAX),
  RATE_LIMIT_WINDOW_MS: positiveInt.default(configDefaults.RATE_LIMIT_WINDOW_MS),

  WORKSPACE_ROOT: z.string().min(1).default(configDefaults.WORKSPACE_ROOT),
  WORKSPACE_UPLOAD_TTL_MS: positiveInt.default(configDefaults.WORKSPACE_UPLOAD_TTL_MS),
  WORKSPACE_OUTPUT_TTL_MS: positiveInt.default(configDefaults.WORKSPACE_OUTPUT_TTL_MS),

  /** Redis is provisioned in Phase 0 for later phases, nothing connects to it yet. */
  REDIS_URL: z.string().min(1).default(configDefaults.REDIS_URL),

  SWAGGER_ENABLED: booleanish.default(configDefaults.SWAGGER_ENABLED),
  SHUTDOWN_TIMEOUT_MS: positiveInt.default(configDefaults.SHUTDOWN_TIMEOUT_MS),
});

export type RawEnv = z.infer<typeof envSchema>;

/** Thrown when the environment cannot produce a valid configuration. */
export class ConfigValidationError extends Error {
  public readonly issues: string[];

  constructor(issues: string[]) {
    super(`Invalid environment configuration:\n  - ${issues.join('\n  - ')}`);
    this.name = 'ConfigValidationError';
    this.issues = issues;
  }
}

/**
 * Parse and validate an environment record.
 * Kept pure (source is an argument) so tests can validate arbitrary inputs.
 */
export function parseEnv(source: NodeJS.ProcessEnv = process.env): RawEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
    );
    throw new ConfigValidationError(issues);
  }

  if (result.data.MAX_UPLOAD_BYTES > result.data.BODY_LIMIT_BYTES) {
    throw new ConfigValidationError([
      'MAX_UPLOAD_BYTES must be less than or equal to BODY_LIMIT_BYTES',
    ]);
  }

  return result.data;
}
