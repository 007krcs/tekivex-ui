# Design Research: Professional B2B Dev-Tool Landing Page Redesign

> **Scope.** Opinionated redesign guide for the `tekivex-ui` landing page (currently at `landing/src/sections/`). Target reader: an engineer or designer implementing the next iteration. Target audience for the landing itself: tech-leads and CISOs at regulated-industry teams (healthtech, fintech, govtech) evaluating React UI libraries.
>
> **Method note.** `WebFetch` was unavailable in this research session, so observations of the 16 reference sites below are drawn from training-data memory (snapshots through early 2026). Where a specific quote or color hex is cited, it is what those sites have most consistently used in their public landings over the last 18 months; treat exact strings as directional, not as a current-day diff. The pattern recommendations do not depend on any one snapshot being current.

---

## 1. Executive summary

### Five principles that distinguish professional dev-tool landings from amateur ones

1. **Text-first hero, visual-second.** Every gold-standard dev landing (Linear, Vercel, Stripe, Resend, Clerk, Vanta) leads with a tight positioning sentence in big type on a quiet background. The visual is supporting evidence (a code card, a product chrome screenshot, a subtle gradient) — never the headline. Amateur landings let the visual *be* the message.
2. **One accent color, ruthlessly.** Linear is violet. Vercel is monochrome with a blue ping. Stripe is indigo→cyan in one gradient and then nothing. Resend is black + a single warm pink. Pick one accent and treat every additional color as a tax.
3. **Density of *evidence*, not of *content*.** Professional landings have 5–7 sections, not 14. Each section makes one claim and proves it (a chart, a code snippet, a logo bar, a quote). Amateur landings have 12 sections that each say "and also we have this."
4. **Motion serves comprehension, not delight.** The best dev landings use motion *only* to (a) reveal something on scroll, (b) play a short product loop, or (c) animate a hover state. Continuous ambient motion (drifting particles, panning panoramas, pulsing badges) reads as a screensaver to a CISO.
5. **Trust signals live above the fold or immediately below it.** Vanta, Drata, WorkOS, 1Password — all surface compliance badges within the first 600px of vertical scroll. For an OSS library targeting regulated industries, the "framework-ready for HIPAA / PCI-DSS / SOC 2 / Section 508" line is the equivalent of a customer logo bar.

### Top 3 "don'ts" tekivex-ui is currently violating

1. **The full-bleed 360° panorama hero.** `landing/src/sections/Hero.tsx` opens with a WebGL sphere, 3,000-particle field, six pulsing hotspots, gyroscope hint, and a triple-gradient shimmering CTA. This is the visual vocabulary of a *creative agency portfolio*, not a security-conscious component library. A buyer who lands here and is told 60 seconds later that the library "ships with a threat model" experiences cognitive dissonance.
2. **The four-color holographic palette.** Cyan `#00f5d4`, blue `#3a86ff`, magenta `#ff006e`, amber `#ffbe0b`, mint `#06d6a0`, violet `#7b2ff7` — six accents in a single hero. Every gold-standard reference uses one.
3. **The "and also" tagline pattern.** The README, hero sub, and several sections boast "115 components · spreadsheet primitive · 3D toolkit · PDF without Puppeteer · flow chart canvas · 360° panorama". This is a *features list*. A positioning statement says one thing. The "ships with a threat model" line is the right one — let it stand alone.

---

## 2. Reference matrix

