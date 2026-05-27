#!/usr/bin/env node
/**
 * generate-sbom.mjs
 *
 * Generates a CycloneDX 1.5 JSON SBOM for tekivex-ui.
 *
 * Strategy:
 *   1. Try @cyclonedx/cyclonedx-npm via npx (authoritative).
 *   2. Fall back to a hand-crafted minimal SBOM derived from package.json.
 *
 * The hand-crafted path is the source of truth for tekivex-ui's
 * "zero runtime dependencies" claim: the components[] array only
 * lists peerDependencies (react, react-dom, recharts, three) — there
 * are no transitive runtime deps to enumerate.
 *
 * Output: landing/public/security/sbom.json
 */

import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const pkgPath = resolve(repoRoot, "package.json");
const outPath = resolve(repoRoot, "landing/public/security/sbom.json");

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

function ensureOutDir() {
  const dir = dirname(outPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function tryCycloneDxNpm() {
  try {
    execSync(
      `npx -y @cyclonedx/cyclonedx-npm --output-format JSON --output-file "${outPath}" --spec-version 1.5`,
      { cwd: repoRoot, stdio: "inherit" },
    );
    return existsSync(outPath);
  } catch (err) {
    console.warn(
      "[generate-sbom] @cyclonedx/cyclonedx-npm unavailable, falling back to hand-crafted SBOM.",
    );
    return false;
  }
}

function buildHandCraftedSbom() {
  const peers = pkg.peerDependencies || {};
  const peerMeta = pkg.peerDependenciesMeta || {};

  const components = Object.entries(peers).map(([name, range]) => {
    const optional = Boolean(peerMeta[name]?.optional);
    return {
      type: "library",
      "bom-ref": `pkg:npm/${name}`,
      name,
      version: range,
      scope: optional ? "optional" : "required",
      purl: `pkg:npm/${name}@${encodeURIComponent(range)}`,
      description: optional
        ? `Optional peer dependency — host-provided when used.`
        : `Peer dependency (host-provided).`,
    };
  });

  return {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    serialNumber: `urn:uuid:${randomUUID()}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [
        {
          vendor: "TekiVex",
          name: "scripts/generate-sbom.mjs",
          version: "1.0.0",
        },
      ],
      component: {
        type: "library",
        "bom-ref": `pkg:npm/${pkg.name}@${pkg.version}`,
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        licenses: [{ license: { id: pkg.license || "MIT" } }],
        purl: `pkg:npm/${pkg.name}@${pkg.version}`,
        externalReferences: [
          pkg.homepage && { type: "website", url: pkg.homepage },
          pkg.repository?.url && { type: "vcs", url: pkg.repository.url },
          pkg.bugs?.url && { type: "issue-tracker", url: pkg.bugs.url },
        ].filter(Boolean),
      },
    },
    components,
  };
}

function writeHandCrafted() {
  const sbom = buildHandCraftedSbom();
  ensureOutDir();
  writeFileSync(outPath, JSON.stringify(sbom, null, 2) + "\n", "utf8");
  return sbom;
}

ensureOutDir();
const usedTool = tryCycloneDxNpm();
let componentCount;
if (usedTool) {
  try {
    const written = JSON.parse(readFileSync(outPath, "utf8"));
    componentCount = Array.isArray(written.components)
      ? written.components.length
      : 0;
  } catch {
    componentCount = 0;
  }
} else {
  const sbom = writeHandCrafted();
  componentCount = sbom.components.length;
}

console.log(
  `✓ SBOM written to landing/public/security/sbom.json (v${pkg.version}, ${componentCount} components)`,
);
