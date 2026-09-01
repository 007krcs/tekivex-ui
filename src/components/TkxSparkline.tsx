import { forwardRef, type HTMLAttributes } from 'react';
import { cssTokens } from '../themes/cssTokens';
import { cx, tkx } from '../engine/tkx';

export type SparklineVariant = 'line' | 'area' | 'bar';

export interface TkxSparklineProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  data: number[];
  variant?: SparklineVariant;
  width?: number;
  height?: number;
  color?: string;
  showPoints?: boolean;
  showLastPoint?: boolean;
  showValue?: boolean;
  smooth?: boolean;
  ariaLabel?: string;
}

const PAD = 2; // inset so strokes / points don't clip at the viewBox edge

interface Pt { x: number; y: number; }

function project(data: number[], width: number, height: number): Pt[] {
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const innerW = Math.max(0, width - PAD * 2);
  const innerH = Math.max(0, height - PAD * 2);

  if (data.length === 1) {
    return [{ x: PAD + innerW / 2, y: PAD + innerH / 2 }];
  }

  return data.map((v, i) => ({
    x: PAD + (i / (data.length - 1)) * innerW,
    y: PAD + innerH - ((v - min) / range) * innerH,
  }));
}

/**
 * Linear (`L`) path builder — straight segments through every point.
 */
function linearPath(pts: Pt[]): string {
  if (pts.length === 0) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

/**
 * Catmull-Rom -> cubic Bezier conversion. Produces a smooth curve that passes
 * through every input point. Uses the centripetal variant with tension 0.5.
 */
function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return linearPath(pts);
  const out: string[] = [`M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    out.push(
      `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`,
    );
  }
  return out.join(' ');
}

function describeTrend(data: number[]): 'up' | 'down' | 'flat' {
  if (data.length < 2) return 'flat';
  const first = data[0];
  const last = data[data.length - 1];
  if (last > first) return 'up';
  if (last < first) return 'down';
  return 'flat';
}

export const TkxSparkline = forwardRef<HTMLSpanElement, TkxSparklineProps>(
  (
    {
      data,
      variant = 'line',
      width = 120,
      height = 32,
      color,
      showPoints = false,
      showLastPoint = true,
      showValue = false,
      smooth = false,
      ariaLabel,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const stroke = color ?? cssTokens.primary;

    const isEmpty = !Array.isArray(data) || data.length === 0;
    const label =
      ariaLabel ??
      (isEmpty
        ? 'Sparkline showing no data'
        : `Sparkline showing ${data.length} value${data.length === 1 ? '' : 's'}, trending ${describeTrend(data)}`);

    if (isEmpty) {
      return (
        <span
          ref={ref}
          role="img"
          aria-label={label}
          className={cx(tkx('inline-flex items-center'), className)}
          style={style}
          {...rest}
        >
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            aria-hidden="true"
            data-tkx-sparkline-empty=""
          />
        </span>
      );
    }

    const pts = project(data, width, height);
    const last = pts[pts.length - 1];
    const lastValue = data[data.length - 1];

    let body: React.ReactNode = null;

    if (variant === 'bar') {
      const innerW = Math.max(0, width - PAD * 2);
      const slot = innerW / data.length;
      const barW = Math.max(1, slot * 0.7);
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;
      const innerH = Math.max(0, height - PAD * 2);
      body = (
        <g data-tkx-sparkline-variant="bar">
          {data.map((v, i) => {
            const h = ((v - min) / range) * innerH;
            const x = PAD + slot * i + (slot - barW) / 2;
            const y = PAD + innerH - h;
            return (
              <rect
                key={i}
                x={x.toFixed(2)}
                y={y.toFixed(2)}
                width={barW.toFixed(2)}
                height={Math.max(1, h).toFixed(2)}
                fill={stroke}
                rx={1}
              />
            );
          })}
        </g>
      );
    } else {
      const d = smooth ? smoothPath(pts) : linearPath(pts);

      const areaD = (() => {
        if (variant !== 'area' || pts.length === 0) return '';
        const baseY = (height - PAD).toFixed(2);
        return `${d} L${pts[pts.length - 1].x.toFixed(2)},${baseY} L${pts[0].x.toFixed(2)},${baseY} Z`;
      })();

      body = (
        <g data-tkx-sparkline-variant={variant}>
          {variant === 'area' && (
            <path d={areaD} fill={stroke} fillOpacity={0.18} stroke="none" />
          )}
          <path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {showPoints &&
            pts.map((p, i) => (
              <circle
                key={i}
                cx={p.x.toFixed(2)}
                cy={p.y.toFixed(2)}
                r={1.75}
                fill={stroke}
                data-tkx-sparkline-point=""
              />
            ))}
          {showLastPoint && !showPoints && last && (
            <circle
              cx={last.x.toFixed(2)}
              cy={last.y.toFixed(2)}
              r={2.25}
              fill={stroke}
              data-tkx-sparkline-last=""
            />
          )}
        </g>
      );
    }

    return (
      <span
        ref={ref}
        role="img"
        aria-label={label}
        className={cx(tkx('inline-flex items-center gap-2'), className)}
        style={style}
        {...rest}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
          style={{ display: 'block', overflow: 'visible' }}
        >
          {body}
        </svg>
        {showValue && (
          <span
            className={tkx('text-xs')}
            style={{ color: cssTokens.textMuted, fontVariantNumeric: 'tabular-nums' }}
            data-tkx-sparkline-value=""
          >
            {String(lastValue)}
          </span>
        )}
      </span>
    );
  },
);

TkxSparkline.displayName = 'TkxSparkline';
