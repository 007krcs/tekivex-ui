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

export interface TkxPieChartSlice {
  name: string;
  value: number;
  color?: string;
}

export interface TkxPieChartProps {
  data: TkxPieChartSlice[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  /** Outer radius as a number (px) or percentage string. Default: '70%' */
  outerRadius?: number | string;
  /** Start angle in degrees. Default: 90 (12 o'clock) */
  startAngle?: number;
  ariaLabel?: string;
}

export function TkxPieChart({
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  outerRadius = '70%',
  startAngle = 90,
  ariaLabel = 'Pie chart',
}: TkxPieChartProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const colors = getDefaultColors(theme);
  const tt = tooltipStyle(theme);
  // Force ResponsiveContainer to re-measure after the parent layout settles.
  // Without this, recharts can compute 0x0 on first paint inside CSS grids/flex
  // and the chart silently disappears.
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
            <Legend wrapperStyle={{ fontSize: 13, color: theme.textMuted }} />
          )}
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={startAngle - 360}
            label={showLabels ? ({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)` : undefined}
            labelLine={showLabels}
            strokeWidth={2}
            stroke={theme.bg}
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={entry.color ?? colors[i % colors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}