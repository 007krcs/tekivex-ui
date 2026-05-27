'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxTreemap — own-SVG squarified treemap (zero deps)
//
// Sibling to TkxSparkline / TkxGauge / TkxHeatmap / TkxFunnelChart (v3.21).
// Rectangles are sized proportionally to value using the squarified algorithm
// (Bruls / Huijsen / van Wijk, 1999) so each rect is as close to square as
// the surrounding row allows.
//
// Supports one level of nesting: if a node has `children`, those children
// are laid out as a sub-treemap inside the parent rectangle. Deeper trees
// recurse the same way.
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef, type HTMLAttributes } from 'react';
import { useTheme } from '../themes';
import { cx, tkx } from '../engine/tkx';
import { relativeLuminance } from '../engine/wcag';

export interface TkxTreemapNode {
  label: string;
  value: number;
  color?: string;
  children?: TkxTreemapNode[];
}

export interface TkxTreemapProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> {
  data: TkxTreemapNode[];
  width?: number;
  height?: number;
  /** Color cycle used when nodes don't specify a `color`. */
  colors?: string[];
  /** Render text labels inside rectangles. Default true. */
  showLabels?: boolean;
  /** Render value text below the label. Default false. */
  showValues?: boolean;
  /** Skip labels when a rect is smaller than this area in px². Default 80. */
  minLabelSize?: number;
  formatValue?: (v: number) => string;
  ariaLabel?: string;
  onNodeClick?: (node: TkxTreemapNode, path: number[]) => void;
  className?: string;
}

const DEFAULT_COLORS = ['#00f5d4', '#3a86ff', '#7b2ff7', '#f72585', '#ffbe0b', '#06d6a0', '#ef476f', '#118ab2'];

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Sized {
  node: TkxTreemapNode;
  value: number;
  /** Original index in the *input* array (before sort). Used for color cycle stability. */
  origIndex: number;
}

interface Placed extends Rect {
  node: TkxTreemapNode;
  origIndex: number;
  path: number[];
}

/** Black or white text — whichever has more contrast against the rectangle fill. */
function pickTextColor(bgHex: string): string {
  const lum = relativeLuminance(bgHex);
  return lum > 0.179 ? '#000000' : '#ffffff';
}

// ── Squarified treemap algorithm ────────────────────────────────────────────
//
// Reference: Bruls / Huijsen / van Wijk, "Squarified Treemaps", 1999.
//
// The algorithm processes nodes in descending size order, accumulating them
// into a "row" laid out along the SHORT side of the remaining rectangle.
// We keep adding to the row while the worst aspect ratio improves; the moment
// adding another node would *worsen* the worst aspect ratio in the row, we
// finalise the row and recurse on the remaining space.

/**
 * worst() — for a row of areas, given the short-side length `w`, returns the
 * worst aspect ratio of any rect in that row. Lower is better (1 = square).
 */
function worst(row: number[], w: number): number {
  if (row.length === 0) return Infinity;
  const sum = row.reduce((s, v) => s + v, 0);
  const sumSq = sum * sum;
  const wSq = w * w;
  let r = -Infinity;
  let min = Infinity;
  let max = -Infinity;
  for (const v of row) {
    if (v > max) max = v;
    if (v < min) min = v;
  }
  if (sumSq === 0) return Infinity;
  const a = (wSq * max) / sumSq;
  const b = sumSq / (wSq * min);
  r = Math.max(a, b);
  return r;
}

/**
 * Lay out a single row of nodes inside the rectangle, returning the placed
 * rects plus the leftover rectangle for the rest of the items.
 */
