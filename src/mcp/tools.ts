/**
 * The tool implementations.
 *
 * Design rule: every tool answers from something that actually exists in this
 * repository — the extracted component catalog, the WAI-ARIA validator, or the
 * documented security rules. None of them generate free-form prose. An MCP
 * server whose answers are guesses is worse than none, because the caller
 * cannot tell the difference.
 */
import catalog from './catalog.json' with { type: 'json' };
import { ToolError } from './enterprise';

interface PropEntry {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  deprecated?: boolean;
}
interface TypeEntry {
  component: string;
  props?: PropEntry[];
  alias?: string;
}
interface ComponentEntry {
  name: string;
  file: string;
  propsType?: string;
  description?: string;
  rscSafe: boolean;
  importPath: string;
}

const COMPONENTS = catalog.components as ComponentEntry[];
const TYPES = catalog.types as Record<string, TypeEntry>;

// ── ui_list_components ───────────────────────────────────────────────────────

/**
 * Bucket a component by name so a listing can be scanned without reading every
 * description. Derived, not hand-maintained, so it cannot drift.
 */
function categoryOf(name: string): string {
  const n = name.replace(/^Tkx/, '');
  const table: Array<[RegExp, string]> = [
    [/^(Input|Textarea|Select|Checkbox|Radio|Toggle|Slider|NumberInput|Currency|Phone|OTP|DatePicker|ComboBox|Autocomplete|Form|Field|AutoForm|Mentions|Rating|ColorPicker|FileUpload|SignaturePad|Aadhaar|Pan|Kyc|Address)/, 'input'],
    [/^(Table|DataGrid|DataExplorer|Spreadsheet|PivotTable|List|TransferList|Tree|OrgChart|Timeline|Descriptions|Statistic|Calendar|Kanban|Gantt)/, 'data'],
    [/^(Chart|Sparkline|Gauge|Heatmap|Treemap|Funnel|RealTime)/, 'chart'],
    [/^(Modal|Drawer|Popover|Tooltip|Toast|Snackbar|Alert|Dialog|CommandPalette|Menu|Dropdown|SpeedDial|Tour)/, 'overlay'],
    [/^(Card|Layout|Grid|Stack|Divider|Splitter|Accordion|Tabs|AppBar|BottomNav|Toolbar|Breadcrumb|Pagination|Stepper|Anchor|Affix)/, 'layout'],
    [/^(Badge|Tag|Avatar|Icon|Typography|Skeleton|Spin|Progress|Empty|Result|Image|QRCode|Watermark|Logo|Code|Markdown|RichText)/, 'display'],
    [/^(Agent|AI|Chat|MessageThread|Live|Reasoning|ToolCall)/, 'ai'],
    [/^(Checkout|Payment|Subscription)/, 'commerce'],
  ];
  for (const [re, cat] of table) if (re.test(n)) return cat;
  return 'other';
}

/** First sentence only — a listing is for scanning, not for reading. */
function summarise(description: string | undefined): string | undefined {
  if (!description) return undefined;
  const first = description.split(/(?<=\.)\s/)[0].trim();
  return first.length > 100 ? first.slice(0, 97) + '…' : first;
}

/**
 * Deliberately compact: name, category, one-line summary, RSC status.
 *
 * Full prop tables and type definitions live ONLY in ui_get_component_api. A
 * catalog listing that inlined every prop would burn a large share of the
 * model's context before it had chosen a component, which is the opposite of
 * useful.
 */
export function listComponents(args: { filter?: string; rscOnly?: boolean; category?: string }) {
  const needle = args.filter?.toLowerCase();
  const matches = COMPONENTS.filter((c) => {
    if (args.rscOnly && !c.rscSafe) return false;
    if (args.category && categoryOf(c.name) !== args.category) return false;
    if (!needle) return true;
    return (
      c.name.toLowerCase().includes(needle) ||
      (c.description ?? '').toLowerCase().includes(needle)
    );
  });
  return {
    libraryVersion: catalog.libraryVersion,
    count: matches.length,
    components: matches.map((c) => ({
      name: c.name,
      category: categoryOf(c.name),
      summary: summarise(c.description),
      rscSafe: c.rscSafe,
    })),
    next: 'Call ui_get_component_api(name) for props, types and RSC directive guidance.',
  };
}

// ── ui_get_component_api ─────────────────────────────────────────────────────

/** Types referenced by a prop signature that we also have entries for. */
function relatedTypes(props: PropEntry[], depth = 1): Record<string, TypeEntry> {
  const out: Record<string, TypeEntry> = {};
  const scan = (entries: PropEntry[], level: number) => {
    if (level > depth) return;
    for (const p of entries) {
      for (const name of Object.keys(TYPES)) {
        if (out[name]) continue;
        // Word-boundary match so `SelectOption` doesn't match `SelectOptionX`.
        if (new RegExp(`\\b${name}\\b`).test(p.type)) {
          out[name] = TYPES[name];
          if (TYPES[name].props) scan(TYPES[name].props!, level + 1);
        }
      }
    }
  };
  scan(props, 1);
  return out;
}

