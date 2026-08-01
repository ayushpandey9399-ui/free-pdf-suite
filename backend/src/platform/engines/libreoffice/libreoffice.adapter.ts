/**
 * LibreOffice adapter placeholder.
 * Responsibility: reserve the office document conversion engine identity.
 *
 * Architecture Notes
 * LibreOffice is the office conversion engine in the approved matrix and the heaviest,
 * slowest and least predictable of them, which is why the architecture routes it to its own
 * worker class. Reserving the adapter now keeps that routing decision expressible in a tool
 * manifest before the implementation, and keeps its known cost visible in health output.
 */
import { NotImplementedEngineAdapter } from '../engine.base.js';
import type { EngineCapabilityId, EngineId } from '../engine.types.js';

export class LibreOfficeAdapter extends NotImplementedEngineAdapter {
  public readonly id: EngineId = 'libreoffice';
  public readonly capabilities: readonly EngineCapabilityId[] = Object.freeze([
    'office.to.pdf',
    'pdf.to.office',
  ]);
  protected readonly plannedPhase = 'the LibreOffice adapter phase';
}
