import { Link } from 'react-router-dom';

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
          <p style={{ color: '#b8b8d4', fontSize: 13, margin: 0, maxWidth: 280, lineHeight: 1.65 }}>
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
          title="Try it"
          external={[
            { label: 'Interactive playground', href: '/playground/' },
            { label: 'Component catalog', href: '/book/' },
          ]}
          internal={[
            { label: '360° tour', to: '/' },
          ]}
        />

        <FooterCol
          title="Packages"
          external={[
            { label: 'tekivex-ui', href: 'https://www.npmjs.com/package/tekivex-ui' },
            { label: 'tekivex-3d', href: 'https://www.npmjs.com/package/tekivex-3d' },
            { label: 'tekivex-resume-templates', href: 'https://github.com/007krcs/tekivex-resume-templates' },
            { label: 'tekivex-biodata-templates', href: 'https://github.com/007krcs/tekivex-biodata-templates' },
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
          borderTop: '1px solid rgba(255,255,255,0.04)',
          fontSize: 12,
          color: '#666',
          textAlign: 'center',
        }}
      >
        © 2026 TekiVex UI contributors · MIT licensed · Built with{' '}
        <code style={{ color: '#00f5d4', fontFamily: 'ui-monospace, monospace' }}>tekivex-ui</code> +{' '}
        <code style={{ color: '#00f5d4', fontFamily: 'ui-monospace, monospace' }}>tekivex-3d</code>
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
        {internal?.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              style={{ color: '#dcdce8', fontSize: 13, transition: 'color 0.15s', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#00f5d4')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#dcdce8')}
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
              style={{ color: '#dcdce8', fontSize: 13, transition: 'color 0.15s' }}
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
