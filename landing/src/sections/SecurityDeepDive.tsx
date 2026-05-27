/**
 * SecurityDeepDive — three SecurityCore primitives shown with real API usage.
 *
 * Each primitive gets:
 *   - Title (the actual exported function name + a short tagline)
 *   - One-paragraph explanation of when/why to reach for it
 *   - A code block showing real, copy-pasteable usage against tekivex-ui/headless
 *   - For scrubPII, an inline before/after illustration
 *
 * The code samples here are documentation, not executable — we render them as
 * static <pre><code> with lightweight <span> colouring. No syntax-highlighter
 * dependency is added.
 */

const ACCENT = '#00f5d4';
const BORDER = 'rgba(255,255,255,0.08)';
const SURFACE = 'rgba(255,255,255,0.03)';
const TEXT = '#ffffff';
const TEXT_MUTED = 'rgba(255,255,255,0.65)';
const TEXT_FAINT = 'rgba(255,255,255,0.5)';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const TOK = {
  keyword: '#c4a8ff',
  string: '#a3e9b3',
  fn: '#ffd166',
  attr: '#7dd3fc',
  number: '#ffb38a',
  punct: 'rgba(255,255,255,0.55)',
  text: '#e6e8ef',
  comment: 'rgba(255,255,255,0.42)',
};

interface CodeLine {
  k: 'imp' | 'fn' | 'comment' | 'blank' | 'plain';
  content: React.ReactNode;
}

const codeBlockStyle: React.CSSProperties = {
  margin: 0,
  padding: '16px 18px',
  background: 'rgba(0,0,0,0.40)',
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  fontFamily: MONO,
  fontSize: 12.5,
  lineHeight: 1.65,
  color: TOK.text,
  overflowX: 'auto',
};

// ── Primitive 1: scrubPII ────────────────────────────────────────────────────
const SCRUB_PII_LINES: CodeLine[] = [
  {
    k: 'imp',
    content: (
      <>
        <span style={{ color: TOK.keyword }}>import</span>
        <span>{' { '}</span>
        <span>scrubPII</span>
        <span>{' } '}</span>
        <span style={{ color: TOK.keyword }}>from</span>{' '}
        <span style={{ color: TOK.string }}>'tekivex-ui/headless'</span>
        <span style={{ color: TOK.punct }}>;</span>
      </>
    ),
  },
  { k: 'blank', content: '' },
  {
    k: 'fn',
    content: (
      <>
        <span style={{ color: TOK.fn }}>scrubPII</span>
        <span style={{ color: TOK.punct }}>(</span>
        <span style={{ color: TOK.string }}>
          'Customer: john@acme.com, card 4532-0151-1283-0366, SSN 123-45-6789'
        </span>
        <span style={{ color: TOK.punct }}>);</span>
      </>
    ),
  },
  {
    k: 'comment',
    content: (
      <>{`// → 'Customer: [redacted-email], card [redacted-card], SSN [redacted-ssn]'`}</>
    ),
  },
  { k: 'blank', content: '' },
  {
    k: 'comment',
    content: <>{`// 13-digit order ID is NOT redacted — fails Luhn:`}</>,
  },
  {
    k: 'fn',
    content: (
      <>
        <span style={{ color: TOK.fn }}>scrubPII</span>
        <span style={{ color: TOK.punct }}>(</span>
        <span style={{ color: TOK.string }}>'Order #1234567890123'</span>
        <span style={{ color: TOK.punct }}>);</span>
        {'  '}
        <span style={{ color: TOK.comment }}>{`// → unchanged`}</span>
      </>
    ),
  },
];

// ── Primitive 2: sniffMimeType ───────────────────────────────────────────────
const SNIFF_MIME_LINES: CodeLine[] = [
  {
    k: 'imp',
    content: (
      <>
        <span style={{ color: TOK.keyword }}>import</span>
        <span>{' { '}</span>
        <span>sniffMimeType</span>
        <span>{' } '}</span>
        <span style={{ color: TOK.keyword }}>from</span>{' '}
        <span style={{ color: TOK.string }}>'tekivex-ui/headless'</span>
        <span style={{ color: TOK.punct }}>;</span>
      </>
    ),
  },
  { k: 'blank', content: '' },
  {
    k: 'plain',
    content: (
      <>
        <span style={{ color: TOK.keyword }}>const</span>
        <span> file </span>
        <span style={{ color: TOK.punct }}>=</span>{' '}
        <span style={{ color: TOK.keyword }}>await</span>
        <span> fileInput.files</span>
        <span style={{ color: TOK.punct }}>?.[</span>
        <span style={{ color: TOK.number }}>0</span>
        <span style={{ color: TOK.punct }}>]?.</span>
        <span style={{ color: TOK.fn }}>arrayBuffer</span>
        <span style={{ color: TOK.punct }}>();</span>
      </>
    ),
  },
  {
    k: 'plain',
    content: (
      <>
        <span style={{ color: TOK.keyword }}>const</span>
        <span> head </span>
        <span style={{ color: TOK.punct }}>=</span>{' '}
        <span style={{ color: TOK.keyword }}>new</span>{' '}
        <span style={{ color: TOK.fn }}>Uint8Array</span>
        <span style={{ color: TOK.punct }}>(</span>
        <span>file</span>
        <span style={{ color: TOK.punct }}>).</span>
        <span style={{ color: TOK.fn }}>slice</span>
        <span style={{ color: TOK.punct }}>(</span>
        <span style={{ color: TOK.number }}>0</span>
        <span style={{ color: TOK.punct }}>, </span>
        <span style={{ color: TOK.number }}>12</span>
        <span style={{ color: TOK.punct }}>);</span>
      </>
    ),
  },
  { k: 'blank', content: '' },
  {
    k: 'fn',
    content: (
      <>
        <span style={{ color: TOK.fn }}>sniffMimeType</span>
        <span style={{ color: TOK.punct }}>(</span>
        <span>head</span>
        <span style={{ color: TOK.punct }}>);</span>
      </>
    ),
  },
  {
    k: 'comment',
    content: (
      <>{`// → 'image/png' | 'application/pdf' | 'application/zip' | null`}</>
    ),
  },
  {
    k: 'comment',
    content: (
      <>{`// PNG: 89 50 4E 47 · JPEG: FF D8 FF · PDF: 25 50 44 46 ...`}</>
    ),
  },
];

