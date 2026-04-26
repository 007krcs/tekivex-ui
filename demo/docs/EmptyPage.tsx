import type { ThemeTokens } from 'tekivex-ui';
import { TkxEmpty, TkxButton } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const EMPTY_PROPS = [
  { name: 'image', type: "ReactNode | 'default' | 'simple'", default: "'default'", description: 'Illustration to display. Use "simple" for a minimal variant or pass a custom ReactNode.' },
  { name: 'description', type: 'ReactNode', default: "'No data'", description: 'Text displayed below the illustration.' },
  { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Optional action area rendered below the description (e.g. a button).' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root container.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function EmptyPage({ theme }: { theme: ThemeTokens }) {
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
          Empty
        </h1>
        <p style={{ fontSize: '15px', color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>
          A placeholder for empty states, showing an illustration with optional description and actions.
        </p>
      </div>

      {/* ── Default ── */}
      <h2 style={sectionTitle}>Default Empty</h2>
      <p style={sectionDesc}>The default illustration and description text.</p>

      <DemoSection
        title="Default"
        description="Renders with the built-in box illustration and 'No data' description."
        theme={theme}
        code={`<TkxEmpty />`}
      >
        <TkxEmpty />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Simple Variant ── */}
      <h2 style={sectionTitle}>Simple Variant</h2>
      <p style={sectionDesc}>A minimal, lighter illustration suitable for compact spaces.</p>

      <DemoSection
        title="Simple Image"
        description="Pass image='simple' for the minimal variant."
        theme={theme}
        code={`<TkxEmpty image="simple" />`}
      >
        <TkxEmpty image="simple" />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Custom Description ── */}
      <h2 style={sectionTitle}>Custom Description</h2>
      <p style={sectionDesc}>Override the default description with your own message.</p>

      <DemoSection
        title="With Description"
        description="Use the description prop to provide context-specific messaging."
        theme={theme}
        code={`<TkxEmpty description="No results match your search." />
<TkxEmpty
  image="simple"
  description="Your inbox is empty. Check back later!"
/>`}
      >
        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
          <TkxEmpty description="No results match your search." />
          <TkxEmpty image="simple" description="Your inbox is empty. Check back later!" />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── With Action ── */}
      <h2 style={sectionTitle}>With Action Button</h2>
      <p style={sectionDesc}>Pass children to render an action area below the description.</p>

      <DemoSection
        title="Action Slot"
        description="Use children to add buttons or links for the user to take action."
        theme={theme}
        code={`<TkxEmpty description="No projects yet.">
  <TkxButton variant="primary">Create Project</TkxButton>
</TkxEmpty>`}
      >
        <TkxEmpty description="No projects yet.">
          <TkxButton variant="primary">Create Project</TkxButton>
        </TkxEmpty>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={sectionTitle}>TkxEmpty Props</h2>
      <PropTable props={EMPTY_PROPS} />
    </div>
  );
}
