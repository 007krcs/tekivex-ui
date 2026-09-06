import { useState, type CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';

interface Props { theme: ThemeTokens; }

// ── Article data ──────────────────────────────────────────────────────────────

interface Article {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
  tags: string[];
  author: string;
  content: React.ReactNode;
}

// ── Article components ────────────────────────────────────────────────────────

function P({ children, theme }: { children: React.ReactNode; theme: ThemeTokens }) {
  return <p style={{ fontSize: '15px', lineHeight: '1.9', color: theme.text, marginBottom: '16px' }}>{children}</p>;
}

function H2({ children, theme }: { children: React.ReactNode; theme: ThemeTokens }) {
  return <h2 style={{ fontSize: '22px', fontWeight: 700, color: theme.text, margin: '36px 0 12px', borderLeft: `3px solid ${theme.primary}`, paddingLeft: '12px' }}>{children}</h2>;
}

function H3({ children, theme }: { children: React.ReactNode; theme: ThemeTokens }) {
  return <h3 style={{ fontSize: '17px', fontWeight: 700, color: theme.text, margin: '24px 0 8px' }}>{children}</h3>;
}

function CodeBlock({ children, theme }: { children: string; theme: ThemeTokens }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <pre style={{ background: '#0d0d1a', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '20px 24px', overflowX: 'auto', fontSize: '13px', lineHeight: '1.7', color: '#e8e8f4', margin: 0 }}>
        <code>{children}</code>
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
        style={{ position: 'absolute', top: '10px', right: '10px', background: copied ? '#00f5d4' : 'transparent', border: `1px solid ${theme.border}`, borderRadius: '5px', color: copied ? '#0a0a0f' : theme.textMuted, fontSize: '11px', padding: '4px 10px', cursor: 'pointer' }}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

function Callout({ type, children, theme }: { type: 'tip' | 'warn' | 'info'; children: React.ReactNode; theme: ThemeTokens }) {
  const colors = { tip: '#00f5d4', warn: '#f59e0b', info: '#7b61ff' };
  const icons = { tip: '💡', warn: '⚠️', info: 'ℹ️' };
  const c = colors[type];
  return (
    <div style={{ padding: '16px 20px', borderRadius: '8px', background: `${c}10`, border: `1px solid ${c}30`, marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}>{icons[type]}</span>
        <div style={{ fontSize: '14px', lineHeight: '1.7', color: theme.text }}>{children}</div>
      </div>
    </div>
  );
}

function BulletList({ items, theme }: { items: string[]; theme: ThemeTokens }) {
  return (
    <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
      {items.map(item => (
        <li key={item} style={{ fontSize: '15px', lineHeight: '1.8', color: theme.text, marginBottom: '6px' }}>{item}</li>
      ))}
    </ul>
  );
}

// ── Article 1 ─────────────────────────────────────────────────────────────────

function Article1({ theme }: { theme: ThemeTokens }) {
  return (
    <>
      <P theme={theme}>
        Building accessible React components is not optional — it's a legal and moral responsibility. The Web Content Accessibility Guidelines (WCAG) 2.1 define three conformance levels: A, AA, and AAA. Most government and enterprise applications are required to meet AA. TekiVex UI targets <strong>AAA</strong> — the highest level — across all 78 components.
      </P>
      <P theme={theme}>
        This guide breaks down exactly what AAA compliance means for React developers, what WAI-ARIA 1.2 requires, and how to verify your implementation meets the bar.
      </P>

      <H2 theme={theme}>What is WCAG 2.1 AAA?</H2>
      <P theme={theme}>
        WCAG 2.1 AAA is the highest tier of accessibility conformance defined by the W3C. It includes all Level A and AA criteria plus additional requirements that together ensure access for users with a wide range of disabilities — including visual, auditory, motor, cognitive, speech, and neurological impairments.
      </P>
      <P theme={theme}>
        Key AAA criteria that affect React component development include:
      </P>
      <BulletList theme={theme} items={[
        'Contrast Enhanced (1.4.6): Text must have at least 7:1 contrast ratio (vs 4.5:1 at AA).',
        'Focus Appearance (2.4.12): Focus indicators must be at least 2px thick with 3:1 contrast.',
        'Target Size (2.5.5): Interactive targets must be at least 44×44 CSS pixels.',
        'Error Prevention (3.3.4): Forms with legal or financial impact must allow review and correction.',
        'Reading Level (3.1.5): Content above lower secondary education level needs supplementary aids.',
        'Animation from Interactions (2.3.3): Animations triggered by interaction can be disabled.',
      ]} />

      <H2 theme={theme}>WAI-ARIA 1.2 Roles, States and Properties</H2>
      <P theme={theme}>
        WAI-ARIA (Web Accessibility Initiative – Accessible Rich Internet Applications) 1.2 is the specification that bridges the gap between dynamic JavaScript-rendered content and assistive technologies like screen readers (NVDA, JAWS, VoiceOver).
      </P>

      <H3 theme={theme}>Landmark Roles</H3>
      <P theme={theme}>
        Every page should use semantic landmark roles so screen reader users can jump directly to main content. The key landmarks are: <code>banner</code>, <code>navigation</code>, <code>main</code>, <code>complementary</code>, <code>contentinfo</code>, <code>search</code>, <code>form</code>, and <code>region</code>.
      </P>
      <CodeBlock theme={theme}>{`// ✅ Good — semantic landmarks
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    {/* ... */}
  </nav>
</header>
<main id="main-content" role="main">
  {/* page content */}
</main>
<footer role="contentinfo">...</footer>

// ❌ Bad — no landmarks, screen readers can't navigate
<div class="header">
  <div class="nav">...</div>
</div>
<div class="content">...</div>`}</CodeBlock>

      <H3 theme={theme}>Live Regions for Dynamic Content</H3>
      <P theme={theme}>
        When content changes dynamically — status messages, loading states, form validation errors — you must use <code>aria-live</code> so screen readers announce the change without the user needing to navigate there.
      </P>
      <CodeBlock theme={theme}>{`// ✅ Polite — announced when idle, doesn't interrupt
<div role="status" aria-live="polite" aria-atomic="true">
  {isLoading ? 'Loading results...' : \`Found \${count} results\`}
</div>

// ✅ Assertive — interrupts immediately (use sparingly)
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>

// In TekiVex UI — TkxAIThinking uses this pattern:
<div role="status" aria-live="polite">
  {currentStep || 'Thinking...'}
</div>`}</CodeBlock>

      <H2 theme={theme}>Keyboard Navigation Patterns</H2>
      <P theme={theme}>
        All interactive components must be fully operable via keyboard alone. The WAI-ARIA Authoring Practices Guide (APG) defines patterns for every widget type. Here are the most critical patterns React developers need to implement:
      </P>

      <H3 theme={theme}>Roving tabIndex for Composite Widgets</H3>
      <P theme={theme}>
        Composite widgets (tab lists, radio groups, toolbars, menus, grids) should use a roving <code>tabIndex</code> pattern: only one child has <code>tabIndex=0</code> at a time; all others have <code>tabIndex=-1</code>. Arrow keys move focus within the widget.
      </P>
      <CodeBlock theme={theme}>{`function RovingTabGroup({ items }: { items: string[] }) {
  const [focused, setFocused] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (i + 1) % items.length;
      setFocused(next);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (i - 1 + items.length) % items.length;
      setFocused(prev);
    }
    if (e.key === 'Home') { e.preventDefault(); setFocused(0); }
    if (e.key === 'End')  { e.preventDefault(); setFocused(items.length - 1); }
  };

  return (
    <div role="tablist">
      {items.map((item, i) => (
        <button
          key={item}
          role="tab"
          tabIndex={focused === i ? 0 : -1}
          aria-selected={focused === i}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onFocus={() => setFocused(i)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}`}</CodeBlock>

      <H2 theme={theme}>Focus Management in Dialogs and Modals</H2>
      <P theme={theme}>
        When a modal opens, focus must move into it immediately. When it closes, focus must return to the triggering element. Focus must also be trapped inside the modal while it is open — users should not be able to Tab out of a modal into the background.
      </P>
      <CodeBlock theme={theme}>{`function AccessibleModal({ open, onClose, triggerRef, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // Move focus into modal when it opens
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    } else {
      // Return focus to trigger when it closes
      triggerRef.current?.focus();
    }
  }, [open]);

  // Trap focus inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusable = Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
    if (e.key === 'Escape') onClose();
  };

  return open ? (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  ) : null;
}`}</CodeBlock>

      <H2 theme={theme}>Color Contrast at AAA Level</H2>
      <P theme={theme}>
        AAA requires a 7:1 contrast ratio for normal text (smaller than 18pt / 14pt bold) and 4.5:1 for large text. TekiVex UI's default dark theme (<code>quantumDark</code>) uses:
      </P>
      <BulletList theme={theme} items={[
        'Background: #0a0a0f (near-black)',
        'Primary text: #e8e8f4 — contrast ratio 14.7:1 ✅',
        'Muted text: #a0a0b8 — contrast ratio 5.2:1 ✅ (AA, borderline AAA)',
        'Accent/primary: #00f5d4 on dark — contrast ratio 9.8:1 ✅',
        'Error red: #f72585 — contrast ratio 4.8:1 ✅ (used only for large text)',
      ]} />

      <Callout type="tip" theme={theme}>
        Use the free <a href="https://www.deque.com/axe/devtools/" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>axe DevTools browser extension</a> or <a href="https://wave.webaim.org/" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>WebAIM WAVE</a> to audit your pages in real-time. Both detect WCAG violations automatically.
      </Callout>

      <H2 theme={theme}>Reduced Motion</H2>
      <P theme={theme}>
        Users with vestibular disorders can experience nausea from animations. The CSS media query <code>prefers-reduced-motion: reduce</code> lets you respect the OS setting. Always honour it in your components.
      </P>
      <CodeBlock theme={theme}>{`/* Global CSS — disable all animations when user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* In React — check programmatically */
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const animationDuration = prefersReducedMotion ? 0 : 300;`}</CodeBlock>

      <H2 theme={theme}>Testing Accessibility</H2>
      <P theme={theme}>A complete accessibility testing strategy uses three layers:</P>
      <BulletList theme={theme} items={[
        'Automated tools — axe-core, WAVE, Lighthouse (catch ~40% of issues).',
        'Keyboard testing — tab through every interactive element manually.',
        'Screen reader testing — NVDA + Firefox, JAWS + Chrome, VoiceOver + Safari.',
      ]} />
      <CodeBlock theme={theme}>{`// Install axe for automated testing in your test suite
npm install --save-dev @axe-core/react

// In development, inject axe into React
import React from 'react';
import ReactDOM from 'react-dom';
if (process.env.NODE_ENV !== 'production') {
  const axe = await import('@axe-core/react');
  axe.default(React, ReactDOM, 1000);
}`}</CodeBlock>

      <Callout type="info" theme={theme}>
        TekiVex UI ships with built-in WCAG audit utilities. Use <code>import {'{ wcagCheck }'} from 'tekivex-ui/security'</code> to run contrast-ratio, aria-label, and focus-order checks programmatically at runtime.
      </Callout>
    </>
  );
}

// ── Article 2 ─────────────────────────────────────────────────────────────────

function Article2({ theme }: { theme: ThemeTokens }) {
  return (
    <>
      <P theme={theme}>
        Security vulnerabilities in UI component libraries are a growing threat vector. A single vulnerable component included in thousands of applications can expose millions of users to XSS attacks, data theft, and supply-chain compromises. TekiVex UI was designed from the ground up with a zero-trust security model — assuming all input is hostile until proven otherwise.
      </P>

      <H2 theme={theme}>Why UI Libraries Are a Security Risk</H2>
      <P theme={theme}>
        Most developers trust their UI library implicitly. They import a component, pass props, and assume the library handles everything safely. But popular libraries have real vulnerabilities:
      </P>
      <BulletList theme={theme} items={[
        'React-quill had stored XSS via dangerouslySetInnerHTML without sanitization (CVE-2021-28192).',
        'Several "markdown preview" components executed arbitrary JS via unsafe eval().',
        'Auto-linking libraries blindly converted href attributes, enabling javascript: URL injection.',
        'File upload components with no MIME validation allowed malicious file execution.',
      ]} />

      <H2 theme={theme}>The Zero-Trust Security Model</H2>
      <P theme={theme}>
        Zero-trust means: <em>never trust, always verify</em>. In a UI component context this translates to:
      </P>
      <BulletList theme={theme} items={[
        'Sanitize all string inputs before rendering — strip HTML tags, event handlers, javascript: URLs.',
        'Never use dangerouslySetInnerHTML without running content through DOMPurify or equivalent.',
        'Validate and restrict file types server-side AND client-side.',
        'Never use eval(), new Function(), or setTimeout with string arguments.',
        'Apply Content Security Policy (CSP) headers to block unauthorized script execution.',
        'Audit all third-party dependencies regularly with npm audit or Snyk.',
      ]} />

      <H2 theme={theme}>Input Sanitization in TekiVex UI</H2>
      <P theme={theme}>
        Every component in TekiVex UI that accepts user-controlled string content passes it through the built-in <code>sanitizeString()</code> function before rendering. Here is the implementation:
      </P>
      <CodeBlock theme={theme}>{`// src/engine/security.ts
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    // Strip all HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript: and data: URL schemes
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    // Remove event handler attributes
    .replace(/on\\w+\\s*=/gi, '')
    // Encode remaining angle brackets
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Trim
    .trim();
}

// Usage in TkxAIChatBubble:
const safeContent = sanitizeString(props.content);
return <div>{safeContent}</div>;`}</CodeBlock>

      <H2 theme={theme}>Content Security Policy (CSP)</H2>
      <P theme={theme}>
        A CSP header is the strongest defence against XSS. It tells the browser exactly which sources are allowed to execute scripts, load images, and fetch data. Add this to your server or CDN response headers:
      </P>
      <CodeBlock theme={theme}>{`# Nginx config — strict CSP for a React SPA using TekiVex UI
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' https://www.googletagmanager.com https://pagead2.googlesyndication.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://www.google-analytics.com;
  font-src 'self';
  frame-src https://googleads.g.doubleclick.net;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
" always;`}</CodeBlock>

      <Callout type="warn" theme={theme}>
        <code>'unsafe-inline'</code> for styles is required when using inline style props (as React components often do). For maximum security, extract styles to a stylesheet and remove <code>'unsafe-inline'</code>.
      </Callout>

      <H2 theme={theme}>File Upload Security</H2>
      <P theme={theme}>
        File uploads are one of the highest-risk features in any UI. The <code>TkxFileUpload</code> component validates file types on the client using both the MIME type and file extension, but client-side validation is not sufficient alone — always validate server-side too.
      </P>
      <CodeBlock theme={theme}>{`import { TkxFileUpload } from 'tekivex-ui';

// Client-side: restrict to images only
<TkxFileUpload
  accept="image/jpeg,image/png,image/webp"
  maxSize={5 * 1024 * 1024}  // 5 MB
  onUpload={(files) => {
    // Additional validation before sending to server
    files.forEach(file => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Invalid file type');
      }
    });
    // Send to server — server MUST also validate
    uploadToServer(files);
  }}
/>

// Server-side (Node.js example): always re-validate
import { fileTypeFromBuffer } from 'file-type';
app.post('/upload', async (req, res) => {
  const buffer = req.file.buffer;
  const detected = await fileTypeFromBuffer(buffer);
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!detected || !allowed.includes(detected.mime)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  // Process file...
});`}</CodeBlock>

      <H2 theme={theme}>Supply Chain Security</H2>
      <P theme={theme}>
        TekiVex UI has zero production runtime dependencies (React and ReactDOM are peer dependencies). This dramatically reduces your attack surface compared to libraries that bundle dozens of transitive dependencies.
      </P>
      <BulletList theme={theme} items={[
        '0 production runtime dependencies (beyond React peer dep).',
        'Full TypeScript — type safety catches many security mistakes at compile time.',
        'Regular npm audit checks in CI pipeline.',
        'Source code is fully open — no minified or obfuscated bundles.',
        'Provenance attestation available via npm provenance.',
      ]} />

      <Callout type="tip" theme={theme}>
        Run <code>npm audit</code> and <code>npx snyk test</code> in your CI pipeline to catch new vulnerabilities before they reach production.
      </Callout>
    </>
  );
}

// ── Article 3 ─────────────────────────────────────────────────────────────────

function Article3({ theme }: { theme: ThemeTokens }) {
  return (
    <>
      <P theme={theme}>
        React Server Components (RSC) represent the most significant architectural shift in React since hooks. Introduced in React 18 and fully productionized in Next.js 13+, RSC lets you render components entirely on the server — sending HTML to the client with zero JavaScript hydration overhead for those components.
      </P>
      <P theme={theme}>
        This has profound implications for component libraries. Not every component can be a server component. Understanding the boundary is essential for building performant, modern React applications with TekiVex UI.
      </P>

      <H2 theme={theme}>What Makes a Component "RSC-Safe"?</H2>
      <P theme={theme}>
        A component is RSC-safe (can run as a Server Component) if it does <strong>not</strong> use:
      </P>
      <BulletList theme={theme} items={[
        'React hooks (useState, useEffect, useRef, useContext, etc.)',
        'Browser-only APIs (window, document, navigator, localStorage)',
        'Event handlers (onClick, onChange, onSubmit, etc.)',
        'Third-party libraries that themselves use hooks or browser APIs',
      ]} />
      <P theme={theme}>
        If your component needs any of these, it must include the <code>"use client"</code> directive at the top — making it a Client Component.
      </P>

      <H2 theme={theme}>TekiVex UI: 13 RSC-Safe Components</H2>
      <P theme={theme}>
        Of TekiVex UI's 78 components, 13 are fully RSC-compatible — they use no hooks or browser APIs and can render entirely on the server:
      </P>
      <CodeBlock theme={theme}>{`// These components work in Next.js App Router Server Components:
import {
  TkxBadge,      // pure display chip
  TkxAvatar,     // image/initials display
  TkxDivider,    // horizontal/vertical rule
  TkxTypography, // styled text
  TkxSkeleton,   // loading placeholder
  TkxSpin,       // CSS-only spinner
  TkxEmpty,      // empty state display
  TkxStatistic,  // number display
  TkxTag,        // label chips
  TkxCard,       // content container
  TkxAlert,      // status message
  TkxProgress,   // progress bar
  TkxTimeline,   // event sequence
} from 'tekivex-ui';

// ✅ No "use client" needed — renders on the server
export default async function ProductPage() {
  const data = await fetchProduct(); // server-side data fetch
  return (
    <TkxCard>
      <TkxBadge variant="success">In Stock</TkxBadge>
      <TkxStatistic label="Price" value={data.price} prefix="$" />
    </TkxCard>
  );
}`}</CodeBlock>

      <H2 theme={theme}>Wrapping Client Components</H2>
      <P theme={theme}>
        For interactive components (like <code>TkxButton</code>, <code>TkxModal</code>, <code>TkxSelect</code>), you need a Client Component wrapper. The best practice is to keep the wrapper as small as possible — just the interactive shell, with RSC-safe children passed as props:
      </P>
      <CodeBlock theme={theme}>{`// components/InteractiveSection.tsx — Client Component
'use client';
import { useState } from 'react';
import { TkxButton, TkxModal } from 'tekivex-ui';

export function InteractiveSection({ serverContent }: { serverContent: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TkxButton onClick={() => setOpen(true)}>Open Details</TkxButton>
      <TkxModal open={open} onClose={() => setOpen(false)}>
        {serverContent}  {/* Server-rendered content passed as children */}
      </TkxModal>
    </>
  );
}

// app/product/page.tsx — Server Component
import { TkxCard, TkxStatistic } from 'tekivex-ui';
import { InteractiveSection } from '../components/InteractiveSection';

export default async function ProductPage() {
  const product = await fetchProduct();
  return (
    <InteractiveSection
      serverContent={
        // This JSX runs on the server — zero JS for these elements
        <TkxCard>
          <TkxStatistic label="Views" value={product.views} />
        </TkxCard>
      }
    />
  );
}`}</CodeBlock>

      <H2 theme={theme}>ThemeProvider in RSC Apps</H2>
      <P theme={theme}>
        The TekiVex UI <code>ThemeProvider</code> uses React context, which requires a Client Component. The recommended pattern is to wrap it in a thin client boundary at the root layout level:
      </P>
      <CodeBlock theme={theme}>{`// app/providers.tsx — thin Client Component wrapper
'use client';
import { ThemeProvider, quantumDark } from 'tekivex-ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={quantumDark}>
      {children}
    </ThemeProvider>
  );
}

// app/layout.tsx — Server Component (root layout)
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>   {/* Client Component boundary */}
          {children}  {/* Children can still be Server Components */}
        </Providers>
      </body>
    </html>
  );
}`}</CodeBlock>

      <H2 theme={theme}>Performance Benefits</H2>
      <P theme={theme}>
        Using RSC-safe components for static content and reserving Client Components for truly interactive parts yields significant performance improvements:
      </P>
      <BulletList theme={theme} items={[
        'Zero JavaScript bundle cost for server-rendered components.',
        'Streaming HTML delivery — content appears progressively.',
        'Database/API calls happen on the server — faster than client fetches.',
        'Smaller hydration payload — React only hydrates interactive components.',
        'Better Core Web Vitals: LCP, FID, and CLS all improve.',
      ]} />

      <Callout type="info" theme={theme}>
        TekiVex UI exports an <code>llms.txt</code> file at <a href="https://www.tekivex.com/ui/llms.txt" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>www.tekivex.com/ui/llms.txt</a> that documents the RSC status of every component for use with AI coding assistants like GitHub Copilot, Cursor, and Claude.
      </Callout>
    </>
  );
}

// ── Article 4 ─────────────────────────────────────────────────────────────────

function Article4({ theme }: { theme: ThemeTokens }) {
  return (
    <>
      <P theme={theme}>
        The integration of AI into user interfaces has moved from novelty to necessity. Users now expect applications to have contextual understanding, conversational interaction, and intelligent feedback. TekiVex UI shipped three purpose-built AI components — TkxAIConfidenceBar, TkxAIChatBubble, and TkxAIThinking — that handle the hardest UX problems in AI-powered interfaces.
      </P>

      <H2 theme={theme}>The UX Problem with AI Interfaces</H2>
      <P theme={theme}>
        Most AI interfaces fail users in predictable ways:
      </P>
      <BulletList theme={theme} items={[
        'No visual feedback during generation — users stare at blank screen.',
        'No indication of confidence — all answers look equally certain.',
        'Wall of text responses — no structure or visual hierarchy.',
        'Inaccessible — not readable by screen readers, no ARIA live regions.',
        'No copy functionality — users have to manually select text.',
      ]} />
      <P theme={theme}>
        TekiVex UI's AI components solve all five problems out of the box.
      </P>

      <H2 theme={theme}>TkxAIConfidenceBar — Visualizing Uncertainty</H2>
      <P theme={theme}>
        Large language models return probability scores alongside their text. Displaying these scores gives users critical context about when to trust an answer. The <code>TkxAIConfidenceBar</code> component maps raw scores (0-100) to a colour-coded meter:
      </P>
      <BulletList theme={theme} items={[
        '80–100: Teal/green — high confidence',
        '55–79: Brand blue — moderate confidence',
        '30–54: Amber — low confidence, verify before acting',
        '0–29: Red — very low, likely hallucination',
      ]} />
      <CodeBlock theme={theme}>{`import { TkxAIConfidenceBar } from 'tekivex-ui';

// Basic usage
<TkxAIConfidenceBar
  value={87}
  label="Answer confidence"
/>

// Streaming response with live confidence update
function AIResponse({ stream }) {
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    stream.onChunk(chunk => {
      setConfidence(chunk.confidence * 100);
    });
  }, [stream]);

  return (
    <TkxAIConfidenceBar
      value={confidence}
      label="Confidence"
      size="sm"
      animate
    />
  );
}`}</CodeBlock>

      <H2 theme={theme}>TkxAIChatBubble — Streaming Conversations</H2>
      <P theme={theme}>
        The chat bubble component handles both user and assistant messages with built-in streaming simulation, content sanitization, and accessibility:
      </P>
      <CodeBlock theme={theme}>{`import { TkxAIChatBubble } from 'tekivex-ui';

// User message
<TkxAIChatBubble
  role="user"
  content="What is WCAG 2.1 AAA?"
  timestamp={new Date()}
/>

// Assistant message — streaming with typewriter effect
<TkxAIChatBubble
  role="assistant"
  content="WCAG 2.1 AAA is the highest level of web accessibility conformance defined by the W3C. It requires a 7:1 contrast ratio, 44px touch targets, full keyboard operability, and much more."
  streaming          // Enables typewriter animation
  confidence={92}    // Shows confidence bar below bubble
  copyable           // Adds copy button
/>

// System message
<TkxAIChatBubble
  role="system"
  content="You are an expert React developer specializing in accessibility."
/>`}</CodeBlock>

      <H2 theme={theme}>TkxAIThinking — Processing States</H2>
      <P theme={theme}>
        The thinking indicator keeps users informed during AI processing. Four visual variants suit different contexts:
      </P>
      <CodeBlock theme={theme}>{`import { TkxAIThinking } from 'tekivex-ui';

// Simple dots animation
<TkxAIThinking variant="dots" label="Thinking..." />

// Pulse — good for full-page loading
<TkxAIThinking variant="pulse" label="Processing" />

// Wave — great for audio/speech processing UIs
<TkxAIThinking variant="wave" label="Transcribing..." />

// Orbit — flagship animation for complex operations
<TkxAIThinking
  variant="orbit"
  label="Analyzing"
  steps={[
    'Reading context...',
    'Searching knowledge base...',
    'Generating response...',
    'Verifying accuracy...',
  ]}
  active={isProcessing}
/>
// When active=false, shows green ✓ "Done"`}</CodeBlock>

      <H2 theme={theme}>Building a Complete AI Chat Interface</H2>
      <P theme={theme}>
        Here's how to combine all three components into a production-ready AI chat UI:
      </P>
      <CodeBlock theme={theme}>{`import { useState } from 'react';
import {
  TkxAIChatBubble,
  TkxAIThinking,
  TkxAIConfidenceBar,
  TkxInput,
  TkxButton,
} from 'tekivex-ui';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
}

export function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    // Call your AI API
    const response = await callYourAI(input);
    setThinking(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response.text,
      confidence: response.confidence * 100,
    }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px' }}>
      {messages.map((msg, i) => (
        <TkxAIChatBubble
          key={i}
          role={msg.role}
          content={msg.content}
          confidence={msg.confidence}
          streaming={msg.role === 'assistant'}
          copyable={msg.role === 'assistant'}
        />
      ))}

      {thinking && (
        <TkxAIThinking
          variant="orbit"
          label="Generating response"
          active
          steps={['Thinking...', 'Drafting...', 'Reviewing...']}
        />
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <TkxInput
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask anything..."
          aria-label="Message input"
        />
        <TkxButton onClick={sendMessage} disabled={thinking}>
          Send
        </TkxButton>
      </div>
    </div>
  );
}`}</CodeBlock>

      <Callout type="tip" theme={theme}>
        All three AI components are fully accessible — they use <code>role="status"</code>, <code>role="meter"</code>, and <code>aria-live="polite"</code> so screen reader users receive the same real-time feedback as sighted users.
      </Callout>
    </>
  );
}

// ── Articles array ─────────────────────────────────────────────────────────────

function getArticles(theme: ThemeTokens): Article[] {
  return [
    {
      slug: 'wcag-aaa-react',
      title: 'Building Accessible React Components: A Complete Guide to WCAG 2.1 AAA',
      subtitle: 'Everything React developers need to know about WCAG 2.1 AAA compliance, WAI-ARIA 1.2 patterns, keyboard navigation, focus management, colour contrast, and automated testing.',
      date: 'April 18, 2026',
      readTime: '14 min read',
      tags: ['Accessibility', 'WCAG', 'WAI-ARIA', 'React'],
      author: '007krcs',
      content: <Article1 theme={theme} />,
    },
    {
      slug: 'zero-trust-ui-security',
      title: 'Why Zero-Trust Security Matters in UI Component Libraries',
      subtitle: 'How XSS attacks, malicious file uploads, and supply-chain compromises exploit UI components — and how TekiVex UI prevents them with a zero-trust architecture.',
      date: 'April 15, 2026',
      readTime: '11 min read',
      tags: ['Security', 'XSS', 'CSP', 'React'],
      author: '007krcs',
      content: <Article2 theme={theme} />,
    },
    {
      slug: 'react-server-components-2026',
      title: 'React Server Components: What Every Developer Needs to Know in 2026',
      subtitle: 'A practical deep-dive into React Server Components — what makes a component RSC-safe, how to split interactive and static content, and how to use TekiVex UI with Next.js App Router.',
      date: 'April 10, 2026',
      readTime: '12 min read',
      tags: ['RSC', 'Next.js', 'Performance', 'React'],
      author: '007krcs',
      content: <Article3 theme={theme} />,
    },
    {
      slug: 'ai-ui-components-2026',
      title: 'Building AI-Powered UIs: Confidence Bars, Chat Bubbles and Thinking Indicators',
      subtitle: "A hands-on guide to TekiVex UI's three new AI components \u2014 TkxAIConfidenceBar, TkxAIChatBubble, and TkxAIThinking \u2014 with complete code examples for building production AI chat interfaces.",
      date: 'April 5, 2026',
      readTime: '10 min read',
      tags: ['AI', 'LLM', 'Components', 'React'],
      author: '007krcs',
      content: <Article4 theme={theme} />,
    },
  ];
}

// ── Article Detail View ───────────────────────────────────────────────────────

function ArticleDetail({ article, theme, onBack }: { article: Article; theme: ThemeTokens; onBack: () => void }) {
  return (
    <article style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 32px 80px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.textMuted, padding: '6px 14px', fontSize: '13px', cursor: 'pointer', marginBottom: '32px' }}
      >
        ← Back to Blog
      </button>

      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {article.tags.map(tag => (
            <span key={tag} style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: `${theme.primary}18`, color: theme.primary, border: `1px solid ${theme.primary}30` }}>
              {tag}
            </span>
          ))}
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: theme.text, margin: '0 0 16px', lineHeight: '1.25' }}>
          {article.title}
        </h1>
        <p style={{ fontSize: '17px', color: theme.textMuted, marginBottom: '20px', lineHeight: '1.6' }}>
          {article.subtitle}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: theme.textMuted, paddingBottom: '24px', borderBottom: `1px solid ${theme.border}` }}>
          <span>✍️ {article.author}</span>
          <span>📅 {article.date}</span>
          <span>⏱ {article.readTime}</span>
        </div>
      </header>

      <div>{article.content}</div>

      {/* Footer CTA */}
      <div style={{ marginTop: '60px', padding: '28px', borderRadius: '12px', background: `${theme.primary}10`, border: `1px solid ${theme.primary}30`, textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: theme.text, marginBottom: '10px' }}>
          Start building with TekiVex UI
        </h3>
        <p style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '18px' }}>
          78 accessible, production-ready React components. Free and open source.
        </p>
        <code style={{ display: 'block', background: '#0d0d1a', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '12px 20px', fontSize: '14px', color: theme.primary, marginBottom: '16px', fontFamily: 'monospace' }}>
          npm install tekivex-ui
        </code>
        <button
          onClick={onBack}
          style={{ background: theme.primary, color: '#0a0a0f', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
        >
          ← More Articles
        </button>
      </div>
    </article>
  );
}

