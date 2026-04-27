import { useRef, useState } from 'react';
import { TkxSignaturePad, TkxButton, type TkxSignaturePadHandle } from 'tekivex-ui';
import type { Story } from '../src/types';

function SignatureStory(p: any) {
  const ref = useRef<TkxSignaturePadHandle>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  return (
    <div style={{ minWidth: 360 }}>
      <TkxSignaturePad
        ref={ref}
        label={p.label}
        height={p.height}
        strokeWidth={p.strokeWidth}
        onChange={setDataUrl}
      />
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <TkxButton variant="ghost" size="sm" onClick={() => ref.current?.undo()}>Undo</TkxButton>
        <TkxButton variant="outline" size="sm" onClick={() => ref.current?.clear()}>Clear</TkxButton>
      </div>
      {dataUrl && (
        <img src={dataUrl} alt="signature preview" style={{ marginTop: 12, maxWidth: '100%', border: '1px solid currentColor', borderRadius: 4 }} />
      )}
    </div>
  );
}

export const signaturePad: Story = {
  name: 'TkxSignaturePad',
  description: 'Canvas signature capture with smoothing.',
  controls: {
    label: { type: 'text', default: 'Sign here' },
    height: { type: 'number', default: 180, min: 80, max: 400, step: 20 },
    strokeWidth: { type: 'number', default: 2, min: 1, max: 8, step: 0.5 },
  },
  render: (p) => <SignatureStory {...p} />,
};
