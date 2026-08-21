'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxHeatmap — own-SVG matrix heatmap (zero deps)
//
// Sibling to TkxSparkline / TkxGauge (v3.21 chart primitives). This is the
// MATRIX-style heatmap — categorical x and y, color-coded cells. Use it for:
// cohort retention, confusion matrices, correlation matrices, hourly traffic
// (24h × 7d), feature/segment intensity grids.
//
// NOT a calendar — see TkxCalendarHeatmap for the date-driven GitHub-style
// activity heatmap.
//
// All rendering happens inside a single <svg> so the whole composition
// (cells + axis labels + legend) scales as one unit.
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef, type HTMLAttributes } from 'react';
import { useTheme } from '../themes';
import { cx, tkx } from '../engine/tkx';
import { relativeLuminance } from '../engine/wcag';

export interface TkxHeatmapCell {
  /** x-axis position / label. */
  x: string | number;
  /** y-axis position / label. */
  y: string | number;
  /** Value used to derive the cell color. */
  value: number;
  /** Optional override for the displayed (and tooltip) value text. */
  label?: string;
}

export interface TkxHeatmapProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> {
  data: TkxHeatmapCell[];
  /** If undefined, derived from data (sorted unique). */
  xLabels?: Array<string | number>;
  /** If undefined, derived from data (sorted unique). */
  yLabels?: Array<string | number>;
  /** Side length of each cell in px. Default 32. */
  cellSize?: number;
  /** Spacing between cells in px. Default 2. */
  gap?: number;
  /** Built-in scale name or a custom color stop array. Default 'sequential'. */
  colorScale?: 'sequential' | 'diverging' | string[];
  /** [min, max] for color mapping. Default derived from data. */
  domain?: [number, number];
  /** Render the value text inside each cell (auto contrast). Default false. */
  showValues?: boolean;
  /** Render the legend. Default true. */
  showLegend?: boolean;
  /** Legend position. Default 'right'. */
  legendPosition?: 'right' | 'bottom';
  /** Format the displayed / tooltip value. Default `String(v)`. */
  formatValue?: (v: number) => string;
  /** Fill used when an (x, y) pair has no datapoint. Default theme.css.surfaceAlt. */
  emptyCellColor?: string;
  ariaLabel?: string;
  onCellClick?: (cell: TkxHeatmapCell) => void;
  className?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function uniqueSorted(values: Array<string | number>): Array<string | number> {
  const seen = new Set<string>();
  const out: Array<string | number> = [];
  for (const v of values) {
    const key = String(v);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(v);
    }
  }
  // Numeric-aware sort: if every entry is numeric, sort numerically.
  const allNumeric = out.every((v) => typeof v === 'number' || /^-?\d+(\.\d+)?$/.test(String(v)));
  if (allNumeric) {
    return out.sort((a, b) => Number(a) - Number(b));
  }
  return out.sort((a, b) => String(a).localeCompare(String(b)));
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [
    isNaN(r) ? 0 : r,
    isNaN(g) ? 0 : g,
    isNaN(b) ? 0 : b,
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHex(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
}

/**
 * Interpolate across an arbitrary-length stop array by position in [0, 1].
 * Each stop sits at i / (stops.length - 1).
 */
function interpStops(stops: string[], t: number): string {
  if (stops.length === 0) return '#000000';
  if (stops.length === 1) return stops[0];
  if (t <= 0) return stops[0];
  if (t >= 1) return stops[stops.length - 1];
  const scaled = t * (stops.length - 1);
  const idx = Math.floor(scaled);
  const frac = scaled - idx;
  return lerpHex(stops[idx], stops[idx + 1], frac);
}

/**
 * Pick the color for a value given the scale config and the domain. Always
 * normalises into [0, 1] of the (max - min) range, then maps through the
 * chosen scale.
 */
function colorForValue(
  value: number,
  domain: [number, number],
  scale: 'sequential' | 'diverging' | string[],
  primary: string,
): string {
  const [lo, hi] = domain;
  const range = hi - lo;
  // Degenerate domain (e.g. all values identical): everything is mid-color.
  const t = range === 0 ? 0.5 : Math.max(0, Math.min(1, (value - lo) / range));

  if (Array.isArray(scale)) {
    return interpStops(scale.length > 0 ? scale : [primary], t);
  }

  if (scale === 'diverging') {
    // Red → white → blue. Useful for correlation matrices (-1 .. +1).
    return interpStops(['#d7191c', '#ffffff', '#2c7bb6'], t);
  }

  // 'sequential' — light → dark via lerp from a near-white tint to `primary`.
  // Using the theme primary as the dark endpoint keeps the chart on-brand.
  return interpStops(['#f7fbff', primary], t);
}

/** Black or white text — whichever has more contrast against the cell. */
function pickTextColor(bgHex: string): string {
  const lum = relativeLuminance(bgHex);
  // 0.179 is the WCAG-AAA crossover for white-vs-black on a neutral surface.
  return lum > 0.179 ? '#000000' : '#ffffff';
}

// ── Component ───────────────────────────────────────────────────────────────

export const TkxHeatmap = forwardRef<HTMLDivElement, TkxHeatmapProps>(
  (
    {
      data,
      xLabels,
      yLabels,
      cellSize = 32,
      gap = 2,
      colorScale = 'sequential',
      domain,
      showValues = false,
      showLegend = true,
      legendPosition = 'right',
      formatValue,
      emptyCellColor,
      ariaLabel,
      onCellClick,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();
    const safeData = Array.isArray(data) ? data : [];
    const fmt = formatValue ?? ((v: number) => String(v));
    const emptyFill = emptyCellColor ?? theme.css.surfaceAlt;

    // ── Empty state ───────────────────────────────────────────────────────
    if (safeData.length === 0 && (!xLabels || xLabels.length === 0) && (!yLabels || yLabels.length === 0)) {
      const label = ariaLabel ?? 'Heatmap with no data';
      return (
        <div
          ref={ref}
          role="img"
          aria-label={label}
          className={cx(tkx('inline-flex items-center justify-center'), className)}
          style={{ color: theme.css.textMuted, fontSize: 12, padding: 16, ...style }}
          data-tkx-heatmap-empty=""
          {...rest}
        >
          <svg width={cellSize * 4} height={cellSize * 2} aria-hidden="true" />
          <span style={{ marginLeft: 8 }}>No data</span>
        </div>
      );
    }

    // ── Axis labels ──────────────────────────────────────────────────────
    const xs = xLabels ?? uniqueSorted(safeData.map((d) => d.x));
    const ys = yLabels ?? uniqueSorted(safeData.map((d) => d.y));

    // ── Domain ───────────────────────────────────────────────────────────
    const values = safeData.map((d) => d.value);
    const dataMin = values.length > 0 ? Math.min(...values) : 0;
    const dataMax = values.length > 0 ? Math.max(...values) : 1;
    const [dmin, dmax] = domain ?? [dataMin, dataMax];
    const effectiveDomain: [number, number] = [dmin, dmax];

    // ── Indexed cell map for O(1) lookup ─────────────────────────────────
    const cellMap = new Map<string, TkxHeatmapCell>();
    for (const c of safeData) {
      cellMap.set(`${String(c.x)} ${String(c.y)}`, c);
    }

    // ── Layout maths ─────────────────────────────────────────────────────
    // Reserve space for axis label text. These are rough character estimates
    // (we don't measure DOM in the render path — SVG <text> handles overflow).
    const longestY = ys.reduce<number>((m, v) => Math.max(m, String(v).length), 0);
    const Y_AXIS_W = Math.max(24, longestY * 7 + 8);

    const longestX = xs.reduce<number>((m, v) => Math.max(m, String(v).length), 0);
    const xLabelsRotate = longestX * 7 > cellSize + gap;
    const X_AXIS_H = xLabelsRotate ? Math.min(80, longestX * 5 + 12) : 18;

    const gridW = xs.length * cellSize + Math.max(0, xs.length - 1) * gap;
    const gridH = ys.length * cellSize + Math.max(0, ys.length - 1) * gap;

    const LEGEND_THICK = 10;
    const LEGEND_PAD = 12;
    const LEGEND_LABEL_W = 36; // room for min/max numeric text
    const LEGEND_LABEL_H = 14;

    const legendOnRight = showLegend && legendPosition === 'right';
    const legendOnBottom = showLegend && legendPosition === 'bottom';

    const width =
      Y_AXIS_W +
      gridW +
      (legendOnRight ? LEGEND_PAD + LEGEND_THICK + LEGEND_LABEL_W : 0) +
      4;
    const height =
      gridH +
      X_AXIS_H +
      (legendOnBottom ? LEGEND_PAD + LEGEND_THICK + LEGEND_LABEL_H : 0) +
      4;

    const gridX = Y_AXIS_W;
    const gridY = 2;

    // ── Default aria-label ───────────────────────────────────────────────
    const minLabel = fmt(effectiveDomain[0]);
    const maxLabel = fmt(effectiveDomain[1]);
    const finalAriaLabel =
      ariaLabel ??
      `Heatmap with ${xs.length}×${ys.length} cells, values from ${minLabel} to ${maxLabel}`;

    // ── Build cell rects ─────────────────────────────────────────────────
    const cellNodes: React.ReactNode[] = [];
    for (let row = 0; row < ys.length; row++) {
      const yKey = String(ys[row]);
      for (let col = 0; col < xs.length; col++) {
        const xKey = String(xs[col]);
        const cell = cellMap.get(`${xKey} ${yKey}`);
        const cx2 = gridX + col * (cellSize + gap);
        const cy = gridY + row * (cellSize + gap);

        const fill = cell
          ? colorForValue(cell.value, effectiveDomain, colorScale, theme.primary)
          : emptyFill;

        const clickable = !!onCellClick && !!cell;
        const tooltip = cell
          ? `${xKey} × ${yKey}: ${cell.label ?? fmt(cell.value)}`
          : `${xKey} × ${yKey}: no data`;

        const handleClick = clickable
          ? () => onCellClick!(cell!)
          : undefined;

        cellNodes.push(
          <g
            key={`${col}-${row}`}
            data-tkx-heatmap-cell=""
            data-x={xKey}
            data-y={yKey}
            data-empty={cell ? undefined : ''}
            onClick={handleClick}
            style={{ cursor: clickable ? 'pointer' : 'default' }}
          >
            <rect
              x={cx2}
              y={cy}
              width={cellSize}
              height={cellSize}
              fill={fill}
              rx={2}
              ry={2}
            >
              <title>{tooltip}</title>
            </rect>
            {showValues && cell && (
              <text
                x={cx2 + cellSize / 2}
                y={cy + cellSize / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={pickTextColor(fill)}
                style={{
                  fontSize: Math.max(9, Math.min(13, cellSize * 0.35)),
                  fontFamily: 'inherit',
                  fontVariantNumeric: 'tabular-nums',
                  pointerEvents: 'none',
                }}
                data-tkx-heatmap-value=""
              >
                {cell.label ?? fmt(cell.value)}
              </text>
            )}
          </g>,
        );
      }
    }

    // ── Y axis labels (right-aligned, vertically centred per row) ────────
    const yLabelNodes = ys.map((label, row) => (
      <text
        key={`y-${row}`}
        x={Y_AXIS_W - 6}
        y={gridY + row * (cellSize + gap) + cellSize / 2}
        textAnchor="end"
        dominantBaseline="central"
        fill={theme.css.textMuted}
        style={{ fontSize: 11, fontFamily: 'inherit' }}
        data-tkx-heatmap-ylabel=""
      >
        {String(label)}
      </text>
    ));

    // ── X axis labels (along bottom; rotated 45° if long) ────────────────
    const xLabelY = gridY + gridH + 12;
    const xLabelNodes = xs.map((label, col) => {
      const anchorX = gridX + col * (cellSize + gap) + cellSize / 2;
      if (xLabelsRotate) {
        return (
          <text
            key={`x-${col}`}
            x={anchorX}
            y={xLabelY}
            textAnchor="end"
            dominantBaseline="hanging"
            fill={theme.css.textMuted}
            transform={`rotate(-45 ${anchorX} ${xLabelY})`}
            style={{ fontSize: 11, fontFamily: 'inherit' }}
            data-tkx-heatmap-xlabel=""
          >
            {String(label)}
          </text>
        );
      }
      return (
        <text
          key={`x-${col}`}
          x={anchorX}
          y={xLabelY}
          textAnchor="middle"
          dominantBaseline="hanging"
          fill={theme.css.textMuted}
          style={{ fontSize: 11, fontFamily: 'inherit' }}
          data-tkx-heatmap-xlabel=""
        >
          {String(label)}
        </text>
      );
    });

    // ── Legend ───────────────────────────────────────────────────────────
    // We render the color band as a series of small stops (32 segments) — no
    // SVG gradient dependency or defs juggling, just rects. Cheaper to test.
    const LEGEND_STOPS = 32;
    let legendNode: React.ReactNode = null;
    if (showLegend) {
      const stops = Array.from({ length: LEGEND_STOPS }, (_, i) => {
        const t = i / (LEGEND_STOPS - 1);
        const v = effectiveDomain[0] + t * (effectiveDomain[1] - effectiveDomain[0]);
        return colorForValue(v, effectiveDomain, colorScale, theme.primary);
      });

      if (legendOnRight) {
        const lx = gridX + gridW + LEGEND_PAD;
        const ly = gridY;
        const lh = gridH;
        const segH = lh / LEGEND_STOPS;
        legendNode = (
          <g data-tkx-heatmap-legend="right">
            {stops.map((c, i) => (
              <rect
                key={i}
                x={lx}
                // Top of legend = high value, so reverse the index when stacking.
                y={ly + (LEGEND_STOPS - 1 - i) * segH}
                width={LEGEND_THICK}
                height={segH + 0.5}
                fill={c}
              />
            ))}
            <text
              x={lx + LEGEND_THICK + 4}
              y={ly}
              dominantBaseline="hanging"
              fill={theme.css.textMuted}
              style={{ fontSize: 10, fontFamily: 'inherit' }}
              data-tkx-heatmap-legend-max=""
            >
              {maxLabel}
            </text>
            <text
              x={lx + LEGEND_THICK + 4}
              y={ly + lh}
              dominantBaseline="auto"
              fill={theme.css.textMuted}
              style={{ fontSize: 10, fontFamily: 'inherit' }}
              data-tkx-heatmap-legend-min=""
            >
              {minLabel}
            </text>
          </g>
        );
      } else if (legendOnBottom) {
        const lx = gridX;
        const ly = gridY + gridH + X_AXIS_H + LEGEND_PAD;
        const lw = gridW;
        const segW = lw / LEGEND_STOPS;
        legendNode = (
          <g data-tkx-heatmap-legend="bottom">
            {stops.map((c, i) => (
              <rect
                key={i}
                x={lx + i * segW}
                y={ly}
                width={segW + 0.5}
                height={LEGEND_THICK}
                fill={c}
              />
            ))}
            <text
              x={lx}
              y={ly + LEGEND_THICK + 11}
              textAnchor="start"
              fill={theme.css.textMuted}
              style={{ fontSize: 10, fontFamily: 'inherit' }}
              data-tkx-heatmap-legend-min=""
            >
              {minLabel}
            </text>
            <text
              x={lx + lw}
              y={ly + LEGEND_THICK + 11}
              textAnchor="end"
              fill={theme.css.textMuted}
              style={{ fontSize: 10, fontFamily: 'inherit' }}
              data-tkx-heatmap-legend-max=""
            >
              {maxLabel}
            </text>
          </g>
        );
      }
    }

    return (
      <div
        ref={ref}
        className={cx(tkx('inline-block'), className)}
        style={style}
        data-tkx-heatmap=""
        {...rest}
      >
        <svg
          role="img"
          aria-label={finalAriaLabel}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <g data-tkx-heatmap-ylabels="">{yLabelNodes}</g>
          <g data-tkx-heatmap-cells="">{cellNodes}</g>
          <g data-tkx-heatmap-xlabels="">{xLabelNodes}</g>
          {legendNode}
        </svg>
      </div>
    );
  },
);

TkxHeatmap.displayName = 'TkxHeatmap';
