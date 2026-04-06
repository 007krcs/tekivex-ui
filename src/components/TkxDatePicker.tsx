import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';
import { tkx, cx } from '../engine/tkx';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

export type DatePickerMode = 'single' | 'range';

export interface TkxDatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  rangeValue?: [Date | null, Date | null];
  onRangeChange?: (range: [Date | null, Date | null]) => void;
  mode?: DatePickerMode;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  placeholder?: string;
  label?: string;
  hint?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  id?: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function formatDate(d: Date | null | undefined): string {
  if (!d) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function parseDate(str: string): Date | null {
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, m, d, y] = match.map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (date.getMonth() !== m - 1) return null;
  return date;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isInRange(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = d.getTime();
  const s = start.getTime();
  const e = end.getTime();
  return t > Math.min(s, e) && t < Math.max(s, e);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getCalendarGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const cells: (Date | null)[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push(new Date(year, month - 1, prevMonthDays - i));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length < 42) {
    cells.push(new Date(year, month + 1, cells.length - firstDay - daysInMonth + 1));
  }
  return cells;
}

export function TkxDatePicker({
  value,
  defaultValue,
  onChange,
  rangeValue,
  onRangeChange,
  mode = 'single',
  minDate,
  maxDate,
  disabledDates = [],
  placeholder = 'MM/DD/YYYY',
  label,
  hint,
  isDisabled = false,
  isInvalid = false,
  errorMessage,
  id: idProp,
}: TkxDatePickerProps) {
  const theme = useTheme();
  const autoId = useId();
  const id = idProp ?? autoId;
  const reducedMotion = useReducedMotion();

  const isControlled = value !== undefined;
  const [internalDate, setInternalDate] = useState<Date | null>(defaultValue ?? null);
  const selectedDate = isControlled ? (value ?? null) : internalDate;

  const isRangeControlled = rangeValue !== undefined;
  const [internalRange, setInternalRange] = useState<[Date | null, Date | null]>([null, null]);
  const selectedRange = isRangeControlled ? rangeValue! : internalRange;

  const today = new Date();
  const [viewYear, setViewYear] = useState(
    (mode === 'range' ? selectedRange[0] : selectedDate)?.getFullYear() ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    (mode === 'range' ? selectedRange[0] : selectedDate)?.getMonth() ?? today.getMonth()
  );

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(
    mode === 'single' ? formatDate(selectedDate) : ''
  );
  const [focusedCell, setFocusedCell] = useState<Date | null>(null);
  const [rangePicking, setRangePicking] = useState<'start' | 'end'>('start');

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'single') setInputValue(formatDate(selectedDate));
  }, [selectedDate, mode]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  const isDateDisabled = useCallback((d: Date): boolean => {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return disabledDates.some(dd => isSameDay(dd, d));
  }, [minDate, maxDate, disabledDates]);

  const selectDate = useCallback((d: Date) => {
    if (isDateDisabled(d)) return;
    if (mode === 'single') {
      if (!isControlled) setInternalDate(d);
      onChange?.(d);
      setInputValue(formatDate(d));
      setOpen(false);
    } else {
      if (rangePicking === 'start') {
        const newRange: [Date, null] = [d, null];
        if (!isRangeControlled) setInternalRange(newRange);
        onRangeChange?.(newRange);
        setRangePicking('end');
      } else {
        const start = selectedRange[0];
        const newRange: [Date | null, Date | null] = start && d < start ? [d, start] : [start, d];
        if (!isRangeControlled) setInternalRange(newRange);
        onRangeChange?.(newRange);
        setRangePicking('start');
        setOpen(false);
      }
    }
  }, [mode, isDateDisabled, isControlled, isRangeControlled, onChange, onRangeChange, rangePicking, selectedRange]);

  const handleInputChange = (v: string) => {
    setInputValue(v);
    const parsed = parseDate(v);
    if (parsed) {
      if (!isControlled) setInternalDate(parsed);
      onChange?.(parsed);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    const cells = getCalendarGrid(viewYear, viewMonth);
    const baseDate = focusedCell ?? selectedDate ?? today;
    let next: Date | null = null;

    if (e.key === 'ArrowRight') next = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1);
    else if (e.key === 'ArrowLeft') next = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - 1);
    else if (e.key === 'ArrowDown') next = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 7);
    else if (e.key === 'ArrowUp') next = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - 7);
    else if (e.key === 'Enter' && focusedCell) { selectDate(focusedCell); return; }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.focus(); return; }

    if (next) {
      e.preventDefault();
      setFocusedCell(next);
      if (next.getMonth() !== viewMonth || next.getFullYear() !== viewYear) {
        setViewMonth(next.getMonth());
        setViewYear(next.getFullYear());
      }
    }
    void cells;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = getCalendarGrid(viewYear, viewMonth);
  const borderColor = isInvalid ? theme.danger : theme.border;
  const safeLabel = label ? sanitizeString(label) : undefined;
  const safeHint = hint ? sanitizeString(hint) : undefined;
  const safeError = errorMessage ? sanitizeString(errorMessage) : undefined;
  const safeHolder = sanitizeString(placeholder);

  const transition = reducedMotion ? '' : 'transition: opacity 150ms ease, transform 150ms ease;';

  return (
    <div
      ref={containerRef}
      className={tkx('flex flex-col gap-1 w-full relative')}
      onKeyDown={handleKeyDown}
    >
      {safeLabel && (
        <label htmlFor={id} className={tkx('text-sm font-medium')} style={{ color: theme.text }}>
          {safeLabel}
        </label>
      )}

      <div
        className={tkx('flex items-center rounded-lg overflow-hidden')}
        style={{ border: `1.5px solid ${borderColor}`, backgroundColor: theme.surface }}
      >
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
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => !isDisabled && setOpen(true)}
          className={tkx('flex-1 bg-transparent text-sm py-2.5 px-3 outline-none min-w-0')}
          style={{ color: theme.text, opacity: isDisabled ? 0.5 : 1 }}
          readOnly={mode === 'range'}
        />
        <button
          type="button"
          aria-label="Open calendar"
          disabled={isDisabled}
          onClick={() => !isDisabled && setOpen(o => !o)}
          className={tkx('px-3 py-2.5 flex items-center justify-center')}
          style={{ color: theme.textMuted, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </button>
      </div>

      {safeHint && !isInvalid && (
        <span className={tkx('text-xs')} style={{ color: theme.textMuted }}>{safeHint}</span>
      )}
      {isInvalid && safeError && (
        <span role="alert" className={tkx('text-xs')} style={{ color: theme.danger }}>{safeError}</span>
      )}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Date picker calendar"
          aria-modal="false"
          className={cx(tkx('absolute top-full left-0 mt-1 z-50 rounded-xl p-3 shadow-lg'))}
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            minWidth: '280px',
            style: transition,
          } as React.CSSProperties}
        >
          {/* Header */}
          <div className={tkx('flex items-center justify-between mb-3')}>
            <button
              type="button"
              aria-label="Previous month"
              onClick={prevMonth}
              className={tkx('rounded-md p-1 flex items-center justify-center')}
              style={{ color: theme.textMuted }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span className={tkx('text-sm font-semibold')} style={{ color: theme.text }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={nextMonth}
              className={tkx('rounded-md p-1 flex items-center justify-center')}
              style={{ color: theme.textMuted }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* Day of week headers */}
          <div className={tkx('grid')} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className={tkx('text-center text-xs font-medium py-1')} style={{ color: theme.textMuted }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((cell, idx) => {
              if (!cell) return <div key={idx} />;
              const isCurrentMonth = cell.getMonth() === viewMonth;
              const isToday = isSameDay(cell, today);
              const isSelected = mode === 'single'
                ? (selectedDate ? isSameDay(cell, selectedDate) : false)
                : (selectedRange[0] ? isSameDay(cell, selectedRange[0]) : false) ||
                  (selectedRange[1] ? isSameDay(cell, selectedRange[1]) : false);
              const inRangeHighlight = mode === 'range' && isInRange(cell, selectedRange[0], selectedRange[1]);
              const disabled = isDateDisabled(cell);
              const isFocused = focusedCell ? isSameDay(cell, focusedCell) : false;

              let bg = 'transparent';
              let textColor = isCurrentMonth ? theme.text : theme.textMuted;
              let border = 'none';

              if (isSelected) { bg = theme.primary; textColor = theme.bg; }
              else if (inRangeHighlight) { bg = theme.primary + '20'; }
              if (isToday && !isSelected) border = `1.5px solid ${theme.primary}`;
              if (disabled) { textColor = theme.textMuted; }
              if (isFocused && !isSelected) { border = `1.5px solid ${theme.secondary}`; }

              return (
                <button
                  key={idx}
                  type="button"
                  tabIndex={isFocused ? 0 : -1}
                  aria-label={cell.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  aria-pressed={isSelected}
                  aria-disabled={disabled}
                  disabled={disabled}
                  onClick={() => selectDate(cell)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: bg,
                    color: textColor,
                    border,
                    fontSize: '0.8125rem',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : isCurrentMonth ? 1 : 0.45,
                    fontWeight: isToday ? 600 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

TkxDatePicker.displayName = 'TkxDatePicker';
