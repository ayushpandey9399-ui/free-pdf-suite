/**
 * Error and not found handlers.
 * Responsibility: convert anything thrown anywhere in the request lifecycle into the
 * single public error envelope, log unexpected faults at error level, and never leak
 * stack traces or internal messages to clients in production.
 */
import type { FastifyError, FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { AppError, ErrorCode, errors, isAppError } from '../core/errors.js';
import { HttpStatus } from '../shared/http-status.js';

/** Map framework and library errors onto the AppError contract. */
function normalize(error: unknown): AppError {
  if (isAppError(error)) return error;

  if (error instanceof ZodError) {
    return errors.validation(
      'Request validation failed',
      error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    );
  }

  const fastifyError = error as FastifyError;

  // Fastify and plugin error codes that have an honest public meaning.
  switch (fastifyError.code) {
    case 'FST_ERR_CTP_BODY_TOO_LARGE':
    case 'FST_REQ_FILE_TOO_LARGE':
      return errors.payloadTooLarge();
    case 'FST_ERR_CTP_INVALID_MEDIA_TYPE':
      return errors.unsupportedInput();
    case 'FST_ERR_VALIDATION':
      return errors.validation(fastifyError.message);
    case 'FST_ERR_BAD_STATUS_CODE':
      break;
    default:
      break;
  }

  if (fastifyError.statusCode === HttpStatus.TOO_MANY_REQUESTS) {
    return errors.rateLimited(fastifyError.message);
  }

  if (
    typeof fastifyError.statusCode === 'number' &&
    fastifyError.statusCode >= 400 &&
    fastifyError.statusCode < 500
  ) {
    return new AppError(fastifyError.message, {
      code: ErrorCode.E_BAD_REQUEST,
      status: fastifyError.statusCode as never,
    });
  }

  return errors.internal(undefined, error);
}

export function registerErrorHandler(app: FastifyInstance, isProduction: boolean): void {
  app.setErrorHandler((error, request, reply) => {
    const appError = normalize(error);

    if (appError.expected) {
      request.log.warn(
        { code: appError.code, status: appError.status, err: error },
        'request rejected',
      );
    } else {
      request.log.error({ code: appError.code, err: error }, 'request failed unexpectedly');
    }

    const payload = appError.toPayload(String(request.id));

    // In development the original message helps debugging; production stays generic.
    if (!isProduction && !appError.expected) {
      payload.error.details = { reason: error instanceof Error ? error.message : String(error) };
    }

    void reply.status(appError.status).send(payload);
  });

  app.setNotFoundHandler((request, reply) => {
    const appError = errors.routeNotFound(request.method, request.url);
    void reply.status(appError.status).send(appError.toPayload(String(request.id)));
  });
}
