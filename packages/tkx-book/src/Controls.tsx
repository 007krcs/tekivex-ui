import type { CSSProperties } from 'react';
import type { ControlSpec } from './types';

export interface ControlsProps {
  controls: Record<string, ControlSpec>;
  values: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

export function Controls({ controls, values, onChange }: ControlsProps) {
  const entries = Object.entries(controls);

  const wrap: CSSProperties = {
    borderTop: '1px solid var(--tkx-border)',
    background: 'var(--tkx-surface)',
    overflow: 'auto',
    padding: 16,
  };

  if (entries.length === 0) {
    return (
      <div style={wrap}>
        <div style={{ color: 'var(--tkx-textMuted)', fontSize: 13 }}>
          (no controls)
        </div>
      </div>
    );
  }

  const setOne = (key: string, value: any) => onChange({ ...values, [key]: value });

  const labelStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--tkx-textMuted)',
    marginBottom: 4,
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid var(--tkx-border)',
    borderRadius: 4,
    background: 'var(--tkx-bg)',
    color: 'var(--tkx-text)',
    fontSize: 13,
    outline: 'none',
  };

  return (
    <div style={wrap}>
      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: 'var(--tkx-textMuted)' }}>
        CONTROLS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {entries.map(([key, spec]) => (
          <div key={key}>
            <div style={labelStyle}>{key}</div>
            {spec.type === 'select' && (
              <select
                value={values[key] ?? ''}
                onChange={(e) => setOne(key, e.target.value)}
                style={inputStyle}
              >
                {(spec.options ?? []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            )}
            {spec.type === 'boolean' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={!!values[key]}
                  onChange={(e) => setOne(key, e.target.checked)}
                />
                {String(values[key])}
              </label>
            )}
            {spec.type === 'text' && (
              <input
                type="text"
                value={values[key] ?? ''}
                onChange={(e) => setOne(key, e.target.value)}
                style={inputStyle}
              />
            )}
            {spec.type === 'number' && (
              <input
                type="number"
                value={values[key] ?? 0}
                min={spec.min}
                max={spec.max}
                step={spec.step ?? 1}
                onChange={(e) => setOne(key, Number(e.target.value))}
                style={inputStyle}
              />
            )}
            {spec.type === 'color' && (
              <input
                type="color"
                value={values[key] ?? '#000000'}
                onChange={(e) => setOne(key, e.target.value)}
                style={{ ...inputStyle, padding: 2, height: 32 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
