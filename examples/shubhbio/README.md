# ShubhBio — Affordable, Multi-Religion Biodata Creator

> **Sabka Biodata, Sabki Bhasha, Sirf ₹20** — Everyone's biodata, every language, just ₹20.

ShubhBio is the reference application built on top of `tekivex-ui@2.7+` and its
`/biodata` sub-export. It demonstrates an end-to-end biodata creation flow:

- **Multi-religion templates** (Hindu, Muslim, Christian, Sikh, Jain, plus
  modern minimal, royal-card, resume-style)
- **No login** — anonymous draft via httpOnly cookie + Redis (7-day TTL)
- **Live, locked preview** with screenshot / print / clipboard / DevTools
  guards and a forensic dynamic watermark
- **₹20 one-time payment** via Razorpay
- **Single-use signed download token** issued only after server-side
  signature verification
- **Native PDF generation** with embedded JPEG photos and Indic-script
  text rasterized via canvas (no Puppeteer, no jsPDF)
- **12 Indian regional languages** plus English

## Workspace layout

```
examples/shubhbio/
├── web/                          Vite + React PWA (consumer)
│   └── src/
│       ├── pages/                Home, Builder, Preview, Pay, Success
│       ├── features/             Per-feature React modules
│       ├── stores/               Zustand stores
│       ├── i18n/                 Locale switcher + bindings
│       ├── lib/                  Cross-cutting helpers (api, env)
│       └── components/           App-specific composites
├── api/                          Fastify backend (TypeScript)
│   └── src/
│       ├── routes/               draft, payment, webhook, download, templates
│       └── services/             tokenIssuer, razorpay, pdfRenderer
└── packages/
    ├── biodata-schemas/          Zod schemas per religion
    └── biodata-templates/        Template registry consumed by both web & api
```

## Design principles

1. **Affordability** — ₹20 max per download, ever.
2. **Religious neutrality** — every religion is a first-class template.
3. **Privacy** — no login; biodata encrypted at rest; auto-purged 7 days
   after download.
4. **Security** — composite preview guards plus per-session forensic
   watermark.
5. **Self-reliance** — built only on `tekivex-ui` + native browser APIs.
   No Puppeteer, no jsPDF.

## Build status

This workspace is scaffolded. Phases 2–9 of the project plan flesh out
each module:

- [ ] Phase 2 — Religion picker + 8-template gallery
- [ ] Phase 3 — Multi-step biodata builder wizard
- [ ] Phase 4 — Locked live preview with security guards
- [ ] Phase 5 — PDF rendering for all 8 templates
- [ ] Phase 6 — Razorpay payment + signed download token + Fastify webhook
- [ ] Phase 7 — PWA polish + i18n switcher
- [ ] Phase 8 — Security hardening + pen-test
- [ ] Phase 9 — Beta launch

## Local development (after Phase 1 scaffold)

```bash
# from the tekivex-ui repo root
pnpm install                                # installs workspace deps
pnpm --filter @shubhbio/web dev             # starts the web app
pnpm --filter @shubhbio/api dev             # starts the API in another shell
```

The web app links the parent `tekivex-ui` package via the workspace so
changes to the library flow into the example without a republish.
