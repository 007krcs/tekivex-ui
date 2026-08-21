'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '../themes';
import { useReducedMotion } from '../hooks';
import { getDefaultColors, tooltipStyle } from './shared';

export interface TkxDonutChartSlice {
  name: string;
  value: number;
  color?: string;
}

export interface TkxDonutChartProps {
  data: TkxDonutChartSlice[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  /** Center label — large text (e.g. total value) */
  centerLabel?: string;
  /** Center sublabel — small text below centerLabel */
  centerSublabel?: string;
  /** Inner radius as number or percentage string. Default: '55%' */
  innerRadius?: number | string;
  /** Outer radius as number or percentage string. Default: '75%' */
  outerRadius?: number | string;
  startAngle?: number;
  ariaLabel?: string;
}

function CenterLabel({
  cx, cy, label, sublabel, theme,
}: {
  cx: number; cy: number;
  label?: string; sublabel?: string;
  theme: any;
}) {
  if (!label && !sublabel) return null;
  return (
    <>
      {label && (
        <text x={cx} y={cy - (sublabel ? 8 : 0)} textAnchor="middle" dominantBaseline="middle"
          fill={theme.css.text} fontSize={22} fontWeight={700} fontFamily="inherit">
          {label}
        </text>
      )}
      {sublabel && (
        <text x={cx} y={cy + (label ? 18 : 0)} textAnchor="middle" dominantBaseline="middle"
          fill={theme.css.textMuted} fontSize={13} fontFamily="inherit">
          {sublabel}
        </text>
      )}
    </>
  );
}

export function TkxDonutChart({
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
  centerLabel,
  centerSublabel,
  innerRadius = '55%',
  outerRadius = '75%',
  startAngle = 90,
  ariaLabel = 'Donut chart',
}: TkxDonutChartProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const colors = getDefaultColors(theme);
  const tt = tooltipStyle(theme);
  // Force ResponsiveContainer to re-measure after the parent layout settles.
  // When reduced motion is preferred, skip the animation and mount immediately.
  const [mounted, setMounted] = useState(reduced);
  useEffect(() => {
    if (reduced) { setMounted(true); return; }
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{ width: '100%', minWidth: 240, height, position: 'relative' }}
    >
      {mounted && (
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <PieChart>
          {showTooltip && (
            <Tooltip
              contentStyle={tt.contentStyle}
              labelStyle={tt.labelStyle}
              itemStyle={tt.itemStyle}
            />
          )}
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: 13, color: theme.css.textMuted }} />
          )}
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={startAngle - 360}
            strokeWidth={3}
            stroke={theme.css.bg}
            label={false}
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color ?? colors[i % colors.length]} />
            ))}
            {/* Center text via customized label — recharts passes cx/cy to label */}
          </Pie>
          {/* SVG center label rendered as a separate layer */}
          {(centerLabel || centerSublabel) && (
            <text>
              {/* This renders nothing — actual center text needs PieChart customization */}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
      )}
      {/* Overlay center label using absolute positioning */}
      {(centerLabel || centerSublabel) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            marginTop: showLegend ? -24 : 0,
          }}
        >
          {centerLabel && (
            <span style={{ fontSize: 22, fontWeight: 700, color: theme.css.text, lineHeight: 1 }}>
              {centerLabel}
            </span>
          )}
          {centerSublabel && (
            <span style={{ fontSize: 13, color: theme.css.textMuted, marginTop: 4 }}>
              {centerSublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}