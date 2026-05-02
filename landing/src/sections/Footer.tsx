import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer
      style={{
        padding: '64px 24px 48px',
        marginTop: 48,
        borderTop: '1px solid var(--tk-border)',
        background:
          'linear-gradient(to bottom, transparent, rgba(79, 70, 229, 0.04))',
        position: 'relative',
        zIndex: 1,
        color: 'var(--tk-fg)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
          <p style={{ color: 'var(--tk-fg-muted)', fontSize: 13, margin: 0, maxWidth: 280, lineHeight: 1.65 }}>
            Production-grade React. WCAG 2.1 AAA. Real WebGL 3D. 113 components across 13
            packages. MIT.
          </p>
        </div>

        <FooterCol
          title="Product"
          internal={[
            { label: 'Documentation', to: '/docs' },
            { label: 'Engineering blog', to: '/blog' },
            { label: 'About', to: '/about' },
            { label: 'Contact', to: '/contact' },
          ]}
        />

        <FooterCol
          title="Examples"
          internal={[
            { label: 'All examples', to: '/examples' },
            { label: 'Property tour (360°)', to: '/examples/property-tour' },
            { label: 'AR product preview', to: '/examples/ar-product' },
            { label: 'Mission control', to: '/examples/mission-control' },
            { label: 'Configurable blog', to: '/examples/blog' },
          ]}
        />

        <FooterCol
          title="Packages"
          external={[
            { label: 'tekivex-ui', href: 'https://www.npmjs.com/package/tekivex-ui' },
            { label: 'tekivex-3d', href: 'https://www.npmjs.com/package/tekivex-3d' },
          ]}
        />

        <FooterCol
          title="Legal"
          internal={[
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Service', to: '/terms' },
          ]}
          external={[
            { label: 'License (MIT)', href: 'https://opensource.org/licenses/MIT' },
            { label: 'Report an issue', href: 'https://github.com/novaai0401-ui/tekivex-issue-report/issues' },
          ]}
        />
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: '48px auto 0',
          paddingTop: 24,
          borderTop: '1px solid var(--tk-border)',
          fontSize: 12,
          color: 'var(--tk-fg-muted)',
          textAlign: 'center',
        }}
      >
        © 2026 TekiVex UI contributors · MIT licensed · Built with{' '}
        <code style={{ color: 'var(--tk-prose-link)', fontFamily: 'ui-monospace, monospace' }}>tekivex-ui</code> +{' '}
        <code style={{ color: 'var(--tk-prose-link)', fontFamily: 'ui-monospace, monospace' }}>tekivex-3d</code>
      </div>
    </footer>
  );
}

interface FooterColProps {
  title: string;
  internal?: { label: string; to: string }[];
  external?: { label: string; href: string }[];
}

function FooterCol({ title, internal, external }: FooterColProps) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--tk-fg-muted)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {internal?.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              style={{ color: 'var(--tk-fg)', fontSize: 13, transition: 'color 0.15s', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--tk-prose-link)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--tk-fg)')}
            >
              {l.label}
            </Link>
          </li>
        ))}
        {external?.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              style={{ color: 'var(--tk-fg)', fontSize: 13, transition: 'color 0.15s', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--tk-prose-link)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--tk-fg)')}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
