import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxTag,
  TkxTagInput,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const TAG_PROPS = [
  { name: 'children', type: 'ReactNode', required: true, description: 'Label text or content displayed inside the tag.' },
  { name: 'variant', type: "'solid' | 'outline' | 'subtle'", default: "'subtle'", description: 'Visual treatment of the tag.' },
  { name: 'colorScheme', type: "'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'default'", default: "'default'", description: 'Theme color applied to the tag.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls padding, font size, and icon size.' },
  { name: 'onRemove', type: '() => void', default: 'undefined', description: 'When provided, renders a × button that calls this callback. Button has aria-label="Remove [tag text]".' },
  { name: 'leftIcon', type: 'ReactNode', default: 'undefined', description: 'Icon displayed to the left of the label.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents interaction with the remove button.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the root span/div.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles on the root element.' },
];

const TAG_INPUT_PROPS = [
  { name: 'value', type: 'string[]', required: true, description: 'Controlled array of tag strings.' },
  { name: 'onChange', type: '(tags: string[]) => void', required: true, description: 'Callback with the updated tag array.' },
  { name: 'label', type: 'string', required: true, description: 'Accessible label for the input field.' },
  { name: 'placeholder', type: 'string', default: "'Add tag…'", description: 'Placeholder shown in the text input.' },
  { name: 'delimiters', type: "string[]", default: "['Enter', ',']", description: 'Keys that confirm a new tag. Default: Enter and comma.' },
  { name: 'maxTags', type: 'number', default: 'undefined', description: 'Maximum number of tags allowed.' },
  { name: 'allowDuplicates', type: 'boolean', default: 'false', description: 'Allow adding duplicate tag values.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents all interaction.' },
  { name: 'error', type: 'string', default: 'undefined', description: 'Validation error message linked via aria-describedby.' },
  { name: 'hint', type: 'string', default: 'undefined', description: 'Helper text shown below the input.' },
  { name: 'tagProps', type: 'Partial<TkxTagProps>', default: 'undefined', description: 'Props forwarded to each TkxTag rendered inside the input.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function TagPage({ theme }: { theme: ThemeTokens }) {
  const [removableTags, setRemovableTags] = useState(['React', 'TypeScript', 'WCAG']);
  const [inputTags, setInputTags] = useState<string[]>(['accessibility', 'components']);
  const [techTags, setTechTags] = useState<string[]>([]);

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const noteBoxStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    padding: '20px 24px',
    marginBottom: '24px',
  };

  const noteHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 12px',
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.4.3 Contrast', level: 'AAA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxTag &amp; TkxTagInput
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        TkxTag is a compact label for categorization, statuses, and metadata. TkxTagInput is a full-featured
        tag management input that allows users to create and remove tags by typing and pressing Enter (or comma).
        All remove buttons have explicit{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-label</code>{' '}
        values for screen readers.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Keyboard:</strong> In TkxTagInput, press Backspace on an empty
        input to remove the last tag. Press Delete or Backspace when a tag is focused to remove it.
      </p>

      {/* ── 1. All Variants ── */}
      <DemoSection
        title="TkxTag Variants"
        description="Three visual treatments — subtle (low-contrast fill), outline (border only), and solid (high-contrast filled). Subtle is the default and suits most labeling contexts."
        theme={theme}
        code={`<TkxTag variant="subtle">Subtle</TkxTag>
<TkxTag variant="outline">Outline</TkxTag>
<TkxTag variant="solid">Solid</TkxTag>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(['subtle', 'outline', 'solid'] as const).map((variant) => (
            <div key={variant} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: theme.textMuted, minWidth: '56px' }}>{variant}</span>
              <TkxTag variant={variant} colorScheme="primary">Primary</TkxTag>
              <TkxTag variant={variant} colorScheme="secondary">Secondary</TkxTag>
              <TkxTag variant={variant} colorScheme="success">Success</TkxTag>
              <TkxTag variant={variant} colorScheme="warning">Warning</TkxTag>
              <TkxTag variant={variant} colorScheme="danger">Danger</TkxTag>
              <TkxTag variant={variant} colorScheme="default">Default</TkxTag>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── 2. All Color Schemes ── */}
      <DemoSection
        title="Color Schemes"
        description="Six color schemes map to theme tokens. All combinations of variant × colorScheme maintain WCAG AAA contrast ratios."
        theme={theme}
        code={`<TkxTag colorScheme="primary">React</TkxTag>
<TkxTag colorScheme="success">Published</TkxTag>
<TkxTag colorScheme="warning">In Review</TkxTag>
<TkxTag colorScheme="danger">Rejected</TkxTag>
<TkxTag colorScheme="secondary">Draft</TkxTag>
<TkxTag colorScheme="default">v2.0.0</TkxTag>`}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <TkxTag colorScheme="primary">React</TkxTag>
          <TkxTag colorScheme="success">Published</TkxTag>
          <TkxTag colorScheme="warning">In Review</TkxTag>
          <TkxTag colorScheme="danger">Deprecated</TkxTag>
          <TkxTag colorScheme="secondary">Beta</TkxTag>
          <TkxTag colorScheme="default">v2.0.0</TkxTag>
          <TkxTag colorScheme="primary" variant="solid">New</TkxTag>
          <TkxTag colorScheme="success" variant="solid">Stable</TkxTag>
        </div>
      </DemoSection>

      {/* ── 3. Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Three sizes adjust padding, font size, and icon dimensions. Use sm for compact data-dense UIs, lg for prominent labels in hero areas."
        theme={theme}
        code={`<TkxTag size="sm">Small</TkxTag>
<TkxTag size="md">Medium</TkxTag>
<TkxTag size="lg">Large</TkxTag>`}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <TkxTag size="sm" colorScheme="primary">Small</TkxTag>
          <TkxTag size="md" colorScheme="primary">Medium</TkxTag>
          <TkxTag size="lg" colorScheme="primary">Large</TkxTag>
        </div>
      </DemoSection>

      {/* ── 4. With Remove Button ── */}
      <DemoSection
        title="With Remove Button"
        description="Provide onRemove to add a × button. The remove button receives aria-label='Remove [tag text]' so screen readers can identify which tag will be removed."
        theme={theme}
        code={`const [tags, setTags] = useState(['React', 'TypeScript', 'WCAG']);

{tags.map((tag) => (
  <TkxTag
    key={tag}
    colorScheme="primary"
    onRemove={() => setTags(t => t.filter(x => x !== tag))}
  >
    {tag}
  </TkxTag>
))}`}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {removableTags.map((tag) => (
            <TkxTag
              key={tag}
              colorScheme="primary"
              onRemove={() => setRemovableTags((t) => t.filter((x) => x !== tag))}
            >
              {tag}
            </TkxTag>
          ))}
          {removableTags.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: theme.textMuted }}>All tags removed.</span>
              <button
                onClick={() => setRemovableTags(['React', 'TypeScript', 'WCAG'])}
                style={{ fontSize: '13px', color: theme.primary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </DemoSection>

      {/* ── 5. TkxTagInput ── */}
      <DemoSection
        title="TkxTagInput — Live Demo"
        description="Type a tag name and press Enter or comma to add it. Click the × on any tag or press Backspace on an empty input to remove the last tag. Duplicate tags are rejected by default."
        theme={theme}
        code={`const [tags, setTags] = useState<string[]>(['accessibility', 'components']);

<TkxTagInput
  label="Topics"
  value={tags}
  onChange={setTags}
  placeholder="Add a topic…"
  hint="Press Enter or comma to add. Backspace removes the last tag."
/>`}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <TkxTagInput
            label="Topics"
            value={inputTags}
            onChange={setInputTags}
            placeholder="Add a topic…"
            hint="Press Enter or comma to add. Backspace removes the last tag."
          />
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
            {inputTags.length} tag(s): {inputTags.join(', ') || 'none'}
          </p>
        </div>
      </DemoSection>

      {/* ── 6. TkxTagInput with maxTags ── */}
      <DemoSection
        title="TkxTagInput — Max Tags"
        description="Set maxTags to limit how many tags can be added. The input is automatically disabled and a hint message is shown when the limit is reached."
        theme={theme}
        code={`<TkxTagInput
  label="Skills (max 5)"
  value={tags}
  onChange={setTags}
  maxTags={5}
  placeholder="Add a skill…"
  hint="Add up to 5 skills"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <TkxTagInput
            label="Skills (max 5)"
            value={techTags}
            onChange={setTechTags}
            maxTags={5}
            placeholder="Add a skill…"
            hint={techTags.length >= 5 ? 'Maximum 5 skills reached.' : `Add up to 5 skills (${techTags.length}/5 added)`}
            tagProps={{ colorScheme: 'success', variant: 'subtle' }}
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Tables */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        TkxTag Props
      </h2>
      <div style={{ marginBottom: '40px' }}>
        <PropTable props={TAG_PROPS} />
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        TkxTagInput Props
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={TAG_INPUT_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.4.3 Contrast (Minimum)" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Remove Button Labels</p>
        <p style={noteItemStyle}>The × remove button on each tag has an auto-generated <code>aria-label</code>: "Remove React", "Remove TypeScript", etc. This allows screen reader users to identify exactly which tag they are about to remove without needing surrounding context.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>TkxTagInput Live Announcements</p>
        <p style={noteItemStyle}>When a tag is added or removed in TkxTagInput, a live region announces the action: "React added" or "TypeScript removed, 2 tags remaining". This keeps screen reader users informed without requiring them to navigate away from the input.</p>
      </div>
    </div>
  );
}
