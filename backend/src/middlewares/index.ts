/**
 * Middleware registration.
 * Responsibility: apply cross cutting request behaviour in a fixed, explicit order.
 */
import type { FastifyInstance } from 'fastify';
import { registerErrorHandler } from './error-handler.middleware.js';
import { registerRequestContext } from './request-context.middleware.js';

export interface MiddlewareOptions {
  apiVersion: string;
  isProduction: boolean;
}

export function registerMiddlewares(app: FastifyInstance, options: MiddlewareOptions): void {
  registerRequestContext(app, options.apiVersion);
  registerErrorHandler(app, options.isProduction);
}

export { registerErrorHandler, registerRequestContext };
