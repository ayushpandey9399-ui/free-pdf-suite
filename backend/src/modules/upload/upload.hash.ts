/**
 * Streaming content hash.
 * Responsibility: produce the SHA-256 of a file while it is being written, so the
 * platform never needs a second pass over the bytes and never needs the whole file in
 * memory. The digest is the deduplication key and the integrity proof for outputs.
 */
import { createHash, type Hash } from 'node:crypto';

/** Incremental hasher with a single terminal digest call. */
export interface StreamHasher {
  update(chunk: Uint8Array): void;
  /** Lowercase hex digest. Must be called at most once. */
  digest(): string;
}

class Sha256StreamHasher implements StreamHasher {
  private readonly hash: Hash = createHash('sha256');
  private finished = false;

  public update(chunk: Uint8Array): void {
    if (this.finished) {
      throw new Error('StreamHasher.update called after digest');
    }
    this.hash.update(chunk);
  }

  public digest(): string {
    if (this.finished) {
      throw new Error('StreamHasher.digest called twice');
    }
    this.finished = true;
    return this.hash.digest('hex');
  }
}

/** Create a fresh SHA-256 hasher. */
export function createStreamHasher(): StreamHasher {
  return new Sha256StreamHasher();
}
