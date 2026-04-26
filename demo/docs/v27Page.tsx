import { useRef, useState, type CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxCard,
  TkxCardHeader,
  TkxCardBody,
  TkxBadge,
  TkxAlert,
  TkxButton,
  TkxDivider,
  TkxCaptcha,
  TkxFontProvider,
  TkxPhoneInput,
  TkxWatermark,
  TkxImageEditor,
  usePrefersColorScheme,
  type TkxImageEditorHandle,
  type ImageEditResult,
  type PhoneChangePayload,
} from 'tekivex-ui';

interface Props { theme: ThemeTokens }

// ─────────────────────────────────────────────────────────────────────────────
// v2.7 Showcase page — every Phase 1 component demonstrated in one place.
// ─────────────────────────────────────────────────────────────────────────────

export function V27Page({ theme }: Props) {
  const editorRef = useRef<TkxImageEditorHandle | null>(null);
  const [phone, setPhone] = useState<PhoneChangePayload | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [editResult, setEditResult] = useState<ImageEditResult | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi' | 'ta' | 'ar' | 'ja'>('en');
  const systemScheme = usePrefersColorScheme();

  const page: CSSProperties = {
    padding: '48px clamp(16px, 4vw, 48px) 80px',
    maxWidth: 1100,
    margin: '0 auto',
    color: theme.text,
  };
  const h1: CSSProperties = {
    fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    margin: '0 0 12px',
  };
  const h2: CSSProperties = { fontSize: 22, fontWeight: 800, margin: '0 0 8px' };
  const lead: CSSProperties = { color: theme.textMuted, fontSize: 17, lineHeight: 1.7, margin: '0 0 32px', maxWidth: 780 };

  const sampleImage =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#7b2ff7"/>
            <stop offset="100%" stop-color="#00f5d4"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <text x="400" y="320" font-family="sans-serif" font-size="84" font-weight="900" fill="white" text-anchor="middle">v2.7</text>
      </svg>`,
    );

  return (
    <div style={page}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        <h1 style={h1}>v2.7 Platform Refresh</h1>
        <TkxBadge variant="primary">new</TkxBadge>
      </div>
      <p style={lead}>
        Six Phase 1 quick-wins shipped together: image editor, intl phone input, captcha wrapper,
        Indic-aware font loader, watermark v2 with anti-leak modes, and auto dark/light from system preference.
        Plus npm provenance + SBOM in the release pipeline.
      </p>

      <TkxAlert variant="info" title="Auto theme detection">
        Your OS currently prefers <strong>{systemScheme}</strong> mode. Pass <code>mode="auto"</code> to
        <code> ThemeProvider</code> (the default in v2.7) to follow it live.
      </TkxAlert>

      <div style={{ height: 32 }} />

      {/* ── Image editor ───────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={h2}>TkxImageEditor — crop, rotate, adjust</h2>
        <p style={{ color: theme.textMuted, marginTop: 0 }}>
          Drop in any image (or use the sample). Free or locked aspect ratios, 90° rotation,
          brightness + contrast, output as Blob/File.
        </p>
        <TkxImageEditor
          ref={editorRef}
          src={sampleImage}
          aspectRatio="free"
          ratios={['free', '1:1', '3:4', '4:5', '16:9']}
          onResult={(r) => setEditResult(r)}
        />
        {editResult && (
          <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <img
              src={editResult.url}
              alt="Edit result"
              style={{ maxWidth: 240, border: `1px solid ${theme.border}`, borderRadius: 8 }}
            />
            <div style={{ fontSize: 13, color: theme.textMuted }}>
              <div><strong>Output:</strong> {editResult.width}×{editResult.height}px</div>
              <div><strong>Size:</strong> {(editResult.blob.size / 1024).toFixed(1)} KB</div>
              <div><strong>Type:</strong> {editResult.blob.type}</div>
              <a
                href={editResult.url}
                download={editResult.file.name}
                style={{ color: theme.primary, textDecoration: 'none' }}
              >
                ↓ Download
              </a>
            </div>
          </div>
        )}
      </section>

      {/* ── Phone input ────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={h2}>TkxPhoneInput — intl with E.164</h2>
        <p style={{ color: theme.textMuted, marginTop: 0 }}>
          50+ countries built-in, search by name or dial code, live formatting, conservative validity.
        </p>
        <TkxPhoneInput
          label="Mobile number"
          defaultCountry="in"
          required
          onChange={(p) => setPhone(p)}
        />
        {phone && (
          <div style={{ marginTop: 12, fontSize: 13, color: theme.textMuted, fontFamily: 'ui-monospace, monospace' }}>
            <div>raw: <code>{phone.raw || '—'}</code></div>
            <div>e164: <code>{phone.e164 || '—'}</code></div>
            <div>valid: <strong style={{ color: phone.valid ? theme.success : theme.danger }}>{String(phone.valid)}</strong></div>
            <div>country: {phone.country.flag} {phone.country.name}</div>
          </div>
        )}
      </section>

      {/* ── Captcha ────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={h2}>TkxCaptcha — provider-agnostic wrapper</h2>
        <p style={{ color: theme.textMuted, marginTop: 0 }}>
          Cloudflare Turnstile, hCaptcha, reCAPTCHA. Test mode auto-verifies in 200ms so the demo
          works without a real site key.
        </p>
        <TkxCaptcha
          provider="turnstile"
          sitekey="0x4AAAAAAA_test_key_for_demo_only_"
          testMode
          onVerify={(t) => setCaptchaToken(t)}
        />
        {captchaToken && (
          <p style={{ marginTop: 12, fontSize: 13, color: theme.success }}>
            ✓ Verified. Token: <code>{captchaToken}</code>
          </p>
        )}
      </section>

      {/* ── Font provider ─────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={h2}>TkxFontProvider — lazy Indic + RTL fonts</h2>
        <p style={{ color: theme.textMuted, marginTop: 0 }}>
          Loads only the script subsets your selected language requires. No more 600KB Noto Sans
          downloads on every page.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {(['en', 'hi', 'ta', 'ar', 'ja'] as const).map((l) => (
            <TkxButton
              key={l}
              variant={language === l ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLanguage(l)}
            >
              {l.toUpperCase()}
            </TkxButton>
          ))}
        </div>
        <TkxFontProvider language={language}>
          <div
            style={{
              padding: 16,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              fontFamily:
                language === 'hi'
                  ? '"Noto Sans Devanagari", sans-serif'
                  : language === 'ta'
                  ? '"Noto Sans Tamil", sans-serif'
                  : language === 'ar'
                  ? '"Noto Sans Arabic", sans-serif'
                  : language === 'ja'
                  ? '"Noto Sans JP", sans-serif'
                  : '"Noto Sans", sans-serif',
              fontSize: 18,
            }}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {language === 'en' && 'The quick brown fox jumps over the lazy dog'}
            {language === 'hi' && 'तेज़ भूरी लोमड़ी आलसी कुत्ते के ऊपर से कूदती है'}
            {language === 'ta' && 'வேகமான பழுப்பு நரி சோம்பேறி நாயின் மேல் குதிக்கிறது'}
            {language === 'ar' && 'الثعلب البني السريع يقفز فوق الكلب الكسول'}
            {language === 'ja' && '素早い茶色のキツネが怠け者の犬を飛び越える'}
          </div>
        </TkxFontProvider>
      </section>

      {/* ── Watermark v2 ──────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={h2}>TkxWatermark v2 — anti-leak modes</h2>
        <p style={{ color: theme.textMuted, marginTop: 0 }}>
          New: <code>pattern</code> ('tiled' | 'single' | 'fingerprint'), <code>dynamic</code>,
          <code>intensifyOnDevtools</code>. Backward-compatible with v2.6 props. Open DevTools to
          see the intensify mode kick in.
        </p>
        <TkxWatermark
          text={['CONFIDENTIAL', 'tekivex-ui demo']}
          pattern="fingerprint"
          dynamic
          refreshMs={30000}
          intensifyOnDevtools
        >
          <TkxCard variant="glass" padding="lg">
            <TkxCardHeader title="Protected content" />
            <TkxCardBody>
              <p style={{ margin: 0, color: theme.text }}>
                The fingerprint mode adds a per-session id and live timestamp — when a screenshot
                gets shared, the leak is traceable to the session that took it.
              </p>
            </TkxCardBody>
          </TkxCard>
        </TkxWatermark>
      </section>

      <TkxDivider />
      <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 24 }}>
        v2.7 ships under the same MIT license. Existing v2.6 imports keep working unchanged —
        the auto-theme behaviour is the only behavioural change, and only when you call
        <code>{'<ThemeProvider>'}</code> with no <code>theme</code> prop.
      </p>
    </div>
  );
}
