/**
 * Time helpers.
 * Responsibility: monotonic duration measurement and human readable durations,
 * so every module reports timings the same way.
 */

/** Milliseconds elapsed since a high resolution start mark. */
export function elapsedMs(startedAt: bigint): number {
  return Number(process.hrtime.bigint() - startedAt) / 1_000_000;
}

/** High resolution start mark, pair with elapsedMs. */
export function startMark(): bigint {
  return process.hrtime.bigint();
}

/** Milliseconds since the Unix epoch, isolated for easy test stubbing. */
export function nowMs(): number {
  return Date.now();
}

/** ISO timestamp for API payloads. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Promise that settles after the given delay, used by graceful shutdown. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
