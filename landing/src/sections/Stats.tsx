const STATS = [
  { value: '115', label: 'Production components' },
  { value: '13', label: 'npm packages' },
  { value: '1,777', label: 'Tests passing' },
  { value: 'AAA', label: 'WCAG 2.1 target' },
  { value: '0', label: 'Runtime deps in core' },
  { value: 'MIT', label: 'License' },
];

export function Stats() {
  return (
    <section
      style={{
        padding: '32px 24px',
        maxWidth: 1280,
        margin: '0 auto',
      }}
    >
      <div
        className="tk-glass"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 0,
          padding: '24px',
          borderRadius: 16,
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              textAlign: 'center',
              padding: '12px',
              borderRight:
                i < STATS.length - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none',
            }}
            className="stat-cell"
          >
            <div
              className="tk-gradient-text"
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#888',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: 6,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 720px) {
          .stat-cell { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .stat-cell:last-child { border-bottom: none; }
        }
      `}</style>
    </section>
  );
}
