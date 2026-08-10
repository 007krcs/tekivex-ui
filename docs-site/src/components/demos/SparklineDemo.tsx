import { TkxSparkline } from 'tekivex-ui';
import { Preview } from '../Preview';

// Deterministic sample series — a week-ish of metric readings.
const REVENUE = [3, 7, 4, 9, 6, 12, 8, 14, 11, 16];
const LATENCY = [42, 38, 51, 47, 40, 36, 44, 33, 30, 28];
const SIGNUPS = [2, 5, 3, 8, 6, 4, 9, 7, 11, 10];

export function SparklineBasic() {
  return (
    <Preview>
      <TkxSparkline data={REVENUE} showValue />
    </Preview>
  );
}

export function SparklineVariants() {
  return (
    <Preview label="line / area / bar">
      <TkxSparkline data={REVENUE} variant="line" ariaLabel="Revenue trend, line" />
      <TkxSparkline data={LATENCY} variant="area" ariaLabel="Latency trend, area" />
      <TkxSparkline data={SIGNUPS} variant="bar" ariaLabel="Signups trend, bar" />
    </Preview>
  );
}

export function SparklineSmooth() {
  return (
    <Preview label="smooth + showPoints">
      <TkxSparkline data={REVENUE} smooth width={160} height={40} ariaLabel="Smoothed revenue trend" />
      <TkxSparkline data={LATENCY} showPoints width={160} height={40} ariaLabel="Latency with every point marked" />
    </Preview>
  );
}
