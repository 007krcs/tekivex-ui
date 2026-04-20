'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  useReducer,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DatePickerMode = 'single' | 'range' | 'multiple';
export type DatePickerView = 'day' | 'month' | 'year';

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

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    const MMM = MONTH_ABBR[d.getMonth()];
    const MMMM = MONTH_NAMES[d.getMonth()];
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

function getCalendarGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1).getDay();
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

function buildBuiltinPresets(): DatePreset[] {
  return [
    {
      label: 'Today',
      getValue: () => {
        const t = startOfDay(new Date());
        return [t, t];
      },
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const y = startOfDay(new Date());
        y.setDate(y.getDate() - 1);
        return [y, y];
      },
    },
    {
      label: 'Last 7 days',
      getValue: () => {
        const end = startOfDay(new Date());
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return [start, end];
      },
    },
    {
      label: 'Last 30 days',
      getValue: () => {
        const end = startOfDay(new Date());
        const start = new Date(end);
        start.setDate(start.getDate() - 29);
        return [start, end];
      },
    },
    {
      label: 'Last 90 days',
      getValue: () => {
        const end = startOfDay(new Date());
        const start = new Date(end);
        start.setDate(start.getDate() - 89);
        return [start, end];
      },
    },
    {
      label: 'This week',
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
      label: 'Last week',
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
      label: 'This month',
      getValue: () => {
        const t = new Date();
        return [
          new Date(t.getFullYear(), t.getMonth(), 1),
          new Date(t.getFullYear(), t.getMonth() + 1, 0),
        ];
      },
    },
    {
      label: 'Last month',
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
      <div style={{ fontSize: '11px', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div
        ref={containerRef}
        style={{
          height: '160px',
          overflowY: 'auto',
          width: '52px',
          scrollbarWidth: 'thin',
          border: `1px solid ${theme.border}`,
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
                backgroundColor: isSelected ? theme.primary : 'transparent',
                color: isSelected ? theme.bg : theme.text,
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
}: CalendarMonthProps) {
  const cells = getCalendarGrid(year, month);

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
        {DAYS_SHORT.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: theme.textMuted,
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
            ? isWeekend ? `${theme.text}cc` : theme.text
            : `${theme.textMuted}60`;
          let borderStyle = 'none';
          let fontWeight = 400;

          if (isFullySelected || isHoverEndpoint) {
            bg = theme.primary;
            textColor = theme.bg;
            fontWeight = 600;
          } else if (inRangeHighlight) {
            bg = `${theme.primary}18`;
          }

          if (isToday && !isFullySelected) {
            borderStyle = `2px solid ${theme.primary}`;
            fontWeight = 600;
          }

          if (disabled) {
            textColor = `${theme.textMuted}50`;
          }

          if (isFocused && !isFullySelected) {
            borderStyle = `2px solid ${theme.secondary}`;
          }

          const ariaLabel = cell.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          return (
            <button
              key={idx}
              type="button"
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

export function TkxDatePicker({
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
}: TkxDatePickerProps) {
  const theme = useTheme();
  const autoId = useId();
  const id = idProp ?? autoId;
  const reduced = useReducedMotion();

  const today = startOfDay(new Date());

  // ── State ────────────────────────────────────────────────────────────────────

  // Controlled/uncontrolled single
  const isSingleControlled = value !== undefined;
  const [internalDate, setInternalDate] = useState<Date | null>(null);
  const selectedDate: Date | null = isSingleControlled ? (value ?? null) : internalDate;

  // Controlled/uncontrolled range
  const isRangeControlled = rangeValue !== undefined;
  const [internalRange, setInternalRange] = useState<[Date | null, Date | null]>([null, null]);
  const selectedRange: [Date | null, Date | null] = isRangeControlled ? rangeValue! : internalRange;

  // Controlled/uncontrolled multi
  const isMultiControlled = multiValue !== undefined;
  const [internalMulti, setInternalMulti] = useState<Date[]>([]);
  const multiDates: Date[] = isMultiControlled ? multiValue! : internalMulti;

  // Range picking phase
  const [rangePicking, setRangePicking] = useState<'start' | 'end'>('start');

  // Pending range/time (apply/cancel mode)
  const needsApply = mode === 'range' || (mode === 'single' && showTime);
  const [pendingRange, setPendingRange] = useState<[Date | null, Date | null]>([null, null]);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  // Calendar view
  const initRef = selectedDate ?? selectedRange[0] ?? today;
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    const base = focusedDate ?? selectedDate ?? today;
    let next: Date | null = null;

    if (e.key === 'ArrowRight') next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1);
    else if (e.key === 'ArrowLeft') next = new Date(base.getFullYear(), base.getMonth(), base.getDate() - 1);
    else if (e.key === 'ArrowDown') next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 7);
    else if (e.key === 'ArrowUp') next = new Date(base.getFullYear(), base.getMonth(), base.getDate() - 7);
    else if (e.key === 'Enter' && focusedDate) { selectDate(focusedDate); return; }

    if (next) {
      e.preventDefault();
      setFocusedDate(next);
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

  const allPresets = customPresets ?? buildBuiltinPresets();

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

  // ── Display range for calendar ────────────────────────────────────────────────

  const displayRange: [Date | null, Date | null] =
    mode === 'range'
      ? (needsApply ? pendingRange : selectedRange)
      : [null, null];

  // ── Render ────────────────────────────────────────────────────────────────────

  const borderColor = isInvalid ? theme.danger : open ? theme.primary : theme.border;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const popupContent = (
    <div
      ref={popupRef}
      role="dialog"
      aria-label="Date picker"
      aria-modal="false"
      onKeyDown={handleCalendarKeyDown}
      style={{
        position: 'absolute',
        top: popupPos.top,
        left: popupPos.left,
        zIndex: 9999,
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
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
            borderRight: `1px solid ${theme.border}`,
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
              color: theme.textMuted,
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
                  backgroundColor: isActive ? `${theme.primary}20` : 'transparent',
                  color: isActive ? theme.primary : theme.text,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'inherit',
                  transition: 'background-color 80ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${theme.surfaceAlt}`;
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
              color: theme.textMuted,
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
                    color: theme.text,
                    padding: '4px 6px',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                  }}
                >
                  {MONTH_NAMES[viewMonth]}
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
                    color: theme.text,
                    padding: '4px 6px',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                  }}
                >
                  {viewYear}
                </button>
                {dualView && (
                  <>
                    <span style={{ color: theme.textMuted, fontSize: '14px' }}>–</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>
                      {MONTH_NAMES[month2]} {year2}
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
                  color: theme.text,
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontFamily: 'inherit',
                }}
              >
                {viewYear}
              </button>
            )}
            {calView === 'year' && (
              <span style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>
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
              color: theme.textMuted,
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
            {MONTH_ABBR.map((name, idx) => {
              const isCurrentViewMonth = idx === viewMonth;
              const isTodayMonth = idx === today.getMonth() && viewYear === today.getFullYear();
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setViewMonth(idx);
                    setCalView('day');
                  }}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: isTodayMonth && !isCurrentViewMonth ? `2px solid ${theme.primary}` : 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isCurrentViewMonth ? 600 : 400,
                    backgroundColor: isCurrentViewMonth ? theme.primary : 'transparent',
                    color: isCurrentViewMonth ? theme.bg : theme.text,
                    fontFamily: 'inherit',
                    transition: 'background-color 80ms ease',
                  }}
                >
                  {name}
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
                    border: isTodayYear && !isCurrentYear ? `2px solid ${theme.primary}` : 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isCurrentYear ? 600 : 400,
                    backgroundColor: isCurrentYear ? theme.primary : 'transparent',
                    color: isCurrentYear ? theme.bg : isOutsideDecade ? theme.textMuted : theme.text,
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
              borderTop: `1px solid ${theme.border}`,
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
            <div style={{ display: 'flex', alignItems: 'center', height: '40px', marginTop: '28px', fontSize: '16px', fontWeight: 700, color: theme.textMuted }}>
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
              borderTop: `1px solid ${theme.border}`,
              paddingTop: '8px',
              fontSize: '12px',
              color: theme.textMuted,
              textAlign: 'center',
            }}
          >
            {multiDates.length} date{multiDates.length !== 1 ? 's' : ''} selected
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid ${theme.border}`,
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
              color: theme.primary,
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
                  border: `1px solid ${theme.border}`,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: 'transparent',
                  color: theme.text,
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
                  backgroundColor: theme.primary,
                  color: theme.bg,
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
          style={{ fontSize: '13px', fontWeight: 500, color: theme.text, marginBottom: '2px' }}
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
          backgroundColor: theme.surface,
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
            color: theme.textMuted,
            flexShrink: 0,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          placeholder={safeHolder}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-haspopup="dialog"
          aria-expanded={open}
          readOnly={mode === 'range' || mode === 'multiple'}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (!isDisabled) {
              setOpen(true);
            }
          }}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            padding: '9px 8px',
            color: theme.text,
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
              color: theme.textMuted,
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
            color: theme.textMuted,
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
        <span style={{ fontSize: '12px', color: theme.textMuted }}>{safeHint}</span>
      )}
      {isInvalid && safeError && (
        <span role="alert" style={{ fontSize: '12px', color: theme.danger }}>{safeError}</span>
      )}

      {/* Portal popup */}
      {open && typeof document !== 'undefined' && createPortal(popupContent, document.body)}
    </div>
  );
}

TkxDatePicker.displayName = 'TkxDatePicker';