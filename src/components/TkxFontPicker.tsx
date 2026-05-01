'use client';

import {
  useId,
  useMemo,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import type { Script } from '../engine/shaper';

export interface FontFaceOption {
  id: string;
  /** Human-friendly name shown to the user. */
  label: string;
  /** CSS font-family value to apply when this option is selected. */
  fontFamily: string;
  /** Sample text rendered in the option's font for visual preview. */
  sample?: string;
}

export interface TkxFontPickerProps {
  /** The Indic / RTL script this picker is choosing a font face for. Affects
   *  the default sample shown in each option preview. */
  script: Script;
  options: ReadonlyArray<FontFaceOption>;
  /** Selected option id. */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string, option: FontFaceOption) => void;
  label?: string;
  isDisabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_SAMPLES: Partial<Record<Script, string>> = {
  Devanagari: 'कृष्ण साहू',
  Bengali: 'কৃষ্ণ সাহু',
  Gurmukhi: 'ਕ੍ਰਿਸ਼ਨ',
  Gujarati: 'કૃષ્ણ',
  Oriya: 'କୃଷ୍ଣ',
  Tamil: 'கிருஷ்ணா',
  Telugu: 'కృష్ణ',
  Kannada: 'ಕೃಷ್ಣ',
  Malayalam: 'കൃഷ്ണ',
  Sinhala: 'ක්‍රිශ්ණ',
  Arabic: 'كرشن',
  Hebrew: 'קרישנה',
};

/**
 * Pick which font face is used to render the biodata's complex-script text.
 * Each option shows a live preview rendered in its own font-family so users
 * can see the visual difference (e.g. Devanagari Mukta vs Annapurna SIL).
 */
export function TkxFontPicker({
  script,
  options,
  value,
  defaultValue,
  onChange,
  label,
  isDisabled,
  className,
  style,
}: TkxFontPickerProps) {
  const theme = useTheme();
  const groupId = useId();
  const selectedId = value ?? defaultValue ?? options[0]?.id;

  const sample = useMemo(
    () => DEFAULT_SAMPLES[script] ?? 'Aa Bb 1 2',
    [script],
  );

  return (
    <fieldset
      className={className}
      disabled={isDisabled}
      data-tkx-font-picker={script}
      style={{
        border: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        ...style,
      }}
    >
      {label && <legend style={{ fontSize: '0.875rem', color: theme.text }}>{label}</legend>}
      <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map((opt) => {
          const id = `${groupId}-${opt.id}`;
          const isSel = opt.id === selectedId;
          return (
            <label
              key={opt.id}
              htmlFor={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 10,
                border: `1.5px solid ${isSel ? theme.primary : theme.border}`,
                borderRadius: 8,
                background: isSel ? `${theme.primary}11` : theme.surface,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              <input
                id={id}
                type="radio"
                name={groupId}
                value={opt.id}
                checked={isSel}
                onChange={() => onChange?.(opt.id, opt)}
                disabled={isDisabled}
                style={{ accentColor: theme.primary }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: '0.875rem', color: theme.text }}>{opt.label}</span>
                <span
                  aria-hidden
                  style={{
                    fontFamily: opt.fontFamily,
                    fontSize: '1.5rem',
                    color: theme.text,
                    marginTop: 2,
                  }}
                >
                  {opt.sample ?? sample}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

TkxFontPicker.displayName = 'TkxFontPicker';