| Site | Positioning (paraphrased) | Hero visual | Palette | Type | Motion | Trust strategy |
|---|---|---|---|---|---|---|
| linear.app | "The new standard for modern software development." | Subtle violet glow + product screenshot | Near-black `#08090A` + violet `#5E6AD2` | Inter Display, tight tracking | Scroll-revealed product loops, no ambient motion | Customer logos in horizontal strip; quotes inline with sections |
| vercel.com | "Develop. Preview. Ship." | Triangle logo, animated mesh gradient, deploy CLI snippet | Pure black `#000` + monochrome + occasional cyan | Geist Sans + Geist Mono | Mesh-gradient loop, hover reveals | Dense customer logo wall (Sonos, Notion, Adobe, OpenAI) |
| stripe.com | "Financial infrastructure for the internet." | Animated indigo→cyan→green diagonal gradient with white product chrome | Indigo `#635BFF` + white | Sohne (custom) | One gradient sweep; section transitions; no particles | Logo wall + named industry "Climate", "Atlas", etc. |
| resend.com | "Email for developers." | Dark canvas + a single code card showing the SDK call | Black + warm pink `#FF6363` | Inter + JetBrains Mono | Static; one cursor blink in code | "Built by the team behind React Email"; SOC 2 badge in footer |
| clerk.com | "Authentication and user management." | Gradient mesh + auth UI screenshot | Off-black + violet→pink gradient | Inter | Mesh gradient loops slowly | SOC 2 + HIPAA badges near hero; customer logos |
| railway.app | "Bring your code, we'll handle the rest." | Terminal-aesthetic dark UI + product screenshot | Near-black + neon mint | Inter + custom mono | Static, very dense | Pricing-forward, less logo-heavy |
| supabase.com | "Build in a weekend. Scale to millions." | Green-accented product screenshot | Black + Supabase green `#3ECF8E` | Custom + mono | Animated wordmark; scroll-revealed feature cards | GitHub star count, customer logos, "SOC 2 Type 2" footer badge |
| vanta.com | "Automate compliance. Simplify security." | Product screenshot of compliance dashboard | White-first + Vanta navy + lime accent | Söhne / Inter | Minimal | Framework badges (SOC 2, ISO 27001, HIPAA, GDPR, PCI) directly under hero; logo wall |
| drata.com | "The world's most advanced compliance automation platform." | Dashboard screenshot + framework chips | White + Drata blue | Inter | Minimal | Same as Vanta — framework chips above the fold |
| workos.com | "Your app, enterprise-ready." | Code sample card | Black + electric blue | Inter + JetBrains Mono | Subtle | "Trusted by" logo wall; SOC 2 badge |
| trustpage.com | "Trust, on autopilot." | Product UI screenshot | White + dark teal | Sans-serif geometric | Minimal | Trust profile examples (live customer trust pages) |
| 1password.com/business | "Secure every sign-in." | Photo of person + product chrome inset | White + 1Password blue | Custom sans | Static | Compliance certifications grid (SOC 2, ISO 27001, FedRAMP-in-progress, HIPAA-ready) |
| ui.shadcn.com | "Beautifully designed components..." | Live component cards (calendar, cards, charts) | Pure white + pure black + zinc | Geist Sans / Inter + Geist Mono | None | GitHub stars, "Used by" list of OSS projects (Vercel, Cal.com) |
| mantine.dev | "A fully featured React components library" | Component preview grid | White + Mantine blue + dark mode toggle | Greycliff CF + custom mono | Hover-only | GitHub star, npm download count, contributor avatars |
| chakra-ui.com | "Build accessible React apps with speed." | Code + component side-by-side | Teal `#319795` + neutral | Custom sans | Hover-only | Accessibility callouts; "used by" list |
| mui.com | "Move faster with intuitive React UI tools." | Product cards (X grid, dashboard template) | MUI blue `#0072E5` + white | Inter + Roboto Mono | Minimal | Enterprise plan callouts, customer logos (NASA, Boeing, Amazon) |

**Pattern read:** Across all 16, the *median* landing is dark-or-white background, one accent color, one or two type families, one or two animated elements, and trust signals within the first scroll. None lead with a full-bleed 3D experience.

---

## 3. Pattern catalog

### 3.1 Above-the-fold information architecture

**The pattern.** Five elements, stacked vertically, centered or left-aligned, on a quiet background:

```
[small eyebrow badge — optional, 11–13px]
[headline — one sentence, 48–88px, tight tracking]
[sub — 16–20px, max 60ch, color-muted]
[two CTAs — primary + secondary, never three]
[hero visual — code card, screenshot, or single gradient — supporting, not dominant]
```

**When to use.** Always. Even pages with elaborate hero visuals (Stripe) keep the text stack obeying this order.

**References.** Linear, Resend, Clerk, Vanta — all five elements, in this order.

