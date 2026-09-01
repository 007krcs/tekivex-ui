/**
 * A WAI-ARIA 1.2 conformance checker that walks a rendered DOM subtree and
 * reports every structural violation it can prove statically.
 *
 * Complements axe-core: axe under jsdom skips anything that needs layout or
 * paint, and its rule set is deliberately conservative (it reports what is
 * near-certainly broken for users). This checker enforces the *specification*
 * — required/prohibited properties, required context, value grammars, idref
 * integrity — which is what "comply with W3C rules" means as an SOP.
 */
import {
  VALID_ROLES, ABSTRACT_ROLES, REQUIRED_PROPS, PROHIBITED_PROPS,
  REQUIRED_CONTEXT, NAME_REQUIRED, IDREF_PROPS, ENUM_VALUES, BOOLEAN_PROPS,
  NUMERIC_PROPS, VALID_ARIA_ATTRS, IMPLICIT_ROLES, FOCUSABLE_SELECTOR,
} from './spec';

export interface AriaViolation {
  rule: string;
  message: string;
  element: string;
}

function describe(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute('role');
  const id = el.getAttribute('id');
  const cls = el.getAttribute('class');
  const label = el.getAttribute('aria-label');
  let out = `<${tag}`;
  if (role) out += ` role="${role}"`;
  if (id) out += ` id="${id}"`;
  if (label) out += ` aria-label="${label}"`;
  if (!role && !id && !label && cls) out += ` class="${cls.slice(0, 40)}"`;
  return out + '>';
}

/** The element's explicit role, else its implicit role from the tag name. */
export function effectiveRole(el: Element): string | null {
  const explicit = el.getAttribute('role');
  if (explicit) return explicit.trim().split(/\s+/)[0].toLowerCase();
  const tag = el.tagName.toLowerCase();
  if (tag === 'input') {
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    const map: Record<string, string> = {
      button: 'button', checkbox: 'checkbox', image: 'button', number: 'spinbutton',
      radio: 'radio', range: 'slider', reset: 'button', search: 'searchbox',
      submit: 'button', text: 'textbox', email: 'textbox', tel: 'textbox', url: 'textbox',
    };
    return map[type] ?? null; // date/color/file/hidden/password have no mapped role
  }
  if (tag === 'a' || tag === 'area') return el.hasAttribute('href') ? 'link' : 'generic';
  return IMPLICIT_ROLES[tag] ?? null;
}

/** Approximate accessible-name computation (ACCNAME 1.2, the parts jsdom allows). */
export function accessibleName(el: Element, root: ParentNode): string {
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    const text = labelledby
      .split(/\s+/)
      .map((id) => (root as Document | Element).querySelector?.(`#${CSS.escape(id)}`)?.textContent ?? '')
      .join(' ')
      .trim();
    if (text) return text;
  }
  const label = el.getAttribute('aria-label');
  if (label && label.trim()) return label.trim();

  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'select' || tag === 'textarea') {
    const id = el.getAttribute('id');
    if (id) {
      const forLabel = (root as Document | Element).querySelector?.(`label[for="${CSS.escape(id)}"]`);
      if (forLabel?.textContent?.trim()) return forLabel.textContent.trim();
    }
    const wrapping = el.closest('label');
    if (wrapping?.textContent?.trim()) return wrapping.textContent.trim();
    const title = el.getAttribute('title');
    if (title?.trim()) return title.trim();
    const ph = el.getAttribute('placeholder');
    if (ph?.trim()) return ph.trim();
    return '';
  }
  if (tag === 'img') return el.getAttribute('alt') ?? '';

  // Name from content.
  const text = (el.textContent ?? '').trim();
  if (text) return text;
  const title = el.getAttribute('title');
  return title?.trim() ?? '';
}

function isFocusable(el: Element): boolean {
  if (el.matches('[disabled]')) return false;
  const ti = el.getAttribute('tabindex');
  if (ti !== null) return Number(ti) >= 0;
  return el.matches('a[href], button, input, select, textarea, iframe, [contenteditable="true"]');
}

export interface ValidateOptions {
  /** Rules to skip, by rule id. */
  ignore?: string[];
}

/**
 * Validate a rendered subtree. Returns every violation found.
 */
