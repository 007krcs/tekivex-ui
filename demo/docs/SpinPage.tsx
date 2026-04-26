import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxSpin, TkxButton } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const SPIN_PROPS = [
  { name: 'spinning', type: 'boolean', default: 'true', description: 'Whether the spinner is currently active.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the spinner. Controls diameter and border width.' },
  { name: 'tip', type: 'string', default: 'undefined', description: 'Descriptive text shown below the spinner.' },
  { name: 'indicator', type: 'ReactNode', default: 'undefined', description: 'Custom spinner element to replace the default rotating circle.' },
  { name: 'children', type: 'ReactNode', default: 'undefined', description: 'When provided, the spin wraps this content and overlays the spinner on top.' },
  { name: 'fullscreen', type: 'boolean', default: 'false', description: 'Shows the spinner in a fixed fullscreen overlay.' },
  { name: 'delay', type: 'number', default: 'undefined', description: 'Delay in ms before the spinner appears. Prevents flicker for fast operations.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root element.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function SpinPage({ theme }: { theme: ThemeTokens }) {
  const [wrapperSpinning, setWrapperSpinning] = useState(true);
  const [delaySpinning, setDelaySpinning] = useState(false);

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

  const cardStyle = {
    padding: '24px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: theme.text, margin: '0 0 8px' }}>
          Spin
        </h1>
        <p style={{ fontSize: '15px', color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>
          A loading spinner for indicating async operations. Supports wrapping content, sizing, tips, and delay.
        </p>
      </div>

      {/* ── Sizes ── */}
      <h2 style={sectionTitle}>Sizes</h2>
      <p style={sectionDesc}>Three built-in sizes: sm, md, and lg.</p>

      <DemoSection
        title="Spinner Sizes"
        description="Use the size prop to control the diameter of the spinner."
        theme={theme}
        code={`<TkxSpin size="sm" />
<TkxSpin size="md" />
<TkxSpin size="lg" />`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <TkxSpin size="sm" />
          <TkxSpin size="md" />
          <TkxSpin size="lg" />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── With Tip ── */}
      <h2 style={sectionTitle}>With Tip</h2>
      <p style={sectionDesc}>Add descriptive text below the spinner with the tip prop.</p>

      <DemoSection
        title="Tip Text"
        description="A tip provides context about the loading operation."
        theme={theme}
        code={`<TkxSpin tip="Loading data..." />
<TkxSpin tip="Processing..." size="lg" />`}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '48px' }}>
          <TkxSpin tip="Loading data..." />
          <TkxSpin tip="Processing..." size="lg" />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Wrapper Mode ── */}
      <h2 style={sectionTitle}>Wrapper Mode</h2>
      <p style={sectionDesc}>Wrap content with TkxSpin to overlay the spinner on top.</p>

      <DemoSection
        title="Spinning Over Content"
        description="Toggle the spinner to see the overlay effect."
        theme={theme}
        code={`<TkxSpin spinning={spinning} tip="Refreshing...">
  <div style={{ padding: '24px', border: '1px solid ...' }}>
    <p>Some content that is loading</p>
    <p>The spinner overlays this area</p>
  </div>
</TkxSpin>
<TkxButton onClick={() => setSpinning(!spinning)}>
  Toggle Spin
</TkxButton>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TkxSpin spinning={wrapperSpinning} tip="Refreshing...">
            <div style={cardStyle}>
              <p style={{ color: theme.text, margin: '0 0 8px' }}>
                This content is wrapped by TkxSpin.
              </p>
              <p style={{ color: theme.textMuted, margin: 0, fontSize: '14px' }}>
                When spinning is true, an overlay dims the content and shows the spinner.
              </p>
            </div>
          </TkxSpin>
          <TkxButton onClick={() => setWrapperSpinning(!wrapperSpinning)}>
            Toggle Spin
          </TkxButton>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Delay Mode ── */}
      <h2 style={sectionTitle}>Delay Mode</h2>
      <p style={sectionDesc}>Use delay to prevent spinner flicker on fast operations.</p>

      <DemoSection
        title="Delayed Spinner"
        description="The spinner only appears after the specified delay (500ms here)."
        theme={theme}
        code={`<TkxSpin spinning={spinning} delay={500} tip="Please wait...">
  <div>Content here</div>
</TkxSpin>
<TkxButton onClick={() => setSpinning(!spinning)}>
  Toggle (500ms delay)
</TkxButton>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TkxSpin spinning={delaySpinning} delay={500} tip="Please wait...">
            <div style={cardStyle}>
              <p style={{ color: theme.text, margin: 0 }}>
                Toggle this spinner to see the 500ms delay before it appears.
              </p>
            </div>
          </TkxSpin>
          <TkxButton onClick={() => setDelaySpinning(!delaySpinning)}>
            Toggle (500ms delay)
          </TkxButton>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={sectionTitle}>TkxSpin Props</h2>
      <PropTable props={SPIN_PROPS} />
    </div>
  );
}
