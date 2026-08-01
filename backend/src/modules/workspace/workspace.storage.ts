/**
 * Local workspace storage.
 * Responsibility: own every path inside the workspace root, create and destroy workspace
 * directories, stream bytes onto disk through a temporary file, and recover directories
 * left behind by a crash.
 *
 * Architecture Notes
 * The platform hands untrusted documents to external binaries. Those binaries must only
 * ever see paths this class produced, and every path is derived from an opaque id plus a
 * fixed scope name, never from a client string. Keeping path construction in a single
 * class is what makes "no traversal is possible" a property of the code rather than a
 * claim in a document. Writes land in a .part file and are renamed on commit, so a crash
 * leaves either a whole file or no file, never a half one that a tool might process.
 */
import { createWriteStream } from 'node:fs';
import { mkdir, readdir, rename, rm, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { AppError, ErrorCode } from '../../core/errors.js';
import { HttpStatus } from '../../shared/http-status.js';
import type { StorageScope } from '../../storage/storage.driver.js';

/** Scope subdirectories created inside every workspace. */
export const WORKSPACE_SCOPES: readonly StorageScope[] = Object.freeze([
  'uploads',
  'tmp',
  'outputs',
  'quarantine',
]);

const TEMP_SUFFIX = '.part';
const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

export interface WorkspaceRecovery {
  /** Workspace directories found on disk at boot. */
  readonly workspaces: readonly string[];
  /** Partial files removed because they cannot be trusted. */
  readonly removedPartials: number;
}

export class LocalWorkspaceStorage {
  private readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  /** Absolute workspace root, the only directory this process writes into. */
  public get rootDir(): string {
    return this.root;
  }

  /** Create the root if missing. Safe to call repeatedly. */
  public async ensureRoot(): Promise<void> {
    await mkdir(this.root, { recursive: true });
  }

  /** Absolute directory of one workspace. */
  public workspaceDir(workspaceId: string): string {
    assertSafeId(workspaceId, 'workspace id');
    return path.join(this.root, workspaceId);
  }

  /** Absolute directory of one scope inside a workspace. */
  public scopeDir(workspaceId: string, scope: StorageScope): string {
    return path.join(this.workspaceDir(workspaceId), scope);
  }

  /**
   * Absolute path of one object.
   * The key is validated as an opaque id, so a client name can never reach the file system.
   */
  public objectPath(workspaceId: string, scope: StorageScope, key: string): string {
    assertSafeId(key, 'object key');
    const resolved = path.join(this.scopeDir(workspaceId, scope), key);
    // Defence in depth: the resolved path must still be inside the workspace.
    if (!resolved.startsWith(this.workspaceDir(workspaceId) + path.sep)) {
      throw pathEscape(resolved);
    }
    return resolved;
  }

  /** Create a workspace directory with all scope subdirectories. */
  public async createWorkspace(workspaceId: string): Promise<string> {
    const dir = this.workspaceDir(workspaceId);
    await mkdir(dir, { recursive: true });
    for (const scope of WORKSPACE_SCOPES) {
      await mkdir(path.join(dir, scope), { recursive: true });
    }
    return dir;
  }

  /** Stream bytes into a scope, writing to a temporary file and renaming on success. */
  public async writeObject(
    workspaceId: string,
    scope: StorageScope,
    key: string,
    source: AsyncIterable<Uint8Array>,
  ): Promise<{ path: string; sizeBytes: number }> {
    const target = this.objectPath(workspaceId, scope, key);
    const temp = `${target}${TEMP_SUFFIX}`;
    await mkdir(path.dirname(target), { recursive: true });
    try {
      await pipeline(Readable.from(source), createWriteStream(temp, { flags: 'wx' }));
      await rename(temp, target);
    } catch (error) {
      await unlink(temp).catch(() => undefined);
      throw new AppError('Failed to write workspace file', {
        code: ErrorCode.E_INTERNAL,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        cause: error,
        expected: false,
      });
    }
    const info = await stat(target);
    return { path: target, sizeBytes: info.size };
  }

  /** Remove one object. Idempotent. */
  public async removeObject(workspaceId: string, scope: StorageScope, key: string): Promise<void> {
    await rm(this.objectPath(workspaceId, scope, key), { force: true });
  }

  /** Remove an entire workspace directory. Idempotent. */
  public async removeWorkspace(workspaceId: string): Promise<void> {
    await rm(this.workspaceDir(workspaceId), { recursive: true, force: true });
  }

  /** Directory names directly under the root. */
  public async listWorkspaces(): Promise<string[]> {
    await this.ensureRoot();
    const entries = await readdir(this.root, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  }

  /** Milliseconds since the epoch when the workspace directory was created. */
  public async workspaceCreatedAtMs(workspaceId: string): Promise<number> {
    const info = await stat(this.workspaceDir(workspaceId));
    return Math.floor(info.birthtimeMs || info.mtimeMs);
  }

  /**
   * Boot time recovery.
   * Partial writes from a previous process are deleted, because a truncated document is
   * indistinguishable from a corrupt one and must never be handed to an engine.
   */
  public async recover(): Promise<WorkspaceRecovery> {
    const workspaces = await this.listWorkspaces();
    let removedPartials = 0;
    for (const workspaceId of workspaces) {
      for (const scope of WORKSPACE_SCOPES) {
        const dir = path.join(this.root, workspaceId, scope);
        let entries: string[];
        try {
          entries = await readdir(dir);
        } catch {
          continue;
        }
        for (const entry of entries) {
          if (!entry.endsWith(TEMP_SUFFIX)) continue;
          await rm(path.join(dir, entry), { force: true });
          removedPartials += 1;
        }
      }
    }
    return { workspaces, removedPartials };
  }
}

function assertSafeId(value: string, label: string): void {
  if (!ID_PATTERN.test(value)) {
    throw new AppError(`Unsafe ${label}`, {
      code: ErrorCode.E_INTERNAL,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      expected: false,
    });
  }
}

function pathEscape(resolved: string): AppError {
  return new AppError('Resolved path escapes its workspace', {
    code: ErrorCode.E_INTERNAL,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    expected: false,
    details: { resolvedLength: resolved.length },
  });
}
