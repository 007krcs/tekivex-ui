import type { ThemeTokens } from 'tekivex-ui';
import { TkxRichTextDisplay } from 'tekivex-ui';
import type { RichTextBlock } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Sample blocks ────────────────────────────────────────────────────────────

const ALL_BLOCKS: RichTextBlock[] = [
  { type: 'heading', content: 'Getting Started', level: 1 },
  {
    type: 'paragraph',
    content:
      'TkxRichTextDisplay renders an array of structured blocks into styled HTML. It supports headings, paragraphs, code, blockquotes, lists, callouts, and dividers.',
  },
  { type: 'heading', content: 'Installation', level: 2 },
  {
    type: 'code',
    content: 'npm install tekivex-ui',
    language: 'bash',
  },
  { type: 'divider' },
  { type: 'heading', content: 'Features', level: 2 },
  {
    type: 'list',
    items: [
      'Structured block-based content model',
      'Syntax highlighting for code blocks',
      'Four callout variants: info, warning, success, danger',
      'Ordered and unordered lists',
    ],
    ordered: false,
  },
  {
    type: 'blockquote',
    content: 'Good design is as little design as possible. Less, but better.',
  },
  {
    type: 'callout',
    content: 'This is an informational callout providing helpful context.',
    variant: 'info',
  },
  {
    type: 'callout',
    content: 'Warning: this action cannot be undone once confirmed.',
    variant: 'warning',
  },
  {
    type: 'callout',
    content: 'Success! Your changes have been saved.',
    variant: 'success',
  },
  {
    type: 'callout',
    content: 'Error: unable to connect to the server. Please try again.',
    variant: 'danger',
  },
];

const HEADING_BLOCKS: RichTextBlock[] = [
  { type: 'heading', content: 'Heading Level 1', level: 1 },
  { type: 'heading', content: 'Heading Level 2', level: 2 },
  { type: 'heading', content: 'Heading Level 3', level: 3 },
  { type: 'paragraph', content: 'Regular paragraph text for comparison.' },
];

const CODE_BLOCK: RichTextBlock[] = [
  { type: 'heading', content: 'Code Example', level: 3 },
  {
    type: 'code',
    content: `import { TkxRichTextDisplay } from 'tekivex-ui';

const blocks = [
  { type: 'heading', content: 'Hello', level: 1 },
  { type: 'paragraph', content: 'World' },
];

<TkxRichTextDisplay blocks={blocks} />`,
    language: 'tsx',
  },
];

const LIST_BLOCKS: RichTextBlock[] = [
  { type: 'heading', content: 'Ordered List', level: 3 },
  {
    type: 'list',
    items: ['Clone the repository', 'Install dependencies', 'Run the dev server', 'Open the browser'],
    ordered: true,
  },
  { type: 'heading', content: 'Unordered List', level: 3 },
  {
    type: 'list',
    items: ['React 18+', 'TypeScript support', 'Tree-shakable exports'],
    ordered: false,
  },
];

// ── Props definitions ────────────────────────────────────────────────────────

const RICH_TEXT_PROPS = [
  { name: 'blocks', type: 'RichTextBlock[]', description: 'Array of content blocks to render.', required: true },
  { name: 'className', type: 'string', default: 'undefined', description: 'Additional class name for the wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles for the wrapper.' },
];

const BLOCK_PROPS = [
  { name: 'type', type: "'heading' | 'paragraph' | 'blockquote' | 'code' | 'list' | 'divider' | 'image' | 'callout'", description: 'The block type to render.', required: true },
  { name: 'content', type: 'string', default: 'undefined', description: 'Text content for heading, paragraph, blockquote, code, and callout blocks.' },
  { name: 'level', type: '1 | 2 | 3', default: '1', description: 'Heading level (only used when type is "heading").' },
  { name: 'language', type: 'string', default: 'undefined', description: 'Language hint for code blocks.' },
  { name: 'items', type: 'string[]', default: 'undefined', description: 'List items (only used when type is "list").' },
  { name: 'ordered', type: 'boolean', default: 'false', description: 'Use ordered numbering for list blocks.' },
  { name: 'src', type: 'string', default: 'undefined', description: 'Image source URL (only used when type is "image").' },
  { name: 'alt', type: 'string', default: 'undefined', description: 'Image alt text.' },
  { name: 'variant', type: "'info' | 'warning' | 'success' | 'danger'", default: "'info'", description: 'Callout variant with distinct icon and color.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function RichTextDisplayPage({ theme }: { theme: ThemeTokens }) {
  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Full Example ───────────────────────────────────────────────── */}

      <DemoSection
        title="Rich Text Display"
        description="Renders structured blocks including headings, paragraphs, code, blockquotes, lists, callouts, and dividers."
        theme={theme}
        code={`<TkxRichTextDisplay
  blocks={[
    { type: 'heading', content: 'Getting Started', level: 1 },
    { type: 'paragraph', content: 'Introductory text...' },
    { type: 'code', content: 'npm install tekivex-ui', language: 'bash' },
    { type: 'divider' },
    { type: 'list', items: ['Item A', 'Item B'], ordered: false },
    { type: 'blockquote', content: 'A notable quote.' },
    { type: 'callout', content: 'Helpful info.', variant: 'info' },
    { type: 'callout', content: 'A warning.', variant: 'warning' },
    { type: 'callout', content: 'All good!', variant: 'success' },
    { type: 'callout', content: 'Something failed.', variant: 'danger' },
  ]}
/>`}
      >
        <TkxRichTextDisplay blocks={ALL_BLOCKS} />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Headings ───────────────────────────────────────────────────── */}

      <DemoSection
        title="Headings"
        description="Three heading levels with distinct sizes and weights."
        theme={theme}
        code={`<TkxRichTextDisplay
  blocks={[
    { type: 'heading', content: 'Level 1', level: 1 },
    { type: 'heading', content: 'Level 2', level: 2 },
    { type: 'heading', content: 'Level 3', level: 3 },
  ]}
/>`}
      >
        <TkxRichTextDisplay blocks={HEADING_BLOCKS} />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Code Block ─────────────────────────────────────────────────── */}

      <DemoSection
        title="Code Block"
        description="Renders a monospace code block with an optional language hint."
        theme={theme}
        code={`<TkxRichTextDisplay
  blocks={[
    { type: 'code', content: 'const x = 42;', language: 'tsx' },
  ]}
/>`}
      >
        <TkxRichTextDisplay blocks={CODE_BLOCK} />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Lists ──────────────────────────────────────────────────────── */}

      <DemoSection
        title="Lists"
        description="Ordered and unordered lists rendered from an items array."
        theme={theme}
        code={`<TkxRichTextDisplay
  blocks={[
    { type: 'list', items: ['Step 1', 'Step 2'], ordered: true },
    { type: 'list', items: ['React', 'TypeScript'], ordered: false },
  ]}
/>`}
      >
        <TkxRichTextDisplay blocks={LIST_BLOCKS} />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props table ────────────────────────────────────────────────── */}

      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxRichTextDisplay Props
        </h3>
        <PropTable props={RICH_TEXT_PROPS} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          RichTextBlock Props
        </h3>
        <PropTable props={BLOCK_PROPS} />
      </div>
    </div>
  );
}
