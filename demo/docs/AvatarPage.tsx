import type { ThemeTokens } from '@tekivex/ui';
import { TkxAvatar, TkxBadge, TkxCard } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadgeGroup } from '../layout/WCAGBadge';
import type { CSSProperties } from 'react';

interface Props { theme: ThemeTokens }

// ── Sample data ───────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { name: 'Alice Chen', role: 'Product Designer', initials: 'AC', status: 'online' as const, department: 'Design' },
  { name: 'Bob Martinez', role: 'Engineering Lead', initials: 'BM', status: 'away' as const, department: 'Engineering' },
  { name: 'Carol White', role: 'UX Researcher', initials: 'CW', status: 'online' as const, department: 'Design' },
  { name: 'David Kim', role: 'Frontend Engineer', initials: 'DK', status: 'busy' as const, department: 'Engineering' },
  { name: 'Elena Santos', role: 'Product Manager', initials: 'ES', status: 'online' as const, department: 'Product' },
  { name: 'Frank Liu', role: 'Data Scientist', initials: 'FL', status: 'offline' as const, department: 'Data' },
];

const COMMENTS = [
  {
    author: 'Alice Chen',
    initials: 'AC',
    role: 'Product Designer',
    time: '2 min ago',
    text: 'The new component API looks really clean. I especially like how the size tokens map directly to the design system tokens — makes the handoff much smoother.',
  },
  {
    author: 'Bob Martinez',
    initials: 'BM',
    role: 'Engineering Lead',
    time: '8 min ago',
    text: "Agreed. The accessibility story is solid too — roving tabindex for tabs and aria-busy for skeletons are exactly what we needed. Let's ship it.",
  },
  {
    author: 'Carol White',
    initials: 'CW',
    role: 'UX Researcher',
    time: '15 min ago',
    text: 'One thing to flag: the status dot on the avatar is only colour-coded right now. We should add a text label for users who cannot perceive colour differences.',
  },
];

