'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxGantt — project timeline
//
// Design intent:
//   - Two-column layout: task list (left) + timeline (right)
//   - Day-resolution scale; auto-fits to the date range of the data
//   - SVG dependency arrows (orthogonal — out the right of source, into
//     the left of target, with rounded elbows)
//   - Progress fill inside each bar
//   - Keyboard nav: ↑/↓ across tasks, ←/→ shifts the selected task by
//     one day (emits onTaskChange — parent commits the change)
//   - Headless: parent owns the tasks array
//   - Zero deps — no Date-fns, no d3, vanilla Date math
//
// Timezone-safe: every date math operation runs in UTC so a task that
// starts on 2026-05-01 doesn't slide by 24h when the user's TZ flips.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useTheme, tkxThemeVars } from '../themes';

// ── Public types ────────────────────────────────────────────────────────────

export interface GanttTask {
  id: string;
  label: string;
  /** ISO date (YYYY-MM-DD) or Date object — start day, inclusive. */
  start: string | Date;
  /** ISO date or Date — end day, inclusive. Must be ≥ start. */
  end: string | Date;
  /** 0..1 — fraction complete. Default 0. */
  progress?: number;
  /** Task ids this task depends on. Renders an arrow from each. */
  dependencies?: string[];
  /** Bar accent color. */
  color?: string;
  /** Free-form payload returned to your callbacks. */
  data?: unknown;
}

export interface TkxGanttProps {
  tasks: GanttTask[];
  /** Pixels per day on the timeline. Default 28. */
  dayWidth?: number;
  /** Height of each task row in pixels. Default 40. */
  rowHeight?: number;
  /** Width of the task-label column on the left. Default 220. */
  labelColumnWidth?: number;
  /** Selected task id (controlled). Pass null for none. */
  selectedId?: string | null;
  /** Fires on row click + on keyboard nav. */
  onSelect?: (id: string, task: GanttTask) => void;
  /** Fires when a task is rescheduled via keyboard ←/→.
   *  Parent must commit the change to its tasks array. */
  onTaskChange?: (id: string, next: { start: string; end: string }, task: GanttTask) => void;
  /** Outer style. */
  style?: CSSProperties;
  className?: string;
}

// ── Date helpers (UTC-safe) ─────────────────────────────────────────────────

