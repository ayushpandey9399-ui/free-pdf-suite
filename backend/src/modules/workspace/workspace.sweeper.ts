/**
 * Workspace sweeper.
 * Responsibility: run the TTL purge on an interval so expired workspaces disappear even
 * when no request arrives to trigger cleanup.
 *
 * Architecture Notes
 * Retention is a privacy promise, not an optimisation. A request driven cleanup would let
 * documents survive indefinitely on a quiet night, so expiry needs its own clock. The timer
 * is unref'd so it never keeps the process alive during shutdown, and a run in flight is
 * never overlapped with the next tick.
 */
import type { Logger } from '../../core/logger.js';

export interface WorkspaceSweeperTarget {
  sweepExpired(nowMs: number): Promise<number>;
}

export interface WorkspaceSweeperOptions {
  readonly target: WorkspaceSweeperTarget;
  readonly intervalMs: number;
  readonly logger?: Logger;
  readonly now?: () => number;
}

export class WorkspaceSweeper {
  private readonly target: WorkspaceSweeperTarget;
  private readonly intervalMs: number;
  private readonly logger?: Logger;
  private readonly now: () => number;
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(options: WorkspaceSweeperOptions) {
    this.target = options.target;
    this.intervalMs = options.intervalMs;
    this.logger = options.logger;
    this.now = options.now ?? Date.now;
  }

  public get started(): boolean {
    return this.timer !== undefined;
  }

  /** Begin sweeping. Calling twice is a no op. */
  public start(): void {
    if (this.timer !== undefined) return;
    this.timer = setInterval(() => {
      void this.runOnce();
    }, this.intervalMs);
    this.timer.unref?.();
  }

  /** Stop sweeping. Safe to call when never started. */
  public stop(): void {
    if (this.timer === undefined) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }

  /** One sweep. Never throws, so a failure cannot kill the interval. */
  public async runOnce(): Promise<number> {
    if (this.running) return 0;
    this.running = true;
    try {
      const removed = await this.target.sweepExpired(this.now());
      if (removed > 0) this.logger?.info({ removed }, 'workspace sweep removed expired workspaces');
      return removed;
    } catch (error) {
      this.logger?.error({ err: error }, 'workspace sweep failed');
      return 0;
    } finally {
      this.running = false;
    }
  }
}
