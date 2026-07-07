import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxTextarea,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const TEXTAREA_PROPS = [
  { name: 'label', type: 'string', required: true, description: 'Visible label rendered as a <label> element, associated via htmlFor/id.' },
  { name: 'id', type: 'string', default: 'auto', description: 'Explicit id for the textarea. Defaults to a React useId() value.' },
  { name: 'error', type: 'string', default: 'undefined', description: 'Error message shown below with role="alert". Sets aria-invalid and switches the border to theme.danger.' },
  { name: 'hint', type: 'string', default: 'undefined', description: 'Helper text below the textarea (hidden while an error is present).' },
  { name: 'isInvalid', type: 'boolean', default: 'false', description: 'Force the invalid visual state without providing an error string.' },
  { name: 'isRequired', type: 'boolean', default: 'false', description: 'Shows a red asterisk and sets aria-required on the textarea.' },
  { name: 'autoResize', type: 'boolean', default: 'false', description: 'Grow the textarea with its content between minRows and maxRows (disables manual resize).' },
  { name: 'minRows', type: 'number', default: '3', description: 'Minimum visible rows.' },
  { name: 'maxRows', type: 'number', default: '8', description: 'Maximum rows before the textarea starts scrolling (autoResize only).' },
  { name: 'showCount', type: 'boolean', default: 'false', description: 'Show a live "n / max" character counter (pairs with maxLength).' },
  { name: 'unicodeSafe', type: 'boolean', default: 'true', description: 'Strip zero-width and bidi-override Unicode on input (Trojan-Source defence).' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents interaction and reduces opacity to 60%.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root wrapper div.' },
  { name: '...rest', type: 'TextareaHTMLAttributes<HTMLTextAreaElement>', default: '—', description: 'All standard textarea attributes (value, onChange, placeholder, maxLength, etc.) are forwarded. rows and id are managed internally.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function TextareaPage({ theme }: { theme: ThemeTokens }) {
  const [bio, setBio] = useState('');
  const [notes, setNotes] = useState('');
  const [tweet, setTweet] = useState('');
  const [feedback, setFeedback] = useState('');

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '3.3.1 Error Identification', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxTextarea
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        The multi-line counterpart to TkxInput. Ships the same label / hint / error chrome plus
        auto-resize between minRows and maxRows, a live character counter, and Unicode
        sanitisation of zero-width and bidi-override characters by default.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> Uses a native{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<textarea>'}</code>{' '}
        with{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-invalid</code>,{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-required</code>{' '}
        and{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-describedby</code>{' '}
        wired to the hint, error, and counter.
      </p>

      {/* ── 1. Basic ── */}
      <DemoSection
        title="Basic Usage"
        description="Provide a label and standard textarea props. Defaults to 3 visible rows with a vertical manual-resize handle."
        theme={theme}
        code={`const [bio, setBio] = useState('');

<TkxTextarea
  label="Bio"
  placeholder="Tell us about yourself…"
  hint="A short introduction shown on your public profile."
  value={bio}
  onChange={(e) => setBio(e.target.value)}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <TkxTextarea
            label="Bio"
            placeholder="Tell us about yourself…"
            hint="A short introduction shown on your public profile."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      </DemoSection>

      {/* ── 2. Auto-resize ── */}
      <DemoSection
        title="Auto-Resize (minRows / maxRows)"
        description="autoResize grows the textarea with its content — start typing multiple lines. It begins at minRows (2 here) and scrolls internally once it reaches maxRows (6). Manual resize is disabled in this mode."
        theme={theme}
        code={`<TkxTextarea
  label="Meeting notes"
  autoResize
  minRows={2}
  maxRows={6}
  placeholder="Type several lines to watch it grow…"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <TkxTextarea
            label="Meeting notes"
            autoResize
            minRows={2}
            maxRows={6}
            placeholder="Type several lines to watch it grow…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
            {notes.split('\n').length} line{notes.split('\n').length !== 1 ? 's' : ''} — grows to 6 rows, then scrolls
          </p>
        </div>
      </DemoSection>

      {/* ── 3. Character counter ── */}
      <DemoSection
        title="Character Counter (showCount + maxLength)"
        description="showCount renders a live 'n / max' counter below the textarea. The counter turns theme.danger when the limit is reached, and maxLength hard-stops further input."
        theme={theme}
        code={`<TkxTextarea
  label="Post"
  showCount
  maxLength={140}
  placeholder="What's happening? (140 chars max)"
  value={tweet}
  onChange={(e) => setTweet(e.target.value)}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <TkxTextarea
            label="Post"
            showCount
            maxLength={140}
            placeholder="What's happening? (140 chars max)"
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
          />
        </div>
      </DemoSection>

      {/* ── 4. Error / required ── */}
      <DemoSection
        title="Error & Required State"
        description="isRequired adds a red asterisk and aria-required. Passing an error string switches the border to theme.danger, sets aria-invalid, and announces the message via role='alert'. The error clears once you type."
        theme={theme}
        code={`<TkxTextarea
  label="Feedback"
  isRequired
  placeholder="Please share your feedback…"
  error={feedback.trim() === '' ? 'Feedback cannot be empty.' : undefined}
  value={feedback}
  onChange={(e) => setFeedback(e.target.value)}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <TkxTextarea
            label="Feedback"
            isRequired
            placeholder="Please share your feedback…"
            error={feedback.trim() === '' ? 'Feedback cannot be empty.' : undefined}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={TEXTAREA_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="3.3.1 Error Identification" level="AA" status="PASS" />
        <WCAGBadge criterion="3.3.2 Labels or Instructions" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={{ borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt, padding: '20px 24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: '0 0 12px' }}>Descriptions & Announcements</p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: '0 0 6px' }}>
          The hint, error, and character counter are all joined into <code>aria-describedby</code>, so screen readers read them after the label. Errors use <code>role="alert"</code> for immediate announcement.
        </p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: 0 }}>
          <code>unicodeSafe</code> (default on) strips zero-width and bidi-override characters as the user types — set it to <code>false</code> only for inputs that legitimately need such characters, e.g. translation UIs.
        </p>
      </div>
    </div>
  );
}
