'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '../themes';
import { getDefaultColors, tooltipStyle, DEFAULT_MARGIN, type ChartMargin } from './shared';

export interface TkxAreaChartSeries {
  key: string;
  label?: string;
  color?: string;
  /** Fill opacity. Default: 0.2 */
  fillOpacity?: number;
  /** Whether to stack this series. Default: false */
  stacked?: boolean;
}

export interface TkxAreaChartProps {
  data: Record<string, any>[];
  series: TkxAreaChartSeries[];
  xKey: string;
  height?: number;
  margin?: ChartMargin;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  /** Smooth curves. Default: true */
  smooth?: boolean;
  xTickFormatter?: (value: any) => string;
  yTickFormatter?: (value: any) => string;
  yDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  /** aria-label for the chart container */
  ariaLabel?: string;
}

export function TkxAreaChart({
  data,
  series,
  xKey,
  height = 300,
  margin = DEFAULT_MARGIN,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  smooth = true,
  xTickFormatter,
  yTickFormatter,
  yDomain,
  ariaLabel = 'Area chart',
}: TkxAreaChartProps) {
  const theme = useTheme();
  const colors = getDefaultColors(theme);
  const tt = tooltipStyle(theme);

  const tickStyle = { fill: theme.css.textMuted, fontSize: 12 };

  return (
    <div role="img" aria-label={ariaLabel} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={margin}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={theme.css.border} vertical={false} />
          )}
          <XAxis
            dataKey={xKey}
            tick={tickStyle}
            axisLine={{ stroke: theme.css.border }}
            tickLine={false}
            tickFormatter={xTickFormatter}
          />
          <YAxis
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={yTickFormatter}
            domain={yDomain}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={tt.contentStyle}
              labelStyle={tt.labelStyle}
              itemStyle={tt.itemStyle}
              cursor={tt.cursor}
            />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: 13, color: theme.css.textMuted, paddingTop: 8 }}
            />
          )}
          {series.map((s, i) => {
            const color = s.color ?? colors[i % colors.length];
            return (
              <Area
                key={s.key}
                type={smooth ? 'monotone' : 'linear'}
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={color}
                strokeWidth={2}
                fill={color}
                fillOpacity={s.fillOpacity ?? 0.2}
                stackId={s.stacked ? 'stack' : undefined}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}