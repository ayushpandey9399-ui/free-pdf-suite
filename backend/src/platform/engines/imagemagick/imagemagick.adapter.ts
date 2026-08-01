/**
 * ImageMagick adapter placeholder.
 * Responsibility: reserve the raster image manipulation engine identity.
 *
 * Architecture Notes
 * ImageMagick is the general image engine in the approved matrix and the one with the widest
 * historical attack surface, so the architecture always fronts it with strict policy limits.
 * Reserving the adapter keeps image tool manifests expressible today while making clear, via
 * health, that no image work can run until the adapter and its policy file are implemented.
 */
import { NotImplementedEngineAdapter } from '../engine.base.js';
import type { EngineCapabilityId, EngineId } from '../engine.types.js';

export class ImageMagickAdapter extends NotImplementedEngineAdapter {
  public readonly id: EngineId = 'imagemagick';
  public readonly capabilities: readonly EngineCapabilityId[] = Object.freeze([
    'image.convert',
    'image.resize',
    'image.compress',
  ]);
  protected readonly plannedPhase = 'the ImageMagick adapter phase';
}
