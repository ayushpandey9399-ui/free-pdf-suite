/**
 * Tesseract adapter placeholder.
 * Responsibility: reserve the OCR engine identity and its capabilities.
 *
 * Architecture Notes
 * OCR is the only engine whose runtime scales with page count and language data rather than
 * file size, which is why the architecture gives it a dedicated worker class and its own
 * timeout profile. The adapter is reserved so OCR tools can declare "ocr.recognize" against a
 * registered provider, and so readiness can state plainly that OCR is unavailable.
 */
import { NotImplementedEngineAdapter } from '../engine.base.js';
import type { EngineCapabilityId, EngineId } from '../engine.types.js';

export class TesseractAdapter extends NotImplementedEngineAdapter {
  public readonly id: EngineId = 'tesseract';
  public readonly capabilities: readonly EngineCapabilityId[] = Object.freeze([
    'ocr.recognize',
    'ocr.pdf.searchable',
  ]);
  protected readonly plannedPhase = 'the Tesseract adapter phase';
}
