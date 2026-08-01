/**
 * Download routes.
 * Responsibility: adapt one signed grant onto an HTTP response: correct content type, download
 * disposition, exact length, a streamed body, and workspace cleanup once the response ends.
 *
 * Architecture Notes
 * The handler is deliberately thin because every rule it would otherwise own already belongs to
 * the token (what may be downloaded) or to the service (whether the bytes still exist). What
 * only HTTP can decide lives here: the body is streamed rather than buffered so a large archive
 * costs one pipe instead of one heap allocation, caching is forbidden so a shared proxy cannot
 * retain a private document, and cleanup is attached to the response lifecycle rather than
 * awaited inline so a client that disconnects mid transfer still frees its workspace.
 */
import type { FastifyInstance } from 'fastify';
import { errorEnvelopeSchema } from '../../routes/schemas.js';
import { HttpStatus } from '../../shared/http-status.js';
import { DOWNLOAD_ROUTE_SEGMENT, type DownloadService } from './download.service.js';

export interface DownloadRouteOptions {
  readonly service: DownloadService;
}

export async function downloadRoutes(
  app: FastifyInstance,
  options: DownloadRouteOptions,
): Promise<void> {
  app.get<{ Params: { token: string } }>(
    `/${DOWNLOAD_ROUTE_SEGMENT}/:token`,
    {
      schema: {
        tags: ['downloads'],
        summary: 'Download a finished artefact with a signed link',
        description:
          'Streams the file or archive a signed download token points at. The link expires, and the workspace behind it is deleted once the transfer ends.',
        params: {
          type: 'object',
          required: ['token'],
          properties: { token: { type: 'string', minLength: 8, maxLength: 1024 } },
        },
        response: {
          400: errorEnvelopeSchema,
          410: errorEnvelopeSchema,
          500: errorEnvelopeSchema,
        },
      },
    },
    async (request, reply) => {
      const opened = await options.service.open(request.params.token);
      const { claims } = opened;

      // Cleanup follows the response, not the handler, so a disconnect frees the workspace too.
      let released = false;
      const release = (reason: string): void => {
        if (released) return;
        released = true;
        void options.service.release(claims, reason);
      };
      reply.raw.once('close', () => release('response closed'));

      request.log.info(
        {
          tool: claims.toolSlug,
          workspaceId: claims.workspaceId,
          kind: claims.kind,
          sizeBytes: opened.sizeBytes,
        },
        'download started',
      );

      return reply
        .code(HttpStatus.OK)
        .header('content-type', claims.contentType)
        .header('content-length', String(opened.sizeBytes))
        .header('content-disposition', `attachment; filename="${claims.filename}"`)
        .header('cache-control', 'no-store, private')
        .header('x-content-type-options', 'nosniff')
        .send(opened.stream);
    },
  );
}
