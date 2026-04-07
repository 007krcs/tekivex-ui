import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createElement,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface TkxRealTimeChartProps {
  data: ChartDataPoint[];
  maxPoints?: number;
  height?: number;
  width?: number | string;
  color?: string;
  fill?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  showTooltip?: boolean;
  label?: string;
  unit?: string;
  animate?: boolean;
  yMin?: number;
  yMax?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function formatYLabel(val: number): string {
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
  if (Number.isInteger(val)) return String(val);
  return val.toFixed(2);
}

// ── TkxRealTimeChart ─────────────────────────────────────────────────────────

export function TkxRealTimeChart({
  data,
  maxPoints = 60,
  height = 200,
  width = '100%',
  color,
  fill = true,
  showGrid = true,
  showLabels = true,
  showTooltip = true,
  label,
  unit,
  animate = true,
  yMin,
  yMax,
}: TkxRealTimeChartProps) {
  const theme = useTheme();
  const lineColor = color ?? theme.primary;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: ChartDataPoint } | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const prevDataLenRef = useRef(data.length);

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    setContainerWidth(containerRef.current.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // Trim to maxPoints
  const points = useMemo(
    () => data.slice(-maxPoints),
    [data, maxPoints],
  );

  // Trigger animate key when new point arrives
  useEffect(() => {
    if (points.length > prevDataLenRef.current) {
      setAnimKey((k) => k + 1);
    }
    prevDataLenRef.current = points.length;
  }, [points.length]);

  const PADDING_LEFT = showLabels ? 48 : 12;
  const PADDING_RIGHT = 12;
  const PADDING_TOP = label ? 28 : 12;
  const PADDING_BOTTOM = 28;

  const chartW = Math.max(containerWidth - PADDING_LEFT - PADDING_RIGHT, 1);
  const chartH = Math.max(height - PADDING_TOP - PADDING_BOTTOM, 1);

  // Scales
  const rawMinY = points.length ? Math.min(...points.map((p) => p.value)) : 0;
  const rawMaxY = points.length ? Math.max(...points.map((p) => p.value)) : 1;
  const dataRange = rawMaxY - rawMinY || 1;
  const minY = yMin !== undefined ? yMin : rawMinY - dataRange * 0.1;
  const maxY = yMax !== undefined ? yMax : rawMaxY + dataRange * 0.1;
  const yRange = maxY - minY || 1;

  function toSvgX(i: number): number {
    if (points.length < 2) return chartW / 2;
    return (i / (points.length - 1)) * chartW;
  }

  function toSvgY(v: number): number {
    return chartH - ((v - minY) / yRange) * chartH;
  }

  // Paths
  const linePath = points.length >= 2
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(i).toFixed(2)},${toSvgY(p.value).toFixed(2)}`).join(' ')
    : '';

  const areaPath = linePath
    ? `${linePath} L${toSvgX(points.length - 1).toFixed(2)},${chartH} L${toSvgX(0).toFixed(2)},${chartH} Z`
    : '';

  // Grid lines
  const GRID_LINES = 4;
  const gridLines: number[] = [];
  for (let i = 0; i <= GRID_LINES; i++) {
    gridLines.push(i);
  }

  // Y labels
  const yLabels = gridLines.map((i) => {
    const v = minY + (i / GRID_LINES) * yRange;
    const y = toSvgY(v);
    return { y, text: formatYLabel(v) };
  });

  // X labels (last 4 timestamps)
  const xLabelCount = Math.min(4, points.length);
  const xLabelIndices = xLabelCount > 0
    ? Array.from({ length: xLabelCount }, (_, k) =>
        Math.round((k / Math.max(xLabelCount - 1, 1)) * (points.length - 1)),
      )
    : [];

  // Tooltip on mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!showTooltip || points.length === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left - PADDING_LEFT;
      // Find nearest point
      let nearest = 0;
      let nearestDist = Infinity;
      points.forEach((p, i) => {
        const dx = Math.abs(toSvgX(i) - mx);
        if (dx < nearestDist) { nearestDist = dx; nearest = i; }
      });
      const pt = points[nearest];
      if (!pt) return;
      const svgX = toSvgX(nearest) + PADDING_LEFT;
      const svgY = toSvgY(pt.value) + PADDING_TOP;
      setTooltip({ x: svgX, y: svgY, point: pt });
    },
    [points, showTooltip, PADDING_LEFT, PADDING_TOP],
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const svgW = containerWidth;
  const svgH = height;

  // Animate: clip rect that expands from right
  const animId = `tkx-chart-clip-${animKey}`;

  const wrapStyle: CSSProperties = {
    position: 'relative',
    width: typeof width === 'number' ? `${width}px` : width,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  return createElement(
    'div',
    { ref: containerRef, style: wrapStyle },
    createElement(
      'svg',
      {
        width: svgW,
        height: svgH,
        viewBox: `0 0 ${svgW} ${svgH}`,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        style: { display: 'block', userSelect: 'none' },
        'aria-label': label ? sanitizeString(label) : 'Real-time chart',
      },
      // Defs: clip for animation
      animate && points.length >= 2 && createElement(
        'defs',
        null,
        createElement(
          'clipPath',
          { id: animId },
          createElement('rect', {
            x: 0,
            y: 0,
            width: chartW,
            height: svgH,
          },
          createElement('animate', {
            attributeName: 'width',
            from: Math.max(0, chartW - chartW / Math.max(points.length - 1, 1)),
            to: chartW,
            dur: '0.3s',
            fill: 'freeze',
          }),
          ),
        ),
      ),

      // Chart title
      label && createElement(
        'text',
        {
          x: PADDING_LEFT,
          y: 18,
          fill: theme.textMuted,
          fontSize: 12,
          fontWeight: 500,
        },
        sanitizeString(label),
      ),

      // Grid lines
      showGrid && gridLines.map((i) => {
        const yPos = toSvgY(minY + (i / GRID_LINES) * yRange) + PADDING_TOP;
        return createElement('line', {
          key: `grid-${i}`,
          x1: PADDING_LEFT,
          y1: yPos,
          x2: PADDING_LEFT + chartW,
          y2: yPos,
          stroke: theme.border,
          strokeWidth: 1,
          strokeDasharray: '4 4',
        });
      }),

      // Y axis labels
      showLabels && yLabels.map((yl, i) => createElement(
        'text',
        {
          key: `yl-${i}`,
          x: PADDING_LEFT - 4,
          y: yl.y + PADDING_TOP + 4,
          fill: theme.textMuted,
          fontSize: 10,
          textAnchor: 'end',
        },
        yl.text,
      )),

      // Y axis unit
      unit && createElement(
        'text',
        { x: 4, y: PADDING_TOP + 10, fill: theme.textMuted, fontSize: 9 },
        sanitizeString(unit),
      ),

      // Area fill
      fill && areaPath && createElement('path', {
        d: areaPath,
        fill: `${lineColor}22`,
        clipPath: animate ? `url(#${animId})` : undefined,
        transform: `translate(${PADDING_LEFT}, ${PADDING_TOP})`,
      }),

      // Data line
      linePath && createElement('path', {
        d: linePath,
        fill: 'none',
        stroke: lineColor,
        strokeWidth: 2,
        strokeLinejoin: 'round',
        strokeLinecap: 'round',
        clipPath: animate ? `url(#${animId})` : undefined,
        transform: `translate(${PADDING_LEFT}, ${PADDING_TOP})`,
      }),

      // X axis labels
      xLabelIndices.map((idx) => {
        const pt = points[idx];
        if (!pt) return null;
        return createElement(
          'text',
          {
            key: `xl-${idx}`,
            x: PADDING_LEFT + toSvgX(idx),
            y: svgH - 8,
            fill: theme.textMuted,
            fontSize: 9,
            textAnchor: 'middle',
          },
          formatTime(pt.timestamp),
        );
      }),

      // Tooltip vertical line
      tooltip && createElement('line', {
        x1: tooltip.x,
        y1: PADDING_TOP,
        x2: tooltip.x,
        y2: PADDING_TOP + chartH,
        stroke: lineColor,
        strokeWidth: 1,
        strokeDasharray: '3 3',
        opacity: 0.6,
      }),

      // Tooltip dot
      tooltip && createElement('circle', {
        cx: tooltip.x,
        cy: tooltip.y,
        r: 4,
        fill: lineColor,
        stroke: theme.surface,
        strokeWidth: 2,
      }),

      // Tooltip box
      tooltip && (() => {
        const tx = Math.min(tooltip.x + 8, svgW - 100);
        const ty = Math.max(tooltip.y - 36, 4);
        const valText = `${formatYLabel(tooltip.point.value)}${unit ? unit : ''}`;
        const tsText = formatTime(tooltip.point.timestamp);
        return createElement(
          'g',
          null,
          createElement('rect', {
            x: tx - 4,
            y: ty - 2,
            width: 90,
            height: 34,
            rx: 4,
            fill: theme.surfaceAlt,
            stroke: theme.border,
            strokeWidth: 1,
          }),
          createElement('text', { x: tx, y: ty + 11, fill: theme.text, fontSize: 12, fontWeight: 700 }, valText),
          createElement('text', { x: tx, y: ty + 26, fill: theme.textMuted, fontSize: 10 }, tsText),
        );
      })(),
    ),
  );
}

// Satisfy import requirement
void tkx;
void sanitizeString;
