import { useState } from 'react';
import { TkxSlider } from 'tekivex-ui';
import { Preview } from '../Preview';

export function SliderSingle() {
  const [value, setValue] = useState(50);
  return (
    <Preview label="Single handle" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 320 }}>
        <TkxSlider
          label="Volume"
          min={0}
          max={100}
          value={value}
          onChange={(v) => setValue(v as number)}
          formatValue={(v) => `${v}%`}
        />
      </div>
    </Preview>
  );
}

export function SliderRange() {
  const [range, setRange] = useState<[number, number]>([20, 80]);
  return (
    <Preview label="Range (dual handle)" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 320 }}>
        <TkxSlider
          label="Price range"
          min={0}
          max={500}
          value={range}
          onChange={(v) => setRange(v as [number, number])}
          formatValue={(v) => `$${v}`}
        />
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          Selected: <strong>${range[0]}–${range[1]}</strong>
        </p>
      </div>
    </Preview>
  );
}

export function SliderMarks() {
  const [value, setValue] = useState(50);
  return (
    <Preview label="With marks (snap)" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 320 }}>
        <TkxSlider
          label="Quality"
          min={0}
          max={100}
          step={25}
          value={value}
          onChange={(v) => setValue(v as number)}
          marks={[
            { value: 0,   label: 'Low' },
            { value: 25,  label: '' },
            { value: 50,  label: 'Med' },
            { value: 75,  label: '' },
            { value: 100, label: 'High' },
          ]}
        />
      </div>
    </Preview>
  );
}
