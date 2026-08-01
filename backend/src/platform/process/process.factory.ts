/**
 * Process runner factory.
 * Responsibility: build the single runner instance the platform shares, so limits and the
 * logger are configured in exactly one place and every engine inherits the same behaviour.
 */
import type { Logger } from '../../core/logger.js';
import { NodeProcessRunner } from './process.runner.js';
import type { ProcessRunner } from './process.types.js';

export interface CreateProcessRunnerOptions {
  readonly logger?: Logger;
  readonly sampleIntervalMs?: number;
}

/** Create a runner. Kept as a factory so tests can inject fakes at the same seam. */
export function createProcessRunner(options: CreateProcessRunnerOptions = {}): ProcessRunner {
  return new NodeProcessRunner(options);
}
