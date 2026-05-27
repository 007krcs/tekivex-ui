// ─────────────────────────────────────────────────────────────────────────────
// OpenSourceFooter — neutral attribution block shown at the bottom of each
// example. Frames every example as a learning project / open-source library
// rather than a sales surface.
//
// Reads simply as:  "this is an MIT-licensed React component library; here's
// how to use it; here's how to file a bug." A buyer who wants help integrating
// will follow the Contact link to find the maintainer's email; nothing about
// the page promises a deployment service or a paid offering.
// ─────────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';

export function OpenSourceFooter() {
  return (
    <section
      aria-label="About this example"
      style={{
        marginTop: 40,
        padding: '24px clamp(20px, 3vw, 28px)',
        borderRadius: 14,
        background: '#f8fafc',
        border: '1px solid #e6e8ef',
        color: '#1a1f2e',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#4f46e5',
              marginBottom: 8,
            }}
          >
            About this example
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#475569' }}>
            Built with{' '}
            <a
              href="https://www.npmjs.com/package/tekivex-ui"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4f46e5', fontWeight: 600 }}
            >
              tekivex-ui
            </a>
            {' '}and{' '}
            <a
              href="https://www.npmjs.com/package/tekivex-3d"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4f46e5', fontWeight: 600 }}
            >
              tekivex-3d
            </a>
            . Open source under the{' '}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4f46e5' }}
            >
              MIT license
            </a>
            {' '}— free to use, modify, and ship in your own projects.
          </p>
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: 8,
            }}
          >
            Try it yourself
          </div>
          <code
            style={{
              display: 'block',
              padding: '8px 12px',
              background: '#0f172a',
              color: '#a5f3fc',
              borderRadius: 6,
              fontSize: 12.5,
              fontFamily: 'ui-monospace, monospace',
              marginBottom: 8,
            }}
          >
            npm install tekivex-ui tekivex-3d
          </code>
          <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>
            Found a bug or have an idea?{' '}
            <a
              href="https://github.com/007krcs/tekivex-ui/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4f46e5' }}
            >
              Open an issue
            </a>
            {' '}or{' '}
            <Link to="/contact" style={{ color: '#4f46e5' }}>
              get in touch
            </Link>
            .
          </div>
        </div>
      </div>
    </section>
  );
}
