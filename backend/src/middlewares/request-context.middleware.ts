/**
 * Request context middleware.
 * Responsibility: give every request a correlation id, expose it on the response,
 * stamp the API version header, and emit one completion log line with duration.
 */
import type { FastifyInstance } from 'fastify';
import { API_VERSION_HEADER, REQUEST_ID_HEADER } from '../shared/constants.js';
import { elapsedMs, startMark } from '../utils/time.js';

export function registerRequestContext(app: FastifyInstance, apiVersion: string): void {
  app.addHook('onRequest', async (request, reply) => {
    request.startedAt = startMark();
    reply.header(REQUEST_ID_HEADER, request.id);
    reply.header(API_VERSION_HEADER, apiVersion);
  });

  app.addHook('onResponse', async (request, reply) => {
    const durationMs = request.startedAt === undefined ? 0 : elapsedMs(request.startedAt);
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      },
      'request completed',
    );
  });
}
