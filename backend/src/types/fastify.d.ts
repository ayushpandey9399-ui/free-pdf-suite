/**
 * Fastify type augmentation.
 * Responsibility: declare the extra request properties this application attaches,
 * so middlewares and handlers stay fully typed.
 */
import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    /** High resolution start mark set by the request context middleware. */
    startedAt?: bigint;
  }
}
