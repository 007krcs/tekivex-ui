'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxPivotTable — group + aggregate a flat record list
//
// Design intent:
//   - Drop in a flat array of records, configure which fields become
//     row groups, which become column groups, and which fields aggregate.
//   - Five built-in aggregators: sum, avg, min, max, count
//   - Multi-level row + column groups (each level adds a header strip)
//   - Grand totals on rows + columns + corner cell
//   - Headless: parent owns the data + the pivot config
//   - Zero deps — pure JS aggregation, deterministic ordering
//
// Sort order for group keys is lexicographic by default; pass `sortRows`
// or `sortCols` to override (for example, keep months in calendar order).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, type CSSProperties } from 'react';
import { useTheme, tkxThemeVars } from '../themes';

// ── Public types ────────────────────────────────────────────────────────────

export type PivotAggregator = 'sum' | 'avg' | 'min' | 'max' | 'count';

export interface PivotValue {
  /** Field on each record to aggregate. Ignored for 'count'. */
  field?: string;
  agg: PivotAggregator;
  /** Header label. Default: `${agg}(${field})`. */
  label?: string;
}

export type PivotRecord = Record<string, unknown>;

export interface TkxPivotTableProps {
  /** Flat list of records. */
  data: PivotRecord[];
  /** Row group fields, outermost first. */
  rows: string[];
  /** Column group fields, outermost first. Pass [] for no col grouping. */
  cols?: string[];
  /** Value aggregations. At least one required. */
  values: PivotValue[];
  /** Sort comparator for row group keys at each level. Default lexicographic. */
  sortRows?: (a: string, b: string, level: number) => number;
  /** Sort comparator for column group keys at each level. Default lexicographic. */
  sortCols?: (a: string, b: string, level: number) => number;
  /** Show a grand-total row + column. Default true. */
  showTotals?: boolean;
  /** Number formatter. Default: 4-decimal trim. */
  formatNumber?: (n: number) => string;
  /** Outer style. */
  style?: CSSProperties;
  className?: string;
}

// ── Aggregation engine ──────────────────────────────────────────────────────

interface AggState {
  sum: number;
  count: number;
  min: number;
  max: number;
}

function emptyState(): AggState {
  return { sum: 0, count: 0, min: Infinity, max: -Infinity };
}

function update(state: AggState, n: number): void {
  state.sum += n;
  state.count += 1;
  if (n < state.min) state.min = n;
  if (n > state.max) state.max = n;
}

function read(state: AggState, agg: PivotAggregator): number | null {
  if (state.count === 0) return null;
  switch (agg) {
    case 'sum':   return state.sum;
    case 'avg':   return state.sum / state.count;
    case 'min':   return state.min;
    case 'max':   return state.max;
    case 'count': return state.count;
  }
}

function keyOf(rec: PivotRecord, fields: string[]): string[] {
  return fields.map((f) => String(rec[f] ?? ''));
}

function defaultLabel(v: PivotValue): string {
  return v.label ?? (v.agg === 'count' ? 'count' : `${v.agg}(${v.field ?? ''})`);
}

const defaultFormat = (n: number) => {
  if (!Number.isFinite(n)) return '';
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 1e4) / 1e4);
};

// Recursive ordered tree: { children: Map<key, Node>, leafKeys: string[][] }
interface Node {
  /** Ordered child keys. */
  keys: string[];
  /** Map from key → Node */
  children: Map<string, Node>;
}

function emptyNode(): Node {
  return { keys: [], children: new Map() };
}

function ensure(node: Node, key: string): Node {
  let child = node.children.get(key);
  if (!child) {
    child = emptyNode();
    node.children.set(key, child);
    node.keys.push(key);
  }
  return child;
}

function sortTree(node: Node, level: number, cmp: (a: string, b: string, level: number) => number): void {
  node.keys.sort((a, b) => cmp(a, b, level));
  for (const k of node.keys) {
    sortTree(node.children.get(k)!, level + 1, cmp);
  }
}

/** Flatten a tree into ordered leaf paths. */
function leaves(node: Node, depth: number, prefix: string[] = []): string[][] {
  if (depth === 0) return [prefix];
  const out: string[][] = [];
  for (const k of node.keys) {
    out.push(...leaves(node.children.get(k)!, depth - 1, [...prefix, k]));
  }
  return out;
}

// ── Component ───────────────────────────────────────────────────────────────

