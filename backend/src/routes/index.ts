/**
 * Route composition.
 * Responsibility: mount every module's routes at the correct prefix.
 * Platform probes live at the root; application routes live under /v1.
 * New modules are added here and nowhere else.
 */
import type { FastifyInstance } from 'fastify';
import { healthRoutes } from '../modules/health/health.routes.js';
import type { HealthService } from '../modules/health/health.service.js';
import { registryRoutes } from '../modules/registry/registry.routes.js';
import { pdfToImagesRoutes } from '../modules/pdf-to-images/pdf-to-images.routes.js';
import { pdfToImagesJobRoutes } from '../modules/pdf-to-images/pdf-to-images.job.routes.js';
import type { PdfToImagesService } from '../modules/pdf-to-images/pdf-to-images.service.js';
import type { PdfToImagesDispatcher } from '../modules/pdf-to-images/pdf-to-images.dispatcher.js';
import type { PdfToImagesDelivery } from '../modules/pdf-to-images/pdf-to-images.delivery.js';
import { downloadRoutes } from '../modules/download/download.routes.js';
import type { DownloadService } from '../modules/download/download.service.js';
import type { WorkspaceManager } from '../modules/workspace/workspace.manager.js';
import { API_V1_PREFIX } from '../shared/constants.js';

export interface RouteOptions {
  healthService: HealthService;
  pdfToImagesService: PdfToImagesService;
  pdfToImagesDispatcher: PdfToImagesDispatcher;
  pdfToImagesDelivery: PdfToImagesDelivery;
  downloadService: DownloadService;
  workspaces: WorkspaceManager;
}

export async function registerRoutes(
  app: FastifyInstance,
  options: RouteOptions,
): Promise<void> {
  // Root level, unversioned platform probes.
  await app.register(async (instance) => {
    await healthRoutes(instance, { healthService: options.healthService });
  });

  // Versioned application surface: registry discovery plus the tool routes.
  await app.register(
    async (instance) => {
      await registryRoutes(instance);
      await pdfToImagesRoutes(instance, { service: options.pdfToImagesService });
      await pdfToImagesJobRoutes(instance, {
        service: options.pdfToImagesService,
        dispatcher: options.pdfToImagesDispatcher,
        delivery: options.pdfToImagesDelivery,
        workspaces: options.workspaces,
      });
      await downloadRoutes(instance, { service: options.downloadService });
    },
    { prefix: API_V1_PREFIX },
  );
}

export { errorEnvelopeSchema } from './schemas.js';
