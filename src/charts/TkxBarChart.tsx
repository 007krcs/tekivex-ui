import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { useTheme } from '../themes';
import { getDefaultColors, tooltipStyle, DEFAULT_MARGIN, type ChartMargin } from './shared';

export interface TkxBarChartSeries {
  key: string;
  label?: string;
  color?: string;
  /** Stack ID — bars with the same stackId are stacked. */
  stackId?: string;
  radius?: number | [number, number, number, number];
}

export interface TkxBarChartProps {
  data: Record<string, any>[];
  series: TkxBarChartSeries[];
  xKey: string;
  height?: number;
  margin?: ChartMargin;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  layout?: 'vertical' | 'horizontal';
  barSize?: number;
  /** Use gradient fill per series. Default: false */
  gradient?: boolean;
  xTickFormatter?: (value: any) => string;
  yTickFormatter?: (value: any) => string;
  ariaLabel?: string;
}

export function TkxBarChart({
  data,
  series,
  xKey,
  height = 300,
  margin = DEFAULT_MARGIN,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  layout = 'horizontal',
  barSize,
  xTickFormatter,
  yTickFormatter,
  ariaLabel = 'Bar chart',
}: TkxBarChartProps) {
  const theme = useTheme();
  const colors = getDefaultColors(theme);
  const tt = tooltipStyle(theme);
  const tickStyle = { fill: theme.textMuted, fontSize: 12 };
  const isVertical = layout === 'vertical';

  return (
    <div role="img" aria-label={ariaLabel} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={margin} layout={layout}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.border}
              vertical={isVertical}
              horizontal={!isVertical}
            />
          )}
          {isVertical ? (
            <>
              <YAxis dataKey={xKey} type="category" tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={xTickFormatter} width={100} />
              <XAxis type="number" tick={tickStyle} axisLine={{ stroke: theme.border }} tickLine={false} tickFormatter={yTickFormatter} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={tickStyle} axisLine={{ stroke: theme.border }} tickLine={false} tickFormatter={xTickFormatter} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={yTickFormatter} />
            </>
          )}
          {showTooltip && (
            <Tooltip
              contentStyle={tt.contentStyle}
              labelStyle={tt.labelStyle}
              itemStyle={tt.itemStyle}
              cursor={{ fill: `${theme.surfaceAlt}` }}
            />
          )}
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: 13, color: theme.textMuted, paddingTop: 8 }} />
          )}
          {series.map((s, i) => {
            const color = s.color ?? colors[i % colors.length];
            return (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label ?? s.key}
                fill={color}
                stackId={s.stackId}
                maxBarSize={barSize ?? 40}
                radius={s.radius ?? [4, 4, 0, 0]}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
