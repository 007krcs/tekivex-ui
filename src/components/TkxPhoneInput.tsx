'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxPhoneInput — internationalised phone-number input.
//
// Features:
//   - Country picker (flag emoji, name, dial code, search)
//   - Live formatting as the user types (per-country pattern)
//   - E.164 normalisation in onChange payload
//   - Basic length validation (no libphonenumber; ~3KB total country table)
//   - WCAG: keyboard-navigable picker, aria-expanded, aria-controls,
//           role="listbox", visible focus, screen-reader-friendly
//
// Tradeoff: format patterns are a best-effort baseline (length + grouping),
// not the full libphonenumber matrix. For pixel-perfect validation, consumers
// should use a server-side libphonenumber check on submit. The component is
// designed so its `valid` flag is conservative — true ⇒ probably valid;
// false ⇒ definitely invalid.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';

export interface PhoneCountry {
  /** ISO 3166-1 alpha-2 country code, lowercase. */
  iso2: string;
  /** English display name. */
  name: string;
  /** International dial code (digits only, no +). */
  dial: string;
  /** Expected national number length (single value or [min, max]). */
  length: number | [number, number];
  /** Optional: ASCII grouping pattern (e.g. "## ##### ####"). */
  format?: string;
  /** Country flag as emoji (regional indicator pair). */
  flag: string;
}

