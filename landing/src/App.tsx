// ─────────────────────────────────────────────────────────────────────────────
// App — the route table.
//
// Real URLs (not hash anchors) so the AdSense crawler indexes each page
// distinctly. Each route renders a different page; the shared chrome
// (Nav, decorative background layers, Footer) stays mounted across
// route changes.
// ─────────────────────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Footer } from './sections/Footer';
import { Nav } from './sections/Nav';
import { SacredGeometry } from './SacredGeometry';
import { Home } from './pages/Home';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { BlogIndex } from './pages/blog/BlogIndex';
import { BlogPost } from './pages/blog/BlogPost';
import { DocsIndex } from './pages/docs/DocsIndex';
import { DocsPage } from './pages/docs/DocsPage';
import { ExamplesIndex } from './pages/examples/ExamplesIndex';
import { Example360 } from './pages/examples/Example360';
import { ExampleARVR } from './pages/examples/ExampleARVR';
import { ExampleHolographic } from './pages/examples/ExampleHolographic';
import { BlogExample } from './pages/examples/blog/BlogExample';
import { PropertyTour } from './pages/examples/PropertyTour';
import { ARProduct } from './pages/examples/ARProduct';
import { MissionControl } from './pages/examples/MissionControl';

export { useImmersive } from './immersive-context';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
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
          <Route path="/examples/360"           element={<Example360 />} />
          <Route path="/examples/ar-vr"         element={<ExampleARVR />} />
          <Route path="/examples/holographic"   element={<ExampleHolographic />} />
          <Route path="/examples/blog"          element={<BlogExample />} />
          <Route path="/examples/property-tour" element={<PropertyTour />} />
          <Route path="/examples/ar-product"    element={<ARProduct />} />
          <Route path="/examples/mission-control" element={<MissionControl />} />
          <Route path="*"               element={<NotFound />} />
        </Routes>
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
