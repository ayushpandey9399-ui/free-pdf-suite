/**
 * Health service.
 * Responsibility: assemble health, readiness and liveness answers from platform
 * dependency probes and runtime facts. Contains no HTTP concerns.
 */
import type { DependencyHealth, DependencyProbe } from '../../platform/dependency.js';
import { readSystemSnapshot, type SystemSnapshot } from '../../platform/system.info.js';
import { nowIso } from '../../utils/time.js';

export type OverallStatus = 'ok' | 'degraded' | 'error';

export interface HealthReport {
  readonly status: OverallStatus;
  readonly service: string;
  readonly version: string;
  readonly env: string;
  readonly phase: string;
  readonly timestamp: string;
  readonly system: SystemSnapshot;
  readonly dependencies: readonly DependencyHealth[];
}

export interface ReadinessReport {
  readonly status: 'ready' | 'not_ready';
  readonly timestamp: string;
  readonly dependencies: readonly DependencyHealth[];
}

export interface LivenessReport {
  readonly status: 'alive';
  readonly uptimeSeconds: number;
  readonly timestamp: string;
}

export interface HealthServiceOptions {
  readonly service: string;
  readonly version: string;
  readonly env: string;
  readonly phase: string;
  readonly probes: readonly DependencyProbe[];
}

export class HealthService {
  private readonly options: HealthServiceOptions;
  /** Flipped to false during shutdown so the load balancer drains this instance. */
  private accepting = true;

  constructor(options: HealthServiceOptions) {
    this.options = options;
  }

  /** Mark the instance as draining; readiness starts failing immediately. */
  public startDraining(): void {
    this.accepting = false;
  }

  public isAccepting(): boolean {
    return this.accepting;
  }

  /** Run all probes, never throwing: a probe fault is reported as a down dependency. */
  private async probeAll(): Promise<DependencyHealth[]> {
    return Promise.all(
      this.options.probes.map(async (probe) => {
        try {
          return await probe.check();
        } catch (error) {
          return {
            name: probe.name,
            status: 'down' as const,
            required: probe.required,
            detail: error instanceof Error ? error.message : 'probe failed',
          };
        }
      }),
    );
  }

  public async health(): Promise<HealthReport> {
    const dependencies = await this.probeAll();
    const requiredDown = dependencies.some((dep) => dep.required && dep.status === 'down');
    const anyDegraded = dependencies.some((dep) => dep.status === 'degraded');

    return {
      status: requiredDown ? 'error' : anyDegraded ? 'degraded' : 'ok',
      service: this.options.service,
      version: this.options.version,
      env: this.options.env,
      phase: this.options.phase,
      timestamp: nowIso(),
      system: readSystemSnapshot(),
      dependencies,
    };
  }

  public async readiness(): Promise<ReadinessReport> {
    const dependencies = await this.probeAll();
    const blocked = dependencies.some((dep) => dep.required && dep.status !== 'up');
    return {
      status: this.accepting && !blocked ? 'ready' : 'not_ready',
      timestamp: nowIso(),
      dependencies,
    };
  }

  public liveness(): LivenessReport {
    return {
      status: 'alive',
      uptimeSeconds: Number(process.uptime().toFixed(1)),
      timestamp: nowIso(),
    };
  }
}
