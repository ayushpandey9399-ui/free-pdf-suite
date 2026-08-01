/**
 * Download contracts.
 * Responsibility: describe what a downloadable artefact is and what a signed grant claims,
 * without knowing anything about HTTP, the file system or a specific tool.
 */
import type { StorageScope } from '../../storage/storage.driver.js';

/** Kind of artefact a grant points at, used for logging and client presentation. */
export type DownloadKind = 'file' | 'archive';

/** One artefact a tool wants to expose, addressed by workspace rather than by path. */
export interface DownloadArtifact {
  readonly workspaceId: string;
  /** Workspace scope the object lives in. */
  readonly scope: StorageScope;
  /** Opaque object name inside the scope, for example page-0001.png. Never exposed. */
  readonly key: string;
  /** Name the browser saves the file under. Safe, generated, never the uploaded name. */
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly kind: DownloadKind;
  /** Slug of the tool that produced the artefact, for logging only. */
  readonly toolSlug: string;
}

/** Signed grant claims. Everything a download needs travels inside the token. */
export interface DownloadClaims extends DownloadArtifact {
  /** Milliseconds since the epoch after which the grant is refused. */
  readonly expiresAtMs: number;
}

/** What a tool hands back to a client so it can fetch the result. */
export interface DownloadTicket {
  readonly token: string;
  /** Relative API path of the download, never a file system path. */
  readonly url: string;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly kind: DownloadKind;
  readonly expiresAtMs: number;
}

/** An opened artefact, ready to stream. */
export interface OpenedDownload {
  readonly claims: DownloadClaims;
  readonly stream: AsyncIterable<Uint8Array>;
  readonly sizeBytes: number;
}
