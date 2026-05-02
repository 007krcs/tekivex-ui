// ─────────────────────────────────────────────────────────────────────────────
// BusinessCTA — sales-oriented call-to-action shown at the bottom of every
// commercial use-case example. Tells the visitor exactly how to reach the
// Tekivex team if they want this in their own product.
// ─────────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';

export interface BusinessCTAProps {
  /** Vertical the example demonstrates — used in the headline. */
  vertical: string;
  /** Short pitch in the second sentence. */
  pitch: string;
  /** Optional hue accent (defaults to indigo-cyan). */
  hue?: [string, string];
}

export function BusinessCTA({ vertical, pitch, hue = ['#4f46e5', '#06b6d4'] }: BusinessCTAProps) {
  const subject = encodeURIComponent(`[TekiVex UI] Demo request — ${vertical}`);
  const body = encodeURIComponent(
    `Hi Tekivex team,\n\nI saw the ${vertical} example at https://ui.tekivex.com/examples and would like to discuss using it for my product.\n\nA bit about us:\n- Company:\n- Use case:\n- Timeline:\n\nThanks,\n`,
  );

  return (
    <section
      aria-labelledby="cta-heading"
      style={{
        marginTop: 40,
        padding: 'clamp(24px, 4vw, 40px)',
        borderRadius: 18,
        background: `linear-gradient(135deg, ${hue[0]}, ${hue[1]})`,
        color: '#ffffff',
        boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.18), transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 32,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
        className="biz-cta-row"
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              opacity: 0.85,
              marginBottom: 8,
            }}
          >
            For your business
          </div>
          <h2
            id="cta-heading"
            style={{
              margin: '0 0 10px',
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Want a {vertical.toLowerCase()} like this for your product?
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.65,
              opacity: 0.95,
              maxWidth: 720,
            }}
          >
            {pitch} The TekiVex team builds production deployments on top of the open-source library —
            white-labelled, integrated with your CRM / catalogue / data pipeline, and ready to ship in
            2–6 weeks. Book a 15-minute call and we'll walk you through it.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
          <a
            href={`mailto:hello@tekivex.com?subject=${subject}&body=${body}`}
            className="biz-cta-primary"
          >
            ✉ Email hello@tekivex.com
          </a>
          <Link to="/contact" className="biz-cta-secondary">
            📅 Schedule a 15-min demo
          </Link>
          <a
            href="https://www.npmjs.com/package/tekivex-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="biz-cta-secondary"
          >
            ⚙ Just want the code? npm
          </a>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          marginTop: 28,
          paddingTop: 20,
          borderTop: '1px solid rgba(255, 255, 255, 0.18)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          fontSize: 13.5,
          lineHeight: 1.55,
        }}
      >
        <BulletRow
          icon="⚡"
          title="2–6 week deployments"
          body="Most production rollouts ship inside one sprint cycle. Bigger integrations measured in months, not quarters."
        />
        <BulletRow
          icon="🔒"
          title="White-label, your domain"
          body="Runs on your subdomain with your branding. We never touch your customer data — you own it end-to-end."
        />
        <BulletRow
          icon="🛠"
          title="MIT-licensed core"
          body="Every line of the underlying library is open source. No lock-in; your team can fork it any day."
        />
        <BulletRow
          icon="🤝"
          title="Direct line to maintainers"
          body="You talk to the people who write the code. No support tier filtering — engineers respond inside 24h."
        />
      </div>

      <Style hueA={hue[0]} hueB={hue[1]} />
    </section>
  );
}

function BulletRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 800, marginBottom: 2 }}>{title}</div>
        <div style={{ opacity: 0.92 }}>{body}</div>
      </div>
    </div>
  );
}

function Style({ hueA, hueB }: { hueA: string; hueB: string }) {
  return (
    <style>{`
      .biz-cta-primary {
        display: inline-block; padding: 12px 18px; border-radius: 10px;
        background: #ffffff; color: ${hueA};
        font-weight: 800; font-size: 14px; text-decoration: none;
        text-align: center;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .biz-cta-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.18);
      }
      .biz-cta-secondary {
        display: inline-block; padding: 11px 18px; border-radius: 10px;
        background: rgba(255,255,255,0.12); color: #ffffff;
        font-weight: 700; font-size: 13.5px; text-decoration: none;
        text-align: center;
        border: 1px solid rgba(255,255,255,0.4);
        transition: background 0.15s;
      }
      .biz-cta-secondary:hover { background: rgba(255,255,255,0.22); }
      @media (max-width: 720px) {
        .biz-cta-row { grid-template-columns: 1fr !important; }
      }
      /* Suppress unused warnings — referenced via interpolation */
      .biz-cta-hueA-${hueA.replace('#','')} { color: ${hueA}; }
      .biz-cta-hueB-${hueB.replace('#','')} { color: ${hueB}; }
    `}</style>
  );
}