// ── Primitive 3: audit() ─────────────────────────────────────────────────────
const AUDIT_LINES: CodeLine[] = [
  {
    k: 'imp',
    content: (
      <>
        <span style={{ color: TOK.keyword }}>import</span>
        <span>{' { '}</span>
        <span>audit, getAuditLog, verifyAuditIntegrity</span>
        <span>{' } '}</span>
        <span style={{ color: TOK.keyword }}>from</span>{' '}
        <span style={{ color: TOK.string }}>'tekivex-ui/headless'</span>
        <span style={{ color: TOK.punct }}>;</span>
      </>
    ),
  },
  { k: 'blank', content: '' },
  {
    k: 'fn',
    content: (
      <>
        <span style={{ color: TOK.fn }}>audit</span>
        <span style={{ color: TOK.punct }}>(</span>
        <span style={{ color: TOK.string }}>'payment.refund'</span>
        <span style={{ color: TOK.punct }}>, </span>
        <span style={{ color: TOK.string }}>'BillingPanel'</span>
        <span style={{ color: TOK.punct }}>, {'{ '}</span>
        <span style={{ color: TOK.attr }}>orderId</span>
        <span style={{ color: TOK.punct }}>: </span>
        <span style={{ color: TOK.string }}>'ord_123'</span>
        <span style={{ color: TOK.punct }}>, </span>
        <span style={{ color: TOK.attr }}>amount</span>
        <span style={{ color: TOK.punct }}>: </span>
        <span style={{ color: TOK.number }}>4990</span>
        <span style={{ color: TOK.punct }}> {'}'});</span>
      </>
    ),
  },
  {
    k: 'fn',
    content: (
      <>
        <span style={{ color: TOK.fn }}>audit</span>
        <span style={{ color: TOK.punct }}>(</span>
        <span style={{ color: TOK.string }}>'user.delete'</span>
        <span style={{ color: TOK.punct }}>, </span>
        <span style={{ color: TOK.string }}>'AdminUsers'</span>
        <span style={{ color: TOK.punct }}>, {'{ '}</span>
        <span style={{ color: TOK.attr }}>userId</span>
        <span style={{ color: TOK.punct }}>: </span>
        <span style={{ color: TOK.string }}>'usr_456'</span>
        <span style={{ color: TOK.punct }}> {'}'});</span>
      </>
    ),
  },
  { k: 'blank', content: '' },
  {
    k: 'fn',
    content: (
      <>
        <span style={{ color: TOK.fn }}>verifyAuditIntegrity</span>
        <span style={{ color: TOK.punct }}>();</span>
        {'        '}
        <span style={{ color: TOK.comment }}>{`// → true (chain intact)`}</span>
      </>
    ),
  },
  {
    k: 'fn',
    content: (
      <>
        <span style={{ color: TOK.fn }}>getAuditLog</span>
        <span style={{ color: TOK.punct }}>({'{ '}</span>
        <span style={{ color: TOK.attr }}>component</span>
        <span style={{ color: TOK.punct }}>: </span>
        <span style={{ color: TOK.string }}>'BillingPanel'</span>
        <span style={{ color: TOK.punct }}> {'}'});</span>
      </>
    ),
  },
  {
    k: 'comment',
    content: (
      <>{`// → [{ timestamp, action: 'payment.refund', propsHash, chainHash }]`}</>
    ),
  },
];

function CodeBlock({ lines, ariaLabel }: { lines: CodeLine[]; ariaLabel: string }) {
  return (
    <pre style={codeBlockStyle} aria-label={ariaLabel}>
      <code>
        {lines.map((l, i) => {
          if (l.k === 'blank') return <div key={i}>{' '}</div>;
          if (l.k === 'comment') {
            return (
              <div key={i} style={{ color: TOK.comment }}>
                {l.content}
              </div>
            );
          }
          return <div key={i}>{l.content}</div>;
        })}
      </code>
    </pre>
  );
}

