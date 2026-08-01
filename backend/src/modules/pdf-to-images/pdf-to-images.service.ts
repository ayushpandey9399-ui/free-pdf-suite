/**
 * PDF to Images service.
 * Responsibility: turn one inbound multipart request into an accepted job: create the
 * workspace, stream the file through the Upload Manager, resolve the tool from the registry,
 * validate the options, and destroy everything again if any step fails.
 *
 * Architecture Notes
 * This class exists so the HTTP route stays a thin adapter and the acceptance rules of the
 * first production tool live in one testable place. It deliberately does no conversion: the
 * accept step and the process step have different failure modes, different time budgets and,
 * in a later phase, different processes, so they are separated from the very first tool
 * rather than untangled afterwards. Cleanup is the invariant that matters most here: a
 * request that fails anywhere after workspace creation must leave no bytes on disk, because
 * retention is a privacy promise and an abandoned upload silently breaks it.
 */
import { PassThrough } from 'node:stream';
import { open } from 'node:fs/promises';
import { AppError, isAppError } from '../../core/errors.js';
import { UploadManager } from '../upload/upload.manager.js';
import { UploadValidator } from '../upload/upload.validator.js';
import type { AcceptedUpload, UploadDestination } from '../upload/upload.types.js';
import type { ToolManifest, ToolRegistry } from '../registry/registry.types.js';
import type { WorkspaceManager } from '../workspace/workspace.manager.js';
import type { WorkspaceFile } from '../workspace/workspace.types.js';
import { pdfToImagesErrors } from './pdf-to-images.errors.js';
import { PDF_TO_IMAGES_SLUG, parsePdfToImagesFields } from './pdf-to-images.schema.js';
import type { AcceptRequestInput, AcceptedJob, IncomingPart } from './pdf-to-images.types.js';

/** Bytes of the trailer window scanned for an encryption dictionary. */
const ENCRYPTION_PROBE_BYTES = 64 * 1024;

/**
 * Minimal logging surface.
 * Structural on purpose so both the Fastify request logger and a test spy satisfy it.
 */
export interface PdfToImagesLogger {
  info(obj: object, msg?: string): void;
  warn(obj: object, msg?: string): void;
}

export interface PdfToImagesServiceOptions {
  readonly registry: ToolRegistry;
  readonly workspaces: WorkspaceManager;
  /** Workspace TTL applied to the upload of this tool. */
  readonly ttlMs: number;
  readonly logger?: PdfToImagesLogger;
}

export class PdfToImagesService {
  private readonly registry: ToolRegistry;
  private readonly workspaces: WorkspaceManager;
  private readonly ttlMs: number;
  private readonly logger?: PdfToImagesLogger;

  constructor(options: PdfToImagesServiceOptions) {
    this.registry = options.registry;
    this.workspaces = options.workspaces;
    this.ttlMs = options.ttlMs;
    this.logger = options.logger;
  }

  /** Manifest of this tool, resolved from the registry and never hardcoded at call sites. */
  public manifest(): ToolManifest {
    const manifest = this.registry.get(PDF_TO_IMAGES_SLUG);
    if (manifest === undefined) throw pdfToImagesErrors.toolNotRegistered();
    if (!manifest.enabled) throw pdfToImagesErrors.toolDisabled();
    return manifest;
  }

