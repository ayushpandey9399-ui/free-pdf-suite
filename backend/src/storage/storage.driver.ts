/**
 * Storage driver contract.
 * Responsibility: define the abstraction that hides where bytes live (local disk in
 * early phases, object storage later). Modules depend on this interface only, so the
 * backing store can change without touching a single tool.
 * Phase 0 declares the contract, no driver is implemented or bound.
 */

export type StorageScope = 'uploads' | 'tmp' | 'outputs' | 'quarantine';

export interface StorageObjectRef {
  /** Logical scope the object lives in, drives retention policy. */
  readonly scope: StorageScope;
  /** Opaque key, unique inside the scope. Never a user supplied file name. */
  readonly key: string;
}

export interface StorageObjectStat {
  readonly ref: StorageObjectRef;
  readonly sizeBytes: number;
  readonly createdAtMs: number;
  readonly contentType: string;
}

export interface StoragePutOptions {
  readonly contentType: string;
  /** Milliseconds after which a sweeper may delete the object. */
  readonly ttlMs: number;
}

export interface StorageDriver {
  /** Persist a stream of bytes and return a stable reference. */
  put(scope: StorageScope, source: AsyncIterable<Uint8Array>, options: StoragePutOptions): Promise<StorageObjectRef>;
  /** Open an object for reading. */
  get(ref: StorageObjectRef): Promise<AsyncIterable<Uint8Array>>;
  /** Metadata without reading the payload. */
  stat(ref: StorageObjectRef): Promise<StorageObjectStat>;
  /** Remove an object. Must be idempotent. */
  remove(ref: StorageObjectRef): Promise<void>;
  /** Delete every object in a scope whose TTL has passed, return the count removed. */
  sweepExpired(scope: StorageScope, nowMs: number): Promise<number>;
}
