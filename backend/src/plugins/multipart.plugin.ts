/**
 * Multipart uploads.
 * Responsibility: accept multipart form data within hard limits.
 * Phase 0 registers the parser only; no route consumes files yet, and files are never
 * written to disk here. Persistence is the workspace layer's job in a later phase.
 */
import multipart from '@fastify/multipart';
import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/index.js';

export async function registerMultipart(app: FastifyInstance, config: AppConfig): Promise<void> {
  await app.register(multipart, {
    limits: {
      fileSize: config.upload.maxFileBytes,
      files: config.upload.maxFiles,
      fields: 20,
      fieldNameSize: 100,
      fieldSize: 1024 * 100,
      headerPairs: 200,
    },
    // Reaching a limit must fail the request loudly rather than truncate a file silently.
    throwFileSizeLimit: true,
  });
}
