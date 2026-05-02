import { Link, useLocation } from 'react-router-dom';
import { useImmersive } from '../immersive-context';

export function Nav() {
  const { open: openImmersive } = useImmersive();
  const { pathname } = useLocation();
  const onHome = pathname === '/';

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 24px',
        borderBottom: '1px solid var(--tk-border)',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <Link
        to="/"
        style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, textDecoration: 'none' }}
      >
        <span style={{ fontSize: 22 }} aria-hidden="true">⚡</span>
        <span className="tk-gradient-text" style={{ fontSize: 18, letterSpacing: '-0.01em' }}>
          TekiVex UI
        </span>
      </Link>

      <div
        style={{
          display: 'flex',
          gap: 18,
          alignItems: 'center',
          fontSize: 14,
          flexWrap: 'wrap',
        }}
      >
        <Link to="/docs"   style={navLinkStyle(pathname.startsWith('/docs'))}>Docs</Link>
        <Link to="/blog"   style={navLinkStyle(pathname.startsWith('/blog'))}>Blog</Link>
        <Link to="/about"  style={navLinkStyle(pathname === '/about')}>About</Link>
        <Link to="/contact" style={navLinkStyle(pathname === '/contact')}>Contact</Link>
        {onHome && (
          <button
            type="button"
            onClick={openImmersive}
            style={{
              padding: '6px 14px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(124, 58, 237, 0.08))',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              borderRadius: 8,
              color: '#4f46e5',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              fontFamily: 'inherit',
            }}
          >
            🌐 360° mode
          </button>
        )}
        <a
          href="https://www.npmjs.com/package/tekivex-ui"
          target="_blank"
          rel="noopener noreferrer"
          style={navLinkStyle(false)}
        >
          npm →
        </a>
      </div>
    </nav>
  );
}

function navLinkStyle(active: boolean): React.CSSProperties {
  return {
    color: active ? '#4f46e5' : '#475569',
    fontWeight: active ? 700 : 500,
    transition: 'color 0.15s',
    textDecoration: 'none',
  };
}
