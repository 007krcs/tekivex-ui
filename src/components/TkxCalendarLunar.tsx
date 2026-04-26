'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxCalendarLunar — multi-calendar date picker.
//
// Supported calendars:
//   - "gregorian"   — standard ISO civil calendar
//   - "hindu"       — Tithi (lunar day) + Nakshatra (lunar mansion)
//                     Approximate computation; accurate to ±1 tithi.
//                     For ritual-grade precision, consumers should plug in
//                     a panchang API via the `tithiResolver` prop.
//   - "hijri"       — Islamic civil calendar via Intl.DateTimeFormat
//                     with calendar="islamic-civil". Accurate.
//   - "hebrew"      — Hebrew calendar via Intl.DateTimeFormat with
//                     calendar="hebrew". Accurate.
//   - "buddhist"    — Thai Buddhist (BE = CE + 543) via Intl.
//
// All output is a JS Date (Gregorian) — the alternate calendar is a
// display layer only. This keeps integration simple: pass through any
// date library; the lunar info is a UI affordance.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useMemo,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';

export type LunarCalendar = 'gregorian' | 'hindu' | 'hijri' | 'hebrew' | 'buddhist';

export interface LunarDate {
  /** The selected Gregorian Date. Authoritative. */
  gregorian: Date;
  /** Localised display string in the chosen calendar. */
  display: string;
  /** Hindu only — tithi index 1..30 (1 = Pratipada, 15 = Purnima/Amavasya). */
  tithi?: number;
  /** Hindu only — nakshatra index 1..27. */
  nakshatra?: number;
}

export interface TkxCalendarLunarProps {
  value: Date | null;
  onChange: (value: LunarDate) => void;
  /** Calendar system. Default: "gregorian". */
  calendar?: LunarCalendar;
  /** BCP 47 locale for display strings. Defaults to navigator language. */
  locale?: string;
  /** Optional override for tithi computation (e.g. panchang API). */
  tithiResolver?: (gregorian: Date) => { tithi: number; nakshatra: number };
  /** Visible label. */
  label?: string;
  /** Min / max bounds (Gregorian). */
  minDate?: Date;
  maxDate?: Date;
  /** Disable input. */
  disabled?: boolean;
  /** Optional className. */
  className?: string;
  /** Optional inline style. */
  style?: CSSProperties;
}

// ── Tithi computation (approximate) ─────────────────────────────────────────
//
// A tithi is the time it takes for the moon's longitude to gain 12° on the
// sun's. We compute mean longitudes (no perturbations) which is accurate to
// roughly ±1 tithi. For ceremonial use, plug a panchang API via tithiResolver.

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

function julianDay(d: Date): number {
  // Days since J2000.0 (2000-01-01 12:00 UT).
  return d.getTime() / 86400000 - 10957.5;
}

function meanSunLongitude(jd: number): number {
  return (280.460 + 0.9856474 * jd) % 360;
}

function meanMoonLongitude(jd: number): number {
  return (218.316 + 13.176396 * jd) % 360;
}

function computeTithi(d: Date): { tithi: number; nakshatra: number } {
  const jd = julianDay(d);
  const sun = meanSunLongitude(jd);
  const moon = meanMoonLongitude(jd);
  let diff = (moon - sun + 360) % 360;
  // Tithi: 30 phases of 12° each. 1..30.
  const tithi = Math.floor(diff / 12) + 1;
  // Nakshatra: 27 mansions of 13°20′ across the moon's longitude.
  const nakshatra = Math.floor((moon % 360) / (360 / 27)) + 1;
  return { tithi: Math.max(1, Math.min(30, tithi)), nakshatra };
}

// ── Display formatters ──────────────────────────────────────────────────────

function formatHindu(d: Date, locale: string, resolver?: TkxCalendarLunarProps['tithiResolver']): LunarDate {
  const { tithi, nakshatra } = resolver ? resolver(d) : computeTithi(d);
  const greg = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
  const tithiName = TITHI_NAMES[tithi - 1];
  const paksha = tithi <= 15 ? 'Shukla' : 'Krishna';
  const nakshatraName = NAKSHATRA_NAMES[nakshatra - 1];
  return {
    gregorian: d,
    display: `${greg} · ${paksha} ${tithiName} · ${nakshatraName}`,
    tithi,
    nakshatra,
  };
}

