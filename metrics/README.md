# Metrics

Automated weekly snapshots of tekivex-ui adoption, trust, and revenue signals. Scorecard framework: [`roadmap/10-metrics-dashboard.md`](../roadmap/10-metrics-dashboard.md).

## Files

- `latest.json` — most recent snapshot (overwrites each run)
- `snapshots/YYYY-MM-DD.json` — historical record, committed weekly
- `quarterly/YYYY-QN.md` — human-written retrospective, one per quarter

## How it runs

- **Automated:** `.github/workflows/metrics.yml` runs every Monday at 12:00 UTC, commits the snapshot to this folder
- **Manual:** `node scripts/collect-metrics.mjs` — local run, writes the same files

## Schema

```json
{
  "collectedAt": "2026-04-22T12:00:00Z",
  "date": "2026-04-22",
  "npm": {
    "tekivex-ui": { "weekly": 0, "monthly": 0 },
    ...
  },
  "github": {
    "stars": 0, "forks": 0, "watchers": 0,
    "openIssues": 0, "closedIssues": 0,
    "openPRs": 0, "closedPRs": 0
  }
}
```

`null` values mean the endpoint failed or the package isn't published yet. The collector never throws — missing is data.

## Reading the numbers

See `roadmap/10-metrics-dashboard.md` for:
- Three-axis scorecard (adoption / trust / revenue)
- Red-flag thresholds
- Quarterly decision framework
- "What we're NOT measuring" — and why

## Quarterly review process

First week of each new quarter:
1. Pull the last 13 snapshots, compute trend per metric
2. Fill out `metrics/quarterly/YYYY-QN.md` from the template
3. Pick one decision per axis (invest / fix / pivot / sunset)
4. Commit and publish as a state-of-the-project post
