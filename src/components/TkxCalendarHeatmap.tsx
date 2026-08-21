'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxCalendarHeatmap — GitHub-style activity heatmap
//
// Pass an array of { date, value } and get a 53-week × 7-day grid (or any
// custom range) where each cell's intensity reflects the value.
//
// Use cases: contributions, exercise streaks, study sessions, production
// deploys, login activity, sleep score over the year.
//
// Accessibility:
//   - role="img" with aria-label summarising total
//   - Each cell has aria-label "<value> on <date>"
//   - Tab + Enter navigate cells; arrow keys move within the grid
//   - prefers-reduced-motion: tooltip transition disabled
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';

export interface HeatmapDataPoint {
  /** ISO date YYYY-MM-DD or any value Date can parse. */
  date: string;
  /** Activity level — magnitude maps to color intensity. */
  value: number;
}

export interface TkxCalendarHeatmapProps {
  /** Array of activity entries. Multiple entries on the same day are summed. */
  data: HeatmapDataPoint[];
  /** Inclusive end date (today by default). */
  endDate?: Date | string;
  /** Inclusive start date (defaults to endDate − 365 days). */
  startDate?: Date | string;
  /** 5-stop color scale low → high. Default: theme primary spectrum. */
  colors?: [string, string, string, string, string];
  /** Cell side length in px. Default 11. */
  cellSize?: number;
  /** Gap between cells in px. Default 3. */
  gap?: number;
  /** Show month labels along the top. Default true. */
  showMonthLabels?: boolean;
  /** Show weekday labels (Mon/Wed/Fri) on the left. Default true. */
  showWeekdayLabels?: boolean;
  /** Click handler. */
  onCellClick?: (point: { date: string; value: number }) => void;
  /** Format the value+date label for screen readers and tooltip. */
  formatTooltip?: (point: { date: string; value: number }) => string;
  /** aria-label for the whole heatmap. Default auto-generated. */
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format a Date as a YYYY-MM-DD key using its LOCAL calendar fields.
 * Using local getters (not toISOString, which is UTC) keeps the day-key
 * consistent with how date-only strings are parsed below, so a point dated
 * "2026-06-17" always lands on the 17th regardless of the viewer's timezone.
 */
function toLocalKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse an incoming date value as a LOCAL calendar date. Date-only strings
 * ("YYYY-MM-DD") are split and constructed via `new Date(y, m-1, d)` so they
 * are NOT shifted by the UTC interpretation `new Date(str)` would apply.
 */
function parseDate(d: Date | string): Date {
  if (d instanceof Date) return new Date(d);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.trim());
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date(d);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  // Sunday-based week (matches GitHub)
  r.setDate(r.getDate() - r.getDay());
  return r;
}

function colorForValue(value: number, max: number, scale: string[]): string {
  if (value <= 0) return scale[0];
  if (max <= 0) return scale[0];
  const ratio = value / max;
  if (ratio > 0.75) return scale[4];
  if (ratio > 0.5) return scale[3];
  if (ratio > 0.25) return scale[2];
  return scale[1];
}

// ── Component ───────────────────────────────────────────────────────────────