// A pragmatic subset chosen for breadth (every continent), launch-relevant
// markets, and the South-Asian diaspora. Add via the `extraCountries` prop.
export const COUNTRIES: PhoneCountry[] = [
  { iso2: 'in', name: 'India',           dial: '91',  length: 10,        format: '##### #####',     flag: '🇮🇳' },
  { iso2: 'us', name: 'United States',   dial: '1',   length: 10,        format: '(###) ###-####',  flag: '🇺🇸' },
  { iso2: 'gb', name: 'United Kingdom',  dial: '44',  length: [9, 10],   format: '#### ######',     flag: '🇬🇧' },
  { iso2: 'ca', name: 'Canada',          dial: '1',   length: 10,        format: '(###) ###-####',  flag: '🇨🇦' },
  { iso2: 'au', name: 'Australia',       dial: '61',  length: 9,         format: '### ### ###',     flag: '🇦🇺' },
  { iso2: 'de', name: 'Germany',         dial: '49',  length: [10, 11],  format: '#### ########',   flag: '🇩🇪' },
  { iso2: 'fr', name: 'France',          dial: '33',  length: 9,         format: '# ## ## ## ##',   flag: '🇫🇷' },
  { iso2: 'es', name: 'Spain',           dial: '34',  length: 9,         format: '### ### ###',     flag: '🇪🇸' },
  { iso2: 'it', name: 'Italy',           dial: '39',  length: [9, 10],   format: '### ### ####',    flag: '🇮🇹' },
  { iso2: 'nl', name: 'Netherlands',     dial: '31',  length: 9,         format: '# #### ####',     flag: '🇳🇱' },
  { iso2: 'se', name: 'Sweden',          dial: '46',  length: [7, 9],    format: '## ### ## ##',    flag: '🇸🇪' },
  { iso2: 'no', name: 'Norway',          dial: '47',  length: 8,         format: '### ## ###',      flag: '🇳🇴' },
  { iso2: 'dk', name: 'Denmark',         dial: '45',  length: 8,         format: '## ## ## ##',     flag: '🇩🇰' },
  { iso2: 'fi', name: 'Finland',         dial: '358', length: [9, 10],   format: '## ### ####',     flag: '🇫🇮' },
  { iso2: 'pl', name: 'Poland',          dial: '48',  length: 9,         format: '### ### ###',     flag: '🇵🇱' },
  { iso2: 'ie', name: 'Ireland',         dial: '353', length: 9,         format: '## ### ####',     flag: '🇮🇪' },
  { iso2: 'pt', name: 'Portugal',        dial: '351', length: 9,         format: '### ### ###',     flag: '🇵🇹' },
  { iso2: 'ch', name: 'Switzerland',     dial: '41',  length: 9,         format: '## ### ## ##',    flag: '🇨🇭' },
  { iso2: 'at', name: 'Austria',         dial: '43',  length: [10, 11],  format: '### ### ####',    flag: '🇦🇹' },
  { iso2: 'be', name: 'Belgium',         dial: '32',  length: 9,         format: '### ## ## ##',    flag: '🇧🇪' },
  { iso2: 'jp', name: 'Japan',           dial: '81',  length: 10,        format: '## #### ####',    flag: '🇯🇵' },
  { iso2: 'kr', name: 'South Korea',     dial: '82',  length: [9, 10],   format: '## #### ####',    flag: '🇰🇷' },
  { iso2: 'cn', name: 'China',           dial: '86',  length: 11,        format: '### #### ####',   flag: '🇨🇳' },
  { iso2: 'hk', name: 'Hong Kong',       dial: '852', length: 8,         format: '#### ####',       flag: '🇭🇰' },
  { iso2: 'sg', name: 'Singapore',       dial: '65',  length: 8,         format: '#### ####',       flag: '🇸🇬' },
  { iso2: 'my', name: 'Malaysia',        dial: '60',  length: [9, 10],   format: '## ### ####',     flag: '🇲🇾' },
  { iso2: 'id', name: 'Indonesia',       dial: '62',  length: [9, 12],   format: '### ### ####',    flag: '🇮🇩' },
  { iso2: 'th', name: 'Thailand',        dial: '66',  length: 9,         format: '## ### ####',     flag: '🇹🇭' },
  { iso2: 'vn', name: 'Vietnam',         dial: '84',  length: [9, 10],   format: '### ### ####',    flag: '🇻🇳' },
  { iso2: 'ph', name: 'Philippines',     dial: '63',  length: 10,        format: '### ### ####',    flag: '🇵🇭' },
  { iso2: 'pk', name: 'Pakistan',        dial: '92',  length: 10,        format: '### #######',     flag: '🇵🇰' },
  { iso2: 'bd', name: 'Bangladesh',      dial: '880', length: 10,        format: '#### ######',     flag: '🇧🇩' },
  { iso2: 'lk', name: 'Sri Lanka',       dial: '94',  length: 9,         format: '## ### ####',     flag: '🇱🇰' },
  { iso2: 'np', name: 'Nepal',           dial: '977', length: 10,        format: '###-#######',     flag: '🇳🇵' },
  { iso2: 'ae', name: 'UAE',             dial: '971', length: 9,         format: '## ### ####',     flag: '🇦🇪' },
  { iso2: 'sa', name: 'Saudi Arabia',    dial: '966', length: 9,         format: '## ### ####',     flag: '🇸🇦' },
  { iso2: 'qa', name: 'Qatar',           dial: '974', length: 8,         format: '#### ####',       flag: '🇶🇦' },
  { iso2: 'kw', name: 'Kuwait',          dial: '965', length: 8,         format: '#### ####',       flag: '🇰🇼' },
  { iso2: 'om', name: 'Oman',            dial: '968', length: 8,         format: '#### ####',       flag: '🇴🇲' },
  { iso2: 'bh', name: 'Bahrain',         dial: '973', length: 8,         format: '#### ####',       flag: '🇧🇭' },
  { iso2: 'il', name: 'Israel',          dial: '972', length: 9,         format: '## ### ####',     flag: '🇮🇱' },
  { iso2: 'tr', name: 'Turkey',          dial: '90',  length: 10,        format: '### ### ####',    flag: '🇹🇷' },
  { iso2: 'ru', name: 'Russia',          dial: '7',   length: 10,        format: '### ### ####',    flag: '🇷🇺' },
  { iso2: 'ua', name: 'Ukraine',         dial: '380', length: 9,         format: '## ### ####',     flag: '🇺🇦' },
  { iso2: 'br', name: 'Brazil',          dial: '55',  length: [10, 11],  format: '## ##### ####',   flag: '🇧🇷' },
  { iso2: 'mx', name: 'Mexico',          dial: '52',  length: 10,        format: '## #### ####',    flag: '🇲🇽' },
  { iso2: 'ar', name: 'Argentina',       dial: '54',  length: 10,        format: '## #### ####',    flag: '🇦🇷' },
  { iso2: 'cl', name: 'Chile',           dial: '56',  length: 9,         format: '# #### ####',     flag: '🇨🇱' },
  { iso2: 'co', name: 'Colombia',        dial: '57',  length: 10,        format: '### ### ####',    flag: '🇨🇴' },
  { iso2: 'pe', name: 'Peru',            dial: '51',  length: 9,         format: '### ### ###',     flag: '🇵🇪' },
  { iso2: 'za', name: 'South Africa',    dial: '27',  length: 9,         format: '## ### ####',     flag: '🇿🇦' },
  { iso2: 'ng', name: 'Nigeria',         dial: '234', length: 10,        format: '### ### ####',    flag: '🇳🇬' },
  { iso2: 'ke', name: 'Kenya',           dial: '254', length: 9,         format: '### ### ###',     flag: '🇰🇪' },
  { iso2: 'eg', name: 'Egypt',           dial: '20',  length: 10,        format: '### ### ####',    flag: '🇪🇬' },
  { iso2: 'ma', name: 'Morocco',         dial: '212', length: 9,         format: '## ### ####',     flag: '🇲🇦' },
  { iso2: 'nz', name: 'New Zealand',     dial: '64',  length: [8, 9],    format: '## ### ####',     flag: '🇳🇿' },
];