interface Primitive {
  title: string;
  body: string;
  lines: CodeLine[];
  ariaLabel: string;
  beforeAfter?: { before: string; after: string };
}

const PRIMITIVES: Primitive[] = [
  {
    title: 'scrubPII() — regex + Luhn-validated credit cards',
    body:
      'Strips SSN, credit cards (mod-10 validated to avoid false positives on order IDs), email, phone, and API keys before they hit your LLM, your logs, or your analytics.',
    lines: SCRUB_PII_LINES,
    ariaLabel: 'Example: using scrubPII to redact email, credit card, and SSN.',
    beforeAfter: {
      before: 'Customer: john@acme.com, card 4532-0151-1283-0366, SSN 123-45-6789',
      after:
        'Customer: [redacted-email], card [redacted-card], SSN [redacted-ssn]',
    },
  },
  {
    title: 'sniffMimeType() — verify file signatures, not Content-Type',
    body:
      'Reads the first 12 bytes of an uploaded file to verify the actual format. Defends against Content-Type spoofing and polyglot files. Used internally by TkxFileUpload.',
    lines: SNIFF_MIME_LINES,
    ariaLabel: 'Example: using sniffMimeType to detect a file format from its magic bytes.',
  },
  {
    title: 'audit() — SHA-256 hash-chained, verifiable in O(n)',
    body:
      "Every audit entry hashes the previous entry's chain hash + the new event payload. Mutating any entry breaks the chain. Useful for SOC 2 audit evidence, HIPAA event logs, and any 'who did what when' requirement.",
    lines: AUDIT_LINES,
    ariaLabel: 'Example: emitting audit events and verifying chain integrity.',
  },
];

export function SecurityDeepDive() {
  return (
    <section
      id="security-deep-dive"
      aria-labelledby="security-deep-dive-heading"
      style={{
        padding: '96px 24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 56 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 999,
            background: 'rgba(0, 245, 212, 0.08)',
            border: `1px solid ${ACCENT}33`,
            color: ACCENT,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            marginBottom: 16,
          }}
        >
          SECURITYCORE
        </div>
        <h2
          id="security-deep-dive-heading"
          style={{
            fontSize: 'clamp(1.9rem, 3.8vw, 2.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            margin: '0 auto 14px',
            maxWidth: 760,
            color: TEXT,
          }}
        >
          Three primitives every regulated app needs
        </h2>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: TEXT_MUTED,
            maxWidth: 640,
            margin: '0 auto',
          }}
        >
          PII redaction, file-signature verification, and tamper-evident audit
          trails &mdash; available from a single import, with no transitive
          dependencies in the headless entry point.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {PRIMITIVES.map((p) => (
          <article
            key={p.title}
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              background: SURFACE,
              padding: 24,
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 18,
            }}
            className="security-card"
          >
            <div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  margin: '0 0 8px',
                  color: TEXT,
                  fontFamily: MONO,
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: TEXT_MUTED,
                  margin: 0,
                  maxWidth: 640,
                }}
              >
                {p.body}
              </p>
              {p.beforeAfter && (
                <div
                  style={{
                    marginTop: 14,
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11.5,
                      fontFamily: MONO,
                      color: TEXT_FAINT,
                      padding: '8px 10px',
                      border: `1px solid ${BORDER}`,
                      borderRadius: 6,
                      background: 'rgba(255, 80, 80, 0.04)',
                    }}
                  >
                    <strong style={{ color: '#ff8c8c' }}>before</strong>
                    {'  '}
                    {p.beforeAfter.before}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontFamily: MONO,
                      color: TEXT_FAINT,
                      padding: '8px 10px',
                      border: `1px solid ${BORDER}`,
                      borderRadius: 6,
                      background: 'rgba(0, 245, 212, 0.04)',
                    }}
                  >
                    <strong style={{ color: ACCENT }}>after</strong>
                    {'   '}
                    {p.beforeAfter.after}
                  </div>
                </div>
              )}
            </div>
            <CodeBlock lines={p.lines} ariaLabel={p.ariaLabel} />
          </article>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <a
          href="/docs/security-threat-model"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: ACCENT,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            padding: '10px 16px',
            borderRadius: 8,
            border: `1px solid ${ACCENT}33`,
            transition: 'background 200ms ease-out',
          }}
          className="security-cta"
        >
          Read the full threat model →
        </a>
      </div>

      <style>{`
        @media (min-width: 960px) {
          .security-card {
            grid-template-columns: 1fr 1fr !important;
            gap: 28px !important;
            align-items: start;
          }
        }
        .security-cta:hover { background: rgba(0, 245, 212, 0.08); }
        @media (prefers-reduced-motion: reduce) {
          .security-cta { transition: none !important; }
        }
      `}</style>
    </section>
  );
}
