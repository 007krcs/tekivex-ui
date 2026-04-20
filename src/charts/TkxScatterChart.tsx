'use client';

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '../themes';
import { getDefaultColors, tooltipStyle, DEFAULT_MARGIN, type ChartMargin } from './shared';

export interface TkxScatterSeries {
  data: { x: number; y: number; z?: number; label?: string }[];
  name?: string;
  color?: string;
}

export interface TkxScatterChartProps {
  series: TkxScatterSeries[];
  height?: number;
  margin?: ChartMargin;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xLabel?: string;
  yLabel?: string;
  xTickFormatter?: (value: any) => string;
  yTickFormatter?: (value: any) => string;
  /** Z-axis range (bubble size). Default: [20, 400] */
  zRange?: [number, number];
  ariaLabel?: string;
}

export function TkxScatterChart({
  series,
  height = 300,
  margin = DEFAULT_MARGIN,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xTickFormatter,
  yTickFormatter,
  zRange = [20, 400],
  ariaLabel = 'Scatter chart',
}: TkxScatterChartProps) {
  const theme = useTheme();
  const colors = getDefaultColors(theme);
  const tt = tooltipStyle(theme);
  const tickStyle = { fill: theme.textMuted, fontSize: 12 };

  return (
    <div role="img" aria-label={ariaLabel} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={margin}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
          )}
          <XAxis
            type="number"
            dataKey="x"
            tick={tickStyle}
            axisLine={{ stroke: theme.border }}
            tickLine={false}
            tickFormatter={xTickFormatter}
          />
          <YAxis
            type="number"
            dataKey="y"
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={yTickFormatter}
          />
          <ZAxis type="number" dataKey="z" range={zRange} />
          {showTooltip && (
            <Tooltip
              contentStyle={tt.contentStyle}
              labelStyle={tt.labelStyle}
              itemStyle={tt.itemStyle}
              cursor={{ strokeDasharray: '3 3' }}
            />
          )}
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: 13, color: theme.textMuted, paddingTop: 8 }} />
          )}
          {series.map((s, i) => (
            <Scatter
              key={s.name ?? i}
              name={s.name}
              data={s.data}
              fill={s.color ?? colors[i % colors.length]}
              fillOpacity={0.8}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}