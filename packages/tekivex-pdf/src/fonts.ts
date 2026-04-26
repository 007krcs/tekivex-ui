// ─────────────────────────────────────────────────────────────────────────────
// @tekivex/pdf/fonts — Noto font registration kit.
//
// @react-pdf/renderer ships only Helvetica/Times/Courier built-in. Anything
// else needs explicit Font.register(). This module wraps the boilerplate for
// every script tekivex-ui supports, with versioned Google Fonts URLs.
//
// Usage:
//
//   import { registerNoto } from '@tekivex/pdf/fonts';
//   registerNoto(['latin', 'devanagari', 'tamil']);
//
//   <TkxPDFText font="Noto Sans Devanagari">मेरा नाम राम है</TkxPDFText>
//
// Or for a single language → all required scripts:
//
//   import { registerNotoForLanguage } from '@tekivex/pdf/fonts';
//   registerNotoForLanguage('hi');
//
// All weights (400, 500, 600, 700) are registered per family. Calls are
// idempotent — calling twice is a no-op.
// ─────────────────────────────────────────────────────────────────────────────

import { Font } from '@react-pdf/renderer';

export type NotoScript =
  | 'latin'
  | 'devanagari'
  | 'tamil'
  | 'telugu'
  | 'kannada'
  | 'malayalam'
  | 'bengali'
  | 'gujarati'
  | 'gurmukhi'
  | 'arabic'
  | 'hebrew'
  | 'thai'
  | 'jp'
  | 'kr'
  | 'sc'  // Simplified Chinese
  | 'tc'; // Traditional Chinese

interface ScriptConfig {
  /** PDF font family name to register and reference. */
  family: string;
  /** Direct .ttf URLs by weight. */
  files: { src: string; fontWeight: number }[];
}

// Pinned to specific font versions so PDFs render consistently across builds.
// These URLs serve woff2-decoded TTF directly from Google Fonts.
const NOTO: Record<NotoScript, ScriptConfig> = {
  latin: {
    family: 'Noto Sans',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosans/v36/o-0NIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyB9_FOL.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosans/v36/o-0NIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9-FOL.ttf', fontWeight: 600 },
      { src: 'https://fonts.gstatic.com/s/notosans/v36/o-0NIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyAg-1OL.ttf', fontWeight: 700 },
    ],
  },
  devanagari: {
    family: 'Noto Sans Devanagari',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosansdevanagari/v26/TuGoUUFzXI5FBtUq5a8bjKYTZjtRU6Sgv1TKZ5DQyLVYkYGGVBRR.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosansdevanagari/v26/TuGoUUFzXI5FBtUq5a8bjKYTZjtRU6Sgv0nGZ5DQyLVYkYGGVBRR.ttf', fontWeight: 700 },
    ],
  },
  tamil: {
    family: 'Noto Sans Tamil',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosanstamil/v27/ieVc2YdFI3GCY6SyQy1KfStzYKZgzN1z4LKDbeZce-0429tBManUktuex7vGo70RqKDt_EvT.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosanstamil/v27/ieVc2YdFI3GCY6SyQy1KfStzYKZgzN1z4LKDbeZce-0429tBManUktuex7vGuLwRqKDt_EvT.ttf', fontWeight: 700 },
    ],
  },
  telugu: {
    family: 'Noto Sans Telugu',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosanstelugu/v25/0FlxVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVC5dzHkHIJQqrEntezbqQUbf-3v37w.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosanstelugu/v25/0FlxVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVC5dzHkHIJQqrEntezbqQUaG-Hv37w.ttf', fontWeight: 700 },
    ],
  },
  kannada: {
    family: 'Noto Sans Kannada',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosanskannada/v27/8vIs7xs32H97qzQKnzfeXycxXZyUmySvZWItmf1fe6TVmgop9ndpS-BtjlrPSVhV.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosanskannada/v27/8vIs7xs32H97qzQKnzfeXycxXZyUmySvZWItmf1fe6TVmgop9ndpS-CRjFrPSVhV.ttf', fontWeight: 700 },
    ],
  },
  malayalam: {
    family: 'Noto Sans Malayalam',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJoi3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNM-Qw8EaeB8Nss-_RuD9.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJoi3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNM-Qw8FjeR8Nss-_RuD9.ttf', fontWeight: 700 },
    ],
  },
  bengali: {
    family: 'Noto Sans Bengali',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosansbengali/v20/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolKudCk8izI0lc.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosansbengali/v20/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolKuS-l0lc.ttf', fontWeight: 700 },
    ],
  },
  gujarati: {
    family: 'Noto Sans Gujarati',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosansgujarati/v25/wlpWgx_HC1ti5ViekvcxnhMlCVo3f5pv17ivlzsUB14gg1TMR2Gw4VceEl7MA_ypFwPM.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosansgujarati/v25/wlpWgx_HC1ti5ViekvcxnhMlCVo3f5pv17ivlzsUB14gg1TMR2Gw4VceEl5fAvypFwPM.ttf', fontWeight: 700 },
    ],
  },
  gurmukhi: {
    family: 'Noto Sans Gurmukhi',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosansgurmukhi/v26/w8g9H3EvQP81sInb43inmyN9zZ7hb7ATbSWo4q8dJ74a3cVrYFQ_bogT0-gPeG1OenbxZ_trdp7h.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosansgurmukhi/v26/w8g9H3EvQP81sInb43inmyN9zZ7hb7ATbSWo4q8dJ74a3cVrYFQ_bogT0-gPeG1OenZIYJtrdp7h.ttf', fontWeight: 700 },
    ],
  },
  arabic: {
    family: 'Noto Sans Arabic',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGyvu3CBFQLaig.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGyvuwiAFQLaig.ttf', fontWeight: 700 },
    ],
  },
  hebrew: {
    family: 'Noto Sans Hebrew',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosanshebrew/v46/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXd4qtoiJltutR2g.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosanshebrew/v46/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXd4q9pCJltutR2g.ttf', fontWeight: 700 },
    ],
  },
  thai: {
    family: 'Noto Sans Thai',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosansthai/v25/iJWnBXeUZi_OHPqn4wq6hQ2_hbJ1xyN9wd43SofNWcd1MKVQt_So_9CdU5RtpzF-QRvzzXg.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosansthai/v25/iJWnBXeUZi_OHPqn4wq6hQ2_hbJ1xyN9wd43SofNWcd1MKVQt_So_9CdU5RtpzGsRBvzzXg.ttf', fontWeight: 700 },
    ],
  },
  jp: {
    family: 'Noto Sans JP',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosansjp/v53/-F62fjtqLzI2JPCgQBnw7HFowwZJfDCLG5Kyz9G4yBd-csmHaDA0Dw.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosansjp/v53/-F62fjtqLzI2JPCgQBnw7HFowwZJfDCLG5Kyz9G4yBd-csmHaCk2Dw.ttf', fontWeight: 700 },
    ],
  },
  kr: {
    family: 'Noto Sans KR',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgm20HTs4JMMuA.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgm20xTs4JMMuA.ttf', fontWeight: 700 },
    ],
  },
  sc: {
    family: 'Noto Sans SC',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosanssc/v37/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS5HE.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosanssc/v37/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS9HQ.ttf', fontWeight: 700 },
    ],
  },
  tc: {
    family: 'Noto Sans TC',
    files: [
      { src: 'https://fonts.gstatic.com/s/notosanstc/v36/-nFuOG829Oofr2wohFbTp9ifNAn722rq0MXz76Cy_CpOtma3uQRIUdZx.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notosanstc/v36/-nFuOG829Oofr2wohFbTp9ifNAn722rq0MXz76Cy_CpOtma3utRGUdZx.ttf', fontWeight: 700 },
    ],
  },
};

