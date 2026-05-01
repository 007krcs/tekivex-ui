/**
 * Tekivex UI — engine/shaper/runs
 *
 * Split text into "runs" suitable for distinct rendering paths:
 *  • Latin / Common runs draw with PDF standard 14 fonts.
 *  • Complex-script runs (Devanagari, Bengali, Tamil, Arabic …) must be
 *    rasterized via the browser canvas (which has built-in shaping) and
 *    embedded as image XObjects.
 *
 * The split groups consecutive clusters of the same rendering disposition,
 * so a sentence like "Name: कृष्ण Krishna" yields three runs.
 */

import { splitClusters, type Cluster } from './clusters';
import { isComplexScript, type Script } from './scripts';

export type RunMode = 'simple' | 'complex';

export interface Run {
  /** Start index in the source string (inclusive). */
  start: number;
  /** End index in the source string (exclusive). */
  end: number;
  /** Substring covered by this run. */
  text: string;
  mode: RunMode;
  /** Dominant script of the run. */
  script: Script;
}

/**
 * Partition a string into Latin/Common runs and complex-script runs. A Common
 * cluster between two complex clusters is folded into the complex run so a
 * space inside Devanagari prose doesn't fragment rendering.
 */
export function splitRuns(text: string): Run[] {
  const clusters = splitClusters(text);
  if (clusters.length === 0) return [];

  const runs: Run[] = [];
  let current: Run | null = null;

  const dispositionOf = (c: Cluster): RunMode =>
    isComplexScript(c.script) ? 'complex' : 'simple';

  for (let idx = 0; idx < clusters.length; idx++) {
    const c = clusters[idx];
    let mode: RunMode = dispositionOf(c);
    // Common cluster: inherit from the previous run if it was complex AND
    // there is another complex cluster ahead — otherwise stay simple. This
    // keeps "देव नागरी" as one complex run while leaving "Krishna आ" split.
    if (c.script === 'Common' && current && current.mode === 'complex') {
      let hasComplexAhead = false;
      for (let j = idx + 1; j < clusters.length; j++) {
        if (isComplexScript(clusters[j].script)) {
          hasComplexAhead = true;
          break;
        }
        if (clusters[j].script === 'Latin') break;
      }
      if (hasComplexAhead) mode = 'complex';
    }
    if (current && current.mode === mode) {
      current.end = c.end;
      current.text += c.text;
      // Promote dominant script: prefer a non-Common script
      if (current.script === 'Common') current.script = c.script;
    } else {
      if (current) runs.push(current);
      current = {
        start: c.start,
        end: c.end,
        text: c.text,
        mode,
        script: c.script,
      };
    }
  }
  if (current) runs.push(current);
  return runs;
}
