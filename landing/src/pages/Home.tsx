// ─────────────────────────────────────────────────────────────────────────────
// Home page — the original interactive landing.
//
// Lives at "/". All other pages (privacy, terms, about, contact, blog,
// docs/*) are real React Router routes so AdSense's crawler sees them as
// distinct URLs with substantive content.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { Hero } from '../sections/Hero';
import { Stats } from '../sections/Stats';
import { Features } from '../sections/Features';
import { Playground } from '../sections/Playground';
import { DataDemo } from '../sections/DataDemo';
import { Tour360 } from '../sections/Tour360';
import { AllComponents } from '../sections/AllComponents';
import { Roadmap } from '../sections/Roadmap';
import { Packages } from '../sections/Packages';
import { CodeShowcase } from '../sections/CodeShowcase';
import { HolographicUniverse } from '../sections/HolographicUniverse';
import { GalaxyMap360 } from '../sections/GalaxyMap360';
import { FlowChartDemo } from '../sections/FlowChartDemo';
import { BrandFaq } from '../sections/BrandFaq';
import { Immersive } from '../Immersive';
import { ImmersiveContext } from '../immersive-context';
import { usePageMeta } from '../use-page-meta';

export function Home() {
  usePageMeta(
    'TekiVex UI — Production-grade React components, in 360°',
    'Open-source React component library: 113 accessible primitives, a WebGL 3D + 360° toolkit, holographic UI, browser-native PDF, and printable templates. MIT licensed, WCAG 2.1 AAA.',
  );
  const [immersiveOpen, setImmersiveOpen] = useState(false);
  const open = useCallback(() => setImmersiveOpen(true), []);
  const close = useCallback(() => setImmersiveOpen(false), []);

  return (
    <ImmersiveContext.Provider value={{ open }}>
      {/* Home page is the immersive cosmic showcase — designed for a dark
          backdrop. Wrap it in a "dark island" that overrides the global
          light tokens locally so the 3D scenes, particle fields, and
          neon-on-deep-violet aesthetic read as intended. The text routes
          (/about, /privacy, /blog, /docs, ...) keep the new light theme. */}
      <div className="tk-home tk-home--dark">
        <Hero />
        <Stats />
        <Features />
        <Playground />
        <DataDemo />
        <FlowChartDemo />
        <HolographicUniverse />
        <GalaxyMap360 />
        <Tour360 />
        <AllComponents />
        <Roadmap />
        <CodeShowcase />
        <Packages />
        <BrandFaq />
      </div>
      <Immersive open={immersiveOpen} onClose={close} />
    </ImmersiveContext.Provider>
  );
}
