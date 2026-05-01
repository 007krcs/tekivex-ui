'use client';

import {
  forwardRef,
  useCallback,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';

/**
 * Mask grammar (a single string):
 *   9  → digit  [0-9]
 *   A  → letter [A-Za-z], stored uppercase
 *   X  → alphanumeric, stored uppercase
 *   *  → any visible character
 *   any other character is a literal that auto-inserts as the user types
 *
 * Examples:
 *   Aadhaar:  '9999 9999 9999'
 *   PAN:      'AAAAA9999A'
 *   Passport: 'A9999999'
 *   GSTIN:    '99AAAAA9999A9X9'
 */

export interface TkxMaskedInputProps {
  mask: string;
  value?: string;
  defaultValue?: string;
  /** Called with the unmasked digits / letters (no separators). */
  onValueChange?: (rawValue: string) => void;
  /** Called with the masked, displayed value. */
  onChange?: (maskedValue: string) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  hint?: string;
  label?: string;
  /** Visible placeholder. When omitted, the mask itself is the placeholder. */
  placeholder?: string;
  /** Explicit validation predicate run against the unmasked value. */
  validate?: (rawValue: string) => boolean;
  /** Auto-uppercase any letter input. Default true. */
  uppercase?: boolean;
  className?: string;
  style?: CSSProperties;
  inputMode?: 'numeric' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

const SIZE = {
  sm: { h: '36px', font: '0.875rem' },
  md: { h: '44px', font: '1rem' },
  lg: { h: '52px', font: '1.125rem' },
};

interface MaskApply {
  /** The displayed (masked) string. */
  display: string;
  /** The user-typed characters with separators stripped. */
  raw: string;
  /** Whether all mask placeholders have been filled. */
  complete: boolean;
}

const isPlaceholder = (m: string): boolean =>
  m === '9' || m === 'A' || m === 'X' || m === '*';

function matchSlot(slot: string, ch: string, uppercase: boolean): string | null {
  if (slot === '9') return /\d/.test(ch) ? ch : null;
  if (slot === 'A')
    return /[A-Za-z]/.test(ch) ? (uppercase ? ch.toUpperCase() : ch) : null;
  if (slot === 'X')
    return /[A-Za-z0-9]/.test(ch) ? (uppercase ? ch.toUpperCase() : ch) : null;
  if (slot === '*') return ch;
  return null;
}

function applyMask(input: string, mask: string, uppercase: boolean): MaskApply {
  // First walk: consume input characters into placeholder slots, auto-emitting
  // literal slots between them. Inputs that don't match the next placeholder
  // are skipped (so retyping after a literal works).
  let out = '';
  let mi = 0;
  let ii = 0;
  let raw = '';
  while (mi < mask.length && ii < input.length) {
    const slot = mask[mi];
    if (isPlaceholder(slot)) {
      const ch = input[ii];
      const matched = matchSlot(slot, ch, uppercase);
      if (matched !== null) {
        out += matched;
        raw += matched;
        mi++;
        ii++;
      } else {
        // If the user typed a literal that matches the *next* literal in the
        // mask we let it pass; otherwise drop it.
        ii++;
      }
    } else {
      // Literal slot — emit verbatim. If the user happened to also type the
      // same literal next, swallow it so caret position stays stable.
      out += slot;
      if (input[ii] === slot) ii++;
      mi++;
    }
  }
  // Trailing literal block (e.g. mask ends with " AAAA" but input filled the
  // placeholders before): drop it — the literal only renders once a following
  // placeholder is filled.
  return { display: out, raw, complete: out.length === mask.length };
}

/**
 * Masked input for Indian KYC fields (Aadhaar / PAN / Passport / GSTIN) and
 * any other pattern expressible via the mask grammar.
 */
export const TkxMaskedInput = forwardRef<HTMLInputElement, TkxMaskedInputProps>(
  function TkxMaskedInput(
    {
      mask,
      value,
      defaultValue,
      onValueChange,
      onChange,
      isDisabled,
      isInvalid,
      errorMessage,
      hint,
      label,
      placeholder,
      validate,
      uppercase = true,
      className,
      style,
      inputMode,
      size = 'md',
    },
    ref,
  ) {
    const theme = useTheme();
    const initial = applyMask(value ?? defaultValue ?? '', mask, uppercase);
    const [display, setDisplay] = useState(initial.display);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const next = applyMask(e.target.value, mask, uppercase);
        setDisplay(next.display);
        onChange?.(next.display);
        onValueChange?.(next.raw);
      },
      [mask, uppercase, onChange, onValueChange],
    );

    const raw = applyMask(value !== undefined ? value : display, mask, uppercase).raw;
    const validatorOk = validate ? validate(raw) : true;
    const externalInvalid = isInvalid || !!errorMessage;
    const showError = externalInvalid || (raw.length > 0 && !validatorOk);
    const safeError = errorMessage ? sanitizeString(errorMessage) : undefined;
    const safeHint = hint ? sanitizeString(hint) : undefined;

    const sz = SIZE[size];
    const ariaLabel = label ?? 'Masked input';

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
        {label && <label style={{ fontSize: '0.875rem', color: theme.text }}>{label}</label>}
        <input
          ref={ref}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          spellCheck={false}
          value={value !== undefined ? applyMask(value, mask, uppercase).display : display}
          placeholder={placeholder ?? mask}
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-invalid={showError || undefined}
          onChange={handleChange}
          style={{
            height: sz.h,
            padding: '0 12px',
            fontSize: sz.font,
            fontFamily: 'inherit',
            border: `1.5px solid ${showError ? theme.danger : theme.border}`,
            borderRadius: 8,
            background: isDisabled ? theme.surfaceAlt : theme.surface,
            color: theme.text,
            opacity: isDisabled ? 0.6 : 1,
            outline: 'none',
            letterSpacing: '0.02em',
          }}
          data-tkx-masked-input={showError ? 'invalid' : 'ok'}
        />
        {safeError ? (
          <span role="alert" style={{ fontSize: '0.75rem', color: theme.danger }}>
            {safeError}
          </span>
        ) : safeHint ? (
          <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>{safeHint}</span>
        ) : null}
      </div>
    );
  },
);

TkxMaskedInput.displayName = 'TkxMaskedInput';
