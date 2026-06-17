'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxCurrencyInput — currency-aware number input with Indian lakh/crore
// grouping and ISO-4217 symbol support.
//
// Wraps the existing Intl.NumberFormat for locale-correct output:
//   en-IN, hi-IN     → 1,23,456.78  (lakh/crore)
//   en-US, en-GB     → 123,456.78
//   de-DE            → 123.456,78
//
// The component stores the raw numeric value internally and re-formats on
// every keystroke. Backspace + cursor placement still feel natural because
// we restore caret position after each format.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type Ref,
} from 'react';
import { useTheme } from '../themes';

export type CurrencyCode =
  | 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'AUD' | 'CAD'
  | 'CHF' | 'SGD' | 'HKD' | 'AED' | 'SAR' | 'BRL' | 'MXN' | 'KRW'
  | 'PKR' | 'BDT' | 'LKR' | 'NPR';

export interface TkxCurrencyInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  /** ISO 4217 currency code. Default: INR. */
  currency?: CurrencyCode;
  /** BCP 47 locale for grouping. Default: en-IN for INR, navigator default otherwise. */
  locale?: string;
  /** Visible label. */
  label?: string;
  /** Min / max bounds. */
  min?: number;
  max?: number;
  /** Decimal precision. Default: 2 (or 0 for JPY/KRW). */
  precision?: number;
  /** Mark the field required for screen readers. */
  required?: boolean;
  /** Disable input. */
  disabled?: boolean;
  /** Show currency symbol prefix. Default: true. */
  showSymbol?: boolean;
  /** Optional id; auto-generated if omitted. */
  id?: string;
  /** Optional name (form submission). */
  name?: string;
  /** Optional className on the root container. */
  className?: string;
  /** Optional inline style on the root container. */
  style?: CSSProperties;
}

// Currencies that conventionally have no minor unit (no decimal places).
const ZERO_DECIMAL: ReadonlySet<CurrencyCode> = new Set(['JPY', 'KRW']);

function defaultLocale(currency: CurrencyCode): string {
  if (currency === 'INR') return 'en-IN';
  if (currency === 'PKR') return 'ur-PK';
  if (currency === 'BDT') return 'bn-BD';
  if (currency === 'JPY') return 'ja-JP';
  if (currency === 'KRW') return 'ko-KR';
  if (currency === 'CNY') return 'zh-CN';
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
  return 'en-US';
}

