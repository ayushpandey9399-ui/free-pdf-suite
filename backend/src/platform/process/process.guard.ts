/**
 * Process invocation guards.
 * Responsibility: refuse to build a run request that could be interpreted by a shell, could
 * escape a workspace or could smuggle a null byte into an operating system call.
 *
 * Architecture Notes
 * These checks live apart from the runner so they can be applied at plan time, inside an
 * engine adapter's own tests, without spawning anything. The rule they enforce is absolute:
 * a binary is an absolute path, arguments are a list, and no string reaching execve is ever
 * assembled from user input by concatenation.
 */
import path from 'node:path';
import { AppError, ErrorCode } from '../../core/errors.js';
import { HttpStatus } from '../../shared/http-status.js';
import type { ProcessRunRequest } from './process.types.js';

const SHELL_METACHARACTERS = /[;&|`$><\n\r]/;

function fault(message: string, details?: unknown): AppError {
  return new AppError(message, {
    code: ErrorCode.E_INTERNAL,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    expected: false,
    details,
  });
}

/** The binary must be an absolute, null byte free path. */
export function assertAbsoluteBinary(binary: string): void {
  if (binary.length === 0) throw fault('Process binary is empty');
  if (binary.includes('\0')) throw fault('Process binary contains a null byte');
  if (!path.isAbsolute(binary)) throw fault('Process binary must be an absolute path');
}

/** Arguments must be plain strings without null bytes. */
export function assertSafeArgs(args: readonly string[]): void {
  for (const arg of args) {
    if (typeof arg !== 'string') throw fault('Process argument is not a string');
    if (arg.includes('\0')) throw fault('Process argument contains a null byte');
  }
}

/** The working directory must be absolute, since engines resolve relative outputs against it. */
export function assertAbsoluteCwd(cwd: string): void {
  if (!path.isAbsolute(cwd)) throw fault('Process working directory must be an absolute path');
  if (cwd.includes('\0')) throw fault('Process working directory contains a null byte');
}

/**
 * Reject a binary path that reads like a shell command rather than a path.
 * Defence in depth: spawn is always called without a shell, this catches mistakes earlier.
 */
export function assertNoShellSyntax(binary: string): void {
  if (SHELL_METACHARACTERS.test(binary)) throw fault('Process binary contains shell syntax');
}

/** Full validation of a run request. Called by the runner and usable by adapters. */
export function assertValidRunRequest(request: ProcessRunRequest): void {
  assertAbsoluteBinary(request.binary);
  assertNoShellSyntax(request.binary);
  assertSafeArgs(request.args);
  assertAbsoluteCwd(request.cwd);
  if (!Number.isInteger(request.timeoutMs) || request.timeoutMs <= 0) {
    throw fault('Process timeout must be a positive integer number of milliseconds');
  }
  if (request.killGraceMs !== undefined && request.killGraceMs < 0) {
    throw fault('Process kill grace must not be negative');
  }
}
