export function Nav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10, 10, 15, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
        <span style={{ fontSize: 22 }}>⚡</span>
        <span className="tk-gradient-text" style={{ fontSize: 18, letterSpacing: '-0.01em' }}>
          TekiVex UI
        </span>
        <span style={{ fontSize: 11, color: '#8888aa', fontWeight: 600 }}>v3.1.0</span>
      </a>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: 14 }}>
        <a href="#features" style={navLinkStyle}>Features</a>
        <a href="#playground" style={navLinkStyle}>Playground</a>
        <a href="#tour" style={navLinkStyle}>360°</a>
        <a href="#packages" style={navLinkStyle}>Packages</a>
        <a href="/playground/" style={navLinkStyle}>Demo</a>
        <a href="/book/" style={navLinkStyle}>Book</a>
        <a
          href="https://www.npmjs.com/package/tekivex-ui"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...navLinkStyle,
            padding: '6px 14px',
            border: '1px solid rgba(0, 245, 212, 0.4)',
            borderRadius: 8,
            color: '#00f5d4',
          }}
        >
          npm →
        </a>
      </div>
    </nav>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: '#aaa',
  fontWeight: 500,
  transition: 'color 0.15s',
};
