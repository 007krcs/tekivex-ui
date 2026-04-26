import type { ThemeTokens } from 'tekivex-ui';
import { TkxAnchor } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

const ANCHOR_PROPS = [
  { name: 'items', type: 'AnchorLink[]', default: '—', description: 'Array of anchor links. Each has key, href (#id), title, and optional nested children.', required: true },
  { name: 'offsetTop', type: 'number', default: '0', description: 'Pixels of offset from the top when calculating which anchor is active during scroll.' },
  { name: 'getCurrentAnchor', type: '(activeLink: string) => string', default: 'undefined', description: 'Override the default active anchor detection logic.' },
  { name: 'onChange', type: '(currentLink: string) => void', default: 'undefined', description: 'Fired when the active anchor changes during scroll.' },
];

const DOC_ANCHORS = [
  { key: 'overview', href: '#overview', title: 'Overview' },
  { key: 'installation', href: '#installation', title: 'Installation' },
  {
    key: 'usage', href: '#usage', title: 'Usage',
    children: [
      { key: 'basic', href: '#basic', title: 'Basic Example' },
      { key: 'custom', href: '#custom', title: 'Custom Themes' },
      { key: 'ssr', href: '#ssr', title: 'SSR Support' },
    ],
  },
  {
    key: 'api', href: '#api', title: 'API Reference',
    children: [
      { key: 'props', href: '#props', title: 'Props' },
      { key: 'methods', href: '#methods', title: 'Methods' },
      { key: 'events', href: '#events', title: 'Events' },
    ],
  },
  { key: 'changelog', href: '#changelog', title: 'Changelog' },
];

const SIMPLE_ANCHORS = [
  { key: 'section1', href: '#section1', title: 'Introduction' },
  { key: 'section2', href: '#section2', title: 'Getting Started' },
  { key: 'section3', href: '#section3', title: 'Configuration' },
  { key: 'section4', href: '#section4', title: 'Deployment' },
  { key: 'section5', href: '#section5', title: 'Troubleshooting' },
];

export function AnchorPage({ theme }: { theme: ThemeTokens }) {
  const divider = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const sectionStyle = (id: string) => ({
    id,
    padding: '20px 24px',
    borderRadius: 8,
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
    marginBottom: 12,
    fontSize: 14,
    color: theme.text,
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Flat Links ──────────────────────────────────────────────────── */}
      <DemoSection
        title="Flat Anchor Links"
        description="A vertical sidebar navigation that highlights the active section as you scroll. Ideal for long-form documentation pages."
        theme={theme}
        code={`<TkxAnchor
  items={[
    { key: 'intro', href: '#intro', title: 'Introduction' },
    { key: 'start', href: '#start', title: 'Getting Started' },
    { key: 'config', href: '#config', title: 'Configuration' },
    { key: 'deploy', href: '#deploy', title: 'Deployment' },
  ]}
  onChange={(link) => console.log('Active:', link)}
/>`}
      >
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ width: 180, flexShrink: 0 }}>
            <TkxAnchor
              items={SIMPLE_ANCHORS}
              onChange={(link) => console.log('Active:', link)}
            />
          </div>
          <div style={{ flex: 1 }}>
            {SIMPLE_ANCHORS.map(({ key, title }) => (
              <div key={key} style={sectionStyle(key)}>
                <strong>{title}</strong>
                <p style={{ margin: '8px 0 0', color: theme.textMuted, fontSize: 13 }}>
                  This is the content section for "{title}". In a real page, this would contain your actual page content. The anchor bar on the left highlights this section when you scroll it into view.
                </p>
              </div>
            ))}
          </div>
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Nested Links ────────────────────────────────────────────────── */}
      <DemoSection
        title="Nested Anchor Links"
        description="Supports two levels of hierarchy for structured documentation — top-level sections and subsections. Child links are indented."
        theme={theme}
        code={`<TkxAnchor
  items={[
    { key: 'overview', href: '#overview', title: 'Overview' },
    {
      key: 'usage', href: '#usage', title: 'Usage',
      children: [
        { key: 'basic', href: '#basic', title: 'Basic Example' },
        { key: 'custom', href: '#custom', title: 'Custom Themes' },
      ],
    },
    {
      key: 'api', href: '#api', title: 'API Reference',
      children: [
        { key: 'props', href: '#props', title: 'Props' },
        { key: 'methods', href: '#methods', title: 'Methods' },
      ],
    },
  ]}
/>`}
      >
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ width: 200, flexShrink: 0 }}>
            <TkxAnchor items={DOC_ANCHORS} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ padding: '16px 20px', borderRadius: 8, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt, fontSize: 13, color: theme.textMuted, lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: theme.text }}>Live Sidebar Navigation</p>
              In a real documentation page, this area would contain your actual content. The TkxAnchor component on the left reflects the document structure and highlights the section currently in the viewport as the user scrolls.
              <br /><br />
              The nested hierarchy (Usage → Basic Example, Custom Themes, SSR Support) is fully supported with indented child links.
            </div>
          </div>
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── When to Use ──────────────────────────────────────────────────── */}
      <div style={{ padding: '28px 32px', borderRadius: 12, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: theme.text }}>⚓ When to Use TkxAnchor</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { icon: '📖', title: 'Documentation Sites', desc: 'Right-hand table of contents that tracks scroll position' },
            { icon: '📋', title: 'Long Form Pages', desc: 'Legal documents, terms of service, privacy policies' },
            { icon: '🛒', title: 'Product Pages', desc: 'Jump to Reviews, Specs, FAQ sections' },
            { icon: '📊', title: 'Dashboard Reports', desc: 'Navigate between report sections without page reload' },
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
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>TkxAnchor Props</h3>
        <PropTable props={ANCHOR_PROPS} />
      </div>
    </div>
  );
}
