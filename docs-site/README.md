# tekivex-ui — docs site (Astro + Starlight)

Real flat-URL static site to replace the hash-routed SPA at `demo/`.

## Run locally

```bash
cd docs-site
npm install
npm run dev      # → http://localhost:4321
```

## Build

```bash
npm run build    # outputs dist/
```

## Deploy to Render

In the Render service settings:

- **Root directory**: `docs-site`
- **Build command**: `npm install && npm run build`
- **Publish directory**: `docs-site/dist`

The legacy `demo/` site can stay running on a different path/subdomain
(e.g. `playground.tekivex.com`) for the interactive component sandbox.

## What's migrated so far

- `/` (home / splash)
- `/getting-started/`
- `/bundlers/`
- `/themes/`
- `/rsc/`
- `/security/`
- `/ecosystem/`
- `/license/`
- `/components/` (index)
- `/components/button/`
- `/templates/` (index)

Remaining 70-odd component pages migrate page-by-page; the autogenerate
sidebar picks them up automatically as they land in
`src/content/docs/components/`.

## Why this exists

The old SPA lived at `https://ui.tekivex.com/#/components/button` —
fragments don't get indexed by Google. Astro Starlight gives us:

- Real `<title>` and `<h1>` on first byte
- Auto-generated sitemap (one URL per page, not one for the whole site)
- Built-in search, dark mode, copy-to-clipboard on code blocks
- MDX so we can embed live React islands when interactive demos matter