export function TkxCalendarHeatmap({
  data = [],
  endDate,
  startDate,
  colors,
  cellSize = 11,
  gap = 3,
  showMonthLabels = true,
  showWeekdayLabels = true,
  onCellClick,
  formatTooltip,
  ariaLabel,
  className,
  style,
}: TkxCalendarHeatmapProps) {
  const theme = useTheme();
  const [hovered, setHovered] = useState<{ date: string; value: number; x: number; y: number } | null>(null);

  // ── Compute date range ───────────────────────────────────────────────────
  const { end, start, weeks, valuesByDate, max, total } = useMemo(() => {
    const endRaw = endDate ? parseDate(endDate) : new Date();
    const e = new Date(endRaw);
    e.setHours(0, 0, 0, 0);
    const s = startDate ? parseDate(startDate) : addDays(e, -365);

    // Normalise data → date map
    const map = new Map<string, number>();
    let totalSum = 0;
    let maxValue = 0;
    for (const point of data) {
      const iso = toLocalKey(parseDate(point.date));
      const next = (map.get(iso) ?? 0) + point.value;
      map.set(iso, next);
      totalSum += point.value;
      if (next > maxValue) maxValue = next;
    }

    // Build week columns starting from the Sunday of `s`
    const firstSunday = startOfWeek(s);
    const w: Date[][] = [];
    let cursor = firstSunday;
    while (cursor <= e) {
      const week: Date[] = [];
      for (let day = 0; day < 7; day++) {
        week.push(addDays(cursor, day));
      }
      w.push(week);
      cursor = addDays(cursor, 7);
    }

    return {
      end: e,
      start: s,
      weeks: w,
      valuesByDate: map,
      max: maxValue,
      total: totalSum,
    };
  }, [data, startDate, endDate]);

  // ── Color scale ─────────────────────────────────────────────────────────
  const scale = useMemo(
    (): string[] => {
      if (colors) return colors;
      // Default: empty → 4 shades of theme primary
      const primary = theme.css.primary;
      return [theme.css.surface, `${primary}33`, `${primary}66`, `${primary}AA`, primary];
    },
    [colors, theme.css.primary, theme.css.surface],
  );

  // ── Default tooltip formatter ────────────────────────────────────────────
  const fmt = useCallback(
    formatTooltip ??
      ((p: { date: string; value: number }) => {
        const d = parseDate(p.date);
        const human = d.toLocaleDateString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        });
        return p.value > 0 ? `${p.value} on ${human}` : `No activity on ${human}`;
      }),
    [formatTooltip],
  );

  // ── Month label positions: which week-column each month starts in ────────
  const monthLabels = useMemo(() => {
    const out: { week: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const m = week[0].getMonth();
      if (m !== lastMonth) {
        out.push({ week: i, label: MONTH_NAMES[m] });
        lastMonth = m;
      }
    });
    return out;
  }, [weeks]);

  // ── Keyboard navigation ─────────────────────────────────────────────────
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, weekIdx: number, dayIdx: number) => {
    let target: HTMLElement | null = null;
    const grid = e.currentTarget.parentElement?.parentElement;
    if (!grid) return;
    function pick(w: number, d: number) {
      return grid!.querySelector<HTMLElement>(`[data-cell="${w}-${d}"]`);
    }
    if (e.key === 'ArrowRight') target = pick(weekIdx + 1, dayIdx);
    else if (e.key === 'ArrowLeft') target = pick(weekIdx - 1, dayIdx);
    else if (e.key === 'ArrowDown') target = pick(weekIdx, dayIdx + 1);
    else if (e.key === 'ArrowUp') target = pick(weekIdx, dayIdx - 1);
    if (target) {
      e.preventDefault();
      target.focus();
    }
  };

  const finalAriaLabel =
    ariaLabel ??
    `Activity heatmap from ${toLocalKey(start)} to ${toLocalKey(end)}. ${total} total events.`;

  const wrapStyle: CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    color: theme.css.text,
    ...style,
  };

  return (
    <div className={className} style={wrapStyle} role="img" aria-label={finalAriaLabel}>
      {/* Top: month labels */}
      {showMonthLabels && (
        <div
          aria-hidden="true"
          style={{
            display: 'grid',
            gridTemplateColumns: `${showWeekdayLabels ? '24px ' : ''}repeat(${weeks.length}, ${cellSize + gap}px)`,
            marginBottom: 4,
            fontSize: 10,
            color: theme.css.textMuted,
            position: 'relative',
            height: 14,
          }}
        >
          {showWeekdayLabels && <div />}
          {weeks.map((_, i) => {
            const lbl = monthLabels.find((m) => m.week === i);
            return (
              <div key={i} style={{ position: 'relative', overflow: 'visible' }}>
                {lbl && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      whiteSpace: 'nowrap',
                      fontWeight: 600,
                    }}
                  >
                    {lbl.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Body: weekday labels + cells */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {showWeekdayLabels && (
          <div
            aria-hidden="true"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(7, ${cellSize}px)`,
              rowGap: gap,
              marginRight: 4,
              fontSize: 9,
              color: theme.css.textMuted,
            }}
          >
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                style={{
                  height: cellSize,
                  lineHeight: `${cellSize}px`,
                  visibility: i % 2 === 1 ? 'visible' : 'hidden',
                }}
              >
                {w}
              </div>
            ))}
          </div>
        )}

        <div
          role="grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${weeks.length}, ${cellSize}px)`,
            columnGap: gap,
          }}
        >
          {weeks.map((week, weekIdx) => (
            <div
              key={weekIdx}
              role="row"
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(7, ${cellSize}px)`,
                rowGap: gap,
              }}
            >
              {week.map((day, dayIdx) => {
                if (day < start || day > end) {
                  return <div key={dayIdx} aria-hidden="true" />;
                }
                const iso = toLocalKey(day);
                const value = valuesByDate.get(iso) ?? 0;
                const fill = colorForValue(value, max, scale);
                const tooltip = fmt({ date: iso, value });
                return (
                  <div
                    key={dayIdx}
                    role="gridcell"
                    tabIndex={dayIdx === 0 && weekIdx === 0 ? 0 : -1}
                    data-cell={`${weekIdx}-${dayIdx}`}
                    aria-label={tooltip}
                    onClick={() => onCellClick?.({ date: iso, value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onCellClick?.({ date: iso, value });
                      } else {
                        handleKeyDown(e, weekIdx, dayIdx);
                      }
                    }}
                    onMouseEnter={(e) => {
                      const r = (e.target as HTMLElement).getBoundingClientRect();
                      const wrapR = (e.currentTarget.closest('[role="img"]') as HTMLElement)
                        ?.getBoundingClientRect();
                      setHovered({
                        date: iso,
                        value,
                        x: r.left - (wrapR?.left ?? 0) + r.width / 2,
                        y: r.top - (wrapR?.top ?? 0),
                      });
                    }}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={(e) => {
                      const r = (e.target as HTMLElement).getBoundingClientRect();
                      const wrapR = (e.currentTarget.closest('[role="img"]') as HTMLElement)
                        ?.getBoundingClientRect();
                      setHovered({
                        date: iso,
                        value,
                        x: r.left - (wrapR?.left ?? 0) + r.width / 2,
                        y: r.top - (wrapR?.top ?? 0),
                      });
                    }}
                    onBlur={() => setHovered(null)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      background: fill,
                      borderRadius: 2,
                      cursor: onCellClick ? 'pointer' : 'default',
                      border: `1px solid ${theme.css.border}33`,
                      outline: 'none',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        aria-hidden="true"
        style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 6,
          fontSize: 10,
          color: theme.css.textMuted,
        }}
      >
        <span>Less</span>
        {scale.map((c, i) => (
          <span
            key={i}
            style={{
              width: cellSize,
              height: cellSize,
              background: c,
              borderRadius: 2,
              border: `1px solid ${theme.css.border}33`,
            }}
          />
        ))}
        <span>More</span>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            left: hovered.x,
            top: hovered.y - 8,
            transform: 'translate(-50%, -100%)',
            padding: '4px 10px',
            background: theme.css.surface,
            border: `1px solid ${theme.css.border}`,
            borderRadius: 6,
            fontSize: 11,
            color: theme.css.text,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {fmt({ date: hovered.date, value: hovered.value })}
        </div>
      )}
    </div>
  );
}