export function getComponentApi(args: { name: string }) {
  const name = args.name?.trim();
  if (!name) throw new ToolError('invalid_argument', 'name is required.');

  const component = COMPONENTS.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (!component) {
    // A wrong guess should be corrected, not merely rejected — that is the
    // whole reason this tool exists. Rank by longest common prefix, which
    // catches near-misses like TkxDropDownMenu -> TkxDropdown.
    const target = name.toLowerCase();
    const commonPrefix = (a: string, b: string) => {
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return i;
    };
    const suggestions = COMPONENTS.map((c) => ({
      name: c.name,
      score: Math.max(
        commonPrefix(c.name.toLowerCase(), target),
        c.name.toLowerCase().includes(target.replace(/^tkx/, '')) ? target.length : 0,
      ),
    }))
      .filter((s) => s.score >= 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.name);
    throw new ToolError(
      'not_found',
      `No component named "${name}".` +
        (suggestions.length ? ` Did you mean: ${suggestions.join(', ')}?` : ''),
    );
  }

  const propsEntry = component.propsType ? TYPES[component.propsType] : undefined;
  const props = propsEntry?.props ?? [];

  return {
    name: component.name,
    description: component.description,
    importPath: component.importPath,
    // ── RSC metadata ────────────────────────────────────────────────────────
    // Both directions are stated explicitly rather than leaving the caller to
    // negate one: an agent scaffolding a Next.js or Remix file needs an
    // unambiguous answer to "must I prepend 'use client'?".
    rscSafe: component.rscSafe,
    isClientComponent: !component.rscSafe,
    requiresUseClientDirective: !component.rscSafe,
    directiveToPrepend: component.rscSafe ? null : "'use client';",
    rscNote: component.rscSafe
      ? 'Renders on the server. Ships no JavaScript. Do NOT add "use client".'
      : 'Reads React context or uses state/handlers. The file that imports it must start with \'use client\';',
    propsType: component.propsType,
    props,
    relatedTypes: relatedTypes(props),
    libraryVersion: catalog.libraryVersion,
  };
}

// ── ui_audit_accessibility ───────────────────────────────────────────────────

export interface AriaCheck {
  rule: string;
  message: string;
  element: string;
}

/**
 * Validate an HTML fragment against WAI-ARIA 1.2.
 *
 * The validator is the same module the library's own CI gate uses, so a caller
 * gets exactly the rules that would fail our build. It is injected rather than
 * imported directly to keep this module free of a DOM dependency: the server
 * supplies a parser when one is available.
 */
export function auditAccessibility(
  args: { html: string },
  validate: (html: string) => AriaCheck[],
) {
  if (!args.html?.trim()) throw new ToolError('invalid_argument', 'html is required.');
  const violations = validate(args.html);
  return {
    conformant: violations.length === 0,
    violationCount: violations.length,
    violations,
    standard: 'WAI-ARIA 1.2',
    note:
      'Structural conformance only. Colour contrast, focus visibility and ' +
      'target size need a real browser and are not evaluated here.',
  };
}

// ── ui_verify_security ───────────────────────────────────────────────────────

interface SecurityRule {
  id: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium';
  message: string;
  remedy: string;
}

/**
 * The rules mirror docs/SECURITY-THREAT-MODEL.md. Each one is a pattern that
 * defeats a control the library provides, so a hit means the caller has opted
 * out of a defence rather than merely written unusual code.
 */
