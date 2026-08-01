/**
 * PDF to Images delivery.
 * Responsibility: turn a finished conversion into exactly one downloadable artefact: the single
 * image itself when only one page was rendered, or a verified ZIP archive of every image when
 * more than one was, and mint the signed grant a client uses to fetch it.
 *
 * Architecture Notes
 * Packaging is a separate step from conversion because the two fail for unrelated reasons and a
 * client needs to be told them apart: a rasterisation failure means the document cannot be
 * converted, an archive failure means the server could not assemble a result it already has.
 * A single image is never wrapped: asking a user to unzip one PNG is a worse product and costs
 * a pointless copy of the payload. The archive is built inside the workspace scratch scope and
 * only then moved into the output scope, so the packer can never see, and therefore never
 * include, the archive it is writing. Verification is not optional: the finished archive is read
 * back through its own central directory and its entry list must equal the expected image names
 * exactly, which is what turns "contains only the generated images" into a checked fact rather
 * than an assumption about the writer. The public file names carry no trace of the uploaded
 * document, because an output name is the easiest way to leak an input name.
 */
import { rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { AppError, isAppError } from '../../core/errors.js';
import { createStoredZip, readStoredZipEntryNames } from '../../platform/archive/index.js';
import type { DownloadService } from '../download/download.service.js';
import type { DownloadArtifact, DownloadTicket } from '../download/download.types.js';
import type { WorkspaceManager } from '../workspace/workspace.manager.js';
import { conversionErrors, type ConversionResult } from './pdf-to-images.conversion.js';
import { PDF_TO_IMAGES_SLUG } from './pdf-to-images.schema.js';
import type { PdfToImagesLogger } from './pdf-to-images.service.js';

/** Scope the images already live in. */
const OUTPUT_SCOPE = 'outputs' as const;
/** Scope the archive is assembled in, so it is never packed into itself. */
const SCRATCH_SCOPE = 'tmp' as const;
/** Public name of a multi image result. */
export const ARCHIVE_NAME = 'images.zip';
const ARCHIVE_CONTENT_TYPE = 'application/zip';
const IMAGE_CONTENT_TYPES: Readonly<Record<string, string>> = Object.freeze({
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
});

export interface PdfToImagesDeliveryOptions {
  readonly workspaces: WorkspaceManager;
  readonly downloads: DownloadService;
  /** Lifetime of the download grant. Defaults to the download service default. */
  readonly ttlMs?: number;
  readonly logger?: PdfToImagesLogger;
}

export interface DeliveredResult {
  readonly ticket: DownloadTicket;
  /** Number of images the client will receive, whether packed or not. */
  readonly imageCount: number;
  /** Names inside the archive, or the single image name. */
  readonly entryNames: readonly string[];
}

export class PdfToImagesDelivery {
  private readonly workspaces: WorkspaceManager;
  private readonly downloads: DownloadService;
  private readonly ttlMs?: number;
  private readonly logger?: PdfToImagesLogger;

  constructor(options: PdfToImagesDeliveryOptions) {
    this.workspaces = options.workspaces;
    this.downloads = options.downloads;
    this.ttlMs = options.ttlMs;
    this.logger = options.logger;
  }

  /** Publish the result of one conversion and return the grant for it. */
  public async publish(
    result: ConversionResult,
    context: { readonly requestId: string },
  ): Promise<DeliveredResult> {
    if (result.images.length === 0) throw conversionErrors.emptyOutput();

    const artifact =
      result.images.length === 1
        ? await this.publishSingleImage(result)
        : await this.publishArchive(result);

    const ticket = this.downloads.issue(artifact, this.ttlMs);

    this.logger?.info(
      {
        tool: PDF_TO_IMAGES_SLUG,
        requestId: context.requestId,
        workspaceId: result.workspaceId,
        kind: artifact.kind,
        imageCount: result.images.length,
        deliveredBytes: artifact.sizeBytes,
        expiresAtMs: ticket.expiresAtMs,
      },
      'pdf-to-images result published',
    );

    return {
      ticket,
      imageCount: result.images.length,
      entryNames: Object.freeze(result.images.map((image) => image.name)),
    };
  }

  /** One page means the image is the deliverable, no archive is created. */
  private async publishSingleImage(result: ConversionResult): Promise<DownloadArtifact> {
    const image = result.images[0] as ConversionResult['images'][number];
    const contentType = IMAGE_CONTENT_TYPES[path.extname(image.name).toLowerCase()];
    if (contentType === undefined) {
      throw conversionErrors.invalidOutput('the image has an unexpected extension');
    }
    const filePath = path.join(
      this.workspaces.scopePathOf(result.workspaceId, OUTPUT_SCOPE),
      image.name,
    );
    const info = await stat(filePath).catch(() => undefined);
    if (info === undefined || !info.isFile() || info.size === 0) {
      throw conversionErrors.emptyOutput();
    }
    return {
      workspaceId: result.workspaceId,
      scope: OUTPUT_SCOPE,
      key: image.name,
      filename: image.name,
      contentType,
      sizeBytes: info.size,
      kind: 'file',
      toolSlug: PDF_TO_IMAGES_SLUG,
    };
  }

  /** More than one page means a verified archive of exactly those images. */
  private async publishArchive(result: ConversionResult): Promise<DownloadArtifact> {
    const outputDir = this.workspaces.scopePathOf(result.workspaceId, OUTPUT_SCOPE);
    const scratchDir = this.workspaces.scopePathOf(result.workspaceId, SCRATCH_SCOPE);
    // Sequential zero padded names sort naturally by string comparison.
    const expected = [...result.images]
      .sort((a, b) => a.index - b.index)
      .map((image) => image.name);
    const entries = expected.map((name) => ({ name, path: path.join(outputDir, name) }));

    const scratchPath = path.join(scratchDir, ARCHIVE_NAME);
    const finalPath = path.join(outputDir, ARCHIVE_NAME);
    await rm(scratchPath, { force: true });

    try {
      const written = await createStoredZip(entries, scratchPath);
      if (written.entryCount !== expected.length || written.sizeBytes === 0) {
        throw conversionErrors.invalidOutput('the archive is incomplete');
      }

      const packed = await readStoredZipEntryNames(scratchPath);
      if (packed.length !== expected.length) {
        throw conversionErrors.invalidOutput('the archive holds an unexpected number of files');
      }
      packed.forEach((name, offset) => {
        if (name !== expected[offset]) {
          throw conversionErrors.invalidOutput('the archive holds an unexpected file');
        }
      });

      await rename(scratchPath, finalPath);
      const info = await stat(finalPath);
      if (!info.isFile() || info.size === 0) {
        throw conversionErrors.invalidOutput('the archive is empty');
      }

      return {
        workspaceId: result.workspaceId,
        scope: OUTPUT_SCOPE,
        key: ARCHIVE_NAME,
        filename: ARCHIVE_NAME,
        contentType: ARCHIVE_CONTENT_TYPE,
        sizeBytes: info.size,
        kind: 'archive',
        toolSlug: PDF_TO_IMAGES_SLUG,
      };
    } catch (error) {
      await rm(scratchPath, { force: true }).catch(() => undefined);
      throw isAppError(error)
        ? (error as AppError)
        : conversionErrors.invalidOutput('the archive could not be created');
    }
  }
}