function layoutRow(
  row: Sized[],
  rect: Rect,
  parentPath: number[],
): { placed: Placed[]; remaining: Rect } {
  const placed: Placed[] = [];
  const horizontal = rect.w >= rect.h; // long side
  const shortSide = Math.min(rect.w, rect.h);
  const sum = row.reduce((s, n) => s + n.value, 0);
  // Long-side extent consumed by this row.
  const rowExtent = shortSide === 0 ? 0 : sum / shortSide;

  if (horizontal) {
    // Row stacked along Y (height = shortSide), placed at x = rect.x.
    let yOff = rect.y;
    for (const n of row) {
      const cellH = sum === 0 ? rect.h / row.length : (n.value / sum) * rect.h;
      placed.push({
        x: rect.x,
        y: yOff,
        w: rowExtent,
        h: cellH,
        node: n.node,
        origIndex: n.origIndex,
        path: [...parentPath, n.origIndex],
      });
      yOff += cellH;
    }
    return {
      placed,
      remaining: { x: rect.x + rowExtent, y: rect.y, w: rect.w - rowExtent, h: rect.h },
    };
  }

  // Row stacked along X (width = shortSide), placed at y = rect.y.
  let xOff = rect.x;
  for (const n of row) {
    const cellW = sum === 0 ? rect.w / row.length : (n.value / sum) * rect.w;
    placed.push({
      x: xOff,
      y: rect.y,
      w: cellW,
      h: rowExtent,
      node: n.node,
      origIndex: n.origIndex,
      path: [...parentPath, n.origIndex],
    });
    xOff += cellW;
  }
  return {
    placed,
    remaining: { x: rect.x, y: rect.y + rowExtent, w: rect.w, h: rect.h - rowExtent },
  };
}

/**
 * Squarify a list of sized items into a rect. Items must already be sorted
 * descending by value and scaled so their total equals rect.w × rect.h.
 */
function squarify(items: Sized[], rect: Rect, parentPath: number[]): Placed[] {
  const out: Placed[] = [];
  let remaining = { ...rect };
  let queue = [...items];

  while (queue.length > 0) {
    const shortSide = Math.min(remaining.w, remaining.h);
    if (shortSide <= 0) break;

    // Greedy row build: add items while worst() improves.
    const row: Sized[] = [];
    const rowValues: number[] = [];
    let i = 0;
    while (i < queue.length) {
      const candidate = queue[i];
      const next = [...rowValues, candidate.value];
      const before = row.length === 0 ? Infinity : worst(rowValues, shortSide);
      const after = worst(next, shortSide);
      if (row.length === 0 || after <= before) {
        row.push(candidate);
        rowValues.push(candidate.value);
        i += 1;
      } else {
        break;
      }
    }

    if (row.length === 0) {
      // Defensive: shouldn't happen — we always accept at least one item.
      break;
    }

    const { placed, remaining: rest } = layoutRow(row, remaining, parentPath);
    out.push(...placed);
    queue = queue.slice(row.length);
    remaining = rest;
  }

  return out;
}

/**
 * Lay out a flat list of nodes inside `rect` using squarified treemap.
 * Returns placed rects in input-order (origIndex preserved).
 */
function layoutLevel(nodes: TkxTreemapNode[], rect: Rect, parentPath: number[]): Placed[] {
  const safe = nodes.map((n, i): Sized => ({
    node: n,
    value: Math.max(0, n.value),
    origIndex: i,
  })).filter((s) => s.value > 0);

  if (safe.length === 0) return [];
  if (safe.length === 1) {
    return [{
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      node: safe[0].node,
      origIndex: safe[0].origIndex,
      path: [...parentPath, safe[0].origIndex],
    }];
  }

  // Sort descending by value for the squarified algorithm.
  const sorted = [...safe].sort((a, b) => b.value - a.value);

  // Scale values so their total equals the rectangle area.
  const total = sorted.reduce((s, n) => s + n.value, 0);
  const area = rect.w * rect.h;
  const scale = total === 0 ? 0 : area / total;
  const scaled = sorted.map((s) => ({ ...s, value: s.value * scale }));

  return squarify(scaled, rect, parentPath);
}

