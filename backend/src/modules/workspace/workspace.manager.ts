/**
 * Workspace Manager.
 * Responsibility: implement the WorkspaceService contract on top of LocalWorkspaceStorage
 * and the file lifecycle state machine. It allocates one isolated directory per job, keeps
 * the authoritative in memory record of every file and its state, and destroys everything
 * when the job ends or its TTL passes.
 *
 * Architecture Notes
 * A workspace is the unit of blast radius. Every temporary file, every engine output and
 * every scratch artefact of one request lives inside a single directory whose lifetime the
 * manager controls, which makes cleanup a directory removal instead of a bookkeeping
 * exercise. State is held in memory on purpose: this phase has no queue and no second
 * process, and a durable index would imply cross process coordination the architecture
 * places in a later phase. Crash safety is therefore provided by disk recovery at boot,
 * not by persisting the index.
 */
import { v7 as uuidv7 } from 'uuid';
import { AppError, ErrorCode, errors } from '../../core/errors.js';
import { HttpStatus } from '../../shared/http-status.js';
import type { StorageObjectRef, StorageScope } from '../../storage/storage.driver.js';
import { assertTransition } from './workspace.state.js';
import { LocalWorkspaceStorage } from './workspace.storage.js';
import type {
  AddFileInput,
  CreateWorkspaceInput,
  FileState,
  Workspace,
  WorkspaceFile,
  WorkspaceService,
} from './workspace.types.js';

interface MutableFile {
  id: string;
  ref: StorageObjectRef;
  state: FileState;
  sizeBytes: number;
  contentType: string;
  declaredName: string;
  createdAtMs: number;
  expiresAtMs: number;
  workspaceId: string;
}

interface MutableWorkspace {
  id: string;
  requestId: string;
  toolSlug: string;
  createdAtMs: number;
  expiresAtMs: number;
  fileIds: string[];
}

export interface WorkspaceManagerOptions {
  readonly storage: LocalWorkspaceStorage;
  /** Injected for deterministic tests. */
  readonly now?: () => number;
}

export class WorkspaceManager implements WorkspaceService {
  private readonly storage: LocalWorkspaceStorage;
  private readonly now: () => number;
  private readonly workspaces = new Map<string, MutableWorkspace>();
  private readonly files = new Map<string, MutableFile>();

  constructor(options: WorkspaceManagerOptions) {
    this.storage = options.storage;
    this.now = options.now ?? Date.now;
  }

  /** Remove partial writes left by a previous process. Call once at boot. */
  public async recover(): Promise<{ workspaces: number; removedPartials: number }> {
    const result = await this.storage.recover();
    return { workspaces: result.workspaces.length, removedPartials: result.removedPartials };
  }

  public async create(input: CreateWorkspaceInput): Promise<Workspace> {
    if (input.ttlMs <= 0) {
      throw new AppError('Workspace TTL must be positive', {
        code: ErrorCode.E_INTERNAL,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        expected: false,
      });
    }
    const id = uuidv7();
    await this.storage.createWorkspace(id);
    const createdAtMs = this.now();
    this.workspaces.set(id, {
      id,
      requestId: input.requestId,
      toolSlug: input.toolSlug,
      createdAtMs,
      expiresAtMs: createdAtMs + input.ttlMs,
      fileIds: [],
    });
    return this.project(id);
  }

  public async find(workspaceId: string): Promise<Workspace | undefined> {
    return this.workspaces.has(workspaceId) ? this.project(workspaceId) : undefined;
  }

  public async addFile(input: AddFileInput): Promise<WorkspaceFile> {
    const workspace = this.require(input.workspaceId);
    const fileId = uuidv7();
    const written = await this.storage.writeObject(
      workspace.id,
      input.scope,
      fileId,
      input.source,
    );
    const createdAtMs = this.now();
    const file: MutableFile = {
      id: fileId,
      ref: { scope: input.scope, key: fileId },
      state: 'received',
      sizeBytes: written.sizeBytes,
      contentType: input.contentType,
      declaredName: input.declaredName,
      createdAtMs,
      expiresAtMs: workspace.expiresAtMs,
      workspaceId: workspace.id,
    };
    this.files.set(fileId, file);
    workspace.fileIds.push(fileId);
    return freezeFile(file);
  }

  public async transition(fileId: string, next: FileState): Promise<WorkspaceFile> {
    const file = this.files.get(fileId);
    if (file === undefined) throw errors.notFound('File does not exist in any workspace');
    assertTransition(file.state, next);
    file.state = next;
    if (next === 'purged') {
      await this.storage.removeObject(file.workspaceId, file.ref.scope, file.ref.key);
    }
    return freezeFile(file);
  }

  /** Absolute path of a workspace file, for handing to the Process Runner. */
  public pathOf(fileId: string): string {
    const file = this.files.get(fileId);
    if (file === undefined) throw errors.notFound('File does not exist in any workspace');
    return this.storage.objectPath(file.workspaceId, file.ref.scope, file.ref.key);
  }

  /** Absolute path of a workspace scope directory, for engine working directories. */
  public scopePathOf(workspaceId: string, scope: StorageScope): string {
    this.require(workspaceId);
    return this.storage.scopeDir(workspaceId, scope);
  }

  public async destroy(workspaceId: string): Promise<void> {
    const workspace = this.workspaces.get(workspaceId);
    if (workspace === undefined) return;
    for (const fileId of workspace.fileIds) this.files.delete(fileId);
    this.workspaces.delete(workspaceId);
    await this.storage.removeWorkspace(workspaceId);
  }

  public async sweepExpired(nowMs: number): Promise<number> {
    const expired = [...this.workspaces.values()].filter(
      (workspace) => workspace.expiresAtMs <= nowMs,
    );
    for (const workspace of expired) await this.destroy(workspace.id);
    return expired.length;
  }

  /** Number of live workspaces, surfaced by health and used by tests. */
  public size(): number {
    return this.workspaces.size;
  }

  private require(workspaceId: string): MutableWorkspace {
    const workspace = this.workspaces.get(workspaceId);
    if (workspace === undefined) throw errors.notFound('Workspace does not exist or has expired');
    return workspace;
  }

  private project(workspaceId: string): Workspace {
    const workspace = this.require(workspaceId);
    const files = workspace.fileIds
      .map((fileId) => this.files.get(fileId))
      .filter((file): file is MutableFile => file !== undefined);
    return Object.freeze({
      id: workspace.id,
      requestId: workspace.requestId,
      toolSlug: workspace.toolSlug,
      createdAtMs: workspace.createdAtMs,
      expiresAtMs: workspace.expiresAtMs,
      inputs: Object.freeze(
        files.filter((file) => file.ref.scope === 'uploads').map(freezeFile),
      ),
      outputs: Object.freeze(
        files.filter((file) => file.ref.scope === 'outputs').map(freezeFile),
      ),
    });
  }
}

function freezeFile(file: MutableFile): WorkspaceFile {
  return Object.freeze({
    id: file.id,
    ref: file.ref,
    state: file.state,
    sizeBytes: file.sizeBytes,
    contentType: file.contentType,
    declaredName: file.declaredName,
    createdAtMs: file.createdAtMs,
    expiresAtMs: file.expiresAtMs,
  });
}
