import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxTitle,
  TkxText,
  TkxParagraph,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const TITLE_PROPS = [
  { name: 'level', type: '1 | 2 | 3 | 4 | 5', default: '1', description: 'Heading level, maps to h1-h5 elements.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Content to render inside the heading.' },
  { name: 'copyable', type: 'boolean', default: 'false', description: 'Adds a copy-to-clipboard button after the text.' },
  { name: 'type', type: "'default' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Semantic color type for the heading.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root element.' },
];

const TEXT_PROPS = [
  { name: 'children', type: 'ReactNode', required: true, description: 'Content to render.' },
  { name: 'type', type: "'default' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Semantic color type.' },
  { name: 'strong', type: 'boolean', default: 'false', description: 'Wraps content in bold styling.' },
  { name: 'italic', type: 'boolean', default: 'false', description: 'Wraps content in italic styling.' },
  { name: 'underline', type: 'boolean', default: 'false', description: 'Adds underline decoration.' },
  { name: 'delete', type: 'boolean', default: 'false', description: 'Adds strikethrough decoration.' },
  { name: 'code', type: 'boolean', default: 'false', description: 'Renders content in a code/monospace style.' },
  { name: 'mark', type: 'boolean', default: 'false', description: 'Highlights text with a mark background.' },
  { name: 'copyable', type: 'boolean', default: 'false', description: 'Adds a copy-to-clipboard button after the text.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root element.' },
];

const PARAGRAPH_PROPS = [
  { name: 'children', type: 'ReactNode', required: true, description: 'Paragraph content.' },
  { name: 'type', type: "'default' | 'secondary'", default: "'default'", description: 'Color type for the paragraph.' },
  { name: 'copyable', type: 'boolean', default: 'false', description: 'Adds a copy-to-clipboard button.' },
  { name: 'ellipsis', type: 'boolean | { rows?: number }', default: 'false', description: 'Truncates content with ellipsis. Pass an object with rows to set the line clamp.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root element.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function TypographyPage({ theme }: { theme: ThemeTokens }) {
  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const sectionTitle = {
    fontSize: '20px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 8px',
  };

  const sectionDesc = {
    fontSize: '14px',
    color: theme.textMuted,
    margin: '0 0 24px',
    lineHeight: 1.6,
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: theme.text, margin: '0 0 8px' }}>
          Typography
        </h1>
        <p style={{ fontSize: '15px', color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>
          Title, Text, and Paragraph components for consistent, themeable text rendering.
        </p>
      </div>

      {/* ── Title Levels ── */}
      <h2 style={sectionTitle}>Title Levels</h2>
      <p style={sectionDesc}>TkxTitle supports 5 heading levels, mapping to h1 through h5.</p>

      <DemoSection
        title="All Title Levels"
        description="Use the level prop to control heading hierarchy."
        theme={theme}
        code={`<TkxTitle level={1}>Heading Level 1</TkxTitle>
<TkxTitle level={2}>Heading Level 2</TkxTitle>
<TkxTitle level={3}>Heading Level 3</TkxTitle>
<TkxTitle level={4}>Heading Level 4</TkxTitle>
<TkxTitle level={5}>Heading Level 5</TkxTitle>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <TkxTitle level={1}>Heading Level 1</TkxTitle>
          <TkxTitle level={2}>Heading Level 2</TkxTitle>
          <TkxTitle level={3}>Heading Level 3</TkxTitle>
          <TkxTitle level={4}>Heading Level 4</TkxTitle>
          <TkxTitle level={5}>Heading Level 5</TkxTitle>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Text Decorations ── */}
      <h2 style={sectionTitle}>Text Decorations</h2>
      <p style={sectionDesc}>TkxText supports multiple decoration props that can be combined.</p>

      <DemoSection
        title="All Decorations"
        description="Each boolean prop adds a different text decoration or style."
        theme={theme}
        code={`<TkxText strong>Strong text</TkxText>
<TkxText italic>Italic text</TkxText>
<TkxText underline>Underlined text</TkxText>
<TkxText delete>Deleted text</TkxText>
<TkxText code>Code text</TkxText>
<TkxText mark>Marked text</TkxText>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TkxText strong>Strong text</TkxText>
          <TkxText italic>Italic text</TkxText>
          <TkxText underline>Underlined text</TkxText>
          <TkxText delete>Deleted text</TkxText>
          <TkxText code>Code text</TkxText>
          <TkxText mark>Marked text</TkxText>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Paragraph ── */}
      <h2 style={sectionTitle}>Paragraph</h2>
      <p style={sectionDesc}>TkxParagraph handles block-level text with optional ellipsis truncation.</p>

      <DemoSection
        title="Basic Paragraph"
        description="Standard paragraph rendering with default styling."
        theme={theme}
        code={`<TkxParagraph>
  TekiVex UI provides a complete set of typography
  components designed for clarity and consistency
  across your application.
</TkxParagraph>`}
      >
        <TkxParagraph>
          TekiVex UI provides a complete set of typography components designed for clarity and
          consistency across your application. All text respects the active theme tokens and adapts
          automatically to light and dark modes.
        </TkxParagraph>
      </DemoSection>

      <DemoSection
        title="Ellipsis Paragraph"
        description="Use ellipsis to clamp long content to a specified number of rows."
        theme={theme}
        code={`<TkxParagraph ellipsis={{ rows: 2 }}>
  This is a long paragraph that will be truncated...
</TkxParagraph>`}
      >
        <div style={{ maxWidth: '400px' }}>
          <TkxParagraph ellipsis={{ rows: 2 }}>
            This is a long paragraph that will be truncated after two lines of text. TekiVex UI
            handles ellipsis via CSS line-clamp for optimal performance. The content gracefully
            degrades when the browser does not support the feature, ensuring that your users always
            have a good experience regardless of their platform.
          </TkxParagraph>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Copyable ── */}
      <h2 style={sectionTitle}>Copyable</h2>
      <p style={sectionDesc}>All typography components support the copyable prop for one-click copy.</p>

      <DemoSection
        title="Copyable Text"
        description="Click the copy icon to copy text to the clipboard."
        theme={theme}
        code={`<TkxTitle level={4} copyable>Copy this heading</TkxTitle>
<TkxText copyable>Copy this inline text</TkxText>
<TkxParagraph copyable>Copy this entire paragraph.</TkxParagraph>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TkxTitle level={4} copyable>Copy this heading</TkxTitle>
          <TkxText copyable>Copy this inline text</TkxText>
          <TkxParagraph copyable>Copy this entire paragraph.</TkxParagraph>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Tables ── */}
      <h2 style={sectionTitle}>TkxTitle Props</h2>
      <PropTable props={TITLE_PROPS} />

      <div style={{ marginTop: '32px' }}>
        <h2 style={sectionTitle}>TkxText Props</h2>
        <PropTable props={TEXT_PROPS} />
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2 style={sectionTitle}>TkxParagraph Props</h2>
        <PropTable props={PARAGRAPH_PROPS} />
      </div>
    </div>
  );
}