const lexicographic = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export function TkxPivotTable({
  data = [],
  rows = [],
  cols = [],
  values = [],
  sortRows = lexicographic,
  sortCols = lexicographic,
  showTotals = true,
  formatNumber = defaultFormat,
  style,
  className,
}: TkxPivotTableProps) {
  const theme = useTheme();

  const { rowPaths, colPaths, lookup, rowTotals, colTotals, grandTotal } = useMemo(() => {
    // Build the row + column key trees.
    const rowTree = emptyNode();
    const colTree = emptyNode();

    // states[rowKey][colKey][valueIndex] = AggState
    const states = new Map<string, Map<string, AggState[]>>();
    const rowStates = new Map<string, AggState[]>();
    const colStates = new Map<string, AggState[]>();
    const grandStates: AggState[] = values.map(() => emptyState());

    for (const rec of data) {
      const rk = keyOf(rec, rows);
      const ck = keyOf(rec, cols);
      const rKey = rk.join('');
      const cKey = ck.join('');

      // Register the keys in the trees
      let n = rowTree;
      for (const k of rk) n = ensure(n, k);
      let m = colTree;
      for (const k of ck) m = ensure(m, k);

      // Get or init the cell agg state
      let row = states.get(rKey);
      if (!row) {
        row = new Map();
        states.set(rKey, row);
      }
      let cell = row.get(cKey);
      if (!cell) {
        cell = values.map(() => emptyState());
        row.set(cKey, cell);
      }

      let rowAgg = rowStates.get(rKey);
      if (!rowAgg) {
        rowAgg = values.map(() => emptyState());
        rowStates.set(rKey, rowAgg);
      }
      let colAgg = colStates.get(cKey);
      if (!colAgg) {
        colAgg = values.map(() => emptyState());
        colStates.set(cKey, colAgg);
      }

      values.forEach((v, i) => {
        let n: number;
        if (v.agg === 'count') {
          n = 1;
        } else {
          const raw = rec[v.field ?? ''];
          if (typeof raw !== 'number') return;
          n = raw;
        }
        update(cell![i], n);
        update(rowAgg![i], n);
        update(colAgg![i], n);
        update(grandStates[i], n);
      });
    }

    sortTree(rowTree, 0, sortRows);
    sortTree(colTree, 0, sortCols);

    const rowPaths = rows.length > 0 ? leaves(rowTree, rows.length) : [[]];
    const colPaths = cols.length > 0 ? leaves(colTree, cols.length) : [[]];

    return {
      rowPaths,
      colPaths,
      lookup: (rPath: string[], cPath: string[], vi: number): number | null => {
        const r = states.get(rPath.join(''));
        if (!r) return null;
        const c = r.get(cPath.join(''));
        if (!c) return null;
        return read(c[vi], values[vi].agg);
      },
      rowTotals: (rPath: string[], vi: number): number | null => {
        const s = rowStates.get(rPath.join(''));
        return s ? read(s[vi], values[vi].agg) : null;
      },
      colTotals: (cPath: string[], vi: number): number | null => {
        const s = colStates.get(cPath.join(''));
        return s ? read(s[vi], values[vi].agg) : null;
      },
      grandTotal: (vi: number): number | null => read(grandStates[vi], values[vi].agg),
    };
  }, [data, rows, cols, values, sortRows, sortCols]);

  // ── Empty state (no value aggregations configured) ──
  if (values.length === 0) {
    return (
      <div
        className={className}
        style={{
          ...tkxThemeVars(theme),
          border: '1px solid var(--tkx-border, #2a2a3e)',
          borderRadius: 8,
          background: 'var(--tkx-bg, #0a0a0f)',
          color: 'var(--tkx-fg, #e8e8f4)',
          ...style,
        }}
        data-testid="tkx-pivot"
      />
    );
  }

  // ── Render ──
  const numCols = colPaths.length * values.length + (showTotals ? values.length : 0);
  const colHeaderLevels = cols.length;
  const valueHeaderRow = colHeaderLevels; // values labels live below the col headers

  const cellPad = '6px 10px';
  const headerBg = 'var(--tkx-bg-subtle, #0d0d14)';
  const borderC = 'var(--tkx-border, #2a2a3e)';
  const borderS = 'var(--tkx-border-soft, #1a1a25)';

  return (
    <div
      className={className}
      style={{
        ...tkxThemeVars(theme),
        overflow: 'auto',
        border: `1px solid ${borderC}`,
        borderRadius: 8,
        background: 'var(--tkx-bg, #0a0a0f)',
        color: 'var(--tkx-fg, #e8e8f4)',
        ...style,
      }}
      data-testid="tkx-pivot"
    >
      <table
        role="table"
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: 13,
          fontFamily: 'inherit',
        }}
      >
        <thead>
          {/* Column header rows (one per cols-level) */}
          {Array.from({ length: colHeaderLevels }).map((_, level) => (
            <tr key={`ch${level}`}>
              {/* Top-left empty corner */}
              {level === 0 && (
                <th
                  rowSpan={colHeaderLevels + 1}
                  colSpan={rows.length}
                  style={{
                    background: headerBg,
                    border: `1px solid ${borderC}`,
                    padding: cellPad,
                    fontWeight: 700,
                    color: theme.textMuted,
                    textAlign: 'left',
                  }}
                >
                  {rows.join(' / ') || ''}
                </th>
              )}
              {/* Column group headers at this level — collapse runs of equal keys via colSpan */}
              {(() => {
                const cells: { key: string; span: number }[] = [];
                for (const path of colPaths) {
                  const k = path[level] ?? '';
                  const last = cells[cells.length - 1];
                  if (last && last.key === k) last.span += values.length;
                  else cells.push({ key: k, span: values.length });
                }
                return cells.map((c, i) => (
                  <th
                    key={i}
                    colSpan={c.span}
                    data-testid={`pivot-colhead-${level}-${c.key}`}
                    style={{
                      background: headerBg,
                      border: `1px solid ${borderC}`,
                      padding: cellPad,
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    {c.key}
                  </th>
                ));
              })()}
              {showTotals && level === 0 && (
                <th
                  rowSpan={colHeaderLevels}
                  colSpan={values.length}
                  style={{
                    background: headerBg,
                    border: `1px solid ${borderC}`,
                    padding: cellPad,
                    fontWeight: 700,
                    color: 'var(--tkx-accent, #00f5d4)',
                    textAlign: 'center',
                  }}
                >
                  Total
                </th>
              )}
            </tr>
          ))}

          {/* Value-label row (always present) */}
          <tr>
            {/* If there are no col groups we need to render the "rows" header here */}
            {colHeaderLevels === 0 && (
              <th
                colSpan={rows.length}
                style={{
                  background: headerBg,
                  border: `1px solid ${borderC}`,
                  padding: cellPad,
                  fontWeight: 700,
                  color: theme.textMuted,
                  textAlign: 'left',
                }}
              >
                {rows.join(' / ') || ''}
              </th>
            )}
            {colPaths.map((cPath, ci) =>
              values.map((v, vi) => (
                <th
                  key={`${ci}-${vi}`}
                  data-testid={`pivot-vhead-${ci}-${vi}`}
                  style={{
                    background: headerBg,
                    border: `1px solid ${borderS}`,
                    padding: cellPad,
                    fontSize: 11,
                    fontWeight: 600,
                    color: theme.textMuted,
                    textAlign: 'right',
                  }}
                >
                  {defaultLabel(v)}
                </th>
              )),
            )}
            {showTotals &&
              values.map((v, vi) => (
                <th
                  key={`tv-${vi}`}
                  style={{
                    background: headerBg,
                    border: `1px solid ${borderS}`,
                    padding: cellPad,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--tkx-accent, #00f5d4)',
                    textAlign: 'right',
                  }}
                >
                  {defaultLabel(v)}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {rowPaths.map((rPath, ri) => (
            <tr key={ri} data-testid={`pivot-row-${ri}`}>
              {rPath.map((label, li) => (
                <th
                  key={li}
                  scope="row"
                  style={{
                    background: 'var(--tkx-bg-subtle, #12121a)',
                    border: `1px solid ${borderS}`,
                    padding: cellPad,
                    fontWeight: 600,
                    textAlign: 'left',
                  }}
                >
                  {label}
                </th>
              ))}
              {colPaths.map((cPath, ci) =>
                values.map((_, vi) => {
                  const v = lookup(rPath, cPath, vi);
                  return (
                    <td
                      key={`${ci}-${vi}`}
                      data-testid={`pivot-cell-${ri}-${ci}-${vi}`}
                      style={{
                        border: `1px solid ${borderS}`,
                        padding: cellPad,
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {v === null ? '' : formatNumber(v)}
                    </td>
                  );
                }),
              )}
              {showTotals &&
                values.map((_, vi) => {
                  const v = rowTotals(rPath, vi);
                  return (
                    <td
                      key={`rt-${vi}`}
                      data-testid={`pivot-rowtotal-${ri}-${vi}`}
                      style={{
                        border: `1px solid ${borderC}`,
                        padding: cellPad,
                        textAlign: 'right',
                        fontWeight: 700,
                        background: 'rgba(0,245,212,0.04)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {v === null ? '' : formatNumber(v)}
                    </td>
                  );
                })}
            </tr>
          ))}

          {showTotals && (
            <tr data-testid="pivot-totals-row">
              <th
                colSpan={Math.max(rows.length, 1)}
                scope="row"
                style={{
                  background: headerBg,
                  border: `1px solid ${borderC}`,
                  padding: cellPad,
                  fontWeight: 700,
                  color: 'var(--tkx-accent, #00f5d4)',
                  textAlign: 'left',
                }}
              >
                Total
              </th>
              {colPaths.map((cPath, ci) =>
                values.map((_, vi) => {
                  const v = colTotals(cPath, vi);
                  return (
                    <td
                      key={`ct-${ci}-${vi}`}
                      data-testid={`pivot-coltotal-${ci}-${vi}`}
                      style={{
                        border: `1px solid ${borderC}`,
                        padding: cellPad,
                        textAlign: 'right',
                        fontWeight: 700,
                        background: 'rgba(0,245,212,0.04)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {v === null ? '' : formatNumber(v)}
                    </td>
                  );
                }),
              )}
              {values.map((_, vi) => {
                const v = grandTotal(vi);
                return (
                  <td
                    key={`gt-${vi}`}
                    data-testid={`pivot-grandtotal-${vi}`}
                    style={{
                      border: `1px solid ${borderC}`,
                      padding: cellPad,
                      textAlign: 'right',
                      fontWeight: 700,
                      background: 'rgba(0,245,212,0.1)',
                      color: 'var(--tkx-accent, #00f5d4)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {v === null ? '' : formatNumber(v)}
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
