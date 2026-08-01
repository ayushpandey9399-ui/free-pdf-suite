/**
 * QPDF adapter placeholder.
 * Responsibility: reserve the structural PDF engine identity and its capabilities.
 *
 * Architecture Notes
 * QPDF owns lossless structural work in the approved engine matrix: encryption, decryption,
 * linearisation and page assembly. It is reserved so that secure tools can declare their
 * required capabilities against a registered provider before the adapter exists, and so
 * health reports the missing implementation rather than a missing engine.
 */
import { NotImplementedEngineAdapter } from '../engine.base.js';
import type { EngineCapabilityId, EngineId } from '../engine.types.js';

export class QpdfAdapter extends NotImplementedEngineAdapter {
  public readonly id: EngineId = 'qpdf';
  public readonly capabilities: readonly EngineCapabilityId[] = Object.freeze([
    'pdf.encrypt',
    'pdf.decrypt',
    'pdf.assemble',
    'pdf.inspect',
  ]);
  protected readonly plannedPhase = 'the QPDF adapter phase';
}
