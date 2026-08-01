/**
 * Graceful shutdown coordinator.
 * Responsibility: on SIGTERM, SIGINT or a fatal fault, stop accepting traffic,
 * run registered disposers in reverse order, and exit within a bounded deadline.
 * Later phases register queue and storage disposers here without touching call sites.
 */
import { delay } from '../utils/time.js';

/**
 * Minimal logger shape this manager needs.
 * Structural typing keeps it compatible with both a raw Pino logger and Fastify's
 * FastifyBaseLogger, so the manager can be used from any layer.
 */
export interface ShutdownLogger {
  info: (obj: object, msg?: string) => void;
  error: (obj: object, msg?: string) => void;
  fatal: (obj: object, msg?: string) => void;
  child: (bindings: Record<string, unknown>) => ShutdownLogger;
}

export interface Disposable {
  /** Human readable name, used in shutdown logs. */
  name: string;
  /** Release the resource. Must be idempotent and must not throw fatally. */
  dispose: () => Promise<void> | void;
}

export interface ShutdownOptions {
  logger: ShutdownLogger;
  /** Hard deadline; the process exits even if a disposer hangs. */
  timeoutMs: number;
  /** Injected for tests so the runner never kills the test process. */
  exit?: (code: number) => void;
}

export class ShutdownManager {
  private readonly disposables: Disposable[] = [];
  private readonly logger: ShutdownLogger;
  private readonly timeoutMs: number;
  private readonly exit: (code: number) => void;
  private shuttingDown = false;

  constructor(options: ShutdownOptions) {
    this.logger = options.logger.child({ component: 'shutdown' });
    this.timeoutMs = options.timeoutMs;
    this.exit = options.exit ?? ((code: number) => process.exit(code));
  }

  /** Register a resource to release during shutdown. Later registrations close first. */
  public register(disposable: Disposable): void {
    this.disposables.push(disposable);
  }

  /** Attach process level listeners for signals and unhandled faults. */
  public listen(): void {
    for (const signal of ['SIGTERM', 'SIGINT'] as const) {
      process.once(signal, () => {
        void this.shutdown(signal, 0);
      });
    }

    process.once('unhandledRejection', (reason) => {
      this.logger.fatal({ err: reason }, 'unhandled promise rejection');
      void this.shutdown('unhandledRejection', 1);
    });

    process.once('uncaughtException', (error) => {
      this.logger.fatal({ err: error }, 'uncaught exception');
      void this.shutdown('uncaughtException', 1);
    });
  }

  /** Run the shutdown sequence once, bounded by the configured deadline. */
  public async shutdown(reason: string, code: number): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    this.logger.info({ reason, disposables: this.disposables.length }, 'shutdown started');

    const sequence = (async () => {
      for (const disposable of [...this.disposables].reverse()) {
        try {
          await disposable.dispose();
          this.logger.info({ resource: disposable.name }, 'resource released');
        } catch (error) {
          this.logger.error({ err: error, resource: disposable.name }, 'resource failed to release');
        }
      }
    })();

    const timedOut = Symbol('timeout');
    const outcome = await Promise.race([
      sequence.then(() => 'done' as const),
      delay(this.timeoutMs).then(() => timedOut),
    ]);

    if (outcome === timedOut) {
      this.logger.error({ timeoutMs: this.timeoutMs }, 'shutdown deadline exceeded, forcing exit');
      this.exit(1);
      return;
    }

    this.logger.info({ reason }, 'shutdown complete');
    this.exit(code);
  }
}
