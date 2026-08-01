/**
 * Workspace contracts.
 * Responsibility: define the file lifecycle vocabulary of the platform: a workspace is
 * the isolated directory that holds one job's input, scratch and output files, plus the
 * state machine every file passes through.
 * Phase 0 is interfaces only. Nothing creates, writes or deletes a file here.
 */
import type { StorageObjectRef, StorageScope } from '../../storage/storage.driver.js';

/** States from the file lifecycle state machine in the architecture specification. */
export type FileState =
  | 'received'
  | 'validated'
  | 'scanned'
  | 'quarantined'
  | 'queued'
  | 'processing'
  | 'produced'
  | 'verified'
  | 'available'
  | 'downloaded'
  | 'expired'
  | 'failed'
  | 'purged';

export interface WorkspaceFile {
  readonly id: string;
  readonly ref: StorageObjectRef;
  readonly state: FileState;
  readonly sizeBytes: number;
  readonly contentType: string;
  /** Original client file name, treated as untrusted display data only. */
  readonly declaredName: string;
  readonly createdAtMs: number;
  readonly expiresAtMs: number;
}

export interface Workspace {
  readonly id: string;
  readonly requestId: string;
  /** Slug of the tool that owns this workspace, empty for platform level workspaces. */
  readonly toolSlug: string;
  readonly createdAtMs: number;
  readonly expiresAtMs: number;
  readonly inputs: readonly WorkspaceFile[];
  readonly outputs: readonly WorkspaceFile[];
}

export interface CreateWorkspaceInput {
  readonly requestId: string;
  readonly toolSlug: string;
  readonly ttlMs: number;
}

export interface AddFileInput {
  readonly workspaceId: string;
  readonly scope: StorageScope;
  readonly declaredName: string;
  readonly contentType: string;
  readonly source: AsyncIterable<Uint8Array>;
}

/**
 * Workspace service contract.
 * Implemented in a later phase against a StorageDriver. Declared now so tool modules
 * can be written against a stable interface from day one.
 */
export interface WorkspaceService {
  /** Allocate an isolated workspace for one job. */
  create(input: CreateWorkspaceInput): Promise<Workspace>;
  /** Look up a workspace by id. */
  find(workspaceId: string): Promise<Workspace | undefined>;
  /** Stream a file into the workspace under the given scope. */
  addFile(input: AddFileInput): Promise<WorkspaceFile>;
  /** Advance a file to a new lifecycle state, rejecting illegal transitions. */
  transition(fileId: string, next: FileState): Promise<WorkspaceFile>;
  /** Delete every file of a workspace and forget it. Idempotent. */
  destroy(workspaceId: string): Promise<void>;
  /** Purge workspaces whose TTL has passed, return the count removed. */
  sweepExpired(nowMs: number): Promise<number>;
}

/**
 * Legal transitions of the file lifecycle state machine.
 * Exported as data so a future implementation and its tests share one definition.
 */
export const FILE_STATE_TRANSITIONS: Readonly<Record<FileState, readonly FileState[]>> = Object.freeze({
  received: ['validated', 'failed'],
  validated: ['scanned', 'quarantined', 'failed'],
  scanned: ['queued', 'processing', 'failed'],
  quarantined: ['purged'],
  queued: ['processing', 'failed'],
  processing: ['produced', 'failed'],
  produced: ['verified', 'failed'],
  verified: ['available', 'failed'],
  available: ['downloaded', 'expired'],
  downloaded: ['expired'],
  expired: ['purged'],
  failed: ['purged'],
  purged: [],
});
