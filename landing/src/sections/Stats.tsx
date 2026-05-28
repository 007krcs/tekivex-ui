// Light-theme Stats — clean numbers card on white. Border + subtle shadow
// (no glass blur on light bg). Numbers in teal-700 for ~6:1 contrast.

const STATS = [
  { value: '115',   label: 'Production components' },
  { value: '13',    label: 'npm packages' },
  { value: '1,798', label: 'Tests passing' },
  { value: '44',    label: 'Locales' },
  { value: '0',     label: 'Runtime deps in core' },
  { value: 'MIT',   label: 'License' },
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
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 0,
          padding: '24px',
          borderRadius: 16,
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow:
            '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              textAlign: 'center',
              padding: '12px',
              borderRight:
                i < STATS.length - 1 ? '1px solid #f1f3f5' : 'none',
            }}
            className="stat-cell"
          >
            <div
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: '#0f766e', // teal-700, ~6:1 on white
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#4b5563', // gray-600, ~9:1 on white (AAA)
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
          .stat-cell { border-right: none !important; border-bottom: 1px solid #f1f3f5; }
          .stat-cell:last-child { border-bottom: none; }
        }
      `}</style>
    </section>
  );
}
