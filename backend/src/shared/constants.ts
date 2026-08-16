/**
 * Cross cutting constants.
 * Responsibility: fixed names and header keys shared by plugins, middlewares and modules.
 * Nothing environment specific belongs here, that lives in src/config.
 */

/** Header carrying the correlation id in and out of the API. */
export const REQUEST_ID_HEADER = 'x-request-id';

/** Header used to advertise the API version to clients. */
export const API_VERSION_HEADER = 'x-api-version';

/** Mount point for versioned application routes. */
export const API_V1_PREFIX = '/v1';

/** Route prefix for the OpenAPI explorer. */
export const DOCS_PREFIX = '/docs';

/** Log fields that must never be written in clear text. */
export const REDACTED_LOG_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'res.headers["set-cookie"]',
  'password',
  '*.password',
] as const;

/** Machine readable identity of this service, surfaced by health endpoints. */
export const SERVICE_NAME = 'pdftoolconverteronline-api';