const SECURITY_RULES: SecurityRule[] = [
  {
    id: 'dangerously-set-inner-html',
    pattern: /dangerouslySetInnerHTML/,
    severity: 'critical',
    message: 'dangerouslySetInnerHTML bypasses React text escaping.',
    remedy:
      'Render as text, or route the value through sanitizeHTML() from tekivex-ui first.',
  },
  {
    id: 'inner-html-assignment',
    pattern: /\.innerHTML\s*=/,
    severity: 'critical',
    message: 'Direct innerHTML assignment is an XSS sink.',
    remedy: 'Use textContent, or sanitizeHTML() if markup is genuinely required.',
  },
  {
    id: 'javascript-url',
    pattern: /(?:href|src)\s*=\s*["'`]\s*javascript:/i,
    severity: 'critical',
    message: 'javascript: URL executes on navigation.',
    remedy: 'Pass URLs through sanitizeHref(), which allow-lists http/https/mailto/tel.',
  },
  {
    id: 'eval-family',
    pattern: /\b(?:eval|new\s+Function)\s*\(/,
    severity: 'critical',
    message: 'eval / new Function violates a strict CSP and executes arbitrary input.',
    remedy: 'Remove it. If this is a sandbox, run it in a worker with its own CSP.',
  },
  {
    id: 'unsanitised-escape-into-html',
    pattern: /escapeHTML\s*\(\s*escapeHTML\s*\(/,
    severity: 'medium',
    message: 'escapeHTML applied twice produces visible &amp; entities.',
    remedy: 'Escape once, at the HTML sink only.',
  },
  {
    id: 'sanitize-string-into-html-sink',
    pattern: /innerHTML[^\n]*sanitizeString\s*\(/,
    severity: 'high',
    message:
      'sanitizeString() is the React text path and does NOT escape HTML entities.',
    remedy: 'Use escapeHTML() when writing into an HTML sink.',
  },
];

export function verifySecurity(args: { code: string }) {
  if (!args.code?.trim()) throw new ToolError('invalid_argument', 'code is required.');
  const lines = args.code.split('\n');
  const findings: Array<{
    rule: string;
    severity: string;
    line: number;
    message: string;
    remedy: string;
    snippet: string;
  }> = [];

  lines.forEach((line, i) => {
    for (const rule of SECURITY_RULES) {
      if (rule.pattern.test(line)) {
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          line: i + 1,
          message: rule.message,
          remedy: rule.remedy,
          snippet: line.trim().slice(0, 160),
        });
      }
    }
  });

  const worst = findings.reduce<'critical' | 'high' | 'medium' | 'none'>((acc, f) => {
    if (acc === 'critical' || f.severity === 'critical') return 'critical';
    if (acc === 'high' || f.severity === 'high') return 'high';
    return 'medium';
  }, 'none');

  return {
    pass: findings.length === 0,
    highestSeverity: worst,
    findingCount: findings.length,
    findings,
    rulesApplied: SECURITY_RULES.map((r) => r.id),
    note: 'Pattern-based review of the sinks named in docs/SECURITY-THREAT-MODEL.md. Not a substitute for a full SAST run.',
  };
}

// ── ui_scaffold_form ─────────────────────────────────────────────────────────

/** Field type → the component this library actually ships for it. */
const FIELD_COMPONENTS: Record<string, { component: string; importPath: string }> = {
  string: { component: 'TkxInput', importPath: 'tekivex-ui' },
  text: { component: 'TkxInput', importPath: 'tekivex-ui' },
  textarea: { component: 'TkxTextarea', importPath: 'tekivex-ui' },
  number: { component: 'TkxNumberInput', importPath: 'tekivex-ui' },
  select: { component: 'TkxSelect', importPath: 'tekivex-ui' },
  checkbox: { component: 'TkxCheckbox', importPath: 'tekivex-ui' },
  date: { component: 'TkxDatePicker', importPath: 'tekivex-ui' },
  phone: { component: 'TkxPhoneInput', importPath: 'tekivex-ui' },
  otp: { component: 'TkxOTP', importPath: 'tekivex-ui' },
};

export interface ScaffoldField {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
}

export function scaffoldForm(args: { formName?: string; fields: ScaffoldField[] }) {
  const fields = args.fields;
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new ToolError('invalid_argument', 'fields must be a non-empty array.');
  }
  const formName = (args.formName ?? 'GeneratedForm').replace(/[^A-Za-z0-9_]/g, '');

  const unknown = fields.filter((f) => !FIELD_COMPONENTS[f.type]);
  if (unknown.length) {
    throw new ToolError(
      'unsupported_field_type',
      `No component ships for field type(s): ${unknown.map((f) => f.type).join(', ')}. ` +
        `Supported: ${Object.keys(FIELD_COMPONENTS).join(', ')}.`,
    );
  }

  const used = [...new Set(fields.map((f) => FIELD_COMPONENTS[f.type].component))].sort();
  const imports = `import { TkxForm, TkxFormField, ${used.join(', ')} } from 'tekivex-ui';`;

  const body = fields
    .map((f) => {
      const { component } = FIELD_COMPONENTS[f.type];
      const label = f.label ?? f.name;
      return (
        `      <TkxFormField name="${f.name}" label="${label}"` +
        (f.required ? ' required' : '') +
        `>\n        <${component} />\n      </TkxFormField>`
      );
    })
    .join('\n');

  const code =
    `'use client';\n${imports}\n\n` +
    `export function ${formName}({ onSubmit }: { onSubmit: (v: Record<string, unknown>) => void }) {\n` +
    `  return (\n    <TkxForm onSubmit={onSubmit}>\n${body}\n    </TkxForm>\n  );\n}\n`;

  return {
    code,
    componentsUsed: used,
    notes: [
      "TkxForm wires each field's label to its control and injects aria-invalid / aria-describedby.",
      "'use client' is required: every form control reads the theme through React context.",
      'Validate on the server too — client validation is a UX affordance, not a control.',
    ],
    libraryVersion: catalog.libraryVersion,
  };
}
