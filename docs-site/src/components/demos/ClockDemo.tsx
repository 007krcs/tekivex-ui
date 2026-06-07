import { TkxClock } from 'tekivex-ui';
import { Preview } from '../Preview';

export function ClockDigital() {
  return (
    <Preview label="Digital — updates every second">
      <TkxClock variant="digital" size="lg" />
    </Preview>
  );
}

export function ClockAnalog() {
  return (
    <Preview label="Analog">
      <TkxClock variant="analog" size="lg" />
    </Preview>
  );
}

export function ClockSizes() {
  return (
    <Preview label="Sizes">
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <TkxClock variant="digital" size="sm" />
        <TkxClock variant="digital" size="md" />
        <TkxClock variant="digital" size="lg" />
      </div>
    </Preview>
  );
}
