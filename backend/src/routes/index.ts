/**
 * Route composition.
 * Responsibility: mount every module's routes at the correct prefix.
 * Platform probes live at the root; application routes live under /v1.
 * New modules are added here and nowhere else.
 */
import type { FastifyInstance } from 'fastify';
import { healthRoutes } from '../modules/health/health.routes.js';
import type { HealthService } from '../modules/health/health.service.js';
import { registryRoutes } from '../modules/registry/registry.routes.js';
import { API_V1_PREFIX } from '../shared/constants.js';

export interface RouteOptions {
  healthService: HealthService;
}

export async function registerRoutes(
  app: FastifyInstance,
  options: RouteOptions,
): Promise<void> {
  // Root level, unversioned platform probes.
  await app.register(async (instance) => {
    await healthRoutes(instance, { healthService: options.healthService });
  });

  // Versioned application surface. Phase 0 exposes registry discovery only.
  await app.register(
    async (instance) => {
      await registryRoutes(instance);
    },
    { prefix: API_V1_PREFIX },
  );
}

export { errorEnvelopeSchema } from './schemas.js';
