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

The repo's [`render.yaml`](../render.yaml) blueprint defines two services:

| Service | Subdomain | Builds from |
|---|---|---|
| `tekivex-ui` | `ui.tekivex.com` | `docs-site/` (this folder) |
| `tekivex-ui-playground` | `playground.tekivex.com` | `demo/` (legacy SPA) |

After pushing this folder to master, sync the blueprint in Render's
dashboard. Both services auto-deploy on every subsequent push.

Full step-by-step playbook (with the dashboard clicks, DNS records, and
Google Search Console submission): [`../docs/render-deploy.md`](../docs/render-deploy.md)

### Other host options (if you ever migrate off Render)

This same `docs-site/` folder builds unchanged on:

- **Cloudflare Pages** — see `wrangler.toml`
- **Netlify** — see `netlify.toml`
- **Vercel** — see `vercel.json`
- **GitHub Pages** — see `.github/workflows/deploy-pages.yml`

Pick any of them, connect to the GitHub repo, change DNS CNAME — live in
10 minutes. The architectural insurance that no single host can break the
deploy.

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
