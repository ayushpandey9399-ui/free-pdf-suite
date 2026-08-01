/**
 * Not implemented engine base class.
 * Responsibility: give every engine that the architecture has reserved but not yet built a
 * compliant, honest implementation. Health reports the engine as unusable with a reason, and
 * every pipeline method throws a typed ENGINE_UNSUPPORTED_OPERATION.
 *
 * Architecture Notes
 * This class exists so a reserved engine is a real, typed object rather than a missing file
 * or a null in a map. Callers, health aggregation and the registry all behave identically for
 * a reserved engine and an implemented one, so the day Ghostscript is built the only change
 * is inside its adapter. It is the one intentional stub in the architecture: it never
 * pretends to succeed and never returns fabricated output.
 */
import { EngineError, EngineErrorCode } from './engine.errors.js';
import type {
  EngineAdapter,
  EngineCapabilityId,
  EngineHealth,
  EngineId,
} from './engine.types.js';
import type { ProcessRunRequest, ProcessRunResult, ProcessRunner } from '../process/process.types.js';

export abstract class NotImplementedEngineAdapter<TRequest = unknown, TOutput = unknown>
  implements EngineAdapter<TRequest, TOutput>
{
  public abstract readonly id: EngineId;
  /** Capabilities the engine will provide once implemented, declared for planning. */
  public abstract readonly capabilities: readonly EngineCapabilityId[];
  /** Phase in which this adapter is scheduled to be built. Surfaced in health detail. */
  protected abstract readonly plannedPhase: string;

  public async health(): Promise<EngineHealth> {
    return {
      engineId: this.id,
      installed: false,
      version: '',
      binaries: {},
      capabilities: [],
      lastCheckedMs: Date.now(),
      detail: `Adapter is reserved and not implemented yet, scheduled for ${this.plannedPhase}.`,
    };
  }

  public validate(_request: TRequest): void {
    throw this.unsupported();
  }

  public async plan(_request: TRequest): Promise<ProcessRunRequest> {
    throw this.unsupported();
  }

  public async parse(_result: ProcessRunResult, _request: TRequest): Promise<TOutput> {
    throw this.unsupported();
  }

  public async execute(_request: TRequest, _runner: ProcessRunner): Promise<TOutput> {
    throw this.unsupported();
  }

  private unsupported(): EngineError {
    return new EngineError(`Engine "${this.id}" is not implemented yet`, {
      engineId: this.id,
      code: EngineErrorCode.ENGINE_UNSUPPORTED_OPERATION,
    });
  }
}
