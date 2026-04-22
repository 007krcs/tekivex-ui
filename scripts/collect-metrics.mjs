#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Collect weekly metrics for tekivex-ui and write a dated snapshot.
//
//   node scripts/collect-metrics.mjs
//
// Output:
//   metrics/latest.json            — always-current snapshot
//   metrics/snapshots/YYYY-MM-DD.json — historical
//
// Metrics pulled (no auth required):
//   - npm weekly downloads for @tekivex/ui, @tekivex/security-core,
//     @tekivex/audit, create-tekivex-app
//   - npm dependent count (via registry `dependents` endpoint)
//   - GitHub stars, forks, open issues, open PRs for 007krcs/tekivex-ui
//
// Optional with GITHUB_TOKEN in env: adds closed-issue median time,
// contributor count, PR merge time.
// ─────────────────────────────────────────────────────────────────────────────

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const METRICS_DIR = join(ROOT, 'metrics');
const SNAPSHOTS_DIR = join(METRICS_DIR, 'snapshots');

const NPM_PACKAGES = [
  '@tekivex/ui',
  '@tekivex/security-core',
  '@tekivex/audit',
  'create-tekivex-app',
];
const GH_REPO = '007krcs/tekivex-ui';

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers: { 'user-agent': 'tekivex-metrics', ...headers } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

async function npmWeekly(pkg) {
  try {
    const data = await fetchJson(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`);
    return data.downloads ?? 0;
  } catch {
    return null; // package not published yet
  }
}

async function npmMonthly(pkg) {
  try {
    const data = await fetchJson(`https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(pkg)}`);
    return data.downloads ?? 0;
  } catch {
    return null;
  }
}

async function githubRepo(token) {
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  try {
    return await fetchJson(`https://api.github.com/repos/${GH_REPO}`, headers);
  } catch (err) {
    return { error: err.message };
  }
}

async function githubIssues(token, state = 'open') {
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  try {
    const data = await fetchJson(
      `https://api.github.com/search/issues?q=repo:${GH_REPO}+is:issue+state:${state}&per_page=1`,
      headers,
    );
    return data.total_count ?? 0;
  } catch {
    return null;
  }
}

async function githubPRs(token, state = 'open') {
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  try {
    const data = await fetchJson(
      `https://api.github.com/search/issues?q=repo:${GH_REPO}+is:pr+state:${state}&per_page=1`,
      headers,
    );
    return data.total_count ?? 0;
  } catch {
    return null;
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  const token = process.env.GITHUB_TOKEN || null;
  const snapshot = {
    collectedAt: new Date().toISOString(),
    date: todayISO(),
    npm: {},
    github: {},
  };

  console.log('→ npm weekly/monthly downloads');
  for (const pkg of NPM_PACKAGES) {
    const [w, m] = await Promise.all([npmWeekly(pkg), npmMonthly(pkg)]);
    snapshot.npm[pkg] = { weekly: w, monthly: m };
    console.log(`  ${pkg.padEnd(28)} w=${w ?? '—'}\tm=${m ?? '—'}`);
  }

  console.log('→ github repo metrics');
  const repo = await githubRepo(token);
  snapshot.github.stars = repo.stargazers_count ?? null;
  snapshot.github.forks = repo.forks_count ?? null;
  snapshot.github.watchers = repo.subscribers_count ?? null;
  snapshot.github.openIssues = await githubIssues(token, 'open');
  snapshot.github.closedIssues = await githubIssues(token, 'closed');
  snapshot.github.openPRs = await githubPRs(token, 'open');
  snapshot.github.closedPRs = await githubPRs(token, 'closed');
  console.log(
    `  stars=${snapshot.github.stars} forks=${snapshot.github.forks} ` +
      `issues open/closed=${snapshot.github.openIssues}/${snapshot.github.closedIssues} ` +
      `PRs open/closed=${snapshot.github.openPRs}/${snapshot.github.closedPRs}`,
  );

  await mkdir(SNAPSHOTS_DIR, { recursive: true });
  const snapFile = join(SNAPSHOTS_DIR, `${snapshot.date}.json`);
  const latestFile = join(METRICS_DIR, 'latest.json');
  const payload = JSON.stringify(snapshot, null, 2);
  await writeFile(snapFile, payload);
  await writeFile(latestFile, payload);

  console.log(`\n✓ Snapshot written: ${snapFile}`);
  console.log(`✓ Latest updated:   ${latestFile}`);
}

main().catch((err) => {
  console.error('✗', err?.message || err);
  process.exit(1);
});
