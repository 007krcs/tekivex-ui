// ─────────────────────────────────────────────────────────────────────────────
// Check catalogue for tekivex-audit.
// Each check is { id, category, severity, test(file, allFiles) -> findings[] }.
// ─────────────────────────────────────────────────────────────────────────────

function linesOf(content, re) {
  const lines = content.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) out.push({ line: i + 1, text: lines[i].trim().slice(0, 160) });
  }
  return out;
}

function isCodeFile(p) { return /\.(tsx?|jsx?)$/.test(p); }
function isHtmlFile(p) { return /\.html$/.test(p); }

const CHECKS = [
  // ── Security ────────────────────────────────────────────────────────────
  {
    id: 'SEC-001', category: 'security', severity: 'error',
    title: 'dangerouslySetInnerHTML without sanitization',
    ref: 'OWASP XSS Prevention',
    test(file) {
      if (!isCodeFile(file.path)) return [];
      if (!/dangerouslySetInnerHTML/.test(file.content)) return [];
      // Allow if file also imports DOMPurify OR sanitizeHTML.
      if (/DOMPurify|sanitizeHTML|@tekivex\/security-core/.test(file.content)) return [];
      return linesOf(file.content, /dangerouslySetInnerHTML/);
    },
  },
  {
    id: 'SEC-002', category: 'security', severity: 'error',
    title: 'href contains javascript: scheme',
    ref: 'OWASP XSS',
    test(file) {
      if (!isCodeFile(file.path) && !isHtmlFile(file.path)) return [];
      return linesOf(file.content, /href\s*=\s*["'`]\s*javascript:/i);
    },
  },
  {
    id: 'SEC-003', category: 'security', severity: 'error',
    title: 'eval() or new Function() usage',
    ref: 'CWE-95',
    test(file) {
      if (!isCodeFile(file.path)) return [];
      return linesOf(file.content, /\b(eval|Function)\s*\(/);
    },
  },
  {
    id: 'SEC-004', category: 'security', severity: 'error',
    title: 'Hardcoded secret / API key',
    ref: 'CWE-798',
    test(file) {
      if (!isCodeFile(file.path)) return [];
      return linesOf(
        file.content,
        /\b(?:api[_-]?key|secret|token|password|passwd)\s*[:=]\s*["'`][A-Za-z0-9_\-+/=]{16,}["'`]/i,
      );
    },
  },
  {
    id: 'SEC-005', category: 'security', severity: 'warn',
    title: 'Auth token stored in localStorage',
    ref: 'OWASP Session Management',
    test(file) {
      if (!isCodeFile(file.path)) return [];
      return linesOf(file.content, /localStorage\.setItem\([^)]*(?:auth|token|jwt|session)/i);
    },
  },
  {
    id: 'SEC-006', category: 'security', severity: 'warn',
    title: 'target="_blank" without rel="noopener"',
    ref: 'OWASP Reverse Tabnabbing',
    test(file) {
      if (!isCodeFile(file.path) && !isHtmlFile(file.path)) return [];
      const out = [];
      const lines = file.content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (/target\s*=\s*["']_blank["']/.test(l) && !/rel\s*=\s*["'][^"']*noopener/.test(l)) {
          out.push({ line: i + 1, text: l.trim().slice(0, 160) });
        }
      }
      return out;
    },
  },
  {
    id: 'SEC-007', category: 'security', severity: 'warn',
    title: 'index.html missing Content-Security-Policy meta tag',
    ref: 'CSP Level 3',
    test(file, all) {
      if (!isHtmlFile(file.path)) return [];
      if (!/index\.html$/.test(file.path)) return [];
      if (/Content-Security-Policy/i.test(file.content)) return [];
      return [{ line: 1, text: 'no CSP meta tag found' }];
    },
  },
  {
    id: 'SEC-008', category: 'security', severity: 'warn',
    title: 'URL rendered without sanitizeHref',
    ref: 'CWE-79',
    test(file) {
      if (!isCodeFile(file.path)) return [];
      // Heuristic: prop named href={someVar} but the file has no sanitizeHref import.
      if (!/href\s*=\s*\{[^}]*\}/.test(file.content)) return [];
      if (/sanitizeHref|@tekivex\/security-core/.test(file.content)) return [];
      return linesOf(file.content, /href\s*=\s*\{/);
    },
  },

  // ── Accessibility ───────────────────────────────────────────────────────
  {
    id: 'A11Y-001', category: 'accessibility', severity: 'error',
    title: '<img> without alt attribute',
    ref: 'WCAG 1.1.1',
    test(file) {
      if (!isCodeFile(file.path) && !isHtmlFile(file.path)) return [];
      const out = [];
      const lines = file.content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (/<img\b/.test(l) && !/\balt\s*=/.test(l)) {
          out.push({ line: i + 1, text: l.trim().slice(0, 160) });
        }
      }
      return out;
    },
  },
  {
    id: 'A11Y-002', category: 'accessibility', severity: 'warn',
    title: '<button> with no text or aria-label',
    ref: 'WCAG 4.1.2',
    test(file) {
      if (!isCodeFile(file.path) && !isHtmlFile(file.path)) return [];
      return linesOf(file.content, /<button\b[^>]*>\s*<\/button>/);
    },
  },
  {
    id: 'A11Y-003', category: 'accessibility', severity: 'warn',
    title: 'onClick on <div> / <span> (non-interactive element)',
    ref: 'WCAG 2.1.1',
    test(file) {
      if (!isCodeFile(file.path)) return [];
      return linesOf(file.content, /<(?:div|span)\b[^>]*onClick=/);
    },
  },
  {
    id: 'A11Y-004', category: 'accessibility', severity: 'warn',
    title: 'Empty <a> link (no text content)',
    ref: 'WCAG 2.4.4',
    test(file) {
      if (!isCodeFile(file.path) && !isHtmlFile(file.path)) return [];
      return linesOf(file.content, /<a\s[^>]*>\s*<\/a>/);
    },
  },
  {
    id: 'A11Y-005', category: 'accessibility', severity: 'warn',
    title: '<input> without associated <label>',
    ref: 'WCAG 3.3.2',
    test(file) {
      if (!isCodeFile(file.path) && !isHtmlFile(file.path)) return [];
      // Heuristic: input with no aria-label and no id in a label htmlFor/for nearby.
      const out = [];
      const lines = file.content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (/<input\b/.test(l) && !/aria-label\s*=/.test(l) && !/type\s*=\s*["'](hidden|submit|button|reset)["']/.test(l)) {
          const context = lines.slice(Math.max(0, i - 3), i + 2).join('\n');
          if (!/<label|htmlFor=|\bfor=/.test(context)) {
            out.push({ line: i + 1, text: l.trim().slice(0, 160) });
          }
        }
      }
      return out;
    },
  },
  {
    id: 'A11Y-006', category: 'accessibility', severity: 'warn',
    title: 'Low-contrast color literal (heuristic)',
    ref: 'WCAG 1.4.3',
    test(file) {
      if (!isCodeFile(file.path)) return [];
      // Flag very-light-on-white or very-dark-on-black style literals.
      return linesOf(file.content, /color:\s*["'`]?#(?:[cdef]{3}|[cdef]{6})\b/i);
    },
  },
  {
    id: 'A11Y-007', category: 'accessibility', severity: 'warn',
    title: 'autoFocus on page-level element',
    ref: 'WCAG 2.4.3',
    test(file) {
      if (!isCodeFile(file.path)) return [];
      return linesOf(file.content, /\bautoFocus\b/);
    },
  },
];

export async function runChecks(fileContents, rootDir) {
  const findings = [];
  for (const check of CHECKS) {
    for (const file of fileContents) {
      const hits = check.test(file, fileContents);
      for (const h of hits) {
        findings.push({
          id: check.id, category: check.category, severity: check.severity,
          title: check.title, ref: check.ref,
          file: file.rel, line: h.line, text: h.text,
        });
      }
    }
  }
  return findings;
}

export function formatConsole(findings, rootDir, C) {
  if (findings.length === 0) {
    return `\n${C.green}\u2713 No security or accessibility issues found across scanned files.${C.reset}\n`;
  }
  const byId = {};
  for (const f of findings) (byId[f.id] ||= []).push(f);
  let out = '\n';
  const errCount = findings.filter((f) => f.severity === 'error').length;
  const warnCount = findings.filter((f) => f.severity === 'warn').length;
  out += `${C.bold}Summary:${C.reset} ${C.red}${errCount} error${errCount === 1 ? '' : 's'}${C.reset}, ${C.yellow}${warnCount} warning${warnCount === 1 ? '' : 's'}${C.reset}\n\n`;
  for (const id of Object.keys(byId).sort()) {
    const group = byId[id];
    const sample = group[0];
    const badge = sample.severity === 'error' ? `${C.red}ERROR${C.reset}` : `${C.yellow}WARN${C.reset}`;
    out += `${badge} ${C.bold}${id}${C.reset} ${C.dim}(${sample.ref})${C.reset} \u2014 ${sample.title}\n`;
    for (const f of group.slice(0, 5)) {
      out += `  ${C.cyan}${f.file}:${f.line}${C.reset}  ${C.dim}${f.text}${C.reset}\n`;
    }
    if (group.length > 5) out += `  ${C.dim}\u2026 and ${group.length - 5} more${C.reset}\n`;
    out += '\n';
  }
  return out;
}

export function formatMarkdown(findings, rootDir) {
  if (findings.length === 0) {
    return `# tekivex-audit\n\nNo security or accessibility issues found.\n`;
  }
  const byId = {};
  for (const f of findings) (byId[f.id] ||= []).push(f);
  const errCount = findings.filter((f) => f.severity === 'error').length;
  const warnCount = findings.filter((f) => f.severity === 'warn').length;
  let md = `# tekivex-audit report\n\n**${errCount} errors**, **${warnCount} warnings**\n\n`;
  for (const id of Object.keys(byId).sort()) {
    const group = byId[id];
    const sample = group[0];
    md += `## ${id} \u2014 ${sample.title}\n`;
    md += `- **Severity:** ${sample.severity}\n`;
    md += `- **Reference:** ${sample.ref}\n`;
    md += `- **Occurrences:** ${group.length}\n\n`;
    md += '| File | Line | Snippet |\n|---|---|---|\n';
    for (const f of group.slice(0, 20)) {
      md += `| \`${f.file}\` | ${f.line} | \`${f.text.replace(/\|/g, '\\|')}\` |\n`;
    }
    md += '\n';
  }
  return md;
}

export function formatJSON(findings) {
  return JSON.stringify({ generatedAt: new Date().toISOString(), count: findings.length, findings }, null, 2);
}
