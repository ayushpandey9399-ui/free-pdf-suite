/**
 * Health routes.
 * Responsibility: expose GET /health, GET /ready and GET /live at the service root.
 * These paths are mounted outside the versioned prefix because orchestrators and load
 * balancers must not depend on API versioning.
 */
import type { FastifyInstance } from 'fastify';
import { HttpStatus } from '../../shared/http-status.js';
import {
  healthResponseSchema,
  livenessResponseSchema,
  readinessResponseSchema,
} from './health.schema.js';
import type { HealthService } from './health.service.js';

export interface HealthRoutesOptions {
  healthService: HealthService;
}

export async function healthRoutes(
  app: FastifyInstance,
  options: HealthRoutesOptions,
): Promise<void> {
  const { healthService } = options;

  app.get(
    '/health',
    {
      schema: {
        tags: ['platform'],
        summary: 'Full health report',
        description: 'Runtime facts plus dependency status. Intended for humans and dashboards.',
        response: { 200: healthResponseSchema, 503: healthResponseSchema },
      },
    },
    async (_request, reply) => {
      const report = await healthService.health();
      const status =
        report.status === 'error' ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;
      return reply.status(status).send(report);
    },
  );

  app.get(
    '/ready',
    {
      schema: {
        tags: ['platform'],
        summary: 'Readiness probe',
        description:
          'Returns 503 while the instance is starting up, draining, or missing a required dependency.',
        response: { 200: readinessResponseSchema, 503: readinessResponseSchema },
      },
    },
    async (_request, reply) => {
      const report = await healthService.readiness();
      const status =
        report.status === 'ready' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
      return reply.status(status).send(report);
    },
  );

  app.get(
    '/live',
    {
      schema: {
        tags: ['platform'],
        summary: 'Liveness probe',
        description: 'Confirms the event loop is responsive. Never checks dependencies.',
        response: { 200: livenessResponseSchema },
      },
    },
    async () => healthService.liveness(),
  );
}
