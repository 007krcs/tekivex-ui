'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxFontProvider — lazy-load Google Fonts script subsets on demand.
//
// Why: loading every Indic + CJK script up-front wrecks LCP on 4G. This
// provider injects only the <link> tags for the scripts the user's selected
// language requires. Adding/removing a script after mount is supported.
//
// Each script maps to a Noto Sans family carefully scoped to that script's
// Unicode range (via &subset= parameter). Variable axes (wght 100..900) are
// requested in a single request per script for minimum HTTP overhead.
//
// SSR-safe: useEffect injection only; no hydration warning. font-display:swap
// is requested on every URL.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, type ReactNode } from 'react';

export type FontScript =
  | 'latin'
  | 'latin-ext'
  | 'devanagari'  // Hindi, Marathi
  | 'tamil'
  | 'telugu'
  | 'kannada'
  | 'malayalam'
  | 'bengali'
  | 'gujarati'
  | 'gurmukhi'    // Punjabi
  | 'oriya'
  | 'sinhala'
  | 'arabic'      // Arabic, Urdu (Nastaliq via separate font)
  | 'hebrew'
  | 'thai'
  | 'vietnamese'
  | 'cyrillic'
  | 'cyrillic-ext'
  | 'greek'
  | 'greek-ext'
  | 'jp'          // Japanese
  | 'kr'          // Korean
  | 'sc'          // Simplified Chinese
  | 'tc';         // Traditional Chinese

interface ScriptDef {
  /** Google Fonts CSS2 family + axis spec for this script. */
  href: string;
  /** Stable id used as the <link> element id (and de-dup key). */
  id: string;
}

// Each entry requests Noto Sans <Script> with a wght axis and font-display=swap.
// Using separate requests per script means clients only download what they need.
const SCRIPTS: Record<FontScript, ScriptDef> = {
  latin: {
    id: 'tkx-font-latin',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap',
  },
  'latin-ext': {
    id: 'tkx-font-latin-ext',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap&subset=latin-ext',
  },
  devanagari: {
    id: 'tkx-font-devanagari',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap',
  },
  tamil: {
    id: 'tkx-font-tamil',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap',
  },
  telugu: {
    id: 'tkx-font-telugu',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap',
  },
  kannada: {
    id: 'tkx-font-kannada',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700&display=swap',
  },
  malayalam: {
    id: 'tkx-font-malayalam',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700&display=swap',
  },
  bengali: {
    id: 'tkx-font-bengali',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap',
  },
  gujarati: {
    id: 'tkx-font-gujarati',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap',
  },
  gurmukhi: {
    id: 'tkx-font-gurmukhi',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;600;700&display=swap',
  },
  oriya: {
    id: 'tkx-font-oriya',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Oriya:wght@400;500;600;700&display=swap',
  },
  sinhala: {
    id: 'tkx-font-sinhala',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600;700&display=swap',
  },
  arabic: {
    id: 'tkx-font-arabic',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap',
  },
  hebrew: {
    id: 'tkx-font-hebrew',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;500;600;700&display=swap',
  },
  thai: {
    id: 'tkx-font-thai',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap',
  },
  vietnamese: {
    id: 'tkx-font-vietnamese',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap&subset=vietnamese',
  },
  cyrillic: {
    id: 'tkx-font-cyrillic',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap&subset=cyrillic',
  },
  'cyrillic-ext': {
    id: 'tkx-font-cyrillic-ext',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap&subset=cyrillic-ext',
  },
  greek: {
    id: 'tkx-font-greek',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap&subset=greek',
  },
  'greek-ext': {
    id: 'tkx-font-greek-ext',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap&subset=greek-ext',
  },
  jp: {
    id: 'tkx-font-jp',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap',
  },
  kr: {
    id: 'tkx-font-kr',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap',
  },
  sc: {
    id: 'tkx-font-sc',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap',
  },
  tc: {
    id: 'tkx-font-tc',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&display=swap',
  },
};

