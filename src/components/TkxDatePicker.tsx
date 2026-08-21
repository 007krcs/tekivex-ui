'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  useMemo,
  useReducer,
  forwardRef,
  type CSSProperties,
  type ForwardedRef,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { useLocale, type LocaleStrings } from '../i18n';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DatePickerMode = 'single' | 'range' | 'multiple';
export type DatePickerView = 'day' | 'month' | 'year';
export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DatePreset {
  label: string;
  getValue: () => [Date, Date];
}

export interface TkxDatePickerProps {
  // Value
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  rangeValue?: [Date | null, Date | null];
  onRangeChange?: (range: [Date | null, Date | null]) => void;
  multiValue?: Date[];
  onMultiChange?: (dates: Date[]) => void;

  // Config
  mode?: DatePickerMode;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[] | ((date: Date) => boolean);
  locale?: string;
  dateFormat?: string;
  /** First day of the week: 0=Sunday (default) … 6=Saturday. */
  weekStartsOn?: WeekStartsOn;
  /** When set, a hidden input posts the committed value in plain HTML forms. */
  name?: string;

  // Time picker
  showTime?: boolean;
  timeValue?: { h: number; m: number };
  onTimeChange?: (time: { h: number; m: number }) => void;

  // Presets
  showPresets?: boolean;
  customPresets?: DatePreset[];

  // UI
  label?: string;
  placeholder?: string;
  hint?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  numberOfMonths?: number;

  id?: string;
  className?: string;
  style?: CSSProperties;
}

// ── Localized calendar labels ─────────────────────────────────────────────────
//
// The library ships 44 locales, so weekday/month labels must come from
// Intl.DateTimeFormat rather than hardcoded English constants. Results are
// cached per locale+style — label sets are tiny and immutable.

function makeDateTimeFormat(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat(locale || 'en', options);
  } catch {
    // Invalid BCP-47 tag from a consumer — fall back to English.
    return new Intl.DateTimeFormat('en', options);
  }
}

const monthNamesCache = new Map<string, string[]>();

/** Localized month names for months 0..11 ('long' → January…, 'short' → Jan…). */
function getMonthNames(locale: string, style: 'long' | 'short'): string[] {
  const key = `${locale}|${style}`;
  let names = monthNamesCache.get(key);
  if (!names) {
    const fmt = makeDateTimeFormat(locale, { month: style });
    names = Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2023, m, 1)));
    monthNamesCache.set(key, names);
  }
  return names;
}

const weekdayLabelsCache = new Map<string, string[]>();

/** Localized short weekday labels, Sunday-first (index 0=Sun … 6=Sat). */
function getWeekdayShortLabels(locale: string): string[] {
  let labels = weekdayLabelsCache.get(locale);
  if (!labels) {
    const fmt = makeDateTimeFormat(locale, { weekday: 'short' });
    // 2023-01-01 is a Sunday, so 2023-01-01 … 2023-01-07 covers Sun..Sat.
    labels = Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
    weekdayLabelsCache.set(locale, labels);
  }
  return labels;
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isInRange(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = startOfDay(d).getTime();
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  const lo = Math.min(s, e);
  const hi = Math.max(s, e);
  return t > lo && t < hi;
}

function isRangeEndpoint(d: Date, start: Date | null, end: Date | null): boolean {
  if (start && isSameDay(d, start)) return true;
  if (end && isSameDay(d, end)) return true;
  return false;
}

/**
 * Format a date using either a custom token-based `dateFormat` string
 * (e.g. "YYYY-MM-DD", "DD/MM/YYYY", "MMM D, YYYY") or fall back to the
 * locale's 2-digit date style.
 *
 * Supported tokens: YYYY, YY, MMMM, MMM, MM, M, DD, D.
 */
function formatDate(
  d: Date | null | undefined,
  locale = 'en-US',
  dateFormat?: string,
): string {
  if (!d) return '';
  if (dateFormat) {
    const yyyy = String(d.getFullYear());
    const yy = yyyy.slice(-2);
    const M = d.getMonth() + 1;
    const MM = String(M).padStart(2, '0');
    const MMM = getMonthNames(locale, 'short')[d.getMonth()];
    const MMMM = getMonthNames(locale, 'long')[d.getMonth()];
    const D = d.getDate();
    const DD = String(D).padStart(2, '0');
    // Order matters: longest tokens first so "MM" doesn't clobber "MMM".
    return dateFormat
      .replace(/YYYY/g, yyyy)
      .replace(/YY/g, yy)
      .replace(/MMMM/g, MMMM)
      .replace(/MMM/g, MMM)
      .replace(/MM/g, MM)
      .replace(/\bM\b/g, String(M))
      .replace(/DD/g, DD)
      .replace(/\bD\b/g, String(D));
  }
  return d.toLocaleDateString(locale, { month: '2-digit', day: '2-digit', year: 'numeric' });
}

/**
 * Parse a date string. Accepts US MM/DD/YYYY and common ISO-ish shapes
 * (YYYY-MM-DD, DD/MM/YYYY, D/M/YYYY). If `dateFormat` is supplied and the
 * input doesn't match any format, we attempt a token-driven parse.
 */
function parseDate(str: string, dateFormat?: string): Date | null {
  // MM/DD/YYYY (legacy default)
  const us = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    const [, m, d, y] = us.map(Number);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const date = new Date(y, m - 1, d);
      if (date.getMonth() === m - 1) return date;
    }
  }
  // YYYY-MM-DD
  const iso = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const [, y, m, d] = iso.map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getMonth() === m - 1) return date;
  }
  // DD/MM/YYYY when user explicitly asked for a DD-first format
  if (dateFormat && /^DD/.test(dateFormat)) {
    const eu = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (eu) {
      const [, d, m, y] = eu.map(Number);
      const date = new Date(y, m - 1, d);
      if (date.getMonth() === m - 1) return date;
    }
  }
  return null;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getCalendarGrid(year: number, month: number, weekStartsOn: WeekStartsOn = 0): Date[] {
  // Column offset of the 1st of the month relative to the week's first day.
  const firstDay = (new Date(year, month, 1).getDay() - weekStartsOn + 7) % 7;
  const daysInMonth = getDaysInMonth(year, month);
  const cells: Date[] = [];

  // Previous month tail
  const prevDays = getDaysInMonth(year, month - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push(new Date(year, month - 1, prevDays - i));
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  // Next month head
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push(new Date(year, month + 1, nextDay++));
  }
  return cells;
}

