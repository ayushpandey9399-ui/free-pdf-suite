/**
 * OpenAPI documentation.
 * Responsibility: expose a generated OpenAPI document and the explorer UI.
 * Route schemas declared by modules feed this automatically, so the docs cannot drift.
 */
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/index.js';
import { DOCS_PREFIX } from '../shared/constants.js';

export async function registerSwagger(
  app: FastifyInstance,
  config: AppConfig,
  version: string,
): Promise<void> {
  if (!config.docs.enabled) return;

  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'FreePDFHub Enterprise API',
        description:
          'Platform API for FreePDFHub. Phase 0 exposes platform endpoints only: health, tool registry and workspace contracts.',
        version,
      },
      tags: [
        { name: 'platform', description: 'Health, readiness and liveness probes' },
        { name: 'registry', description: 'Tool registry discovery' },
      ],
      components: {
        schemas: {
          ErrorEnvelope: {
            type: 'object',
            required: ['error'],
            properties: {
              error: {
                type: 'object',
                required: ['code', 'message', 'requestId'],
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  requestId: { type: 'string' },
                  details: {},
                },
              },
            },
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: DOCS_PREFIX,
    uiConfig: { docExpansion: 'list', deepLinking: true },
    staticCSP: true,
  });
}
