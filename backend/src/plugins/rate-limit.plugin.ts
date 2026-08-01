/**
 * Rate limiting.
 * Responsibility: apply a per client request budget at the edge of the application.
 * Phase 0 uses the in process store; a Redis store is swapped in when the queue phase
 * introduces a shared Redis client, without changing any route.
 */
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/index.js';
import { ErrorCode } from '../core/errors.js';

export async function registerRateLimit(app: FastifyInstance, config: AppConfig): Promise<void> {
  await app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.windowMs,
    // Liveness and readiness probes must never be throttled.
    allowList: (request) => ['/live', '/ready'].includes(request.url),
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: (request, context) => ({
      error: {
        code: ErrorCode.E_RATE_LIMITED,
        message: `Too many requests. Try again in ${context.after}.`,
        requestId: String(request.id),
      },
    }),
  });
}
