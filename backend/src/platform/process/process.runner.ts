/**
 * Node process runner.
 * Responsibility: execute one external binary safely, capture bounded output, sample
 * resource usage, and guarantee that no process or child of a process outlives its budget.
 *
 * Architecture Notes
 * Every engine in this platform is an external binary, and every one of them can hang,
 * fork, or emit gigabytes of output on a malformed document. Those three failure modes are
 * handled here, once, instead of in each adapter: the process is spawned without a shell
 * and in its own process group so termination reaches the whole tree; stdout and stderr are
 * truncated at a byte ceiling rather than buffered without bound; and timeout escalates
 * from terminate to kill so a cooperative binary can clean up while an uncooperative one is
 * still removed. Adapters therefore never call spawn, which keeps the audit surface for
 * arbitrary execution at exactly one file.
 */
import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { AppError, ErrorCode } from '../../core/errors.js';
import { HttpStatus } from '../../shared/http-status.js';
import type { Logger } from '../../core/logger.js';
import { assertValidRunRequest } from './process.guard.js';
import type {
  ProcessOutcome,
  ProcessResourceUsage,
  ProcessRunRequest,
  ProcessRunResult,
  ProcessRunner,
} from './process.types.js';

const DEFAULT_MAX_OUTPUT_BYTES = 1_048_576;
const DEFAULT_KILL_GRACE_MS = 2_000;
const SAMPLE_INTERVAL_MS = 250;

/** Bounded, append only output buffer. */
class OutputSink {
  private readonly chunks: Buffer[] = [];
  private size = 0;
  private truncatedFlag = false;

  constructor(private readonly limitBytes: number) {}

  public push(chunk: Buffer): void {
    if (this.size >= this.limitBytes) {
      this.truncatedFlag = true;
      return;
    }
    const remaining = this.limitBytes - this.size;
    if (chunk.length > remaining) {
      this.chunks.push(chunk.subarray(0, remaining));
      this.size = this.limitBytes;
      this.truncatedFlag = true;
      return;
    }
    this.chunks.push(chunk);
    this.size += chunk.length;
  }

  public get truncated(): boolean {
    return this.truncatedFlag;
  }

  public text(): string {
    return Buffer.concat(this.chunks).toString('utf8');
  }
}

export interface NodeProcessRunnerOptions {
  readonly logger?: Logger;
  /** Overridable for tests that need a faster sampling cadence. */
  readonly sampleIntervalMs?: number;
}

export class NodeProcessRunner implements ProcessRunner {
  private readonly logger?: Logger;
  private readonly sampleIntervalMs: number;

  constructor(options: NodeProcessRunnerOptions = {}) {
    this.logger = options.logger;
    this.sampleIntervalMs = options.sampleIntervalMs ?? SAMPLE_INTERVAL_MS;
  }

