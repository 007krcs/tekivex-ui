# Show HN — ready-to-paste

**Title** (max 80 chars):
```
Show HN: TekiVex UI – React component library with 360°/AR/VR documentation
```

**Submitted URL**:
```
https://www.tekivex.com/ui/
```

**Best time to submit**: 9 PM IST (= 7:30 AM Pacific, 10:30 AM Eastern). Hacker News traffic peaks around US morning. Avoid Saturdays.

**First comment** (post immediately after submitting — drives engagement):

```
Hey HN — I shipped a React UI library where the documentation site itself is
a WebXR experience. Click "🌐 Enter 360° mode" on the homepage and you're in
a panoramic environment with floating hotspots that work on Quest 3, Vision
Pro, and ARCore phones.

Behind it: 13 npm packages, all unscoped, all under tekivex-*:

  tekivex-ui              99 components, WCAG 2.1 AAA, zero runtime deps
  tekivex-3d              Real WebGL 3D + 360° + AR/VR (vanilla three.js,
                          no React-Three-Fiber)
  tekivex-pdf             React → PDF without Puppeteer (~50ms cold start,
                          fits Vercel serverless)
  tekivex-templates       7 PDF templates (Biodata / Invoice / Certificate /
                          Resume / Ticket / BoardingPass / Receipt)
  tekivex-form            Form-only slim install (24 inputs)
  tekivex-india           Aadhaar Verhoeff, PAN, Voter ID, INR lakh/crore,
                          Tithi/Nakshatra calendar, India Post PIN lookup
  tekivex-security-core   XSS, CSP, Trojan Source, clickjacking, PII redaction,
                          rate-limit
  tekivex-audit           Static-analysis CLI for OWASP/CWE/WCAG checks
  tekivex-add             shadcn-style component copier
  create-tekivex-app      Project scaffolder
  + 3 more

Things that I think are different from MUI/Chakra/Mantine/Ant/shadcn:

1. WCAG 2.1 AAA across all 99 components, not AA. 7:1 contrast, 44×44 touch
   targets, screen-reader matrix tested across NVDA / JAWS / VoiceOver iOS /
   TalkBack Android.

2. Built-in security kernel. Every prop sanitised at the boundary. Published
   threat model. The supply-chain attacks of 2025 made this a board concern;
   we made it a non-issue.

3. PDF as a first-class output. Same React tree drives browser AND downloaded
   PDF. No template drift between preview and download.

4. India-first features. The Aadhaar Verhoeff checksum is in 13 lines of pure
   TS. Currency formatting auto-routes between en-IN (1,23,456) and en-US
   (123,456) via Intl.NumberFormat.

5. Zero runtime dependencies in the core. `npm install tekivex-ui` adds
   exactly one folder to your node_modules.

What I'd love feedback on:
- The 360° mode — is it actually useful or just gimmicky?
- The Puppeteer-replacement story (tekivex-pdf) — does the API feel right?
- Anything you'd build with this? Anything that breaks?

Source: https://www.npmjs.com/package/tekivex-ui
Issues: https://github.com/007krcs/tekivex-ui/issues

MIT licensed. Built solo over 12 months. Ask me anything.
```

## Notes

- HN dislikes self-promotion that smells like marketing. The phrase "feedback on" + asking specific questions usually softens this.
- Don't reply to your own first comment. Wait for actual replies before chiming in.
- Reply to **every** comment in the first 4 hours — comment activity drives ranking on HN as much as upvotes.
- If a moderator emails about `[hn]` flagging or the title format, respond immediately and politely.

## Pre-submission checklist

- [ ] Verify https://www.tekivex.com/ui/ loads from a non-corporate network
- [ ] Click 🌐 Enter 360° mode and confirm at least 3 hotspots open panels
- [ ] Verify https://www.npmjs.com/package/tekivex-ui shows v3.2.0 (after Kanban release)
- [ ] Have your "first comment" pre-written in a tab so you can paste within 60 seconds of submission
- [ ] Set a 4-hour timer so you remember to reply to comments in the critical window
