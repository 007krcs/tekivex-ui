import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
// AI components live in the experimental surface — opt-in via tekivex-ui/experimental.
import { TkxAIConfidenceBar, TkxAIChatBubble, TkxAIThinking } from '../../src/experimental';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

const EXPERIMENTAL_BANNER = {
  background: 'rgba(247, 37, 133, 0.10)',
  border: '1px solid rgba(247, 37, 133, 0.45)',
  color: '#f72585',
  padding: '12px 16px',
  borderRadius: 8,
  marginBottom: 24,
  fontSize: 14,
  fontWeight: 500,
} as const;

interface Props { theme: ThemeTokens }

const CHAT_MESSAGES = [
  { role: 'user' as const, content: 'What validation rules does the "email" field need?', name: 'You' },
  { role: 'assistant' as const, content: 'The email field needs: required, type="email" with regex /^[^@]+@[^@]+\\.[^@]+$/, max length 254 (RFC 5321), and a clear error message. I\'ve also detected it should be paired with a confirmation field based on your form structure.', name: 'Quantum AI', confidence: 94 },
  { role: 'user' as const, content: 'Add a phone field too.', name: 'You' },
  { role: 'assistant' as const, content: 'Added TkxInput type="tel" with international E.164 format validation. Auto-detected region from browser locale — defaulting to US (+1). You can override with the locale prop.', name: 'Quantum AI', confidence: 78 },
];

const THINKING_STEPS = [
  'Analysing field names…',
  'Running Boltzmann inference…',
  'Applying Amplitude Amplification…',
  'Resolving entangled fields…',
  'Generating validation rules…',
];

