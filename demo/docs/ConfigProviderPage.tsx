import type { ThemeTokens } from '@tekivex/ui';
import { TkxConfigProvider, TkxButton, TkxSpin } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const CONFIG_PROVIDER_PROPS = [
  { name: 'children', type: 'ReactNode', required: true, description: 'Child components that inherit the configuration context.' },
  { name: 'locale', type: 'string', default: "'en-US'", description: 'BCP 47 locale code (e.g. "en-US", "ja-JP").' },
  { name: 'direction', type: "'ltr' | 'rtl'", default: "'ltr'", description: 'Text and layout direction for bidirectional support.' },
  { name: 'componentDefaults', type: 'ComponentDefaults', default: '{ size: "md", variant: "default", animation: true, bordered: true }', description: 'Global defaults applied to every component. Merged with parent provider values.' },
  { name: 'componentOverrides', type: 'ComponentOverrides', default: '{}', description: 'Per-component configuration overrides (button, input, table, modal).' },
  { name: 'prefixCls', type: 'string', default: "'tkx'", description: 'CSS class prefix used by all TekiVex components.' },
];

const COMPONENT_DEFAULTS_PROPS = [
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Default size for all components that support sizing.' },
  { name: 'variant', type: 'string', default: "'default'", description: 'Default variant name. Interpretation depends on the component.' },
  { name: 'animation', type: 'boolean', default: 'true', description: 'Enable or disable animations globally.' },
  { name: 'bordered', type: 'boolean', default: 'true', description: 'Show borders by default on components that support it.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function ConfigProviderPage({ theme }: { theme: ThemeTokens }) {
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

  const boxStyle = {
    padding: '24px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600 as const,
    color: theme.textMuted,
    marginBottom: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: theme.text, margin: '0 0 8px' }}>
          ConfigProvider
        </h1>
        <p style={{ fontSize: '15px', color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>
          Global configuration provider for locale, direction, and component defaults. Supports nesting.
        </p>
      </div>

      {/* ── Basic Usage ── */}
      <h2 style={sectionTitle}>Basic Usage</h2>
      <p style={sectionDesc}>Wrap your application or a subtree to provide global configuration.</p>

      <DemoSection
        title="Wrapping Components"
        description="All descendant components inherit the configuration context."
        theme={theme}
        code={`<TkxConfigProvider locale="en-US">
  <TkxButton variant="primary">Configured Button</TkxButton>
  <TkxSpin size="sm" />
</TkxConfigProvider>`}
      >
        <TkxConfigProvider locale="en-US">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <TkxButton variant="primary">Configured Button</TkxButton>
            <TkxSpin size="sm" />
          </div>
        </TkxConfigProvider>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Size Defaults ── */}
      <h2 style={sectionTitle}>Size Defaults</h2>
      <p style={sectionDesc}>Set global size defaults that apply to all child components.</p>

      <DemoSection
        title="Global Size Configuration"
        description="Compare default md size with sm and lg overrides."
        theme={theme}
        code={`<TkxConfigProvider componentDefaults={{ size: 'sm' }}>
  <TkxButton>Small Default</TkxButton>
  <TkxSpin />
</TkxConfigProvider>

<TkxConfigProvider componentDefaults={{ size: 'lg' }}>
  <TkxButton>Large Default</TkxButton>
  <TkxSpin />
</TkxConfigProvider>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <p style={labelStyle}>size: sm</p>
            <TkxConfigProvider componentDefaults={{ size: 'sm' }}>
              <div style={{ ...boxStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <TkxButton>Small Default</TkxButton>
                <TkxButton variant="primary">Small Primary</TkxButton>
                <TkxSpin />
              </div>
            </TkxConfigProvider>
          </div>
          <div>
            <p style={labelStyle}>size: md (default)</p>
            <TkxConfigProvider componentDefaults={{ size: 'md' }}>
              <div style={{ ...boxStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <TkxButton>Medium Default</TkxButton>
                <TkxButton variant="primary">Medium Primary</TkxButton>
                <TkxSpin />
              </div>
            </TkxConfigProvider>
          </div>
          <div>
            <p style={labelStyle}>size: lg</p>
            <TkxConfigProvider componentDefaults={{ size: 'lg' }}>
              <div style={{ ...boxStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <TkxButton>Large Default</TkxButton>
                <TkxButton variant="primary">Large Primary</TkxButton>
                <TkxSpin />
              </div>
            </TkxConfigProvider>
          </div>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── RTL Direction ── */}
      <h2 style={sectionTitle}>RTL Direction</h2>
      <p style={sectionDesc}>Set direction to "rtl" for right-to-left language support.</p>

      <DemoSection
        title="RTL Layout"
        description="Components inside an RTL provider adapt their layout direction."
        theme={theme}
        code={`<TkxConfigProvider direction="rtl">
  <div style={{ direction: 'rtl', textAlign: 'right' }}>
    <TkxButton variant="primary">RTL Button</TkxButton>
    <p>This content flows right-to-left</p>
  </div>
</TkxConfigProvider>`}
      >
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>direction: ltr</p>
            <TkxConfigProvider direction="ltr">
              <div style={{ ...boxStyle, direction: 'ltr', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <TkxButton variant="primary">Submit</TkxButton>
                  <TkxButton>Cancel</TkxButton>
                </div>
                <p style={{ color: theme.text, margin: 0, fontSize: '14px' }}>
                  Left-to-right layout for English and similar languages.
                </p>
              </div>
            </TkxConfigProvider>
          </div>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>direction: rtl</p>
            <TkxConfigProvider direction="rtl">
              <div style={{ ...boxStyle, direction: 'rtl', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', justifyContent: 'flex-start' }}>
                  <TkxButton variant="primary">Submit</TkxButton>
                  <TkxButton>Cancel</TkxButton>
                </div>
                <p style={{ color: theme.text, margin: 0, fontSize: '14px' }}>
                  Right-to-left layout for Arabic, Hebrew, and similar languages.
                </p>
              </div>
            </TkxConfigProvider>
          </div>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Tables ── */}
      <h2 style={sectionTitle}>TkxConfigProvider Props</h2>
      <PropTable props={CONFIG_PROVIDER_PROPS} />

      <div style={{ marginTop: '32px' }}>
        <h2 style={sectionTitle}>ComponentDefaults</h2>
        <PropTable props={COMPONENT_DEFAULTS_PROPS} />
      </div>
    </div>
  );
}
