/**
 * Tekivex UI — engine/shaper/clusters
 *
 * Indic cluster grouping. A "cluster" is the smallest unit you should never
 * split — typically a base consonant plus its dependent matras, marks, halant
 * conjunct sequences, and joiners. Word-wrap and reordering both operate on
 * cluster boundaries.
 *
 * Each Indic block follows the same layout: BASE + MATRAS + MARKS, with halant
 * (virama) joining successive consonants into conjuncts. The relevant offsets
 * within each block are nearly identical, so the rules below are written
 * generically over a "block start" code point.
 */

import { scriptOf, type Script } from './scripts';

/** Code-point category for shaping. */
export type CharCategory =
  | 'Base'
  | 'Matra'
  | 'Halant'
  | 'Mark'
  | 'Joiner'
  | 'Digit'
  | 'Other';

const ZWJ = 0x200d;
const ZWNJ = 0x200c;

/** Map a code point to its shaping category for the given Indic script. */
export function categorize(cp: number): CharCategory {
  if (cp === ZWJ || cp === ZWNJ) return 'Joiner';

  const script = scriptOf(cp);
  // Each Indic Unicode block layout (per UAX): we use the offset within the
  // block to classify. Non-Indic scripts are 'Other'.
  switch (script) {
    case 'Devanagari':
      return classifyDevanagari(cp);
    case 'Bengali':
      return classifyBengali(cp);
    case 'Gurmukhi':
      return classifyGurmukhi(cp);
    case 'Gujarati':
      return classifyGujarati(cp);
    case 'Oriya':
      return classifyOriya(cp);
    case 'Tamil':
      return classifyTamil(cp);
    case 'Telugu':
      return classifyTelugu(cp);
    case 'Kannada':
      return classifyKannada(cp);
    case 'Malayalam':
      return classifyMalayalam(cp);
    default:
      return 'Other';
  }
}

/* -------------------------------------------------------------------------- */
/* Per-script classifiers — share a generic shape                              */
/* -------------------------------------------------------------------------- */

function classifyDevanagari(cp: number): CharCategory {
  // 0900 vedic + signs/marks
  if (cp === 0x094d) return 'Halant'; // virama
  if (cp >= 0x0900 && cp <= 0x0903) return 'Mark'; // signs
  if (cp >= 0x0904 && cp <= 0x0939) return 'Base'; // vowels (independent) + consonants
  if (cp === 0x093a || cp === 0x093b) return 'Matra';
  if (cp === 0x093c) return 'Mark'; // nukta
  if (cp >= 0x093e && cp <= 0x094c) return 'Matra'; // dependent vowel signs
  if (cp >= 0x0951 && cp <= 0x0957) return 'Mark';
  if (cp >= 0x0958 && cp <= 0x0961) return 'Base';
  if (cp >= 0x0962 && cp <= 0x0963) return 'Matra';
  if (cp >= 0x0966 && cp <= 0x096f) return 'Digit';
  return 'Other';
}

function classifyBengali(cp: number): CharCategory {
  if (cp === 0x09cd) return 'Halant';
  if (cp >= 0x0980 && cp <= 0x0983) return 'Mark';
  if (cp >= 0x0985 && cp <= 0x09b9) return 'Base';
  if (cp === 0x09bc) return 'Mark';
  if (cp >= 0x09be && cp <= 0x09cc) return 'Matra';
  if (cp === 0x09d7) return 'Matra'; // au length mark
  if (cp >= 0x09dc && cp <= 0x09e1) return 'Base';
  if (cp >= 0x09e2 && cp <= 0x09e3) return 'Matra';
  if (cp >= 0x09e6 && cp <= 0x09ef) return 'Digit';
  return 'Other';
}

function classifyGurmukhi(cp: number): CharCategory {
  if (cp === 0x0a4d) return 'Halant';
  if (cp >= 0x0a01 && cp <= 0x0a03) return 'Mark';
  if (cp >= 0x0a05 && cp <= 0x0a39) return 'Base';
  if (cp === 0x0a3c) return 'Mark';
  if (cp >= 0x0a3e && cp <= 0x0a4c) return 'Matra';
  if (cp >= 0x0a59 && cp <= 0x0a5e) return 'Base';
  if (cp >= 0x0a66 && cp <= 0x0a6f) return 'Digit';
  return 'Other';
}

function classifyGujarati(cp: number): CharCategory {
  if (cp === 0x0acd) return 'Halant';
  if (cp >= 0x0a81 && cp <= 0x0a83) return 'Mark';
  if (cp >= 0x0a85 && cp <= 0x0ab9) return 'Base';
  if (cp === 0x0abc) return 'Mark';
  if (cp >= 0x0abe && cp <= 0x0acc) return 'Matra';
  if (cp >= 0x0ae0 && cp <= 0x0ae3) return 'Base';
  if (cp >= 0x0ae6 && cp <= 0x0aef) return 'Digit';
  return 'Other';
}

function classifyOriya(cp: number): CharCategory {
  if (cp === 0x0b4d) return 'Halant';
  if (cp >= 0x0b01 && cp <= 0x0b03) return 'Mark';
  if (cp >= 0x0b05 && cp <= 0x0b39) return 'Base';
  if (cp === 0x0b3c) return 'Mark';
  if (cp >= 0x0b3e && cp <= 0x0b4c) return 'Matra';
  if (cp >= 0x0b5c && cp <= 0x0b61) return 'Base';
  if (cp >= 0x0b66 && cp <= 0x0b6f) return 'Digit';
  return 'Other';
}

