import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxQRCode, TkxInput, TkxSegmented } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

const QRCODE_PROPS = [
  { name: 'value', type: 'string', default: '—', description: 'The data to encode — URL, text, vCard, Wi-Fi config, etc.', required: true },
  { name: 'size', type: 'number', default: '128', description: 'Width and height of the QR code canvas in pixels.' },
  { name: 'color', type: 'string', default: "'#000000'", description: 'Foreground (module) color.' },
  { name: 'bgColor', type: 'string', default: "'#ffffff'", description: 'Background color.' },
  { name: 'errorLevel', type: "'L' | 'M' | 'Q' | 'H'", default: "'M'", description: 'Error correction level. Higher levels allow the QR to be read even when partially obscured.' },
  { name: 'icon', type: 'string', default: 'undefined', description: 'URL of an image to overlay in the center of the QR code (e.g., a brand logo).' },
  { name: 'bordered', type: 'boolean', default: 'true', description: 'Wraps the QR code in a rounded card with a border.' },
];

export function QRCodePage({ theme }: { theme: ThemeTokens }) {
  const [customValue, setCustomValue] = useState('https://www.tekivex.com/ui');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  const divider = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Basic ───────────────────────────────────────────────────────── */}
      <DemoSection
        title="Basic QR Code"
        description="Renders a deterministic QR-style code from any string. Perfect for URLs, Wi-Fi credentials, vCards, or deep links."
        theme={theme}
        code={`<TkxQRCode value="https://www.tekivex.com/ui" />`}
      >
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TkxQRCode value="https://www.tekivex.com/ui" />
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: theme.text, fontWeight: 600 }}>tekivex-ui on npm</p>
            <TkxQRCode value="https://npmjs.com/package/tekivex-ui" size={100} />
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: theme.text, fontWeight: 600 }}>GitHub Repo</p>
            <TkxQRCode value="https://www.tekivex.com/ui" size={100} />
          </div>
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Live Playground ─────────────────────────────────────────────── */}
      <DemoSection
        title="Live Playground"
        description="Type any text, URL, or data — the QR code updates in real time."
        theme={theme}
        code={`const [value, setValue] = useState('https://www.tekivex.com/ui');

<TkxInput
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter URL or text..."
/>
<TkxQRCode value={value} size={160} />`}
      >
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <TkxInput
              label="Content to encode"
              value={customValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomValue(e.target.value)}
              placeholder="Enter URL, text, Wi-Fi credentials..."
            />
            <div style={{ marginTop: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: theme.textMuted }}>Error correction level</p>
              <TkxSegmented
                options={[
                  { value: 'L', label: 'L (7%)' },
                  { value: 'M', label: 'M (15%)' },
                  { value: 'Q', label: 'Q (25%)' },
                  { value: 'H', label: 'H (30%)' },
                ]}
                value={errorLevel}
                onChange={(v) => setErrorLevel(v as 'L' | 'M' | 'Q' | 'H')}
              />
            </div>
          </div>
          <TkxQRCode
            value={customValue || 'https://www.tekivex.com/ui'}
            size={160}
            errorLevel={errorLevel}
          />
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Custom Colors ───────────────────────────────────────────────── */}
      <DemoSection
        title="Custom Colors & Sizes"
        description="Match your brand palette. Any foreground and background colors work — ensure sufficient contrast for scanability."
        theme={theme}
        code={`<TkxQRCode value="https://www.tekivex.com/ui" color="#0ea5e9" bgColor="#f0f9ff" size={120} />
<TkxQRCode value="https://www.tekivex.com/ui" color="#10b981" bgColor="#f0fdf4" size={120} />
<TkxQRCode value="https://www.tekivex.com/ui" color="#8b5cf6" bgColor="#faf5ff" size={120} />
<TkxQRCode value="https://www.tekivex.com/ui" color="#f59e0b" bgColor="#fffbeb" size={120} />`}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <TkxQRCode value="https://www.tekivex.com/ui" color="#0ea5e9" bgColor="#f0f9ff" size={120} />
          <TkxQRCode value="https://www.tekivex.com/ui" color="#10b981" bgColor="#f0fdf4" size={120} />
          <TkxQRCode value="https://www.tekivex.com/ui" color="#8b5cf6" bgColor="#faf5ff" size={120} />
          <TkxQRCode value="https://www.tekivex.com/ui" color="#f59e0b" bgColor="#fffbeb" size={120} />
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Use Cases ───────────────────────────────────────────────────── */}
      <DemoSection
        title="Common Use Cases"
        description="QR codes for Wi-Fi credentials, contact cards, payment links, and app download prompts."
        theme={theme}
        code={`// Wi-Fi credentials
<TkxQRCode value="WIFI:T:WPA;S:MyNetwork;P:MyPassword;;" />

// Payment link
<TkxQRCode value="https://pay.example.com/checkout/abc123" />

// vCard contact
<TkxQRCode value="BEGIN:VCARD\\nFN:Jane Doe\\nTEL:+1234567890\\nEND:VCARD" />`}
      >
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            { label: 'Wi-Fi Credentials', value: 'WIFI:T:WPA;S:TekivexNet;P:SecurePass123;;' },
            { label: 'Payment Link', value: 'https://pay.tekivex.com/checkout/order-9871' },
            { label: 'Contact Card', value: 'BEGIN:VCARD\nFN:Jane Doe\nTEL:+1234567890\nEND:VCARD' },
            { label: 'App Download', value: 'https://apps.apple.com/app/tekivex' },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <TkxQRCode value={value} size={110} />
              <p style={{ margin: '10px 0 0', fontSize: 12, color: theme.textMuted }}>{label}</p>
            </div>
          ))}
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Props ──────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>TkxQRCode Props</h3>
        <PropTable props={QRCODE_PROPS} />
      </div>
    </div>
  );
}
