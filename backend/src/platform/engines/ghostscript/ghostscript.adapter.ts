/**
 * Ghostscript adapter placeholder.
 * Responsibility: reserve the engine identity and its capabilities so tool manifests and
 * capability routing can be written now, while the implementation lands in a later phase.
 *
 * Architecture Notes
 * Ghostscript is the compression and PDF/A engine in the approved engine decision matrix. It
 * is reserved rather than omitted because a manifest that requires "pdf.compress" must be
 * resolvable against a registered provider from the moment the registry exists, and health
 * must report the gap honestly instead of the route failing with an unknown engine.
 */
import { NotImplementedEngineAdapter } from '../engine.base.js';
import type { EngineCapabilityId, EngineId } from '../engine.types.js';

export class GhostscriptAdapter extends NotImplementedEngineAdapter {
  public readonly id: EngineId = 'ghostscript';
  public readonly capabilities: readonly EngineCapabilityId[] = Object.freeze([
    'pdf.compress',
    'pdf.linearize',
    'pdf.pdfa',
    'pdf.raster',
  ]);
  protected readonly plannedPhase = 'the Ghostscript adapter phase';
}
