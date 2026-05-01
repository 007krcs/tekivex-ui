/**
 * Tekivex UI — engine/shaper
 *
 * Indic / complex-script support for the biodata renderer. Three concerns:
 *
 *   1. Script detection — given a string, identify which Unicode scripts it
 *      contains and whether any of them require complex shaping (cluster
 *      reorder, conjunct formation, matra placement).
 *   2. Cluster grouping — partition a string into atomic shaping units so
 *      the layout engine never wraps or splits inside a cluster.
 *   3. Run partitioning — group consecutive clusters into "simple" runs that
 *      can draw via PDF standard 14 fonts and "complex" runs that the
 *      browser canvas must rasterize first.
 *
 * Plus a browser-only rasterize helper that converts a complex run into a
 * JPEG byte sequence the PDF document embeds via /DCTDecode.
 */

export {
  scriptOf,
  isComplexScript,
  hasComplexScript,
  isRtl,
} from './scripts';
export type { Script } from './scripts';

export { categorize, splitClusters } from './clusters';
export type { CharCategory, Cluster } from './clusters';

export { splitRuns } from './runs';
export type { Run, RunMode } from './runs';

export { rasterizeText } from './rasterize';
export type { RasterizeOptions, RasterizedText } from './rasterize';
