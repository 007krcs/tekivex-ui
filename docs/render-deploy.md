# Render deploy — playbook for tekivex-ui

You're already on Render. This is the one document you need.

## What's happening today

- Your existing Render service is named **`tekivex-ui`**
- It builds `demo/` (the legacy hash-routed React SPA)
- It serves at **`ui.tekivex.com`** (custom domain attached in the Render dashboard)
- It auto-deploys on every git push to master

That's working — Render itself isn't the problem. **The problem is what it builds.** A hash-routed SPA is invisible to Google because every page looks like the same URL (`ui.tekivex.com/`) — the `#/components/button` part is a fragment, not a separate document.

We've already shipped the fix in the repo: `docs-site/` is an Astro Starlight build that produces real flat URLs (`/components/button/`, `/components/modal/`, etc.) Google can index.

This playbook flips the existing Render service to build `docs-site/` instead, while keeping the legacy SPA available at a different subdomain.

## What you'll have when you're done

| Site | Subdomain | Deploys from | Indexed by Google? |
|---|---|---|---|
| **Canonical docs** | `ui.tekivex.com` | `docs-site/` (Astro Starlight) | ✅ yes — flat URLs |
| **Interactive playground** | `playground.tekivex.com` | `demo/` (hash-routed SPA) | ❌ no, but doesn't need to be |

Both auto-deploy on every push. No DNS surprises, no broken bookmarks (the legacy demo stays live for existing users).

## Step-by-step

### 1. Push the updated `render.yaml`

I've already updated `render.yaml` in this commit. Once you `git push`, Render reads it on next sync.

### 2. Sync the blueprint in the Render dashboard

1. Open [dashboard.render.com](https://dashboard.render.com)
2. Click into your existing `tekivex-ui` service
3. **Settings → Build & Deploy** — you should see a "Sync Blueprint" / "Re-read render.yaml" option. Click it. (Render usually auto-detects YAML changes within ~1 minute of a push, but the manual sync is faster.)
4. Two changes happen:
   - The existing `tekivex-ui` service will rebuild from `docs-site/` next deploy. Custom domain `ui.tekivex.com` stays attached.
   - A new service `tekivex-ui-playground` gets created. It builds `demo/` and is initially served only at its `<random>.onrender.com` URL.

### 3. Add `playground.tekivex.com` as a custom domain

Only needed if you want the legacy demo to keep getting traffic.

1. Click into the new `tekivex-ui-playground` service
2. **Settings → Custom Domains → Add**
3. Type: `playground.tekivex.com`
4. Render shows you a CNAME target (looks like `tekivex-ui-playground.onrender.com`)
5. At your DNS provider:
   - Type: CNAME
   - Name: `playground`
   - Value: the CNAME target from step 4
   - TTL: 3600 (or default)
6. Wait 5–60 minutes for DNS + SSL provisioning
7. Done — `playground.tekivex.com` now serves the legacy demo

### 4. Verify everything

After the next push, check:

- `https://ui.tekivex.com/` → Astro Starlight homepage with hero
- `https://ui.tekivex.com/components/button/` → real flat URL, full HTML
- `https://ui.tekivex.com/sitemap-index.xml` → XML sitemap with one entry per page
- `https://playground.tekivex.com/` → legacy demo loads
- `https://playground.tekivex.com/#/components/button` → legacy demo with hash routing works

If `ui.tekivex.com/components/button/` returns a 404, check the build logs for the new docs-site service.

### 5. Submit the new sitemap to Google

This is the step that actually triggers indexing.

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. If you haven't already: Add property → **Domain** → enter `tekivex.com` → verify via DNS TXT record
3. **Sitemaps** (left nav) → enter `https://ui.tekivex.com/sitemap-index.xml` → Submit
4. **URL Inspection** → enter `https://ui.tekivex.com/` → Request Indexing

Google starts crawling within hours; first indexed pages typically appear in 2–14 days.

## Why Render is fine for universal accessibility

I mentioned Cloudflare in the previous doc as a top-tier option. **Render is also fine** — for the specific question "will this be reachable from inside Citi", Render's static-site offering uses a CDN edge that's typically classified as `Web Hosting / CDN` by Zscaler / Cisco Umbrella / Symantec WSS. The URL `*.onrender.com` is widely whitelisted at enterprises.

Where Cloudflare has a slight edge:

- More aggressive global edge presence (300+ POPs vs Render's ~20)
- Almost universal whitelisting at enterprises (Cloudflare is the #1 CDN by traffic volume)
- Cheaper at high volume

But for a docs site getting pre-launch traffic, Render is operationally simpler and you're already on it. **Stay on Render.** Move only if you hit a specific limitation.

If `ui.tekivex.com` ends up blocked at Citi specifically:

- Email Citi IT with subject "URL category review request" — they typically recategorise within 1–2 business days
- Or, as a backup, you can also deploy `docs-site/` to Cloudflare Pages in parallel (the configs are already in the repo: `docs-site/wrangler.toml`). Run both, point one DNS record at one and another at the other for redundancy.

## Domain side — set this up so the site can't expire

Renew on auto-pilot:

1. Confirm where `tekivex.com` is registered
2. Log in to that registrar
3. **Enable auto-renew** with a credit card that's not expiring soon
4. **Pre-pay 5 years** if your registrar supports it (it's the same per-year price; you just front-load)
5. Set a calendar reminder for 30 days before expiration as a backstop

Registrars I trust: Cloudflare Registrar, Porkbun, Namecheap. If you're on GoDaddy, consider transferring — they have a long history of "auto-renew quietly failed" stories due to billing-system issues and aggressive upsell prompts.

## Backup plan — one config, multiple hosts

If Render ever has an extended outage or kicks you off (rare, but possible — has happened to people for ToS violations, or just because the company changed direction):

The same `docs-site/` builds and runs on:

- **Cloudflare Pages** — `docs-site/wrangler.toml` already in the repo
- **Netlify** — `docs-site/netlify.toml` already in the repo
- **Vercel** — `docs-site/vercel.json` already in the repo
- **GitHub Pages** — `.github/workflows/deploy-pages.yml` already in the repo

Pick any of them, connect to the same GitHub repo, change the DNS CNAME for `ui.tekivex.com` — site is back live in 10 minutes.

This is the architectural insurance that makes the deploy "permanent" — there's no single host you depend on for survival.

## Summary checklist

- [ ] Push the updated `render.yaml`
- [ ] In Render dashboard, sync the blueprint
- [ ] Confirm `tekivex-ui` service rebuilt from `docs-site/`
- [ ] Confirm new `tekivex-ui-playground` service exists
- [ ] Add `playground.tekivex.com` custom domain to the new service
- [ ] Update DNS CNAME for `playground` subdomain
- [ ] Verify both sites load
- [ ] Submit sitemap to Google Search Console
- [ ] Confirm domain auto-renew is on with a valid card

Time to complete: **30 minutes**, mostly spent waiting for DNS propagation.
