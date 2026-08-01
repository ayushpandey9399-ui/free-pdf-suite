/**
 * Poppler capability detection.
 * Responsibility: read what a specific Poppler build can actually do from its own help
 * output, instead of assuming the feature set of one distribution.
 *
 * Architecture Notes
 * Poppler builds differ: TIFF output, JPEG output and some page selection flags are all
 * optional at compile time. Planning an invocation around a flag the installed build does not
 * have produces a confusing usage error late, inside a user request. Detecting first turns
 * that into an honest capability report and a clean ENGINE_UNSUPPORTED_OPERATION.
 */
import type { EngineCapabilityId } from '../engine.types.js';

/** Raster output formats the adapter can request. */
export type PopplerImageFormat = 'png' | 'jpeg' | 'tiff';

export interface PopplerCapabilities {
  readonly formats: readonly PopplerImageFormat[];
  /** True when -f and -l page selection flags are available. */
  readonly pageSelection: boolean;
  /** True when -r resolution selection is available. */
  readonly resolution: boolean;
  /** True when -gray is available. */
  readonly grayscale: boolean;
  /** True when -mono is available. */
  readonly monochrome: boolean;
  /** True when -x -y -W -H cropping is available. */
  readonly cropping: boolean;
  /** True when -opw and -upw password flags are available. */
  readonly password: boolean;
}

/** Capabilities the engine advertises to the tool registry when healthy. */
export const POPPLER_CAPABILITIES: readonly EngineCapabilityId[] = Object.freeze([
  'pdf.raster',
  'pdf.inspect',
]);

/** Every flag is absent until the help output proves otherwise. */
export const EMPTY_POPPLER_CAPABILITIES: PopplerCapabilities = Object.freeze({
  formats: Object.freeze([]),
  pageSelection: false,
  resolution: false,
  grayscale: false,
  monochrome: false,
  cropping: false,
  password: false,
});

/**
 * Parse `pdftoppm -h` output.
 * Poppler prints usage on stderr, so callers pass both streams concatenated.
 */
export function detectPopplerCapabilities(helpOutput: string): PopplerCapabilities {
  const text = helpOutput.toLowerCase();
  const has = (flag: string): boolean => text.includes(flag);

  const formats: PopplerImageFormat[] = [];
  // PNG output is the baseline of every supported build.
  if (has('-png')) formats.push('png');
  if (has('-jpeg')) formats.push('jpeg');
  if (has('-tiff')) formats.push('tiff');

  return Object.freeze({
    formats: Object.freeze(formats),
    pageSelection: has('-f ') && has('-l '),
    resolution: has('-r '),
    grayscale: has('-gray'),
    monochrome: has('-mono'),
    cropping: has('-x ') && has('-y ') && has('-w ') && has('-h '),
    password: has('-upw') || has('-opw'),
  });
}

/** True when the build can produce the requested format. */
export function supportsFormat(
  capabilities: PopplerCapabilities,
  format: PopplerImageFormat,
): boolean {
  return capabilities.formats.includes(format);
}
