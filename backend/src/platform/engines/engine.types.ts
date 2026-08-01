/**
 * Engine contracts.
 * Responsibility: define what an engine is to the rest of the platform: an identity, a set
 * of capabilities, a health report, and a four step pipeline of validate, plan, execute,
 * parse. No file in this layer knows about HTTP, tools or workspaces.
 *
 * Architecture Notes
 * The split between plan and execute is the load bearing decision here. An adapter turns a
 * typed request into a ProcessRunRequest and never spawns anything itself, which means the
 * exact argument vector for any input can be asserted in a unit test on a machine where the
 * binary is not installed. It also means a single reviewed file owns process execution, and
 * swapping an engine (Poppler for Ghostscript on rasterisation) is a registry change rather
 * than a rewrite of the calling tool.
 */
import type { ProcessRunRequest, ProcessRunResult, ProcessRunner } from '../process/process.types.js';

/** Stable identifiers of the engines the architecture recognises. */
export type EngineId =
  | 'poppler'
  | 'ghostscript'
  | 'qpdf'
  | 'libreoffice'
  | 'imagemagick'
  | 'tesseract';

/** Capability ids match the "requires" field of a tool manifest. */
export type EngineCapabilityId = string;

export interface EngineHealth {
  readonly engineId: EngineId;
  /** True when every binary the engine needs was found and answered a version probe. */
  readonly installed: boolean;
  /** Reported version, empty when unknown. Digits and dots only, never raw output. */
  readonly version: string;
  /** Absolute paths of the resolved binaries, keyed by binary name. */
  readonly binaries: Readonly<Record<string, string>>;
  /** Capabilities confirmed by probing, a subset of the declared capabilities. */
  readonly capabilities: readonly EngineCapabilityId[];
  readonly lastCheckedMs: number;
  /** Safe, human readable note when the engine is unusable. */
  readonly detail?: string;
}

/**
 * Engine adapter contract.
 * TRequest is the adapter's own typed request, TOutput its parsed result.
 */
export interface EngineAdapter<TRequest = unknown, TOutput = unknown> {
  readonly id: EngineId;
  /** Capabilities this adapter claims to provide once healthy. */
  readonly capabilities: readonly EngineCapabilityId[];
  /** Probe the installation. Must resolve, never throw. */
  health(): Promise<EngineHealth>;
  /** Reject an impossible request before any process is started. */
  validate(request: TRequest): void;
  /** Build the exact invocation. Pure, so it is fully unit testable. */
  plan(request: TRequest): Promise<ProcessRunRequest>;
  /** Turn a completed run into a typed result, or throw an EngineError. */
  parse(result: ProcessRunResult, request: TRequest): Promise<TOutput>;
  /** Convenience path: validate, plan, run, parse. */
  execute(request: TRequest, runner: ProcessRunner): Promise<TOutput>;
}

/** Anything the registry can store, regardless of its request and output types. */
export type AnyEngineAdapter = EngineAdapter<never, unknown>;
