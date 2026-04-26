import { useState, type CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { sanitizeString, meetsAA, meetsAAA, contrastRatio } from '../../src/headless';
import {
  sanitizeHref,
  sanitizeUnicode,
  buildTkxCSP,
  scrubPII,
  isFramed,
  createRateLimiter,
} from '../../src/engine/security';
import { WCAGBadgeGroup } from '../layout/WCAGBadge';

interface Props { theme: ThemeTokens }

// ── XSS Sanitizer Demo ────────────────────────────────────────────────────────

function XSSDemo({ theme }: { theme: ThemeTokens }) {
  const examples = [
    { label: 'Script injection', input: '<script>alert("XSS")</script>Hello' },
    { label: 'Event handler', input: '<img src=x onerror="document.cookie" />' },
    { label: 'Data URI', input: '<a href="data:text/html,<script>alert(1)</script>">click</a>' },
    { label: 'JS protocol', input: '<a href="javascript:alert(1)">XSS link</a>' },
    { label: 'Safe HTML', input: '<b>Bold</b> and <em>italic</em> text' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {examples.map(({ label, input }) => {
        const sanitized = sanitizeString(input);
        const isSafe = sanitized === input;
        return (
          <div key={label} style={{
            borderRadius: 8, border: `1px solid ${theme.border}`,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '8px 14px', background: theme.surfaceAlt, fontSize: 11, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: theme.danger, minWidth: 50, paddingTop: 1 }}>INPUT</span>
                <code style={{ fontSize: 12, color: theme.danger, background: `${theme.danger}12`, padding: '2px 8px', borderRadius: 4, wordBreak: 'break-all' as const }}>{input}</code>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: isSafe ? theme.success : theme.primary, minWidth: 50, paddingTop: 1 }}>OUTPUT</span>
                <code style={{ fontSize: 12, color: isSafe ? theme.success : theme.primary, background: `${isSafe ? theme.success : theme.primary}12`, padding: '2px 8px', borderRadius: 4, wordBreak: 'break-all' as const }}>
                  {sanitized || '(empty — fully stripped)'}
                </code>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Live Sanitizer Playground ─────────────────────────────────────────────────

function SanitizerPlayground({ theme }: { theme: ThemeTokens }) {
  const [input, setInput] = useState('<script>alert("XSS")</script> Hello <b>world</b>!');
  const sanitized = sanitizeString(input);
  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 6, fontSize: 13,
    border: `1px solid ${theme.border}`, background: theme.surface,
    color: theme.text, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>
          Input (try injecting XSS):
        </label>
        <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={input} onChange={(e) => setInput(e.target.value)} />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>
          Sanitized output (safe to render):
        </label>
        <div style={{ padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.success}50`, background: `${theme.success}08`, fontFamily: 'monospace', fontSize: 13, color: theme.success, minHeight: 40, wordBreak: 'break-all' }}>
          {sanitized || <span style={{ color: theme.textMuted, fontStyle: 'italic' }}>(empty)</span>}
        </div>
      </div>
    </div>
  );
}

// ── WCAG Contrast Checker Demo ────────────────────────────────────────────────

function WCAGDemo({ theme }: { theme: ThemeTokens }) {
  const [fg, setFg] = useState(theme.text);
  const [bg, setBg] = useState(theme.bg);

  let ratio = 1;
  let aa = false;
  let aaa = false;
  try {
    ratio = contrastRatio(fg, bg);
    aa = meetsAA(fg, bg);
    aaa = meetsAAA(fg, bg);
  } catch {}

  const badge = (label: string, passes: boolean) => (
    <span style={{
      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: passes ? `${theme.success}20` : `${theme.danger}20`,
      color: passes ? theme.success : theme.danger,
      border: `1px solid ${passes ? theme.success : theme.danger}40`,
    }}>{passes ? '✓' : '✗'} {label}</span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>Foreground</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} style={{ width: 40, height: 36, borderRadius: 6, border: `1px solid ${theme.border}`, cursor: 'pointer', padding: 2 }} />
            <code style={{ fontSize: 13, color: theme.text }}>{fg}</code>
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>Background</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ width: 40, height: 36, borderRadius: 6, border: `1px solid ${theme.border}`, cursor: 'pointer', padding: 2 }} />
            <code style={{ fontSize: 13, color: theme.text }}>{bg}</code>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', borderRadius: 8, border: `1px solid ${theme.border}`, background: bg, textAlign: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: fg }}>Sample Text Preview</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: theme.textMuted }}>Contrast ratio: <strong style={{ color: theme.text, fontSize: 15 }}>{ratio.toFixed(2)}:1</strong></span>
        {badge('WCAG AA (4.5:1)', aa)}
        {badge('WCAG AAA (7:1)', aaa)}
      </div>
    </div>
  );
}

// ── Audit Trail Demo ──────────────────────────────────────────────────────────

function AuditDemo({ theme }: { theme: ThemeTokens }) {
  const events = [
    { time: '13:42:01', action: 'sanitizeString()', input: '<script>alert(1)</script>', safe: true },
    { time: '13:42:03', action: 'sanitizeProps()', input: '{ onClick: "javascript:void(0)" }', safe: true },
    { time: '13:42:07', action: 'sanitizeString()', input: 'Hello World', safe: false },
    { time: '13:42:11', action: 'contrastRatio()', input: '#00f5d4 vs #0a0a1a → 8.2:1', safe: false },
  ];
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: theme.surfaceAlt, fontSize: 11, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', justifyContent: 'space-between' }}>
        <span>Security Audit Trail</span>
        <span style={{ color: theme.primary }}>IMMUTABLE · Read-only</span>
      </div>
      {events.map((ev, i) => (
        <div key={i} style={{ padding: '10px 16px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 16, alignItems: 'center', fontSize: 12 }}>
          <code style={{ color: theme.textMuted, minWidth: 70 }}>{ev.time}</code>
          <code style={{ color: theme.primary, minWidth: 140 }}>{ev.action}</code>
          <span style={{ color: theme.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.input}</span>
          {ev.safe && <span style={{ color: theme.warning, fontSize: 11, fontWeight: 700 }}>SANITIZED</span>}
        </div>
      ))}
    </div>
  );
}

// ── v2.6 SecurityCore demos ───────────────────────────────────────────────────

function rowBase(theme: ThemeTokens): CSSProperties {
  return {
    borderRadius: 8,
    border: `1px solid ${theme.border}`,
    overflow: 'hidden',
  };
}

function resultLine(label: string, color: string, text: string): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 14px' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 60, paddingTop: 1 }}>{label}</span>
      <code style={{
        fontSize: 12, color, background: `${color}12`,
        padding: '2px 8px', borderRadius: 4, wordBreak: 'break-all',
      }}>{text}</code>
    </div>
  );
}

function UrlDemo({ theme }: { theme: ThemeTokens }) {
  const cases = [
    'https://example.com/path',
    'javascript:alert(1)',
    'vbscript:msgbox',
    'data:text/html,<script>alert(1)</script>',
    'mailto:hello@tekivex.dev',
    '/relative/path',
    '#anchor',
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {cases.map((u) => {
        const out = sanitizeHref(u);
        const safe = out !== null;
        return (
          <div key={u} style={rowBase(theme)}>
            {resultLine('INPUT', theme.textMuted, u)}
            {resultLine(safe ? 'PASS' : 'BLOCKED', safe ? theme.success : theme.danger, out ?? '(null — rejected)')}
          </div>
        );
      })}
    </div>
  );
}

function UnicodeDemo({ theme }: { theme: ThemeTokens }) {
  const [val, setVal] = useState('admin\u202Eexploit.exe');
  const out = sanitizeUnicode(val);
  const inputStyle: CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 6, fontSize: 13,
    border: `1px solid ${theme.border}`, background: theme.surface,
    color: theme.text, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>
          Input (try pasting bidi-override text, e.g. a\u202Eb):
        </label>
        <input style={inputStyle} value={val} onChange={(e) => setVal(e.target.value)} />
        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>
          Original length: <strong style={{ color: theme.text }}>{val.length}</strong> chars
        </div>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>
          Sanitized (zero-width + bidi chars stripped):
        </label>
        <div style={{
          padding: '10px 12px', borderRadius: 6,
          border: `1px solid ${theme.success}50`, background: `${theme.success}08`,
          fontFamily: 'monospace', fontSize: 13, color: theme.success, minHeight: 40,
          wordBreak: 'break-all',
        }}>{out || <em style={{ color: theme.textMuted }}>(empty)</em>}</div>
        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>
          Stripped: <strong style={{ color: val.length !== out.length ? theme.danger : theme.text }}>{val.length - out.length}</strong> invisible chars
        </div>
      </div>
    </div>
  );
}

function PIIDemo({ theme }: { theme: ThemeTokens }) {
  const [val, setVal] = useState(
    'Contact Jane at jane.doe@example.com (555-123-4567). SSN 123-45-6789, card 4111-1111-1111-1111, key sk-abc123xyz4567890abc',
  );
  const out = scrubPII(val);
  const taStyle: CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 6, fontSize: 13,
    border: `1px solid ${theme.border}`, background: theme.surface,
    color: theme.text, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box',
    resize: 'vertical',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <textarea rows={3} style={taStyle} value={val} onChange={(e) => setVal(e.target.value)} />
      <div style={{
        padding: '10px 12px', borderRadius: 6,
        border: `1px solid ${theme.success}50`, background: `${theme.success}08`,
        fontFamily: 'monospace', fontSize: 13, color: theme.success, minHeight: 40,
      }}>{out}</div>
    </div>
  );
}

function CSPDemo({ theme }: { theme: ThemeTokens }) {
  const csp = buildTkxCSP();
  const parts = csp.split(';').map((s) => s.trim()).filter(Boolean);
  return (
    <div style={{
      borderRadius: 8, border: `1px solid ${theme.border}`,
      background: theme.surface, overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px', background: theme.surfaceAlt,
        fontSize: 11, fontWeight: 700, color: theme.textMuted,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>Content-Security-Policy</div>
      {parts.map((p, i) => (
        <div key={i} style={{
          padding: '8px 14px',
          borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
          fontFamily: 'monospace', fontSize: 12, color: theme.text,
        }}>
          <code style={{ color: theme.primary }}>{p.split(' ')[0]}</code>
          <span style={{ color: theme.textMuted }}> {p.split(' ').slice(1).join(' ')}</span>
        </div>
      ))}
    </div>
  );
}

function FramedDemo({ theme }: { theme: ThemeTokens }) {
  const framed = isFramed();
  return (
    <div style={{
      padding: '16px 20px', borderRadius: 8,
      border: `1px solid ${framed ? theme.danger : theme.success}50`,
      background: `${framed ? theme.danger : theme.success}08`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 20 }}>{framed ? '⚠' : '✓'}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: framed ? theme.danger : theme.success }}>
          {framed ? 'Page is framed (potential clickjacking)' : 'Page is not framed — safe'}
        </div>
        <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>
          isFramed() returns <code>{String(framed)}</code>. TkxModal & TkxDrawer dispatch
          <code> tkx:framed-*</code> events when opened in a hostile iframe.
        </div>
      </div>
    </div>
  );
}

function RateLimiterDemo({ theme }: { theme: ThemeTokens }) {
  const [rl] = useState(() => createRateLimiter(3, 2000));
  const [log, setLog] = useState<string[]>([]);
  const hit = () => {
    const ok = rl.check();
    setLog((l) => [
      `${new Date().toLocaleTimeString()} — ${ok ? '✓ allowed' : '✗ throttled'}`,
      ...l,
    ].slice(0, 6));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={hit} style={{
          padding: '8px 16px', borderRadius: 6,
          border: `1px solid ${theme.primary}50`,
          background: `${theme.primary}15`, color: theme.primary,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Tap (3/2s budget)</button>
        <button onClick={() => { rl.reset(); setLog([]); }} style={{
          padding: '8px 16px', borderRadius: 6,
          border: `1px solid ${theme.border}`, background: 'transparent',
          color: theme.textMuted, fontSize: 13, cursor: 'pointer',
        }}>Reset</button>
      </div>
      <div style={{
        padding: '10px 14px', borderRadius: 6, background: theme.surfaceAlt,
        fontFamily: 'monospace', fontSize: 12, minHeight: 100, color: theme.text,
      }}>
        {log.length === 0 ? (
          <em style={{ color: theme.textMuted }}>Tap the button above — first 3 in 2s pass, rest are throttled.</em>
        ) : log.map((l, i) => (
          <div key={i} style={{
            color: l.includes('throttled') ? theme.danger : theme.success,
            padding: '2px 0',
          }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function SecurityPage({ theme }: Props) {
  const sectionStyle = { maxWidth: 900, margin: '0 auto', padding: '40px 32px' };
  const headingStyle = { fontSize: '2rem', fontWeight: 700, color: theme.text, marginBottom: '8px' };
  const subStyle = { fontSize: '1rem', color: theme.textMuted, marginBottom: '16px', lineHeight: '1.6' };

  const monopolyCard = {
    padding: '16px 20px',
    borderRadius: 10,
    border: `1px solid ${theme.primary}40`,
    background: `${theme.primary}08`,
    marginBottom: '32px',
  };

  return (
    <div style={sectionStyle}>
      <h1 style={headingStyle}>Security & Accessibility Engine</h1>
      <p style={subStyle}>
        TekiVex UI is the only React component library with a zero-trust security engine built in. Every string that passes through the library is automatically sanitised — no configuration required.
      </p>

      <div style={monopolyCard}>
        <p style={{ margin: 0, fontSize: 13, color: theme.primary, fontWeight: 600, marginBottom: 8 }}>
          🏆 Unique Competitive Advantage — No other React UI library does this:
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: theme.text, lineHeight: 1.8 }}>
          <li><strong>Automatic XSS sanitisation</strong> on every text prop via the Shield engine</li>
          <li><strong>Immutable audit trail</strong> of all security events (sanitisation, blocked payloads)</li>
          <li><strong>Built-in WCAG AAA contrast checker</strong> with contrastRatio(), meetsAA(), meetsAAA()</li>
          <li><strong>Plugin-aware CSS engine</strong> — extend rendering via tkxPlugin() without forking</li>
        </ul>
      </div>

      <WCAGBadgeGroup level="AAA" theme={theme} />

      <DemoSection
        title="XSS Sanitisation (Shield Engine)"
        description="All TekiVex components automatically sanitise string props. Script tags, event handlers, data URIs, and JS protocol links are stripped before rendering."
        theme={theme}
        code={`import { sanitizeString } from 'tekivex-ui/headless';

// Automatically called inside every TekiVex component:
sanitizeString('<script>alert("XSS")</script>Hello')
// → 'Hello'

sanitizeString('<img src=x onerror="steal(document.cookie)" />')
// → '' (fully stripped)`}
      >
        <XSSDemo theme={theme} />
      </DemoSection>

      <DemoSection
        title="Live Sanitisation Playground"
        description="Type any HTML — including XSS payloads — and see the Shield engine neutralise it in real time."
        theme={theme}
        code={`import { sanitizeString } from 'tekivex-ui/headless';
const safe = sanitizeString(userInput);`}
      >
        <SanitizerPlayground theme={theme} />
      </DemoSection>

      <DemoSection
        title="WCAG AAA Contrast Checker"
        description="Built-in colour accessibility utilities. meetsAA() requires 4.5:1 ratio for normal text. meetsAAA() requires 7:1. Pick any two colours and see results instantly."
        theme={theme}
        code={`import { contrastRatio, meetsAA, meetsAAA } from 'tekivex-ui/headless';

const ratio = contrastRatio('#00f5d4', '#0a0a1a'); // → 8.21
const aa  = meetsAA('#00f5d4', '#0a0a1a');          // → true (4.5:1 threshold)
const aaa = meetsAAA('#00f5d4', '#0a0a1a');         // → true (7:1 threshold)`}
      >
        <WCAGDemo theme={theme} />
      </DemoSection>

      <DemoSection
        title="Security Audit Trail"
        description="Every sanitisation event is recorded in an immutable, append-only log. Export it for compliance, SIEM integration, or debugging. No other UI library offers this."
        theme={theme}
        code={`// Audit trail is automatic — no configuration needed.
// Future: export for SIEM / compliance systems.
import { Shield } from 'tekivex-ui';
const log = Shield.getAuditLog(); // → SecurityEvent[]`}
      >
        <AuditDemo theme={theme} />
      </DemoSection>

      <PropTable
        theme={theme}
        title="Security API"
        rows={[
          { prop: 'sanitizeString(str)', type: 'string → string', description: 'Strip XSS payloads from any string. Called automatically on all text props.' },
          { prop: 'sanitizeProps(props)', type: 'object → object', description: 'Strip dangerous HTML attributes from a props object.' },
          { prop: 'contrastRatio(fg, bg)', type: '(string, string) → number', description: 'WCAG relative luminance contrast ratio (1:1 to 21:1).' },
          { prop: 'meetsAA(fg, bg)', type: '(string, string) → boolean', description: 'Returns true if contrast ratio ≥ 4.5:1 (WCAG AA normal text).' },
          { prop: 'meetsAAA(fg, bg)', type: '(string, string) → boolean', description: 'Returns true if contrast ratio ≥ 7:1 (WCAG AAA enhanced).' },
        ]}
      />

      {/* ── SecurityCore v2.6 — extended defenses ─────────────────── */}
      <div style={{ marginTop: 48 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 999, background: `${theme.success}18`, border: `1px solid ${theme.success}33`, color: theme.success, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 12 }}>
            NEW IN v2.6.0
          </div>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 800, margin: 0, color: theme.text }}>
            SecurityCore — the full kernel
          </h2>
          <p style={{ color: theme.textMuted, fontSize: 14, marginTop: 8 }}>
            Beyond XSS: URL schemes, Trojan Source, PII, clickjacking, CSP, rate limiting, magic-byte MIME.
          </p>
        </div>

        <DemoSection
          title="sanitizeHref — URL allow-list"
          description="Blocks javascript:, vbscript:, data:text/html, file:. Accepts http(s), mailto, tel, relative URLs, fragments."
          theme={theme}
          code={`sanitizeHref('https://example.com')      // → 'https://example.com'
sanitizeHref('javascript:alert(1)')       // → null
sanitizeHref('data:text/html,<script>')   // → null
sanitizeHref('/relative/path')            // → '/relative/path'`}
        >
          <UrlDemo theme={theme} />
        </DemoSection>

        <DemoSection
          title="sanitizeUnicode — Trojan Source defense"
          description="Strips zero-width (U+200B…U+200F) and bidi-override (U+202A…U+202E) characters — the CVE-2021-42574 class of attacks."
          theme={theme}
          code={`sanitizeUnicode('admin\\u202Eexploit')
// → 'adminexploit'  (bidi override removed)

sanitizeUnicode('a\\u200Bb\\u200Cc')
// → 'abc'  (zero-width chars removed)`}
        >
          <UnicodeDemo theme={theme} />
        </DemoSection>

        <DemoSection
          title="scrubPII — redact sensitive data before LLMs / analytics"
          description="Catches SSN, credit cards, emails, phone numbers, and API keys. Use before forwarding user text to third-party services."
          theme={theme}
          code={`scrubPII('Email a@b.co, SSN 123-45-6789, key sk-abc123xyz456789abc')
// → 'Email [redacted-email], SSN [redacted-ssn], key [redacted-key]'`}
        >
          <PIIDemo theme={theme} />
        </DemoSection>

        <DemoSection
          title="buildTkxCSP — strict Content-Security-Policy header"
          description="Opinionated CSP that blocks XSS, clickjacking (frame-ancestors 'none'), form injection, and mixed content. Deploy via Next.js middleware or Express."
          theme={theme}
          code={`import { buildTkxCSP } from 'tekivex-ui';

res.setHeader('Content-Security-Policy', buildTkxCSP({
  scriptNonce: crypto.randomBytes(16).toString('base64'),
  imgHosts: ['https://cdn.example.com'],
}));`}
        >
          <CSPDemo theme={theme} />
        </DemoSection>

        <DemoSection
          title="isFramed + Clickjacking defense"
          description="Detects cross-origin iframe embedding. TkxModal and TkxDrawer dispatch tkx:framed-* events so your app can refuse interaction when redressed."
          theme={theme}
          code={`import { isFramed, installFrameBuster } from 'tekivex-ui';

if (isFramed()) {
  installFrameBuster(() => {
    console.warn('App loaded in hostile iframe — refusing to render');
  });
}`}
        >
          <FramedDemo theme={theme} />
        </DemoSection>

        <DemoSection
          title="createRateLimiter — client-side DoS guard"
          description="Token-bucket limiter for user-triggered actions. Use on form submit, file upload, API calls."
          theme={theme}
          code={`const rl = createRateLimiter(5, 1000); // 5 actions/sec

<TkxButton onClick={() => {
  if (!rl.check()) return toast({ title: 'Slow down!' });
  submitForm();
}}>Submit</TkxButton>`}
        >
          <RateLimiterDemo theme={theme} />
        </DemoSection>
      </div>

      {/* ── Competitor XSS Benchmark ──────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 999, background: `${theme.primary}18`, border: `1px solid ${theme.primary}33`, color: theme.primary, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 12 }}>
            🏆 INDUSTRY BENCHMARK
          </div>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 800, margin: 0, color: theme.text }}>
            XSS protection vs. other libraries
          </h2>
          <p style={{ color: theme.textMuted, fontSize: 14, marginTop: 8 }}>No other major React UI library sanitises props automatically. You're one malicious input away from XSS.</p>
        </div>

        <div style={{ borderRadius: 16, border: `1px solid ${theme.border}`, overflow: 'hidden', overflowX: 'auto', WebkitOverflowScrolling: 'touch' as CSSProperties['WebkitOverflowScrolling'] }}>
          <div style={{ minWidth: 640 }}>
            {[
              ['Feature', 'tekivex-ui', 'MUI', 'Shadcn/ui', 'Ant Design'],
              ['Auto-sanitise all text props', '✅', '❌', '❌', '❌'],
              ['Strip <script> injection', '✅', '❌ manual', '❌ manual', '❌ manual'],
              ['Block onerror / event attrs', '✅', '❌', '❌', '❌'],
              ['Block javascript: protocol', '✅', '❌', '❌', '❌'],
              ['Block data: URI injection', '✅', '❌', '❌', '❌'],
              ['Immutable security audit log', '✅', '❌', '❌', '❌'],
              ['Built-in WCAG contrast check', '✅', '🟡 MUI System', '❌', '❌'],
              ['CSP-compatible (no eval/blob)', '✅', '🟡 partial', '✅', '🟡 partial'],
              ['Security config required?', 'Zero config', 'Manual DOMPurify', 'Manual DOMPurify', 'Manual DOMPurify'],
            ].map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr',
                borderBottom: i < 9 ? `1px solid ${theme.border}` : 'none',
                background: i === 0 ? theme.surface : i % 2 === 0 ? `${theme.surfaceAlt}66` : 'transparent',
              }}>
                {row.map((cell, j) => (
                  <div key={j} style={{
                    padding: '13px 18px', fontSize: j === 0 ? 13 : 15,
                    fontWeight: i === 0 ? 700 : j === 1 ? 700 : 400,
                    color: i === 0 ? theme.textMuted : j === 1 ? theme.primary : theme.text,
                    textAlign: j === 0 ? 'left' : 'center',
                    borderLeft: j === 1 ? `2px solid ${theme.primary}33` : 'none',
                  }}>
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 12, textAlign: 'center' }}>
          ✅ = Built-in, automatic &nbsp;·&nbsp; 🟡 = Partial / opt-in &nbsp;·&nbsp; ❌ = Not included — developer must add manually
        </p>
      </div>
    </div>
  );
}
