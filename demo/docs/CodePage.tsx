import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxCode,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const CODE_PROPS = [
  { name: 'code', type: 'string', default: "''", description: 'The source code to display. Defaults to an empty string — a bare mount never crashes.' },
  { name: 'language', type: "'ts' | 'tsx' | 'js' | 'jsx' | 'json' | 'bash' | 'css' | 'html' | 'python' | 'text'", default: "'text'", description: "Language for highlighting. 'text' renders plain, with no token spans." },
  { name: 'showLineNumbers', type: 'boolean', default: 'false', description: 'Render a line-number gutter (aria-hidden, excluded from copy/selection).' },
  { name: 'highlightLines', type: 'number[]', default: 'undefined', description: '1-based line numbers to emphasise with a theme.primary-tinted row and left border.' },
  { name: 'copyable', type: 'boolean', default: 'true', description: 'Show a copy-to-clipboard button (floating, or in the filename header when one is set).' },
  { name: 'filename', type: 'string', default: 'undefined', description: 'Optional filename shown in a header bar above the code.' },
  { name: 'wrap', type: 'boolean', default: 'false', description: 'Soft-wrap long lines instead of horizontal scrolling.' },
  { name: 'maxHeight', type: 'number | string', default: 'undefined', description: 'Cap the height of the scrollable code area (number = px).' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles merged on the root wrapper.' },
];

// ── Sample snippets ───────────────────────────────────────────────────────────

const TS_SNIPPET = `import { createTheme, ThemeProvider } from 'tekivex-ui';

// Brand palette — the two highlighted lines matter most
const brandTheme = createTheme({
  primary: '#ff6b35',
  secondary: '#1d3557',
});

export function App({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={brandTheme}>{children}</ThemeProvider>;
}`;

const BASH_SNIPPET = `# Install and start the demo playground
npm install tekivex-ui
cd demo && npm run dev -- --port 5173
export TKX_ENV="development"`;

const JSON_SNIPPET = `{
  "name": "tekivex-ui",
  "sideEffects": false,
  "peerDependencies": { "react": ">=18" }
}`;

// ── Page ─────────────────────────────────────────────────────────────────────

export function CodePage({ theme }: { theme: ThemeTokens }) {
  const [copyable, setCopyable] = useState(true);

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.4.3 Contrast', level: 'AA', status: 'PASS' },
            { criterion: '1.1.1 Non-text Content', level: 'AA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxCode
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A zero-dependency, syntax-highlighted code block for docs and dev-tool UIs. A small
        line-based tokenizer emits React spans — never dangerouslySetInnerHTML — covering ten
        languages, with line numbers, line highlighting, filename headers, and copy-to-clipboard.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Security:</strong> tokens render as React text nodes, so untrusted
        snippets cannot inject markup. Token colours come exclusively from theme tokens —{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>keyword → primary</code>,{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>string → success</code>,{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>comment → textMuted</code>{' '}
        — no hardcoded hex.
      </p>

      {/* ── 1. TS with everything on ── */}
      <DemoSection
        title="TypeScript — Line Numbers, Highlighted Lines, Filename"
        description="showLineNumbers renders an aria-hidden gutter, highlightLines emphasises lines 5–6 with a theme.primary tint and left border, and filename adds a header bar that also hosts the copy button."
        theme={theme}
        code={`<TkxCode
  language="ts"
  filename="src/theme.tsx"
  showLineNumbers
  highlightLines={[5, 6]}
  code={tsSnippet}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxCode
            language="ts"
            filename="src/theme.tsx"
            showLineNumbers
            highlightLines={[5, 6]}
            code={TS_SNIPPET}
          />
        </div>
      </DemoSection>

      {/* ── 2. Bash ── */}
      <DemoSection
        title="Bash"
        description="The bash grammar highlights keywords, $VARIABLES, --flags, comments, and strings. Without a filename, the copy button floats in the top-right corner."
        theme={theme}
        code={`<TkxCode language="bash" code={bashSnippet} />`}
      >
        <div style={{ width: '100%' }}>
          <TkxCode language="bash" code={BASH_SNIPPET} />
        </div>
      </DemoSection>

      {/* ── 3. Copyable toggle ── */}
      <DemoSection
        title="Copyable Toggle"
        description="copyable defaults to true. Flip the checkbox to remove the copy affordance entirely — useful for illustrative fragments users should not paste verbatim."
        theme={theme}
        code={`const [copyable, setCopyable] = useState(true);

<TkxCode
  language="json"
  filename="package.json"
  copyable={copyable}
  code={jsonSnippet}
/>`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: theme.text, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={copyable}
              onChange={(e) => setCopyable(e.target.checked)}
            />
            copyable = {String(copyable)}
          </label>
          <TkxCode
            language="json"
            filename="package.json"
            copyable={copyable}
            code={JSON_SNIPPET}
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={CODE_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.1.1 Non-text Content" level="AA" status="PASS" />
        <WCAGBadge criterion="1.4.3 Contrast (Minimum)" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={{ borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt, padding: '20px 24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: '0 0 12px' }}>Labels & Non-visual Access</p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: '0 0 6px' }}>
          The <code>{'<code>'}</code> element carries an <code>aria-label</code> derived from the filename or language (e.g. "Code: src/theme.tsx"). Line numbers and highlight tints are <code>aria-hidden</code> decoration — they never enter the accessible text or clipboard copies.
        </p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: 0 }}>
          The copy button has <code>aria-label="Copy code"</code> and flips to a "Copied" state for 1.5 s. Clipboard access is feature-detected, so insecure contexts degrade silently instead of throwing.
        </p>
      </div>
    </div>
  );
}