**Recommendation for tekivex-ui.**
- Headline: **"The React component library that ships with a threat model."** (keep — it's good.)
- Sub: replace the current 5-claim run-on with one line, e.g. *"115 accessible primitives, zero runtime dependencies, and a published security model — built for regulated-industry teams."*
- Primary CTA: `npm install tekivex-ui` as a copy-on-click code chip (also acts as proof: a working install command is a stronger signal than a "Get Started" button for a dev audience).
- Secondary CTA: "Read the threat model" → links to `docs/SECURITY-THREAT-MODEL.md`. This single link does more positioning work than every hero animation combined.
- Visual: a single static code card on the right (desktop) or below (mobile) showing a `<TkxButton>` import + a `<TkxFileUpload>` with `verifyMagicBytes` — the second one is the differentiator. No 3D.

### 3.2 Color palette (dark-mode-first)

**The pattern.** Three colors do 95% of the work on a professional dev landing:

1. **Background** — a near-black (Linear `#08090A`, Vercel `#000`, Resend `#000`) or a true-black with a 4–6% lift for cards.
2. **One accent** — used for primary CTAs, link underlines, key highlight words. Linear violet, Vercel cyan, Stripe indigo, Resend warm pink.
3. **One neutral text scale** — white at 100%, 70%, 50%, 30% opacity (or zinc-100, zinc-400, zinc-500, zinc-600).

Everything else (success greens, warning ambers) lives inside product UI screenshots, not on the marketing chrome.

**Recommendation for tekivex-ui.** Drop all six holographic colors from chrome.
- Background: `#0A0B14` (matches current Hero dark island — keep this).
- Accent: a single cool cyan — `#5BE9C9` or one tier darker, `#2DD4BF`. Cyan reads as "engineered" / "security" and avoids the cyberpunk neon of `#00F5D4` at full saturation. Apply it to: the install-command chip border, link underlines, the one "ships with a threat model" highlight word, and primary CTAs (filled, not gradient).
- Neutral scale: `#FFFFFF` / `rgba(255,255,255,0.72)` / `rgba(255,255,255,0.48)` / `rgba(255,255,255,0.28)`.
- Card surfaces: `#11131F` with a `1px solid rgba(255,255,255,0.06)` border. This is the Linear / Vercel card recipe.
- **Gradients:** allowed in exactly one place — a 600px-wide soft radial glow behind the headline at 8% opacity. No `linear-gradient(135deg, cyan, blue, violet)` CTAs.

### 3.3 Typography stack

**The pattern.** One sans (display + body, sometimes the same), one mono. Modern picks: Geist Sans + Geist Mono (Vercel, shadcn), Inter + JetBrains Mono (Resend, Clerk, WorkOS), Söhne (Vanta, paid), Inter Display + Inter (Linear).

**Recommendation.**
- Display + body: **Inter** (free, ships with `next/font` and `@fontsource/inter`, already industry-default).
- Mono: **JetBrains Mono** or **Geist Mono**.
- Sizes — display `clamp(2.75rem, 6vw, 4.5rem)`, headline `2.25rem`, body `1.0625rem` (17px), small `0.875rem`, mono in code `0.9375rem`.
- Tracking — display `-0.03em`, body `-0.005em`, mono `0`.
- Weight — 600 for display (not 800/900), 500 for buttons, 400 for body. **The current Hero uses `fontWeight: 900` for the H1 — too heavy for a security positioning. Drop to 600.**

### 3.4 Spacing / whitespace

**The pattern.** Generous vertical rhythm between sections (Linear uses ~160px between sections on desktop, Vercel ~120–160px), but tight rhythm *within* a section. Cards usually have 24–32px internal padding.

**Recommendation.** 8-point scale: 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128. Section vertical padding: `clamp(96px, 12vw, 160px)`. Max content width: 1200px (the current 1280 is fine). Hero vertical centering with `min-height: 88vh` (not 100vh — leave a hint of the next section visible so the reader knows to scroll).

### 3.5 Hero visual choices

**Comparison.**
- **Gradient mesh** (Stripe, Clerk): striking but date-stamps the design to 2022–2024.
- **Product screenshot** (Linear, Vanta, Drata, MUI): the gold standard for SaaS — but for an OSS library, the "product" is *code*, not a dashboard.
- **Code card** (Vercel, Resend, WorkOS, shadcn): the canonical choice for a dev-tool library. Static, syntax-highlighted, ~12 lines, shows the differentiator.
- **Live component demo** (shadcn, Mantine): great for component libraries specifically — shows you can render a real button without a setup ceremony.
- **Animated 3D** (current tekivex-ui): not used by any of the 16 references on the marketing chrome.

**Recommendation.** Stack two: (1) the install-command chip directly under the sub, and (2) a static syntax-highlighted code card showing `TkxFileUpload` with `verifyMagicBytes={true}` — the magic-byte upload is the most concrete differentiator from MUI / Chakra / shadcn and earns the "ships with a threat model" line. Keep the 3D scenes for a *dedicated* `/3d` or `/playground` page, linked from nav.

### 3.6 Trust-bar / logo treatment

**The pattern.** A row of 6–10 grayscale logos under the hero, captioned "Trusted by" or "Powering teams at". When you don't have customer logos, dev-tool sites substitute: GitHub star count, npm weekly downloads, contributor avatars, "Used in production at" (with self-reported user submissions), or *framework chips* (the Vanta/Drata move).

**Recommendation for tekivex-ui (no customer logos yet).** Build a "Compliance frameworks supported" chip row instead — see 3.8.

### 3.7 Code-sample integration

**The pattern.** Syntax-highlighted, framed in a card with `1px` border and a faint top-bar that includes a filename and a "copy" button. Vercel, Resend, Clerk, WorkOS all use this exact recipe. Width: 480–640px. Height: 240–360px. Always shows real, runnable code — never pseudocode.

**Recommendation.** Use Shiki for SSG-friendly highlighting with the `vesper` or `github-dark` theme on the dark background. Show ~12 lines max. Filename header: `app/upload.tsx`. Include a `// magic-byte verified` comment that anchors the differentiator.

### 3.8 Security / compliance badge placement

**The pattern (regulated-SaaS sites).** Vanta and Drata put framework chips *directly under the hero* in a horizontal chip row: `SOC 2` `ISO 27001` `HIPAA` `GDPR` `PCI DSS`. Clerk does the same with `SOC 2 Type 2` and `HIPAA`. 1Password has a full certifications grid lower on the page.

**The credential problem.** tekivex-ui is an MIT library — it cannot itself be SOC 2 / HIPAA certified. Those certifications attach to the *deployment*, not the dependency. The honest framing is **"framework-ready"** or **"controls implemented for"**.

**Recommendation.** A chip row directly under the hero CTAs:

> **Framework-ready controls for** `HIPAA` `PCI DSS` `SOC 2` `Section 508` `EAA` `GDPR`

Each chip links to a `docs/compliance/<framework>.md` page listing the specific controls the library implements (e.g. for HIPAA: PHI redaction in `TkxRedactedText`, audit-trail SHA-256 chain, magic-byte MIME verification for PHI uploads). The page must explicitly state: *"tekivex-ui is a dependency; HIPAA compliance is achieved at the application and infrastructure level. These primitives implement controls commonly required for §164.312 technical safeguards."*

Recommended chips: **HIPAA, PCI DSS, SOC 2, Section 508, GDPR**. **Drop EAA from the hero chip row** — it overlaps Section 508 for a US-led audience and dilutes the row; mention it on the dedicated accessibility page instead.

### 3.9 Customer quote placement

**The pattern.** A single large pull-quote per section (Linear's recipe), or a 3-up grid of short quotes near the bottom (Vercel, Stripe). Always with name + role + company logo. Never with a stock-photo headshot if you can avoid it (an inline avatar circle is fine).

**Recommendation.** Until you have signed design partners willing to be named, **do not put fake or anonymous quotes on the landing.** The empty-state move is a quote from the maintainer about *why the library exists* (a Stripe-style "from the team" callout), or a quote pulled from a public issue / PR with a real GitHub handle and avatar. Authenticity beats coverage.

### 3.10 Pricing / "free" framing (MIT)

**The pattern.** Open-source libraries don't have pricing tables — they have a "How we sustain this" section, a "Sponsor" link, or an "Enterprise support" CTA. shadcn doesn't mention sustainability at all. Mantine has a clear "MIT licensed, free forever." Supabase has a pricing page because of the hosted product.

**Recommendation.** A small footer-adjacent section: **"MIT licensed. Free forever. Enterprise support and design-partner program available."** Link the second sentence to the existing `docs/design-partners` directory. Don't make it look like a pricing tier — make it look like a sentence.

### 3.11 Motion / animation policy

**The pattern.** Three permitted uses:
1. **Scroll-reveal**: 200–400ms fade + 8px translate, runs once.
2. **Hover**: 120–180ms transitions on color / border / shadow.
3. **Product loop**: a short (3–8s) muted MP4 / Lottie showing the product doing one thing.

Forbidden on the chrome: ambient particles, continuously panning gradients, breathing/pulsing badges, shimmering CTAs, drifting backgrounds.

**Recommendation.** Strip all `animation: tk-shimmer infinite`, `tk-bob infinite`, particle fields, and the panorama drag from the marketing landing. Respect `prefers-reduced-motion: reduce` (currently honored — keep that pattern). For the headline, allow *one* on-load animation: a 600ms fade-in with 12px translate-y. That's it.

### 3.12 Dark/light mode strategy

**The pattern.** Dev-tool sites are increasingly dark-mode-first (Vercel, Resend, Linear, Railway). SaaS-buyer sites tend white-first (Vanta, Drata, 1Password) because procurement audiences skew toward white-first habits. For an OSS library targeting *engineers who buy from CISOs*, dark-first with a working light toggle is the best of both.

**Recommendation.** Dark-first. Build a `data-theme="light"` variant that is genuinely usable (not just a half-effort inversion). Persist the choice. Default to system. Both modes must keep the *same* accent cyan — that's the brand anchor.

---

## 4. Anti-patterns (concrete removals from current landing)

Reading `landing/src/sections/`, the following must come out of the marketing landing (most can move to a `/playground` or `/showcase` subpage):

1. **`Hero.tsx` full-bleed 360° panorama.** Replace with a text-first hero per §3.1.
2. **`HolographicUniverse.tsx`, `GalaxyMap360.tsx`, `Tour360.tsx`.** Cosmic / galaxy framing is the single biggest credibility leak when targeting CISOs. Move all three to `/showcase/3d` (one page, three demos, opt-in).
3. **Six-color holographic accent palette** (`#00f5d4`, `#3a86ff`, `#ff006e`, `#ffbe0b`, `#06d6a0`, `#7b2ff7`). Collapse to one accent cyan.
4. **Shimmering gradient CTA button** with `animation: tk-shimmer 8s infinite`. Replace with a solid-fill cyan button, 600 weight, no animation.
5. **"🌐 Fullscreen 360° →" as primary hero CTA.** The primary CTA on a security-positioned dev tool cannot be a VR experience. Move to a nav link labeled "Showcase".
6. **Emoji in component names and badges** ("🧩 102 components", "🛡️ Security kernel", "📄 PDF · no Puppeteer"). Linear, Vercel, Vanta use zero emoji on the chrome. Allowed in: blog posts, GitHub issues, social copy. Not on the landing.
7. **The drag-to-look hint pill** ("🖱️ click + drag · 📱 tilt your phone · 🥽 enter VR"). A landing page that needs to teach you a gesture has failed.
8. **`TkxHolographicBadge` / `TkxHolographicCard` / `TkxHolographicPanel`** as the building blocks of the landing chrome. These components are great showcase pieces — but using them as the *frame* of the marketing site is the equivalent of MUI building their landing entirely out of `<Button color="gradient">`. Use plain, restrained components for the chrome and link to the holographic ones from a "Components" tour.
9. **The "And also" tagline pattern.** Anywhere the copy lists more than three things in one sentence, cut it to one. (Current Hero sub lists ~9.)
10. **Inline style objects with `boxShadow: '0 8px 24px rgba(0, 245, 212, 0.4)'`.** Cyan-tinted shadows feel arcade-y. Use neutral shadows: `0 8px 32px rgba(0, 0, 0, 0.4)`.
11. **`textShadow: '0 4px 32px rgba(0, 0, 0, 0.8)'` on the H1.** Needed only because the background is a busy panorama. Once the background is quiet, drop it.
12. **`fontWeight: 900` on the H1.** Reads as a consumer SaaS hero. Drop to 600.

---

## 5. Specific recommendations for tekivex-ui

### 5.1 Proposed section order (minimum viable redesign)

```
1. Nav                       — logo, Docs, Components, Showcase, GitHub, Theme toggle
2. Hero                      — text-first per §3.1, install-chip + "Read the threat model"
3. Compliance chip row       — "Framework-ready controls for HIPAA · PCI DSS · SOC 2 · 508 · GDPR"
4. The differentiator        — 3-up grid: Threat model · Magic-byte uploads · SHA-256 audit chain
5. Code sample               — TkxFileUpload with verifyMagicBytes, syntax-highlighted card
6. Components at a glance    — 6-tile grid linking to docs (not a 115-item dump)
7. Why regulated teams       — short paragraph + 2 concrete control examples
8. MIT + support             — license line, design-partner CTA, GitHub link
9. Footer                    — sitemap, security.txt, threat model, license, status
```

Nine sections, single screen apiece on desktop. Roadmap, Playground, Packages, Stats, BrandFAQ move to dedicated pages linked from nav and footer.

### 5.2 The 3-color palette

| Role | Token | Hex | Use |
|---|---|---|---|
| Background | `--tkx-bg` | `#0A0B14` | page bg, nav bg |
| Surface | `--tkx-surface` | `#11131F` | cards, code blocks |
| Border | `--tkx-border` | `rgba(255,255,255,0.06)` | hairlines on cards |
| Text primary | `--tkx-fg` | `#FFFFFF` | headlines |
| Text body | `--tkx-fg-2` | `rgba(255,255,255,0.72)` | sub, body |
| Text muted | `--tkx-fg-3` | `rgba(255,255,255,0.48)` | captions, eyebrows |
| Accent | `--tkx-accent` | `#2DD4BF` | one CTA fill, link underlines, one highlight word |
| Accent hover | `--tkx-accent-hi` | `#5EEAD4` | hover only |

That's it. Eight tokens for chrome. Anything more goes inside product UI.

### 5.3 Type stack

```css
--tkx-font-sans: "Inter", "Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
--tkx-font-mono: "JetBrains Mono", "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

--tkx-size-display: clamp(2.75rem, 6vw, 4.5rem);   /* hero H1 */
--tkx-size-h2:      clamp(1.75rem, 3vw, 2.25rem);  /* section heads */
--tkx-size-h3:      1.25rem;
--tkx-size-body:    1.0625rem;                     /* 17px */
--tkx-size-small:   0.875rem;
--tkx-size-eyebrow: 0.75rem;                       /* uppercased eyebrow tag */

/* weights: 400 body, 500 buttons, 600 display, 700 reserved for emphasis-only */
```

### 5.4 Spacing scale

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160`. Section padding: `clamp(96px, 12vw, 160px) 24px`. Card padding: `32px`. Stack gap inside hero: `24px` between headline and sub, `32px` between sub and CTAs, `48px` between CTAs and code card.

### 5.5 Hero composition (concrete)

Two-column on desktop ≥1024px, single-column below:

```
┌────────────────────────────────────────┬─────────────────────────────────┐
│ [eyebrow] v3.17 · MIT                  │  app/upload.tsx          [copy] │
│                                        │  ─────────────────────────────  │
│ The React component library            │  import { TkxFileUpload }       │
│ that ships with a threat model.        │    from 'tekivex-ui';           │
│                                        │                                 │
│ 115 accessible primitives, zero        │  <TkxFileUpload                 │
│ runtime dependencies, and a published  │    accept="image/png"           │
│ security model — built for regulated-  │    verifyMagicBytes             │
│ industry teams.                        │    maxSizeMb={5}                │
│                                        │  /> // rejects renamed .exe     │
│ [▷ npm install tekivex-ui]  [Read the  │                                 │
│                              threat    │                                 │
│                              model →]  │                                 │
└────────────────────────────────────────┴─────────────────────────────────┘
   Framework-ready controls for  [HIPAA] [PCI DSS] [SOC 2] [Section 508] [GDPR]
```

Components used (proposed): `TkxHero`, `TkxCodeCard` (new — wraps Shiki output), `TkxChipRow` (new — small, accessible, dark-mode-aware). Avoid all `Tkx*Holographic*` components on this page.

### 5.6 The compliance chip row — exact framing

Caption above the chips (small, muted, 13px): **"Framework-ready controls for"**. Chips are 28px tall, 12px horizontal padding, 1px border `var(--tkx-border)`, `rgba(255,255,255,0.04)` background, neutral text. Each chip is a link to a per-framework page.

The pages must use this disclaimer at the top:

> *tekivex-ui is a React component library distributed under the MIT license. Compliance certifications attach to deployed applications and the organizations that operate them, not to dependencies. The components and utilities listed below implement controls commonly required by [framework]. Verifying that your deployment meets [framework] in full is your responsibility (and your auditor's).*

Then a table: **Control reference · Component or API · Notes**.

Drop `EAA` from the chip row (mention on the accessibility page only — it overlaps Section 508 enough to feel like padding the row). The five-chip row reads as confident; six reads as overreaching.

### 5.7 Minimum viable redesign — what to ship

If we can only ship five sections this sprint, ship these:

1. **New Hero** (§5.5) — replaces `Hero.tsx`.
2. **Compliance chip row** (§5.6) — directly under hero, single horizontal row.
3. **Differentiator 3-up** — three cards: "Published threat model" / "Magic-byte file verification" / "SHA-256 audit chain". Each card: title, 2-sentence body, link to docs. No holographic chrome.
4. **Code sample card, larger** — full-width, 720px max, the `TkxFileUpload` example expanded to ~16 lines with `onReject` handler. This is the single piece of marketing collateral most likely to convert a skeptical engineer.
5. **MIT + support footer band** — license, design-partner program link, GitHub, security.txt, threat model PDF link.

Everything else moves to dedicated pages: `/components`, `/showcase` (where the 3D / holographic / panorama lives), `/playground`, `/roadmap`, `/changelog`.

---

## 6. References

Sites analyzed (training-data observation, see method note in header):

- **linear.app** — Tightest text-first hero in the industry; the violet accent is the most-copied palette move of the last three years.
- **vercel.com** — Black-first, big bold type, deploy-CLI snippet as proof; the canonical dev-tool landing.
- **stripe.com** — Indigo→cyan gradient sweep; teaches that one premium gradient outperforms five cheap ones.
- **resend.com** — Black + warm pink + one code card; the cleanest security-adjacent landing in 2025.
- **clerk.com** — Mesh gradient + SOC 2/HIPAA chips near hero; the model for "auth-grade trust signals."
- **railway.app** — Terminal aesthetic; dense without feeling cluttered.
- **supabase.com** — Open-source-aware: GitHub star count + customer logos + SOC 2 badge in footer.
- **vanta.com** — *The* template for "framework chips under the hero." Copy this directly.
- **drata.com** — Same playbook as Vanta; useful for confirming the pattern, not for novelty.
- **workos.com** — Code-sample card in hero done right; the "enterprise-ready" framing is well-borrowed.
- **trustpage.com** — Trust profile concept worth borrowing for our `docs/compliance/*` pages.
- **1password.com/business** — Compliance certifications grid is the gold standard for "we take this seriously."
- **ui.shadcn.com** — Zero-chrome aesthetic; proves a component library landing can be almost entirely components.
- **mantine.dev** — Feature-dense without being noisy; the MIT framing line we should borrow.
- **chakra-ui.com** — Accessibility-forward positioning we should learn from but not copy (their site is dated).
- **mui.com** — Enterprise React UI landing reference; their customer-logo discipline (NASA, Boeing, Amazon) is what we aspire to once partners are signed.

---

**Bottom line.** tekivex-ui's positioning (the threat-model line) is already best-in-class. The landing's *visual language* is fighting the positioning. Five concrete moves — text-first hero, one accent cyan, drop the 360° panorama from the chrome, add a Vanta-style framework chip row, replace the holographic badge wall with a single static code card — close the credibility gap without changing a single line of the underlying library.
