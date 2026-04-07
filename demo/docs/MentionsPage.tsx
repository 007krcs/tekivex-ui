import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxMentions } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

const MENTIONS_PROPS = [
  { name: 'options', type: 'MentionOption[]', default: '—', description: 'List of mentionable users/items. Each has value, label, and optional avatar URL.', required: true },
  { name: 'value', type: 'string', default: "''", description: 'Controlled text content of the textarea.' },
  { name: 'onChange', type: '(value: string) => void', default: 'undefined', description: 'Called on every keystroke with the full text content.' },
  { name: 'trigger', type: 'string', default: "'@'", description: 'Character that triggers the mention dropdown.' },
  { name: 'placeholder', type: 'string', default: 'undefined', description: 'Placeholder text shown when the textarea is empty.' },
  { name: 'label', type: 'string', default: 'undefined', description: 'Accessible label rendered above the textarea.' },
];

const TEAM_MEMBERS = [
  { value: 'alice', label: 'Alice Johnson' },
  { value: 'bob', label: 'Bob Martinez' },
  { value: 'carol', label: 'Carol Kim' },
  { value: 'dave', label: 'Dave Chen' },
  { value: 'emma', label: 'Emma Wilson' },
  { value: 'frank', label: 'Frank O\'Brien' },
  { value: 'grace', label: 'Grace Patel' },
];

const TICKET_LABELS = [
  { value: 'bug', label: '#bug' },
  { value: 'feature', label: '#feature' },
  { value: 'docs', label: '#docs' },
  { value: 'design', label: '#design' },
  { value: 'urgent', label: '#urgent' },
  { value: 'review', label: '#review' },
];

export function MentionsPage({ theme }: { theme: ThemeTokens }) {
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [value3, setValue3] = useState('Hey @alice, can you look at ');

  const divider = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };
  const logBox = {
    marginTop: 12,
    padding: '10px 14px',
    borderRadius: 8,
    backgroundColor: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    fontSize: 13,
    color: theme.textMuted,
    fontFamily: 'monospace',
    minHeight: 40,
    whiteSpace: 'pre-wrap' as const,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Basic ───────────────────────────────────────────────────────── */}
      <DemoSection
        title="Basic Mentions"
        description="Type @ to trigger the mention dropdown. Use arrow keys to navigate, Enter or click to select. Keyboard-fully accessible."
        theme={theme}
        code={`<TkxMentions
  label="Comment"
  placeholder="Type @ to mention a team member..."
  options={[
    { value: 'alice', label: 'Alice Johnson' },
    { value: 'bob', label: 'Bob Martinez' },
    { value: 'carol', label: 'Carol Kim' },
  ]}
  value={value}
  onChange={setValue}
/>`}
      >
        <div>
          <TkxMentions
            label="Comment"
            placeholder="Type @ to mention a team member..."
            options={TEAM_MEMBERS}
            value={value1}
            onChange={setValue1}
          />
          {value1 && <div style={logBox}>{value1}</div>}
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Custom Trigger ──────────────────────────────────────────────── */}
      <DemoSection
        title="Custom Trigger Character"
        description="Use any character as the trigger. Here # triggers label suggestions — great for tagging issues, tickets, or topics."
        theme={theme}
        code={`<TkxMentions
  label="Add Labels"
  trigger="#"
  placeholder="Type # to add a label..."
  options={[
    { value: 'bug', label: '#bug' },
    { value: 'feature', label: '#feature' },
    { value: 'docs', label: '#docs' },
  ]}
  value={value}
  onChange={setValue}
/>`}
      >
        <div>
          <TkxMentions
            label="Add Labels"
            trigger="#"
            placeholder="Type # to add a label tag..."
            options={TICKET_LABELS}
            value={value2}
            onChange={setValue2}
          />
          {value2 && <div style={logBox}>{value2}</div>}
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Pre-filled ──────────────────────────────────────────────────── */}
      <DemoSection
        title="Pre-filled Value"
        description="Controlled mode with an initial value. Continue typing @ to mention more team members."
        theme={theme}
        code={`const [value, setValue] = useState('Hey @alice, can you look at ');

<TkxMentions
  label="Message"
  options={teamMembers}
  value={value}
  onChange={setValue}
  placeholder="Continue the message..."
/>`}
      >
        <div>
          <TkxMentions
            label="Message"
            options={TEAM_MEMBERS}
            value={value3}
            onChange={setValue3}
            placeholder="Continue the message..."
          />
          {value3 && <div style={logBox}>{value3}</div>}
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Use Cases ────────────────────────────────────────────────────── */}
      <div style={{ padding: '32px', borderRadius: 12, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: theme.text }}>💡 Common Use Cases</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { icon: '💬', title: 'Team Chat', desc: 'Mention colleagues in messages and comments' },
            { icon: '🎟️', title: 'Issue Trackers', desc: 'Tag assignees and label tickets with #hashtags' },
            { icon: '📝', title: 'Rich Text Editors', desc: 'Embed user references in documents' },
            { icon: '📧', title: 'Email Composers', desc: 'Quickly fill To/CC fields from a contact list' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: theme.text }}>{title}</p>
                <p style={{ margin: 0, fontSize: 12, color: theme.textMuted }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr style={divider} />

      {/* ── Props ──────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>TkxMentions Props</h3>
        <PropTable props={MENTIONS_PROPS} />
      </div>
    </div>
  );
}
