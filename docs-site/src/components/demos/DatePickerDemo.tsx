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
        {/* Range mode uses the separate `rangeValue` / `onRangeChange` props.
            Passing a tuple to `value` looks right but actually puts the
            picker into single mode with an array as the date — which the
            component now defensively coerces to null, but the right thing
            is to use the correct prop names. */}
        <TkxDatePicker
          label="Trip dates"
          mode="range"
          rangeValue={range}
          onRangeChange={(v) => setRange(v)}
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
