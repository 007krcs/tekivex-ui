import { useState, type CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { sanitizeString, meetsAA, meetsAAA, contrastRatio } from '../../src/headless';
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
        code={`import { sanitizeString } from '@tekivex/ui/headless';

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
        code={`import { sanitizeString } from '@tekivex/ui/headless';
const safe = sanitizeString(userInput);`}
      >
        <SanitizerPlayground theme={theme} />
      </DemoSection>

      <DemoSection
        title="WCAG AAA Contrast Checker"
        description="Built-in colour accessibility utilities. meetsAA() requires 4.5:1 ratio for normal text. meetsAAA() requires 7:1. Pick any two colours and see results instantly."
        theme={theme}
        code={`import { contrastRatio, meetsAA, meetsAAA } from '@tekivex/ui/headless';

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
import { Shield } from '@tekivex/ui';
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
