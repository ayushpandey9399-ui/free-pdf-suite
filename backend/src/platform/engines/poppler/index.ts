/**
 * Poppler engine public surface.
 * Responsibility: expose the adapter and its request and output types, and nothing else.
 *
 * Architecture Notes
 * Callers depend on this barrel so the internal split into binary discovery, capabilities,
 * health, planning, parsing and error mapping stays private and refactorable.
 */
export { PopplerAdapter } from './poppler.adapter.js';
export type { PopplerAdapterOptions } from './poppler.adapter.js';
export { PopplerBinaryLocator, POPPLER_BINARIES } from './poppler.binary.js';
export type { PopplerBinaryName } from './poppler.binary.js';
export {
  POPPLER_CAPABILITIES,
  EMPTY_POPPLER_CAPABILITIES,
  detectPopplerCapabilities,
  supportsFormat,
} from './poppler.capabilities.js';
export type { PopplerCapabilities, PopplerImageFormat } from './poppler.capabilities.js';
export { PopplerHealthProbe, extractVersion } from './poppler.health.js';
export type { PopplerHealthReport } from './poppler.health.js';
export {
  buildRasterArgs,
  buildRasterRunRequest,
  buildInfoRunRequest,
  validateRasterRequest,
} from './poppler.execution.js';
export type { PopplerCropBox, PopplerRasterRequest } from './poppler.execution.js';
export {
  collectRasterOutput,
  parseDocumentInfo,
  parsePageNumber,
  extensionsForFormat,
} from './poppler.parser.js';
export type {
  PopplerDocumentInfo,
  PopplerOutputFile,
  PopplerRasterOutput,
} from './poppler.parser.js';
export { classifyPopplerStderr, toPopplerError, emptyOutputError } from './poppler.errors.js';
