#!/usr/bin/env node
/**
 * verify-security-artifacts.mjs — pre-deploy guard.
 *
 * Walks the merged static output (docs-site/dist by default) and confirms
 * that every security artifact we publicly advertise is actually present on
 * disk and well-formed. Exits non-zero if anything is missing or malformed.
 *
 * Run as the last step of build-unified-site.mjs so a broken deploy never
 * leaves the building. Also runnable standalone via `npm run verify:security-artifacts`.
 *
 * Each check is the answer to a specific question a procurement auditor will
 * ask: "if I curl https://www.tekivex.com/ui/.well-known/security.txt, do I get
 * the file? If I curl /security/sbom.json, is it valid JSON?"
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = process.env.TEKIVEX_DIST ?? resolve(ROOT, 'docs-site/dist');

let failed = 0;
const log = (icon, msg) => console.log(`  ${icon} ${msg}`);

console.log(`\nverifying security artifacts in ${DIST}\n`);

if (!existsSync(DIST)) {
  console.error(`✗ dist directory missing: ${DIST}`);
  console.error('  (Run the build first — node scripts/build-unified-site.mjs)');
  process.exit(1);
}

// ── Check 1: /.well-known/security.txt exists and is well-formed ─────────────
const securityTxt = resolve(DIST, '.well-known/security.txt');
if (!existsSync(securityTxt)) {
  log('✗', 'MISSING: /.well-known/security.txt');
  log(' ', `  expected at ${securityTxt}`);
  log(' ', '  consumers visiting www.tekivex.com/ui/.well-known/security.txt get 404');
  failed++;
} else {
  const txt = readFileSync(securityTxt, 'utf8');
  const requiredFields = ['Contact:', 'Expires:', 'Canonical:'];
  const missing = requiredFields.filter((f) => !txt.includes(f));
  if (missing.length > 0) {
    log('✗', `security.txt missing required fields: ${missing.join(', ')}`);
    failed++;
  } else {
    // Check Expires is in the future
    const expiresMatch = txt.match(/^Expires:\s*(.+)$/m);
    if (expiresMatch) {
      const expires = new Date(expiresMatch[1]);
      const now = new Date();
      if (Number.isNaN(expires.getTime())) {
        log('✗', `security.txt Expires is not a valid ISO-8601 date: ${expiresMatch[1]}`);
        failed++;
      } else if (expires < now) {
        log('✗', `security.txt has expired (${expiresMatch[1]} < now). Regenerate before deploy.`);
        failed++;
      } else {
        const daysLeft = Math.floor((expires - now) / (1000 * 60 * 60 * 24));
        log('✓', `security.txt valid, ${daysLeft} days until expiry`);
      }
    }
    // Check that no Encryption/Acknowledgments line points to an unverifiable URL
    // (we removed these intentionally — flag if someone re-adds them without a real file).
    if (/^Encryption:\s*https?:\/\//m.test(txt)) {
      const encMatch = txt.match(/^Encryption:\s*(.+)$/m);
      log('⚠', `security.txt declares Encryption: ${encMatch[1]}`);
      log(' ', '  Verify that URL resolves before deploying — otherwise drop the line.');
    }
    if (/^Acknowledgments:\s*https?:\/\//m.test(txt)) {
      const ackMatch = txt.match(/^Acknowledgments:\s*(.+)$/m);
      log('⚠', `security.txt declares Acknowledgments: ${ackMatch[1]}`);
      log(' ', '  Verify that URL resolves before deploying — otherwise drop the line.');
    }
  }
}

// ── Check 2: /security/sbom.json exists and is valid CycloneDX ───────────────
const sbomJson = resolve(DIST, 'security/sbom.json');
if (!existsSync(sbomJson)) {
  log('✗', 'MISSING: /security/sbom.json');
  log(' ', `  expected at ${sbomJson}`);
  log(' ', '  SECURITY.md links to www.tekivex.com/ui/security/sbom.json — would 404');
  failed++;
} else {
  try {
    const sbom = JSON.parse(readFileSync(sbomJson, 'utf8'));
    if (sbom.bomFormat !== 'CycloneDX') {
      log('✗', `sbom.json bomFormat is "${sbom.bomFormat}", expected "CycloneDX"`);
      failed++;
    } else if (!sbom.specVersion?.startsWith('1.')) {
      log('✗', `sbom.json specVersion "${sbom.specVersion}" is not a CycloneDX 1.x spec`);
      failed++;
    } else if (!sbom.metadata?.component?.version) {
      log('✗', 'sbom.json missing metadata.component.version');
      failed++;
    } else {
      // Sanity-check the version matches package.json (drift is a real risk)
      const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
      if (sbom.metadata.component.version !== pkg.version) {
        log('✗', `sbom.json version (${sbom.metadata.component.version}) does not match package.json (${pkg.version})`);
        log(' ', '  Run `npm run sbom:generate` and re-commit.');
        failed++;
      } else {
        const compCount = Array.isArray(sbom.components) ? sbom.components.length : 0;
        log('✓', `sbom.json valid CycloneDX ${sbom.specVersion} — v${sbom.metadata.component.version}, ${compCount} components`);
      }
    }
  } catch (err) {
    log('✗', `sbom.json is not valid JSON: ${err instanceof Error ? err.message : err}`);
    failed++;
  }
}

// ── Check 3: SECURITY.md is included in the build OR linked from the deploy ──
// SECURITY.md lives at the repo root, not in the dist. We don't ship it; we
// link to it on GitHub. So instead, verify our security.txt's Policy URL
// points at a real path in the repo.
const securityMd = resolve(ROOT, 'SECURITY.md');
if (!existsSync(securityMd)) {
  log('✗', 'SECURITY.md missing at repo root — security.txt Policy: link would 404');
  failed++;
} else {
  const size = statSync(securityMd).size;
  if (size < 200) {
    log('⚠', `SECURITY.md is suspiciously small (${size} bytes). Stub file?`);
  } else {
    log('✓', `SECURITY.md present (${size} bytes)`);
  }
}

// ── Check 4: humans.txt / robots.txt presence (lightweight social signals) ───
// Not required, but a procurement scanner that doesn't find these reads the
// site as low-maturity. Warn, don't fail.
const robotsTxt = resolve(DIST, 'robots.txt');
if (!existsSync(robotsTxt)) {
  log('⚠', 'no robots.txt in dist — search engines + procurement scanners read absence as low maturity');
} else {
  log('✓', 'robots.txt present');
}

console.log('');
if (failed > 0) {
  console.error(`✗ ${failed} security-artifact check(s) failed. Aborting deploy.\n`);
  console.error('Run `node scripts/build-unified-site.mjs` to rebuild, or fix the artifacts manually.');
  console.error('If you need to skip this check (NOT recommended), set TEKIVEX_SKIP_SEC_VERIFY=1.\n');
  if (process.env.TEKIVEX_SKIP_SEC_VERIFY === '1') {
    console.warn('TEKIVEX_SKIP_SEC_VERIFY=1 set — proceeding despite failures.\n');
    process.exit(0);
  }
  process.exit(1);
}

console.log('✓ all security artifacts verified — safe to deploy.\n');