/** Parse an ISO date string ('YYYY-MM-DD') or a Date into a UTC midnight Date. */
export function parseDay(input: string | Date): Date {
  if (input instanceof Date) {
    return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
  }
  // Strict YYYY-MM-DD parsing
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
  if (!m) throw new Error(`TkxGantt: invalid date "${input}" (expected YYYY-MM-DD)`);
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

export function formatDay(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MS_PER_DAY = 86_400_000;

/** Inclusive day-difference: dayDiff('2026-05-01','2026-05-03') === 2. */
export function dayDiff(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_PER_DAY);
}

function shortMonth(d: Date): string {
  return d.toLocaleString('en', { month: 'short', timeZone: 'UTC' });
}

// ── Component ───────────────────────────────────────────────────────────────

export function TkxGantt({
  tasks = [],
  dayWidth = 28,
  rowHeight = 40,
  labelColumnWidth = 220,
  selectedId: controlledSelected,
  onSelect,
  onTaskChange,
  style,
  className,
}: TkxGanttProps) {
  const theme = useTheme();
  const [internalSelected, setInternalSelected] = useState<string | null>(tasks[0]?.id ?? null);
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;

  // ── Compute the timeline bounds ──
  const { rangeStart, rangeEnd, totalDays, parsed } = useMemo(() => {
    if (tasks.length === 0) {
      const today = parseDay(new Date());
      return { rangeStart: today, rangeEnd: addDays(today, 7), totalDays: 7, parsed: [] };
    }
    const parsed = tasks.map((t) => ({
      task: t,
      start: parseDay(t.start),
      end: parseDay(t.end),
    }));
    let min = parsed[0].start;
    let max = parsed[0].end;
    for (const p of parsed) {
      if (p.start.getTime() < min.getTime()) min = p.start;
      if (p.end.getTime() > max.getTime()) max = p.end;
    }
    // Pad one day on each side for visual breathing room
    const rangeStart = addDays(min, -1);
    const rangeEnd = addDays(max, 1);
    const totalDays = dayDiff(rangeStart, rangeEnd) + 1;
    return { rangeStart, rangeEnd, totalDays, parsed };
  }, [tasks]);

  // ── Position helpers ──
  const xForDay = useCallback((d: Date) => dayDiff(rangeStart, d) * dayWidth, [rangeStart, dayWidth]);

  const taskById = useMemo(() => {
    const m = new Map<string, { task: GanttTask; index: number; start: Date; end: Date }>();
    parsed.forEach((p, i) => m.set(p.task.id, { ...p, index: i }));
    return m;
  }, [parsed]);

  // ── Selection + keyboard nav ──
  const select = useCallback(
    (id: string) => {
      if (controlledSelected === undefined) setInternalSelected(id);
      const t = tasks.find((x) => x.id === id);
      if (t) onSelect?.(id, t);
    },
    [controlledSelected, onSelect, tasks],
  );

  const shiftSelectedBy = useCallback(
    (days: number) => {
      if (!selected) return;
      const entry = taskById.get(selected);
      if (!entry) return;
      const nextStart = addDays(entry.start, days);
      const nextEnd = addDays(entry.end, days);
      onTaskChange?.(
        selected,
        { start: formatDay(nextStart), end: formatDay(nextEnd) },
        entry.task,
      );
    },
    [selected, taskById, onTaskChange],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!selected) return;
    const idx = tasks.findIndex((t) => t.id === selected);
    switch (e.key) {
      case 'ArrowUp':
        if (idx > 0) {
          e.preventDefault();
          select(tasks[idx - 1].id);
        }
        break;
      case 'ArrowDown':
        if (idx < tasks.length - 1) {
          e.preventDefault();
          select(tasks[idx + 1].id);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        shiftSelectedBy(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        shiftSelectedBy(1);
        break;
    }
  };

  // ── Render ──
  const timelineWidth = totalDays * dayWidth;
  const totalHeight = tasks.length * rowHeight;
  const headerHeight = 48;

  return (
    <div
      className={className}
      role="application"
      aria-label="Gantt chart"
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-testid="tkx-gantt"
      style={{
        ...tkxThemeVars(theme),
        display: 'flex',
        outline: 'none',
        border: '1px solid var(--tkx-border, #2a2a3e)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--tkx-bg, #0a0a0f)',
        color: 'var(--tkx-fg, #e8e8f4)',
        ...style,
      }}
    >
      {/* ── Left: task labels ── */}
      <div
        role="list"
        aria-label="Tasks"
        style={{
          width: labelColumnWidth,
          flex: `0 0 ${labelColumnWidth}px`,
          borderRight: '1px solid var(--tkx-border, #2a2a3e)',
          background: 'var(--tkx-bg-subtle, #0d0d14)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: headerHeight,
            borderBottom: '1px solid var(--tkx-border, #2a2a3e)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: theme.css.textMuted,
          }}
        >
          Task
        </div>
        {tasks.map((t) => {
          const isSelected = t.id === selected;
          return (
            <div
              key={t.id}
              role="listitem"
              data-testid={`gantt-label-${t.id}`}
              onClick={() => select(t.id)}
              style={{
                height: rowHeight,
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--tkx-border-soft, #1a1a25)',
                background: isSelected ? 'rgba(0,245,212,0.08)' : 'transparent',
                fontSize: 13,
                fontWeight: isSelected ? 600 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={t.label}
            >
              {t.label}
            </div>
          );
        })}
      </div>

      {/* ── Right: scrollable timeline ── */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ position: 'relative', width: timelineWidth, minWidth: '100%' }}>
          {/* Date header */}
          <div
            style={{
              height: headerHeight,
              borderBottom: '1px solid var(--tkx-border, #2a2a3e)',
              position: 'sticky',
              top: 0,
              background: 'var(--tkx-bg-subtle, #0d0d14)',
              zIndex: 2,
            }}
          >
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = addDays(rangeStart, i);
              const isMonthStart = d.getUTCDate() === 1 || i === 0;
              const dow = d.getUTCDay(); // 0 = Sunday
              const isWeekend = dow === 0 || dow === 6;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: i * dayWidth,
                    top: 0,
                    width: dayWidth,
                    height: headerHeight,
                    fontSize: 10,
                    color: isWeekend ? theme.css.textMuted : theme.css.text,
                    textAlign: 'center',
                    borderRight: '1px solid var(--tkx-border-soft, #1a1a25)',
                    paddingTop: 4,
                  }}
                >
                  {isMonthStart && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--tkx-accent, #00f5d4)' }}>
                      {shortMonth(d)}
                    </div>
                  )}
                  <div style={{ marginTop: isMonthStart ? 2 : 14 }}>{d.getUTCDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Body — rows + bars + arrows */}
          <div style={{ position: 'relative', height: totalHeight }}>
            {/* Weekend background stripes */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = addDays(rangeStart, i);
              const dow = d.getUTCDay();
              if (dow !== 0 && dow !== 6) return null;
              return (
                <div
                  key={`w${i}`}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: i * dayWidth,
                    top: 0,
                    width: dayWidth,
                    height: totalHeight,
                    background: 'rgba(255,255,255,0.02)',
                    pointerEvents: 'none',
                  }}
                />
              );
            })}

            {/* Row separators */}
            {tasks.map((_, i) => (
              <div
                key={`r${i}`}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: (i + 1) * rowHeight - 1,
                  height: 1,
                  background: 'var(--tkx-border-soft, #1a1a25)',
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Task bars */}
            {parsed.map((p, i) => {
              const isSelected = p.task.id === selected;
              const x = xForDay(p.start);
              const w = (dayDiff(p.start, p.end) + 1) * dayWidth;
              const accent = p.task.color || 'var(--tkx-accent, #00f5d4)';
              const progress = Math.max(0, Math.min(1, p.task.progress ?? 0));
              return (
                <div
                  key={p.task.id}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${p.task.label}: ${formatDay(p.start)} to ${formatDay(p.end)}`}
                  data-testid={`gantt-bar-${p.task.id}`}
                  onClick={() => select(p.task.id)}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: i * rowHeight + 6,
                    width: w,
                    height: rowHeight - 12,
                    borderRadius: 6,
                    border: `1px solid ${accent}`,
                    background: isSelected ? `${accent}33` : `${accent}1f`,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    boxShadow: isSelected ? `0 0 0 2px ${accent}40` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--tkx-fg, #e8e8f4)',
                    boxSizing: 'border-box',
                  }}
                >
                  {progress > 0 && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: `${progress * 100}%`,
                        background: `${accent}55`,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  <span
                    style={{
                      position: 'relative',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                      paddingRight: 8,
                    }}
                  >
                    {p.task.label}
                  </span>
                </div>
              );
            })}

            {/* Dependency arrows */}
            <svg
              aria-hidden="true"
              width={timelineWidth}
              height={totalHeight}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            >
              <defs>
                <marker
                  id="tkx-gantt-arrowhead"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 z" fill="var(--tkx-fg-muted, #aaa)" />
                </marker>
              </defs>
              {parsed.flatMap((p, i) => {
                if (!p.task.dependencies?.length) return [];
                return p.task.dependencies.map((depId) => {
                  const src = taskById.get(depId);
                  if (!src) return null;
                  const x1 = xForDay(src.end) + dayWidth; // right edge of source bar
                  const y1 = src.index * rowHeight + rowHeight / 2;
                  const x2 = xForDay(p.start); // left edge of target bar
                  const y2 = i * rowHeight + rowHeight / 2;
                  // Orthogonal route: right, down, right, with rounded elbows.
                  const midX = Math.max(x1 + 8, x2 - 8);
                  const d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
                  return (
                    <path
                      key={`${depId}->${p.task.id}`}
                      data-testid={`gantt-arrow-${depId}-to-${p.task.id}`}
                      d={d}
                      stroke="var(--tkx-fg-muted, #aaa)"
                      strokeOpacity={0.6}
                      strokeWidth={1.5}
                      fill="none"
                      markerEnd="url(#tkx-gantt-arrowhead)"
                    />
                  );
                });
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