export interface PhoneChangePayload {
  /** What the user typed, with formatting. */
  raw: string;
  /** Digits only, no formatting. */
  digits: string;
  /** Full international form, e.g. "+919876543210". */
  e164: string;
  /** Country selected at the time of the change. */
  country: PhoneCountry;
  /** Conservative validity check (length matches expected). */
  valid: boolean;
}

export interface TkxPhoneInputProps {
  /** Initial country (ISO 3166-1 alpha-2, lowercase). Defaults to "in". */
  defaultCountry?: string;
  /** Controlled value (E.164, e.g. "+919876543210"). */
  value?: string;
  /** Initial digits (without country code). For uncontrolled use. */
  defaultValue?: string;
  /** Fires on every keystroke and country change. */
  onChange?: (payload: PhoneChangePayload) => void;
  /** Fires when the input loses focus, only if `valid`. */
  onValid?: (payload: PhoneChangePayload) => void;
  /** Visible label above the input (required for WCAG compliance). */
  label?: string;
  /** Placeholder shown inside the input. Defaults to a country-specific example. */
  placeholder?: string;
  /** Disable input + picker. */
  disabled?: boolean;
  /** Mark required for screen readers. */
  required?: boolean;
  /** Optional id; auto-generated if omitted. */
  id?: string;
  /** Optional name (form submission). */
  name?: string;
  /** Optional list of additional countries to merge with the built-in set. */
  extraCountries?: PhoneCountry[];
  /** Optional className on the root <div>. */
  className?: string;
  /** Optional inline style on the root <div>. */
  style?: CSSProperties;
}

function digitsOnly(s: string) {
  return s.replace(/\D+/g, '');
}

function applyFormat(digits: string, format: string | undefined): string {
  if (!format) return digits;
  let out = '';
  let di = 0;
  for (const ch of format) {
    if (ch === '#') {
      if (di >= digits.length) break;
      out += digits[di++];
    } else {
      // separator — only emit if more digits will follow
      if (di < digits.length) out += ch;
    }
  }
  // Trailing digits beyond the format mask: append raw
  if (di < digits.length) out += digits.slice(di);
  return out;
}

function isLengthValid(digits: string, expected: number | [number, number]) {
  if (Array.isArray(expected)) {
    return digits.length >= expected[0] && digits.length <= expected[1];
  }
  return digits.length === expected;
}

function expectedLengthLabel(expected: number | [number, number]) {
  return Array.isArray(expected) ? `${expected[0]}–${expected[1]}` : `${expected}`;
}

