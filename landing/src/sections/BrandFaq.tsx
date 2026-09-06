// ─────────────────────────────────────────────────────────────────────────────
// BrandFaq — keyword-dense plaintext section + FAQ accordion on the home
// page. Two SEO jobs: (1) tell Google what "Tekivex" / "TekiVex UI" / the
// package family actually is, with enough natural-language repetition that
// the brand wins for its own name; (2) emit FAQPage structured data so the
// answers show up directly in Google search results.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { JsonLd, faqSchema } from '../JsonLd';

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'What is TekiVex UI?',
    answer:
      'TekiVex UI is an open-source, MIT-licensed React component library. It ships 116 production-grade components across 13 npm packages, including primitives (Button, Card, Input, Badge), layout (Grid, Stack, Tabs), data display (Table, DataExplorer, Spreadsheet), an accessible WebGL 3D toolkit (tekivex-3d), a Holographic UI family, browser-native PDF generation (no Puppeteer or headless Chrome required), and printable resume + biodata templates. Components target WCAG 2.1 AA with WAI-ARIA APG keyboard patterns, verified by an internal APG audit (all 35 findings fixed); AAA is a tracked aspiration, not a certification.',
  },
  {
    question: 'What does Tekivex mean and who builds it?',
    answer:
      'Tekivex is the umbrella brand for the TekiVex UI ecosystem of React libraries — tekivex-ui, tekivex-3d, tekivex-pdf, and related packages. The project is maintained by an open-source collective and distributed under the MIT license at www.tekivex.com/ui.',
  },
  {
    question: 'How do I install Tekivex UI?',
    answer:
      'Run "npm install tekivex-ui" (or "yarn add tekivex-ui" / "pnpm add tekivex-ui") in any React 18 or React 19 project. For 3D and 360° components install tekivex-3d alongside it. There are zero runtime dependencies beyond React itself, and tree-shaking is fully supported so the bundle size scales with what you actually import.',
  },
  {
    question: 'Is TekiVex UI free for commercial use?',
    answer:
      'Yes. TekiVex UI ships under the MIT license, which permits commercial use, modification, redistribution, and private use without royalties. Attribution is appreciated but not required. The full license text is published on the GitHub repository and at opensource.org/licenses/MIT.',
  },
  {
    question: 'What makes Tekivex UI different from other React component libraries?',
    answer:
      'Three things. First, TekiVex UI is the first React documentation site you can browse inside a 360° WebGL environment — drag to look around, click hotspots to navigate. Second, the library includes a built-in security kernel that sanitises inputs, escapes outputs, and enforces a content-security policy by default. Third, the PDF pipeline runs entirely in the browser via the Print Layout API and an isolated iframe — no server-side Puppeteer, no headless Chromium, no per-document cost.',
  },
  {
    question: 'Does TekiVex UI support TypeScript and Server Components?',
    answer:
      'Yes. Every component ships full TypeScript declarations and is tested against TypeScript 5.9 strict mode. Components that have no client-side state are exported as React Server Components; interactive components correctly emit "use client" directives so they work without modification under Next.js App Router and similar frameworks.',
  },
  {
    question: 'Where can I see Tekivex UI components in action?',
    answer:
      'The interactive playground at www.tekivex.com/ui/playground renders every component live with editable props. The component catalog at www.tekivex.com/ui/book groups them by use case. Each component also has its own documentation page under www.tekivex.com/ui/docs with API tables, examples, accessibility notes, and a list of common pitfalls drawn from the public issue tracker.',
  },
  {
    question: 'How do I report a bug or request a feature?',
    answer:
      'File an issue on the public GitHub issue tracker at github.com/007krcs/tekivex-ui — the maintainers respond inside 24 hours on weekdays. For commercial enquiries, use the contact form at www.tekivex.com/ui/contact and the maintainers will get back to you.',
  },
];

export function BrandFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="about-tekivex"
      style={{
        padding: 'clamp(64px, 8vw, 112px) 24px',
        maxWidth: 980,
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <JsonLd data={faqSchema(FAQS)} />

      <header style={{ marginBottom: 48, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 999,
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            color: '#0f766e',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          About TekiVex UI
        </div>
        <h2
          style={{
            margin: '0 0 16px',
            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#0a0a0f',
          }}
        >
          What is <span className="tk-gradient-text">Tekivex</span>?
        </h2>
        <p
          style={{
            color: '#1f2937',
            fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.6,
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          TekiVex UI is an open-source React component library. The Tekivex
          family of npm packages — <code>tekivex-ui</code>, <code>tekivex-3d</code>, and{' '}
          <code>tekivex-pdf</code> — gives React developers a single, MIT-licensed
          source for accessible primitives, real WebGL 3D, holographic surfaces, and
          browser-native PDF. 116 components, zero runtime dependencies.
        </p>
      </header>

      {/* Brand keyword paragraph — written for humans first, but also gives Google
          enough natural co-occurrence of "Tekivex", "TekiVex UI", and the package
          names to disambiguate the brand from any unrelated string. */}
      <div
        className="tk-prose"
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: 'clamp(20px, 3vw, 32px)',
          marginBottom: 48,
          color: '#1f2937',
          fontSize: 15,
          lineHeight: 1.75,
          boxShadow:
            '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>TekiVex UI</strong> (sometimes written <strong>tekivex-ui</strong> or just{' '}
          <strong>Tekivex</strong>) is the React component library at the core of the Tekivex
          ecosystem. It is published on npm under the package name <code>tekivex-ui</code>{' '}
          and documented at <a href="https://www.tekivex.com/ui">www.tekivex.com/ui</a>. The library
          covers everything most production React applications need: form primitives, data
          tables, charts, navigation, overlays, motion, a built-in design-token system, and
          a 3D + 360° toolkit shipped as <code>tekivex-3d</code>. Every Tekivex package is
          open-source under the MIT license and ships full TypeScript declarations.
        </p>
        <p style={{ margin: '16px 0 0' }}>
          Looking for the docs? Browse the <Link to="/docs">component documentation</Link>,
          read the <Link to="/blog">engineering blog</Link>, or jump into the{' '}
          <a href="/playground/">interactive playground</a>. Want to learn about the
          project? See the <Link to="/about">About page</Link> or the{' '}
          <Link to="/contact">Contact page</Link>.
        </p>
      </div>

      <h3
        style={{
          margin: '0 0 24px',
          fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
          fontWeight: 800,
          color: '#0a0a0f',
          letterSpacing: '-0.02em',
        }}
      >
        Frequently asked questions
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FAQS.map((f, i) => {
          const open = i === openIdx;
          return (
            <div
              key={f.question}
              style={{
                background: '#ffffff',
                border: `1px solid ${open ? '#99f6e4' : '#e5e7eb'}`,
                borderRadius: 12,
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                boxShadow:
                  '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(open ? null : i)}
                aria-expanded={open}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: '#0a0a0f',
                  fontSize: 15,
                  fontWeight: 700,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span>{f.question}</span>
                <span style={{ color: '#0f766e', fontSize: 18 }}>{open ? '−' : '+'}</span>
              </button>
              {open && (
                <div
                  style={{
                    padding: '0 20px 18px',
                    color: '#1f2937',
                    fontSize: 14.5,
                    lineHeight: 1.7,
                  }}
                >
                  {f.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
