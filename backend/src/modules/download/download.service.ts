/**
 * Download service.
 * Responsibility: mint grants for workspace artefacts, open a granted artefact for streaming,
 * and release the workspace once a download has served its purpose.
 *
 * Architecture Notes
 * This service is the only place allowed to turn a token into bytes, which is what keeps the
 * file system out of every other module and out of every response. It resolves a path only
 * through the Workspace Manager, so a grant cannot address anything the platform did not
 * create, and it checks the workspace is still live before opening: an expired or destroyed job
 * must look identical to one that never existed. Cleanup lives here too, because retention is a
 * promise about bytes rather than about records: a served download frees its workspace
 * immediately instead of waiting for the sweeper, and the sweeper remains the backstop for
 * links that are never used. Reads are opened before any deletion happens so two concurrent
 * downloads of the same grant both complete.
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { API_V1_PREFIX } from '../../shared/constants.js';
import type { WorkspaceManager } from '../workspace/workspace.manager.js';
import { downloadErrors } from './download.errors.js';
import { DownloadTokenSigner } from './download.tokens.js';
import type {
  DownloadArtifact,
  DownloadClaims,
  DownloadTicket,
  OpenedDownload,
} from './download.types.js';

/** Public route segment of the download endpoint. */
export const DOWNLOAD_ROUTE_SEGMENT = 'downloads';

/** Minimal logging surface, structural so a Fastify logger or a test spy both satisfy it. */
export interface DownloadLogger {
  info(obj: object, msg?: string): void;
  warn(obj: object, msg?: string): void;
}

export interface DownloadServiceOptions {
  readonly workspaces: WorkspaceManager;
  readonly signer: DownloadTokenSigner;
  /** Lifetime of a freshly minted grant. */
  readonly ttlMs: number;
  readonly logger?: DownloadLogger;
  readonly now?: () => number;
}

export class DownloadService {
  private readonly workspaces: WorkspaceManager;
  private readonly signer: DownloadTokenSigner;
  private readonly ttlMs: number;
  private readonly logger?: DownloadLogger;
  private readonly now: () => number;

  constructor(options: DownloadServiceOptions) {
    this.workspaces = options.workspaces;
    this.signer = options.signer;
    this.ttlMs = options.ttlMs;
    this.logger = options.logger;
    this.now = options.now ?? Date.now;
  }

  /** Mint a grant for one artefact. */
  public issue(artifact: DownloadArtifact, ttlMs?: number): DownloadTicket {
    const expiresAtMs = this.now() + Math.max(1, Math.floor(ttlMs ?? this.ttlMs));
    const claims: DownloadClaims = { ...artifact, expiresAtMs };
    const token = this.signer.sign(claims);
    return Object.freeze({
      token,
      url: `${API_V1_PREFIX}/${DOWNLOAD_ROUTE_SEGMENT}/${token}`,
      filename: artifact.filename,
      contentType: artifact.contentType,
      sizeBytes: artifact.sizeBytes,
      kind: artifact.kind,
      expiresAtMs,
    });
  }

  /** Verify a token without opening the artefact, used by tests and by probes. */
  public inspect(token: string): DownloadClaims {
    return this.signer.verify(token);
  }

  /**
   * Open a granted artefact.
   * A missing workspace, a missing file or a size that no longer matches the grant all report
   * the same "no longer available", because a client can act on nothing more precise.
   */
  public async open(token: string): Promise<OpenedDownload> {
    const claims = this.signer.verify(token);

    const workspace = await this.workspaces.find(claims.workspaceId);
    if (workspace === undefined) throw downloadErrors.artifactGone();

    let filePath: string;
    try {
      filePath = this.workspaces.artifactPath(claims.workspaceId, claims.scope, claims.key);
    } catch (error) {
      throw downloadErrors.artifactGone();
    }

    let sizeBytes: number;
    try {
      const info = await stat(filePath);
      if (!info.isFile() || info.size === 0) throw downloadErrors.artifactGone();
      sizeBytes = info.size;
    } catch (error) {
      throw downloadErrors.artifactGone();
    }
    if (sizeBytes !== claims.sizeBytes) throw downloadErrors.artifactGone();

    const stream = createReadStream(filePath);
    return { claims, stream: stream as unknown as AsyncIterable<Uint8Array>, sizeBytes };
  }

  /**
   * Free everything behind a grant.
   * Idempotent, because it runs from a response lifecycle hook that may fire more than once.
   */
  public async release(claims: DownloadClaims, reason: string): Promise<void> {
    await this.workspaces.destroy(claims.workspaceId).catch(() => undefined);
    this.logger?.info(
      {
        tool: claims.toolSlug,
        workspaceId: claims.workspaceId,
        kind: claims.kind,
        sizeBytes: claims.sizeBytes,
        reason,
      },
      'download workspace released',
    );
  }
}

export { DownloadTokenSigner };
