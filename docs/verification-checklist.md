# Tier 1 verification — run from a personal device

You need to do these because I can't open browsers from the assistant. Each
takes 5 min or less.

## A. Confirm the live site shows what we shipped

Open https://www.tekivex.com/ui/ from a **non-corporate device** (phone hotspot
works if your ISP also blocks).

Hard-refresh (Ctrl+Shift+R or Cmd+Shift+R). You should see:

- [ ] Sticky nav with `🌐 360° mode` pill
- [ ] Hero with shimmering "🌐 Enter 360° mode →" CTA
- [ ] Hero shows 3 floating 3D cards (teal, purple, blue), tilting on cursor
- [ ] **Click the 🌐 CTA** — full-screen 360° experience opens
- [ ] At least 3 hotspots visible in the sphere (drag to look around)
- [ ] Click any hotspot → modal with content opens
- [ ] ESC closes the modal; second ESC closes the immersive view
- [ ] Scroll the regular site — you see Stats, Features, Playground,
      360° tour, **All 102 components grid**, **Roadmap section**,
      Code Showcase, 13-package list, Footer
- [ ] Footer "Report an issue" links to
      https://github.com/007krcs/tekivex-ui/issues
- [ ] No `github.com/007krcs` link visible anywhere on the page

If any of these fail, paste the build log in the next message and we'll
narrow down.

## B. Confirm npm packages reflect latest

Run from any terminal:

```bash
for p in tekivex-ui tekivex-3d tekivex-pdf tekivex-templates tekivex-form \
         tekivex-india tekivex-finance tekivex-content tekivex-security-core \
         tekivex-audit create-tekivex-app tekivex-add tekivex-figma-kit; do
  printf "%-26s %s\n" "$p" "$(npm view $p version 2>/dev/null)"
done
```

Expected output:

```
tekivex-ui                 3.2.0   ← (or 3.1.0 if Kanban hasn't shipped yet)
tekivex-3d                 0.1.0
tekivex-pdf                0.1.2
tekivex-templates          0.1.2
tekivex-form               0.1.1
tekivex-india              0.1.2
tekivex-finance            0.1.2
tekivex-content            0.1.2
tekivex-security-core      0.1.2
tekivex-audit              0.1.2
create-tekivex-app         0.1.2
tekivex-add                0.1.1
tekivex-figma-kit          0.1.0
```

If any show `npm error 404`, paste it back.

## C. Confirm the npm pages have correct metadata

Visit each at `https://www.npmjs.com/package/<name>`. For each, the right
sidebar should show:

- [ ] **Repository**: `github.com/007krcs/tekivex-ui`
- [ ] **Homepage**: `www.tekivex.com/ui`
- [ ] **Bug reports**: `github.com/007krcs/tekivex-ui/issues`

NOT `github.com/007krcs/tekivex-ui` anywhere. If you see the source repo
exposed on any package page, it's because of CDN cache — wait 30 minutes
and re-check.

## D. Submit URL categorization (15 min, one-time)

These unblock different chunks of corporate proxies. Open each from a
personal browser, paste:

| Vendor | URL | Suggested category |
|---|---|---|
| Bluecoat / Symantec | https://sitereview.bluecoat.com/ | Computers/Internet |
| Forcepoint | https://csi.forcepoint.com/ | Information Technology |
| Palo Alto Networks | https://urlfiltering.paloaltonetworks.com/ | computer-and-internet-info |
| Fortinet | https://www.fortiguard.com/webfilter | Information Technology |
| Cloudflare Radar | https://radar.cloudflare.com/domains/feedback | Information Technology |

Domain to submit: `www.tekivex.com/ui`

Description (paste in any "additional info" field):

```
www.tekivex.com/ui is the official documentation site for tekivex-ui, an
open-source MIT-licensed React component library on npm. The site is hosted
on Render with Let's Encrypt SSL. No user-generated content, no auth flows,
no downloads beyond standard JS/CSS bundle assets. Currently uncategorized
because the domain is <3 months old.

npm: https://www.npmjs.com/package/tekivex-ui
```

Already filed:
- [x] Cisco Talos (PENDING — auto-resolves in 3-5 business days)

## E. (If you're at Citi) Submit your internal exception

Open: Citi Connectivity Self Service portal (link is on the block page you
screenshotted earlier).

Fields to fill:

```
URL:           https://www.tekivex.com/ui/
Justification: Documentation site for tekivex-ui, an open-source React
               UI library used by our development team. MIT-licensed,
               hosted on Render with Let's Encrypt cert. No
               user-generated content, no authentication, no downloads
               beyond standard JS/CSS bundle assets. Currently uncategorized
               in Zscaler's database because the domain is <3 months old.
Category:      Information Technology / Computers and Internet
Risk:          Low. Static site. Source code is public.
```

This is the **only** path that unblocks your Citi laptop specifically.

## F. (Optional) Setup analytics

If you want to know whether the site is getting traffic:

- [ ] Render dashboard → `tekivex-ui` service → Metrics tab
      Render shows request counts + bandwidth without any setup
- [ ] Or add Plausible Analytics (privacy-friendly, free under 10k pageviews):
      Add a single `<script>` tag to `landing/index.html`
- [ ] Or skip analytics entirely — npm download counts are the real metric

## When you're done

Tell me which of A–E completed and I'll proceed with the next batch
(TkxRichEditor, TkxModel3D, more bundles).