function classifyTamil(cp: number): CharCategory {
  if (cp === 0x0bcd) return 'Halant';
  if (cp >= 0x0b82 && cp <= 0x0b83) return 'Mark';
  if (cp >= 0x0b85 && cp <= 0x0bb9) return 'Base';
  if (cp >= 0x0bbe && cp <= 0x0bcc) return 'Matra';
  if (cp === 0x0bd7) return 'Matra';
  if (cp >= 0x0be6 && cp <= 0x0bef) return 'Digit';
  return 'Other';
}

function classifyTelugu(cp: number): CharCategory {
  if (cp === 0x0c4d) return 'Halant';
  if (cp >= 0x0c01 && cp <= 0x0c03) return 'Mark';
  if (cp >= 0x0c05 && cp <= 0x0c39) return 'Base';
  if (cp >= 0x0c3e && cp <= 0x0c4c) return 'Matra';
  if (cp >= 0x0c55 && cp <= 0x0c56) return 'Mark';
  if (cp >= 0x0c66 && cp <= 0x0c6f) return 'Digit';
  return 'Other';
}

function classifyKannada(cp: number): CharCategory {
  if (cp === 0x0ccd) return 'Halant';
  if (cp >= 0x0c81 && cp <= 0x0c83) return 'Mark';
  if (cp >= 0x0c85 && cp <= 0x0cb9) return 'Base';
  if (cp === 0x0cbc) return 'Mark';
  if (cp >= 0x0cbe && cp <= 0x0ccc) return 'Matra';
  if (cp >= 0x0cd5 && cp <= 0x0cd6) return 'Mark';
  if (cp >= 0x0ce6 && cp <= 0x0cef) return 'Digit';
  return 'Other';
}

function classifyMalayalam(cp: number): CharCategory {
  if (cp === 0x0d4d) return 'Halant';
  if (cp >= 0x0d01 && cp <= 0x0d03) return 'Mark';
  if (cp >= 0x0d05 && cp <= 0x0d39) return 'Base';
  if (cp >= 0x0d3e && cp <= 0x0d4c) return 'Matra';
  if (cp === 0x0d57) return 'Matra';
  if (cp >= 0x0d66 && cp <= 0x0d6f) return 'Digit';
  return 'Other';
}

/* -------------------------------------------------------------------------- */
/* Cluster boundary algorithm                                                  */
/* -------------------------------------------------------------------------- */

export interface Cluster {
  /** Code-point indices in the source string this cluster spans (start incl, end excl). */
  start: number;
  end: number;
  /** The cluster's characters joined back together. */
  text: string;
  /** Script of the first non-Common character in the cluster. */
  script: Script;
}

/**
 * Split text into clusters along Indic shaping boundaries. The rule set:
 *
 *  • A run of Common characters (whitespace, ASCII punctuation, digits) is a
 *    single cluster of script 'Common'.
 *  • A Latin run is a single cluster.
 *  • Within an Indic script, a cluster starts at any Base or independent
 *    vowel, and continues while the next character is a Matra, Mark, Halant,
 *    Joiner, or — when preceded by a Halant — another Base (the conjunct
 *    case).
 *  • A change of script always forces a new cluster.
 */
export function splitClusters(text: string): Cluster[] {
  if (!text) return [];
  const out: Cluster[] = [];
  let i = 0;
  const n = text.length;

  const cpAt = (idx: number): { cp: number; size: number } => {
    const cp = text.codePointAt(idx) ?? text.charCodeAt(idx);
    return { cp, size: cp > 0xffff ? 2 : 1 };
  };

  while (i < n) {
    const { cp: firstCp, size: firstSize } = cpAt(i);
    const firstScript = scriptOf(firstCp);
    const firstCat = categorize(firstCp);

    // Common run — gather contiguous Common characters
    if (firstScript === 'Common') {
      const start = i;
      while (i < n) {
        const { cp, size } = cpAt(i);
        if (scriptOf(cp) !== 'Common') break;
        i += size;
      }
      out.push({ start, end: i, text: text.slice(start, i), script: 'Common' });
      continue;
    }

    // Latin (or any non-complex non-Common script) — gather a same-script run,
    // splitting on whitespace boundaries via the Common rule above.
    if (firstScript === 'Latin' || firstScript === 'Unknown') {
      const start = i;
      while (i < n) {
        const { cp, size } = cpAt(i);
        const s = scriptOf(cp);
        if (s !== firstScript) break;
        i += size;
      }
      out.push({ start, end: i, text: text.slice(start, i), script: firstScript });
      continue;
    }

    // Indic / complex script — start a cluster.
    const start = i;
    let lastCat: CharCategory = firstCat;
    i += firstSize;

    while (i < n) {
      const { cp, size } = cpAt(i);
      const s = scriptOf(cp);
      if (s !== firstScript && s !== 'Common') break;
      const cat = categorize(cp);
      // A new Base ends the cluster unless the previous char was a Halant
      // (in which case we have a conjunct: keep extending).
      if (cat === 'Base' && lastCat !== 'Halant') break;
      // Common chars in the middle of a complex run also break the cluster.
      if (s === 'Common') break;
      i += size;
      lastCat = cat;
    }
    out.push({ start, end: i, text: text.slice(start, i), script: firstScript });
  }
  return out;
}
