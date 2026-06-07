import { useState } from 'react';
import { TkxSpin, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function SpinSizes() {
  return (
    <Preview label="Three sizes">
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <TkxSpin size="sm" />
        <TkxSpin size="md" />
        <TkxSpin size="lg" />
      </div>
    </Preview>
  );
}

export function SpinAsOverlay() {
  const [loading, setLoading] = useState(false);
  return (
    <Preview label="As wrapper — overlays content while loading" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxButton size="sm" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1800); }}>
        Trigger 1.8s loading
      </TkxButton>
      <TkxSpin spinning={loading}>
        <div style={{ padding: 24, minWidth: 280, border: '1px solid #e5e7eb', borderRadius: 8, marginTop: 12 }}>
          <strong style={{ fontSize: 13 }}>Quarterly report</strong>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#475569' }}>
            Q2 revenue is up 18% YoY. Click the button above to simulate refresh.
          </p>
        </div>
      </TkxSpin>
    </Preview>
  );
}
