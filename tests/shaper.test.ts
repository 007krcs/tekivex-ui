import { describe, it, expect } from 'vitest';
import {
  scriptOf,
  hasComplexScript,
  isRtl,
  isComplexScript,
  categorize,
  splitClusters,
  splitRuns,
} from '../src/engine/shaper';

const cp = (s: string): number => s.codePointAt(0) ?? 0;

/* -------------------------------------------------------------------------- */
/* scriptOf                                                                    */
/* -------------------------------------------------------------------------- */

describe('engine/shaper — scriptOf', () => {
  it('detects Latin', () => {
    expect(scriptOf(cp('A'))).toBe('Latin');
    expect(scriptOf(cp('z'))).toBe('Latin');
    expect(scriptOf(cp('é'))).toBe('Latin');
  });

  it('classifies ASCII space, digits and punctuation as Common', () => {
    expect(scriptOf(0x20)).toBe('Common');
    expect(scriptOf(cp('5'))).toBe('Common');
    expect(scriptOf(cp(','))).toBe('Common');
  });

  it('detects Devanagari', () => {
    expect(scriptOf(cp('क'))).toBe('Devanagari');
    expect(scriptOf(cp('ा'))).toBe('Devanagari');
    expect(scriptOf(cp('्'))).toBe('Devanagari');
  });

  it('detects Bengali, Tamil, Telugu, Gujarati', () => {
    expect(scriptOf(cp('ক'))).toBe('Bengali');
    expect(scriptOf(cp('த'))).toBe('Tamil');
    expect(scriptOf(cp('తె'))).toBe('Telugu');
    expect(scriptOf(cp('ગ'))).toBe('Gujarati');
  });

  it('detects Gurmukhi, Kannada, Malayalam, Oriya', () => {
    expect(scriptOf(cp('ਕ'))).toBe('Gurmukhi');
    expect(scriptOf(cp('ಕ'))).toBe('Kannada');
    expect(scriptOf(cp('ക'))).toBe('Malayalam');
    expect(scriptOf(cp('କ'))).toBe('Oriya');
  });

  it('detects Arabic and Hebrew (RTL)', () => {
    expect(scriptOf(cp('ا'))).toBe('Arabic');
    expect(scriptOf(cp('א'))).toBe('Hebrew');
    expect(isRtl('Arabic')).toBe(true);
    expect(isRtl('Hebrew')).toBe(true);
    expect(isRtl('Latin')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* complex-script detection                                                    */
/* -------------------------------------------------------------------------- */

describe('engine/shaper — complex-script detection', () => {
  it('isComplexScript flags Indic and RTL', () => {
    expect(isComplexScript('Devanagari')).toBe(true);
    expect(isComplexScript('Tamil')).toBe(true);
    expect(isComplexScript('Arabic')).toBe(true);
    expect(isComplexScript('Latin')).toBe(false);
    expect(isComplexScript('Common')).toBe(false);
  });

  it('hasComplexScript detects Hindi mixed in English', () => {
    expect(hasComplexScript('Krishna')).toBe(false);
    expect(hasComplexScript('Krishna कृष्ण')).toBe(true);
    expect(hasComplexScript('कृष्ण')).toBe(true);
  });

  it('hasComplexScript handles supplementary code points without throwing', () => {
    // U+1F600 GRINNING FACE — should be 'Unknown', not complex.
    expect(hasComplexScript('hello 😀')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* categorize                                                                   */
/* -------------------------------------------------------------------------- */

describe('engine/shaper — categorize (Devanagari)', () => {
  it('classifies base consonant', () => {
    expect(categorize(cp('क'))).toBe('Base');
  });

  it('classifies halant (virama)', () => {
    expect(categorize(0x094d)).toBe('Halant');
  });

  it('classifies dependent vowel signs as Matra', () => {
    expect(categorize(cp('ि'))).toBe('Matra'); // U+093F
    expect(categorize(cp('ा'))).toBe('Matra'); // U+093E
    expect(categorize(cp('ु'))).toBe('Matra'); // U+0941
  });

  it('classifies nukta as Mark', () => {
    expect(categorize(0x093c)).toBe('Mark');
  });

  it('classifies digits', () => {
    expect(categorize(0x0966)).toBe('Digit'); // 0
    expect(categorize(0x096f)).toBe('Digit'); // 9
  });
});

describe('engine/shaper — categorize (other Indic)', () => {
  it('Bengali halant + base + matra', () => {
    expect(categorize(0x09cd)).toBe('Halant');
    expect(categorize(0x0995)).toBe('Base');
    expect(categorize(0x09be)).toBe('Matra');
  });
  it('Tamil halant', () => {
    expect(categorize(0x0bcd)).toBe('Halant');
  });
  it('Gujarati halant', () => {
    expect(categorize(0x0acd)).toBe('Halant');
  });
});

describe('engine/shaper — categorize (joiners)', () => {
  it('ZWJ and ZWNJ are Joiner', () => {
    expect(categorize(0x200d)).toBe('Joiner');
    expect(categorize(0x200c)).toBe('Joiner');
  });
});

/* -------------------------------------------------------------------------- */
/* splitClusters                                                                */
/* -------------------------------------------------------------------------- */

describe('engine/shaper — splitClusters', () => {
  it('returns empty for empty input', () => {
    expect(splitClusters('')).toEqual([]);
  });

  it('treats a Latin word as a single cluster', () => {
    const cs = splitClusters('Krishna');
    expect(cs).toHaveLength(1);
    expect(cs[0].text).toBe('Krishna');
    expect(cs[0].script).toBe('Latin');
  });

  it('splits Latin from Common space', () => {
    const cs = splitClusters('Hello World');
    expect(cs.map((c) => c.script)).toEqual(['Latin', 'Common', 'Latin']);
  });

  it('groups Devanagari base + matra into one cluster', () => {
    // कि = U+0915 (Base) + U+093F (Matra) — should be a single cluster.
    const cs = splitClusters('कि');
    expect(cs).toHaveLength(1);
    expect(cs[0].text).toBe('कि');
    expect(cs[0].script).toBe('Devanagari');
  });

  it('groups Devanagari conjunct (Base + Halant + Base)', () => {
    // क्ष = क + ् + ष — single cluster (conjunct via halant).
    const cs = splitClusters('क्ष');
    expect(cs).toHaveLength(1);
    expect(cs[0].text).toBe('क्ष');
  });

  it('breaks at next Base when no halant precedes', () => {
    // कक = two independent base consonants → two clusters.
    const cs = splitClusters('कक');
    expect(cs).toHaveLength(2);
    expect(cs.every((c) => c.script === 'Devanagari')).toBe(true);
  });

  it('includes nukta and matra in the same cluster', () => {
    // क़ि = क + ़ (nukta, Mark) + ि (matra)
    const cs = splitClusters('क़ि');
    expect(cs).toHaveLength(1);
  });

  it('handles full word कृष्ण correctly', () => {
    // कृ + ष्ण → two clusters (कृ = base+matra, ष्ण = base+halant+base)
    const cs = splitClusters('कृष्ण');
    expect(cs).toHaveLength(2);
    expect(cs[0].text).toBe('कृ');
    expect(cs[1].text).toBe('ष्ण');
  });

  it('mixes Latin and Devanagari into separate clusters', () => {
    const cs = splitClusters('Hi कि');
    expect(cs.map((c) => c.text)).toEqual(['Hi', ' ', 'कि']);
  });
});

/* -------------------------------------------------------------------------- */
/* splitRuns                                                                    */
/* -------------------------------------------------------------------------- */

describe('engine/shaper — splitRuns', () => {
  it('returns one simple run for ASCII text', () => {
    const r = splitRuns('Hello World');
    expect(r).toHaveLength(1);
    expect(r[0].mode).toBe('simple');
    expect(r[0].text).toBe('Hello World');
  });

  it('returns one complex run for Devanagari only', () => {
    const r = splitRuns('कृष्ण');
    expect(r).toHaveLength(1);
    expect(r[0].mode).toBe('complex');
    expect(r[0].script).toBe('Devanagari');
  });

  it('partitions mixed Latin + Devanagari into three runs', () => {
    const r = splitRuns('Name: कृष्ण Krishna');
    expect(r.length).toBe(3);
    expect(r[0].mode).toBe('simple');
    expect(r[1].mode).toBe('complex');
    expect(r[2].mode).toBe('simple');
  });

  it('keeps a space inside Devanagari prose as one complex run', () => {
    // "देव नागरी" — Devanagari, then space, then more Devanagari → single complex run.
    const r = splitRuns('देव नागरी');
    expect(r).toHaveLength(1);
    expect(r[0].mode).toBe('complex');
    expect(r[0].text).toBe('देव नागरी');
  });

  it('returns empty for empty input', () => {
    expect(splitRuns('')).toEqual([]);
  });
});
