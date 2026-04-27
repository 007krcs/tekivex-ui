import type { CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxCard, TkxCardHeader, TkxCardBody, TkxBadge, TkxButton, TkxDivider } from 'tekivex-ui';

// ─────────────────────────────────────────────────────────────────────────────
// EcosystemPage — advertises the four companion packages that ship with the
// v3.0 platform. They are built + tested in this repo but not yet
// published to npm; we publish on demand.
//
//   @tekivex/security-core      — standalone security kernel
//   @tekivex/audit              — CLI static-analysis scanner
//   create-tekivex-app          — scaffolder with CSP + SecurityCore presets
//   @tekivex/figma-kit          — Figma token + variant exports
// ─────────────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

interface Pkg {
  name: string;
  tagline: string;
  description: string;
  status: 'preview' | 'stable';
  install: string;
  repoPath: string;
  features: string[];
  example?: { title: string; code: string };
}

const PACKAGES: Pkg[] = [
  {
    name: 'tekivex-security-core',
    tagline: 'The security kernel — framework-agnostic, zero runtime deps',
    description:
      'Every attack-class defense that ships with tekivex-ui, extracted as its own package. Use it in a React app, a Node service, a Deno edge function — anywhere JavaScript runs.',
    status: 'stable',
    install: 'npm install tekivex-security-core',
    repoPath: 'packages/security-core',
    features: [
      'sanitizeHref() — URL scheme allow-list (blocks javascript:, data:)',
      'sanitizeUnicode() — homoglyph + bidi-override defense (CVE-2021-42574)',
      'scrubPII() — email / phone / SSN / credit-card redaction',
      'createRateLimiter() — token-bucket implementation',
      'fnv1aHash() — audit-trail hashing',
      'installTrustedTypes() / installFrameBuster() — hardening installers',
      'Pure TypeScript, zero dependencies, sideEffects: false',
    ],
    example: {
      title: 'Sanitize a URL in any framework',
      code: `import { sanitizeHref } from 'tekivex-security-core';

const safe = sanitizeHref(userSuppliedUrl);
// safe is guaranteed http(s)/mailto/tel, or empty string

<a href={safe}>{label}</a>`,
    },
  },
  {
    name: 'tekivex-audit',
    tagline: 'Static-analysis CLI — 15 security + a11y checks, OWASP/CWE refs',
    description:
      'Scans any React codebase for the attack classes and accessibility regressions that ESLint plugins miss. Shippable as CI gate. Dogfooded on our own demo — first run surfaced 9 errors and 67 warnings in our own code.',
    status: 'stable',
    install: 'npx tekivex-audit .',
    repoPath: 'packages/tekivex-audit',
    features: [
      'SEC-001 dangerouslySetInnerHTML without DOMPurify',
      'SEC-002 href="javascript:…" scheme',
      'SEC-003 eval() / new Function()',
      'SEC-004 hardcoded API keys and tokens',
      'SEC-005 auth tokens in localStorage',
      'SEC-006 target="_blank" without rel="noopener"',
      'SEC-007 missing Content-Security-Policy meta tag',
      'A11Y-001 <img> without alt',
      'A11Y-002 empty <button>',
      'A11Y-003 onClick on <div> / <span>',
      'A11Y-005 <input> without <label>',
      'A11Y-007 autoFocus on page load',
      '… and more — every finding maps to OWASP / CWE / WCAG',
    ],
    example: {
      title: 'Run in CI',
      code: `# .github/workflows/audit.yml
- run: npx tekivex-audit . --fail-on warn --format md --out audit.md
- uses: actions/upload-artifact@v4
  with: { name: audit-report, path: audit.md }`,
    },
  },
  {
    name: 'create-tekivex-app',
    tagline: 'Scaffolder — React + Vite + tekivex-ui, pre-wired',
    description:
      'One command, two templates: "basic" for fast start, "secure" with CSP meta tag, Trusted Types installer, and live SecurityCore demos already assembled. Both include TypeScript strict mode, git init, and dependency install.',
    status: 'stable',
    install: 'npm create tekivex-app@latest my-app',
    repoPath: 'packages/create-tekivex-app',
    features: [
      'Two templates: basic + secure',
      'Secure template ships CSP + Trusted Types + frame-buster',
      'Live SecurityCore demos in secure template (sanitizeHref, scrubPII)',
      'TypeScript strict, Vite 6, React 19',
      'Auto git init + initial commit',
      '--no-install, --no-git, --template flags',
      'npm create, pnpm create, yarn create all work',
    ],
    example: {
      title: 'Start a new secure app',
      code: `npm create tekivex-app@latest my-secure-app -- --template secure
cd my-secure-app
npm run dev`,
    },
  },
  {
    name: '@tekivex/figma-kit',
    tagline: 'Machine-readable design tokens + variant catalog',
    description:
      'Regenerates from the real source whenever colors, spacing, or component signatures change. Designers and engineers read the same JSON — no hand-maintained duplication, no drift.',
    status: 'preview',
    install: 'npm install -D @tekivex/figma-kit',
    repoPath: 'packages/figma-kit',
    features: [
      'tokens.figma.json — W3C Design Tokens draft format',
      '57 tokens × 2 themes (quantumDark, auroraLight)',
      'variants.json — 69 components, 13,103 variant combinations',
      'Imports into Figma via Tokens Studio plugin',
      'Regeneration is idempotent — run on every release',
      'Source of truth: src/themes/index.ts + src/components/',
    ],
    example: {
      title: 'Import into Figma',
      code: `# Regenerate
npx @tekivex/figma-kit build

# Output files
packages/figma-kit/dist/tokens.figma.json
packages/figma-kit/dist/variants.json

# In Figma → Tokens Studio plugin → Import JSON`,
    },
  },
];

