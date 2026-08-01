/**
 * Plugin registration.
 * Responsibility: register framework plugins in a deterministic order.
 * Security first, then throttling, then body parsing, then documentation.
 */
import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/index.js';
import { registerMultipart } from './multipart.plugin.js';
import { registerRateLimit } from './rate-limit.plugin.js';
import { registerSecurity } from './security.plugin.js';
import { registerSwagger } from './swagger.plugin.js';

export async function registerPlugins(
  app: FastifyInstance,
  config: AppConfig,
  version: string,
): Promise<void> {
  await registerSecurity(app, config);
  await registerRateLimit(app, config);
  await registerMultipart(app, config);
  await registerSwagger(app, config, version);
}

export { registerMultipart, registerRateLimit, registerSecurity, registerSwagger };
