/**
 * Logger factory.
 * Responsibility: build the Pino instance used by Fastify and by background code.
 * Pretty, human readable output in development; single line JSON in production so
 * log shippers can parse it. Sensitive header paths are redacted in both modes.
 */
import { pino, type Logger, type LoggerOptions } from 'pino';
import type { AppConfig } from '../config/index.js';
import { REDACTED_LOG_PATHS, SERVICE_NAME } from '../shared/constants.js';

/** Build Pino options from application config. Exported for reuse by workers later. */
export function buildLoggerOptions(config: AppConfig): LoggerOptions {
  const options: LoggerOptions = {
    level: config.logging.level,
    base: {
      service: SERVICE_NAME,
      env: config.env,
      pid: process.pid,
    },
    redact: { paths: [...REDACTED_LOG_PATHS], censor: '[redacted]' },
    // ISO timestamps keep production logs sortable in any aggregator.
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    // Only request metadata is logged, never bodies or file names.
    serializers: {
      req: (request: { id: string; method: string; url: string }) => ({
        id: request.id,
        method: request.method,
        url: request.url,
      }),
      res: (reply: { statusCode: number }) => ({ statusCode: reply.statusCode }),
    },
  };

  if (config.logging.pretty) {
    options.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        ignore: 'pid,service,env',
        singleLine: false,
      },
    };
  }

  return options;
}

/** Create a root logger instance. */
export function createLogger(config: AppConfig): Logger {
  return pino(buildLoggerOptions(config));
}

export type { Logger };
