/**
 * Tekivex UI — engine/shaper/scripts
 *
 * Script detection from Unicode code points. Pure tables — no I/O, no
 * regex. Used by the cluster grouper and by the higher-level "should this
 * run be rasterized rather than drawn as standard-font text?" decision.
 */

export type Script =
  | 'Latin'
  | 'Devanagari'
  | 'Bengali'
  | 'Gurmukhi'
  | 'Gujarati'
  | 'Oriya'
  | 'Tamil'
  | 'Telugu'
  | 'Kannada'
  | 'Malayalam'
  | 'Sinhala'
  | 'Arabic'
  | 'Hebrew'
  | 'Common'   // punctuation, digits, whitespace
  | 'Unknown';

interface Range {
  start: number;
  end: number;
  script: Script;
}

/** Unicode blocks relevant to the marriage-biodata audience. Ordered so that
 *  the table can be searched linearly without ambiguity. */
const RANGES: ReadonlyArray<Range> = [
  // Basic Latin + Latin supplement + Latin extended (covers WinAnsi)
  { start: 0x0000, end: 0x024f, script: 'Latin' },
  // Latin Extended Additional + IPA Extensions are still Latin
  { start: 0x1d00, end: 0x1eff, script: 'Latin' },
  // Hebrew
  { start: 0x0590, end: 0x05ff, script: 'Hebrew' },
  // Arabic
  { start: 0x0600, end: 0x06ff, script: 'Arabic' },
  { start: 0x0750, end: 0x077f, script: 'Arabic' },
  { start: 0xfb50, end: 0xfdff, script: 'Arabic' },
  { start: 0xfe70, end: 0xfeff, script: 'Arabic' },
  // Devanagari + Vedic Extensions
  { start: 0x0900, end: 0x097f, script: 'Devanagari' },
  { start: 0x1cd0, end: 0x1cff, script: 'Devanagari' },
  { start: 0xa8e0, end: 0xa8ff, script: 'Devanagari' },
  // Bengali
  { start: 0x0980, end: 0x09ff, script: 'Bengali' },
  // Gurmukhi (Punjabi)
  { start: 0x0a00, end: 0x0a7f, script: 'Gurmukhi' },
  // Gujarati
  { start: 0x0a80, end: 0x0aff, script: 'Gujarati' },
  // Oriya
  { start: 0x0b00, end: 0x0b7f, script: 'Oriya' },
  // Tamil
  { start: 0x0b80, end: 0x0bff, script: 'Tamil' },
  // Telugu
  { start: 0x0c00, end: 0x0c7f, script: 'Telugu' },
  // Kannada
  { start: 0x0c80, end: 0x0cff, script: 'Kannada' },
  // Malayalam
  { start: 0x0d00, end: 0x0d7f, script: 'Malayalam' },
  // Sinhala (some Sri Lankan biodatas)
  { start: 0x0d80, end: 0x0dff, script: 'Sinhala' },
];

/** Code points categorized as Common regardless of any script-block hit. */
function isCommon(cp: number): boolean {
  // ASCII whitespace + punctuation we consider script-neutral
  if (cp === 0x20 || cp === 0x09 || cp === 0x0a || cp === 0x0d) return true;
  // Common punctuation
  if (cp >= 0x21 && cp <= 0x40) return true; // ! " # $ % & ' ( ) * + , - . / 0-9 : ; < = > ? @
  if (cp >= 0x5b && cp <= 0x60) return true; // [ \ ] ^ _ `
  if (cp >= 0x7b && cp <= 0x7e) return true; // { | } ~
  // General punctuation block
  if (cp >= 0x2000 && cp <= 0x206f) return true;
  // Currency symbols
  if (cp >= 0x20a0 && cp <= 0x20cf) return true;
  return false;
}

export function scriptOf(cp: number): Script {
  if (isCommon(cp)) return 'Common';
  for (const r of RANGES) {
    if (cp >= r.start && cp <= r.end) return r.script;
  }
  return 'Unknown';
}

/** Set of scripts that need complex text shaping (cluster reorder, conjuncts,
 *  matra placement). PDF rendering of these scripts via standard 14 fonts is
 *  impossible — caller should rasterize via canvas. */
const COMPLEX_SCRIPTS: ReadonlySet<Script> = new Set<Script>([
  'Devanagari',
  'Bengali',
  'Gurmukhi',
  'Gujarati',
  'Oriya',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Sinhala',
  'Arabic',
  'Hebrew',
]);

export function isComplexScript(script: Script): boolean {
  return COMPLEX_SCRIPTS.has(script);
}

/**
 * Whether a string contains any code point requiring complex-script shaping.
 * The biodata renderer uses this to decide whether a text node can be drawn
 * with standard 14 fonts or must be rasterized to an image XObject.
 */
export function hasComplexScript(text: string): boolean {
  for (let i = 0; i < text.length; ) {
    const cp = text.codePointAt(i) ?? text.charCodeAt(i);
    if (isComplexScript(scriptOf(cp))) return true;
    i += cp > 0xffff ? 2 : 1;
  }
  return false;
}

/** Whether a script renders right-to-left. */
export function isRtl(script: Script): boolean {
  return script === 'Arabic' || script === 'Hebrew';
}
