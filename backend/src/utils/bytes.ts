/**
 * Byte size helpers.
 * Responsibility: convert and format sizes for limits, logs and error messages.
 */

export const KIB = 1024;
export const MIB = 1024 * 1024;

/** Convert megabytes to bytes for limit configuration. */
export function mibToBytes(mib: number): number {
  return Math.round(mib * MIB);
}

/** Format a byte count for user facing messages, for example "24.5 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < KIB) return `${bytes} B`;
  if (bytes < MIB) return `${(bytes / KIB).toFixed(1)} KB`;
  return `${(bytes / MIB).toFixed(1)} MB`;
}
