import { PageShell } from './PageShell';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../use-page-meta';

export const meta = {
  title: 'About TekiVex UI — Open-source React components built for production',
  description:
    'TekiVex UI is a React component library covering 113 production primitives, a WebGL 3D toolkit, a Holographic UI family, and a printable-template pipeline. Read why we built it and how we plan to keep it maintained.',
};

export function About() {
  usePageMeta(meta.title, meta.description);
  return (
    <PageShell
      title="About TekiVex UI"
      eyebrow="About"
      subtitle="Why we built it, what's in it, and how we keep it maintained."
      breadcrumbs={[{ label: 'About' }]}
      updated="2026-05-02"
    >
      <p>
        TekiVex UI is an open-source React component library that grew out of frustration with the
        tradeoffs in the existing ecosystem. We wanted production-grade accessibility without
        having to wire it ourselves on top of an unstyled "headless" library. We wanted real
        WebGL components instead of CSS-shadow approximations of 3D. We wanted printable
        document templates that didn't require a Puppeteer round-trip in our serverless
        backend. And we wanted all of that in one place, MIT-licensed, with a roadmap that
        honored "shipped" over "promised."
      </p>

      <p>
        After two years and 113 components, we think the result is worth sharing more widely.
        This page covers what's in the library, the principles behind it, and how we plan to
        keep it sustainable.
      </p>

      <h2>What's in the library</h2>
      <p>The TekiVex UI family is split across several packages so consumers only pay for what they use.</p>
      <ul>
        <li>
          <strong><code>tekivex-ui</code></strong> — the main package. 113 production primitives:
          buttons, inputs, badges, modals, tabs, tooltips, autocomplete, color picker, OTP
          input, file upload, charts (via a thin Recharts wrapper), masonry, watermarks, an
          accessibility checker, and the new productivity components (FlowChart, MindMap,
          Spreadsheet, Gantt, PivotTable, DataExplorer, Kanban, RichEditor, ThemeStudio,
          CommandPalette).
        </li>
        <li>
          <strong><code>tekivex-3d</code></strong> — a WebGL toolkit built directly on
          three.js (no React-Three-Fiber). Fourteen primitives covering Scene, Panorama360,
          Hotspot, XRSession, Model3D, Logo3D, ParticleField, OrbitControls, Starfield, Planet,
          OrbitPath, Portal3D, Avatar3D, plus a Card3D primitive for foiled-card layouts.
        </li>
        <li>
          <strong><code>tekivex-resume-templates</code></strong> — twelve resume layouts and
          a generator that fetches user data, previews live, and produces a 1-page A4 PDF via
          the browser's own Save-as-PDF path. Locked-by-default policy, optional per-template
          paywall.
        </li>
        <li>
          <strong><code>tekivex-biodata-templates</code></strong> — twelve marriage-biodata
          layouts with auto-derived religious symbols (ॐ, ✝, ☪, ☬, ☸, 🪷) and an upload
          control for custom logos. Plus eleven vendored helper components from a parallel
          biodata-app implementation.
        </li>
        <li>
          <strong><code>tekivex-pdf</code></strong> — Puppeteer-free PDF rendering for
          serverless environments. Five built-in templates, browser-API based.
        </li>
        <li>
          Additional packages for India-specific components (Aadhaar / PAN / Voter ID
          validators, INR currency formatting, India Post PIN lookup, Tithi/Nakshatra
          calendar) and for internationalization across 35 locales.
        </li>
      </ul>

      <h2>Principles</h2>

      <h3>Accessibility is not a stretch goal</h3>
      <p>
        Every component is tested against WCAG 2.1 AAA before it ships — 7:1 contrast, 44×44
        touch targets, full keyboard navigation, screen-reader announcements verified across
        NVDA, JAWS, VoiceOver, and TalkBack. We publish the audit results in the test suite,
        not just in the README.
      </p>

      <h3>Real WebGL, not CSS imitation</h3>
      <p>
        Other React libraries ship "3D card" components that are CSS perspective transforms.
        Ours render through three.js with real geometry, real lighting, real materials, and
        real shadows. That's a deliberate trade-off: the install is bigger, but the visual
        ceiling is much higher and the components compose with the rest of a WebXR pipeline.
      </p>

      <h3>Browser-only PDF</h3>
      <p>
        Most React PDF stories rely on Puppeteer. That's fine for a server with a long-lived
        process and a couple of gigabytes of RAM to spare; it's terrible for AWS Lambda. Our
        approach embeds a print-ready A4 layout in a hidden iframe and lets the browser's own
        Save-as-PDF do the rasterization. No extra deps, sub-second cold start.
      </p>

      <h3>Locked-by-default templates</h3>
      <p>
        Apps built with the resume / biodata template packages can configure each template as
        free, paid, or request-only. The default is "request-only" — visitors can preview but
        not download until the host app's <code>onPurchase</code> callback fires. That makes the
        paywall flow opt-in for the user-facing app rather than baked into the templates.
      </p>

      <h3>Honest roadmap</h3>
      <p>
        Our roadmap section uses four statuses — <em>shipped</em>, <em>preview</em>,{' '}
        <em>in progress</em>, <em>planned</em> — and we never use TBD. Every roadmap row is
        concrete enough that a contributor could pick it up and run with it.
      </p>

      <h2>How we stay maintained</h2>
      <p>
        TekiVex UI is maintained by a small group of engineers. The main package and{' '}
        <code>tekivex-3d</code> are released on demand: when an issue is filed asking for a
        new feature or a published version, we usually publish to npm within 24 hours. The
        source is always at HEAD on GitHub.
      </p>
      <p>
        Sponsorship and consulting requests are welcome. The packages will always be free under
        the MIT license; what's available for paid engagement is integration help, custom
        components for your use case, and priority bug-fix turnaround.
      </p>

      <h2>Why open source</h2>
      <p>
        Every commercial component-library vendor we evaluated had at least one of these
        problems: arbitrary breaking changes between minor releases, a long-tail of unfixable
        bugs in obscure components, or a "go find a different solution" stance toward
        accessibility. Open-sourcing the library means you can fork it the day we mess up. That
        accountability matters more to us than the lock-in revenue would.
      </p>

      <h2>Where to go next</h2>
      <ul>
        <li>
          Browse the <Link to="/docs">component documentation</Link>
        </li>
        <li>
          Read the <Link to="/blog">engineering blog</Link>
        </li>
        <li>
          File a <a href="https://github.com/novaai0401-ui/tekivex-issue-report/issues">bug or feature request</a>
        </li>
        <li>
          Reach the team via the <Link to="/contact">contact page</Link>
        </li>
      </ul>
    </PageShell>
  );
}