function formatWithCalendar(d: Date, locale: string, calendar: string): LunarDate {
  try {
    const fmt = new Intl.DateTimeFormat(`${locale}-u-ca-${calendar}`, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return { gregorian: d, display: fmt.format(d) };
  } catch {
    // Some Node/older browsers don't support the calendar override — fall
    // back to ISO display.
    return { gregorian: d, display: d.toISOString().slice(0, 10) };
  }
}

function formatGregorian(d: Date, locale: string): LunarDate {
  return {
    gregorian: d,
    display: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(d),
  };
}

function toLunarDate(
  d: Date,
  calendar: LunarCalendar,
  locale: string,
  resolver?: TkxCalendarLunarProps['tithiResolver'],
): LunarDate {
  switch (calendar) {
    case 'hindu':    return formatHindu(d, locale, resolver);
    case 'hijri':    return formatWithCalendar(d, locale, 'islamic-civil');
    case 'hebrew':   return formatWithCalendar(d, locale, 'hebrew');
    case 'buddhist': return formatWithCalendar(d, locale, 'buddhist');
    default:         return formatGregorian(d, locale);
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export const TkxCalendarLunar = forwardRef<HTMLInputElement, TkxCalendarLunarProps>(
  function TkxCalendarLunar(
    { value, onChange, calendar = 'gregorian', locale, tithiResolver, label, minDate, maxDate, disabled, className, style },
    ref: Ref<HTMLInputElement>,
  ) {
    const theme = useTheme();
    const localeStrings = useLocale();
    const resolvedLocale = locale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
    const [open, setOpen] = useState(false);

    const display = useMemo(() => {
      if (!value) return '';
      return toLunarDate(value, calendar, resolvedLocale, tithiResolver).display;
    }, [value, calendar, resolvedLocale, tithiResolver]);

    const handleNativePick = (iso: string) => {
      if (!iso) return;
      const d = new Date(`${iso}T00:00:00`);
      if (Number.isNaN(d.getTime())) return;
      if (minDate && d < minDate) return;
      if (maxDate && d > maxDate) return;
      onChange(toLunarDate(d, calendar, resolvedLocale, tithiResolver));
      setOpen(false);
    };

    // ── Styles ─────────────────────────────────────────────────────────────
    const rootStyle: CSSProperties = {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 6,
      width: '100%',
      maxWidth: 360,
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

    return (
      <div className={className} style={rootStyle}>
        {label && (
          <label style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>
            {label}
          </label>
        )}
        <div style={groupStyle}>
          <input
            ref={ref}
            type="text"
            readOnly
            value={display}
            onClick={() => !disabled && setOpen(true)}
            onFocus={() => !disabled && setOpen(true)}
            disabled={disabled}
            placeholder={localeStrings.selectDate}
            aria-label={label ?? localeStrings.selectDate}
            style={inputStyle}
          />
          <input
            type="date"
            value={value ? value.toISOString().slice(0, 10) : ''}
            onChange={(e) => handleNativePick(e.target.value)}
            min={minDate ? minDate.toISOString().slice(0, 10) : undefined}
            max={maxDate ? maxDate.toISOString().slice(0, 10) : undefined}
            disabled={disabled}
            aria-hidden="true"
            tabIndex={-1}
            style={{
              width: 36,
              border: 'none',
              borderLeft: `1px solid ${theme.border}`,
              padding: 0,
              background: theme.bg,
              color: theme.text,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          />
        </div>
        {open && value && calendar !== 'gregorian' && (
          <div
            role="status"
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              background: theme.surfaceAlt,
              fontSize: 12,
              color: theme.textMuted,
            }}
          >
            <strong style={{ color: theme.text }}>{calendar}:</strong> {display}
          </div>
        )}
      </div>
    );
  },
);

TkxCalendarLunar.displayName = 'TkxCalendarLunar';
