/**
 * Tool registry contracts.
 * Responsibility: describe what a tool manifest looks like and what the registry can
 * answer, without knowing anything about PDFs, engines or binaries.
 * Phase 0 defines the shape; no tool is registered.
 */
import type { WorkerClass } from '../../workers/worker.types.js';

/** Capability a tool requires, for example "pdf.compress". Engines provide capabilities. */
export type CapabilityId = string;

export type ToolCategory = 'organize' | 'convert' | 'edit' | 'secure' | 'image' | 'ocr' | 'platform';

export interface ToolRouting {
  /** Force the async path regardless of predicted duration. */
  readonly forceAsync: boolean;
  /** Budget above which a request is queued instead of run inline. */
  readonly syncBudgetMs: number;
  readonly workerClass: WorkerClass;
}

export interface ToolLimits {
  readonly maxFiles: number;
  readonly maxInputBytes: number;
  readonly timeoutMs: number;
}

export interface ToolManifest {
  /** URL safe unique identifier, for example "merge". */
  readonly slug: string;
  readonly title: string;
  readonly version: string;
  readonly category: ToolCategory;
  readonly enabled: boolean;
  readonly acceptedMimes: readonly string[];
  readonly outputMime: string;
  /** Capabilities that must have a healthy provider for this tool to be usable. */
  readonly requires: readonly CapabilityId[];
  readonly routing: ToolRouting;
  readonly limits: ToolLimits;
}

/** Public projection of a manifest, safe to return over HTTP. */
export interface ToolSummary {
  readonly slug: string;
  readonly title: string;
  readonly version: string;
  readonly category: ToolCategory;
  readonly enabled: boolean;
  readonly acceptedMimes: readonly string[];
  readonly outputMime: string;
}

export interface ToolRegistry {
  register(manifest: ToolManifest): void;
  get(slug: string): ToolManifest | undefined;
  has(slug: string): boolean;
  list(): readonly ToolManifest[];
  listSummaries(): readonly ToolSummary[];
  size(): number;
  clear(): void;
}
