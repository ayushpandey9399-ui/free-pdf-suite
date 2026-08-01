/**
 * Registry routes.
 * Responsibility: expose the tool catalogue for discovery. Returns an empty collection
 * in Phase 0 because no tool is registered yet, which is a valid, documented state.
 */
import type { FastifyInstance } from 'fastify';
import { errors } from '../../core/errors.js';
import { errorEnvelopeSchema } from '../../routes/schemas.js';
import { toolRegistry } from './registry.service.js';

const toolSummarySchema = {
  type: 'object',
  required: ['slug', 'title', 'version', 'category', 'enabled', 'acceptedMimes', 'outputMime'],
  properties: {
    slug: { type: 'string' },
    title: { type: 'string' },
    version: { type: 'string' },
    category: { type: 'string' },
    enabled: { type: 'boolean' },
    acceptedMimes: { type: 'array', items: { type: 'string' } },
    outputMime: { type: 'string' },
  },
} as const;

export async function registryRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/tools',
    {
      schema: {
        tags: ['registry'],
        summary: 'List registered tools',
        description:
          'Returns every tool currently registered. Phase 0 returns an empty list, no tools are implemented.',
        response: {
          200: {
            type: 'object',
            required: ['count', 'tools'],
            properties: {
              count: { type: 'integer' },
              tools: { type: 'array', items: toolSummarySchema },
            },
          },
        },
      },
    },
    async () => ({ count: toolRegistry.size(), tools: toolRegistry.listSummaries() }),
  );

  app.get(
    '/tools/:slug',
    {
      schema: {
        tags: ['registry'],
        summary: 'Get one tool manifest summary',
        params: {
          type: 'object',
          required: ['slug'],
          properties: { slug: { type: 'string', minLength: 1, maxLength: 64 } },
        },
        response: {
          200: toolSummarySchema,
          404: errorEnvelopeSchema,
        },
      },
    },
    async (request) => {
      const { slug } = request.params as { slug: string };
      const summary = toolRegistry.listSummaries().find((tool) => tool.slug === slug);
      if (!summary) throw errors.notFound(`Tool "${slug}" is not registered`);
      return summary;
    },
  );

  app.log.debug({ registeredTools: toolRegistry.size() }, 'registry routes ready');
}
