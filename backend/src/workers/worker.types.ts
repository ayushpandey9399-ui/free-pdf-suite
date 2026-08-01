/**
 * Worker contracts.
 * Responsibility: define worker classes, resource profiles and the job handler shape
 * that future queue backed workers must satisfy.
 * Phase 0 has no queue, no worker process and no BullMQ dependency. These types exist
 * so tool modules written in later phases can declare their routing needs immediately.
 */

/** Pools are separated by resource profile so slow work cannot block fast work. */
export type WorkerClass = 'light' | 'raster' | 'office' | 'ocr' | 'image' | 'maint';

export interface ResourceProfile {
  readonly cpuLimit: number;
  readonly memoryMb: number;
  readonly timeoutMs: number;
  readonly hardKillMs: number;
  readonly scratchMb: number;
}

export interface WorkerDefinition {
  readonly workerClass: WorkerClass;
  /** Queue name this pool consumes, assigned in the queue phase. */
  readonly queue: string;
  readonly concurrencyPerReplica: number;
  readonly resources: ResourceProfile;
}

export interface JobContext {
  readonly jobId: string;
  readonly requestId: string;
  readonly attempt: number;
  /** Aborted when the job exceeds its timeout, handlers must honour it. */
  readonly signal: AbortSignal;
}

export interface JobHandler<TInput, TOutput> {
  readonly name: string;
  handle(input: TInput, context: JobContext): Promise<TOutput>;
}
