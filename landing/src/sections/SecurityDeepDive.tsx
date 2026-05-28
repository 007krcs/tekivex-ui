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

// Light-mode palette — see HeroPro.tsx for rationale + contrast notes.
const ACCENT        = '#0d9488';        // teal-600
const ACCENT_DARK   = '#0f766e';        // teal-700
const ACCENT_BG     = '#f0fdfa';        // teal-50
const ACCENT_BORDER = '#99f6e4';        // teal-200
const BORDER        = '#e5e7eb';        // gray-200
const SURFACE       = '#ffffff';        // card bg
const CODE_BG       = '#fafbfc';        // code block bg
const TEXT          = '#0a0a0f';
const TEXT_BODY     = '#1f2937';
const TEXT_MUTED    = '#4b5563';
const TEXT_FAINT    = '#6b7280';
const SHADOW_SM     = '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)';
const MONO          = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// Syntax tokens — all ≥ 7:1 contrast against #fafbfc.
const TOK = {
  keyword: '#7c3aed',  // violet-600
  string:  '#0d9488',  // teal-600
  fn:      '#b45309',  // amber-700
  attr:    '#0369a1',  // sky-700
  number:  '#c2410c',  // orange-700
  punct:   '#4b5563',  // gray-600
  text:    '#1f2937',  // gray-800
  comment: '#6b7280',  // gray-500
};

interface CodeLine {
  k: 'imp' | 'fn' | 'comment' | 'blank' | 'plain';
  content: React.ReactNode;
}

const codeBlockStyle: React.CSSProperties = {
  margin: 0,
  padding: '16px 18px',
  background: CODE_BG,
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
            background: ACCENT_BG,
            border: `1px solid ${ACCENT_BORDER}`,
            color: ACCENT_DARK,
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
            color: TEXT_BODY,
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
              boxShadow: SHADOW_SM,
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
                  color: TEXT_BODY,
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
                      color: TEXT_BODY,
                      padding: '8px 10px',
                      border: `1px solid #fecaca`,    // red-200
                      borderRadius: 6,
                      background: '#fef2f2',          // red-50
                    }}
                  >
                    <strong style={{ color: '#b91c1c' /* red-700 */ }}>before</strong>
                    {'  '}
                    {p.beforeAfter.before}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontFamily: MONO,
                      color: TEXT_BODY,
                      padding: '8px 10px',
                      border: `1px solid ${ACCENT_BORDER}`,
                      borderRadius: 6,
                      background: ACCENT_BG,
                    }}
                  >
                    <strong style={{ color: ACCENT_DARK }}>after</strong>
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
            color: ACCENT_DARK,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            padding: '10px 16px',
            borderRadius: 8,
            border: `1px solid ${ACCENT_BORDER}`,
            background: ACCENT_BG,
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
        .security-cta:hover { background: #ccfbf1; /* teal-100 */ }
        @media (prefers-reduced-motion: reduce) {
          .security-cta { transition: none !important; }
        }
      `}</style>
    </section>
  );
}
