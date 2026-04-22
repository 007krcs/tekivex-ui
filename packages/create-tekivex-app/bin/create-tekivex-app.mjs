#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// create-tekivex-app
// Scaffolds a secure React + Vite + tekivex-ui app.
// Usage:   npx create-tekivex-app my-app [--template basic|secure|dashboard]
// ─────────────────────────────────────────────────────────────────────────────

import { mkdir, readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_ROOT = resolve(__dirname, '..', 'template');

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function banner() {
  console.log(`
${C.cyan}${C.bold}⚛ tekivex-ui${C.reset} ${C.dim}—${C.reset} ${C.magenta}create-tekivex-app${C.reset}
${C.dim}Production-grade React + Vite + SecurityCore starter${C.reset}
`);
}

function parseArgs(argv) {
  const out = { name: null, template: 'basic', install: true, git: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--template' || a === '-t') out.template = argv[++i];
    else if (a === '--no-install') out.install = false;
    else if (a === '--no-git') out.git = false;
    else if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
    else if (!a.startsWith('-')) out.name = a;
  }
  return out;
}

function printHelp() {
  console.log(`Usage: npx create-tekivex-app <app-name> [options]

Options:
  --template, -t   Template to scaffold (basic|secure|dashboard). Default: basic
  --no-install     Skip npm install
  --no-git         Skip git init
  --help, -h       Show this message

Templates:
  basic       Minimal React + tekivex-ui + ThemeProvider
  secure      basic + SecurityCore pre-wired + CSP header + Trusted Types
`);
}

async function prompt(question, fallback) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ans = (await rl.question(`${question}${fallback ? ` ${C.dim}(${fallback})${C.reset}` : ''} `)).trim();
  rl.close();
  return ans || fallback || '';
}

async function copyDir(src, dest, substitutions) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const sp = join(src, entry.name);
    const dp = join(dest, entry.name.replace(/^_/, '.')); // _gitignore → .gitignore
    if (entry.isDirectory()) {
      await copyDir(sp, dp, substitutions);
    } else {
      let content = await readFile(sp, 'utf8');
      for (const [k, v] of Object.entries(substitutions)) {
        content = content.replaceAll(`{{${k}}}`, v);
      }
      await writeFile(dp, content);
    }
  }
}

async function main() {
  banner();
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  const appName = args.name || (await prompt('App name?', 'my-tekivex-app'));
  if (!/^[a-z0-9][a-z0-9-_]*$/.test(appName)) {
    console.error(`${C.red}✗ Invalid app name. Use lowercase alphanumerics, dashes or underscores.${C.reset}`);
    process.exit(1);
  }

  const validTemplates = ['basic', 'secure'];
  if (!validTemplates.includes(args.template)) {
    console.error(`${C.red}✗ Unknown template: ${args.template}. Use one of: ${validTemplates.join(', ')}${C.reset}`);
    process.exit(1);
  }

  const targetDir = resolve(process.cwd(), appName);
  if (existsSync(targetDir)) {
    const files = await readdir(targetDir);
    if (files.length > 0) {
      console.error(`${C.red}✗ Directory ${C.bold}${appName}${C.reset}${C.red} already exists and is not empty.${C.reset}`);
      process.exit(1);
    }
  }

  const templateDir = join(TEMPLATE_ROOT, args.template);
  if (!existsSync(templateDir)) {
    console.error(`${C.red}✗ Template not found at ${templateDir}${C.reset}`);
    console.error(`${C.dim}  (If you're running from source, ensure packages/create-tekivex-app/template/${args.template} exists.)${C.reset}`);
    process.exit(1);
  }

  console.log(`${C.green}✓${C.reset} Scaffolding ${C.bold}${appName}${C.reset} with template ${C.cyan}${args.template}${C.reset}`);

  await copyDir(templateDir, targetDir, {
    APP_NAME: appName,
    YEAR: String(new Date().getFullYear()),
  });

  console.log(`${C.green}✓${C.reset} Files written to ${C.dim}${targetDir}${C.reset}`);

  // Dependency install
  if (args.install) {
    console.log(`${C.yellow}→${C.reset} Running ${C.bold}npm install${C.reset}...`);
    const { spawnSync } = await import('node:child_process');
    const res = spawnSync('npm', ['install'], { cwd: targetDir, stdio: 'inherit', shell: true });
    if (res.status !== 0) {
      console.error(`${C.red}✗ npm install failed. You can run it manually:${C.reset}\n  cd ${appName} && npm install`);
    } else {
      console.log(`${C.green}✓${C.reset} Dependencies installed`);
    }
  }

  // Git init
  if (args.git) {
    const { spawnSync } = await import('node:child_process');
    spawnSync('git', ['init', '-q'], { cwd: targetDir, shell: true });
    spawnSync('git', ['add', '-A'], { cwd: targetDir, shell: true });
    spawnSync('git', ['commit', '-q', '-m', 'chore: initial commit from create-tekivex-app'], { cwd: targetDir, shell: true });
    console.log(`${C.green}✓${C.reset} Git repo initialized`);
  }

  console.log(`
${C.bold}${C.green}🎉 Done!${C.reset}

Next steps:
  ${C.cyan}cd ${appName}${C.reset}
  ${C.cyan}npm run dev${C.reset}

Docs:       ${C.dim}https://ui.tekivex.com${C.reset}
Security:   ${C.dim}https://ui.tekivex.com/#/security${C.reset}
Report bug: ${C.dim}https://github.com/007krcs/tekivex-ui/issues${C.reset}
`);
}

main().catch((err) => {
  console.error(`${C.red}✗ ${err?.message || err}${C.reset}`);
  process.exit(1);
});
