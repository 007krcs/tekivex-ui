import { useState } from 'react';
import { TkxDatePicker } from 'tekivex-ui';
import { Preview } from '../Preview';

export function DatePickerSingle() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <Preview label="Single date" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 280 }}>
        <TkxDatePicker
          label="Pick a date"
          value={date}
          onChange={(v) => setDate(v as Date | null)}
        />
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          Selected: <strong>{date ? date.toDateString() : '(none)'}</strong>
        </p>
      </div>
    </Preview>
  );
}

export function DatePickerRange() {
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  return (
    <Preview label="Range with built-in presets" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 320 }}>
        <TkxDatePicker
          label="Trip dates"
          mode="range"
          value={range}
          onChange={(v) => setRange(v as [Date | null, Date | null])}
          showPresets
        />
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          {range[0] && range[1]
            ? `From ${range[0].toDateString()} to ${range[1].toDateString()}`
            : '(no range selected)'}
        </p>
      </div>
    </Preview>
  );
}
