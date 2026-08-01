/**
 * PDF to Images job route.
 * Responsibility: run one complete request end to end over HTTP: accept the upload, convert it,
 * package the result, answer with a signed download grant, and destroy the workspace whenever
 * the request does not end in a grant.
 *
 * Architecture Notes
 * This route exists next to the accept only route rather than replacing it, because the two are
 * different contracts: the accept route is the receipt shape a queue backed deployment will keep
 * using, while this one is the synchronous shape the browser needs today. Keeping both means the
 * later move to a worker queue changes which route the frontend calls, not how any module
 * behaves. Cancellation is honoured from the socket: a user who navigates away aborts the
 * process tree through the same AbortSignal the dispatcher already understands, so an abandoned
 * tab cannot leave a rasteriser burning CPU. The failure path always destroys the workspace,
 * because after this handler returns nothing else knows the job existed: only a minted grant
 * hands ownership of those bytes to the download endpoint and its sweeper backstop.
 */
import type { FastifyInstance } from 'fastify';
import { errorEnvelopeSchema } from '../../routes/schemas.js';
import { HttpStatus } from '../../shared/http-status.js';
import type { WorkspaceManager } from '../workspace/workspace.manager.js';
import type { PdfToImagesDispatcher } from './pdf-to-images.dispatcher.js';
import type { PdfToImagesDelivery } from './pdf-to-images.delivery.js';
import { pdfToImagesErrors } from './pdf-to-images.errors.js';
import { PDF_TO_IMAGES_SLUG } from './pdf-to-images.schema.js';
import type { PdfToImagesService } from './pdf-to-images.service.js';
import { adaptMultipartParts } from './pdf-to-images.routes.js';

const readyResponseSchema = {
  type: 'object',
  required: ['success', 'tool', 'status', 'imageCount', 'download'],
  properties: {
    success: { type: 'boolean' },
    tool: { type: 'string' },
    status: { type: 'string' },
    imageCount: { type: 'integer' },
    download: {
      type: 'object',
      required: ['url', 'filename', 'contentType', 'sizeBytes', 'kind', 'expiresAt'],
      properties: {
        url: { type: 'string' },
        filename: { type: 'string' },
        contentType: { type: 'string' },
        sizeBytes: { type: 'integer' },
        kind: { type: 'string' },
        expiresAt: { type: 'string' },
      },
    },
    metrics: {
      type: 'object',
      properties: {
        durationMs: { type: 'integer' },
        pagesConverted: { type: 'integer' },
        dpi: { type: 'integer' },
        format: { type: 'string' },
        outputBytes: { type: 'integer' },
      },
    },
  },
} as const;

export interface PdfToImagesJobRouteOptions {
  readonly service: PdfToImagesService;
  readonly dispatcher: PdfToImagesDispatcher;
  readonly delivery: PdfToImagesDelivery;
  readonly workspaces: WorkspaceManager;
}

export async function pdfToImagesJobRoutes(
  app: FastifyInstance,
  options: PdfToImagesJobRouteOptions,
): Promise<void> {
  app.post(
    `/tools/${PDF_TO_IMAGES_SLUG}/jobs`,
    {
      schema: {
        tags: ['tools'],
        summary: 'Convert a PDF into images and return a download grant',
        description:
          'Validates and stores the upload, rasterises the requested pages, packages more than one image into a ZIP archive, and returns a short lived signed download link.',
        consumes: ['multipart/form-data'],
        response: {
          200: readyResponseSchema,
          400: errorEnvelopeSchema,
          413: errorEnvelopeSchema,
          415: errorEnvelopeSchema,
          500: errorEnvelopeSchema,
          503: errorEnvelopeSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.isMultipart()) throw pdfToImagesErrors.missingFile();

      // A client disconnect must reach the process tree, not just this handler.
      const controller = new AbortController();
      const abort = (): void => controller.abort();
      request.raw.once('aborted', abort);
      request.raw.once('close', () => {
        if (!reply.sent) abort();
      });

      const job = await options.service.accept({
        requestId: request.id,
        parts: adaptMultipartParts(request.parts()),
      });

      try {
        const result = await options.dispatcher.convert({
          requestId: request.id,
          workspaceId: job.workspaceId,
          fileId: job.fileId,
          options: job.options,
          signal: controller.signal,
        });

        const delivered = await options.delivery.publish(result, { requestId: request.id });

        return reply.code(HttpStatus.OK).send({
          success: true,
          tool: PDF_TO_IMAGES_SLUG,
          status: 'ready',
          imageCount: delivered.imageCount,
          download: {
            url: delivered.ticket.url,
            filename: delivered.ticket.filename,
            contentType: delivered.ticket.contentType,
            sizeBytes: delivered.ticket.sizeBytes,
            kind: delivered.ticket.kind,
            expiresAt: new Date(delivered.ticket.expiresAtMs).toISOString(),
          },
          metrics: {
            durationMs: result.metrics.durationMs,
            pagesConverted: result.metrics.pagesConverted,
            dpi: result.metrics.dpi,
            format: result.metrics.format,
            outputBytes: result.metrics.outputBytes,
          },
        });
      } catch (error) {
        // Nothing owns these bytes once the response is an error, so they go now.
        await options.workspaces.destroy(job.workspaceId).catch(() => undefined);
        throw error;
      }
    },
  );
}