function getDecadeStart(year: number): number {
  return Math.floor(year / 10) * 10;
}

// ── Built-in presets ──────────────────────────────────────────────────────────

function buildBuiltinPresets(t?: LocaleStrings): DatePreset[] {
  // Optional locale strings — falls back to English. The new optional fields
  // (yesterday, last7Days, last30Days, thisMonth, lastMonth) are translated
  // gradually across the 44 locales.
  const lbl = {
    today: t?.today ?? 'Today',
    yesterday: t?.yesterday ?? 'Yesterday',
    last7: t?.last7Days ?? 'Last 7 days',
    last30: t?.last30Days ?? 'Last 30 days',
    last90: 'Last 90 days',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    thisMonth: t?.thisMonth ?? 'This month',
    lastMonth: t?.lastMonth ?? 'Last month',
  };
  return [
    {
      label: lbl.today,
      getValue: () => {
        const d = startOfDay(new Date());
        return [d, d];
      },
    },
    {
      label: lbl.yesterday,
      getValue: () => {
        const y = startOfDay(new Date());
        y.setDate(y.getDate() - 1);
        return [y, y];
      },
    },
    {
      label: lbl.last7,
      getValue: () => {
        const end = startOfDay(new Date());
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return [start, end];
      },
    },
    {
      label: lbl.last30,
      getValue: () => {
        const end = startOfDay(new Date());
        const start = new Date(end);
        start.setDate(start.getDate() - 29);
        return [start, end];
      },
    },
    {
      label: lbl.last90,
      getValue: () => {
        const end = startOfDay(new Date());
        const start = new Date(end);
        start.setDate(start.getDate() - 89);
        return [start, end];
      },
    },
    {
      label: lbl.thisWeek,
      getValue: () => {
        const today = startOfDay(new Date());
        const start = new Date(today);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return [start, end];
      },
    },
    {
      label: lbl.lastWeek,
      getValue: () => {
        const today = startOfDay(new Date());
        const end = new Date(today);
        end.setDate(end.getDate() - end.getDay() - 1);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return [start, end];
      },
    },
    {
      label: lbl.thisMonth,
      getValue: () => {
        const t = new Date();
        return [
          new Date(t.getFullYear(), t.getMonth(), 1),
          new Date(t.getFullYear(), t.getMonth() + 1, 0),
        ];
      },
    },
    {
      label: lbl.lastMonth,
      getValue: () => {
        const t = new Date();
        return [
          new Date(t.getFullYear(), t.getMonth() - 1, 1),
          new Date(t.getFullYear(), t.getMonth(), 0),
        ];
      },
    },
    {
      label: 'This quarter',
      getValue: () => {
        const t = new Date();
        const q = Math.floor(t.getMonth() / 3);
        return [
          new Date(t.getFullYear(), q * 3, 1),
          new Date(t.getFullYear(), q * 3 + 3, 0),
        ];
      },
    },
    {
      label: 'Last quarter',
      getValue: () => {
        const t = new Date();
        const q = Math.floor(t.getMonth() / 3);
        const prevQ = q === 0 ? 3 : q - 1;
        const prevY = q === 0 ? t.getFullYear() - 1 : t.getFullYear();
        return [
          new Date(prevY, prevQ * 3, 1),
          new Date(prevY, prevQ * 3 + 3, 0),
        ];
      },
    },
    {
      label: 'This year',
      getValue: () => {
        const y = new Date().getFullYear();
        return [new Date(y, 0, 1), new Date(y, 11, 31)];
      },
    },
    {
      label: 'Last year',
      getValue: () => {
        const y = new Date().getFullYear() - 1;
        return [new Date(y, 0, 1), new Date(y, 11, 31)];
      },
    },
  ];
}

// ── Portal helper ─────────────────────────────────────────────────────────────

interface PopupPosition {
  top: number;
  left: number;
  flipUp: boolean;
}

function getPopupPosition(
  anchorEl: HTMLElement,
  popupHeight: number,
): PopupPosition {
  const rect = anchorEl.getBoundingClientRect();
  const viewportH = window.innerHeight;
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  const spaceBelow = viewportH - rect.bottom;
  const flipUp = spaceBelow < popupHeight + 8 && rect.top > popupHeight + 8;

  return {
    top: flipUp
      ? scrollY + rect.top - popupHeight - 4
      : scrollY + rect.bottom + 4,
    left: scrollX + rect.left,
    flipUp,
  };
}

// ── Time Picker Column ────────────────────────────────────────────────────────

interface TimeColumnProps {
  values: number[];
  selected: number;
  onSelect: (v: number) => void;
  label: string;
  theme: ReturnType<typeof import('../themes').useTheme>;
  format?: (v: number) => string;
}

