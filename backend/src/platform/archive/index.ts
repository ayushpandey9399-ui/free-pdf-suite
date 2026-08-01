/**
 * Archive layer public surface.
 * Responsibility: single import point for artefact packaging, so tools never reach into a
 * format implementation directly.
 */
export {
  createStoredZip,
  readStoredZipEntryNames,
  ZipWriteError,
} from './zip.writer.js';
export type { ZipSourceEntry, ZipWriteResult } from './zip.writer.js';