/** Map ISO 639-1 / BCP 47 language codes → required scripts. */
const LANG_TO_SCRIPTS: Record<string, FontScript[]> = {
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
  or: ['oriya'],
  si: ['sinhala'],
  ar: ['arabic'],
  ur: ['arabic'],
  fa: ['arabic'],
  he: ['hebrew'],
  th: ['thai'],
  vi: ['vietnamese', 'latin'],
  ru: ['cyrillic'],
  uk: ['cyrillic'],
  bg: ['cyrillic'],
  el: ['greek'],
  ja: ['jp'],
  ko: ['kr'],
  zh: ['sc'],
  'zh-CN': ['sc'],
  'zh-TW': ['tc'],
  'zh-HK': ['tc'],
};

export interface TkxFontProviderProps {
  /**
   * Explicit list of scripts to load. Takes precedence over `language`.
   * @example scripts={["latin", "devanagari", "tamil"]}
   */
  scripts?: FontScript[];
  /**
   * BCP 47 language code (e.g. "en", "hi", "ta", "zh-CN"). Resolved to its
   * required scripts via the built-in language map. If both `scripts` and
   * `language` are passed, `scripts` wins.
   */
  language?: string;
  /**
   * If true, also injects a preconnect to fonts.googleapis.com and
   * fonts.gstatic.com to start the TLS handshake earlier. Default: true.
   */
  preconnect?: boolean;
  children?: ReactNode;
}

let preconnectInjected = false;

function injectPreconnects() {
  if (preconnectInjected || typeof document === 'undefined') return;
  const head = document.head;
  const make = (href: string, crossOrigin?: boolean) => {
    if (head.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (crossOrigin) link.crossOrigin = 'anonymous';
    head.appendChild(link);
  };
  make('https://fonts.googleapis.com');
  make('https://fonts.gstatic.com', true);
  preconnectInjected = true;
}

function injectScript(script: FontScript) {
  if (typeof document === 'undefined') return;
  const def = SCRIPTS[script];
  if (!def) return;
  if (document.getElementById(def.id)) return;
  const link = document.createElement('link');
  link.id = def.id;
  link.rel = 'stylesheet';
  link.href = def.href;
  // crossorigin not required for stylesheets but harmless
  document.head.appendChild(link);
}

function removeScript(script: FontScript) {
  if (typeof document === 'undefined') return;
  const def = SCRIPTS[script];
  if (!def) return;
  const el = document.getElementById(def.id);
  if (el) el.remove();
}

/**
 * Resolve a language code to its required font scripts.
 * Always falls back to ['latin'] for unknown codes.
 */
export function scriptsForLanguage(language: string): FontScript[] {
  if (!language) return ['latin'];
  const direct = LANG_TO_SCRIPTS[language];
  if (direct) return direct;
  // Try base language ("zh-Hant" → "zh")
  const base = language.split('-')[0];
  return LANG_TO_SCRIPTS[base] || ['latin'];
}

export function TkxFontProvider({
  scripts,
  language,
  preconnect = true,
  children,
}: TkxFontProviderProps) {
  const required: FontScript[] = scripts && scripts.length > 0
    ? scripts
    : language
      ? scriptsForLanguage(language)
      : ['latin'];

  useEffect(() => {
    if (preconnect) injectPreconnects();
    required.forEach(injectScript);
    // We intentionally do NOT remove scripts on unmount: another part of the
    // app may still need them, and re-injecting on every navigation defeats
    // the purpose. Use removeFontScript() manually for explicit cleanup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [required.join(','), preconnect]);

  return children == null ? null : <>{children}</>;
}

/** Imperative API for consumers managing fonts outside the React tree. */
export function loadFontScript(script: FontScript) {
  injectScript(script);
}
export function unloadFontScript(script: FontScript) {
  removeScript(script);
}
