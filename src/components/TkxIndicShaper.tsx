'use client';

import { useMemo, type CSSProperties, type HTMLAttributes } from 'react';
import { splitRuns, type Run, type Script } from '../engine/shaper';

export interface TkxIndicShaperProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  text: string;
  /** Optional font family map. Each complex script is rendered with the
   *  corresponding font (Noto Sans Devanagari, Noto Sans Tamil, …) so the
   *  browser's text engine has the right glyph data to shape with. */
  fonts?: Partial<Record<Script, string>>;
  /** Render each run inside an explicit <span lang="…"> for accessibility and
   *  better hyphenation/wrapping behavior. Default true. */
  setLang?: boolean;
}

const DEFAULT_FONTS: Record<Script, string> = {
  Latin: 'inherit',
  Common: 'inherit',
  Unknown: 'inherit',
  Devanagari: '"Noto Sans Devanagari", "Mangal", system-ui, sans-serif',
  Bengali: '"Noto Sans Bengali", system-ui, sans-serif',
  Gurmukhi: '"Noto Sans Gurmukhi", system-ui, sans-serif',
  Gujarati: '"Noto Sans Gujarati", system-ui, sans-serif',
  Oriya: '"Noto Sans Oriya", system-ui, sans-serif',
  Tamil: '"Noto Sans Tamil", "Latha", system-ui, sans-serif',
  Telugu: '"Noto Sans Telugu", system-ui, sans-serif',
  Kannada: '"Noto Sans Kannada", system-ui, sans-serif',
  Malayalam: '"Noto Sans Malayalam", system-ui, sans-serif',
  Sinhala: '"Noto Sans Sinhala", system-ui, sans-serif',
  Arabic: '"Noto Naskh Arabic", "Amiri", system-ui, sans-serif',
  Hebrew: '"Noto Sans Hebrew", system-ui, sans-serif',
};

const SCRIPT_LANG: Partial<Record<Script, string>> = {
  Devanagari: 'hi',
  Bengali: 'bn',
  Gurmukhi: 'pa',
  Gujarati: 'gu',
  Oriya: 'or',
  Tamil: 'ta',
  Telugu: 'te',
  Kannada: 'kn',
  Malayalam: 'ml',
  Sinhala: 'si',
  Arabic: 'ar',
  Hebrew: 'he',
};

/**
 * Splits text into per-script runs and wraps each run in a span with the
 * appropriate font-family and lang attribute. Browsers already shape Indic
 * and Arabic correctly when the right glyphs are available; this component
 * just makes sure the right font face is selected for each run.
 */
export function TkxIndicShaper({
  text,
  fonts,
  setLang = true,
  style,
  ...rest
}: TkxIndicShaperProps) {
  const runs = useMemo<Run[]>(() => splitRuns(text), [text]);

  const fontFor = (script: Script): string =>
    fonts?.[script] ?? DEFAULT_FONTS[script] ?? 'inherit';

  return (
    <span style={style} {...rest}>
      {runs.map((run, i) => {
        const runStyle: CSSProperties = {
          fontFamily: fontFor(run.script),
        };
        if (run.script === 'Arabic' || run.script === 'Hebrew') {
          runStyle.direction = 'rtl';
          runStyle.unicodeBidi = 'isolate';
        }
        return (
          <span
            key={i}
            style={runStyle}
            lang={setLang ? SCRIPT_LANG[run.script] : undefined}
            data-tkx-run={run.mode}
            data-tkx-script={run.script}
          >
            {run.text}
          </span>
        );
      })}
    </span>
  );
}

TkxIndicShaper.displayName = 'TkxIndicShaper';