export const TkxPhoneInput = forwardRef<HTMLInputElement, TkxPhoneInputProps>(
  function TkxPhoneInput(
    {
      defaultCountry = 'in',
      value,
      defaultValue,
      onChange,
      onValid,
      label,
      placeholder,
      disabled,
      required,
      id,
      name,
      extraCountries = [],
      className,
      style,
    },
    ref,
  ) {
    const theme = useTheme();
    const inputId = useId();
    const listboxId = useId();

    const allCountries = useMemo(
      () => [...COUNTRIES, ...extraCountries].sort((a, b) => a.name.localeCompare(b.name)),
      [extraCountries],
    );

    // Resolve initial country
    const findByIso = (iso: string) =>
      allCountries.find((c) => c.iso2 === iso.toLowerCase()) || allCountries[0];

    // If a controlled E.164 value was passed, parse it for country detection.
    const parseE164 = (e164: string): { country: PhoneCountry; digits: string } => {
      if (!e164.startsWith('+')) return { country: findByIso(defaultCountry), digits: digitsOnly(e164) };
      const all = digitsOnly(e164);
      // Greedy: try longest dial prefix first (3 then 2 then 1).
      for (const len of [4, 3, 2, 1]) {
        const prefix = all.slice(0, len);
        const match = allCountries.find((c) => c.dial === prefix);
        if (match) return { country: match, digits: all.slice(len) };
      }
      return { country: findByIso(defaultCountry), digits: all };
    };

    const initial = value ? parseE164(value) : { country: findByIso(defaultCountry), digits: digitsOnly(defaultValue || '') };

    const [country, setCountry] = useState<PhoneCountry>(initial.country);
    const [digits, setDigits] = useState<string>(initial.digits);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);

    const pickerBtnRef = useRef<HTMLButtonElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);

    // Sync controlled value
    useEffect(() => {
      if (value === undefined) return;
      const parsed = parseE164(value);
      setCountry(parsed.country);
      setDigits(parsed.digits);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const formatted = applyFormat(digits, country.format);
    const valid = isLengthValid(digits, country.length);
    const e164 = digits ? `+${country.dial}${digits}` : '';

    const emit = (nextDigits: string, nextCountry: PhoneCountry) => {
      const payload: PhoneChangePayload = {
        raw: applyFormat(nextDigits, nextCountry.format),
        digits: nextDigits,
        e164: nextDigits ? `+${nextCountry.dial}${nextDigits}` : '',
        country: nextCountry,
        valid: isLengthValid(nextDigits, nextCountry.length),
      };
      onChange?.(payload);
    };

    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
      // Strip any non-digit input. The display string then gets reformatted.
      const next = digitsOnly(e.target.value);
      // Cap at 15 digits (E.164 max).
      const capped = next.slice(0, 15);
      setDigits(capped);
      emit(capped, country);
    };

    const handleBlur = () => {
      if (valid && onValid) {
        onValid({
          raw: formatted,
          digits,
          e164,
          country,
          valid: true,
        });
      }
    };

    const choose = (c: PhoneCountry) => {
      setCountry(c);
      setPickerOpen(false);
      emit(digits, c);
      pickerBtnRef.current?.focus();
    };

    const filtered = useMemo(() => {
      const q = search.trim().toLowerCase();
      if (!q) return allCountries;
      return allCountries.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.iso2.includes(q) ||
          c.dial.includes(q.replace(/^\+/, '')),
      );
    }, [allCountries, search]);

    useEffect(() => {
      setActiveIdx(0);
    }, [search]);

    useEffect(() => {
      if (pickerOpen) {
        // Defer focus to the next frame so the input is mounted.
        const t = setTimeout(() => searchRef.current?.focus(), 0);
        return () => clearTimeout(t);
      }
    }, [pickerOpen]);

    const handlePickerKey = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!pickerOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[activeIdx]) choose(filtered[activeIdx]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setPickerOpen(false);
        pickerBtnRef.current?.focus();
      }
    };

    const placeholderText = placeholder ?? expectedLengthLabel(country.length).replace(/\d/g, '#');

    // ── Styles ─────────────────────────────────────────────────────────────
    const rootStyle: CSSProperties = {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 6,
      width: '100%',
      maxWidth: 360,
      ...style,
    };
    const labelStyle: CSSProperties = {
      fontSize: 13,
      fontWeight: 600,
      color: theme.text,
    };
    const groupStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'stretch',
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      background: theme.surface,
      overflow: 'visible',
      position: 'relative',
    };
    const pickerBtnStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '0 10px',
      background: 'transparent',
      border: 'none',
      borderRight: `1px solid ${theme.border}`,
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: theme.text,
      fontSize: 14,
      minHeight: 40,
      fontWeight: 500,
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
    };
    const dropdownStyle: CSSProperties = {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      right: 0,
      maxHeight: 280,
      overflow: 'auto',
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      zIndex: 1000,
      padding: 6,
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    };
    const searchInputStyle: CSSProperties = {
      width: '100%',
      padding: '8px 10px',
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      background: theme.bg,
      color: theme.text,
      fontSize: 13,
      marginBottom: 6,
      outline: 'none',
    };
    const optionStyle = (active: boolean): CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      borderRadius: 6,
      cursor: 'pointer',
      background: active ? theme.surfaceAlt : 'transparent',
      color: theme.text,
      fontSize: 13,
    });
    const errStyle: CSSProperties = {
      fontSize: 12,
      color: theme.danger,
      marginTop: 2,
    };

    return (
      <div className={className} style={rootStyle} onKeyDown={handlePickerKey}>
        {label && (
          <label htmlFor={id || inputId} style={labelStyle}>
            {label}
            {required && <span style={{ color: theme.danger, marginLeft: 4 }} aria-hidden="true">*</span>}
          </label>
        )}
        <div style={groupStyle}>
          <button
            ref={pickerBtnRef}
            type="button"
            style={pickerBtnStyle}
            onClick={() => !disabled && setPickerOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            aria-controls={listboxId}
            aria-label={`Country: ${country.name}, dial code +${country.dial}`}
            disabled={disabled}
          >
            <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>{country.flag}</span>
            <span aria-hidden="true">+{country.dial}</span>
            <span aria-hidden="true" style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>▾</span>
          </button>
          <input
            ref={ref}
            id={id || inputId}
            name={name}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={formatted}
            onChange={handleInput}
            onBlur={handleBlur}
            placeholder={placeholderText}
            disabled={disabled}
            required={required}
            aria-invalid={digits.length > 0 && !valid}
            aria-describedby={digits.length > 0 && !valid ? `${inputId}-err` : undefined}
            style={inputStyle}
          />

          {pickerOpen && !disabled && (
            <div
              id={listboxId}
              role="listbox"
              aria-label="Select country"
              style={dropdownStyle}
            >
              <input
                ref={searchRef}
                type="text"
                placeholder="Search country or dial code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInputStyle}
                aria-label="Filter countries"
              />
              {filtered.length === 0 && (
                <div style={{ padding: '12px 10px', fontSize: 13, color: theme.textMuted }}>
                  No country matches "{search}"
                </div>
              )}
              {filtered.map((c, i) => (
                <div
                  key={c.iso2}
                  role="option"
                  aria-selected={i === activeIdx}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => choose(c)}
                  style={optionStyle(i === activeIdx)}
                >
                  <span aria-hidden="true" style={{ fontSize: 16 }}>{c.flag}</span>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  <span style={{ color: theme.textMuted, fontVariantNumeric: 'tabular-nums' }}>+{c.dial}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {digits.length > 0 && !valid && (
          <div id={`${inputId}-err`} role="alert" style={errStyle}>
            Expected {expectedLengthLabel(country.length)} digits for {country.name}.
          </div>
        )}
      </div>
    );
  },
);

TkxPhoneInput.displayName = 'TkxPhoneInput';
