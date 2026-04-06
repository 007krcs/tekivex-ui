import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxSkeleton, TkxAvatar, TkxButton, TkxCard } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadgeGroup } from '../layout/WCAGBadge';
import type { CSSProperties } from 'react';

interface Props { theme: ThemeTokens }

// ── Loading Toggle Demo ───────────────────────────────────────────────────────

function LoadingToggleDemo({ theme }: { theme: ThemeTokens }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <TkxButton
          size="sm"
          variant={isLoading ? 'primary' : 'outline'}
          onClick={() => setIsLoading((v) => !v)}
        >
          {isLoading ? 'Show Content' : 'Show Loading'}
        </TkxButton>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <TkxSkeleton variant="circular" width={44} height={44} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <TkxSkeleton variant="text" height="16px" width="40%" />
            <TkxSkeleton variant="text" height="13px" lines={3} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <TkxAvatar alt="Maya Johnson" initials="MJ" size="md" />
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '14px', color: theme.text }}>Maya Johnson</p>
            <p style={{ margin: 0, fontSize: '13px', color: theme.textMuted, lineHeight: '1.6' }}>
              Senior Product Designer at Tekivex. Passionate about design systems and
              accessible, human-centred interfaces. Based in Amsterdam.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dashboard Cards Loading ───────────────────────────────────────────────────

