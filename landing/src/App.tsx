// ─────────────────────────────────────────────────────────────────────────────
// App — the route table.
//
// Real URLs (not hash anchors) so the AdSense crawler indexes each page
// distinctly. Each route renders a different page; the shared chrome
// (Nav, decorative background layers, Footer) stays mounted across
// route changes.
//
// ── Route-splitting (2026-05) ───────────────────────────────────────────
// Before: every route component statically imported → 994 kB main bundle.
// After:  everything except Home is React.lazy() → main bundle is just
//   Home + chrome + the vendor chunks. Other pages stream as the user
//   navigates. The /examples/* routes (which import three.js + heavy
//   demo libs) no longer ship in the initial payload.
//
// Home stays eager because (a) it's the most-visited route by far on a
// marketing site, and (b) lazy-loading the landing page itself would
// add a Suspense flash on the most common entry.
// ── ──────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Footer } from './sections/Footer';
import { Nav } from './sections/Nav';
import { SacredGeometry } from './SacredGeometry';
import { Home } from './pages/Home';

// Lazy: every other route. Each gets its own chunk; three.js-importing
// examples ship as separate chunks that share the same vendor-three split.
const Privacy            = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms              = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const About              = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact            = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const BlogIndex          = lazy(() => import('./pages/blog/BlogIndex').then(m => ({ default: m.BlogIndex })));
const BlogPost           = lazy(() => import('./pages/blog/BlogPost').then(m => ({ default: m.BlogPost })));
const DocsIndex          = lazy(() => import('./pages/docs/DocsIndex').then(m => ({ default: m.DocsIndex })));
const DocsPage           = lazy(() => import('./pages/docs/DocsPage').then(m => ({ default: m.DocsPage })));
const ExamplesIndex      = lazy(() => import('./pages/examples/ExamplesIndex').then(m => ({ default: m.ExamplesIndex })));
const ExampleHolographic = lazy(() => import('./pages/examples/ExampleHolographic').then(m => ({ default: m.ExampleHolographic })));
const BlogExample        = lazy(() => import('./pages/examples/blog/BlogExample').then(m => ({ default: m.BlogExample })));
const PropertyTour       = lazy(() => import('./pages/examples/PropertyTour').then(m => ({ default: m.PropertyTour })));
const ARProduct          = lazy(() => import('./pages/examples/ARProduct').then(m => ({ default: m.ARProduct })));
const MissionControl     = lazy(() => import('./pages/examples/MissionControl').then(m => ({ default: m.MissionControl })));
const Immersive3D        = lazy(() => import('./pages/examples/Immersive3D').then(m => ({ default: m.Immersive3D })));

export { useImmersive } from './immersive-context';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Minimal route-transition fallback. Intentionally NOT a spinner — for
// route splits this small (~50-300 ms on a slow 3G), a spinner is more
// disruptive than a brief blank. Falls back to a non-shifting placeholder
// so CLS stays at zero across the transition.
function RouteFallback() {
  return <div style={{ minHeight: '60vh' }} aria-hidden="true" />;
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="tk-aurora" aria-hidden="true" />
      <SacredGeometry />
      <div className="tk-grid-bg" aria-hidden="true" />
      <div className="tk-vignette" aria-hidden="true" />

      <Nav />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/privacy"        element={<Privacy />} />
            <Route path="/terms"          element={<Terms />} />
            <Route path="/about"          element={<About />} />
            <Route path="/contact"        element={<Contact />} />
            <Route path="/blog"           element={<BlogIndex />} />
            <Route path="/blog/:slug"     element={<BlogPost />} />
            <Route path="/docs"           element={<DocsIndex />} />
            <Route path="/docs/:slug"     element={<DocsPage />} />
            <Route path="/examples"               element={<ExamplesIndex />} />
            <Route path="/examples/holographic"   element={<ExampleHolographic />} />
            <Route path="/examples/blog"          element={<BlogExample />} />
            <Route path="/examples/property-tour" element={<PropertyTour />} />
            <Route path="/examples/ar-product"    element={<ARProduct />} />
            <Route path="/examples/mission-control" element={<MissionControl />} />
            <Route path="/examples/3d"             element={<Immersive3D />} />
            <Route path="*"               element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 720,
        margin: '0 auto',
        padding: 'clamp(64px, 9vw, 120px) 24px',
        textAlign: 'center',
        color: '#dcdce8',
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#c4a8ff',
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>
        Page not found
      </h1>
      <p style={{ color: '#b8b8d4' }}>
        That URL doesn't exist on the site. Try the <a href="/" style={{ color: '#00f5d4' }}>home page</a>{' '}
        or the <a href="/docs" style={{ color: '#00f5d4' }}>docs index</a>.
      </p>
    </div>
  );
}
