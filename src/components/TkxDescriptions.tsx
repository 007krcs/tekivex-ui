'use client';

import {
  forwardRef,
  useEffect,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

// ─────────────────────────────────────────────────────────────────────────────
// TkxDescriptions — a read-only key/value detail list for record-detail views.
//
// Every admin/CRUD app has a "view record" screen; this is the component that
// stops people hand-rolling it. Two render modes:
//   - bordered: a real <table> with <th scope="row"> label cells and <td>
//     value cells on a theme.border grid (label cells get theme.surfaceAlt)
//   - plain (default): a semantic <dl> laid out on a CSS grid
//
// `span` lets an item stretch across N columns (clamped to what is left in
// the current row, Ant-style); in bordered mode the last cell of a row
// auto-fills the remainder so the table stays rectangular.
// ─────────────────────────────────────────────────────────────────────────────

export interface TkxDescriptionsItem {
  key?: string;
  label: ReactNode;
  children: ReactNode;
  /** Number of columns this item spans (clamped to the columns left in the row). */
  span?: number;
}

export interface TkxDescriptionsColumnMap {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

export interface TkxDescriptionsProps {
  /** The key/value entries to render. Defaults to [] — a bare mount must not crash. */
  items?: TkxDescriptionsItem[];
  /** Header title, rendered above the list. */
  title?: ReactNode;
  /** Right-aligned header slot (e.g. an Edit button). */
  extra?: ReactNode;
  /**
   * Number of columns per row, or a responsive map keyed by breakpoint
   * (xs / sm / md / lg). Responsive maps resolve via window.matchMedia;
   * on the server the largest defined breakpoint value is used. Default 3.
   */
  column?: number | TkxDescriptionsColumnMap;
  /** Render as a bordered table grid. Default false. */
  bordered?: boolean;
  /** 'horizontal' = label beside value; 'vertical' = label above value. Default 'horizontal'. */
  layout?: 'horizontal' | 'vertical';
  /** Cell padding scale. Default 'middle'. */
  size?: 'small' | 'middle' | 'large';
  /** Append ':' after labels in the horizontal non-bordered layout. Default true. */
  colon?: boolean;
  /** Extra styles for every label cell. */
  labelStyle?: CSSProperties;
  /** Extra styles for every value cell. */
  contentStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
}

// ── Responsive column resolution ─────────────────────────────────────────────

/** Breakpoints, largest first. Aligned with TkxLayout's BREAKPOINTS scale. */
const BP_ORDER = ['lg', 'md', 'sm', 'xs'] as const;
type Breakpoint = (typeof BP_ORDER)[number];
const BP_MIN_WIDTH: Record<Exclude<Breakpoint, 'xs'>, number> = {
  lg: 992,
  md: 768,
  sm: 576,
};

const DEFAULT_COLUMN = 3;

/**
 * Pick the column count for the active breakpoint: prefer the value defined
 * at the active breakpoint, then fall back toward smaller breakpoints, then
 * toward larger ones, then the default.
 */
function pickColumn(map: TkxDescriptionsColumnMap, active: Breakpoint): number {
  const idx = BP_ORDER.indexOf(active);
  for (let i = idx; i < BP_ORDER.length; i++) {
    const v = map[BP_ORDER[i]];
    if (typeof v === 'number') return v;
  }
  for (let i = idx - 1; i >= 0; i--) {
    const v = map[BP_ORDER[i]];
    if (typeof v === 'number') return v;
  }
  return DEFAULT_COLUMN;
}

/** SSR / first-render resolution: largest defined breakpoint value. */
function resolveServerColumn(column: number | TkxDescriptionsColumnMap): number {
  if (typeof column === 'number') return column;
  return pickColumn(column, 'lg');
}

function useResolvedColumn(column: number | TkxDescriptionsColumnMap): number {
  const [resolved, setResolved] = useState(() => resolveServerColumn(column));

  // Stable dependency for object literals passed inline on every render.
  const columnKey = typeof column === 'number' ? column : JSON.stringify(column);

  useEffect(() => {
    if (typeof column === 'number') {
      setResolved(column);
      return;
    }
    // SSR / non-browser guard: keep the largest-breakpoint default.
    if (typeof window === 'undefined' || !window.matchMedia) {
      setResolved(resolveServerColumn(column));
      return;
    }

    const mqls = (Object.keys(BP_MIN_WIDTH) as Array<keyof typeof BP_MIN_WIDTH>).map(
      (bp) => ({ bp, mql: window.matchMedia(`(min-width: ${BP_MIN_WIDTH[bp]}px)`) }),
    );

    const compute = () => {
      let active: Breakpoint = 'xs';
      for (const { bp, mql } of mqls) {
        if (mql.matches) {
          active = bp;
          break; // mqls is ordered largest-first
        }
      }
      setResolved(pickColumn(column, active));
    };

    compute();
    for (const { mql } of mqls) mql.addEventListener('change', compute);
    return () => {
      for (const { mql } of mqls) mql.removeEventListener('change', compute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnKey]);

  return Math.max(1, Math.floor(typeof column === 'number' ? column : resolved));
}

// ── Row building (span clamping) ─────────────────────────────────────────────

interface Cell {
  item: TkxDescriptionsItem;
  span: number;
  index: number;
}

function buildRows(items: TkxDescriptionsItem[], columns: number, fillLast: boolean): Cell[][] {
  const rows: Cell[][] = [];
  let current: Cell[] = [];
  let used = 0;

  items.forEach((item, index) => {
    let span = Math.max(1, Math.floor(item.span ?? 1));
    // Clamp to the columns remaining in this row (Ant-style).
    span = Math.min(span, columns - used);
    current.push({ item, span, index });
    used += span;
    if (used >= columns) {
      rows.push(current);
      current = [];
      used = 0;
    }
  });

  if (current.length > 0) {
    if (fillLast) {
      // Stretch the final cell so a bordered table stays rectangular.
      current[current.length - 1].span += columns - used;
    }
    rows.push(current);
  }
  return rows;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** String labels/values pass through sanitizeString; ReactNode passes as-is. */
function safe(node: ReactNode): ReactNode {
  return typeof node === 'string' ? sanitizeString(node) : node;
}

const CELL_PADDING: Record<'small' | 'middle' | 'large', string> = {
  small: '6px 10px',
  middle: '10px 14px',
  large: '14px 18px',
};

const GRID_GAP: Record<'small' | 'middle' | 'large', string> = {
  small: '6px 16px',
  middle: '10px 24px',
  large: '14px 32px',
};

const VISUALLY_HIDDEN: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// ── Component ────────────────────────────────────────────────────────────────

export const TkxDescriptions = forwardRef<HTMLDivElement, TkxDescriptionsProps>(
  (
    {
      items = [],
      title,
      extra,
      column = DEFAULT_COLUMN,
      bordered = false,
      layout = 'horizontal',
      size = 'middle',
      colon = true,
      labelStyle,
      contentStyle,
      className,
      style,
    },
    ref,
  ) => {
    const theme = useTheme();
    const columns = useResolvedColumn(column);
    const rows = buildRows(items, columns, bordered);
    const padding = CELL_PADDING[size];

    const cellKey = (cell: Cell) => cell.item.key ?? `tkx-desc-${cell.index}`;

    // ── Header (title + extra) ────────────────────────────────────────────
    const header =
      title != null || extra != null ? (
        <div
          className={tkx('flex items-center justify-between gap-2')}
          style={{ marginBottom: '12px' }}
        >
          <div style={{ color: theme.text, fontWeight: 600, fontSize: '1rem' }}>
            {safe(title)}
          </div>
          {extra != null && <div>{safe(extra)}</div>}
        </div>
      ) : null;

    // ── Bordered: real <table> ────────────────────────────────────────────
    let body: ReactNode;
    if (bordered) {
      const thStyle: CSSProperties = {
        padding,
        backgroundColor: theme.surfaceAlt,
        color: theme.textMuted,
        fontWeight: 500,
        fontSize: '0.875rem',
        textAlign: 'start',
        border: `1px solid ${theme.border}`,
        verticalAlign: 'top',
        ...labelStyle,
      };
      const tdStyle: CSSProperties = {
        padding,
        color: theme.text,
        fontSize: '0.875rem',
        border: `1px solid ${theme.border}`,
        verticalAlign: 'top',
        ...contentStyle,
      };

      body = (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: `1px solid ${theme.border}`,
            tableLayout: 'fixed',
          }}
        >
          {title != null && <caption style={VISUALLY_HIDDEN}>{safe(title)}</caption>}
          <tbody>
            {layout === 'horizontal'
              ? rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell) => [
                      <th key={`${cellKey(cell)}-label`} scope="row" style={thStyle}>
                        {safe(cell.item.label)}
                      </th>,
                      <td
                        key={`${cellKey(cell)}-content`}
                        colSpan={cell.span * 2 - 1}
                        style={tdStyle}
                      >
                        {safe(cell.item.children)}
                      </td>,
                    ])}
                  </tr>
                ))
              : rows.map((row, r) => [
                  <tr key={`${r}-labels`}>
                    {row.map((cell) => (
                      <th key={cellKey(cell)} scope="col" colSpan={cell.span} style={thStyle}>
                        {safe(cell.item.label)}
                      </th>
                    ))}
                  </tr>,
                  <tr key={`${r}-contents`}>
                    {row.map((cell) => (
                      <td key={cellKey(cell)} colSpan={cell.span} style={tdStyle}>
                        {safe(cell.item.children)}
                      </td>
                    ))}
                  </tr>,
                ])}
          </tbody>
        </table>
      );
    } else {
      // ── Plain: semantic <dl> on a CSS grid ─────────────────────────────
      const horizontal = layout === 'horizontal';
      body = (
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: GRID_GAP[size],
            margin: 0,
          }}
        >
          {rows.flat().map((cell) => (
            <div
              key={cellKey(cell)}
              style={{
                gridColumn: `span ${cell.span} / span ${cell.span}`,
                display: 'flex',
                flexDirection: horizontal ? 'row' : 'column',
                alignItems: horizontal ? 'baseline' : undefined,
                gap: horizontal ? '6px' : '2px',
                minWidth: 0,
              }}
            >
              <dt
                style={{
                  color: theme.textMuted,
                  fontSize: '0.875rem',
                  margin: 0,
                  flexShrink: 0,
                  ...labelStyle,
                }}
              >
                {safe(cell.item.label)}
                {horizontal && colon ? ':' : null}
              </dt>
              <dd
                style={{
                  color: theme.text,
                  fontSize: '0.875rem',
                  margin: 0,
                  minWidth: 0,
                  overflowWrap: 'break-word',
                  ...contentStyle,
                }}
              >
                {safe(cell.item.children)}
              </dd>
            </div>
          ))}
        </dl>
      );
    }

    return (
      <div ref={ref} className={cx(tkx('w-full font-sans'), className)} style={style}>
        {header}
        {body}
      </div>
    );
  },
);

TkxDescriptions.displayName = 'TkxDescriptions';
