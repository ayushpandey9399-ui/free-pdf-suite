/**
 * Retention policy.
 * Responsibility: map a storage scope to its time to live, derived from configuration.
 * Keeps lifecycle rules in one place instead of scattered magic numbers.
 */
import type { AppConfig } from '../config/index.js';
import type { StorageScope } from './storage.driver.js';

export interface RetentionPolicy {
  ttlMsFor(scope: StorageScope): number;
}

export function createRetentionPolicy(config: AppConfig): RetentionPolicy {
  const { uploadTtlMs, outputTtlMs } = config.workspace;

  const table: Record<StorageScope, number> = {
    uploads: uploadTtlMs,
    // Scratch space is worker scoped and short lived.
    tmp: Math.max(uploadTtlMs, 60 * 60_000),
    outputs: outputTtlMs,
    // Suspicious input is kept longer for audit, then purged.
    quarantine: 24 * 60 * 60_000,
  };

  return {
    ttlMsFor: (scope: StorageScope): number => table[scope],
  };
}
