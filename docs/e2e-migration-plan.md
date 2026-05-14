# Migration Plan: Render → E2E Networks

Status: **Plan only — no infrastructure changes yet.**
Audience: someone new to E2E Networks who currently runs tekivex-ui on Render.
Scope: tekivex-ui static site. (Avatar / GPU project is out of scope for this
branch; a separate plan will cover TIR once requirements are gathered.)

---

## 1. What we have today on Render

From `render.yaml`:

- **One** Render static service named `tekivex-ui`, custom domain `ui.tekivex.com`.
- Build: `npm install && node scripts/build-unified-site.mjs`.
- Publish dir: `docs-site/dist` — produced by merging three Vite builds:
  - `/` → Astro Starlight docs (or a stub homepage fallback)
  - `/playground/` → demo/ React SPA
  - `/book/` → packages/tkx-book component catalog
- Per-path response headers (security + cache-control).
- SPA rewrites: `/playground/*` → `/playground/index.html`, same for `/book/*`.
- PR preview deploys enabled.
- Deploys on push to `master`.

Render gives us all of this out of the box. On E2E we have to assemble it.

---

## 2. What E2E Networks offers (the relevant bits)

E2E Networks is an Indian cloud provider. For our use case the relevant
products are:

| E2E product | What it is | Render equivalent |
|---|---|---|
| **Compute (Node)** | Linux VM you SSH into. CPU & GPU SKUs. | The host behind a Render service. |
| **Object Storage (EOS)** | S3-compatible bucket. | Static asset storage. |
| **CDN** | Edge cache in front of a bucket or origin. | Render's built-in CDN. |
| **Load Balancer** | Managed LB with TLS termination. | Render's TLS + routing layer. |
| **TIR** | GPU/ML platform: notebooks, model endpoints, GPU nodes. | (no Render equivalent) |
| **DNS / Domains** | Managed DNS, or use external (Cloudflare, etc.). | Render-managed DNS. |

E2E has no native equivalent of Render's "push to git → static site deploys
with PR previews and per-path header rules." We have to build that.

---

## 3. Recommended target architecture

Given the user is new to E2E, optimize for **fewest moving parts** and
**closest behavioral parity with Render**:

```
GitHub (master)
   │  push
   ▼
GitHub Actions
   │  1. npm install
   │  2. node scripts/build-unified-site.mjs
   │  3. rsync docs-site/dist → E2E VM:/var/www/tekivex-ui/
   ▼
E2E CPU Node (small, e.g. C2.2 / 2 vCPU 4 GB)
   │  nginx serves /var/www/tekivex-ui
   │  TLS via Let's Encrypt (certbot) OR E2E Load Balancer
   ▼
ui.tekivex.com
```

**Why a single Nginx VM and not Object Storage + CDN:**
- Object Storage + CDN is cheaper, but per-path response headers and SPA
  rewrites have to be configured at the CDN edge, which on E2E is less
  flexible than Render's `headers` / `routes` blocks.
- Nginx gives us a 1:1 mapping of the existing `render.yaml` rules into
  `nginx.conf` — straightforward to review and reason about.
- A 2 vCPU node is plenty for static serving and is cheap (~ a few hundred
  ₹/month at the time of writing).

**Why GitHub Actions and not building on the server:**
- Build environment stays disposable & reproducible.
- Server only needs nginx + an SSH key for the deploy user. Smaller blast
  radius.
- Mirrors Render's "build in CI, ship artifact" model.

---

## 4. Step-by-step migration

### Phase 0 — Account & prerequisites

