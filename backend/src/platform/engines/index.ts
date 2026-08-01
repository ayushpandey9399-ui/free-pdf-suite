/**
 * Engine layer public surface.
 * Responsibility: expose the engine contracts, the error vocabulary, the registry and a
 * factory that builds the registry with every engine the deployment recognises.
 *
 * Architecture Notes
 * The factory is here so callers never assemble the engine list themselves: which engines
 * exist is a property of the platform, and a route or tool that could add its own would break
 * the guarantee that capability routing is identical across the process.
 */
export { EngineError, EngineErrorCode, isEngineError } from './engine.errors.js';
export type { EngineErrorCodeValue, EngineErrorOptions } from './engine.errors.js';
export { NotImplementedEngineAdapter } from './engine.base.js';
export { EngineRegistry } from './engine.registry.js';
export type {
  AnyEngineAdapter,
  EngineAdapter,
  EngineCapabilityId,
  EngineHealth,
  EngineId,
} from './engine.types.js';

import { EngineRegistry } from './engine.registry.js';
import type { AnyEngineAdapter } from './engine.types.js';
import type { ProcessRunner } from '../process/process.types.js';
import { PopplerAdapter } from './poppler/index.js';
import { GhostscriptAdapter } from './ghostscript/ghostscript.adapter.js';
import { QpdfAdapter } from './qpdf/qpdf.adapter.js';
import { LibreOfficeAdapter } from './libreoffice/libreoffice.adapter.js';
import { ImageMagickAdapter } from './imagemagick/imagemagick.adapter.js';
import { TesseractAdapter } from './tesseract/tesseract.adapter.js';

/** Build the frozen registry of every recognised engine. */
export function createEngineRegistry(runner: ProcessRunner): EngineRegistry {
  const adapters: readonly AnyEngineAdapter[] = [
    new PopplerAdapter({ runner }) as unknown as AnyEngineAdapter,
    new GhostscriptAdapter(),
    new QpdfAdapter(),
    new LibreOfficeAdapter(),
    new ImageMagickAdapter(),
    new TesseractAdapter(),
  ];
  return new EngineRegistry(adapters);
}
