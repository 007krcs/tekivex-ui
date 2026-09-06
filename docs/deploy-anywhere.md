# Deploy anywhere — making a website reachable from every environment

Your old WordPress site stopped working. The question now isn't "how do I fix WordPress" — it's the bigger one: **what architecture makes a site reachable from anywhere, including corporate networks like Citi, and stays reachable indefinitely without manual babysitting?**

Here's the real answer.

## The three failure modes you're solving for

Any site can fail in one of three ways:

1. **The domain expires** → site becomes someone else's
2. **The hosting lapses** → site returns 503 / nothing
3. **A corporate network blocks it** → some users can't reach it even though it's "up"

Almost every "my site disappeared" story is one of these three. The architecture below makes each one nearly impossible.

## The architecture: static site on a major CDN

| Layer | What it does | Why this wins |
|---|---|---|
| **Static HTML/JS/CSS** | Your content, pre-rendered at build time | No database to crash, no PHP to break, no plugin to update |
| **CDN edge** (Cloudflare / Netlify / Vercel) | Serves your files from 300+ data centres globally | Sub-100ms TTFB anywhere on Earth; *pre-whitelisted at most corporate proxies* |
| **Auto SSL** (Let's Encrypt via the CDN) | Renews itself every 60 days | You never see a "cert expired" warning |
| **DNS at a major registrar with auto-renew** (Cloudflare Registrar, Porkbun, Namecheap) | Your domain renews on the credit card on file | The site can't expire silently |
| **Source on GitHub** | The truth lives in version control | If a host disappears, you redeploy in 5 minutes elsewhere |

If those five things are wired up, your site stays live with **zero maintenance** for years.

## Why corporate networks like Citi can usually reach Cloudflare/Netlify/Vercel

Banks and enterprises don't whitelist individual sites — they whitelist **categories** at their proxy (Zscaler, Cisco Umbrella, Symantec WSS, etc.). Most corporate-grade web filters categorise:

- `*.cloudflare.com` (and the Cloudflare Pages domain `*.pages.dev`) → **Content Delivery Network** category, allowed
- `*.netlify.app` → **Web Hosting / CDN**, allowed
- `*.vercel.app` → **Web Hosting / CDN**, allowed
- `*.github.io` → **Software / Technology**, usually allowed (sometimes flagged for dev-only access)
- A random hosting provider you've never heard of → **Uncategorised Personal Site**, usually **blocked**

This is why your WordPress site on a small host got blocked by Citi: that host's IP block was classified as "uncategorised personal." The fix isn't to keep that host — it's to move to one of the four CDNs above.

## The four deploy targets, ranked for *universal accessibility*

### 1. Cloudflare Pages — **the recommendation for tekivex-ui**

Why it wins:

- Corporate proxies almost always allow Cloudflare (the world's largest CDN)
- 100% free tier covers up to 500 builds/month and unlimited bandwidth
- Custom domain (`www.tekivex.com/ui`) free, with automatic SSL
- Pages stay live forever even if you stop deploying
- Anycast network — sub-50ms latency from most major cities
- Built-in DDoS protection
- No payment information required

Trade-off: build minutes capped at 500/month free tier (more than enough for normal use).

### 2. Netlify

Pros similar to Cloudflare. Slightly more generous free build minutes (300/month). Good DX. Slight downside: `netlify.app` subdomain is occasionally classified as "personal hosting" by older corporate filters, though `*.netlify.app` is increasingly recognised.

### 3. Vercel

Best if you're using Next.js (zero-config deploys). The free hobby tier has bandwidth limits; for a docs site getting heavy traffic post-launch, you'd hit them faster than Cloudflare.

### 4. GitHub Pages

Free, simple, reliable. Almost always reachable on corp networks. Trade-off: no preview deploys per branch, slower build times, less powerful redirect support.

### Your current Render setup

Render is fine — you're already using it. If you want to stay there, no harm. The corp-network reachability is roughly equivalent to Vercel. The reason I'm recommending Cloudflare is **higher whitelisting confidence** at enterprises.

## Concrete plan for `tekivex-ui` — 30 minutes

Here's exactly what to do, in order:

### Step 1 — Build the docs-site once locally to confirm it works

```bash
cd docs-site
npm install
npm run build
# → outputs dist/
```

If that succeeds, you're good. (We've already wired up Astro Starlight + the redirects + the JSON-LD.)

### Step 2 — Sign up for Cloudflare Pages (free, no card needed)

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Sign in with GitHub (so it can read the repo)
3. **Create a project → Connect to Git → choose `007krcs/tekivex-ui`**
4. In the build configuration:
   - **Framework preset:** Astro
   - **Build command:** `cd docs-site && npm install && npm run build`
   - **Build output directory:** `docs-site/dist`
   - **Root directory:** `/` (leave default)
5. Hit Deploy. First build takes ~3 minutes.
6. Cloudflare gives you `<random>.pages.dev` — visit it to confirm the site works.

### Step 3 — Point `www.tekivex.com/ui` at it

1. In Cloudflare Pages → your project → **Custom domains** → Add `www.tekivex.com/ui`
2. Cloudflare gives you a CNAME target (e.g. `tekivex-ui.pages.dev`)
3. Add that CNAME at your DNS provider:
   - **Type:** CNAME
   - **Name:** `ui`
   - **Value:** `tekivex-ui.pages.dev`
   - **Proxy status (if you also use Cloudflare DNS):** orange cloud / proxied
4. Wait 5–60 minutes for DNS propagation
5. Cloudflare auto-provisions SSL. Done.

### Step 4 — Verify reachability

Test from:

- Your home network ✅
- Your phone on cellular ✅
- A friend's network in a different country ✅
- Your work laptop on Citi network — usually works because `*.pages.dev` is whitelisted; if not, email Citi IT for a category review

Check `whatsmydns.net/www.tekivex.com/ui` to confirm DNS has propagated globally.

## Domain renewal — set this up once, never worry again

The single biggest cause of "my domain expired" is **manual annual renewal failures**. The fix:

1. Move the domain to a registrar with reliable auto-renew:
   - **Cloudflare Registrar** — at-cost pricing, free WHOIS privacy, no upsells
   - **Porkbun** — at-cost pricing, free WHOIS privacy, excellent UX
   - **Namecheap** — slightly more expensive, fine
   - **Avoid GoDaddy** — pricing trickery, aggressive upsells, frequent renewal-failure stories
2. **Enable auto-renew** with a credit card that doesn't expire in the next year
3. **Set the renewal period to 5 years** if your registrar allows — domains auto-renew per the policy, but pre-paying 5 years means even auto-renew failure has a long buffer
4. **Add a calendar reminder** for 30 days before expiration — even with auto-renew on, you want to confirm

## Backup plan — if your CDN provider goes down or kicks you off

The whole architecture above is **redeployable in 5 minutes** because the source is on GitHub:

1. Cloudflare goes down → connect Netlify to the same GitHub repo, deploy, change DNS CNAME → live in 10 minutes
2. Cloudflare bans you (rare, only happens for ToS violations) → same as above
3. GitHub goes down → unlikely but: push to GitLab as a mirror, redeploy from there

The only thing that can't be replaced from a backup is the **domain name**. That's why domain renewal is the single thing worth babysitting.

## Multi-region check

To verify your site is genuinely globally reachable, use:

- [whatsmydns.net](https://whatsmydns.net) — DNS propagation check across 60+ servers worldwide
- [host-tracker.com](https://host-tracker.com) — uptime + reachability check from 7 continents
- [downforeveryoneorjustme.com](https://downforeveryoneorjustme.com) — quick "is it me or is it down"

Run these once a quarter to make sure nothing has quietly broken.

## What about the WordPress content from the old site?

If you have backups of the old WP install, the cleanest path is to **convert it to static HTML** and host alongside `tekivex-ui` on Cloudflare:

```bash
# Tools that export WP → static
# 1. WP plugin: Simply Static (still requires WP to run once)
# 2. wget --mirror http://your-old-wp.com (run while site was alive)
# 3. Wayback Machine archive: web.archive.org/your-domain — download via wget
```

Once you have the static files:

```bash
# Drop them under a separate Cloudflare Pages project, or as a subdirectory
# of your tekivex repo. Either way, Cloudflare serves them globally.
```

Bonus: a static export is faster, cheaper, more secure, and less likely to break than the original WP install.

## Wired into this repo

I've added Cloudflare Pages, Netlify, Vercel, and GitHub Pages config files to `docs-site/`. Whichever platform you pick, the deploy works without further config:

- `docs-site/wrangler.toml` — Cloudflare Pages
- `docs-site/netlify.toml` — Netlify
- `docs-site/vercel.json` — Vercel
- `.github/workflows/deploy-pages.yml` — GitHub Pages alternative

A `.github/workflows/deploy-cloudflare.yml` will deploy to Cloudflare Pages on every push to `master` once you set the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets.

## The TL;DR

| What | Where | Cost |
|---|---|---|
| Site source | GitHub | Free |
| Build + host | Cloudflare Pages | Free |
| SSL | Auto via Cloudflare | Free |
| Domain | Cloudflare Registrar / Porkbun, auto-renew on | ~$10/year |
| Total | | ~$10/year |
| Reachable on Citi network | Yes (Cloudflare whitelisted) | — |
| Fails if you don't touch it for 3 years | No, as long as the credit card is valid | — |

If you set this up once, the site stays alive without you thinking about it for years. That's the architecture you want for anything important.
