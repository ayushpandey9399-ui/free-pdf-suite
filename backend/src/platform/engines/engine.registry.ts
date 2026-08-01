/**
 * Engine registry.
 * Responsibility: hold one instance of every engine adapter, answer lookups by id and by
 * capability, and aggregate health across all of them.
 *
 * Architecture Notes
 * The registry is built once and frozen. Engines are process wide, stateless facades over
 * binaries installed in the image, so there is no reason for them to be created per request
 * and every reason to prevent late mutation: capability routing must be a deterministic
 * property of a deployed image, not something a request can alter.
 */
import { EngineError, EngineErrorCode } from './engine.errors.js';
import type {
  AnyEngineAdapter,
  EngineAdapter,
  EngineCapabilityId,
  EngineHealth,
  EngineId,
} from './engine.types.js';

export class EngineRegistry {
  private readonly engines: ReadonlyMap<EngineId, AnyEngineAdapter>;

  constructor(adapters: readonly AnyEngineAdapter[]) {
    const map = new Map<EngineId, AnyEngineAdapter>();
    for (const adapter of adapters) {
      if (map.has(adapter.id)) {
        throw new EngineError(`Engine "${adapter.id}" is registered twice`, {
          engineId: adapter.id,
          code: EngineErrorCode.ENGINE_INVALID_REQUEST,
        });
      }
      map.set(adapter.id, adapter);
    }
    this.engines = map;
    Object.freeze(this);
  }

  /** Every registered engine, ordered by id for deterministic output. */
  public list(): readonly AnyEngineAdapter[] {
    return [...this.engines.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  public has(id: EngineId): boolean {
    return this.engines.has(id);
  }

  /** Look up an engine, throwing when the id is unknown. */
  public require<TRequest, TOutput>(id: EngineId): EngineAdapter<TRequest, TOutput> {
    const adapter = this.engines.get(id);
    if (adapter === undefined) {
      throw new EngineError(`Engine "${id}" is not registered`, {
        engineId: id,
        code: EngineErrorCode.ENGINE_NOT_INSTALLED,
      });
    }
    return adapter as unknown as EngineAdapter<TRequest, TOutput>;
  }

  /** Engines that declare the given capability, in registration order by id. */
  public providersOf(capability: EngineCapabilityId): readonly AnyEngineAdapter[] {
    return this.list().filter((adapter) => adapter.capabilities.includes(capability));
  }

  /** Health of every engine. Never throws, a failing probe becomes an unhealthy report. */
  public async healthAll(): Promise<readonly EngineHealth[]> {
    return Promise.all(
      this.list().map(async (adapter) => {
        try {
          return await adapter.health();
        } catch (error) {
          return {
            engineId: adapter.id,
            installed: false,
            version: '',
            binaries: {},
            capabilities: [],
            lastCheckedMs: Date.now(),
            detail: `Health probe failed: ${error instanceof Error ? error.name : 'unknown error'}`,
          } satisfies EngineHealth;
        }
      }),
    );
  }

  public size(): number {
    return this.engines.size;
  }
}
