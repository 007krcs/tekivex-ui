# TekiVex Pro — business sketch

A first-pass plan for a paid tier on top of the open-source library. Not a
commitment; just enough scaffolding to test demand.

## The thesis

The free tier (everything we've shipped) is **strong enough** to win on
adoption. The Pro tier doesn't need to gate critical functionality — that
would just push people to fork. Instead, Pro sells **time, polish, and
peace of mind**.

Three things people will pay for:

1. **Premium templates** — the things designers spend a week tweaking
2. **Premium 3D assets** — the things 3D artists charge $200+ per piece for
3. **Priority support** — the thing enterprise procurement insists on

## Pricing

| Tier | Price | What's included |
|---|---|---|
| **Open source** | $0 | Everything in tekivex-ui + companions, MIT |
| **Pro Solo** | $19/mo or $190/yr | Premium templates + assets, priority issues |
| **Pro Team** | $49/mo per dev (5+ seats: $39/mo) | Solo + invoiced billing, white-label, support SLA |
| **Enterprise** | Contact us | Pinned versions, security review, on-prem option |

The $19 / $49 split mirrors what shadcn-pro, Tailwind UI, and Mantine UI Pro
charge. Below $19 is "noise" pricing (people don't trust it). Above $99 needs
a sales motion (which you don't have time for yet).

## What ships in Pro

### Premium templates (the headline)

These extend `tekivex-templates`. PDF + browser, both layouts. All AAA
accessible.

| Template | Use case | Estimated dev hours |
|---|---|---|
| **Resume / CV** (5 styles) | Job applications | 8h × 5 = 40h |
| **Pitch deck** (Y Combinator + Sequoia formats) | Fundraising | 16h |
| **Wedding invitation** (Indian + Western) | Hindi/Devanagari support | 24h |
| **Restaurant menu** | Multi-language, photo grid | 12h |
| **Real-estate brochure** | Photo carousel, floorplan, PDF + web | 20h |
| **Academic transcript** | LaTeX-style typography | 16h |
| **Medical prescription** | MCI-standard layout | 12h |
| **Annual report** (12-month dashboard view) | Charts + photo + KPI | 24h |
| **E-commerce product card** | Schema.org Product, multi-variant | 8h |
| **Event ticket / pass** (with QR + barcode) | Concert / conf | 8h |

Total dev investment: ~180 hours = ~4 weeks of focused work.

### Premium 3D assets (for tekivex-3d)

| Asset | Format | Notes |
|---|---|---|
| **Pre-rigged TkxAvatar3D variants** (12 personas) | glTF | South Asian + global representation |
| **Branded TkxLogo3D scenes** (configure with your colors) | Procedural | Hero-page-ready |
| **8 cosmic / corporate / aurora 360° skies** | 8K equirectangular | Replace Wikimedia images on the live site |
| **Product mockup 3D scenes** (laptop / phone / tablet) | glTF | For SaaS landing pages |

### Priority support

- Issues opened by Pro subscribers get the `pro` label, replied within
  24h business days
- Quarterly office-hours call (group, 30 min) for Team tier
- Dedicated Slack channel for Enterprise

### White-label theme builder

- Visual theme editor that emits a `theme.ts` your team imports
- Lock CSS custom properties to your brand
- Preview across all 99 components instantly

### What's NOT in Pro (deliberately)

- The 99 core components — stay free forever
- The security kernel — stays free; security shouldn't be paywalled
- The accessibility guarantees — same
- The 3D primitives — Scene, Card3D, Panorama360, Hotspot, XRSession all free
- The KYC pack — stays free; financial inclusion shouldn't be paywalled

## Distribution channel

- Stripe Checkout integration (you already know how — `tekivex-payment-button`
  documents this for tekivex-finance subscribers)
- License keys delivered via email, validated against your own server
- ~10 KB validation client baked into Pro packages — fails open if your
  server is down (don't break customers' builds because of your infra)

## Going-to-market

**Month 1**: Launch with 3 templates (Resume, Pitch Deck, Restaurant menu).
Charge $19/mo. Goal: 50 paying customers = $950 MRR.

**Month 2**: Add 3 more templates + first 3D asset pack. Goal: 100 = $1900.

**Month 3**: Team tier opens. First enterprise outreach to 5 Bangalore
SaaS companies. Goal: 200 + 1 enterprise = $4500 MRR.

**Month 6**: Break-even on the 4-week dev investment.

## Risks

| Risk | Mitigation |
|---|---|
| Forks of the Pro repos | Use license-key check; small enough to make piracy not worth it |
| Free templates that match Pro quality | Stay 6 months ahead — keep shipping |
| Community frustration ("greedy") | Be vocal: "core stays free forever" + show the line clearly |
| Stripe risk in India for international cards | Razorpay sub-account for INR; Paddle for USD globally |

## What to do FIRST (don't ship yet)

1. **Add a "/pro/" placeholder page to ui.tekivex.com** that says "coming
   soon — sign up for early access" with an email form. Measure interest.
2. **Run a Twitter / LinkedIn poll**: "Would you pay $19/month for premium
   PDF templates and 3D asset packs on top of TekiVex UI?" Publish results
   honestly.
3. **If <50 sign-ups in 4 weeks**, don't build it. Stay free, ship Pro
   later when the user base is bigger.

## What I won't do for you

- Stripe / Razorpay account setup — that's your business identity
- Email capture infra — depends on your stack (ConvertKit / Loops / Resend)
- Tax / GST registration — depends on jurisdiction

When you're ready to actually ship Pro, file an issue in the public tracker
and I'll spin up the customer-facing flow (license-key validation, paid
templates as their own npm packages with auth gates, etc.)