export function AIComponentsPage({ theme }: Props) {
  const [confidence1, setConfidence1] = useState(87);
  const [thinkingActive, setThinkingActive] = useState(true);
  const [streamKey, setStreamKey] = useState(0);

  const sectionStyle = { maxWidth: 900, margin: '0 auto', padding: '40px 32px' };

  return (
    <div style={sectionStyle}>
      {/* Experimental banner — surface API instability up front */}
      <div role="alert" style={EXPERIMENTAL_BANNER}>
        ⚠ <strong>Experimental.</strong> These components live in the
        <code style={{ background: 'rgba(247,37,133,0.15)', padding: '2px 6px', borderRadius: 4, margin: '0 4px' }}>
          tekivex-ui/experimental
        </code>
        subpath. The API may change or be removed between minor versions — pin your version explicitly.
      </div>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 999,
          background: `${theme.primary}18`, border: `1px solid ${theme.primary}33`,
          color: theme.primary, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.06em', marginBottom: 16,
        }}>
          ⚛ AI-NATIVE COMPONENTS · EXPERIMENTAL
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          AI-Native UI Components
        </h1>
        <p style={{ fontSize: 16, color: theme.textMuted, lineHeight: 1.7, margin: 0, maxWidth: 680 }}>
          First-class primitives for building AI-powered interfaces. Confidence bars, streaming chat bubbles,
          and thinking indicators — all accessible, themeable, and XSS-safe.
          No other React library ships these out-of-the-box.
        </p>
      </div>

      {/* ── TkxAIConfidenceBar ─────────────────────────────────────── */}
      <DemoSection
        title="TkxAIConfidenceBar"
        description="Visualise AI model confidence scores with animated fill, color-coded levels, and accessible meter semantics."
        theme={theme}
        code={`import { TkxAIConfidenceBar } from 'tekivex-ui';

<TkxAIConfidenceBar value={94} label="Field type inference" />
<TkxAIConfidenceBar value={67} label="Validation rules" size="lg" />
<TkxAIConfidenceBar value={28} label="Locale detection" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 460 }}>
          <TkxAIConfidenceBar value={confidence1} label="Field type inference" size="lg" />
          <TkxAIConfidenceBar value={67} label="Validation rules" />
          <TkxAIConfidenceBar value={28} label="Locale detection" size="sm" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: theme.textMuted }}>Drag to adjust:</span>
            <input
              type="range" min={0} max={100} value={confidence1}
              onChange={e => setConfidence1(Number(e.target.value))}
              style={{ flex: 1, accentColor: theme.primary }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.primary, minWidth: 36 }}>{confidence1}%</span>
          </div>
        </div>
      </DemoSection>

      <PropTable
        theme={theme}
        title="TkxAIConfidenceBar props"
        rows={[
          { prop: 'value', type: 'number', description: '0–100 confidence percentage (required).' },
          { prop: 'label', type: 'string', description: 'Descriptive label for the metric being measured.' },
          { prop: 'showLabel', type: 'boolean', defaultValue: 'true', description: 'Show the numeric percentage on the right.' },
          { prop: 'size', type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: 'Bar height — 4px / 8px / 12px.' },
          { prop: 'animate', type: 'boolean', defaultValue: 'true', description: 'Animate the fill from 0 on mount.' },
        ]}
      />

      {/* ── TkxAIChatBubble ────────────────────────────────────────── */}
      <DemoSection
        title="TkxAIChatBubble"
        description="Styled chat message bubbles for user/assistant/system roles. Supports streaming typewriter effect, inline confidence bars, and copy-to-clipboard."
        theme={theme}
        code={`import { TkxAIChatBubble } from 'tekivex-ui';

<TkxAIChatBubble
  role="user"
  content="What validation rules does the email field need?"
  name="You"
/>
<TkxAIChatBubble
  role="assistant"
  content="The email field needs: required, type=email…"
  name="Quantum AI"
  confidence={94}
  copyable
  streaming   // typewriter effect on mount
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 560 }}>
          {CHAT_MESSAGES.map((msg, i) => (
            <TkxAIChatBubble
              key={`${i}-${streamKey}`}
              role={msg.role}
              content={msg.content}
              name={msg.name}
              confidence={msg.confidence}
              streaming={msg.role === 'assistant'}
              copyable={msg.role === 'assistant'}
              timestamp={new Date(Date.now() - (CHAT_MESSAGES.length - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
          ))}
          <button
            onClick={() => setStreamKey(k => k + 1)}
            style={{
              alignSelf: 'center', marginTop: 4,
              padding: '7px 18px', borderRadius: 8, border: `1px solid ${theme.border}`,
              background: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 13,
            }}
          >
            ↺ Replay streaming
          </button>
        </div>
      </DemoSection>

      <PropTable
        theme={theme}
        title="TkxAIChatBubble props"
        rows={[
          { prop: 'role', type: '"user" | "assistant" | "system"', description: 'Controls alignment and style of the bubble (required).' },
          { prop: 'content', type: 'string | ReactNode', description: 'Message content. Strings are automatically XSS-sanitized.' },
          { prop: 'streaming', type: 'boolean', defaultValue: 'false', description: 'Animate text in character-by-character on mount.' },
          { prop: 'confidence', type: 'number', description: '0–100 — renders a mini confidence bar below assistant bubbles.' },
          { prop: 'avatar', type: 'string', description: 'Avatar image URL. Fallback to initials from `name`.' },
          { prop: 'name', type: 'string', description: 'Display name shown above the bubble.' },
          { prop: 'timestamp', type: 'string', description: 'Timestamp string shown above the bubble.' },
          { prop: 'copyable', type: 'boolean', defaultValue: 'false', description: 'Show copy-to-clipboard icon (assistant bubbles only).' },
        ]}
      />

      {/* ── TkxAIThinking ─────────────────────────────────────────── */}
      <DemoSection
        title="TkxAIThinking"
        description="Show while your AI model is processing. Four visual variants: dots, pulse, wave, orbit. Supports animated step-through text for detailed status."
        theme={theme}
        code={`import { TkxAIThinking } from 'tekivex-ui';

// Simple
<TkxAIThinking label="Thinking…" variant="dots" />

// With steps (rotates through each step while active)
<TkxAIThinking
  variant="orbit"
  active={isThinking}
  steps={[
    'Analysing field names…',
    'Running Boltzmann inference…',
    'Resolving entangled fields…',
    'Generating validation rules…',
  ]}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {(['dots', 'pulse', 'wave', 'orbit'] as const).map(v => (
              <div key={v} style={{ padding: '16px 20px', borderRadius: 12, border: `1px solid ${theme.border}`, background: `${theme.surface}cc` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{v}</div>
                <TkxAIThinking variant={v} active={thinkingActive} />
              </div>
            ))}
          </div>

          <div style={{ padding: '20px 24px', borderRadius: 12, border: `1px solid ${theme.primary}33`, background: `${theme.primary}08` }}>
            <TkxAIThinking
              variant="orbit"
              size="lg"
              active={thinkingActive}
              steps={THINKING_STEPS}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setThinkingActive(a => !a)}
              style={{
                padding: '8px 20px', borderRadius: 8,
                background: thinkingActive ? `${theme.primary}22` : '#10b98122',
                border: `1px solid ${thinkingActive ? theme.primary + '44' : '#10b98144'}`,
                color: thinkingActive ? theme.primary : '#10b981',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              {thinkingActive ? '⏸ Pause (set active=false)' : '▶ Resume (set active=true)'}
            </button>
          </div>
        </div>
      </DemoSection>

      <PropTable
        theme={theme}
        title="TkxAIThinking props"
        rows={[
          { prop: 'active', type: 'boolean', defaultValue: 'true', description: 'When false, shows a done checkmark instead of the indicator.' },
          { prop: 'variant', type: '"dots" | "pulse" | "wave" | "orbit"', defaultValue: '"dots"', description: 'Visual style of the thinking indicator.' },
          { prop: 'label', type: 'string', defaultValue: '"Thinking…"', description: 'Text shown while active (used when no steps provided).' },
          { prop: 'steps', type: 'string[]', description: 'Rotating step descriptions — animates through each one while active.' },
          { prop: 'size', type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: 'Font and indicator size.' },
        ]}
      />

      {/* Install */}
      <div style={{ marginTop: 48, padding: '28px 32px', borderRadius: 16, background: `${theme.surface}cc`, border: `1px solid ${theme.border}` }}>
        <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: theme.primary }}>⚛ Import</p>
        <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 13, color: theme.text, lineHeight: 1.7 }}>
{`import {
  TkxAIConfidenceBar,
  TkxAIChatBubble,
  TkxAIThinking,
} from 'tekivex-ui';`}
        </pre>
      </div>
    </div>
  );
}
