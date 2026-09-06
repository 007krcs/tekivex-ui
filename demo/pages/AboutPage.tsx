import type { CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxCard, TkxCardBody, TkxBadge, TkxDivider, TkxButton, TkxProgress } from 'tekivex-ui';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface Props { theme: ThemeTokens }

// ── Data ────────────────────────────────────────────────────────────────────

const PRINCIPLES = [
  {
    icon: '🛡️',
    title: 'Zero-Trust Security',
    desc: 'Every prop is sanitized. Every string is escaped. Every audit event is logged with cryptographic integrity verification. Security is not an afterthought — it is the foundation.',
  },
  {
    icon: '♿',
    title: 'WCAG 2.1 AAA Compliance',
    desc: 'Every component meets the highest accessibility standard out of the box. Full WAI-ARIA 1.2 support, keyboard navigation, screen reader announcements, and reduced motion preferences.',
  },
  {
    icon: '⚡',
    title: 'Quantum-Class Performance',
    desc: 'LRU caching, FNV-1a hashing, batch updates, and memoized computations. Our rendering engine is built for enterprise-scale applications with millions of users.',
  },
  {
    icon: '🎨',
    title: 'Themeable Architecture',
    desc: 'Complete design token system with dark and light themes. Every color, spacing, and typography value is configurable. Build your brand identity without touching component internals.',
  },
  {
    icon: '🧩',
    title: 'Composable Components',
    desc: '40+ production-ready components designed to work together. From basic buttons to advanced date pickers, command palettes, and video players — everything you need.',
  },
  {
    icon: '📐',
    title: 'TKX CSS Engine',
    desc: 'Our utility-first CSS engine generates atomic, conflict-free styles at runtime. Zero cascade issues, zero specificity wars. Better than Tailwind — purpose-built for React.',
  },
];

const STATS = [
  { label: 'Components', value: '40+' },
  { label: 'WCAG Level', value: 'AAA' },
  { label: 'Bundle Size', value: '84 KB' },
  { label: 'TypeScript', value: '100%' },
  { label: 'Dependencies', value: '0' },
  { label: 'Test Coverage', value: '95%+' },
];

const TEAM = [
  { name: '007krcs', role: 'Creator & Lead Engineer', avatar: '🧑‍💻' },
];

const ROADMAP = [
  { feature: 'Data Grid (AG-Grid level)', progress: 65, status: 'In Progress' },
  { feature: 'Form Builder', progress: 40, status: 'In Progress' },
  { feature: 'Chart Components', progress: 25, status: 'Planning' },
  { feature: 'Drag & Drop System', progress: 15, status: 'Planning' },
  { feature: 'AI Component Generator', progress: 10, status: 'Research' },
  { feature: 'Figma Plugin', progress: 5, status: 'Research' },
];

// ── Component ───────────────────────────────────────────────────────────────

