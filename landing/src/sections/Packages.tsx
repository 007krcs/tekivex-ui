interface Pkg {
  name: string;
  version: string;
  desc: string;
  install: string;
  isNew?: boolean;
}

const PACKAGES: Pkg[] = [
  { name: 'tekivex-ui', version: '3.1.0', desc: '99 components, WCAG AAA, security kernel.', install: 'npm i tekivex-ui', isNew: true },
  { name: 'tekivex-3d', version: '0.1.0', desc: 'WebGL 3D, 360°, AR/VR with three.js.',     install: 'npm i tekivex-3d three', isNew: true },
  { name: 'tekivex-pdf', version: '0.1.2', desc: 'React → PDF without Puppeteer.',           install: 'npm i tekivex-pdf' },
  { name: 'tekivex-templates', version: '0.1.2', desc: '7 PDF layouts ready to use.',         install: 'npm i tekivex-templates' },
  { name: 'tekivex-form', version: '0.1.1', desc: 'Form-only slim install (24 inputs).',      install: 'npm i tekivex-form' },
  { name: 'tekivex-india', version: '0.1.2', desc: 'Aadhaar, PAN, INR lakh/crore, Tithi.',    install: 'npm i tekivex-india' },
  { name: 'tekivex-finance', version: '0.1.2', desc: 'Payments, OTP, KYC, statements.',       install: 'npm i tekivex-finance' },
  { name: 'tekivex-content', version: '0.1.2', desc: 'Signature, watermark, SEO, markdown.',  install: 'npm i tekivex-content' },
  { name: 'tekivex-security-core', version: '0.1.2', desc: 'Standalone security primitives.', install: 'npm i tekivex-security-core' },
  { name: 'tekivex-audit', version: '0.1.2', desc: 'CI static-analysis CLI for React.',       install: 'npx tekivex-audit .' },
  { name: 'create-tekivex-app', version: '0.1.2', desc: 'Project scaffolder (basic + secure).', install: 'npm create tekivex-app@latest' },
  { name: 'tekivex-add', version: '0.1.1', desc: 'shadcn-style: copy a component\'s source.',  install: 'npx tekivex-add button' },
];

export function Packages() {
  return (
    <section
      id="packages"
      style={{ padding: '88px 24px 48px', maxWidth: 1280, margin: '0 auto' }}
    >
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 12px',
          }}
        >
          12 packages on <span className="tk-gradient-text">npm</span>
        </h2>
        <p style={{ color: '#888', maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
          All unscoped, all under <code style={{ color: '#00f5d4' }}>tekivex-*</code>, all live
          today. Click through to npm for full API + version history.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
        }}
      >
        {PACKAGES.map((p) => (
          <a
            key={p.name}
            href={`https://www.npmjs.com/package/${p.name}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '20px 22px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(18,18,26,0.6)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
              display: 'block',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00f5d4';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 245, 212, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <code
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#00f5d4',
                  fontFamily: 'monospace',
                }}
              >
                {p.name}
              </code>
              <span style={{ color: '#666', fontSize: 11, fontFamily: 'monospace' }}>
                {p.version}
              </span>
              {p.isNew && (
                <span
                  style={{
                    padding: '2px 8px',
                    background: 'rgba(0, 245, 212, 0.15)',
                    color: '#00f5d4',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 999,
                    letterSpacing: '0.05em',
                    marginLeft: 'auto',
                  }}
                >
                  NEW
                </span>
              )}
            </div>
            <p style={{ color: '#bbb', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>
              {p.desc}
            </p>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#666',
                padding: '6px 10px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 6,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {p.install}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