export const TkxCurrencyInput = forwardRef<HTMLInputElement, TkxCurrencyInputProps>(
  function TkxCurrencyInput(
    {
      value,
      onChange,
      currency = 'INR',
      locale,
      label,
      min,
      max,
      precision,
      required,
      disabled,
      showSymbol = true,
      id,
      name,
      className,
      style,
    },
    ref: Ref<HTMLInputElement>,
  ) {
    const theme = useTheme();
    const autoId = useId();
    const inputId = id ?? autoId;
    const inputRef = useRef<HTMLInputElement | null>(null);
    // Number of digit characters that were to the left of the caret at the
    // moment of the last edit. After the value reformats (group separators
    // may shift), we restore the caret to sit after the same digit count so
    // typing/backspacing doesn't fling the cursor to the end.
    const caretDigitsRef = useRef<number | null>(null);

    // Merge the forwarded ref with our internal one.
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
      },
      [ref],
    );
    const resolvedLocale = locale ?? defaultLocale(currency);
    const resolvedPrecision = precision ?? (ZERO_DECIMAL.has(currency) ? 0 : 2);

    const formatter = useMemo(
      () =>
        new Intl.NumberFormat(resolvedLocale, {
          minimumFractionDigits: 0,
          maximumFractionDigits: resolvedPrecision,
          useGrouping: true,
        }),
      [resolvedLocale, resolvedPrecision],
    );

    const symbol = useMemo(() => {
      try {
        // Format zero in `currency` style → extract the symbol the runtime would use.
        const parts = new Intl.NumberFormat(resolvedLocale, {
          style: 'currency',
          currency,
          currencyDisplay: 'narrowSymbol',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).formatToParts(0);
        const sym = parts.find((p) => p.type === 'currency');
        return sym?.value ?? currency;
      } catch {
        return currency;
      }
    }, [resolvedLocale, currency]);

    const display = value === null || Number.isNaN(value) ? '' : formatter.format(value);

    // Restore caret position after the value reformats. We walk the formatted
    // string counting digits and place the caret right after the Nth digit
    // (N = digits that were left of the caret before the edit), so inserted or
    // removed group separators don't push the cursor to the end.
    useLayoutEffect(() => {
      const want = caretDigitsRef.current;
      caretDigitsRef.current = null;
      const el = inputRef.current;
      if (want === null || !el || el !== document.activeElement) return;
      let seen = 0;
      let pos = display.length;
      for (let i = 0; i < display.length; i++) {
        if (/\d/.test(display[i])) {
          seen++;
          if (seen === want) {
            pos = i + 1;
            break;
          }
        }
      }
      if (want === 0) pos = 0;
      try {
        el.setSelectionRange(pos, pos);
      } catch {
        /* input type may not support selection in some environments */
      }
    }, [display]);

    const handleChange = useCallback(
      (raw: string, caretPos: number | null) => {
        // Remember how many digits sat left of the caret so we can restore it
        // after the controlled value reformats.
        if (caretPos !== null) {
          caretDigitsRef.current = (raw.slice(0, caretPos).match(/\d/g) ?? []).length;
        } else {
          caretDigitsRef.current = null;
        }
        // Strip everything except digits, minus sign (when min < 0), and a decimal separator.
        const cleaned = raw.replace(/[^\d.,\-]/g, '');
        // Determine which character is the decimal separator in the active locale.
        const sample = formatter.format(1.5);
        const decSep = sample.includes(',') && !sample.includes('.') ? ',' : '.';
        const normalised = cleaned
          .replace(new RegExp(`[^\\d\\-${decSep}]`, 'g'), '')
          .replace(decSep, '.');
        if (normalised === '' || normalised === '-') {
          onChange(null);
          return;
        }
        const num = Number(normalised);
        if (Number.isNaN(num)) return;
        let clamped = num;
        if (min !== undefined && clamped < min) clamped = min;
        if (max !== undefined && clamped > max) clamped = max;
        onChange(clamped);
      },
      [formatter, min, max, onChange],
    );

    // ── Styles ─────────────────────────────────────────────────────────────
    const rootStyle: CSSProperties = {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 6,
      width: '100%',
      maxWidth: 320,
      ...style,
    };
    const groupStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'stretch',
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      background: theme.surface,
      overflow: 'hidden',
    };
    const symbolStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0 12px',
      borderRight: `1px solid ${theme.border}`,
      color: theme.textMuted,
      fontSize: 14,
      fontVariantNumeric: 'tabular-nums',
      background: theme.bg,
    };
    const inputStyle: CSSProperties = {
      flex: 1,
      border: 'none',
      outline: 'none',
      padding: '0 12px',
      fontSize: 14,
      color: theme.text,
      background: 'transparent',
      minHeight: 40,
      minWidth: 0,
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
    };

    return (
      <div className={className} style={rootStyle}>
        {label && (
          <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>
            {label}
            {required && <span style={{ color: theme.danger, marginLeft: 4 }} aria-hidden="true">*</span>}
          </label>
        )}
        <div style={groupStyle}>
          {showSymbol && <span style={symbolStyle} aria-hidden="true">{symbol}</span>}
          <input
            ref={setInputRef}
            id={inputId}
            name={name}
            type="text"
            inputMode={resolvedPrecision > 0 ? 'decimal' : 'numeric'}
            value={display}
            onChange={(e) => handleChange(e.target.value, e.target.selectionStart)}
            disabled={disabled}
            required={required}
            aria-label={label ?? `Amount in ${currency}`}
            style={inputStyle}
          />
        </div>
      </div>
    );
  },
);

TkxCurrencyInput.displayName = 'TkxCurrencyInput';