const REPO_URL = 'https://github.com/007krcs/tekivex-ui';

export function EcosystemPage({ theme }: Props) {
  const page: CSSProperties = {
    padding: '48px clamp(16px, 4vw, 48px) 80px',
    maxWidth: 1100,
    margin: '0 auto',
    color: theme.text,
  };
  const h1: CSSProperties = {
    fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    margin: '0 0 12px',
  };
  const lead: CSSProperties = {
    color: theme.textMuted,
    fontSize: 17,
    lineHeight: 1.7,
    margin: '0 0 48px',
    maxWidth: 780,
  };
  const installBox: CSSProperties = {
    background: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    padding: '12px 16px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 13,
    color: theme.primary,
    overflowX: 'auto',
    margin: '12px 0',
  };
  const codeBlock: CSSProperties = {
    background: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    padding: '14px 16px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12.5,
    color: theme.text,
    overflowX: 'auto',
    whiteSpace: 'pre',
    lineHeight: 1.55,
    margin: '10px 0 0',
  };

  return (
    <div style={page}>
      <h1 style={h1}>Ecosystem</h1>
      <p style={lead}>
        Four companion packages that ship alongside <strong>tekivex-ui</strong>. Three are <strong>live on npm</strong> — install with the commands shown below and they just work. The fourth (<code>@tekivex/figma-kit</code>) is still source-only and ships on demand; the others are stable and version-pinned.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
        <TkxBadge variant="primary" outlined>v3.0 platform</TkxBadge>
        <TkxBadge variant="success">open source</TkxBadge>
        <TkxBadge variant="info">MIT licensed</TkxBadge>
        <TkxBadge variant="success">3 of 4 live on npm</TkxBadge>
      </div>

      {PACKAGES.map((pkg, i) => (
        <section key={pkg.name} style={{ marginBottom: 56 }}>
          <TkxCard variant="glass" padding="lg">
            <TkxCardHeader
              title={
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <code style={{ fontSize: 20, fontWeight: 800, color: theme.primary }}>{pkg.name}</code>
                  <TkxBadge variant={pkg.status === 'stable' ? 'success' : 'warning'} size="sm">
                    {pkg.status}
                  </TkxBadge>
                </div>
              }
              subtitle={pkg.tagline}
            />
            <TkxCardBody>
              <p style={{ color: theme.textMuted, lineHeight: 1.7, margin: '0 0 16px', fontSize: 15 }}>
                {pkg.description}
              </p>

              <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 16, marginBottom: 4 }}>
                {pkg.status === 'stable' ? 'Install:' : 'Install (once published):'}
              </div>
              <pre style={installBox}>$ {pkg.install}</pre>

              <TkxDivider />

              <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 700, fontSize: 14 }}>Features</div>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20, color: theme.text, lineHeight: 1.9, fontSize: 14 }}>
                {pkg.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              {pkg.example && (
                <>
                  <div style={{ marginTop: 16, marginBottom: 4, fontWeight: 700, fontSize: 14 }}>
                    {pkg.example.title}
                  </div>
                  <pre style={codeBlock}>{pkg.example.code}</pre>
                </>
              )}

              <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a
                  href={`${REPO_URL}/tree/master/${pkg.repoPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <TkxButton variant="outline" size="sm" colorScheme="primary">
                    View source →
                  </TkxButton>
                </a>
                <a
                  href={`${REPO_URL}/issues/new?title=Publish+request:+${encodeURIComponent(pkg.name)}&body=I'd+like+to+install+${encodeURIComponent(pkg.name)}+from+npm.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <TkxButton variant="ghost" size="sm" colorScheme="secondary">
                    Request publish
                  </TkxButton>
                </a>
              </div>
            </TkxCardBody>
          </TkxCard>
          {i < PACKAGES.length - 1 && <div style={{ height: 8 }} />}
        </section>
      ))}

      {/* ── Why not published yet? ─────────────────────────────────────── */}
      <TkxCard variant="outlined" padding="lg">
        <TkxCardBody>
          <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 800 }}>Why "publish on demand"?</h2>
          <p style={{ color: theme.textMuted, lineHeight: 1.75, margin: '0 0 12px', fontSize: 15 }}>
            Every npm package is a maintenance commitment — CVEs to triage, breaking changes to manage, release notes to write. We publish when there's a real consumer waiting, not speculatively. The code exists and is tested in this repo today; the GitHub source is production-ready.
          </p>
          <p style={{ color: theme.textMuted, lineHeight: 1.75, margin: 0, fontSize: 15 }}>
            Need one on npm? <a href={`${REPO_URL}/issues/new`} style={{ color: theme.primary }}>Open an issue</a> — we'll tag + publish within 48 hours.
          </p>
        </TkxCardBody>
      </TkxCard>
    </div>
  );
}
