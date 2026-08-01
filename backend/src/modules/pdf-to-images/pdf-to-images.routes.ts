/**
 * PDF to Images routes.
 * Responsibility: adapt the HTTP multipart request onto the service contract, answer with
 * the documented 202 receipt, and expose nothing about the file system.
 */
import type { FastifyInstance } from 'fastify';
import type { MultipartValue } from '@fastify/multipart';
import { errorEnvelopeSchema } from '../../routes/schemas.js';
import { pdfToImagesErrors } from './pdf-to-images.errors.js';
import { PDF_TO_IMAGES_SLUG } from './pdf-to-images.schema.js';
import type { PdfToImagesService } from './pdf-to-images.service.js';
import type { IncomingPart } from './pdf-to-images.types.js';
import { HttpStatus } from '../../shared/http-status.js';

const acceptedResponseSchema = {
  type: 'object',
  required: ['success', 'tool', 'workspaceId', 'status', 'nextStep'],
  properties: {
    success: { type: 'boolean' },
    tool: { type: 'string' },
    workspaceId: { type: 'string' },
    status: { type: 'string' },
    nextStep: { type: 'string' },
  },
} as const;

export interface PdfToImagesRouteOptions {
  readonly service: PdfToImagesService;
}

export async function pdfToImagesRoutes(
  app: FastifyInstance,
  options: PdfToImagesRouteOptions,
): Promise<void> {
  app.post(
    `/tools/${PDF_TO_IMAGES_SLUG}`,
    {
      schema: {
        tags: ['tools'],
        summary: 'Accept a PDF for image conversion',
        description:
          'Validates the upload and its options, stores the document in an isolated workspace and returns a receipt. Conversion is performed in a later step.',
        consumes: ['multipart/form-data'],
        response: {
          202: acceptedResponseSchema,
          400: errorEnvelopeSchema,
          413: errorEnvelopeSchema,
          415: errorEnvelopeSchema,
          503: errorEnvelopeSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.isMultipart()) throw pdfToImagesErrors.missingFile();

      const job = await options.service.accept({
        requestId: request.id,
        parts: adaptMultipartParts(request.parts()),
      });

      return reply.code(HttpStatus.ACCEPTED).send({
        success: true,
        tool: PDF_TO_IMAGES_SLUG,
        workspaceId: job.workspaceId,
        status: 'accepted',
        nextStep: 'processing',
      });
    },
  );
}

/**
 * Normalise Fastify multipart parts onto the transport free shape the service consumes.
 * Exported so every route of this tool adapts a multipart body in exactly one way.
 */
export async function* adaptMultipartParts(
  parts: AsyncIterableIterator<unknown>,
): AsyncGenerator<IncomingPart> {
  for await (const raw of parts) {
    const part = raw as {
      type: 'file' | 'field';
      fieldname: string;
      filename?: string;
      mimetype?: string;
      file?: AsyncIterable<Uint8Array>;
      value?: MultipartValue['value'];
    };
    if (part.type === 'file' && part.file !== undefined) {
      yield {
        kind: 'file',
        fieldName: part.fieldname,
        declaredName: part.filename ?? 'document.pdf',
        declaredContentType: part.mimetype ?? 'application/octet-stream',
        stream: part.file,
      };
      continue;
    }
    yield {
      kind: 'field',
      name: part.fieldname,
      value: typeof part.value === 'string' ? part.value : String(part.value ?? ''),
    };
  }
}
