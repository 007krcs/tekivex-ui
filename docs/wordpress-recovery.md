# WordPress site no longer accessible — diagnostic checklist

You said your WordPress site used to be visible (including from inside Citi's network) but now isn't. There are about a dozen common causes. This checklist walks you through them in the order most-likely-to-least-likely.

I cannot directly access your hosting or DNS, so this is a self-diagnosis tool. Each step takes 2–5 minutes.

## Step 1 — Is the site actually down, or just down for you?

Open these in order, **outside Citi's network** (use your phone on cellular, or any other network):

| Test | What it tells you |
|---|---|
| Hit your site URL directly in a browser | If it loads, the site is fine — the issue is Citi's network filtering |
| `https://www.isitdownrightnow.com/<your-domain>.html` | Independent uptime check |
| `dig your-domain.com` (or [whatsmydns.net](https://www.whatsmydns.net/)) | Tells you whether DNS still resolves |
| `curl -I https://your-domain.com` | Returns the HTTP status — 200 / 301 / 403 / 503 / no response, all mean different things |

**Branching from here:**

- **Loads fine outside Citi:** skip to Step 7 (Citi network filter).
- **Doesn't load anywhere:** continue with Step 2.

## Step 2 — Is your hosting bill paid?

The single most common cause of "site went away with no warning" is the host suspending the account for non-payment.

- Log in to your hosting dashboard (Bluehost, SiteGround, Hostinger, GoDaddy, whatever you used)
- Look for:
  - **"Account suspended"** banner
  - Outstanding invoices
  - Auto-renewal failure (expired credit card)
  - Free trial expiration

**Fix:** pay the invoice, the site usually comes back within 1 hour.

## Step 3 — Did the domain expire?

Run a WHOIS lookup: [`who.is/whois/your-domain.com`](https://who.is/)

Look for:
- **Expiration date** — if past, the domain registration lapsed and someone else (or your registrar's parking page) now owns it
- **Renewal grace period** — most TLDs give 30 days; you can still renew during that window

**Fix:** renew at your registrar (GoDaddy, Namecheap, Google Domains transferred to Squarespace, etc.). Site comes back when the domain re-resolves.

## Step 4 — Did the SSL/TLS certificate expire?

If `https://your-domain.com` shows a browser warning ("connection not private"), the cert expired.

- Visit `https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com`
- Check the cert expiry date

**Fix:** most hosts auto-renew Let's Encrypt certs. If yours doesn't:
- Log in to hosting → SSL section → click "renew" or "install Let's Encrypt"
- For cPanel hosts, this is usually under **Security → SSL/TLS Status**

## Step 5 — Did your DNS records change?

Your domain points to your host via DNS A / CNAME records. If those got pointed somewhere else (or were deleted), the domain doesn't reach the host.

- DNS panel at your registrar should show:
  - **A record**: `@` → an IPv4 address (your host's IP)
  - **CNAME** for `www` → typically the apex or a hostname

**Fix:** restore the A record. Your host's support team can give you the right IP.

## Step 6 — Did the WordPress install break?

If the host is up and DNS resolves but WordPress shows a white page or error:

- **"Error establishing a database connection"** — check your `wp-config.php` DB credentials, and confirm MySQL is running
- **White screen** — usually a PHP fatal. SSH/SFTP into the server, rename `wp-content/plugins/` to `wp-content/plugins-disabled/` to deactivate everything, see if WP loads
- **"Briefly unavailable for scheduled maintenance"** — delete `.maintenance` from the WordPress root
- **HTTP 500** — check `wp-content/debug.log` if `WP_DEBUG_LOG` is on; common cause is exhausted PHP memory

## Step 7 — Citi's network is blocking it

If the site loads outside Citi but not inside, Citi's proxy or web filter has classified the domain. Causes:

- **New domain not yet categorised** — Citi's filter assumes "uncategorised personal website" = blocked. They review category appeals.
- **Domain miscategorised** as "personal blog" or "uncategorised" — happens especially after a domain change
- **You're running on a port other than 80/443** — corp networks block weird ports
- **You moved hosts and the new host is on Citi's deny-list** (Bluehost/HostGator IP ranges have been blocked at some banks for malware reasons)

**Fix:**
- Email Citi's IT desk: subject "URL category review request" with the URL
- They typically take 1–2 business days to recategorise
- In the meantime: tether to your phone for access

## Step 8 — Was the site migrated and indexes lost?

If you migrated from one host to another, or from one CMS to another:

- Old URLs might 404 if the migration didn't preserve the URL structure
- Google needs to recrawl, which takes weeks
- **301 redirects** are the fix — every old URL should redirect to its new equivalent

This doesn't make the site disappear, just makes search results dead-link to it.

## Step 9 — Visibility inside corporate networks vs visibility on Google

You mentioned "visible on internal Citi network" — that's a different signal than "visible on Google". Inside a corp network you may be reaching the site via the corporate proxy which has its own DNS resolver. Two things to check:

- **Public DNS** vs **corp DNS** — `nslookup your-domain.com` from your phone vs from your work laptop. Different answers = corp DNS is doing something.
- **Internal proxy whitelisting** — some corp environments only allow whitelisted external sites. Your old site might have been whitelisted; the new one may not be.

This is a Citi IT ticket, not a hosting issue.

## Step 10 — The nuclear option: hosted somewhere else

If the WordPress install is genuinely broken and you don't need WP-specific features:

- Export your content as static HTML (WP plugin: Simply Static, or `wget --mirror`)
- Host the static export on **Cloudflare Pages** or **Netlify** for free
- Total time: 1 hour
- Bonus: corp networks rarely block Cloudflare-hosted sites

Your `tekivex-ui` docs site (Astro Starlight) is already this kind of static deployment — once Render is wired up, you have a model for moving the WordPress content over too.

## Quick-summary diagnosis matrix

| Symptom | Most likely cause | First action |
|---|---|---|
| Site loads outside Citi, not inside | Citi network filter | Email Citi IT |
| Site loads nowhere, browser says "site can't be reached" | Hosting suspended OR DNS broken | Login to host + check WHOIS |
| Site loads, but cert warning | SSL expired | Renew cert in host panel |
| Site loads but shows error / white page | WP plugin / DB issue | Disable plugins via SFTP |
| Site loads on `http://` but not `https://` | SSL config broken | Reinstall Let's Encrypt |
| Site loads at `www.foo.com` but not `foo.com` (or vice versa) | DNS A record missing | Add the missing record |

## If you tell me what you see at each step

I can narrow the diagnosis. Specifically:

1. What does the URL bar / error look like when you try to visit it?
2. From inside Citi vs outside, do you see the same thing?
3. When was the last time it worked? Anything change around that date?
4. Who's the hosting provider?
5. Where's the domain registered?

With that I can give you a one-step fix instead of a checklist.
