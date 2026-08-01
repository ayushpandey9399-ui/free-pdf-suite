/**
 * System information provider.
 * Responsibility: read process and host level runtime facts used by health reporting.
 * Pure reads only, no side effects, so probes stay cheap and safe to call often.
 */
import os from 'node:os';
import { MIB } from '../utils/bytes.js';

export interface SystemSnapshot {
  readonly node: string;
  readonly platform: string;
  readonly arch: string;
  readonly cpuCount: number;
  readonly uptimeSeconds: number;
  readonly loadAverage1m: number;
  readonly memory: {
    readonly rssMb: number;
    readonly heapUsedMb: number;
    readonly heapTotalMb: number;
    readonly systemFreeMb: number;
    readonly systemTotalMb: number;
  };
}

function toMb(bytes: number): number {
  return Number((bytes / MIB).toFixed(1));
}

export function readSystemSnapshot(): SystemSnapshot {
  const memory = process.memoryUsage();
  const load = os.loadavg();

  return {
    node: process.versions.node,
    platform: process.platform,
    arch: process.arch,
    cpuCount: os.cpus().length,
    uptimeSeconds: Number(process.uptime().toFixed(1)),
    loadAverage1m: Number((load[0] ?? 0).toFixed(2)),
    memory: {
      rssMb: toMb(memory.rss),
      heapUsedMb: toMb(memory.heapUsed),
      heapTotalMb: toMb(memory.heapTotal),
      systemFreeMb: toMb(os.freemem()),
      systemTotalMb: toMb(os.totalmem()),
    },
  };
}
