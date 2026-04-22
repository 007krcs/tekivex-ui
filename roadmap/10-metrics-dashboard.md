# Metrics dashboard + decision framework

**Status:** draft  
**Owner:** PO (you)  
**Cadence:** weekly review, monthly trend, quarterly decision point

## Why

We need to know: *is tekivex-ui working as a product, or are we shipping into a void?* Vanity metrics (stars) are easy to hit and mean nothing. The framework below weights adoption, trust, and revenue separately so one can't mask the others.

## Three-axis scorecard

### Axis 1 — Adoption (reach)
| Metric | Source | Healthy trend |
|---|---|---|
| npm weekly downloads (`@tekivex/ui`) | npmjs API | +10% MoM after launch, steady |
| GitHub stars | GH API | +50 / week sustained for 3 months |
| `create-tekivex-app` invocations | npm downloads | >20% of `@tekivex/ui` installs |
| `@tekivex/audit` weekly runs | npm downloads | >5% of `@tekivex/ui` installs |
| Unique docs visitors (tekivex.dev) | server logs | growing WoW |
| Dependents on npm | npmjs API | >50 within 6mo |

**Red flag:** stars growing but downloads flat = marketing working, product isn't sticky.

### Axis 2 — Trust (depth)
| Metric | Source | Healthy trend |
|---|---|---|
| Open issues → closed median time | GH API | <72h for bugs, <2wk for features |
| Security disclosures received | security@ inbox | >0 is healthy — means researchers trust us |
| CVE response time | incident log | <24h for Pro SLA |
| Pen-test findings severity distribution | attestation letter | high/critical = 0 after remediation |
| Accessibility audit score (Lighthouse, axe) | CI | 100 on every release |
| `@tekivex/audit` false-positive rate | user feedback | <5% |

**Red flag:** zero disclosures in 6 months = we're too small to attack OR researchers don't know we exist. Investigate.

### Axis 3 — Revenue (sustainability)
| Metric | Source | Healthy trend |
|---|---|---|
| Pro MRR | billing (when live) | after 6 months post-launch: >$2k |
| Pro seats sold | billing | after 6 months: >10 accounts |
| Enterprise pipeline | CRM | >3 serious conversations per quarter |
| Trial-to-paid conversion | billing | >20% |
| Churn | billing | <5% monthly |
| CAC vs. LTV | billing + ad spend | LTV/CAC > 3 before scaling paid |

**Red flag:** heavy adoption, zero revenue after 12 months = wrong pricing model or wrong target customer.

## Decision framework

Every quarter, review all three axes and pick one of:

1. **Invest more in what's working** — if all three are green, double down
2. **Fix the weak axis** — specific campaign to lift the lagging one
3. **Pivot** — if two axes have been red for two consecutive quarters, change strategy (audience, pricing, scope)
4. **Sunset** — if all three are red after 18 months of genuine effort, wind down and document what we learned

### Quarterly checklist
- [ ] Pull raw numbers into `metrics/YYYY-QN.md`
- [ ] Compute 13-week trend per metric
- [ ] Flag metrics outside healthy band
- [ ] Pick one decision per axis
- [ ] Write 1-page retro

## Dashboard implementation

Phase 1 (month 1): `metrics/` folder in the repo, manual markdown pull once a week.  
Phase 2 (month 3): scheduled GitHub Action that runs a collector script and writes `metrics/latest.json` + a chart.  
Phase 3 (month 6): internal hosted dashboard at `metrics.tekivex.dev` (basic auth), wraps the same JSON.

No need for Grafana, Plausible, or a paid analytics tool in phase 1–2. Over-engineering metrics before you have traffic is its own failure mode.

## What we're NOT measuring

- Twitter impressions
- HN front-page position
- DAU / MAU on docs site (we want them to read once and leave)
- Competitor stars

These are either vanity or uncorrelated with library success. Resist the temptation.

## Definition of "launch success" (6-month read)

Pick 3 targets before launch, revisit at T+6:
- Adoption: 500 weekly downloads
- Trust: 1 publicly-attributed security disclosure resolved, pen-test attestation published
- Revenue: 5 paying Pro accounts OR 1 enterprise contract signed

Hit 2 of 3 → keep shipping.  
Hit 0 of 3 → re-examine the thesis.
