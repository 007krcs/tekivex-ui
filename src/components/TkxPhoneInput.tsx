'use client';

import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type CSSProperties,
  type ChangeEvent,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';

export interface CountryDialCode {
  code: string;
  iso: string;
  flag: string;
  /** Expected number of digits after the dial code. */
  expectedLength: number;
  /** Pattern segments for visual grouping (e.g., [5, 5] → "XXXXX XXXXX"). */
  groups?: ReadonlyArray<number>;
}

/** A focused list — Indian-first, then the most common NRI destinations. The
 *  host app can pass `countries` to override. */
export const DEFAULT_COUNTRIES: ReadonlyArray<CountryDialCode> = [
  { code: '+91', iso: 'IN', flag: '🇮🇳', expectedLength: 10, groups: [5, 5] },
  { code: '+1', iso: 'US', flag: '🇺🇸', expectedLength: 10, groups: [3, 3, 4] },
  { code: '+1', iso: 'CA', flag: '🇨🇦', expectedLength: 10, groups: [3, 3, 4] },
  { code: '+44', iso: 'GB', flag: '🇬🇧', expectedLength: 10, groups: [4, 6] },
  { code: '+61', iso: 'AU', flag: '🇦🇺', expectedLength: 9, groups: [3, 3, 3] },
  { code: '+971', iso: 'AE', flag: '🇦🇪', expectedLength: 9, groups: [2, 3, 4] },
  { code: '+966', iso: 'SA', flag: '🇸🇦', expectedLength: 9, groups: [2, 3, 4] },
  { code: '+65', iso: 'SG', flag: '🇸🇬', expectedLength: 8, groups: [4, 4] },
  { code: '+880', iso: 'BD', flag: '🇧🇩', expectedLength: 10, groups: [4, 6] },
  { code: '+977', iso: 'NP', flag: '🇳🇵', expectedLength: 10, groups: [4, 6] },
  { code: '+94', iso: 'LK', flag: '🇱🇰', expectedLength: 9, groups: [2, 3, 4] },
];

export interface TkxPhoneInputProps {
  /** Controlled E.164-style value (e.g. "+919876543210"). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, parts: { dialCode: string; nationalNumber: string }) => void;
  /** Default ISO country (matches one of `countries`). Default IN. */
  defaultCountry?: string;
  /** Override the country list. */
  countries?: ReadonlyArray<CountryDialCode>;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

const SIZE = {
  sm: { h: '36px', font: '0.875rem' },
  md: { h: '44px', font: '1rem' },
  lg: { h: '52px', font: '1.125rem' },
};

function formatNational(digits: string, groups?: ReadonlyArray<number>): string {
  if (!groups) return digits;
  const out: string[] = [];
  let i = 0;
  for (const g of groups) {
    out.push(digits.slice(i, i + g));
    i += g;
  }
  if (i < digits.length) out.push(digits.slice(i));
  return out.filter(Boolean).join(' ');
}

/**
 * Phone-number input with a country dial-code dropdown and live grouping.
 * The emitted value is "+CC{nationalDigits}" (no spaces); the displayed value
 * is grouped according to the country's standard pattern.
 */
export const TkxPhoneInput = forwardRef<HTMLInputElement, TkxPhoneInputProps>(
  function TkxPhoneInput(
    {
      value,
      defaultValue = '',
      onChange,
      defaultCountry = 'IN',
      countries = DEFAULT_COUNTRIES,
      isDisabled,
      isInvalid,
      errorMessage,
      hint,
      size = 'md',
      className,
      style,
    },
    ref,
  ) {
    const theme = useTheme();
    const id = useId();
    const initial = (value ?? defaultValue ?? '').trim();

    const initialCountryISO =
      countries.find((c) => initial.startsWith(c.code))?.iso ?? defaultCountry;
    const [iso, setIso] = useState(initialCountryISO);
    const [digits, setDigits] = useState(() => {
      const country = countries.find((c) => c.iso === initialCountryISO);
      if (!country) return '';
      return initial.startsWith(country.code) ? initial.slice(country.code.length) : '';
    });

    const country = countries.find((c) => c.iso === iso) ?? countries[0];
    const tooLong = digits.length > country.expectedLength;
    const tooShort = digits.length > 0 && digits.length < country.expectedLength;
    const externalInvalid = isInvalid || !!errorMessage;
    const showError = externalInvalid || tooLong;
    const safeHint = hint ? sanitizeString(hint) : undefined;
    const safeError = errorMessage ? sanitizeString(errorMessage) : undefined;

    const handleNumberChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, country.expectedLength);
        setDigits(raw);
        onChange?.(raw ? `${country.code}${raw}` : '', {
          dialCode: country.code,
          nationalNumber: raw,
        });
      },
      [country, onChange],
    );

    const handleCountryChange = useCallback(
      (e: ChangeEvent<HTMLSelectElement>) => {
        const next = countries.find((c) => `${c.iso}-${c.code}` === e.target.value);
        if (!next) return;
        setIso(next.iso);
        const trimmed = digits.slice(0, next.expectedLength);
        setDigits(trimmed);
        onChange?.(trimmed ? `${next.code}${trimmed}` : '', {
          dialCode: next.code,
          nationalNumber: trimmed,
        });
      },
      [countries, digits, onChange],
    );

    const sz = SIZE[size];
    const borderColor = showError ? theme.danger : tooShort ? theme.warning ?? theme.border : theme.border;

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 8,
            background: isDisabled ? theme.surfaceAlt : theme.surface,
            opacity: isDisabled ? 0.6 : 1,
            height: sz.h,
            overflow: 'hidden',
          }}
          data-tkx-phone-input={showError ? 'invalid' : tooShort ? 'incomplete' : 'ok'}
        >
          <select
            value={`${country.iso}-${country.code}`}
            onChange={handleCountryChange}
            disabled={isDisabled}
            aria-label="Country dial code"
            style={{
              border: 'none',
              outline: 'none',
              padding: '0 8px',
              height: '100%',
              background: 'transparent',
              fontSize: sz.font,
              color: theme.text,
            }}
          >
            {countries.map((c) => (
              <option key={`${c.iso}-${c.code}`} value={`${c.iso}-${c.code}`}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <input
            ref={ref}
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder={'•'.repeat(country.expectedLength)}
            value={formatNational(digits, country.groups)}
            disabled={isDisabled}
            aria-invalid={showError || undefined}
            onChange={handleNumberChange}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '0 12px',
              height: '100%',
              fontSize: sz.font,
              fontFamily: 'inherit',
              color: theme.text,
              background: 'transparent',
            }}
          />
        </div>
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

TkxPhoneInput.displayName = 'TkxPhoneInput';
