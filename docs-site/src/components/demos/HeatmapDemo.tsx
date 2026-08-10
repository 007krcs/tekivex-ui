import { TkxHeatmap } from 'tekivex-ui';
import { Preview } from '../Preview';

// Deterministic hourly-traffic sample: requests per hour band per weekday.
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HOURS = ['9am', '11am', '1pm', '3pm', '5pm'];
const TRAFFIC_VALUES = [
  // 9am 11am 1pm 3pm 5pm
  [12, 30, 22, 18, 8], // Mon
  [8, 26, 25, 20, 11], // Tue
  [15, 34, 28, 24, 13], // Wed
  [10, 29, 31, 26, 15], // Thu
  [6, 21, 18, 12, 4], // Fri
];
const TRAFFIC = DAYS.flatMap((day, d) =>
  HOURS.map((hour, h) => ({ x: day, y: hour, value: TRAFFIC_VALUES[d][h] })),
);

export function HeatmapBasic() {
  return (
    <Preview>
      <TkxHeatmap
        data={TRAFFIC}
        xLabels={DAYS}
        yLabels={HOURS}
        showValues
        ariaLabel="Requests per hour band per weekday"
      />
    </Preview>
  );
}

// Small correlation matrix — diverging scale over [-1, 1].
const METRICS = ['CPU', 'RAM', 'I/O'];
const CORR_VALUES = [
  [1, 0.62, -0.35],
  [0.62, 1, -0.12],
  [-0.35, -0.12, 1],
];
const CORRELATION = METRICS.flatMap((a, i) =>
  METRICS.map((b, j) => ({ x: a, y: b, value: CORR_VALUES[i][j] })),
);

export function HeatmapDiverging() {
  return (
    <Preview label='colorScale="diverging"'>
      <TkxHeatmap
        data={CORRELATION}
        xLabels={METRICS}
        yLabels={METRICS}
        colorScale="diverging"
        domain={[-1, 1]}
        showValues
        cellSize={44}
        legendPosition="bottom"
        formatValue={(v) => v.toFixed(2)}
        ariaLabel="Correlation matrix of CPU, RAM, and I/O"
      />
    </Preview>
  );
}