1. Create an E2E Networks account (https://myaccount.e2enetworks.com).
2. Add a payment method, generate an API token (for later automation), and
   create an SSH keypair in **MyAccount → SSH Keys**. Keep the private key
   safe; it's the only way back into the node.
3. Decide on DNS: keep current DNS provider (recommended — fewer changes) or
   move the zone to E2E DNS. Plan assumes current provider.

### Phase 1 — Provision the VM

1. **MyAccount → Compute → Create Node.**
2. Image: Ubuntu 22.04 LTS.
3. Plan: smallest CPU SKU with ≥ 2 GB RAM (e.g. C2.2). Region: closest to
   your users (e.g. Delhi NCR or Mumbai).
4. Attach the SSH key from Phase 0.
5. Enable a public IPv4. Note the IP.
6. Open ports **22, 80, 443** in the node's firewall / security group.

### Phase 2 — Base server setup

SSH in as `root` (or the default user) and:

```bash
apt update && apt upgrade -y
apt install -y nginx ufw certbot python3-certbot-nginx rsync
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable

# Dedicated deploy user — CI rsyncs as this user, never as root.
adduser --disabled-password --gecos "" deploy
mkdir -p /home/deploy/.ssh
# paste the CI public key into authorized_keys, chmod 600, chown deploy:deploy
mkdir -p /var/www/tekivex-ui
chown -R deploy:deploy /var/www/tekivex-ui
```

### Phase 3 — Nginx config

Create `/etc/nginx/sites-available/tekivex-ui` translating `render.yaml`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ui.tekivex.com;
    root /var/www/tekivex-ui;
    index index.html;

    # Security headers (mirror render.yaml)
    add_header X-Frame-Options           "DENY"                              always;
    add_header X-Content-Type-Options    "nosniff"                           always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin"   always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Long-cache hashed asset bundles
    location ~* ^/(_astro|playground/assets|book/assets)/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        try_files $uri =404;
    }

    # HTML — never cache
    location ~* \.html$ {
        add_header Cache-Control "public, max-age=0, must-revalidate" always;
        try_files $uri =404;
    }

    # SPA fallbacks
    location /playground/ {
        try_files $uri $uri/ /playground/index.html;
    }
    location /book/ {
        try_files $uri $uri/ /book/index.html;
    }

    # Astro produces real HTML files — default handler is fine.
    location / {
        try_files $uri $uri/ =404;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/tekivex-ui /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### Phase 4 — TLS

Once DNS resolves to the node (Phase 6), run:

```bash
certbot --nginx -d ui.tekivex.com --redirect --agree-tos -m ops@tekivex.com
```

Certbot auto-renews via systemd timer. Verify with `systemctl list-timers | grep certbot`.

### Phase 5 — CI/CD via GitHub Actions

Add `.github/workflows/deploy-e2e.yml`:

```yaml
name: Deploy to E2E
on:
  push:
    branches: [master]
  workflow_dispatch:

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci --no-audit --no-fund
      - run: node scripts/build-unified-site.mjs

      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.E2E_DEPLOY_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H ${{ secrets.E2E_HOST }} >> ~/.ssh/known_hosts

      - name: Rsync to E2E
        run: |
          rsync -az --delete docs-site/dist/ \
            deploy@${{ secrets.E2E_HOST }}:/var/www/tekivex-ui/
```

Secrets required in GitHub: `E2E_DEPLOY_KEY` (private key), `E2E_HOST` (IP or
hostname). The matching public key lives in `/home/deploy/.ssh/authorized_keys`
on the node.

**PR previews** — not a one-liner on E2E. Options, easiest first:
1. **Skip them.** Review via `npm run build && npm run preview` locally.
2. Use a single shared `preview.ui.tekivex.com` subdir per PR (`/pr-123/`)
   with a small workflow that rsyncs to a numbered folder. Costs nothing
   extra.
3. Spin up a Cloudflare Pages / Netlify project pointed at the same repo
   just for previews; production stays on E2E.

### Phase 6 — DNS cutover

1. Lower TTL on the `ui.tekivex.com` record at the current DNS provider to
   60s. Wait for old TTL to expire.
2. Deploy to the E2E node and curl-test it via `--resolve` to bypass DNS:
   ```bash
   curl -I --resolve ui.tekivex.com:443:<E2E_IP> https://ui.tekivex.com/
   ```
3. Flip the A record from Render's IP to the E2E node's IP.
4. Watch logs (`journalctl -u nginx -f`) and synthetics for ~24 h.
5. Raise TTL back to e.g. 3600.

### Phase 7 — Decommission Render

Only after 24–48 h of healthy traffic on E2E:

1. Suspend the Render service (don't delete yet — easy rollback).
2. After 1–2 weeks, delete it and remove `render.yaml` from the repo in a
   dedicated PR.

---

## 5. Rollback plan

DNS-level rollback is the safest: flip the A record back to Render's IP.
Keep the Render service suspended-but-existing for at least two weeks so
this is a one-minute action. Because TTL was lowered in Phase 6, propagation
is fast.

---

## 6. Cost sketch (order-of-magnitude, verify on E2E pricing page)

- CPU node C2.2-class: ~₹1,000–1,500 / month.
- Bandwidth: included up to a quota; static site traffic is small.
- TLS certs: free (Let's Encrypt).
- Object Storage + CDN alternative: cheaper at low traffic but adds
  configuration surface (see §3).

---

## 7. Open questions to resolve before executing

1. Region preference (Delhi NCR vs Mumbai vs Chennai)?
2. Keep PR previews? If yes, which of the three options in Phase 5?
3. Who owns the SSH key custody and the E2E account billing?
4. Move DNS zone to E2E, or leave with current provider?
5. Any compliance constraints on data residency that force a specific region?

---

## 8. Out of scope for this document

- **Avatar / GPU workload on E2E TIR.** Will be planned separately once
  the Avatar stack (model, framework, expected QPS, latency budget) is
  defined. TIR offers: managed inference endpoints, Jupyter notebooks,
  and bare GPU nodes (A100 / H100 / L4 / L40S / A40). The choice depends
  on whether Avatar is a stable HTTP-served model (→ endpoint) or a
  custom pipeline like SadTalker / Wav2Lip / a video diffusion model
  (→ dedicated GPU node).
- Monitoring / alerting stack on the new node (UptimeRobot, Grafana
  Cloud, etc.).
- Log shipping off the node.

These can each be follow-up tickets once the basic migration is live.
