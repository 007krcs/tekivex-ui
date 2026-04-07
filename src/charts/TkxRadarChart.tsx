import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { useTheme } from '../themes';
import { getDefaultColors, tooltipStyle } from './shared';

export interface TkxRadarSeries {
  key: string;
  label?: string;
  color?: string;
  fillOpacity?: number;
}

export interface TkxRadarChartProps {
  data: Record<string, any>[];
  series: TkxRadarSeries[];
  /** Key in data for the axis labels (e.g. 'subject', 'metric') */
  angleKey: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  /** Outer radius as percentage string or number. Default: '70%' */
  outerRadius?: string | number;
  ariaLabel?: string;
}

export function TkxRadarChart({
  data,
  series,
  angleKey,
  height = 300,
  showLegend = true,
  showTooltip = true,
  outerRadius = '70%',
  ariaLabel = 'Radar chart',
}: TkxRadarChartProps) {
  const theme = useTheme();
  const colors = getDefaultColors(theme);
  const tt = tooltipStyle(theme);

  return (
    <div role="img" aria-label={ariaLabel} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius={outerRadius}>
          <PolarGrid stroke={theme.border} />
          <PolarAngleAxis
            dataKey={angleKey}
            tick={{ fill: theme.textMuted, fontSize: 12 }}
          />
          <PolarRadiusAxis
            tick={{ fill: theme.textMuted, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
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
          {series.map((s, i) => {
            const color = s.color ?? colors[i % colors.length];
            return (
              <Radar
                key={s.key}
                name={s.label ?? s.key}
                dataKey={s.key}
                stroke={color}
                fill={color}
                fillOpacity={s.fillOpacity ?? 0.2}
                strokeWidth={2}
              />
            );
          })}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
