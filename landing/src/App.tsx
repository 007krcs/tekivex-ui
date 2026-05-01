import { useState, useCallback, createContext, useContext } from 'react';
import { Hero } from './sections/Hero';
import { Stats } from './sections/Stats';
import { Features } from './sections/Features';
import { Playground } from './sections/Playground';
import { DataDemo } from './sections/DataDemo';
import { Tour360 } from './sections/Tour360';
import { AllComponents } from './sections/AllComponents';
import { Roadmap } from './sections/Roadmap';
import { Packages } from './sections/Packages';
import { CodeShowcase } from './sections/CodeShowcase';
import { Footer } from './sections/Footer';
import { Nav } from './sections/Nav';
import { Immersive } from './Immersive';
import { SacredGeometry } from './SacredGeometry';
import { HolographicUniverse } from './sections/HolographicUniverse';
import { GalaxyMap360 } from './sections/GalaxyMap360';

interface ImmersiveCtx {
  open: () => void;
}

const ImmersiveContext = createContext<ImmersiveCtx | null>(null);

export function useImmersive(): ImmersiveCtx {
  const ctx = useContext(ImmersiveContext);
  if (!ctx) throw new Error('useImmersive() outside provider');
  return ctx;
}

export function App() {
  const [immersiveOpen, setImmersiveOpen] = useState(false);
  const open = useCallback(() => setImmersiveOpen(true), []);
  const close = useCallback(() => setImmersiveOpen(false), []);

  return (
    <ImmersiveContext.Provider value={{ open }}>
      <div className="tk-aurora" aria-hidden="true" />
      <SacredGeometry />
      <div className="tk-grid-bg" aria-hidden="true" />
      <div className="tk-vignette" aria-hidden="true" />

      <Nav />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <Stats />
        <Features />
        <Playground />
        <DataDemo />
        <HolographicUniverse />
        <GalaxyMap360 />
        <Tour360 />
        <AllComponents />
        <Roadmap />
        <CodeShowcase />
        <Packages />
        <Footer />
      </main>

      <Immersive open={immersiveOpen} onClose={close} />
    </ImmersiveContext.Provider>
  );
}