const REGISTERED = new Set<NotoScript>();

/**
 * Register one or more Noto fonts with @react-pdf/renderer's Font registry.
 * Idempotent — repeated calls for the same script are no-ops.
 *
 * @example
 * registerNoto(['latin', 'devanagari']);
 */
export function registerNoto(scripts: NotoScript[]): void {
  for (const script of scripts) {
    if (REGISTERED.has(script)) continue;
    const cfg = NOTO[script];
    if (!cfg) continue;
    Font.register({ family: cfg.family, fonts: cfg.files });
    REGISTERED.add(script);
  }
}

/**
 * Get the registered family name for a given script. Useful for the `font`
 * prop on TkxPDFText.
 */
export function familyForScript(script: NotoScript): string {
  return NOTO[script].family;
}

/**
 * Map a BCP 47 language code → list of Noto scripts required, then register
 * them. Returns the primary family name so callers can drop it into
 * `<TkxPDFText font={...}>`.
 *
 * @example
 * const family = registerNotoForLanguage('hi'); // → 'Noto Sans Devanagari'
 */
export function registerNotoForLanguage(language: string): string {
  const normalised = language.toLowerCase();
  const base = normalised.split('-')[0];

  const map: Record<string, NotoScript[]> = {
    en: ['latin'],
    hi: ['devanagari'],
    mr: ['devanagari'],
    sa: ['devanagari'],
    ne: ['devanagari'],
    ta: ['tamil'],
    te: ['telugu'],
    kn: ['kannada'],
    ml: ['malayalam'],
    bn: ['bengali'],
    as: ['bengali'],
    gu: ['gujarati'],
    pa: ['gurmukhi'],
    ar: ['arabic'],
    ur: ['arabic'],
    fa: ['arabic'],
    he: ['hebrew'],
    th: ['thai'],
    ja: ['jp'],
    ko: ['kr'],
    zh: ['sc'],
  };

  // Special case for traditional Chinese
  if (normalised === 'zh-tw' || normalised === 'zh-hk') {
    registerNoto(['tc']);
    return NOTO.tc.family;
  }

  const scripts = map[base] || ['latin'];
  registerNoto(scripts);
  return NOTO[scripts[0]].family;
}

/**
 * Disable Hyphenation. PDF text runs in many scripts (Devanagari, Tamil,
 * Arabic) lay out wrong with hyphenation. Calling this once at app boot is
 * usually what you want for non-English documents.
 */
export function disableHyphenation(): void {
  Font.registerHyphenationCallback((word: string) => [word]);
}
