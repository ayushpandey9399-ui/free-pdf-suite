/**
 * Application configuration.
 * Responsibility: turn the validated environment into a structured, immutable
 * config object grouped by concern, and expose it as a lazily built singleton.
 */
import { parseEnv, type RawEnv } from './env.js';

export interface AppConfig {
  readonly env: RawEnv['NODE_ENV'];
  readonly isProduction: boolean;
  readonly isDevelopment: boolean;
  readonly isTest: boolean;

  readonly server: {
    readonly host: string;
    readonly port: number;
    readonly bodyLimitBytes: number;
    readonly requestTimeoutMs: number;
    readonly shutdownTimeoutMs: number;
  };

  readonly logging: {
    readonly level: RawEnv['LOG_LEVEL'];
    readonly pretty: boolean;
  };

  readonly upload: {
    readonly maxFileBytes: number;
    readonly maxFiles: number;
  };

  readonly cors: {
    /** true means allow any origin, otherwise an explicit allowlist. */
    readonly origins: string[] | true;
  };

  readonly rateLimit: {
    readonly max: number;
    readonly windowMs: number;
  };

  readonly workspace: {
    readonly root: string;
    readonly uploadTtlMs: number;
    readonly outputTtlMs: number;
  };

  readonly download: {
    /** Empty means the signer generates a per process key. */
    readonly tokenSecret: string;
    readonly ttlMs: number;
  };

  /** Provisioned for later phases (queue, cache). Phase 0 opens no connection. */
  readonly redis: {
    readonly url: string;
  };

  readonly docs: {
    readonly enabled: boolean;
  };
}

/** Split a comma separated origin list, or return true for a wildcard. */
function parseOrigins(value: string): string[] | true {
  const trimmed = value.trim();
  if (trimmed === '*' || trimmed === '') return true;
  return trimmed
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

/** Build a config object from an environment record. Pure, so tests can call it directly. */
export function buildConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const env = parseEnv(source);
  const isProduction = env.NODE_ENV === 'production';
  const isDevelopment = env.NODE_ENV === 'development';

  return Object.freeze({
    env: env.NODE_ENV,
    isProduction,
    isDevelopment,
    isTest: env.NODE_ENV === 'test',

    server: Object.freeze({
      host: env.HOST,
      port: env.PORT,
      bodyLimitBytes: env.BODY_LIMIT_BYTES,
      requestTimeoutMs: env.REQUEST_TIMEOUT_MS,
      shutdownTimeoutMs: env.SHUTDOWN_TIMEOUT_MS,
    }),

    logging: Object.freeze({
      level: env.LOG_LEVEL,
      // Explicit flag wins, otherwise pretty logs only in development.
      pretty: env.LOG_PRETTY ?? isDevelopment,
    }),

    upload: Object.freeze({
      maxFileBytes: env.MAX_UPLOAD_BYTES,
      maxFiles: env.MAX_UPLOAD_FILES,
    }),

    cors: Object.freeze({
      origins: parseOrigins(env.CORS_ORIGINS),
    }),

    rateLimit: Object.freeze({
      max: env.RATE_LIMIT_MAX,
      windowMs: env.RATE_LIMIT_WINDOW_MS,
    }),

    workspace: Object.freeze({
      root: env.WORKSPACE_ROOT,
      uploadTtlMs: env.WORKSPACE_UPLOAD_TTL_MS,
      outputTtlMs: env.WORKSPACE_OUTPUT_TTL_MS,
    }),

    download: Object.freeze({
      tokenSecret: env.DOWNLOAD_TOKEN_SECRET,
      ttlMs: env.DOWNLOAD_TTL_MS,
    }),

    redis: Object.freeze({ url: env.REDIS_URL }),

    docs: Object.freeze({ enabled: env.SWAGGER_ENABLED }),
  });
}

let cached: AppConfig | undefined;

/** Process wide configuration singleton, built on first access. */
export function getConfig(): AppConfig {
  cached ??= buildConfig();
  return cached;
}

/** Reset the singleton. Test only, keeps config construction verifiable. */
export function resetConfig(): void {
  cached = undefined;
}

export { parseEnv, ConfigValidationError } from './env.js';
export { configDefaults } from './defaults.js';
export type { RawEnv } from './env.js';