// ── Blog Index ─────────────────────────────────────────────────────────────────

export function BlogPage({ theme }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const articles = getArticles(theme);

  const activeArticle = articles.find(a => a.slug === activeSlug);
  if (activeArticle) {
    return <ArticleDetail article={activeArticle} theme={theme} onBack={() => setActiveSlug(null)} />;
  }

  return (
    <main id="main-content" style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px 80px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '99px', background: `${theme.primary}18`, border: `1px solid ${theme.primary}40`, marginBottom: '16px' }}>
          <span style={{ color: theme.primary, fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Blog</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: theme.text, margin: '0 0 12px', lineHeight: '1.2' }}>
          TekiVex UI Blog
        </h1>
        <p style={{ fontSize: '17px', color: theme.textMuted, maxWidth: '600px', lineHeight: '1.6', margin: 0 }}>
          In-depth articles about React component development, accessibility, security, performance, and the future of AI-powered UIs.
        </p>
      </header>

      {/* Article list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {articles.map((article, index) => (
          <article
            key={article.slug}
            onClick={() => setActiveSlug(article.slug)}
            style={{
              padding: '28px 32px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              cursor: 'pointer',
              transition: 'border-color 0.2s, transform 0.2s',
              position: 'relative',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = theme.primary;
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = theme.border;
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            {index === 0 && (
              <div style={{ position: 'absolute', top: '16px', right: '20px', padding: '3px 10px', borderRadius: '99px', background: theme.primary, color: '#0a0a0f', fontSize: '11px', fontWeight: 800 }}>
                Latest
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {article.tags.map(tag => (
                <span key={tag} style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: `${theme.primary}18`, color: theme.primary, border: `1px solid ${theme.primary}30` }}>
                  {tag}
                </span>
              ))}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.text, margin: '0 0 8px', lineHeight: '1.35' }}>
              {article.title}
            </h2>
            <p style={{ fontSize: '14px', color: theme.textMuted, margin: '0 0 16px', lineHeight: '1.65' }}>
              {article.subtitle}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: theme.textMuted }}>
              <span>✍️ {article.author}</span>
              <span>📅 {article.date}</span>
              <span>⏱ {article.readTime}</span>
              <span style={{ marginLeft: 'auto', color: theme.primary, fontWeight: 600 }}>Read article →</span>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter-style CTA */}
      <div style={{ marginTop: '60px', padding: '40px 32px', borderRadius: '16px', background: `linear-gradient(135deg, ${theme.primary}12, transparent)`, border: `1px solid ${theme.primary}30`, textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: theme.text, marginBottom: '10px' }}>
          Stay up to date
        </h2>
        <p style={{ fontSize: '15px', color: theme.textMuted, marginBottom: '20px' }}>
          Follow TekiVex UI on GitHub for the latest component releases, bug fixes, and accessibility improvements.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="https://www.tekivex.com/ui"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: theme.primary, color: '#0a0a0f', border: 'none', borderRadius: '8px', padding: '11px 22px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', cursor: 'pointer' }}
          >
            ⭐ Star on GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/tekivex-ui"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '11px 22px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
          >
            📦 View on npm
          </a>
        </div>
      </div>
    </main>
  );
}
