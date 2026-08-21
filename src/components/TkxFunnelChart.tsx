'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxFunnelChart — own-SVG conversion funnel (zero deps)
//
// Sibling to TkxSparkline / TkxGauge / TkxHeatmap (v3.21 chart primitives).
// Stages are rendered as trapezoids whose width tapers from one stage's
// bottom to the next stage's top, encoding the value as horizontal extent.
// Drop-off percentages render between stages (e.g. "−23%") so the viewer
// instantly sees where the funnel leaks.
//
// Two orientations:
//   vertical   — trapezoids stack top to bottom (typical sales funnel)
//   horizontal — trapezoids stack left to right (timeline-style funnel)
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef, type HTMLAttributes } from 'react';
import { useTheme } from '../themes';
import { cx, tkx } from '../engine/tkx';
import { relativeLuminance } from '../engine/wcag';

export interface TkxFunnelStage {
  label: string;
  value: number;
  /** Per-stage color override; otherwise the cycle from `colors` is used. */
  color?: string;
}

export interface TkxFunnelChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> {
  /** Stages, sorted top-to-bottom (largest first by convention). */
  data: TkxFunnelStage[];
  width?: number;
  height?: number;
  orientation?: 'vertical' | 'horizontal';
  /** Color cycle when stages don't define `color`. */
  colors?: string[];
  /** Show value text next to / inside each stage. Default true. */
  showValues?: boolean;
  /** Show drop-off % between stages. Default true. */
  showPercentages?: boolean;
  formatValue?: (v: number) => string;
  /** Gap in px between stages. Default 4. */
  gap?: number;
  ariaLabel?: string;
  onStageClick?: (stage: TkxFunnelStage, index: number) => void;
  className?: string;
}

// Default brand-leaning cycle. Picked to keep adjacent stages visually distinct.
const DEFAULT_COLORS = ['#00f5d4', '#3a86ff', '#7b2ff7', '#f72585', '#ffbe0b', '#06d6a0'];

/** Black or white text, whichever has more contrast against the stage fill. */
function pickTextColor(bgHex: string): string {
  const lum = relativeLuminance(bgHex);
  return lum > 0.179 ? '#000000' : '#ffffff';
}

