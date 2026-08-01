/**
 * Security headers and CORS.
 * Responsibility: register @fastify/helmet with a strict baseline and @fastify/cors
 * with the configured origin allowlist. The API returns JSON and files only, so the
 * content security policy can stay tight.
 */
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/index.js';
import { API_VERSION_HEADER, REQUEST_ID_HEADER } from '../shared/constants.js';

export async function registerSecurity(app: FastifyInstance, config: AppConfig): Promise<void> {
  await app.register(helmet, {
    // The docs explorer needs inline styles and scripts, so CSP is relaxed only there
    // by @fastify/swagger-ui itself. Everything else stays locked down.
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'no-referrer' },
    hsts: config.isProduction ? { maxAge: 31_536_000, includeSubDomains: true } : false,
  });

  await app.register(cors, {
    origin: config.cors.origins,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', REQUEST_ID_HEADER],
    exposedHeaders: [REQUEST_ID_HEADER, API_VERSION_HEADER, 'Retry-After'],
    credentials: false,
    maxAge: 86_400,
  });
}