export const TkxTreemap = forwardRef<HTMLDivElement, TkxTreemapProps>(
  (
    {
      data,
      width = 600,
      height = 400,
      colors,
      showLabels = true,
      showValues = false,
      minLabelSize = 80,
      formatValue,
      ariaLabel,
      onNodeClick,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();
    const safeData = Array.isArray(data) ? data : [];
    const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
    const fmt = formatValue ?? ((v: number) => String(v));

    if (safeData.length === 0) {
      const label = ariaLabel ?? 'Treemap with no data';
      return (
        <div
          ref={ref}
          role="img"
          aria-label={label}
          className={cx(tkx('inline-block'), className)}
          style={style}
          data-tkx-treemap-empty=""
          {...rest}
        >
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            aria-hidden="true"
          />
        </div>
      );
    }

    const totalValue = safeData.reduce((s, n) => s + Math.max(0, n.value), 0);
    const finalAriaLabel =
      ariaLabel ??
      `Treemap with ${safeData.length} node${safeData.length === 1 ? '' : 's'}, total value ${fmt(totalValue)}`;

    // ── Recursive render ──────────────────────────────────────────────────
    // For each level we run `layoutLevel`. If a placed node has children,
    // we recurse into its rect.

    const renderLevel = (
      nodes: TkxTreemapNode[],
      rect: Rect,
      parentPath: number[],
      depth: number,
    ): React.ReactNode[] => {
      const placed = layoutLevel(nodes, rect, parentPath);
      const out: React.ReactNode[] = [];

      for (const p of placed) {
        const fill = p.node.color ?? palette[p.origIndex % palette.length];
        const area = p.w * p.h;
        const showThisLabel = showLabels && area >= minLabelSize;
        const labelText = p.node.label;
        const textColor = pickTextColor(fill);
        const clickable = !!onNodeClick;
        const handleClick = clickable ? (e: React.MouseEvent) => {
          e.stopPropagation();
          onNodeClick!(p.node, p.path);
        } : undefined;

        const hasChildren = Array.isArray(p.node.children) && p.node.children.length > 0;
        // Inset children slightly so the parent border is visible.
        const childRect: Rect = hasChildren
          ? {
              x: p.x + 1,
              // Leave a bit of room for the parent label at the top when nesting.
              y: p.y + (showThisLabel ? 16 : 1),
              w: Math.max(0, p.w - 2),
              h: Math.max(0, p.h - (showThisLabel ? 17 : 2)),
            }
          : p;

        out.push(
          <g
            key={`d${depth}-${p.path.join('-')}`}
            data-tkx-treemap-node=""
            data-depth={depth}
            data-label={labelText}
            onClick={handleClick}
            style={{ cursor: clickable ? 'pointer' : 'default' }}
          >
            <rect
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              fill={fill}
              stroke={theme.bg}
              strokeWidth={1}
              data-tkx-treemap-rect=""
            >
              <title>{`${labelText}: ${fmt(p.node.value)}`}</title>
            </rect>
            {showThisLabel && (
              <text
                x={p.x + 4}
                y={p.y + (hasChildren ? 12 : 14)}
                fill={textColor}
                style={{
                  fontSize: 11,
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  pointerEvents: 'none',
                }}
                data-tkx-treemap-label=""
              >
                {labelText}
              </text>
            )}
            {showThisLabel && showValues && !hasChildren && area >= minLabelSize * 1.5 && (
              <text
                x={p.x + 4}
                y={p.y + 26}
                fill={textColor}
                style={{
                  fontSize: 10,
                  fontFamily: 'inherit',
                  fontVariantNumeric: 'tabular-nums',
                  opacity: 0.85,
                  pointerEvents: 'none',
                }}
                data-tkx-treemap-value=""
              >
                {fmt(p.node.value)}
              </text>
            )}
            {hasChildren && childRect.w > 4 && childRect.h > 4 && (
              <g data-tkx-treemap-children="">
                {renderLevel(p.node.children!, childRect, p.path, depth + 1)}
              </g>
            )}
          </g>,
        );
      }

      return out;
    };

    const nodes = renderLevel(safeData, { x: 0, y: 0, w: width, h: height }, [], 0);

    return (
      <div
        ref={ref}
        className={cx(tkx('inline-block'), className)}
        style={style}
        data-tkx-treemap=""
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
          {nodes}
        </svg>
      </div>
    );
  },
);

TkxTreemap.displayName = 'TkxTreemap';
