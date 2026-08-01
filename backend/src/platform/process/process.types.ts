/**
 * Process execution contracts.
 * Responsibility: describe a single external binary invocation and its outcome, with no
 * knowledge of which binary is being run or what it produces. Engine adapters build these
 * requests, the runner executes them, and nothing else in the platform may spawn a process.
 */

/** Reasons a run ended, always known, never inferred by the caller. */
export type ProcessOutcome = 'completed' | 'failed' | 'timeout' | 'aborted';

export interface ProcessRunRequest {
  /** Absolute path of the executable. Relative paths and shell strings are rejected. */
  readonly binary: string;
  /** Argument vector. Passed to the OS as a list, so no shell parsing ever happens. */
  readonly args: readonly string[];
  /** Absolute working directory, always a workspace scope directory. */
  readonly cwd: string;
  /** Wall clock budget. On expiry the process tree receives escalating signals. */
  readonly timeoutMs: number;
  /** Grace period between the terminate signal and the kill signal. */
  readonly killGraceMs?: number;
  /** Explicit environment. The parent environment is never inherited wholesale. */
  readonly env?: Readonly<Record<string, string>>;
  /** Optional bytes written to stdin, then stdin is closed. */
  readonly stdin?: Uint8Array;
  /** Ceiling on captured stdout, beyond which output is truncated, never buffered. */
  readonly maxStdoutBytes?: number;
  /** Ceiling on captured stderr. */
  readonly maxStderrBytes?: number;
  /** Caller controlled cancellation, honoured the same way as a timeout. */
  readonly signal?: AbortSignal;
  /** Free form label used only in logs and metrics. */
  readonly label?: string;
}

/** Resource sample taken while the process was alive. */
export interface ProcessResourceUsage {
  /** Milliseconds of user plus system CPU time, when the platform reports it. */
  readonly cpuMs: number;
  /** Highest resident set size observed, in bytes. Zero when unavailable. */
  readonly peakRssBytes: number;
  /** Number of samples taken, useful to judge the confidence of peakRssBytes. */
  readonly samples: number;
}

export interface ProcessRunResult {
  readonly outcome: ProcessOutcome;
  /** Null when the process was terminated by a signal. */
  readonly exitCode: number | null;
  /** Signal that terminated the process, when any. */
  readonly signal: NodeJS.Signals | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly stdoutTruncated: boolean;
  readonly stderrTruncated: boolean;
  readonly durationMs: number;
  readonly usage: ProcessResourceUsage;
  /** Echo of the invocation, argument vector included, for diagnostics and audit logs. */
  readonly invocation: { readonly binary: string; readonly args: readonly string[] };
}

/**
 * Process runner contract.
 * Engine adapters depend on this interface only, which is what makes them unit testable
 * without any binary installed on the machine running the tests.
 */
export interface ProcessRunner {
  run(request: ProcessRunRequest): Promise<ProcessRunResult>;
}
