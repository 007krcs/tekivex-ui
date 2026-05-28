// ─────────────────────────────────────────────────────────────────────────────
// Home page — professional security-first landing (light theme).
//
// 2026-05 update: flipped from dark to light to match B2B SaaS convention
// (Stripe / Linear marketing / Vercel docs / Resend). Removed two sections
// that read as trust-theater for a pre-1.0, single-maintainer project:
//
//   - TrustBar      — HIPAA / PCI / SOC 2 / FedRAMP framework chips. We are
//                      not certified against any of those frameworks, and
//                      the visual alignment implied otherwise even with the
//                      disclaimer. File kept on disk for post-audit reuse.
//   - DesignPartners — "Reserved for the first five design partners" cards.
//                      No real partners signed yet; placeholder slots were
//                      performative. File kept on disk; we'll bring this
//                      back when the first real partner agrees to be named.
//
// Replaced by VerifyThis, which lists 6 claims that a procurement engineer
// can independently confirm in under 5 minutes (GitHub link, npm link,
// SBOM URL, threat-model doc, MIT license, test-suite location).
//
// Section order (top to bottom):
//   1. HeroPro             — text-first hero with code card, NO 3D
//   2. Stats               — 6 headline numbers
//   3. VerifyThis          — checkable claims (replaces TrustBar)
//   4. SecurityDeepDive    — 3 primitives (scrubPII / sniffMimeType / audit)
//   5. Features            — competitor comparison table
//   6. CodeShowcase        — quick start code samples
//   7. DataDemo            — live DataGrid demo
//   8. FlowChartDemo       — live FlowChart
//   9. AllComponents       — full component browser
//  10. Packages            — companion packages
//  11. Roadmap             — version-anchored roadmap
//  12. BrandFaq            — common questions
//
// Moved off home (still shipping at /examples/3d):
//   - Hero, Tour360, GalaxyMap360, HolographicUniverse, Playground, Immersive
// ─────────────────────────────────────────────────────────────────────────────

import { HeroPro } from '../sections/HeroPro';
import { Stats } from '../sections/Stats';
import { VerifyThis } from '../sections/VerifyThis';
import { SecurityDeepDive } from '../sections/SecurityDeepDive';
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
    '115 production components, zero runtime dependencies in core, built-in security kernel with published threat model. MIT-licensed, pre-1.0.',
  );

  return (
    <div className="tk-home">
      <HeroPro />
      <Stats />
      <VerifyThis />
      <SecurityDeepDive />
      <Features />
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
