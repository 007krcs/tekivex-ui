# LinkedIn launch checklist

Post Version 1 (the recommended one from the earlier draft). Below is the
sequence to maximize reach.

## T-zero (when you post)

- [ ] **Time the post** for 9:00 AM IST on a Tuesday or Wednesday. These
      are the highest-engagement windows for India tech audiences and
      catch the US/EU evening crowd.
- [ ] **Pin** to your profile for 7 days
- [ ] **First comment within 60 seconds** — drop a deeper-context follow-up:

```
A few details I couldn't fit in the post:

🛠 The Aadhaar Verhoeff checksum is in 13 lines of pure TypeScript.
🛠 The PDF rendering uses @react-pdf/renderer under the hood — same
   React tree as your browser components.
🛠 The 360° mode at www.tekivex.com/ui is built entirely with the
   library's own components — TkxScene + TkxPanorama360 + TkxHotspot
   + TkxXRSession. The docs site is a WebXR experience.

What would you build with this? I'd love to see the first invoice
generated with tekivex-pdf, the first KYC form built with tekivex-india,
or just brutal feedback on the API.
```

## T+0–4h (the critical window)

- [ ] Reply to **every** comment with a substantive answer (not "thanks!")
- [ ] If anyone asks for a feature, link to the public issue tracker:
      https://github.com/007krcs/tekivex-ui/issues/new
- [ ] DM 5–10 people in your network who'd care (specific tech leads,
      not blast)

## T+4h–24h

- [ ] Engagement-pod check-in — DM 3 friends who post regularly with
      your link, ask for a thoughtful reply (not "🔥") on the post
- [ ] Cross-post to:
  - Twitter/X (5–7 tweet thread)
  - dev.to article (drafted earlier)
  - Show HN (drafted earlier)
- [ ] Reply to comments at 12h, 18h, 24h — algorithm prioritizes posts
      with sustained engagement

## T+1 week

- [ ] **Repost with a new angle.** "By the way, here's the threat model:"
      with a link to docs/SECURITY-THREAT-MODEL.md. Different hook,
      same library.
- [ ] **Carousel post** — slide 1 hero, slide 2 features, slide 3
      install, slide 4 link. Carousels get 3× engagement on LinkedIn.

## Tagging strategy (pick 2-3, not all)

People who tend to share React content in India:
- Akshay Saini
- Tapas Adhikary
- Saurabh Daware
- Hitesh Choudhary
- Piyush Garg

People who tend to share accessibility content:
- Eric Bailey
- Marcy Sutton
- Sara Soueidan

Companies who might engage:
- Razorpay (they care about Indian-market dev tools)
- Postman (Bangalore engineering team is large)
- Hasura
- Zerodha
- Cred

**Don't tag everyone.** Pick 2-3 that genuinely fit and leave a substantive
comment on their recent post first to warm the introduction.

## What NOT to do

- ❌ "Check out my new library 🔥🚀✨" emoji-heavy posts get suppressed
      by LinkedIn's spam classifier
- ❌ Don't ask for "likes and shares" — algorithm penalty
- ❌ Don't post the same content 3 days in a row — algorithm penalty
- ❌ Don't tag 10+ people — looks like spam, gets reported
- ❌ Don't use auto-translate features that turn your English post into
      bad Hindi/Bengali/etc. — sounds fake even when well-meaning

## Pre-post checklist (run THIS first)

- [ ] www.tekivex.com/ui loads from a personal device
- [ ] 🌐 Enter 360° mode button works
- [ ] At least 3 hotspots open panels
- [ ] tekivex-ui@3.2.0 visible on https://www.npmjs.com/package/tekivex-ui
- [ ] tekivex-3d@0.2.0 (or whatever's current) visible
- [ ] All 13 packages reachable on npm
- [ ] First comment text copied to clipboard so it's ready
