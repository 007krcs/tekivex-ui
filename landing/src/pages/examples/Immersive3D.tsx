// ─────────────────────────────────────────────────────────────────────────────
// /examples/3d — the immersive showcase page.
//
// Houses the 3D / panorama / holographic sections that used to live on the
// main landing. Moved here as part of the 2026-Q2 professional redesign so
// the home page can lead with the threat-model positioning. These demos are
// still load-bearing — they show off `tekivex-3d` and `TkxHolographic*` —
// but they're now a destination, not the first thing a CISO sees.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { PageShell } from '../PageShell';
import { usePageMeta } from '../../use-page-meta';
import { ImmersiveContext } from '../../immersive-context';
import { Immersive } from '../../Immersive';
import { Tour360 } from '../../sections/Tour360';
import { GalaxyMap360 } from '../../sections/GalaxyMap360';
import { HolographicUniverse } from '../../sections/HolographicUniverse';
import { Playground } from '../../sections/Playground';

export function Immersive3D() {
  usePageMeta(
    'TekiVex UI — 3D · 360° · holographic showcase',
    'Live demos of the `tekivex-3d` toolkit (Scene, Panorama360, Hotspot, XR), holographic UI primitives, and the live JSX playground. Production components live on the main page; this is where the spatial experiments live.',
  );

  const [immersiveOpen, setImmersiveOpen] = useState(false);
  const open = useCallback(() => setImmersiveOpen(true), []);
  const close = useCallback(() => setImmersiveOpen(false), []);

  return (
    <ImmersiveContext.Provider value={{ open }}>
      <PageShell
        title="3D · 360° · holographic"
        eyebrow="Examples"
        subtitle="The spatial-UI experiments that used to live on the home page. They're real components shipping in `tekivex-3d` and `tekivex-ui`. The main landing now leads with the security story; this page is the gallery."
        breadcrumbs={[{ label: 'Examples', href: '/examples' }, { label: '3D & holographic' }]}
        updated="2026-05-28"
      >
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7 }}>
          Each section below is a live, interactive demo — pan, zoom, drag, click.
          None of this code is gated behind a paid tier; everything ships in the
          MIT-licensed `tekivex-3d` and `tekivex-ui` packages.
        </p>
      </PageShell>

      {/* Sections mounted in the same "dark island" wrapper the home page
          used to provide, so the cosmic palette reads correctly. */}
      <div className="tk-home tk-home--dark" style={{ paddingTop: 48 }}>
        <Playground />
        <HolographicUniverse />
        <GalaxyMap360 />
        <Tour360 />
      </div>

      <Immersive open={immersiveOpen} onClose={close} />
    </ImmersiveContext.Provider>
  );
}