function TimeColumn({ values, selected, onSelect, label, theme, format }: TimeColumnProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = itemRefs.current[selected];
    if (el && containerRef.current) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selected]);

  const fmt = format ?? ((v: number) => String(v).padStart(2, '0'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: theme.css.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div
        ref={containerRef}
        style={{
          height: '160px',
          overflowY: 'auto',
          width: '52px',
          scrollbarWidth: 'thin',
          border: `1px solid ${theme.css.border}`,
          borderRadius: '8px',
          padding: '4px',
        }}
      >
        {values.map((v) => {
          const isSelected = v === selected;
          return (
            <button
              key={v}
              ref={(el) => { itemRefs.current[v] = el; }}
              type="button"
              onClick={() => onSelect(v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: isSelected ? 600 : 400,
                backgroundColor: isSelected ? theme.css.primary : 'transparent',
                color: isSelected ? theme.css.bg : theme.css.text,
                fontFamily: 'monospace',
                transition: 'background-color 100ms ease',
              }}
            >
              {fmt(v)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Calendar Month Grid ───────────────────────────────────────────────────────

interface CalendarMonthProps {
  year: number;
  month: number;
  today: Date;
  mode: DatePickerMode;
  selectedDate: Date | null;
  selectedRange: [Date | null, Date | null];
  multiDates: Date[];
  hoverDate: Date | null;
  focusedDate: Date | null;
  isDateDisabled: (d: Date) => boolean;
  onSelectDate: (d: Date) => void;
  onHoverDate: (d: Date | null) => void;
  onSetFocused: (d: Date | null) => void;
  theme: ReturnType<typeof import('../themes').useTheme>;
  locale: string;
  weekdayLabels: string[];
  weekStartsOn: WeekStartsOn;
  /** The single date whose cell is in the Tab order (roving tabindex). */
  rovingDate: Date;
  /** Registers current-month day-cell buttons so the parent can move DOM focus. */
  registerDayRef: (key: string, el: HTMLButtonElement | null) => void;
}

/** Stable per-day key for the day-cell ref map. */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function CalendarMonth({
  year,
  month,
  today,
  mode,
  selectedDate,
  selectedRange,
  multiDates,
  hoverDate,
  focusedDate,
  isDateDisabled,
  onSelectDate,
  onHoverDate,
  onSetFocused,
  theme,
  locale,
  weekdayLabels,
  weekStartsOn,
  rovingDate,
  registerDayRef,
}: CalendarMonthProps) {
  const cells = getCalendarGrid(year, month, weekStartsOn);

  return (
    <div>
      {/* Day-of-week header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
          marginBottom: '4px',
        }}
      >
        {Array.from({ length: 7 }, (_, i) => weekdayLabels[(weekStartsOn + i) % 7]).map((d, i) => (
          <div
            key={`${d}-${i}`}
            style={{
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: theme.css.textMuted,
              padding: '4px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((cell, idx) => {
          const isCurrentMonth = cell.getMonth() === month;
          const isToday = isSameDay(cell, today);
          const isWeekend = cell.getDay() === 0 || cell.getDay() === 6;
          const disabled = isDateDisabled(cell);

          const isSelectedSingle = mode === 'single' && selectedDate != null && isSameDay(cell, selectedDate);
          const isMultiSelected = mode === 'multiple' && multiDates.some((d) => isSameDay(d, cell));
          const isRangeStart = mode === 'range' && isRangeEndpoint(cell, selectedRange[0], null);
          const isRangeEnd = mode === 'range' && isRangeEndpoint(cell, null, selectedRange[1]);
          const isRangeEndpt = isRangeStart || isRangeEnd;

          // Range hover preview
          const effectiveEnd = mode === 'range' && selectedRange[0] && !selectedRange[1] && hoverDate
            ? hoverDate
            : selectedRange[1];
          const inRangeHighlight = mode === 'range' && isInRange(cell, selectedRange[0], effectiveEnd);
          const isHoverEndpoint = mode === 'range' && selectedRange[0] && !selectedRange[1] && hoverDate && isSameDay(cell, hoverDate);

          const isFullySelected = isSelectedSingle || isMultiSelected || isRangeEndpt;
          const isFocused = focusedDate != null && isSameDay(cell, focusedDate);

          let bg = 'transparent';
          let textColor = isCurrentMonth
            ? isWeekend ? `${theme.css.text}cc` : theme.css.text
            : `${theme.css.textMuted}60`;
          let borderStyle = 'none';
          let fontWeight = 400;

          if (isFullySelected || isHoverEndpoint) {
            bg = theme.css.primary;
            textColor = theme.css.bg;
            fontWeight = 600;
          } else if (inRangeHighlight) {
            bg = `${theme.css.primary}18`;
          }

          if (isToday && !isFullySelected) {
            borderStyle = `2px solid ${theme.css.primary}`;
            fontWeight = 600;
          }

          if (disabled) {
            textColor = `${theme.css.textMuted}50`;
          }

          if (isFocused && !isFullySelected) {
            borderStyle = `2px solid ${theme.css.secondary}`;
          }

          const ariaLabel = cell.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          // Roving tabindex: exactly one current-month cell (the roving date)
          // sits in the Tab order; Arrow keys move real DOM focus between
          // cells (WAI-ARIA APG date-picker grid keyboard model).
          const isRoving = isCurrentMonth && isSameDay(cell, rovingDate);

          return (
            <button
              key={idx}
              type="button"
              ref={isCurrentMonth ? (el) => registerDayRef(dayKey(cell), el) : undefined}
              data-tkx-day=""
              tabIndex={isRoving ? 0 : -1}
              aria-label={ariaLabel}
              aria-pressed={isFullySelected}
              aria-disabled={disabled}
              disabled={disabled}
              onClick={() => !disabled && onSelectDate(cell)}
              onMouseEnter={() => onHoverDate(cell)}
              onMouseLeave={() => onHoverDate(null)}
              onFocus={() => onSetFocused(cell)}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: bg,
                color: textColor,
                border: borderStyle,
                fontSize: '13px',
                fontWeight,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.35 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'inherit',
                position: 'relative',
                outline: 'none',
                textDecoration: disabled ? 'line-through' : 'none',
                transition: 'background-color 80ms ease',
              }}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export const TkxDatePicker = forwardRef<HTMLInputElement, TkxDatePickerProps>(function TkxDatePicker({
  value,
  onChange,
  rangeValue,
  onRangeChange,
  multiValue,
  onMultiChange,
  mode = 'single',
  minDate,
  maxDate,
  disabledDates,
  locale = 'en-US',
  dateFormat,
  weekStartsOn = 0,
  name,
  showTime = false,
  timeValue,
  onTimeChange,
  showPresets = false,
  customPresets,
  label,
  placeholder = 'MM/DD/YYYY',
  hint,
  isDisabled = false,
  isInvalid = false,
  errorMessage,
  numberOfMonths = 1,
  id: idProp,
  className,
  style,
}: TkxDatePickerProps, forwardedRef: ForwardedRef<HTMLInputElement>) {
  const theme = useTheme();
  const localeStrings = useLocale();
  const autoId = useId();
  const id = idProp ?? autoId;
  const reduced = useReducedMotion();

  const today = startOfDay(new Date());

  // ── Localized calendar labels (computed once per locale) ────────────────────

  const { weekdayLabels, monthNames, monthAbbr } = useMemo(
    () => ({
      weekdayLabels: getWeekdayShortLabels(locale),
      monthNames: getMonthNames(locale, 'long'),
      monthAbbr: getMonthNames(locale, 'short'),
    }),
    [locale],
  );

  // ── State ────────────────────────────────────────────────────────────────────
  //
  // Defensive narrowing at the prop boundary. TypeScript enforces the shape
  // for typed consumers but JavaScript callers — and especially the very
  // common mistake of passing a [Date, Date] tuple to `value` (which belongs
  // on `rangeValue`) — would otherwise let a non-Date flow straight into
  // `selectedDate.getFullYear()` and crash the render. Crash-during-SSR is
  // the worst version of this because the whole route page fails to
  // prerender. So we coerce: only an actual Date instance counts; anything
  // else (array, string, number, plain object) is treated as null.

  const asDate = (v: unknown): Date | null =>
    v instanceof Date && !Number.isNaN(v.getTime()) ? v : null;
  const asDateTuple = (
    v: unknown,
  ): [Date | null, Date | null] => {
    if (!Array.isArray(v)) return [null, null];
    return [asDate(v[0]), asDate(v[1])];
  };

  // Controlled/uncontrolled single
  const isSingleControlled = value !== undefined;
  const [internalDate, setInternalDate] = useState<Date | null>(null);
  const selectedDate: Date | null = isSingleControlled ? asDate(value) : internalDate;

  // Controlled/uncontrolled range
  const isRangeControlled = rangeValue !== undefined;
  const [internalRange, setInternalRange] = useState<[Date | null, Date | null]>([null, null]);
  const selectedRange: [Date | null, Date | null] = isRangeControlled
    ? asDateTuple(rangeValue)
    : internalRange;

  // Controlled/uncontrolled multi
  const isMultiControlled = multiValue !== undefined;
  const [internalMulti, setInternalMulti] = useState<Date[]>([]);
  const multiDates: Date[] = isMultiControlled
    ? (multiValue ?? []).filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()))
    : internalMulti;

  // Range picking phase
  const [rangePicking, setRangePicking] = useState<'start' | 'end'>('start');

  // Pending range/time (apply/cancel mode)
  const needsApply = mode === 'range' || (mode === 'single' && showTime);
  const [pendingRange, setPendingRange] = useState<[Date | null, Date | null]>([null, null]);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  // Calendar view
  // `initRef` MUST be a Date — `selectedDate`/`selectedRange[0]` are already
  // narrowed to Date|null by the asDate/asDateTuple guards above, so this is
  // just type-system glue. `today` is the fallback so the calendar always
  // opens on a sane month even when nothing's selected yet.
  const initRef: Date = selectedDate ?? selectedRange[0] ?? today;
  const [viewYear, setViewYear] = useState(initRef.getFullYear());
  const [viewMonth, setViewMonth] = useState(initRef.getMonth());
  const [calView, setCalView] = useState<DatePickerView>('day');

  // Time
  const [internalTime, setInternalTime] = useState<{ h: number; m: number }>({ h: 0, m: 0 });
  const currentTime = timeValue ?? internalTime;

  // UI
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    if (mode === 'single') return formatDate(selectedDate, locale, dateFormat);
    if (mode === 'range') {
      const [s, e] = selectedRange;
      if (s && e) return `${formatDate(s, locale, dateFormat)} – ${formatDate(e, locale, dateFormat)}`;
    }
    return '';
  });
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [popupPos, setPopupPos] = useState<PopupPosition>({ top: 0, left: 0, flipUp: false });
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const anchorRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Keep the internal ref (focus management) AND forward to the consumer.
  const setInputRef = useCallback(
    (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof forwardedRef === 'function') forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    },
    [forwardedRef],
  );
  // Set briefly when Escape closes the picker, so the programmatic
  // input.focus() that follows doesn't immediately re-open via onFocus.
  // Cleared on the next user-initiated click.
  const suppressNextFocusOpen = useRef(false);

  // ── A11y: dialog id + calendar grid focus management ─────────────────────
  //
  // The trigger input references the popup via aria-controls, and the day
  // grid follows the APG roving-tabindex model: exactly one day cell is in
  // the Tab order, Arrow keys move real DOM focus between cells.
  const dialogId = `${id}-dialog`;
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const registerDayRef = useCallback((key: string, el: HTMLButtonElement | null) => {
    if (el) dayRefs.current.set(key, el);
    else dayRefs.current.delete(key);
  }, []);
  // Set by the arrow-key handler so the post-render effect moves DOM focus
  // to the newly focused day cell (which may live in a freshly rendered month).
  const pendingGridFocus = useRef(false);
  // Set when the calendar is opened explicitly (toggle button / ArrowDown on
  // the input) so focus moves into the grid once the popup has rendered.
  // Opening via plain input focus keeps focus in the input to preserve typing.
  const focusGridOnOpen = useRef(false);

  const POPUP_ESTIMATED_HEIGHT = showPresets ? 420 : showTime ? 480 : 360;

  // ── Sync input value ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (mode === 'single') {
      setInputValue(formatDate(selectedDate, locale, dateFormat));
    } else if (mode === 'range') {
      const [s, e] = selectedRange;
      if (s && e) {
        setInputValue(`${formatDate(s, locale, dateFormat)} – ${formatDate(e, locale, dateFormat)}`);
      } else if (s) {
        setInputValue(formatDate(s, locale, dateFormat));
      } else {
        setInputValue('');
      }
    } else if (mode === 'multiple') {
      setInputValue(multiDates.length > 0 ? `${multiDates.length} date${multiDates.length !== 1 ? 's' : ''} selected` : '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedRange, multiDates, mode, locale, dateFormat]);

  // ── Position popup ───────────────────────────────────────────────────────────

  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return;
    setPopupPos(getPopupPosition(anchorRef.current, POPUP_ESTIMATED_HEIGHT));
  }, [POPUP_ESTIMATED_HEIGHT]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  // ── Outside click ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (
        anchorRef.current?.contains(e.target as Node) ||
        popupRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  // ── Escape key ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        // Guard against onFocus reopening the picker on the focus restoration.
        suppressNextFocusOpen.current = true;
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // ── isDateDisabled ────────────────────────────────────────────────────────────

  const isDateDisabled = useCallback(
    (d: Date): boolean => {
      if (minDate && startOfDay(d) < startOfDay(minDate)) return true;
      if (maxDate && startOfDay(d) > startOfDay(maxDate)) return true;
      if (!disabledDates) return false;
      if (typeof disabledDates === 'function') return disabledDates(d);
      return disabledDates.some((dd) => isSameDay(dd, d));
    },
    [minDate, maxDate, disabledDates]
  );

  // ── Select date logic ─────────────────────────────────────────────────────────

  const selectDate = useCallback(
    (d: Date) => {
      if (isDateDisabled(d)) return;

      if (mode === 'single') {
        if (needsApply) {
          setPendingDate(d);
        } else {
          if (!isSingleControlled) setInternalDate(d);
          onChange?.(d);
          setInputValue(formatDate(d, locale, dateFormat));
          setOpen(false);
        }
      } else if (mode === 'range') {
        if (rangePicking === 'start') {
          const newRange: [Date, null] = [d, null];
          setPendingRange(newRange);
          if (!isRangeControlled) setInternalRange(newRange);
          onRangeChange?.(newRange);
          setRangePicking('end');
        } else {
          const start = pendingRange[0] ?? selectedRange[0];
          const ordered: [Date | null, Date | null] =
            start && d < start ? [d, start] : [start, d];
          setPendingRange(ordered);
          if (!needsApply) {
            if (!isRangeControlled) setInternalRange(ordered);
            onRangeChange?.(ordered);
            setRangePicking('start');
            setOpen(false);
          } else {
            setRangePicking('start');
          }
        }
      } else if (mode === 'multiple') {
        const exists = multiDates.some((md) => isSameDay(md, d));
        const next = exists
          ? multiDates.filter((md) => !isSameDay(md, d))
          : [...multiDates, d];
        if (!isMultiControlled) setInternalMulti(next);
        onMultiChange?.(next);
      }

      forceUpdate();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, isDateDisabled, isSingleControlled, isRangeControlled, isMultiControlled,
     onChange, onRangeChange, onMultiChange, rangePicking, pendingRange, selectedRange,
     multiDates, needsApply, locale]
  );

  // ── Apply / Cancel ────────────────────────────────────────────────────────────

  const handleApply = useCallback(() => {
    if (mode === 'single') {
      const d = pendingDate ?? selectedDate;
      if (!isSingleControlled) setInternalDate(d);
      onChange?.(d);
    } else if (mode === 'range') {
      if (!isRangeControlled) setInternalRange(pendingRange);
      onRangeChange?.(pendingRange);
    }
    setOpen(false);
    setRangePicking('start');
  }, [mode, pendingDate, pendingRange, selectedDate, isSingleControlled, isRangeControlled,
      onChange, onRangeChange]);

  const handleCancel = useCallback(() => {
    setPendingDate(null);
    setPendingRange([null, null]);
    setRangePicking('start');
    setOpen(false);
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────────

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setCalView('day');
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setCalView('day');
  };
  const prevYear = () => setViewYear((y) => y - 1);
  const nextYear = () => setViewYear((y) => y + 1);
  const prevDecade = () => setViewYear((y) => y - 10);
  const nextDecade = () => setViewYear((y) => y + 10);

  // ── Input manual typing ───────────────────────────────────────────────────────

  const handleInputChange = (v: string) => {
    setInputValue(v);
    if (mode === 'single') {
      const parsed = parseDate(v, dateFormat);
      if (parsed && !isDateDisabled(parsed)) {
        if (!isSingleControlled) setInternalDate(parsed);
        onChange?.(parsed);
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  };

  // ── Clear ─────────────────────────────────────────────────────────────────────

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'single') {
      if (!isSingleControlled) setInternalDate(null);
      onChange?.(null);
      setInputValue('');
    } else if (mode === 'range') {
      const empty: [null, null] = [null, null];
      if (!isRangeControlled) setInternalRange(empty);
      onRangeChange?.(empty);
      setPendingRange(empty);
      setInputValue('');
      setRangePicking('start');
    } else if (mode === 'multiple') {
      if (!isMultiControlled) setInternalMulti([]);
      onMultiChange?.([]);
      setInputValue('');
    }
  };

  // ── Keyboard navigation in calendar ──────────────────────────────────────────

  const handleCalendarKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (calView !== 'day') return;
    // Only handle keys aimed at the dialog itself or a day cell, so the
    // footer/preset/time-column buttons keep their native key behavior
    // (e.g. Enter on "Apply" must click Apply, not select a day).
    const target = e.target as HTMLElement;
    if (target !== e.currentTarget && !target.hasAttribute('data-tkx-day')) return;
    const base = focusedDate ?? selectedDate ?? today;
    let next: Date | null = null;

    if (e.key === 'ArrowRight') next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1);
    else if (e.key === 'ArrowLeft') next = new Date(base.getFullYear(), base.getMonth(), base.getDate() - 1);
    else if (e.key === 'ArrowDown') next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 7);
    else if (e.key === 'ArrowUp') next = new Date(base.getFullYear(), base.getMonth(), base.getDate() - 7);
    else if ((e.key === 'Enter' || e.key === ' ') && focusedDate) {
      // preventDefault so the focused day <button>'s native Enter/Space click
      // doesn't fire selectDate a second time (range/multiple would toggle).
      e.preventDefault();
      selectDate(focusedDate);
      return;
    }

    if (next) {
      e.preventDefault();
      setFocusedDate(next);
      pendingGridFocus.current = true;
      if (next.getMonth() !== viewMonth || next.getFullYear() !== viewYear) {
        setViewMonth(next.getMonth());
        setViewYear(next.getFullYear());
      }
    }
  };

  // ── Today button ──────────────────────────────────────────────────────────────

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setCalView('day');
    selectDate(today);
  };

  // ── Preset selection ──────────────────────────────────────────────────────────

  const allPresets = customPresets ?? buildBuiltinPresets(localeStrings);

  const applyPreset = (preset: DatePreset) => {
    const [start, end] = preset.getValue();
    const range: [Date, Date] = [start, end];
    setPendingRange(range);
    if (!isRangeControlled) setInternalRange(range);
    onRangeChange?.(range);
    setViewYear(start.getFullYear());
    setViewMonth(start.getMonth());
    setRangePicking('start');
    if (!needsApply) setOpen(false);
  };

  // ── Second month for dual view ─────────────────────────────────────────────

  const month2 = viewMonth === 11 ? 0 : viewMonth + 1;
  const year2 = viewMonth === 11 ? viewYear + 1 : viewYear;

  const dualView = numberOfMonths >= 2;

  // ── Roving-tabindex target ──────────────────────────────────────────────────
  //
  // The one day cell that participates in the Tab order. Prefers the cell the
  // user last navigated to, then the selection, then today; falls back to the
  // 1st of the visible month when none of those is currently rendered.
  const rovingBase = focusedDate ?? selectedDate ?? selectedRange[0] ?? multiDates[0] ?? today;
  const rovingInView =
    (rovingBase.getFullYear() === viewYear && rovingBase.getMonth() === viewMonth) ||
    (dualView && rovingBase.getFullYear() === year2 && rovingBase.getMonth() === month2);
  const rovingDate = rovingInView ? rovingBase : new Date(viewYear, viewMonth, 1);

  // Move DOM focus to the day cell matching focusedDate after arrow-key
  // navigation (post-render, so cells in a freshly rendered month exist).
  useEffect(() => {
    if (!pendingGridFocus.current) return;
    pendingGridFocus.current = false;
    if (focusedDate) dayRefs.current.get(dayKey(focusedDate))?.focus();
  }, [focusedDate]);

  // When the calendar is opened explicitly (toggle button / ArrowDown on the
  // input), move focus into the grid so Arrow keys work immediately.
  useEffect(() => {
    if (open && focusGridOnOpen.current) {
      dayRefs.current.get(dayKey(rovingDate))?.focus();
    }
    focusGridOnOpen.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Sanitize strings ──────────────────────────────────────────────────────────

  const safeLabel = label ? sanitizeString(label) : undefined;
  const safeHint = hint ? sanitizeString(hint) : undefined;
  const safeError = errorMessage ? sanitizeString(errorMessage) : undefined;
  const safeHolder = sanitizeString(placeholder);

  // ── Has value? ────────────────────────────────────────────────────────────────

  const hasValue =
    (mode === 'single' && selectedDate != null) ||
    (mode === 'range' && (selectedRange[0] != null || selectedRange[1] != null)) ||
    (mode === 'multiple' && multiDates.length > 0);

  // ── Hidden form value (plain HTML form submission via `name`) ────────────────

  const toISODateString = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  let hiddenFormValue = '';
  if (mode === 'single') {
    hiddenFormValue = selectedDate ? toISODateString(selectedDate) : '';
  } else if (mode === 'range') {
    const [s, e] = selectedRange;
    hiddenFormValue = s && e ? `${toISODateString(s)}/${toISODateString(e)}` : s ? toISODateString(s) : '';
  } else if (mode === 'multiple') {
    hiddenFormValue = multiDates.map(toISODateString).join('/');
  }

  // ── Display range for calendar ────────────────────────────────────────────────

  const displayRange: [Date | null, Date | null] =
    mode === 'range'
      ? (needsApply ? pendingRange : selectedRange)
      : [null, null];

  // ── Render ────────────────────────────────────────────────────────────────────

  const borderColor = isInvalid ? theme.css.danger : open ? theme.css.primary : theme.css.border;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const popupContent = (
    <div
      ref={popupRef}
      id={dialogId}
      role="dialog"
      aria-label={safeLabel ?? 'Date picker'}
      aria-modal="false"
      onKeyDown={handleCalendarKeyDown}
      style={{
        position: 'absolute',
        top: popupPos.top,
        left: popupPos.left,
        zIndex: 9999,
        backgroundColor: theme.css.surface,
        border: `1px solid ${theme.css.border}`,
        borderRadius: '14px',
        boxShadow: `0 8px 30px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`,
        display: 'flex',
        overflow: 'hidden',
        minWidth: dualView ? '580px' : '300px',
        maxWidth: dualView && showPresets ? '780px' : dualView ? '620px' : showPresets ? '520px' : '300px',
        opacity: open ? 1 : 0,
        transform: open
          ? 'translateY(0) scale(1)'
          : popupPos.flipUp
            ? 'translateY(4px) scale(0.98)'
            : 'translateY(-4px) scale(0.98)',
        transition: reduced ? 'none' : 'opacity 120ms ease, transform 120ms ease',
        fontFamily: 'inherit',
      }}
    >
      {/* Presets sidebar */}
      {showPresets && mode === 'range' && (
        <div
          style={{
            width: '148px',
            flexShrink: 0,
            borderRight: `1px solid ${theme.css.border}`,
            padding: '8px 6px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: theme.css.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              padding: '4px 8px 8px',
            }}
          >
            Quick select
          </div>
          {allPresets.map((preset) => {
            const [pStart, pEnd] = preset.getValue();
            const isActive =
              displayRange[0] && displayRange[1] &&
              isSameDay(displayRange[0], pStart) &&
              isSameDay(displayRange[1], pEnd);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  backgroundColor: isActive ? `${theme.css.primary}20` : 'transparent',
                  color: isActive ? theme.css.primary : theme.css.text,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'inherit',
                  transition: 'background-color 80ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${theme.css.surfaceAlt}`;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Calendar area */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
        {/* Header navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Prev button */}
          <button
            type="button"
            aria-label={calView === 'day' ? 'Previous month' : calView === 'month' ? 'Previous year' : 'Previous decade'}
            onClick={() => {
              if (calView === 'day') prevMonth();
              else if (calView === 'month') prevYear();
              else prevDecade();
            }}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: theme.css.textMuted,
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Breadcrumb: "April 2026" */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {calView === 'day' && (
              <>
                <button
                  type="button"
                  onClick={() => setCalView('month')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: theme.css.text,
                    padding: '4px 6px',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                  }}
                >
                  {monthNames[viewMonth]}
                </button>
                <button
                  type="button"
                  onClick={() => setCalView('year')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: theme.css.text,
                    padding: '4px 6px',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                  }}
                >
                  {viewYear}
                </button>
                {dualView && (
                  <>
                    <span style={{ color: theme.css.textMuted, fontSize: '14px' }}>–</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: theme.css.text }}>
                      {monthNames[month2]} {year2}
                    </span>
                  </>
                )}
              </>
            )}
            {calView === 'month' && (
              <button
                type="button"
                onClick={() => setCalView('year')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: theme.css.text,
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontFamily: 'inherit',
                }}
              >
                {viewYear}
              </button>
            )}
            {calView === 'year' && (
              <span style={{ fontSize: '14px', fontWeight: 600, color: theme.css.text }}>
                {getDecadeStart(viewYear)}–{getDecadeStart(viewYear) + 9}
              </span>
            )}
          </div>

          {/* Next button */}
          <button
            type="button"
            aria-label={calView === 'day' ? 'Next month' : calView === 'month' ? 'Next year' : 'Next decade'}
            onClick={() => {
              if (calView === 'day') nextMonth();
              else if (calView === 'month') nextYear();
              else nextDecade();
            }}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: theme.css.textMuted,
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* View: Day */}
        {calView === 'day' && (
          <div style={{ display: 'flex', gap: '20px' }}>
            <CalendarMonth
              year={viewYear}
              month={viewMonth}
              today={today}
              mode={mode}
              selectedDate={selectedDate}
              selectedRange={displayRange}
              multiDates={multiDates}
              hoverDate={hoverDate}
              focusedDate={focusedDate}
              isDateDisabled={isDateDisabled}
              onSelectDate={selectDate}
              onHoverDate={setHoverDate}
              onSetFocused={setFocusedDate}
              theme={theme}
              locale={locale}
              weekdayLabels={weekdayLabels}
              weekStartsOn={weekStartsOn}
              rovingDate={rovingDate}
              registerDayRef={registerDayRef}
            />
            {dualView && (
              <CalendarMonth
                year={year2}
                month={month2}
                today={today}
                mode={mode}
                selectedDate={selectedDate}
                selectedRange={displayRange}
                multiDates={multiDates}
                hoverDate={hoverDate}
                focusedDate={focusedDate}
                isDateDisabled={isDateDisabled}
                onSelectDate={selectDate}
                onHoverDate={setHoverDate}
                onSetFocused={setFocusedDate}
                theme={theme}
                locale={locale}
                weekdayLabels={weekdayLabels}
                weekStartsOn={weekStartsOn}
                rovingDate={rovingDate}
                registerDayRef={registerDayRef}
              />
            )}
          </div>
        )}

        {/* View: Month picker */}
        {calView === 'month' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
            }}
          >
            {monthAbbr.map((monthLabel, idx) => {
              const isCurrentViewMonth = idx === viewMonth;
              const isTodayMonth = idx === today.getMonth() && viewYear === today.getFullYear();
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setViewMonth(idx);
                    setCalView('day');
                  }}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: isTodayMonth && !isCurrentViewMonth ? `2px solid ${theme.css.primary}` : 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isCurrentViewMonth ? 600 : 400,
                    backgroundColor: isCurrentViewMonth ? theme.css.primary : 'transparent',
                    color: isCurrentViewMonth ? theme.css.bg : theme.css.text,
                    fontFamily: 'inherit',
                    transition: 'background-color 80ms ease',
                  }}
                >
                  {monthLabel}
                </button>
              );
            })}
          </div>
        )}

        {/* View: Year picker (decade grid) */}
        {calView === 'year' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
            }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const yr = getDecadeStart(viewYear) - 1 + i;
              const isCurrentYear = yr === viewYear;
              const isTodayYear = yr === today.getFullYear();
              const isOutsideDecade = i === 0 || i === 11;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setViewYear(yr);
                    setCalView('month');
                  }}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '8px',
                    border: isTodayYear && !isCurrentYear ? `2px solid ${theme.css.primary}` : 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isCurrentYear ? 600 : 400,
                    backgroundColor: isCurrentYear ? theme.css.primary : 'transparent',
                    color: isCurrentYear ? theme.css.bg : isOutsideDecade ? theme.css.textMuted : theme.css.text,
                    fontFamily: 'inherit',
                    transition: 'background-color 80ms ease',
                    opacity: isOutsideDecade ? 0.5 : 1,
                  }}
                >
                  {yr}
                </button>
              );
            })}
          </div>
        )}

        {/* Time picker */}
        {showTime && calView === 'day' && (
          <div
            style={{
              borderTop: `1px solid ${theme.css.border}`,
              paddingTop: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
            <TimeColumn
              values={hours}
              selected={currentTime.h}
              onSelect={(h) => {
                if (!timeValue) setInternalTime((t) => ({ ...t, h }));
                onTimeChange?.({ ...currentTime, h });
              }}
              label="Hour"
              theme={theme}
            />
            <div style={{ display: 'flex', alignItems: 'center', height: '40px', marginTop: '28px', fontSize: '16px', fontWeight: 700, color: theme.css.textMuted }}>
              :
            </div>
            <TimeColumn
              values={minutes}
              selected={currentTime.m}
              onSelect={(m) => {
                if (!timeValue) setInternalTime((t) => ({ ...t, m }));
                onTimeChange?.({ ...currentTime, m });
              }}
              label="Min"
              theme={theme}
            />
          </div>
        )}

        {/* Multiple selection count */}
        {mode === 'multiple' && calView === 'day' && multiDates.length > 0 && (
          <div
            style={{
              borderTop: `1px solid ${theme.css.border}`,
              paddingTop: '8px',
              fontSize: '12px',
              color: theme.css.textMuted,
              textAlign: 'center',
            }}
          >
            {multiDates.length} date{multiDates.length !== 1 ? 's' : ''} selected
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid ${theme.css.border}`,
            paddingTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: needsApply ? 'space-between' : 'flex-start',
            gap: '8px',
          }}
        >
          {/* Today button */}
          <button
            type="button"
            onClick={goToToday}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '13px',
              color: theme.css.primary,
              fontWeight: 500,
              padding: '6px 10px',
              borderRadius: '6px',
              fontFamily: 'inherit',
            }}
          >
            Today
          </button>

          {/* Apply / Cancel */}
          {needsApply && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: `1px solid ${theme.css.border}`,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: 'transparent',
                  color: theme.css.text,
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: theme.css.primary,
                  color: theme.css.bg,
                  fontFamily: 'inherit',
                }}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%',
        position: 'relative',
        ...style,
      }}
    >
      {/* Label */}
      {safeLabel && (
        <label
          htmlFor={id}
          style={{ fontSize: '13px', fontWeight: 500, color: theme.css.text, marginBottom: '2px' }}
        >
          {safeLabel}
        </label>
      )}

      {/* Input field */}
      <div
        ref={anchorRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          border: `1.5px solid ${borderColor}`,
          borderRadius: '8px',
          backgroundColor: theme.css.surface,
          overflow: 'hidden',
          transition: reduced ? 'none' : 'border-color 120ms ease',
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        {/* Calendar icon */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '10px',
            color: theme.css.textMuted,
            flexShrink: 0,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>

        <input
          ref={setInputRef}
          id={id}
          type="text"
          value={inputValue}
          placeholder={safeHolder}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          readOnly={mode === 'range' || mode === 'multiple'}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (isDisabled) return;
            if (e.key === 'ArrowDown') {
              // Enter the calendar grid from the input (APG combobox+dialog).
              e.preventDefault();
              if (open) {
                dayRefs.current.get(dayKey(rovingDate))?.focus();
              } else {
                focusGridOnOpen.current = true;
                setOpen(true);
              }
            }
          }}
          onFocus={() => {
            if (isDisabled) return;
            if (suppressNextFocusOpen.current) {
              // Programmatic focus from Escape-close — don't re-open.
              suppressNextFocusOpen.current = false;
              return;
            }
            setOpen(true);
          }}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            padding: '9px 8px',
            color: theme.css.text,
            cursor: mode !== 'single' ? 'pointer' : 'text',
            fontFamily: 'inherit',
            minWidth: 0,
          }}
        />

        {/* Clear button */}
        {hasValue && !isDisabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={handleClear}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: theme.css.textMuted,
              flexShrink: 0,
              borderRadius: '4px',
              marginRight: '4px',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Toggle button */}
        <button
          type="button"
          aria-label={open ? 'Close calendar' : 'Open calendar'}
          tabIndex={-1}
          disabled={isDisabled}
          onClick={() => {
            if (!isDisabled) {
              // Explicit open via the calendar button moves focus into the
              // grid (APG: dialog opens → focus lands on the current date).
              if (!open) focusGridOnOpen.current = true;
              setOpen((o) => !o);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '36px',
            border: 'none',
            background: 'transparent',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            color: theme.css.textMuted,
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: reduced ? 'none' : 'transform 160ms ease' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Hint / Error */}
      {safeHint && !isInvalid && (
        <span style={{ fontSize: '12px', color: theme.css.textMuted }}>{safeHint}</span>
      )}
      {isInvalid && safeError && (
        <span role="alert" style={{ fontSize: '12px', color: theme.css.danger }}>{safeError}</span>
      )}

      {/* Hidden input so the picker posts in plain HTML forms */}
      {name && <input type="hidden" name={name} value={hiddenFormValue} />}

      {/* Portal popup */}
      {open && typeof document !== 'undefined' && createPortal(popupContent, document.body)}
    </div>
  );
});

TkxDatePicker.displayName = 'TkxDatePicker';