export const TkxFunnelChart = forwardRef<HTMLDivElement, TkxFunnelChartProps>(
  (
    {
      data,
      width = 400,
      height = 300,
      orientation = 'vertical',
      colors,
      showValues = true,
      showPercentages = true,
      formatValue,
      gap = 4,
      ariaLabel,
      onStageClick,
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

    // ── Empty state ────────────────────────────────────────────────────────
    if (safeData.length === 0) {
      const label = ariaLabel ?? 'Funnel chart with no stages';
      return (
        <div
          ref={ref}
          role="img"
          aria-label={label}
          className={cx(tkx('inline-block'), className)}
          style={style}
          data-tkx-funnel-empty=""
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

    const firstValue = Math.max(safeData[0].value, 0.0001);
    const lastValue = safeData[safeData.length - 1].value;
    const totalDrop = firstValue > 0 ? Math.round(((firstValue - lastValue) / firstValue) * 100) : 0;

    // Compute the normalised width fraction for each stage (0..1). Clamped to
    // a tiny minimum so zero / negative stages don't disappear entirely.
    const MIN_FRAC = 0.04;
    const fracs = safeData.map((s) => Math.max(MIN_FRAC, Math.min(1, s.value / firstValue)));

    const isVertical = orientation === 'vertical';
    const finalAriaLabel =
      ariaLabel ??
      (safeData.length === 1
        ? `Funnel chart with 1 stage, value ${fmt(safeData[0].value)}`
        : `Funnel chart with ${safeData.length} stages, top value ${fmt(safeData[0].value)}, bottom value ${fmt(lastValue)}, total drop-off ${totalDrop}%`);

    // Reserve space for labels along the long axis. Vertical → labels to right.
    const LABEL_AREA = 110;
    const PCT_AREA = showPercentages && safeData.length > 1 ? 28 : 0;

    // Compute per-stage geometry along the main axis.
    const stageNodes: React.ReactNode[] = [];
    const labelNodes: React.ReactNode[] = [];
    const pctNodes: React.ReactNode[] = [];

    if (isVertical) {
      const trapezoidArea = width - LABEL_AREA;
      const totalGap = gap * Math.max(0, safeData.length - 1);
      const stageH = (height - totalGap) / safeData.length;
      const centerX = trapezoidArea / 2;

      safeData.forEach((stage, i) => {
        const topFrac = i === 0 ? 1 : fracs[i - 1];
        const botFrac = fracs[i];
        const topHalf = (topFrac * trapezoidArea) / 2;
        const botHalf = (botFrac * trapezoidArea) / 2;
        const yTop = i * (stageH + gap);
        const yBot = yTop + stageH;

        const fill = stage.color ?? palette[i % palette.length];

        // Single-stage case → degenerate to a rectangle (top width == bot width).
        const isOnly = safeData.length === 1;
        const tl = isOnly ? centerX - botHalf : centerX - topHalf;
        const tr = isOnly ? centerX + botHalf : centerX + topHalf;
        const bl = centerX - botHalf;
        const br = centerX + botHalf;

        const d = `M${tl.toFixed(2)},${yTop.toFixed(2)} L${tr.toFixed(2)},${yTop.toFixed(2)} L${br.toFixed(2)},${yBot.toFixed(2)} L${bl.toFixed(2)},${yBot.toFixed(2)} Z`;

        const clickable = !!onStageClick;
        const handleClick = clickable ? () => onStageClick!(stage, i) : undefined;
        const textColor = pickTextColor(fill);

        stageNodes.push(
          <g
            key={`stage-${i}`}
            data-tkx-funnel-stage=""
            data-index={i}
            onClick={handleClick}
            style={{ cursor: clickable ? 'pointer' : 'default' }}
          >
            <path d={d} fill={fill} data-tkx-funnel-shape="">
              <title>{`${stage.label}: ${fmt(stage.value)}`}</title>
            </path>
            {showValues && (
              <text
                x={centerX}
                y={(yTop + yBot) / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={textColor}
                style={{
                  fontSize: 12,
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  pointerEvents: 'none',
                }}
                data-tkx-funnel-value=""
              >
                {fmt(stage.value)}
              </text>
            )}
          </g>,
        );

        labelNodes.push(
          <text
            key={`label-${i}`}
            x={trapezoidArea + 8}
            y={(yTop + yBot) / 2}
            textAnchor="start"
            dominantBaseline="central"
            fill={theme.css.text}
            style={{ fontSize: 12, fontFamily: 'inherit' }}
            data-tkx-funnel-label=""
          >
            {stage.label}
          </text>,
        );

        // Drop-off % between this stage and the next.
        if (showPercentages && i < safeData.length - 1) {
          const next = safeData[i + 1];
          const drop = stage.value > 0
            ? Math.round(((stage.value - next.value) / stage.value) * 100)
            : 0;
          pctNodes.push(
            <text
              key={`pct-${i}`}
              x={trapezoidArea + 8}
              y={yBot + gap / 2}
              textAnchor="start"
              dominantBaseline="central"
              fill={theme.css.textMuted}
              style={{ fontSize: 10, fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }}
              data-tkx-funnel-pct=""
            >
              {drop >= 0 ? `−${drop}%` : `+${Math.abs(drop)}%`}
            </text>,
          );
        }
      });
    } else {
      // ── Horizontal: rotate the same logic 90° clockwise ───────────────────
      const trapezoidArea = height - LABEL_AREA;
      const totalGap = gap * Math.max(0, safeData.length - 1);
      const stageW = (width - totalGap) / safeData.length;
      const centerY = trapezoidArea / 2;

      safeData.forEach((stage, i) => {
        const leftFrac = i === 0 ? 1 : fracs[i - 1];
        const rightFrac = fracs[i];
        const leftHalf = (leftFrac * trapezoidArea) / 2;
        const rightHalf = (rightFrac * trapezoidArea) / 2;
        const xLeft = i * (stageW + gap);
        const xRight = xLeft + stageW;

        const fill = stage.color ?? palette[i % palette.length];

        const isOnly = safeData.length === 1;
        const tl = isOnly ? centerY - rightHalf : centerY - leftHalf;
        const bl = isOnly ? centerY + rightHalf : centerY + leftHalf;
        const tr = centerY - rightHalf;
        const br = centerY + rightHalf;

        const d = `M${xLeft.toFixed(2)},${tl.toFixed(2)} L${xLeft.toFixed(2)},${bl.toFixed(2)} L${xRight.toFixed(2)},${br.toFixed(2)} L${xRight.toFixed(2)},${tr.toFixed(2)} Z`;

        const clickable = !!onStageClick;
        const handleClick = clickable ? () => onStageClick!(stage, i) : undefined;
        const textColor = pickTextColor(fill);

        stageNodes.push(
          <g
            key={`stage-${i}`}
            data-tkx-funnel-stage=""
            data-index={i}
            onClick={handleClick}
            style={{ cursor: clickable ? 'pointer' : 'default' }}
          >
            <path d={d} fill={fill} data-tkx-funnel-shape="">
              <title>{`${stage.label}: ${fmt(stage.value)}`}</title>
            </path>
            {showValues && (
              <text
                x={(xLeft + xRight) / 2}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={textColor}
                style={{
                  fontSize: 12,
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  pointerEvents: 'none',
                }}
                data-tkx-funnel-value=""
              >
                {fmt(stage.value)}
              </text>
            )}
          </g>,
        );

        labelNodes.push(
          <text
            key={`label-${i}`}
            x={(xLeft + xRight) / 2}
            y={trapezoidArea + 16}
            textAnchor="middle"
            dominantBaseline="hanging"
            fill={theme.css.text}
            style={{ fontSize: 12, fontFamily: 'inherit' }}
            data-tkx-funnel-label=""
          >
            {stage.label}
          </text>,
        );

        if (showPercentages && i < safeData.length - 1) {
          const next = safeData[i + 1];
          const drop = stage.value > 0
            ? Math.round(((stage.value - next.value) / stage.value) * 100)
            : 0;
          pctNodes.push(
            <text
              key={`pct-${i}`}
              x={xRight + gap / 2}
              y={trapezoidArea + 36}
              textAnchor="middle"
              dominantBaseline="hanging"
              fill={theme.css.textMuted}
              style={{ fontSize: 10, fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }}
              data-tkx-funnel-pct=""
            >
              {drop >= 0 ? `−${drop}%` : `+${Math.abs(drop)}%`}
            </text>,
          );
        }
      });
    }

    return (
      <div
        ref={ref}
        className={cx(tkx('inline-block'), className)}
        style={style}
        data-tkx-funnel=""
        data-orientation={orientation}
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
          <g data-tkx-funnel-stages="">{stageNodes}</g>
          <g data-tkx-funnel-labels="">{labelNodes}</g>
          {showPercentages && safeData.length > 1 && (
            <g data-tkx-funnel-pcts="">{pctNodes}</g>
          )}
        </svg>
        {/* Silence unused warning for PCT_AREA, which documents the reserved
            space; current layout absorbs it into LABEL_AREA. */}
        <span hidden data-tkx-funnel-pct-area={PCT_AREA} />
      </div>
    );
  },
);

TkxFunnelChart.displayName = 'TkxFunnelChart';