function DashboardSkeletonCard({ theme }: { theme: ThemeTokens }) {
  return (
    <div style={{ flex: '1 1 180px', padding: '16px', borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <TkxSkeleton variant="text" width="55%" height="12px" />
        <TkxSkeleton variant="circular" width={20} height={20} />
      </div>
      <TkxSkeleton variant="text" width="70%" height="28px" style={{ marginBottom: 8 }} />
      <TkxSkeleton variant="text" width="45%" height="11px" />
    </div>
  );
}

// ── Profile Loading State ─────────────────────────────────────────────────────

function ProfileSkeleton({ theme }: { theme: ThemeTokens }) {
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <TkxSkeleton variant="rectangular" height={120} style={{ borderRadius: 10 }} />
      <div style={{ position: 'relative', marginTop: -24, paddingLeft: 16, marginBottom: 12 }}>
        <TkxSkeleton variant="circular" width={72} height={72} />
      </div>
      <div style={{ paddingLeft: 16, paddingRight: 16 }}>
        <TkxSkeleton variant="text" width="50%" height="18px" style={{ marginBottom: 8 }} />
        <TkxSkeleton variant="text" width="35%" height="13px" style={{ marginBottom: 16 }} />
        <TkxSkeleton variant="text" lines={3} style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 24 }}>
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <TkxSkeleton variant="text" width="40px" height="18px" style={{ marginBottom: 4 }} />
              <TkxSkeleton variant="text" width="60px" height="11px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Table Loading State ───────────────────────────────────────────────────────

function TableSkeleton({ theme }: { theme: ThemeTokens }) {
  const thStyle: CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontSize: '11px',
    fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: theme.textMuted, backgroundColor: theme.surfaceAlt,
    borderBottom: `2px solid ${theme.border}`,
  };
  const tdStyle: CSSProperties = { padding: '10px 14px', borderBottom: `1px solid ${theme.border}` };
  const cols = ['Name', 'Email', 'Role', 'Status', 'Joined'];
  const widths = ['120px', '160px', '90px', '80px', '80px'];

  return (
    <div style={{ width: '100%', border: `1px solid ${theme.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{cols.map((c) => <th key={c} style={thStyle}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }, (_, ri) => (
            <tr key={ri}>
              {cols.map((c, ci) => (
                <td key={c} style={tdStyle}>
                  <TkxSkeleton variant="text" height="14px" width={widths[ci]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Card Loading State ────────────────────────────────────────────────────────

function CardSkeleton({ theme }: { theme: ThemeTokens }) {
  return (
    <div style={{ padding: '16px', borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.surface, width: '100%', maxWidth: 340 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <TkxSkeleton variant="circular" width={44} height={44} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <TkxSkeleton variant="text" width="55%" height="14px" />
          <TkxSkeleton variant="text" width="40%" height="12px" />
        </div>
      </div>
      <TkxSkeleton variant="text" lines={3} style={{ marginBottom: 16 }} />
      <TkxSkeleton variant="rectangular" height={140} style={{ borderRadius: 6, marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <TkxSkeleton variant="rectangular" height={32} style={{ borderRadius: 6, flex: 1 }} />
        <TkxSkeleton variant="rectangular" width={32} height={32} style={{ borderRadius: 6, flexShrink: 0 }} />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function SkeletonPage({ theme }: Props) {
  const pageStyle: CSSProperties = { maxWidth: '860px', margin: '0 auto', padding: '48px 32px 80px' };
  const h1Style: CSSProperties = { fontSize: '2rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em' };
  const descStyle: CSSProperties = { fontSize: '15px', color: theme.textMuted, lineHeight: '1.7', maxWidth: '620px', margin: '0 0 24px' };
  const h2Style: CSSProperties = { fontSize: '1.2rem', fontWeight: 700, color: theme.text, margin: '48px 0 16px', letterSpacing: '-0.02em' };
  const noteStyle: CSSProperties = { fontSize: '13px', color: theme.textMuted, lineHeight: '1.7', padding: '16px', borderRadius: 8, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt + '50' };
  const badgeStyle: CSSProperties = {
    display: 'inline-block', padding: '3px 10px', borderRadius: '9999px',
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
    backgroundColor: theme.primary + '18', color: theme.primary,
    border: '1px solid ' + theme.primary + '35', marginBottom: '24px',
  };

  return (
    <div style={pageStyle}>
      {/* Hero */}
      <span style={badgeStyle}>Component Docs</span>
      <h1 style={h1Style}>TkxSkeleton</h1>
      <p style={descStyle}>
        <strong>TkxSkeleton</strong> renders animated placeholder shapes that match the layout of
        content that is still loading. It uses <code>role="progressbar"</code> and <code>aria-busy="true"</code>
        so screen readers announce the loading state. Animations respect the user's
        <code> prefers-reduced-motion</code> preference automatically.
      </p>
      <WCAGBadgeGroup
        label="WCAG Compliance"
        badges={[
          { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
          { criterion: '2.3.3 Animation from Interactions', level: 'AAA', status: 'PASS' },
          { criterion: '4.1.3 Status Messages', level: 'AA', status: 'PASS' },
        ]}
      />

      {/* 1. Text Skeleton */}
      <DemoSection
        theme={theme}
        title="Text Skeleton"
        description="Single-line and multi-line text skeletons. The lines prop renders a paragraph — the last line is automatically narrower (75% width)."
        code={`{/* Single line */}
<TkxSkeleton variant="text" width="60%" height="16px" />

{/* Multi-line paragraph */}
<TkxSkeleton variant="text" lines={4} />`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: theme.textMuted }}>Single line</p>
            <TkxSkeleton variant="text" width="60%" height="16px" />
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: theme.textMuted }}>Title + paragraph (lines=4)</p>
            <TkxSkeleton variant="text" height="20px" width="45%" style={{ marginBottom: 8 }} />
            <TkxSkeleton variant="text" lines={4} />
          </div>
        </div>
      </DemoSection>

      {/* 2. Circular Skeleton */}
      <DemoSection
        theme={theme}
        title="Circular Skeleton"
        description="Use variant='circular' for avatar and icon placeholders. Size is controlled via width and height."
        code={`<TkxSkeleton variant="circular" width={24} height={24} />
<TkxSkeleton variant="circular" width={40} height={40} />
<TkxSkeleton variant="circular" width={72} height={72} />`}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {[24, 32, 40, 56, 72].map((s) => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <TkxSkeleton variant="circular" width={s} height={s} />
              <span style={{ fontSize: '11px', color: theme.textMuted }}>{s}px</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* 3. Rectangular Skeleton */}
      <DemoSection
        theme={theme}
        title="Rectangular Skeleton"
        description="Use variant='rectangular' for image, card, and banner placeholders. Default border-radius is 8px."
        code={`<TkxSkeleton variant="rectangular" height={60} />
<TkxSkeleton variant="rectangular" height={120} />
<div style={{ display: 'flex', gap: 12 }}>
  <TkxSkeleton variant="rectangular" height={80} style={{ flex: 1 }} />
  <TkxSkeleton variant="rectangular" height={80} style={{ flex: 1 }} />
  <TkxSkeleton variant="rectangular" height={80} style={{ flex: 1 }} />
</div>`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TkxSkeleton variant="rectangular" height={60} />
          <TkxSkeleton variant="rectangular" height={120} />
          <div style={{ display: 'flex', gap: 12 }}>
            <TkxSkeleton variant="rectangular" height={80} style={{ flex: 1 }} />
            <TkxSkeleton variant="rectangular" height={80} style={{ flex: 1 }} />
            <TkxSkeleton variant="rectangular" height={80} style={{ flex: 1 }} />
          </div>
        </div>
      </DemoSection>

      {/* 4. Animations */}
      <DemoSection
        theme={theme}
        title="Animations"
        description="Three animation modes: pulse (opacity fade), wave (shimmer sweep), and false (static — used when animations are disabled)."
        code={`<TkxSkeleton animation="pulse" variant="text" />   {/* default */}
<TkxSkeleton animation="wave" variant="text" />
<TkxSkeleton animation={false} variant="text" />`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {([
            { label: 'pulse (default)', anim: 'pulse' as const },
            { label: 'wave', anim: 'wave' as const },
            { label: 'false (static)', anim: false as const },
          ]).map(({ label, anim }) => (
            <div key={label}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: theme.textMuted }}>{label}</p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <TkxSkeleton variant="circular" width={36} height={36} animation={anim} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <TkxSkeleton variant="text" width="50%" height="14px" animation={anim} />
                  <TkxSkeleton variant="text" width="80%" height="12px" animation={anim} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* 5. Card Loading State */}
      <DemoSection
        theme={theme}
        title="Card Loading State"
        description="Full card skeleton combining circular (avatar), text (name + bio), rectangular (image), and rectangular (action buttons)."
        code={`<div style={{ padding: 16, border: \`1px solid \${theme.border}\`, borderRadius: 10 }}>
  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
    <TkxSkeleton variant="circular" width={44} height={44} />
    <div style={{ flex: 1 }}>
      <TkxSkeleton variant="text" width="55%" height="14px" />
      <TkxSkeleton variant="text" width="40%" height="12px" />
    </div>
  </div>
  <TkxSkeleton variant="text" lines={3} style={{ marginBottom: 16 }} />
  <TkxSkeleton variant="rectangular" height={140} style={{ borderRadius: 6 }} />
</div>`}
      >
        <CardSkeleton theme={theme} />
      </DemoSection>

      {/* 6. Table Loading State */}
      <DemoSection
        theme={theme}
        title="Table Loading State"
        description="Rows of skeleton cells preserve the table structure during data fetch. Column widths vary to simulate realistic data."
        code={`<table>
  <thead>
    <tr>{columns.map((col) => <th key={col}>{col}</th>)}</tr>
  </thead>
  <tbody>
    {Array.from({ length: 5 }, (_, i) => (
      <tr key={i}>
        {columns.map((col, ci) => (
          <td key={col}>
            <TkxSkeleton variant="text" height="14px" width={widths[ci]} />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>`}
      >
        <TableSkeleton theme={theme} />
      </DemoSection>

      {/* 7. Profile Loading State */}
      <DemoSection
        theme={theme}
        title="Profile Loading State"
        description="Realistic user profile skeleton: cover image, overlapping avatar circle, name, bio, and stats row."
        code={`<>
  {/* Cover image */}
  <TkxSkeleton variant="rectangular" height={120} style={{ borderRadius: 10 }} />
  {/* Avatar overlapping the cover */}
  <div style={{ position: 'relative', marginTop: -24, paddingLeft: 16 }}>
    <TkxSkeleton variant="circular" width={72} height={72} />
  </div>
  <div style={{ paddingLeft: 16 }}>
    <TkxSkeleton variant="text" width="50%" height="18px" />
    <TkxSkeleton variant="text" width="35%" height="13px" />
    <TkxSkeleton variant="text" lines={3} />
    {/* Stats row */}
    <div style={{ display: 'flex', gap: 24 }}>
      {[0, 1, 2].map((i) => (
        <div key={i}>
          <TkxSkeleton variant="text" width="40px" height="18px" />
          <TkxSkeleton variant="text" width="60px" height="11px" />
        </div>
      ))}
    </div>
  </div>
</>`}
      >
        <ProfileSkeleton theme={theme} />
      </DemoSection>

      {/* 8. Dashboard Cards Loading */}
      <DemoSection
        theme={theme}
        title="Dashboard Cards Loading"
        description="Four stat cards in a flex row. Each card has a label line, large number, and a trend indicator skeleton."
        code={`<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
  {[0, 1, 2, 3].map((i) => (
    <div key={i} style={{ flex: '1 1 180px', padding: 16, borderRadius: 10, border: \`1px solid \${theme.border}\` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <TkxSkeleton variant="text" width="55%" height="12px" />
        <TkxSkeleton variant="circular" width={20} height={20} />
      </div>
      <TkxSkeleton variant="text" width="70%" height="28px" style={{ marginBottom: 8 }} />
      <TkxSkeleton variant="text" width="45%" height="11px" />
    </div>
  ))}
</div>`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%' }}>
          {[0, 1, 2, 3].map((i) => <DashboardSkeletonCard key={i} theme={theme} />)}
        </div>
      </DemoSection>

      {/* 9. Toggle Loading → Loaded */}
      <DemoSection
        theme={theme}
        title="Toggle Loading → Loaded"
        description="Click to switch between the skeleton state and real content, simulating a data-fetch lifecycle."
        code={`const [isLoading, setIsLoading] = useState(true);

{isLoading ? (
  <div style={{ display: 'flex', gap: 12 }}>
    <TkxSkeleton variant="circular" width={44} height={44} />
    <div style={{ flex: 1 }}>
      <TkxSkeleton variant="text" width="40%" height="16px" />
      <TkxSkeleton variant="text" lines={3} />
    </div>
  </div>
) : (
  <div style={{ display: 'flex', gap: 12 }}>
    <TkxAvatar alt="Maya Johnson" initials="MJ" />
    <p>Maya Johnson — Senior Product Designer</p>
  </div>
)}`}
      >
        <LoadingToggleDemo theme={theme} />
      </DemoSection>

      {/* Props */}
      <h2 style={h2Style}>Props</h2>
      <PropTable props={[
        { name: 'variant', type: "'text' | 'circular' | 'rectangular'", default: "'rectangular'", description: "Shape of the skeleton. 'text' adds small border-radius, 'circular' uses full border-radius, 'rectangular' uses card-style border-radius." },
        { name: 'width', type: 'string | number', description: 'Width of the skeleton. Numbers are treated as px. Defaults to 100% for text/rectangular, equals height for circular.' },
        { name: 'height', type: 'string | number', description: "Height of the skeleton. Numbers are treated as px. Defaults to '1em' for text, '80px' for rectangular, equals width for circular." },
        { name: 'lines', type: 'number', description: "Number of text lines to render. Only applies when variant='text'. The last line is rendered at 75% width." },
        { name: 'animation', type: "'pulse' | 'wave' | false", default: "'pulse'", description: 'Animation style. pulse fades opacity, wave sweeps a shimmer gradient, false disables animation entirely.' },
        { name: 'className', type: 'string', description: 'Additional class names for the wrapper element.' },
        { name: 'style', type: 'CSSProperties', description: 'Inline styles for the wrapper element. Use to override width, height, border-radius, etc.' },
      ]} />

      {/* WCAG Notes */}
      <h2 style={h2Style}>Accessibility Notes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={noteStyle}><strong>role="progressbar" + aria-busy="true":</strong> Each skeleton element announces itself as a loading indicator. Screen readers will announce "Loading" when they encounter a skeleton in the accessibility tree.</div>
        <div style={noteStyle}><strong>prefers-reduced-motion:</strong> The <code>useReducedMotion()</code> hook reads the OS-level preference. When the user has requested reduced motion, all animations are disabled regardless of the <code>animation</code> prop value.</div>
        <div style={noteStyle}><strong>Container-level aria-busy:</strong> For complex loading sections, wrap the skeleton group in a container with <code>aria-busy="true"</code> and <code>aria-live="polite"</code>. Remove both attributes when real content replaces the skeletons so screen readers announce the update.</div>
      </div>
    </div>
  );
}