export function validateAria(root: ParentNode, opts: ValidateOptions = {}): AriaViolation[] {
  const violations: AriaViolation[] = [];
  const ignore = new Set(opts.ignore ?? []);
  const add = (rule: string, message: string, el: Element) => {
    if (!ignore.has(rule)) violations.push({ rule, message, element: describe(el) });
  };

  const all = Array.from(root.querySelectorAll('*'));

  // ── Duplicate ids (breaks every idref association) ────────────────────────
  const seen = new Map<string, number>();
  for (const el of all) {
    const id = el.getAttribute('id');
    if (id) seen.set(id, (seen.get(id) ?? 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) {
      const el = (root as Element).querySelector(`#${CSS.escape(id)}`)!;
      add('duplicate-id', `id "${id}" appears ${count} times; idref associations become ambiguous`, el);
    }
  }

  for (const el of all) {
    const explicitRole = el.getAttribute('role');
    const role = effectiveRole(el);

    // ── Role validity ──────────────────────────────────────────────────────
    if (explicitRole) {
      for (const token of explicitRole.trim().split(/\s+/)) {
        const r = token.toLowerCase();
        if (ABSTRACT_ROLES.has(r)) {
          add('abstract-role', `role="${r}" is an abstract role and must not be used in markup`, el);
        } else if (!VALID_ROLES.has(r)) {
          add('invalid-role', `role="${r}" is not a valid WAI-ARIA 1.2 role`, el);
        }
      }
    }

    // ── aria-* attribute validity ──────────────────────────────────────────
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (!name.startsWith('aria-')) continue;

      if (!VALID_ARIA_ATTRS.has(name)) {
        add('invalid-aria-attr', `${name} is not a WAI-ARIA 1.2 attribute`, el);
        continue;
      }
      const value = attr.value;

      // Value grammars.
      const enumVals = ENUM_VALUES[name];
      if (enumVals && value !== '' && !enumVals.includes(value)) {
        add('invalid-aria-value', `${name}="${value}" is not one of: ${enumVals.join(', ')}`, el);
      }
      if (BOOLEAN_PROPS.includes(name) && value !== '' && value !== 'true' && value !== 'false') {
        add('invalid-aria-value', `${name}="${value}" must be "true" or "false"`, el);
      }
      if (NUMERIC_PROPS.includes(name) && value !== '' && Number.isNaN(Number(value))) {
        add('invalid-aria-value', `${name}="${value}" must be a number`, el);
      }

      // Idref integrity — a dangling reference is silently ignored by AT.
      if (IDREF_PROPS.includes(name) && value.trim()) {
        for (const id of value.trim().split(/\s+/)) {
          const target =
            (root as Element).querySelector?.(`#${CSS.escape(id)}`) ??
            document.getElementById(id);
          if (!target) {
            add('dangling-idref', `${name} references "${id}", which is not in the document`, el);
          }
        }
      }

      // Prohibited on this role.
      if (role && PROHIBITED_PROPS[role]?.includes(name)) {
        add(
          'prohibited-attr',
          `${name} is prohibited on role="${role}" (WAI-ARIA 1.2 prohibited states and properties)`,
          el,
        );
      }
    }

    if (!role) continue;

    // ── Required properties for the role ───────────────────────────────────
    // Only enforced for AUTHORED roles. When the role is implicit (a native
    // <option>, <tr>, <li>, <input type="checkbox">…), HTML already conveys the
    // state and structure to assistive tech; ARIA's required-attribute rules
    // exist for elements whose semantics the author asserted.
    if (explicitRole) {
      for (const required of REQUIRED_PROPS[role] ?? []) {
        if (!el.hasAttribute(required)) {
          add('missing-required-attr', `role="${role}" requires ${required}`, el);
        }
      }
    }

    // ── Required context role (authored roles only — see above) ────────────
    const contexts = explicitRole ? REQUIRED_CONTEXT[role] : undefined;
    if (contexts) {
      let parent: Element | null = el.parentElement;
      let found = false;
      while (parent) {
        const pr = effectiveRole(parent);
        if (pr && contexts.includes(pr)) { found = true; break; }
        // A presentational wrapper does not break the chain.
        parent = parent.parentElement;
      }
      // aria-owns can supply the context from elsewhere in the document.
      if (!found && el.id) {
        const owner = (root as Element).querySelector?.(`[aria-owns~="${CSS.escape(el.id)}"]`);
        if (owner) found = true;
      }
      if (!found) {
        add(
          'missing-required-context',
          `role="${role}" must be contained in one of: ${contexts.join(', ')}`,
          el,
        );
      }
    }

    // ── aria-hidden must not hide focusable content ────────────────────────
    if (el.getAttribute('aria-hidden') === 'true' && !el.hasAttribute('inert')) {
      if (isFocusable(el)) {
        add('aria-hidden-focusable', 'aria-hidden="true" on a focusable element', el);
      }
      const inner = Array.from(el.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isFocusable);
      if (inner.length && !el.closest('[inert]')) {
        add(
          'aria-hidden-focusable',
          `aria-hidden="true" hides ${inner.length} focusable descendant(s) that remain reachable by keyboard`,
          el,
        );
      }
    }

    // ── Accessible name required ───────────────────────────────────────────
    if (NAME_REQUIRED.has(role) && el.getAttribute('aria-hidden') !== 'true') {
      const hiddenAncestor = el.closest('[aria-hidden="true"], [inert]');
      if (!hiddenAncestor && !accessibleName(el, root)) {
        add('missing-accessible-name', `role="${role}" has no accessible name`, el);
      }
    }
  }

  return violations;
}

/** Pretty-print violations for a test failure message. */
export function formatViolations(violations: AriaViolation[]): string {
  if (!violations.length) return 'no violations';
  const byRule = new Map<string, AriaViolation[]>();
  for (const v of violations) {
    if (!byRule.has(v.rule)) byRule.set(v.rule, []);
    byRule.get(v.rule)!.push(v);
  }
  const lines: string[] = [];
  for (const [rule, list] of [...byRule].sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`  ${rule} (${list.length}):`);
    for (const v of list.slice(0, 6)) lines.push(`    - ${v.message}\n      ${v.element}`);
    if (list.length > 6) lines.push(`    ... and ${list.length - 6} more`);
  }
  return lines.join('\n');
}