export function AboutPage({ theme }: Props) {
  const bp = useBreakpoint();

  const s = {
    page: {
      maxWidth: 960,
      margin: '0 auto',
      padding: bp.isMobile ? '32px 16px 64px' : '48px 32px 80px',
      color: theme.text,
    } as CSSProperties,
    hero: {
      textAlign: 'center' as const,
      marginBottom: bp.isMobile ? 40 : 64,
    } as CSSProperties,
    heroTitle: {
      fontSize: bp.isMobile ? '2rem' : '2.75rem',
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
      margin: '0 0 16px',
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.info})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    } as CSSProperties,
    heroSub: {
      fontSize: bp.isMobile ? 15 : 17,
      color: theme.textMuted,
      lineHeight: 1.7,
      maxWidth: 640,
      margin: '0 auto 24px',
    } as CSSProperties,
    section: {
      marginBottom: bp.isMobile ? 40 : 56,
    } as CSSProperties,
    sectionTitle: {
      fontSize: bp.isMobile ? '1.3rem' : '1.6rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginBottom: 8,
    } as CSSProperties,
    sectionSub: {
      fontSize: 14,
      color: theme.textMuted,
      lineHeight: 1.6,
      marginBottom: 24,
    } as CSSProperties,
    grid3: {
      display: 'grid',
      gridTemplateColumns: bp.isMobile ? '1fr' : bp.isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      gap: bp.isMobile ? 16 : 20,
    } as CSSProperties,
    grid6: {
      display: 'grid',
      gridTemplateColumns: bp.isMobile ? 'repeat(2, 1fr)' : bp.isTablet ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
      gap: bp.isMobile ? 12 : 16,
    } as CSSProperties,
    statCard: {
      textAlign: 'center' as const,
      padding: bp.isMobile ? '16px 12px' : '20px 16px',
      borderRadius: 10,
      border: `1px solid ${theme.border}`,
      background: theme.surface,
    } as CSSProperties,
    statValue: {
      fontSize: bp.isMobile ? '1.5rem' : '1.8rem',
      fontWeight: 800,
      color: theme.primary,
      letterSpacing: '-0.03em',
    } as CSSProperties,
    statLabel: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 4,
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
    } as CSSProperties,
    principleIcon: {
      fontSize: 28,
      marginBottom: 12,
    } as CSSProperties,
    principleTitle: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 6,
    } as CSSProperties,
    principleDesc: {
      fontSize: 13,
      color: theme.textMuted,
      lineHeight: 1.6,
    } as CSSProperties,
    roadmapRow: {
      display: 'flex',
      alignItems: bp.isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      flexDirection: bp.isMobile ? 'column' as const : 'row' as const,
      gap: bp.isMobile ? 8 : 16,
      padding: '14px 0',
      borderBottom: `1px solid ${theme.border}`,
    } as CSSProperties,
    roadmapLabel: {
      fontSize: 14,
      fontWeight: 600,
      flex: 1,
    } as CSSProperties,
    roadmapBar: {
      flex: bp.isMobile ? undefined : 1,
      width: bp.isMobile ? '100%' : undefined,
    } as CSSProperties,
    missionBox: {
      padding: bp.isMobile ? 24 : 40,
      borderRadius: 16,
      border: `1px solid ${theme.border}`,
      background: `linear-gradient(135deg, ${theme.primary}08, ${theme.info}08)`,
      textAlign: 'center' as const,
    } as CSSProperties,
  };

  return (
    <div style={s.page}>

      {/* ── Hero ── */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>
          Enterprise-Grade React Components
        </h1>
        <p style={s.heroSub}>
          TekiVex UI is an open-source, zero-dependency React component library built for
          teams that demand the highest standards of accessibility, security, and performance.
          Designed from the ground up for production applications at any scale.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <TkxBadge variant="success">Open Source</TkxBadge>
          <TkxBadge variant="primary">MIT Licensed</TkxBadge>
          <TkxBadge variant="info">TypeScript First</TkxBadge>
          <TkxBadge variant="warning">Zero Dependencies</TkxBadge>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={s.section}>
        <div style={s.grid6}>
          {STATS.map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <div style={s.statValue}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <TkxDivider />

      {/* ── Mission ── */}
      <div style={{ ...s.section, marginTop: bp.isMobile ? 40 : 56 }}>
        <div style={s.missionBox}>
          <h2 style={{ ...s.sectionTitle, marginBottom: 16 }}>Our Mission</h2>
          <p style={{ fontSize: bp.isMobile ? 14 : 16, color: theme.textMuted, lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
            To provide every React developer with a component library that doesn't compromise.
            Enterprise teams shouldn't have to choose between accessibility, security, and developer
            experience. TekiVex UI delivers all three — out of the box, with zero configuration.
          </p>
        </div>
      </div>

      {/* ── Core Principles ── */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Core Principles</h2>
        <p style={s.sectionSub}>The foundational pillars that guide every decision we make.</p>
        <div style={s.grid3}>
          {PRINCIPLES.map((p) => (
            <TkxCard key={p.title}>
              <TkxCardBody>
                <div style={s.principleIcon}>{p.icon}</div>
                <div style={s.principleTitle}>{p.title}</div>
                <div style={s.principleDesc}>{p.desc}</div>
              </TkxCardBody>
            </TkxCard>
          ))}
        </div>
      </div>

      <TkxDivider />

      {/* ── Enterprise Features ── */}
      <div style={{ ...s.section, marginTop: bp.isMobile ? 40 : 56 }}>
        <h2 style={s.sectionTitle}>Built for Enterprise</h2>
        <p style={s.sectionSub}>Features that matter for production applications serving millions of users.</p>
        <div style={{ display: 'grid', gridTemplateColumns: bp.isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          {[
            { title: 'SOC 2 Ready', desc: 'Audit logging, input sanitization, and cryptographic integrity checks built into the framework.' },
            { title: 'Bundle Optimized', desc: 'Tree-shakeable ES modules. Only ship the components you use. 84 KB gzipped for the full library.' },
            { title: 'Design Token System', desc: 'Complete theme architecture with CSS custom properties. Consistent design language across your entire application.' },
            { title: 'SSR Compatible', desc: 'Server-side rendering support out of the box. Works with Next.js, Remix, and any React SSR framework.' },
            { title: 'Internationalization Ready', desc: 'RTL support, locale-aware formatting, and string sanitization for global applications.' },
            { title: 'CI/CD Friendly', desc: 'Automated accessibility audits, security scans, and visual regression tests you can run in your pipeline.' },
          ].map((item) => (
            <div key={item.title} style={{ padding: bp.isMobile ? 16 : 20, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surface }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <TkxDivider />

      {/* ── Roadmap ── */}
      <div style={{ ...s.section, marginTop: bp.isMobile ? 40 : 56 }}>
        <h2 style={s.sectionTitle}>Roadmap</h2>
        <p style={s.sectionSub}>What we're building next. Community feedback drives our priorities.</p>
        <TkxCard>
          <TkxCardBody>
            {ROADMAP.map((item) => (
              <div key={item.feature} style={s.roadmapRow}>
                <div style={s.roadmapLabel}>{item.feature}</div>
                <div style={s.roadmapBar}>
                  <TkxProgress value={item.progress} variant={item.progress > 50 ? 'success' : item.progress > 20 ? 'primary' : 'warning'} />
                </div>
                <TkxBadge variant={item.status === 'In Progress' ? 'success' : item.status === 'Planning' ? 'info' : 'warning'} size="sm">
                  {item.status}
                </TkxBadge>
              </div>
            ))}
          </TkxCardBody>
        </TkxCard>
      </div>

      <TkxDivider />

      {/* ── Team ── */}
      <div style={{ ...s.section, marginTop: bp.isMobile ? 40 : 56 }}>
        <h2 style={s.sectionTitle}>Created By</h2>
        <p style={s.sectionSub}>Built with passion for the React ecosystem.</p>
        {TEAM.map((member) => (
          <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surface }}>
            <div style={{ fontSize: 36 }}>{member.avatar}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{member.name}</div>
              <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>{member.role}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <TkxButton variant="outline" size="sm" onClick={() => window.open('https://www.tekivex.com/ui', '_blank')}>
                  GitHub
                </TkxButton>
                <TkxButton variant="outline" size="sm" onClick={() => window.open('https://www.npmjs.com/package/tekivex-ui', '_blank')}>
                  npm
                </TkxButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div style={{ ...s.missionBox, marginTop: bp.isMobile ? 40 : 56 }}>
        <h2 style={{ fontSize: bp.isMobile ? 20 : 24, fontWeight: 700, marginBottom: 12 }}>Ready to Build?</h2>
        <p style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.7, marginBottom: 20, maxWidth: 480, margin: '0 auto 20px' }}>
          Get started in seconds. Install the package and start building enterprise-grade interfaces.
        </p>
        <div style={{ fontFamily: 'monospace', fontSize: 14, padding: '12px 20px', borderRadius: 8, background: theme.surfaceAlt, border: `1px solid ${theme.border}`, display: 'inline-block', marginBottom: 16 }}>
          npm install tekivex-ui
        </div>
      </div>

    </div>
  );
}