  /**
   * Accept one request.
   * Field order in a multipart body is client controlled, so the file is streamed as it
   * arrives and the option fields are validated once every part has been consumed.
   */
  public async accept(input: AcceptRequestInput): Promise<AcceptedJob> {
    const manifest = this.manifest();

    const workspace = await this.createWorkspace(input.requestId);
    const fields: Record<string, string> = {};
    let upload: AcceptedUpload | undefined;
    let file: WorkspaceFile | undefined;

    try {
      const validator = new UploadValidator({
        maxFileBytes: manifest.limits.maxInputBytes,
        maxFiles: manifest.limits.maxFiles,
        acceptedFormats: ['pdf'],
      });

      const uploads = new UploadManager({
        validator,
        destinationFactory: async (context) => {
          const destination = this.openDestination(
            workspace.id,
            context.declaredName,
            'application/pdf',
          );
          return destination.handle;
        },
      });

      for await (const part of input.parts) {
        if (part.kind === 'field') {
          fields[part.name] = part.value;
          continue;
        }
        if (part.fieldName !== 'file') throw pdfToImagesErrors.unexpectedField(part.fieldName);
        if (upload !== undefined) throw pdfToImagesErrors.tooManyFiles();
        upload = await uploads.accept({
          fieldName: part.fieldName,
          declaredName: part.declaredName,
          declaredContentType: part.declaredContentType,
          stream: part.stream,
        });
        file = this.pending.get(workspace.id);
      }

      if (upload === undefined || file === undefined) throw pdfToImagesErrors.missingFile();
      if (upload.detectedFormat !== 'pdf') throw pdfToImagesErrors.notPdf();

      const options = parsePdfToImagesFields(fields);
      await this.workspaces.transition(file.id, 'validated');

      if (options.password === undefined && (await this.looksEncrypted(file.id))) {
        throw pdfToImagesErrors.passwordRequired();
      }

      this.logger?.info(
        {
          tool: PDF_TO_IMAGES_SLUG,
          requestId: input.requestId,
          workspaceId: workspace.id,
          originalFilename: upload.declaredName,
          uploadBytes: upload.sizeBytes,
          sha256: upload.sha256,
          dpi: options.dpi,
          format: options.format,
          quality: options.quality,
          pages: options.pages.allPages ? 'all' : options.pages.expression,
          hasPassword: options.password !== undefined,
        },
        'pdf-to-images request accepted',
      );

      return {
        workspaceId: workspace.id,
        fileId: file.id,
        declaredName: upload.declaredName,
        sizeBytes: upload.sizeBytes,
        sha256: upload.sha256,
        options,
      };
    } catch (error) {
      // Any failure after workspace creation must leave nothing behind.
      await this.workspaces.destroy(workspace.id).catch(() => undefined);
      this.pending.delete(workspace.id);
      this.logger?.warn(
        {
          tool: PDF_TO_IMAGES_SLUG,
          requestId: input.requestId,
          workspaceId: workspace.id,
          reason: isAppError(error) ? error.code : 'E_INTERNAL',
        },
        'pdf-to-images request rejected, workspace destroyed',
      );
      throw isAppError(error) ? error : pdfToImagesErrors.uploadFailed(error);
    } finally {
      this.pending.delete(workspace.id);
    }
  }

  /** Workspace file produced by the most recent destination of a workspace. */
  private readonly pending = new Map<string, WorkspaceFile>();

  private async createWorkspace(requestId: string): Promise<{ id: string }> {
    try {
      const workspace = await this.workspaces.create({
        requestId,
        toolSlug: PDF_TO_IMAGES_SLUG,
        ttlMs: this.ttlMs,
      });
      return { id: workspace.id };
    } catch (error) {
      throw pdfToImagesErrors.workspaceFailed(error);
    }
  }

  /**
   * Bridge the Upload Manager's destination contract onto the Workspace Manager.
   * Bytes are pushed into a PassThrough that the workspace streams onto disk, so the request
   * body is never buffered in memory beyond the signature probe window.
   */
  private openDestination(
    workspaceId: string,
    declaredName: string,
    contentType: string,
  ): { handle: UploadDestination } {
    const bridge = new PassThrough();
    const written = this.workspaces.addFile({
      workspaceId,
      scope: 'uploads',
      declaredName,
      contentType,
      source: bridge as unknown as AsyncIterable<Uint8Array>,
    });
    // The rejection is observed in commit or discard, this keeps Node from warning early.
    written.catch(() => undefined);

    const pending = this.pending;
    const handle: UploadDestination = {
      key: workspaceId,
      write: async (chunk) => {
        if (!bridge.write(chunk)) {
          await new Promise<void>((resolve, reject) => {
            bridge.once('drain', resolve);
            bridge.once('error', reject);
          });
        }
      },
      commit: async () => {
        await new Promise<void>((resolve, reject) => {
          bridge.end(() => resolve());
          bridge.once('error', reject);
        });
        const file = await written;
        pending.set(workspaceId, file);
      },
      discard: async () => {
        bridge.destroy();
        await written.catch(() => undefined);
        pending.delete(workspaceId);
      },
    };
    return { handle };
  }

  /**
   * Cheap encryption probe.
   * A standard PDF advertises encryption through an /Encrypt entry in its trailer, so the
   * trailing window of the stored file is enough to refuse an encrypted document before any
   * engine is involved. No binary is executed and no document is parsed here.
   */
  private async looksEncrypted(fileId: string): Promise<boolean> {
    const path = this.workspaces.pathOf(fileId);
    const handle = await open(path, 'r');
    try {
      const stats = await handle.stat();
      const length = Math.min(ENCRYPTION_PROBE_BYTES, stats.size);
      const position = Math.max(0, stats.size - length);
      const buffer = Buffer.alloc(length);
      await handle.read(buffer, 0, length, position);
      return buffer.includes('/Encrypt');
    } catch (error) {
      throw error instanceof AppError ? error : pdfToImagesErrors.uploadFailed(error);
    } finally {
      await handle.close().catch(() => undefined);
    }
  }
}

export type { AcceptedJob, IncomingPart };
