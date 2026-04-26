import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxAffix, TkxButton, TkxBadge, TkxCard, TkxCardBody } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

interface Props { theme: ThemeTokens }

const affixProps = [
  { name: 'offsetTop', type: 'number', default: 'undefined', description: 'Distance from top of viewport to trigger affixing.' },
  { name: 'offsetBottom', type: 'number', default: 'undefined', description: 'Distance from bottom of viewport to trigger affixing.' },
  { name: 'onChange', type: '(affixed: boolean) => void', default: 'undefined', description: 'Callback fired when affixed state changes.' },
  { name: 'target', type: '() => HTMLElement | Window', default: 'window', description: 'Scroll container to observe. Defaults to the window.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Content to affix.' },
];

export function AffixPage({ theme }: Props) {
  const [affixed1, setAffixed1] = useState(false);
  const [affixed2, setAffixed2] = useState(false);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 32px 80px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        Affix
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.7', margin: '0 0 40px', maxWidth: 600 }}>
        Makes an element stick to the viewport when scrolling past a threshold.
        Preserves document flow via a placeholder and fires a callback on state change.
      </p>

      {/* Basic offsetTop */}
      <DemoSection
        title="Affix to Top"
        description="Sticks to the top of the viewport once scrolled past offsetTop. Scroll this page to see it activate."
        theme={theme}
        code={`<TkxAffix offsetTop={80} onChange={(a) => console.log('affixed:', a)}>
  <TkxButton variant="solid" colorScheme="primary">
    Sticky Button
  </TkxButton>
</TkxAffix>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <TkxAffix offsetTop={80} onChange={setAffixed1}>
            <TkxButton variant="solid" colorScheme="primary">
              Sticky Button {affixed1 ? '📌' : ''}
            </TkxButton>
          </TkxAffix>
          <span style={{ fontSize: 13, color: theme.textMuted }}>
            Status: <TkxBadge color={affixed1 ? theme.success : theme.border}>{affixed1 ? 'Affixed' : 'Normal'}</TkxBadge>
          </span>
        </div>
      </DemoSection>

      {/* offsetBottom */}
      <DemoSection
        title="Affix to Bottom"
        description="Sticks to the bottom of the viewport when the element scrolls near the bottom edge."
        theme={theme}
        code={`<TkxAffix offsetBottom={24} onChange={(a) => console.log('affixed bottom:', a)}>
  <TkxButton variant="outline" colorScheme="secondary">
    Bottom Sticky
  </TkxButton>
</TkxAffix>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <TkxAffix offsetBottom={24} onChange={setAffixed2}>
            <TkxButton variant="outline" colorScheme="secondary">
              Bottom Sticky {affixed2 ? '📌' : ''}
            </TkxButton>
          </TkxAffix>
          <span style={{ fontSize: 13, color: theme.textMuted }}>
            Status: <TkxBadge color={affixed2 ? theme.success : theme.border}>{affixed2 ? 'Affixed' : 'Normal'}</TkxBadge>
          </span>
        </div>
      </DemoSection>

      {/* Practical use: sticky toolbar */}
      <DemoSection
        title="Sticky Toolbar"
        description="A common pattern: wrap a toolbar in TkxAffix so it stays visible while scrolling through long content."
        theme={theme}
        code={`<TkxAffix offsetTop={64}>
  <div style={{
    display: 'flex', gap: 8, padding: '10px 16px',
    background: theme.surface, borderBottom: \`1px solid \${theme.border}\`,
    borderRadius: 8,
  }}>
    <TkxButton size="sm" variant="ghost">Bold</TkxButton>
    <TkxButton size="sm" variant="ghost">Italic</TkxButton>
    <TkxButton size="sm" variant="ghost">Underline</TkxButton>
    <TkxButton size="sm" variant="solid" colorScheme="primary">Save</TkxButton>
  </div>
</TkxAffix>`}
      >
        <TkxCard style={{ overflow: 'hidden' }}>
          <TkxCardBody>
            <TkxAffix offsetTop={64}>
              <div style={{
                display: 'flex', gap: 8, padding: '10px 16px',
                background: theme.surface, borderBottom: `1px solid ${theme.border}`,
                borderRadius: 8,
              }}>
                <TkxButton size="sm" variant="ghost">Bold</TkxButton>
                <TkxButton size="sm" variant="ghost">Italic</TkxButton>
                <TkxButton size="sm" variant="ghost">Underline</TkxButton>
                <TkxButton size="sm" variant="solid" colorScheme="primary">Save</TkxButton>
              </div>
            </TkxAffix>
            <p style={{ marginTop: 16, color: theme.textMuted, fontSize: 14, lineHeight: 1.7 }}>
              Scroll past the toolbar threshold to see it stick. The placeholder below
              preserves the document flow so content doesn't jump.
            </p>
          </TkxCardBody>
        </TkxCard>
      </DemoSection>

      {/* Props */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '48px 0 16px' }}>Props</h2>
      <PropTable props={affixProps} theme={theme} />
    </div>
  );
}
