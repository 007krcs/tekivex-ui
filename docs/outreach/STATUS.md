# Outreach status — live tracker

Update after every send. Update after every reply. This is the single source
of truth — no separate spreadsheet, no parallel tracking.

Last reviewed: _set to today's date when you next touch this file_

## Audit-firm pipeline (target: 1 signed SOW within 30 days)

| # | Firm | Sent | Quote received | SOW signed | Notes |
|---|---|---|---|---|---|
| 1 | Deque Systems | ☐ | ☐ | ☐ | Web form at deque.com/contact |
| 2 | TPGi (Vispero) | ☐ | ☐ | ☐ | Web form at tpgi.com/contact |
| 3 | WebAIM | ☐ | ☐ | ☐ | Direct: audit@webaim.org |
| 4 | _Backup: Level Access_ | ☐ | ☐ | ☐ | Send only if 3 above all decline |
| 5 | _Backup: Accessible360_ | ☐ | ☐ | ☐ | Send only if budget < $5k |

**Decision criteria when quotes arrive:**
- Quote ≤ $10k → take it, sign within a week
- Quote $10-20k → push back once with the phased-scope ask, then accept if they hold
- Quote > $20k → request phased breakdown, otherwise pass

## Design-partner pipeline (target: 3 signed before public launch, 5 in 90 days)

| # | Company | Vertical | Contact | Sent | Replied | Call done | Signed | Logo+quote live |
|---|---|---|---|---|---|---|---|---|
| 1 | _add target_ | healthtech | _name@company_ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | _add target_ | healthtech | _name@company_ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | _add target_ | fintech | _name@company_ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | _add target_ | fintech | _name@company_ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | _add target_ | gov | _name@company_ | ☐ | ☐ | ☐ | ☐ | ☐ |

Once a partner signs:
```
npm run partner:add -- --name "Acme Health" --vertical healthtech \
  --logo /partners/acme.svg --quote "..." --author "..." --role "..."
```
(The script enforces that `docs/design-partners/<slug>.eml` exists as quote
permission proof — see `docs/design-partners/README.md`.)

## Cadence rules

- **Day 0:** Send. Set calendar reminder for Day 5.
- **Day 5:** If no reply, send ONE polite follow-up. Set Day 10 reminder.
- **Day 10:** If still no reply, drop the lead. Note "no response" in this table.
- **Reply received:** Reply within 24 hours always. Slow replies kill warm leads.

## Things that mean DROP a lead

- They reply "we build in-house, no thanks" — thank them, archive
- They reply "we use [other library], we're locked in" — thank them, archive
- They reply with a generic "interesting, we'll get back to you" and then nothing for 2 weeks — archive
- Their decision-maker just got fired / company just had layoffs — wait 90 days, retry

## Things that mean PUSH HARDER

- They open the email 3+ times (use a tracking pixel if you're set up for it)
- They forward to a colleague (you'll see CC traffic)
- They reply with a specific technical question (means they're evaluating seriously)
- They ask for a call (always say yes within 24h)

## Once a partner signs

1. Drop their `.svg` logo into `landing/public/partners/<slug>.svg`
2. Save the quote-approval email at `docs/design-partners/<slug>.eml`
3. Run `npm run partner:add -- ...`
4. Commit + push + redeploy landing
5. Add their entry to this status table with "Logo+quote live: ☑"
6. Schedule the case-study writeup for week 4
