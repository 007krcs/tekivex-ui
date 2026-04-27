// Shared App used by all 6 bundler tests. Imports a representative cross-section
// of tekivex-ui so the build exercises every major code path: TKX atomic CSS,
// the i18n provider, theming context, sanitiser primitives, and one component
// from each major surface (form, overlay, data, watermark).

import { useState } from 'react';
import {
  ThemeProvider,
  TkxButton,
  TkxCard,
  TkxCardBody,
  TkxCardHeader,
  TkxBadge,
  TkxAlert,
  TkxInput,
  TkxModal,
  TkxToastProvider,
  useToast,
  TkxDivider,
  TkxWatermark,
  TkxMarkdown,
  sanitizeHref,
} from 'tekivex-ui';

function Inner() {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const toast = useToast();

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <TkxAlert variant="info">
        Bundler smoke test — if you see this card rendered correctly, the
        TKX engine + ThemeProvider + i18n provider all booted under your
        bundler.
      </TkxAlert>

      <div style={{ height: 16 }} />

      <TkxCard>
        <TkxCardHeader title="tekivex-ui" subtitle={<TkxBadge variant="success">v2.8.0</TkxBadge>} />
        <TkxCardBody>
          <TkxInput
            label="Your name"
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
          />
          <div style={{ height: 12 }} />
          <TkxButton variant="primary" onClick={() => setOpen(true)}>
            Open modal
          </TkxButton>{' '}
          <TkxButton
            variant="outline"
            onClick={() => toast({ title: 'Hello', variant: 'success' })}
          >
            Fire toast
          </TkxButton>
          <TkxDivider />
          <TkxMarkdown source={`Hello, **${name || 'world'}**!`} />
          <p style={{ fontSize: 12, opacity: 0.7 }}>
            sanitizeHref test: <a href={sanitizeHref('javascript:alert(1)')}>blocked</a>
          </p>
        </TkxCardBody>
      </TkxCard>

      <TkxModal isOpen={open} onClose={() => setOpen(false)} title="Bundler check">
        Modal renders inside a portal — that's a hint to the bundler that
        SSR-vs-CSR boundaries are honoured.
      </TkxModal>

      <div style={{ marginTop: 32 }}>
        <TkxWatermark text={['BUNDLER TEST']} pattern="tiled">
          <div style={{ padding: 24, border: '1px dashed currentColor', borderRadius: 8 }}>
            Watermark canvas renders here — exercises the canvas branch.
          </div>
        </TkxWatermark>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider mode="auto">
      <TkxToastProvider position="top-right">
        <Inner />
      </TkxToastProvider>
    </ThemeProvider>
  );
}
