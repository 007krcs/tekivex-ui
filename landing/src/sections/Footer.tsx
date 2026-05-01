export function Footer() {
  return (
    <footer
      style={{
        padding: '64px 24px 48px',
        marginTop: 48,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background:
          'linear-gradient(to bottom, transparent, rgba(196, 168, 255, 0.04))',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 32,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 22 }} aria-hidden="true">⚡</span>
            <span className="tk-gradient-text">TekiVex UI</span>
          </div>
          <p style={{ color: '#b8b8d4', fontSize: 13, margin: 0, maxWidth: 280, lineHeight: 1.65 }}>
            Production-grade React. WCAG 2.1 AAA. Real WebGL 3D. 113 components across 13 packages. MIT.
          </p>
        </div>

        <FooterCol
          title="Try it"
          links={[
            { label: 'Playground (this page)', href: '#playground' },
            { label: 'Interactive demo', href: '/playground/' },
            { label: 'Component catalog', href: '/book/' },
            { label: '360° tour', href: '#tour' },
          ]}
        />

        <FooterCol
          title="Packages"
          links={[
            { label: 'tekivex-ui', href: 'https://www.npmjs.com/package/tekivex-ui' },
            { label: 'tekivex-3d', href: 'https://www.npmjs.com/package/tekivex-3d' },
            { label: 'tekivex-pdf', href: 'https://www.npmjs.com/package/tekivex-pdf' },
            { label: 'All 13 packages', href: '#packages' },
          ]}
        />

        <FooterCol
          title="Support"
          links={[
            { label: 'Report an issue', href: 'https://github.com/novaai0401-ui/tekivex-issue-report/issues' },
            { label: 'Request a feature', href: 'https://github.com/novaai0401-ui/tekivex-issue-report/issues/new' },
            { label: 'License (MIT)', href: 'https://opensource.org/licenses/MIT' },
          ]}
        />
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: '48px auto 0',
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.04)',
          fontSize: 12,
          color: '#666',
          textAlign: 'center',
        }}
      >
        © 2026 · MIT licensed · Built with tekivex-ui + tekivex-3d
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: '#888',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              style={{
                color: '#dcdce8',
                fontSize: 13,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#00f5d4')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#dcdce8')}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
