import type { CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { CodeBlock } from '../layout/CodeBlock';

// ── Types ─────────────────────────────────────────────────────────────────────

interface HomePageProps {
  theme: ThemeTokens;
}

// ── Quick start code snippet ──────────────────────────────────────────────────

const QUICK_START_CODE = `import { ThemeProvider, TkxButton, TkxCard, TkxCardHeader,
  TkxCardBody, quantumDark } from '@tekivex/ui';

export function App() {
  return (
    <ThemeProvider theme={quantumDark}>
      <TkxCard variant="elevated">
        <TkxCardHeader>
          <h2>Hello, TekiVex UI</h2>
        </TkxCardHeader>
        <TkxCardBody>
          <TkxButton variant="solid" colorScheme="primary">
            Launch Demo
          </TkxButton>
        </TkxCardBody>
      </TkxCard>
    </ThemeProvider>
  );
}`;

// ── TKX vs Tailwind comparison data ──────────────────────────────────────────

const COMPARISON_ROWS = [
  {
    feature: 'Conflict resolution',
    tkx: 'TRUE atomic merge — last value wins, no cascade',
    tailwind: 'Cascade-dependent — requires cn() / clsx hacks',
    tkxWins: true,
  },
  {
    feature: 'DOM class count',
    tkx: 'Single merged class per element',
    tailwind: 'Dozens of classes per element',
    tkxWins: true,
  },
  {
    feature: 'Theme tokens',
    tkx: 'text-primary auto-follows ThemeContext at runtime',
    tailwind: 'Static CSS variables, no React context awareness',
    tkxWins: true,
  },
  {
    feature: 'Motion safety',
    tkx: 'transition-* silently no-ops on prefers-reduced-motion',
    tailwind: 'Manual motion-safe: prefix required on every class',
    tkxWins: true,
  },
  {
    feature: 'WCAG integration',
    tkx: 'Dev-time contrast warnings for unsafe color combos',
    tailwind: 'None — you must audit manually',
    tkxWins: true,
  },
  {
    feature: 'Build requirement',
    tkx: 'Zero — no PostCSS, no purge, no config, no plugin',
    tailwind: 'PostCSS + tailwind.config.js + purge setup',
    tkxWins: true,
  },
  {
    feature: 'SSR support',
    tkx: 'Works identically on server and client',
    tailwind: 'Requires careful hydration / SSR config',
    tkxWins: true,
  },
  {
    feature: 'TypeScript',
    tkx: 'Fully typed utility strings with autocomplete',
    tailwind: 'Partial — tailwind-merge lacks full type coverage',
    tkxWins: true,
  },
  {
    feature: 'Arbitrary values',
    tkx: 'w-[42px], bg-[#ff0000], delay-[300ms]',
    tailwind: 'Same syntax',
    tkxWins: false,
  },
];

// ── Stat card data ─────────────────────────────────────────────────────────────

const STATS = [
  { value: '14', label: 'Components', color: '#00f5d4' },
  { value: '52+', label: 'Source files', color: '#7b2ff7' },
  { value: '0', label: 'Runtime deps', color: '#f72585' },
  { value: '100%', label: 'TypeScript', color: '#ffbe0b' },
];

// ── Feature card data ─────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '⚡',
    title: 'Quantum Engine',
    description:
      'FNV-1a hashing, LRU caching, and memoized style generation. ' +
      'Atomic CSS conflict resolution at the property level — not the cascade.',
    color: '#00f5d4',
  },
  {
    icon: '♿',
    title: 'WCAG 2.1 AAA',
    description:
      'Every component meets the highest accessibility standard. ' +
      'WAI-ARIA 1.2 roles, live regions, focus traps, and contrast ratios ≥ 7:1.',
    color: '#7b2ff7',
  },
  {
    icon: '🔒',
    title: 'Zero-Trust Security',
    description:
      'Immutable audit logging, prop sanitisation, XSS prevention, ' +
      'and cryptographic audit trail verification on every render.',
    color: '#f72585',
  },
  {
    icon: '🎨',
    title: 'TKX CSS System',
    description:
      'Better than Tailwind: true conflict resolution, theme-aware tokens, ' +
      'motion safety, and zero build config. Runs on server and client identically.',
    color: '#ffbe0b',
  },
];

// ── HomePage component ────────────────────────────────────────────────────────