// ── Status label mapping ──────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  online: 'Online',
  offline: 'Offline',
  away: 'Away',
  busy: 'Busy',
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AvatarPage({ theme }: Props) {
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
      <h1 style={h1Style}>TkxAvatar</h1>
      <p style={descStyle}>
        <strong>TkxAvatar</strong> renders a user photo, initials fallback, or generic icon fallback.
        It supports five sizes, two shapes, and four status indicators. All non-image fallbacks
        use <code>role="img"</code> with a descriptive <code>aria-label</code>.
      </p>
      <WCAGBadgeGroup
        label="WCAG Compliance"
        badges={[
          { criterion: '1.1.1 Non-text Content', level: 'AA', status: 'PASS' },
          { criterion: '1.4.1 Use of Colour', level: 'AA', status: 'PASS' },
          { criterion: '4.1.2 Name, Role, Value', level: 'AA', status: 'PASS' },
        ]}
      />

      {/* 1. With Image */}
      <DemoSection
        theme={theme}
        title="With Image"
        description="Provide a src URL and an alt description. If the image fails to load, the component automatically falls back to initials or the generic icon."
        code={`<TkxAvatar
  src="https://i.pravatar.cc/150?img=1"
  alt="Alice Chen"
  size="md"
/>
<TkxAvatar
  src="https://i.pravatar.cc/150?img=3"
  alt="Bob Martinez"
  size="lg"
/>`}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {[1, 3, 5, 7, 9].map((img, i) => (
            <TkxAvatar
              key={img}
              src={`https://i.pravatar.cc/150?img=${img}`}
              alt={TEAM_MEMBERS[i % TEAM_MEMBERS.length].name}
              size="md"
            />
          ))}
        </div>
      </DemoSection>

      {/* 2. Initials Fallback */}
      <DemoSection
        theme={theme}
        title="Initials Fallback"
        description="When no src is provided (or the image errors), the avatar renders the first two characters of the initials prop on a themed background."
        code={`<TkxAvatar alt="Alice Chen" initials="AC" size="md" />
<TkxAvatar alt="Bob Martinez" initials="BM" size="md" />
<TkxAvatar alt="Carol White" initials="CW" size="md" />`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {TEAM_MEMBERS.map((m) => (
            <div key={m.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <TkxAvatar alt={m.name} initials={m.initials} size="md" />
              <span style={{ fontSize: '11px', color: theme.textMuted }}>{m.initials}</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* 3. Generic Fallback */}
      <DemoSection
        theme={theme}
        title="Generic Fallback"
        description="When neither src nor initials are provided, the avatar shows a person silhouette SVG icon. This is the safe default for unknown users."
        code={`<TkxAvatar alt="Unknown user" size="md" />
<TkxAvatar alt="Unknown user" size="lg" />`}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <TkxAvatar alt="Unknown user" size={s} />
              <span style={{ fontSize: '11px', color: theme.textMuted }}>{s}</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* 4. Sizes */}
      <DemoSection
        theme={theme}
        title="Sizes"
        description="Five sizes: xs (24px), sm (32px), md (40px), lg (56px), xl (72px). Use initials here to make size differences clear."
        code={`<TkxAvatar alt="Alice Chen" initials="AC" size="xs" />
<TkxAvatar alt="Alice Chen" initials="AC" size="sm" />
<TkxAvatar alt="Alice Chen" initials="AC" size="md" />
<TkxAvatar alt="Alice Chen" initials="AC" size="lg" />
<TkxAvatar alt="Alice Chen" initials="AC" size="xl" />`}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {([
            { size: 'xs' as const, px: 24 },
            { size: 'sm' as const, px: 32 },
            { size: 'md' as const, px: 40 },
            { size: 'lg' as const, px: 56 },
            { size: 'xl' as const, px: 72 },
          ]).map(({ size, px }) => (
            <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <TkxAvatar alt="Alice Chen" initials="AC" size={size} />
              <span style={{ fontSize: '11px', color: theme.textMuted }}>{size} · {px}px</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* 5. Shapes */}
      <DemoSection
        theme={theme}
        title="Shapes"
        description="Two shapes: circle (default) and square. Square uses a border-radius of 8px. Both work with all fallback modes."
        code={`<TkxAvatar alt="Alice Chen" initials="AC" size="lg" shape="circle" />
<TkxAvatar alt="Alice Chen" initials="AC" size="lg" shape="square" />`}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {(['circle', 'square'] as const).map((shape) => (
            <div key={shape} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <TkxAvatar key={size} alt="Alice Chen" initials="AC" size={size} shape={shape} />
                ))}
              </div>
              <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 500 }}>{shape}</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* 6. Status Indicators */}
      <DemoSection
        theme={theme}
        title="Status Indicators"
        description="A colour-coded dot in the bottom-right corner. Four states: online (green), offline (grey), away (amber), busy (pink/red)."
        code={`<TkxAvatar alt="Alice Chen" initials="AC" size="md" status="online" />
<TkxAvatar alt="Bob Martinez" initials="BM" size="md" status="offline" />
<TkxAvatar alt="Carol White" initials="CW" size="md" status="away" />
<TkxAvatar alt="David Kim" initials="DK" size="md" status="busy" />`}
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {(['online', 'offline', 'away', 'busy'] as const).map((status, i) => (
            <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <TkxAvatar
                alt={TEAM_MEMBERS[i].name}
                initials={TEAM_MEMBERS[i].initials}
                size="lg"
                status={status}
              />
              <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 500 }}>{STATUS_LABEL[status]}</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* 7. Avatar Group */}
      <DemoSection
        theme={theme}
        title="Avatar Group"
        description="Overlapping avatars using negative margin. The outer wrapper clips the overflow. An overflow count badge shows hidden members."
        code={`<div style={{ display: 'flex' }}>
  {members.slice(0, 4).map((m, i) => (
    <div key={m.name} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: members.length - i }}>
      <TkxAvatar
        alt={m.name}
        initials={m.initials}
        size="sm"
        style={{ border: \`2px solid \${theme.bg}\` }}
      />
    </div>
  ))}
  <div style={{ marginLeft: -10, zIndex: 0 }}>
    <TkxBadge variant="default">+2</TkxBadge>
  </div>
</div>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          {/* 4-avatar group */}
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: theme.textMuted }}>4 members</p>
            <div style={{ display: 'flex' }}>
              {TEAM_MEMBERS.slice(0, 4).map((m, i) => (
                <div key={m.name} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }}>
                  <TkxAvatar
                    alt={m.name}
                    initials={m.initials}
                    size="sm"
                    style={{ border: `2px solid ${theme.bg}` }}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* 6-avatar group with overflow count */}
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: theme.textMuted }}>6 members, showing 4 + overflow</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {TEAM_MEMBERS.slice(0, 4).map((m, i) => (
                <div key={m.name} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }}>
                  <TkxAvatar
                    alt={m.name}
                    initials={m.initials}
                    size="md"
                    style={{ border: `2px solid ${theme.bg}` }}
                  />
                </div>
              ))}
              <div style={{ marginLeft: -10, zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', backgroundColor: theme.surfaceAlt, border: `2px solid ${theme.bg}`, fontSize: '12px', fontWeight: 700, color: theme.textMuted }}>
                +2
              </div>
            </div>
          </div>
        </div>
      </DemoSection>

      {/* 8. User Card */}
      <DemoSection
        theme={theme}
        title="User Card"
        description="Avatar combined with name and role inside a TkxCard. The card can also include status and action buttons."
        code={`<TkxCard>
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <TkxAvatar alt="Alice Chen" initials="AC" size="lg" status="online" />
    <div>
      <p style={{ fontWeight: 600, color: theme.text }}>Alice Chen</p>
      <p style={{ color: theme.textMuted, fontSize: '13px' }}>Product Designer</p>
      <TkxBadge variant="success" size="sm">Online</TkxBadge>
    </div>
  </div>
</TkxCard>`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {TEAM_MEMBERS.slice(0, 3).map((m) => (
            <div key={m.name} style={{ padding: '16px', borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.surface, width: 200 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <TkxAvatar alt={m.name} initials={m.initials} size="lg" status={m.status} />
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '14px', color: theme.text }}>{m.name}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: theme.textMuted }}>{m.role}</p>
                </div>
              </div>
              <TkxBadge
                variant={m.status === 'online' ? 'success' : m.status === 'busy' ? 'danger' : m.status === 'away' ? 'warning' : 'default'}
                size="sm"
              >
                {STATUS_LABEL[m.status]}
              </TkxBadge>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* 9. Comment Thread */}
      <DemoSection
        theme={theme}
        title="Comment Thread"
        description="A realistic comment list where each entry shows an avatar, author name, relative timestamp, and comment body."
        code={`comments.map((c) => (
  <div key={c.author} style={{ display: 'flex', gap: 12 }}>
    <TkxAvatar alt={c.author} initials={c.initials} size="sm" />
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ fontWeight: 600 }}>{c.author}</span>
        <span style={{ fontSize: '12px', color: theme.textMuted }}>{c.time}</span>
      </div>
      <p style={{ color: theme.textMuted }}>{c.text}</p>
    </div>
  </div>
))`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {COMMENTS.map((c) => (
            <div key={c.author} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <TkxAvatar alt={c.author} initials={c.initials} size="sm" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: theme.text }}>{c.author}</span>
                  <span style={{ fontSize: '12px', color: theme.textMuted }}>{c.role}</span>
                  <span style={{ fontSize: '12px', color: theme.textMuted }}>{c.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: theme.textMuted, lineHeight: '1.6' }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* 10. Team Members Grid */}
      <DemoSection
        theme={theme}
        title="Team Members Grid"
        description="A responsive grid of avatars with names and roles. Uses initials fallback for all entries."
        code={`<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
  {team.map((m) => (
    <div key={m.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <TkxAvatar alt={m.name} initials={m.initials} size="lg" status={m.status} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 600 }}>{m.name}</p>
        <p style={{ color: theme.textMuted, fontSize: '12px' }}>{m.role}</p>
      </div>
    </div>
  ))}
</div>`}
      >
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 20 }}>
          {TEAM_MEMBERS.map((m) => (
            <div key={m.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 8px', borderRadius: 8, border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              <TkxAvatar alt={m.name} initials={m.initials} size="lg" status={m.status} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '13px', color: theme.text }}>{m.name}</p>
                <p style={{ margin: 0, fontSize: '11px', color: theme.textMuted }}>{m.role}</p>
              </div>
              <TkxBadge variant="default" size="sm">{m.department}</TkxBadge>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* Props */}
      <h2 style={h2Style}>Props</h2>
      <PropTable props={[
        { name: 'alt', type: 'string', required: true, description: 'Accessible text description. Used as the img alt attribute for photos, or aria-label for initials/icon fallbacks.' },
        { name: 'src', type: 'string', description: 'URL of the avatar image. If omitted or the image errors, the component falls back to initials or the generic icon.' },
        { name: 'initials', type: 'string', description: 'Up to two characters shown when no image is available. Only the first two characters are rendered.' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls width and height. Sizes: xs=24px, sm=32px, md=40px, lg=56px, xl=72px.' },
        { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: "Circle uses full border-radius. Square uses border-radius: 8px." },
        { name: 'status', type: "'online' | 'offline' | 'away' | 'busy'", description: 'Renders a colour-coded dot in the bottom-right corner of the avatar.' },
        { name: 'className', type: 'string', description: 'Additional class names for the wrapper div.' },
        { name: 'style', type: 'CSSProperties', description: 'Inline styles for the wrapper div. Useful for adding a border or custom sizing.' },
      ]} />

      {/* WCAG Notes */}
      <h2 style={h2Style}>Accessibility Notes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={noteStyle}><strong>Image alt text:</strong> The <code>alt</code> prop is required. For decorative avatars (e.g., next to a visible name), pass an empty string: <code>alt=""</code>. For standalone avatars, pass the person's name.</div>
        <div style={noteStyle}><strong>Initials and icon fallback:</strong> Non-image fallbacks use <code>role="img"</code> with <code>aria-label</code> set to the sanitized <code>alt</code> prop. This ensures screen readers announce the avatar as an image with a description.</div>
        <div style={noteStyle}><strong>Status colour and text:</strong> The status dot is colour-coded only. For full accessibility, pair it with a visible text label or use <code>aria-label</code> on the status element. The component sets <code>aria-label="Status: online"</code> on the dot so screen readers can announce it.</div>
        <div style={noteStyle}><strong>Avatar group:</strong> When rendering a stack of avatars, add an <code>aria-label</code> to the wrapper (e.g., "Team: Alice Chen, Bob Martinez, and 2 others") so screen reader users get a single meaningful announcement instead of individual avatar labels.</div>
      </div>
    </div>
  );
}
