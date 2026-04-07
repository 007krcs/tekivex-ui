import type { ThemeTokens } from '@tekivex/ui';
import { TkxMasonry } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Colored card helper ──────────────────────────────────────────────────────

function MasonryCard({
  color,
  height,
  label,
  theme,
}: {
  color: string;
  height: number;
  label: string;
  theme: ThemeTokens;
}) {
  return (
    <div
      style={{
        height,
        backgroundColor: color,
        borderRadius: 10,
        padding: 16,
        display: 'flex',
        alignItems: 'flex-end',
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </div>
  );
}

// ── Props definitions ────────────────────────────────────────────────────────

const MASONRY_PROPS = [
  { name: 'columns', type: 'number | { sm?: number; md?: number; lg?: number }', default: '3', description: 'Number of columns. Pass an object for responsive breakpoints.' },
  { name: 'gap', type: 'number', default: '16', description: 'Gap between items in pixels.' },
  { name: 'children', type: 'ReactNode', description: 'Child elements distributed across columns.', required: true },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function MasonryPage({ theme }: { theme: ThemeTokens }) {
  const COLORS = [
    theme.accent,
    '#e74c3c',
    '#2ecc71',
    '#f39c12',
    '#9b59b6',
    '#1abc9c',
    '#3498db',
    '#e67e22',
  ];

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Basic Masonry ──────────────────────────────────────────────── */}

      <DemoSection
        title="Basic Masonry"
        description="A simple 3-column masonry layout with cards of varying heights."
        theme={theme}
        code={`<TkxMasonry columns={3} gap={16}>
  <div style={{ height: 180, background: '#3498db' }}>Card 1</div>
  <div style={{ height: 120, background: '#e74c3c' }}>Card 2</div>
  <div style={{ height: 220, background: '#2ecc71' }}>Card 3</div>
  <div style={{ height: 160, background: '#f39c12' }}>Card 4</div>
  <div style={{ height: 140, background: '#9b59b6' }}>Card 5</div>
  <div style={{ height: 200, background: '#1abc9c' }}>Card 6</div>
</TkxMasonry>`}
      >
        <TkxMasonry columns={3} gap={16}>
          <MasonryCard color={COLORS[0]} height={180} label="Card 1" theme={theme} />
          <MasonryCard color={COLORS[1]} height={120} label="Card 2" theme={theme} />
          <MasonryCard color={COLORS[2]} height={220} label="Card 3" theme={theme} />
          <MasonryCard color={COLORS[3]} height={160} label="Card 4" theme={theme} />
          <MasonryCard color={COLORS[4]} height={140} label="Card 5" theme={theme} />
          <MasonryCard color={COLORS[5]} height={200} label="Card 6" theme={theme} />
        </TkxMasonry>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Responsive Columns ─────────────────────────────────────────── */}

      <DemoSection
        title="Responsive Columns"
        description="Pass an object to columns for responsive breakpoint control: 1 column on small screens, 2 on medium, 4 on large."
        theme={theme}
        code={`<TkxMasonry columns={{ sm: 1, md: 2, lg: 4 }} gap={12}>
  <div style={{ height: 160, background: '#3498db' }}>A</div>
  <div style={{ height: 200, background: '#e74c3c' }}>B</div>
  <div style={{ height: 140, background: '#2ecc71' }}>C</div>
  <div style={{ height: 180, background: '#f39c12' }}>D</div>
  <div style={{ height: 120, background: '#9b59b6' }}>E</div>
  <div style={{ height: 240, background: '#1abc9c' }}>F</div>
  <div style={{ height: 160, background: '#e67e22' }}>G</div>
  <div style={{ height: 190, background: '#3498db' }}>H</div>
</TkxMasonry>`}
      >
        <TkxMasonry columns={{ sm: 1, md: 2, lg: 4 }} gap={12}>
          <MasonryCard color={COLORS[0]} height={160} label="A" theme={theme} />
          <MasonryCard color={COLORS[1]} height={200} label="B" theme={theme} />
          <MasonryCard color={COLORS[2]} height={140} label="C" theme={theme} />
          <MasonryCard color={COLORS[3]} height={180} label="D" theme={theme} />
          <MasonryCard color={COLORS[4]} height={120} label="E" theme={theme} />
          <MasonryCard color={COLORS[5]} height={240} label="F" theme={theme} />
          <MasonryCard color={COLORS[6]} height={160} label="G" theme={theme} />
          <MasonryCard color={COLORS[7]} height={190} label="H" theme={theme} />
        </TkxMasonry>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Two Columns with Large Gap ─────────────────────────────────── */}

      <DemoSection
        title="Two Columns with Large Gap"
        description="A 2-column layout with a wider 24px gap for a more spacious feel."
        theme={theme}
        code={`<TkxMasonry columns={2} gap={24}>
  <div style={{ height: 200, background: '#9b59b6' }}>Panel 1</div>
  <div style={{ height: 260, background: '#1abc9c' }}>Panel 2</div>
  <div style={{ height: 180, background: '#e74c3c' }}>Panel 3</div>
  <div style={{ height: 220, background: '#f39c12' }}>Panel 4</div>
</TkxMasonry>`}
      >
        <TkxMasonry columns={2} gap={24}>
          <MasonryCard color={COLORS[4]} height={200} label="Panel 1" theme={theme} />
          <MasonryCard color={COLORS[5]} height={260} label="Panel 2" theme={theme} />
          <MasonryCard color={COLORS[1]} height={180} label="Panel 3" theme={theme} />
          <MasonryCard color={COLORS[3]} height={220} label="Panel 4" theme={theme} />
        </TkxMasonry>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props table ────────────────────────────────────────────────── */}

      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxMasonry Props
        </h3>
        <PropTable props={MASONRY_PROPS} />
      </div>
    </div>
  );
}
