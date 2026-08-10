import { TkxGauge } from 'tekivex-ui';
import { Preview } from '../Preview';

export function GaugeBasic() {
  return (
    <Preview>
      <TkxGauge value={72} label="CPU" size={160} formatValue={(v) => `${v}%`} />
    </Preview>
  );
}

export function GaugeThresholds() {
  return (
    <Preview label="thresholds + speedometer">
      <TkxGauge
        value={88}
        variant="speedometer"
        size={180}
        label="Memory"
        formatValue={(v) => `${v}%`}
        thresholds={[
          { at: 0, color: '#06d6a0' },
          { at: 60, color: '#ffbe0b' },
          { at: 85, color: '#ef476f' },
        ]}
      />
      <TkxGauge
        value={42}
        size={160}
        label="Disk"
        formatValue={(v) => `${v}%`}
        thresholds={[
          { at: 0, color: '#06d6a0' },
          { at: 60, color: '#ffbe0b' },
          { at: 85, color: '#ef476f' },
        ]}
      />
    </Preview>
  );
}

export function GaugeTicks() {
  return (
    <Preview label="showTicks + custom range">
      <TkxGauge
        value={6.4}
        min={0}
        max={8}
        size={170}
        thickness={12}
        showTicks
        label="Load average"
        formatValue={(v) => v.toFixed(1)}
      />
    </Preview>
  );
}
