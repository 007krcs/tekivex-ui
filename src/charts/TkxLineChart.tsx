import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useTheme } from '../themes';
import { getDefaultColors, tooltipStyle, DEFAULT_MARGIN, type ChartMargin } from './shared';

export interface TkxLineChartSeries {
  key: string;
  label?: string;
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
  dot?: boolean;
}

export interface TkxReferenceLineConfig {
  y?: number;
  x?: number | string;
  label?: string;
  color?: string;
  dashed?: boolean;
}

export interface TkxLineChartProps {
  data: Record<string, any>[];
  series: TkxLineChartSeries[];
  xKey: string;
  height?: number;
  margin?: ChartMargin;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  smooth?: boolean;
  referenceLines?: TkxReferenceLineConfig[];
  xTickFormatter?: (value: any) => string;
  yTickFormatter?: (value: any) => string;
  yDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  connectNulls?: boolean;
  ariaLabel?: string;
}

export function TkxLineChart({
  data,
  series,
  xKey,
  height = 300,
  margin = DEFAULT_MARGIN,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  smooth = true,
  referenceLines = [],
  xTickFormatter,
  yTickFormatter,
  yDomain,
  connectNulls = false,
  ariaLabel = 'Line chart',
}: TkxLineChartProps) {
  const theme = useTheme();
  const colors = getDefaultColors(theme);
  const tt = tooltipStyle(theme);
  const tickStyle = { fill: theme.textMuted, fontSize: 12 };

  return (
    <div role="img" aria-label={ariaLabel} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={margin}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
          )}
          <XAxis
            dataKey={xKey}
            tick={tickStyle}
            axisLine={{ stroke: theme.border }}
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
              cursor={{ stroke: theme.border, strokeWidth: 1 }}
            />
          )}
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: 13, color: theme.textMuted, paddingTop: 8 }} />
          )}
          {referenceLines.map((rl, i) => (
            <ReferenceLine
              key={i}
              y={rl.y}
              x={rl.x}
              label={rl.label ? { value: rl.label, fill: theme.textMuted, fontSize: 11 } : undefined}
              stroke={rl.color ?? theme.border}
              strokeDasharray={rl.dashed ? '4 4' : undefined}
            />
          ))}
          {series.map((s, i) => {
            const color = s.color ?? colors[i % colors.length];
            return (
              <Line
                key={s.key}
                type={smooth ? 'monotone' : 'linear'}
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={color}
                strokeWidth={s.strokeWidth ?? 2}
                strokeDasharray={s.dashed ? '6 3' : undefined}
                dot={s.dot ?? false}
                activeDot={{ r: 5, strokeWidth: 0, fill: color }}
                connectNulls={connectNulls}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
