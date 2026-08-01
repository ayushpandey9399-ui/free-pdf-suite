/**
 * Health route schemas.
 * Responsibility: declare response shapes so the probes are self documenting in
 * OpenAPI and so responses are serialized by a fast, fixed schema.
 */
const dependencySchema = {
  type: 'object',
  required: ['name', 'status', 'required'],
  properties: {
    name: { type: 'string' },
    status: { type: 'string', enum: ['up', 'down', 'degraded', 'not_wired'] },
    required: { type: 'boolean' },
    detail: { type: 'string' },
    latencyMs: { type: 'number' },
  },
} as const;

export const healthResponseSchema = {
  type: 'object',
  required: ['status', 'service', 'version', 'env', 'phase', 'timestamp', 'system', 'dependencies'],
  properties: {
    status: { type: 'string', enum: ['ok', 'degraded', 'error'] },
    service: { type: 'string' },
    version: { type: 'string' },
    env: { type: 'string' },
    phase: { type: 'string' },
    timestamp: { type: 'string' },
    system: {
      type: 'object',
      required: ['node', 'platform', 'arch', 'cpuCount', 'uptimeSeconds', 'memory'],
      properties: {
        node: { type: 'string' },
        platform: { type: 'string' },
        arch: { type: 'string' },
        cpuCount: { type: 'integer' },
        uptimeSeconds: { type: 'number' },
        loadAverage1m: { type: 'number' },
        memory: {
          type: 'object',
          properties: {
            rssMb: { type: 'number' },
            heapUsedMb: { type: 'number' },
            heapTotalMb: { type: 'number' },
            systemFreeMb: { type: 'number' },
            systemTotalMb: { type: 'number' },
          },
        },
      },
    },
    dependencies: { type: 'array', items: dependencySchema },
  },
} as const;

export const readinessResponseSchema = {
  type: 'object',
  required: ['status', 'timestamp', 'dependencies'],
  properties: {
    status: { type: 'string', enum: ['ready', 'not_ready'] },
    timestamp: { type: 'string' },
    dependencies: { type: 'array', items: dependencySchema },
  },
} as const;

export const livenessResponseSchema = {
  type: 'object',
  required: ['status', 'uptimeSeconds', 'timestamp'],
  properties: {
    status: { type: 'string', enum: ['alive'] },
    uptimeSeconds: { type: 'number' },
    timestamp: { type: 'string' },
  },
} as const;