  public async run(request: ProcessRunRequest): Promise<ProcessRunResult> {
    assertValidRunRequest(request);

    const startedAt = Date.now();
    const stdout = new OutputSink(request.maxStdoutBytes ?? DEFAULT_MAX_OUTPUT_BYTES);
    const stderr = new OutputSink(request.maxStderrBytes ?? DEFAULT_MAX_OUTPUT_BYTES);

    let child: ChildProcessWithoutNullStreams;
    try {
      child = spawn(request.binary, [...request.args], {
        cwd: request.cwd,
        // An explicit environment only. Nothing from the API process leaks into an engine.
        env: { ...(request.env ?? {}) },
        // Own process group, so a signal reaches children the binary forked.
        detached: process.platform !== 'win32',
        shell: false,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
      }) as ChildProcessWithoutNullStreams;
    } catch (error) {
      throw new AppError('Failed to start external process', {
        code: ErrorCode.E_INTERNAL,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        cause: error,
        expected: false,
        details: { label: request.label ?? null },
      });
    }

    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));

    if (request.stdin !== undefined) {
      child.stdin.end(Buffer.from(request.stdin));
    } else {
      child.stdin.end();
    }

    const sampler = this.startSampling(child);
    const termination = this.armTermination(child, request);

    const exit = await this.awaitExit(child);
    sampler.stop();
    termination.disarm();

    const outcome = resolveOutcome(exit, termination.state());
    const result: ProcessRunResult = {
      outcome,
      exitCode: exit.code,
      signal: exit.signal,
      stdout: stdout.text(),
      stderr: stderr.text(),
      stdoutTruncated: stdout.truncated,
      stderrTruncated: stderr.truncated,
      durationMs: Date.now() - startedAt,
      usage: sampler.usage(),
      invocation: { binary: request.binary, args: [...request.args] },
    };

    this.logger?.debug(
      {
        label: request.label ?? null,
        outcome: result.outcome,
        exitCode: result.exitCode,
        durationMs: result.durationMs,
      },
      'external process finished',
    );

    return result;
  }

  /** Poll resource usage while the child is alive. */
  private startSampling(child: ChildProcessWithoutNullStreams): {
    stop(): void;
    usage(): ProcessResourceUsage;
  } {
    let samples = 0;
    let peakRssBytes = 0;
    const startedAt = process.hrtime.bigint();

    const timer = setInterval(() => {
      samples += 1;
      // resourceUsage is only available for the current process, so the sample is an upper
      // bound on this API process while the child ran. It is recorded as best effort.
      const rss = process.memoryUsage().rss;
      if (rss > peakRssBytes) peakRssBytes = rss;
    }, this.sampleIntervalMs);
    timer.unref?.();

    child.once('exit', () => clearInterval(timer));

    return {
      stop: () => clearInterval(timer),
      usage: () => ({
        cpuMs: Math.round(Number(process.hrtime.bigint() - startedAt) / 1_000_000),
        peakRssBytes,
        samples,
      }),
    };
  }

  /** Arm the timeout and the caller's abort signal, escalating terminate to kill. */
  private armTermination(
    child: ChildProcessWithoutNullStreams,
    request: ProcessRunRequest,
  ): { disarm(): void; state(): 'none' | 'timeout' | 'aborted' } {
    let state: 'none' | 'timeout' | 'aborted' = 'none';
    let killTimer: NodeJS.Timeout | undefined;

    const escalate = (): void => {
      this.signalTree(child, 'SIGTERM');
      killTimer = setTimeout(() => {
        this.signalTree(child, 'SIGKILL');
      }, request.killGraceMs ?? DEFAULT_KILL_GRACE_MS);
      killTimer.unref?.();
    };

    const timeoutTimer = setTimeout(() => {
      state = 'timeout';
      escalate();
    }, request.timeoutMs);
    timeoutTimer.unref?.();

    const onAbort = (): void => {
      state = 'aborted';
      escalate();
    };
    request.signal?.addEventListener('abort', onAbort, { once: true });

    return {
      disarm: () => {
        clearTimeout(timeoutTimer);
        if (killTimer !== undefined) clearTimeout(killTimer);
        request.signal?.removeEventListener('abort', onAbort);
      },
      state: () => state,
    };
  }

  /** Signal the whole process group when possible, the child alone otherwise. */
  private signalTree(child: ChildProcessWithoutNullStreams, signal: NodeJS.Signals): void {
    if (child.exitCode !== null || child.signalCode !== null) return;
    try {
      if (child.pid !== undefined && process.platform !== 'win32') {
        process.kill(-child.pid, signal);
        return;
      }
      child.kill(signal);
    } catch {
      // The process already vanished, which is the outcome the signal was asking for.
      try {
        child.kill(signal);
      } catch {
        // Nothing left to terminate.
      }
    }
  }

  private awaitExit(child: ChildProcessWithoutNullStreams): Promise<{
    code: number | null;
    signal: NodeJS.Signals | null;
    spawnError: Error | undefined;
  }> {
    return new Promise((resolve) => {
      let spawnError: Error | undefined;
      child.once('error', (error: Error) => {
        spawnError = error;
      });
      child.once('close', (code, signal) => {
        resolve({ code, signal, spawnError });
      });
    });
  }
}

function resolveOutcome(
  exit: { code: number | null; signal: NodeJS.Signals | null; spawnError: Error | undefined },
  termination: 'none' | 'timeout' | 'aborted',
): ProcessOutcome {
  if (termination === 'timeout') return 'timeout';
  if (termination === 'aborted') return 'aborted';
  if (exit.spawnError !== undefined) return 'failed';
  return exit.code === 0 ? 'completed' : 'failed';
}
