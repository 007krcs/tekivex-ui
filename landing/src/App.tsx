import { Hero } from './sections/Hero';
import { Stats } from './sections/Stats';
import { Features } from './sections/Features';
import { Playground } from './sections/Playground';
import { Tour360 } from './sections/Tour360';
import { Packages } from './sections/Packages';
import { CodeShowcase } from './sections/CodeShowcase';
import { Footer } from './sections/Footer';
import { Nav } from './sections/Nav';

export function App() {
  return (
    <>
      <div className="tk-aurora" aria-hidden="true" />
      <div className="tk-grid-bg" aria-hidden="true" />

      <Nav />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <Stats />
        <Features />
        <Playground />
        <Tour360 />
        <CodeShowcase />
        <Packages />
        <Footer />
      </main>
    </>
  );
}
