'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxAadhaarInput — masked Aadhaar entry with Verhoeff checksum validation.
//
// Aadhaar is India's 12-digit national ID. The 12th digit is a Verhoeff
// checksum over the other 11. UIDAI confirms this is the official check
// algorithm (https://uidai.gov.in).
//
// What this component does:
//   1. Accept exactly 12 digits, displayed as XXXX XXXX XXXX
//   2. Optionally mask the first 8 digits AT REST (default — privacy): while
//      the field is focused the real digits are shown so it is editable;
//      on blur the display collapses to XXXX XXXX 1234. (Masking the value
//      while typing made the field impossible to edit — every keystroke's
//      X's were stripped as non-digits, destroying prior input.)
//   3. Validate the Verhoeff checksum on every keystroke
//   4. Surface { raw, digits, display, valid } via onChange
//   5. The at-rest DOM value is masked unless mask=false
//
// Security note:
//   - Aadhaar is regulated under the Aadhaar Act 2016. Storing/transmitting
//     full Aadhaar to anyone other than UIDAI requires KUA/AUA registration.
//     This component COLLECTS the value locally — what you do with it on
//     submit is your responsibility.
//   - Default behaviour: mask the first 8 digits at render time and only
//     surface the full value via onChange (consumer can decide).
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useId,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';

// ── Verhoeff algorithm ─────────────────────────────────────────────────────
// Reference: https://en.wikipedia.org/wiki/Verhoeff_algorithm

const D: ReadonlyArray<ReadonlyArray<number>> = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const P: ReadonlyArray<ReadonlyArray<number>> = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export function isValidAadhaar(input: string): boolean {
  const digits = input.replace(/\D+/g, '');
  if (digits.length !== 12) return false;
  let c = 0;
  const reversed = digits.split('').reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = D[c][P[i % 8][parseInt(reversed[i], 10)]];
  }
  return c === 0;
}

// ── Component ───────────────────────────────────────────────────────────────

export interface AadhaarChangePayload {
  /** What the user typed, with formatting (XXXX XXXX XXXX). */
  raw: string;
  /** 12-digit string with no separators. Empty until 12 digits entered. */
  digits: string;
  /** Display string: XXXX XXXX 1234 (or full if mask=false). */
  display: string;
  /** Verhoeff checksum check. False until 12 digits + valid. */
  valid: boolean;
}

export interface TkxAadhaarInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (payload: AadhaarChangePayload) => void;
  /** Visible label. */
  label?: string;
  /**
   * Mask the first 8 digits at rest (when the field is not focused). While
   * focused, the real digits are shown so the value stays editable. The full
   * value is always surfaced via onChange — masking is a display-only,
   * shoulder-surfing protection. Default: true.
   */
  mask?: boolean;
  /** Disable input. */
  disabled?: boolean;
  /** Mark required for screen readers. */
  required?: boolean;
  /** Optional id; auto-generated. */
  id?: string;
  /** Optional name (form submission). */
  name?: string;
  /** Optional className. */
  className?: string;
  /** Optional inline style. */
  style?: CSSProperties;
}

function format(digits: string): string {
  const d = digits.replace(/\D+/g, '').slice(0, 12);
  const parts = [d.slice(0, 4), d.slice(4, 8), d.slice(8, 12)].filter(Boolean);
  return parts.join(' ');
}

function masked(digits: string): string {
  const d = digits.replace(/\D+/g, '').slice(0, 12);
  if (d.length === 0) return '';
  if (d.length <= 8) {
    // Mask everything entered so far behind X's.
    return 'X'.repeat(d.length).match(/.{1,4}/g)!.join(' ');
  }
  // First 8 masked, last 4 visible.
  const last4 = d.slice(8, 12);
  return `XXXX XXXX ${last4}`;
}

export const TkxAadhaarInput = forwardRef<HTMLInputElement, TkxAadhaarInputProps>(
  function TkxAadhaarInput(
    { value, defaultValue, onChange, label, mask = true, disabled, required, id, name, className, style },
    ref: Ref<HTMLInputElement>,
  ) {
    const theme = useTheme();
    const t = useLocale();
    const autoId = useId();
    const inputId = id ?? autoId;

    const isControlled = value !== undefined;
    const [inner, setInner] = useState<string>(() => (defaultValue ?? '').replace(/\D+/g, '').slice(0, 12));
    const digits = isControlled ? (value ?? '').replace(/\D+/g, '').slice(0, 12) : inner;

    // Mask at rest only. While focused, show the real formatted digits —
    // rendering X's into the editable value destroyed prior input on every
    // keystroke (the X's were stripped as non-digits).
    const [focused, setFocused] = useState(false);
    const display = mask && !focused ? masked(digits) : format(digits);
    const valid = isValidAadhaar(digits);

    const handleChange = (raw: string) => {
      const next = raw.replace(/\D+/g, '').slice(0, 12);
      if (!isControlled) setInner(next);
      onChange?.({
        raw: format(next),
        digits: next,
        display: mask ? masked(next) : format(next),
        valid: isValidAadhaar(next),
      });
    };

    const labelStyle: CSSProperties = { fontSize: 13, fontWeight: 600, color: theme.text };
    const inputStyle: CSSProperties = {
      width: '100%',
      padding: '0 12px',
      border: `1px solid ${digits.length === 12 && !valid ? theme.danger : theme.border}`,
      borderRadius: 8,
      background: theme.surface,
      color: theme.text,
      fontSize: 14,
      minHeight: 40,
      outline: 'none',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      letterSpacing: 1.5,
    };

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
            {required && <span style={{ color: theme.danger, marginLeft: 4 }}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={14} // 12 digits + 2 spaces
          value={display}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          required={required}
          aria-invalid={digits.length === 12 && !valid}
          aria-describedby={digits.length === 12 && !valid ? `${inputId}-err` : undefined}
          style={inputStyle}
          placeholder="XXXX XXXX XXXX"
        />
        {digits.length === 12 && !valid && (
          <div id={`${inputId}-err`} role="alert" style={{ fontSize: 12, color: theme.danger }}>
            {t.invalidFormat ?? 'Invalid Aadhaar — checksum mismatch.'}
          </div>
        )}
        {digits.length > 0 && digits.length < 12 && (
          <div style={{ fontSize: 12, color: theme.textMuted }}>
            {12 - digits.length} digit{12 - digits.length === 1 ? '' : 's'} remaining
          </div>
        )}
      </div>
    );
  },
);

TkxAadhaarInput.displayName = 'TkxAadhaarInput';
