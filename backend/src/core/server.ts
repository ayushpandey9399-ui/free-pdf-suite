/**
 * Server bootstrap.
 * Responsibility: build the app, start listening, wire graceful shutdown so the
 * instance drains readiness before closing sockets, and report a clear startup log.
 */
import { getConfig } from '../config/index.js';
import { buildApp } from './app.js';
import { ShutdownManager } from './shutdown.js';
import { SERVICE_PHASE, SERVICE_VERSION } from './version.js';
import { DOCS_PREFIX } from '../shared/constants.js';
import { delay } from '../utils/time.js';

export async function startServer(): Promise<void> {
  const config = getConfig();
  const { app, healthService } = await buildApp({ config });

  const shutdown = new ShutdownManager({
    logger: app.log,
    timeoutMs: config.server.shutdownTimeoutMs,
  });

  // Fail readiness first so the load balancer stops sending traffic, then close.
  shutdown.register({
    name: 'http-server',
    dispose: async () => {
      healthService.startDraining();
      await delay(250);
      await app.close();
    },
  });

  shutdown.listen();

  await app.listen({ host: config.server.host, port: config.server.port });

  app.log.info(
    {
      version: SERVICE_VERSION,
      phase: SERVICE_PHASE,
      env: config.env,
      address: `http://${config.server.host}:${config.server.port}`,
      docs: config.docs.enabled ? DOCS_PREFIX : 'disabled',
      maxUploadBytes: config.upload.maxFileBytes,
    },
    'FreePDFHub API listening',
  );
}
