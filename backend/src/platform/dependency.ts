/**
 * Platform dependency contract.
 * Responsibility: describe an external dependency (Redis, storage volume, engine host)
 * and how its health is checked, so readiness aggregation does not care what it is.
 * Phase 0 ships the contract plus a static descriptor for Redis, which is provisioned
 * by Docker Compose but intentionally not connected to until the queue phase.
 */

export type DependencyStatus = 'up' | 'down' | 'degraded' | 'not_wired';

export interface DependencyHealth {
  readonly name: string;
  readonly status: DependencyStatus;
  /** true when readiness must fail if this dependency is not up. */
  readonly required: boolean;
  readonly detail?: string;
  readonly latencyMs?: number;
}

export interface DependencyProbe {
  readonly name: string;
  readonly required: boolean;
  /** Must resolve, never throw. Implementations own their own timeout. */
  check(): Promise<DependencyHealth>;
}

/**
 * Redis descriptor for Phase 0.
 * Reports "not_wired" on purpose: the container exists, the API opens no connection,
 * and readiness must not depend on something the application does not use yet.
 */
export function createRedisPlaceholderProbe(): DependencyProbe {
  return {
    name: 'redis',
    required: false,
    async check(): Promise<DependencyHealth> {
      return {
        name: 'redis',
        status: 'not_wired',
        required: false,
        detail: 'Provisioned for later phases. No client is connected in Phase 0.',
      };
    },
  };
}