export function HomePage({ theme }: HomePageProps) {
  const pageStyle: CSSProperties = {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '48px 32px 80px',
  };

  // Hero section
  const heroStyle: CSSProperties = {
    textAlign: 'center',
    marginBottom: '72px',
    padding: '0 16px',
  };

  const heroBadgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    backgroundColor: `${theme.primary}15`,
    color: theme.primary,
    border: `1px solid ${theme.primary}35`,
    marginBottom: '24px',
  };

  const heroTitleStyle: CSSProperties = {
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
    fontWeight: 800,
    lineHeight: '1.1',
    letterSpacing: '-0.03em',
    margin: '0 0 20px',
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const heroSubtitleStyle: CSSProperties = {
    fontSize: '1.1rem',
    color: theme.textMuted,
    maxWidth: '580px',
    margin: '0 auto 32px',
    lineHeight: '1.7',
  };

  const heroActionsStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
  };

  const primaryBtnStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 22px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: theme.primary,
    color: theme.bg,
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'opacity 0.15s ease, transform 0.15s ease',
    letterSpacing: '0.01em',
  };

  const ghostBtnStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 22px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    backgroundColor: 'transparent',
    color: theme.text,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'border-color 0.15s ease',
    letterSpacing: '0.01em',
  };

  // Section header
  const sectionHeaderStyle: CSSProperties = {
    marginBottom: '28px',
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: theme.text,
    margin: '0 0 6px',
    letterSpacing: '-0.02em',
  };

  const sectionDescStyle: CSSProperties = {
    fontSize: '14px',
    color: theme.textMuted,
    margin: 0,
  };

  // Grid layouts
  const featureGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '72px',
  };

  const statGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '72px',
  };

  const featureCardStyle = (color: string): CSSProperties => ({
    padding: '24px',
    borderRadius: '12px',
    border: `1px solid ${color}25`,
    backgroundColor: `${color}06`,
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  });

  const featureIconStyle: CSSProperties = {
    fontSize: '2rem',
    marginBottom: '12px',
    display: 'block',
  };

  const featureTitleStyle: CSSProperties = {
    fontSize: '15px',
    fontWeight: 700,
    color: theme.text,
    margin: '0 0 8px',
  };

  const featureDescStyle: CSSProperties = {
    fontSize: '13px',
    color: theme.textMuted,
    lineHeight: '1.6',
    margin: 0,
  };

  const statCardStyle = (color: string): CSSProperties => ({
    padding: '20px',
    borderRadius: '12px',
    border: `1px solid ${color}20`,
    backgroundColor: `${color}06`,
    textAlign: 'center',
  });

  const statValueStyle = (color: string): CSSProperties => ({
    fontSize: '2.2rem',
    fontWeight: 800,
    color: color,
    letterSpacing: '-0.03em',
    lineHeight: '1',
    marginBottom: '4px',
    display: 'block',
  });

  const statLabelStyle: CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    color: theme.textMuted,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  // Comparison table
  const tableWrapStyle: CSSProperties = {
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
    overflow: 'hidden',
    marginBottom: '72px',
  };

  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  };

  const thStyle: CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: theme.textMuted,
    backgroundColor: theme.surfaceAlt,
    borderBottom: `1px solid ${theme.border}`,
  };

  const thTkxStyle: CSSProperties = {
    ...thStyle,
    color: theme.primary,
    backgroundColor: `${theme.primary}08`,
  };

  const tdStyle = (isLast: boolean): CSSProperties => ({
    padding: '10px 16px',
    borderBottom: isLast ? 'none' : `1px solid ${theme.border}`,
    verticalAlign: 'top',
    lineHeight: '1.5',
  });

  const winBadgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    backgroundColor: `${theme.success}18`,
    color: theme.success,
    marginLeft: '6px',
    letterSpacing: '0.04em',
    verticalAlign: 'middle',
  };

  // Quick start section
  const quickStartStyle: CSSProperties = {
    marginBottom: '72px',
  };

  const installRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
    marginBottom: '16px',
    fontFamily:
      '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
    fontSize: '13px',
  };

  const promptStyle: CSSProperties = {
    color: theme.primary,
    fontWeight: 700,
    userSelect: 'none',
    flexShrink: 0,
  };

  const installCmdStyle: CSSProperties = {
    color: theme.text,
    flex: 1,
  };

  // Navigation links section
  const navCardsStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  };

  const navCardStyle: CSSProperties = {
    padding: '16px 20px',
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
  };

  const navCardTitleStyle: CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.text,
    margin: '0 0 4px',
  };

  const navCardDescStyle: CSSProperties = {
    fontSize: '12px',
    color: theme.textMuted,
    margin: 0,
    lineHeight: '1.5',
  };

  const divStyle: CSSProperties = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '56px 0',
    opacity: 0.6,
  };

  return (
    <div style={pageStyle}>
      {/* ── Hero ── */}
      <section style={heroStyle} aria-labelledby="hero-title">
        <div style={heroBadgeStyle}>
          <span>⚡</span>
          Quantum-Class Component Framework
        </div>

        <h1 id="hero-title" style={heroTitleStyle}>
          TekiVex UI
        </h1>

        <p style={heroSubtitleStyle}>
          A zero-dependency, WCAG 2.1 AAA component library for React with a
          built-in atomic CSS engine that beats Tailwind on every dimension that matters.
        </p>

        <div style={heroActionsStyle}>
          <a
            href="#/getting-started"
            style={primaryBtnStyle}
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '/getting-started';
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = '0.88')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = '1')
            }
          >
            Get Started →
          </a>
          <a
            href="#/components/button"
            style={ghostBtnStyle}
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '/components/button';
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = theme.primary)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = theme.border)
            }
          >
            Browse Components
          </a>
          <a
            href="#/css-system"
            style={ghostBtnStyle}
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '/css-system';
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = theme.secondary)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = theme.border)
            }
          >
            TKX CSS System
          </a>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section aria-labelledby="features-title">
        <div style={sectionHeaderStyle}>
          <h2 id="features-title" style={sectionTitleStyle}>
            Core Capabilities
          </h2>
          <p style={sectionDescStyle}>
            Four pillars that make TekiVex UI uniquely powerful.
          </p>
        </div>

        <div style={featureGridStyle}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={featureCardStyle(f.color)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${f.color}50`;
                (e.currentTarget as HTMLElement).style.backgroundColor = `${f.color}10`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${f.color}25`;
                (e.currentTarget as HTMLElement).style.backgroundColor = `${f.color}06`;
              }}
            >
              <span style={featureIconStyle} aria-hidden="true">
                {f.icon}
              </span>
              <h3 style={featureTitleStyle}>{f.title}</h3>
              <p style={featureDescStyle}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* ── Stats ── */}
      <section aria-label="Quick statistics">
        <div style={statGridStyle}>
          {STATS.map((s) => (
            <div key={s.label} style={statCardStyle(s.color)}>
              <span style={statValueStyle(s.color)} aria-label={`${s.value} ${s.label}`}>
                {s.value}
              </span>
              <span style={statLabelStyle}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why TKX beats Tailwind ── */}
      <section aria-labelledby="comparison-title">
        <div style={sectionHeaderStyle}>
          <h2 id="comparison-title" style={sectionTitleStyle}>
            Why TKX Beats Tailwind
          </h2>
          <p style={sectionDescStyle}>
            Head-to-head comparison on the features that matter in production.
          </p>
        </div>

        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle} scope="col">Feature</th>
                <th style={thTkxStyle} scope="col">TKX (TekiVex)</th>
                <th style={thStyle} scope="col">Tailwind CSS</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => {
                const isLast = i === COMPARISON_ROWS.length - 1;
                return (
                  <tr
                    key={row.feature}
                    style={{
                      backgroundColor:
                        i % 2 === 1 ? `${theme.surfaceAlt}50` : 'transparent',
                    }}
                  >
                    <td
                      style={{
                        ...tdStyle(isLast),
                        fontWeight: 600,
                        color: theme.textMuted,
                        width: '18%',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.feature}
                    </td>
                    <td
                      style={{
                        ...tdStyle(isLast),
                        color: theme.text,
                        backgroundColor: `${theme.primary}04`,
                      }}
                    >
                      {row.tkx}
                      {row.tkxWins && <span style={winBadgeStyle}>WIN</span>}
                    </td>
                    <td style={{ ...tdStyle(isLast), color: theme.textMuted }}>
                      {row.tailwind}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Quick start ── */}
      <section style={quickStartStyle} aria-labelledby="quickstart-title">
        <div style={sectionHeaderStyle}>
          <h2 id="quickstart-title" style={sectionTitleStyle}>
            Quick Start
          </h2>
          <p style={sectionDescStyle}>
            Up and running in under two minutes.
          </p>
        </div>

        <div style={installRowStyle}>
          <span style={promptStyle}>$</span>
          <span style={installCmdStyle}>npm install @tekivex/ui</span>
        </div>

        <CodeBlock
          code={QUICK_START_CODE}
          language="tsx"
          showLineNumbers
          title="App.tsx"
        />
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* ── Navigation cards ── */}
      <section aria-labelledby="explore-title">
        <div style={sectionHeaderStyle}>
          <h2 id="explore-title" style={sectionTitleStyle}>
            Explore
          </h2>
        </div>

        <div style={navCardsStyle}>
          {[
            {
              route: '/getting-started',
              title: 'Getting Started',
              desc: 'Install, configure, and ship your first component.',
            },
            {
              route: '/css-system',
              title: 'TKX CSS System',
              desc: 'Full docs for the atomic CSS engine.',
            },
            {
              route: '/components/button',
              title: 'Components',
              desc: '14 accessible components, fully documented.',
            },
            {
              route: '/templates/dashboard',
              title: 'Templates',
              desc: 'Full-page layout templates ready to fork.',
            },
          ].map((card) => (
            <a
              key={card.route}
              href={`#${card.route}`}
              style={navCardStyle}
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = card.route;
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = theme.primary;
                (e.currentTarget as HTMLElement).style.backgroundColor = `${theme.primary}06`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = theme.border;
                (e.currentTarget as HTMLElement).style.backgroundColor = theme.surface;
              }}
            >
              <p style={navCardTitleStyle}>{card.title} →</p>
              <p style={navCardDescStyle}>{card.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
