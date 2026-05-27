// ─────────────────────────────────────────────────────────────────────────────
// Home page — professional security-first landing.
//
// Redesigned 2026-Q2 to lead with the threat-model positioning instead of the
// cosmic / 3D / holographic showcase. The flashy stuff still ships at
// `/examples/3d` (see pages/examples/Immersive3D.tsx) — but the first thing
// a CISO, procurement reviewer, or staff engineer sees on `/` is now a
// text-first hero with a code snippet, compliance framework alignment, and
// concrete security primitives.
//
// Section order (top to bottom):
//   1. HeroPro             — text-first hero with code card, NO 3D
//   2. TrustBar            — HIPAA / PCI-DSS / SOC 2 / Section 508 / EAA / GDPR / FedRAMP frameworks
//   3. Stats               — 6 headline numbers
//   4. SecurityDeepDive    — 3 primitives (scrubPII / sniffMimeType / audit) with real code
//   5. Features            — competitor comparison table
//   6. DesignPartners      — slots reserved + outreach call-to-action
//   7. CodeShowcase        — quick start code samples
//   8. DataDemo            — live DataGrid demo (real, not flashy)
//   9. FlowChartDemo       — live FlowChart (real, useful)
//  10. AllComponents       — full component browser
//  11. Packages            — companion packages
//  12. Roadmap             — version-anchored roadmap
//  13. BrandFaq            — common questions
//
// Moved off home (still shipping at /examples/3d):
//   - Hero (3D panorama scene)
//   - Tour360
//   - GalaxyMap360
//   - HolographicUniverse
//   - Playground (heavy live JSX editor; the /playground/ subapp is the
//     canonical home for interactive sandbox)
//   - Immersive overlay
// ─────────────────────────────────────────────────────────────────────────────

import { HeroPro } from '../sections/HeroPro';
import { TrustBar } from '../sections/TrustBar';
import { Stats } from '../sections/Stats';
import { SecurityDeepDive } from '../sections/SecurityDeepDive';
import { DesignPartners } from '../sections/DesignPartners';
import { Features } from '../sections/Features';
import { DataDemo } from '../sections/DataDemo';
import { AllComponents } from '../sections/AllComponents';
import { Roadmap } from '../sections/Roadmap';
import { Packages } from '../sections/Packages';
import { CodeShowcase } from '../sections/CodeShowcase';
import { FlowChartDemo } from '../sections/FlowChartDemo';
import { BrandFaq } from '../sections/BrandFaq';
import { usePageMeta } from '../use-page-meta';

export function Home() {
  usePageMeta(
    'TekiVex UI — The React component library that ships with a threat model',
    '115 production components, WCAG 2.1 AAA target (audit-firm engagement open), zero runtime dependencies in core, built-in security kernel with published threat model. MIT licensed.',
  );

  return (
    <div className="tk-home tk-home--dark">
      <HeroPro />
      <TrustBar />
      <Stats />
      <SecurityDeepDive />
      <Features />
      <DesignPartners />
      <CodeShowcase />
      <DataDemo />
      <FlowChartDemo />
      <AllComponents />
      <Packages />
      <Roadmap />
      <BrandFaq />
    </div>
  );
}
