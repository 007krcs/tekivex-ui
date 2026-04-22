// ── Security Shield ──────────────────────────────────────────────────────────
// XSS prevention, CSP, prop validation, immutable audit trail

import { fnv1aHash } from './hash';

// ── XSS Sanitization ─────────────────────────────────────────────────────────

const HTML_ENTITIES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&#39;',
  '"': '&quot;',
  // Backticks can break out of unquoted/template-literal contexts in HTML
  // (legacy IE and some sinks). Escape defensively.
  '`': '&#96;',
};

/**
 * Escape HTML-sensitive characters in a value so it is safe to render as text.
 * Also strips NUL and most C0 control characters, which can be used to smuggle
 * payloads past naïve filters, and normalizes newlines.
 *
 * This is a defense-in-depth helper — it does NOT allow-list HTML. For rich
 * HTML input, use a dedicated sanitizer such as DOMPurify.
 */
export function sanitizeString(input: unknown): string {
  let s = String(input);
  // Strip NUL + disallowed C0 controls (keep \t \n \r).
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  return s.replace(/[<>&'"`]/g, (char) => HTML_ENTITIES[char] ?? char);
}

export function sanitizeProps<T extends Record<string, unknown>>(props: T): T {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    result[key] = sanitizeValue(props[key]);
  }
  return result as T;
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value !== null && typeof value === 'object' && !isReactElement(value)) {
    return sanitizeProps(value as Record<string, unknown>);
  }
  return value;
}

function isReactElement(value: unknown): boolean {
  return typeof value === 'object' && value !== null && '$$typeof' in value;
}

// ── Runtime Prop Validation ──────────────────────────────────────────────────

export interface PropSchema {
  type: 'string' | 'number' | 'boolean' | 'function' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: unknown[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateProps(
  props: Record<string, unknown>,
  schema: Record<string, PropSchema>,
): ValidationResult {
  const errors: string[] = [];

  for (const [key, rule] of Object.entries(schema)) {
    const value = props[key];
    const missing = value === undefined || value === null;

    if (rule.required && missing) {
      errors.push(`prop '${key}' is required`);
      continue;
    }

    if (missing) continue;

    if (typeof value !== rule.type) {
      errors.push(`prop '${key}' must be of type ${rule.type}, got ${typeof value}`);
      continue;
    }

    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`prop '${key}' must be >= ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`prop '${key}' must be <= ${rule.max}`);
      }
    }

    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`prop '${key}' does not match pattern ${rule.pattern}`);
      }
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`prop '${key}' must be one of: ${rule.enum.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── CSP Permission Model ─────────────────────────────────────────────────────

export interface ComponentPermissions {
  allowInlineStyles?: boolean;
  allowDataUrls?: boolean;
  allowExternalSrc?: boolean;
  allowScripts?: boolean;
}

export interface CSPDirectives {
  componentId: string;
  permissions: ComponentPermissions;
  directives: Record<string, string[]>;
}

const cspRegistry = new Map<string, CSPDirectives>();

export function createCSP(componentId: string, permissions: ComponentPermissions): CSPDirectives {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'style-src': permissions.allowInlineStyles ? ["'self'", "'unsafe-inline'"] : ["'self'"],
    'img-src': permissions.allowDataUrls
      ? ["'self'", 'data:']
      : permissions.allowExternalSrc
        ? ["'self'", '*']
        : ["'self'"],
    'script-src': permissions.allowScripts ? ["'self'"] : ["'none'"],
  };

  const csp: CSPDirectives = { componentId, permissions, directives };
  cspRegistry.set(componentId, csp);
  return csp;
}

export function hasPermission(componentId: string, permission: keyof ComponentPermissions): boolean {
  const csp = cspRegistry.get(componentId);
  return csp?.permissions[permission] === true;
}

// ── Immutable Audit Trail ────────────────────────────────────────────────────

export interface AuditEntry {
  readonly timestamp: number;
  readonly component: string;
  readonly action: string;
  readonly propsHash: string;
  readonly chainHash: string;
}

export interface AuditFilter {
  component?: string;
  action?: string;
  limit?: number;
}

let auditTrail: readonly AuditEntry[] = [];

export function audit(
  action: string,
  component: string,
  meta?: Record<string, unknown>,
): AuditEntry {
  const propsHash = fnv1aHash(JSON.stringify(meta ?? {}));
  const prevChainHash = auditTrail.length > 0 ? auditTrail[auditTrail.length - 1].chainHash : '00000000';
  const chainHash = fnv1aHash(prevChainHash + propsHash + component + action);

  const entry: AuditEntry = Object.freeze({
    timestamp: Date.now(),
    component,
    action,
    propsHash,
    chainHash,
  });

  auditTrail = Object.freeze([...auditTrail, entry]);
  return entry;
}

export function getAuditLog(filter?: AuditFilter): readonly AuditEntry[] {
  let result = auditTrail;

  if (filter?.component) {
    result = result.filter((e) => e.component === filter.component);
  }
  if (filter?.action) {
    result = result.filter((e) => e.action === filter.action);
  }
  if (filter?.limit) {
    result = result.slice(-filter.limit);
  }

  return result;
}

export function verifyAuditIntegrity(): boolean {
  let prevChainHash = '00000000';

  for (const entry of auditTrail) {
    const expectedChain = fnv1aHash(prevChainHash + entry.propsHash + entry.component + entry.action);
    if (expectedChain !== entry.chainHash) return false;
    prevChainHash = entry.chainHash;
  }

  return true;
}

// ── URL / href sanitization ──────────────────────────────────────────────────

/**
 * Allow-list URL sanitizer. Blocks javascript:, vbscript:, and non-image
 * data: URLs (known XSS vectors). Accepts http(s), mailto:, tel:, and
 * relative URLs. Returns null for rejected inputs.
 */
export function sanitizeHref(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t) return null;
  // eslint-disable-next-line no-control-regex
  const clean = t.replace(/[\u0000-\u001F\u007F]/g, '');
  if (/^javascript:/i.test(clean)) return null;
  if (/^vbscript:/i.test(clean)) return null;
  if (/^data:/i.test(clean) && !/^data:image\//i.test(clean)) return null;
  if (/^file:/i.test(clean)) return null;
  return clean;
}

// ── HTML sanitization (allow-list DOM parser) ────────────────────────────────

const ALLOWED_TAGS = new Set([
  'a','abbr','b','blockquote','br','code','del','div','em','h1','h2','h3','h4','h5','h6',
  'hr','i','img','ins','kbd','li','mark','ol','p','pre','q','s','samp','small','span',
  'strong','sub','sup','table','tbody','td','tfoot','th','thead','tr','u','ul',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding']),
  th: new Set(['scope', 'colspan', 'rowspan', 'align']),
  td: new Set(['colspan', 'rowspan', 'align']),
  '*': new Set(['id', 'class', 'lang', 'dir', 'title']),
};

// Reject DOM-clobbering attribute names that shadow HTMLFormElement or
// HTMLDocument lookups (`document.cookie`, `form.submit`, etc.).
const CLOBBER_NAMES = new Set([
  'constructor','prototype','__proto__',
  'submit','reset','action','method','enctype','target','elements',
  'children','firstChild','nextSibling','parentNode','ownerDocument',
  'cookie','domain','location','documentElement','body','head','title',
  'contentWindow','contentDocument',
]);

/**
 * Safe HTML sanitizer. Parses input through the browser's DOMParser and walks
 * the tree dropping anything not in the allow-list. Removes every `on*`
 * handler, strips `javascript:`/`vbscript:`/`data:` URLs, blocks `<script>`,
 * `<iframe>`, `<object>`, `<embed>`, `<svg>`, `<style>`, and rejects
 * DOM-clobbering `name`/`id` attributes.
 *
 * Server/SSR: falls back to plain-text escape (returns sanitizeString).
 */
export function sanitizeHTML(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  if (typeof DOMParser === 'undefined') return sanitizeString(raw);

  const doc = new DOMParser().parseFromString(`<div>${raw}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return '';
  scrubNode(root);
  return root.innerHTML;
}

function scrubNode(node: Element): void {
  const children = Array.from(node.children);
  for (const child of children) {
    const tag = child.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      child.remove();
      continue;
    }
    // Strip every attribute not explicitly allowed.
    for (const attr of Array.from(child.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on')) { child.removeAttribute(attr.name); continue; }
      if (CLOBBER_NAMES.has(name)) { child.removeAttribute(attr.name); continue; }
      if (name === 'style') { child.setAttribute('style', sanitizeCSS(attr.value)); continue; }
      const tagAttrs = ALLOWED_ATTRS[tag] ?? new Set<string>();
      if (!tagAttrs.has(name) && !ALLOWED_ATTRS['*'].has(name)) {
        child.removeAttribute(attr.name);
        continue;
      }
      if ((name === 'href' || name === 'src') && typeof attr.value === 'string') {
        const clean = sanitizeHref(attr.value);
        if (clean === null) child.removeAttribute(attr.name);
        else child.setAttribute(attr.name, clean);
      }
      // DOM-clobbering: reject name/id values that collide.
      if ((name === 'name' || name === 'id') && CLOBBER_NAMES.has(attr.value.toLowerCase())) {
        child.removeAttribute(attr.name);
      }
    }
    scrubNode(child);
  }
}

// ── CSS sanitization ─────────────────────────────────────────────────────────

/**
 * Sanitize a CSS value string. Blocks `expression()`, `url(javascript:…)`,
 * `@import`, `behavior:` (IE), `-moz-binding` (Firefox legacy XBL), and
 * any HTML-breaking characters.
 */
export function sanitizeCSS(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let s = raw;
  s = s.replace(/expression\s*\([^)]*\)/gi, '');
  s = s.replace(/url\s*\(\s*['"]?\s*(javascript|vbscript|data)\s*:[^)]*\)/gi, 'url(#)');
  s = s.replace(/@import[^;]*;?/gi, '');
  s = s.replace(/behavior\s*:[^;]*;?/gi, '');
  s = s.replace(/-moz-binding[^;]*;?/gi, '');
  s = s.replace(/[<>]/g, '');
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\u0000-\u001F\u007F]/g, '');
  return s.trim();
}

// ── JSON / prototype-pollution safe parse ────────────────────────────────────

const POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Parse JSON and strip any keys that could pollute Object.prototype. Deeply
 * recurses. Returns null on parse failure.
 */
export function sanitizeJSON<T = unknown>(raw: string): T | null {
  try {
    const parsed = JSON.parse(raw, (key, value) => {
      if (POLLUTION_KEYS.has(key)) return undefined;
      return value;
    });
    return scrubPollution(parsed) as T;
  } catch {
    return null;
  }
}

function scrubPollution(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrubPollution);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (POLLUTION_KEYS.has(k)) continue;
      out[k] = scrubPollution(v);
    }
    return out;
  }
  return value;
}

// ── Attribute / form-name guard ──────────────────────────────────────────────

/**
 * Returns true if the given attribute/name/id value is safe — i.e. does not
 * collide with form/document properties enabling DOM clobbering.
 */
export function isSafeAttrName(name: unknown): boolean {
  if (typeof name !== 'string' || !name) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F<>"]/.test(name)) return false;
  return !CLOBBER_NAMES.has(name.toLowerCase());
}

// ── Unicode normalization ────────────────────────────────────────────────────

/**
 * Strip zero-width and bidirectional control characters used for
 * homograph and RTL-override attacks (Trojan Source, invisible JS).
 */
export function sanitizeUnicode(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  // Zero-width joiners, non-joiners, BOM, bidi overrides, soft hyphen.
  return raw.replace(
    /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD]/g,
    '',
  );
}

// ── CSP builder ──────────────────────────────────────────────────────────────

export interface TkxCSPOptions {
  /** Allow inline <style> tags (required for TekiVex atomic CSS). Default: true. */
  allowInlineStyles?: boolean;
  /** Extra image hosts to permit beyond 'self'. */
  imgHosts?: string[];
  /** Extra connect-src origins (for analytics, APIs, WebSocket). */
  connectHosts?: string[];
  /** Extra font hosts. */
  fontHosts?: string[];
  /** nonce to inject on inline <script> (strongly recommended in prod). */
  scriptNonce?: string;
  /** Report-only mode — browser reports violations but does not enforce. */
  reportOnly?: boolean;
  /** URL to report violations. */
  reportUri?: string;
}

/**
 * Build a strict Content-Security-Policy header value for TekiVex apps.
 * Covers XSS, clickjacking (frame-ancestors 'none'), form-injection, and
 * mixed content. Use in Next.js middleware or Express header.
 */
export function buildTkxCSP(opts: TkxCSPOptions = {}): string {
  const {
    allowInlineStyles = true,
    imgHosts = [],
    connectHosts = [],
    fontHosts = [],
    scriptNonce,
    reportUri,
  } = opts;

  const script = scriptNonce ? `'self' 'nonce-${scriptNonce}'` : `'self'`;
  const style = allowInlineStyles ? `'self' 'unsafe-inline'` : `'self'`;
  const img = [`'self'`, 'data:', 'https:', ...imgHosts].join(' ');
  const font = [`'self'`, 'https:', 'data:', ...fontHosts].join(' ');
  const connect = [`'self'`, ...connectHosts].join(' ');

  const parts = [
    `default-src 'self'`,
    `script-src ${script}`,
    `style-src ${style}`,
    `img-src ${img}`,
    `font-src ${font}`,
    `connect-src ${connect}`,
    `frame-ancestors 'none'`,   // clickjacking
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ];
  if (reportUri) parts.push(`report-uri ${reportUri}`);
  return parts.join('; ');
}

// ── Trusted Types ────────────────────────────────────────────────────────────

interface TrustedTypesAPI {
  createPolicy: (name: string, rules: {
    createHTML?: (s: string) => string;
    createScriptURL?: (s: string) => string;
    createScript?: (s: string) => string;
  }) => unknown;
}

/**
 * Register a Trusted Types policy named "tkx". Once enforced via CSP
 * (`require-trusted-types-for 'script'`), any `innerHTML =` assignment
 * outside the policy will throw — a hard wall against XSS.
 *
 * Safe to call everywhere: no-op when Trusted Types aren't supported.
 */
export function installTrustedTypes(): void {
  if (typeof window === 'undefined') return;
  const tt = (window as unknown as { trustedTypes?: TrustedTypesAPI }).trustedTypes;
  if (!tt) return;
  try {
    tt.createPolicy('tkx', {
      createHTML: sanitizeHTML,
      createScriptURL: (s) => sanitizeHref(s) ?? '',
      createScript: () => { throw new Error('TekiVex: inline script creation forbidden'); },
    });
  } catch {
    // Policy already exists — safe to ignore.
  }
}

// ── Clickjacking detection ───────────────────────────────────────────────────

/**
 * Returns true if the page is rendered inside an iframe of a different
 * origin — the classic clickjacking precondition.
 */
export function isFramed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.top !== window.self;
  } catch {
    // Cross-origin access threw → definitely framed.
    return true;
  }
}

/**
 * Install a frame-buster. If the page is embedded cross-origin, the
 * callback fires. Default behavior navigates the top window to `self`.
 */
export function installFrameBuster(onDetect?: () => void): void {
  if (typeof window === 'undefined') return;
  if (!isFramed()) return;
  if (onDetect) { onDetect(); return; }
  try {
    (window.top as Window).location.href = window.self.location.href;
  } catch {
    // Blocked by browser or sandbox — component overlays are the fallback.
  }
}

// ── Rate limiter ─────────────────────────────────────────────────────────────

export interface RateLimiter {
  /** Returns true if the action is allowed; false if throttled. */
  check(): boolean;
  reset(): void;
}

/**
 * Token-bucket rate limiter for client-side throttling of user-triggered
 * actions (form submits, file uploads). `n` tokens, refilling 1 every
 * `intervalMs`.
 */
export function createRateLimiter(n: number, intervalMs: number): RateLimiter {
  let tokens = n;
  let lastRefill = Date.now();
  return {
    check(): boolean {
      const now = Date.now();
      const elapsed = now - lastRefill;
      const refill = Math.floor(elapsed / intervalMs);
      if (refill > 0) {
        tokens = Math.min(n, tokens + refill);
        lastRefill = now;
      }
      if (tokens <= 0) return false;
      tokens -= 1;
      return true;
    },
    reset(): void {
      tokens = n;
      lastRefill = Date.now();
    },
  };
}

// ── Magic-byte MIME sniffer ──────────────────────────────────────────────────

/**
 * Detect the true MIME type of a File by reading its first bytes. Don't
 * trust `file.type` — attackers can rename a `.exe` to `.png`. This
 * catches the forgery.
 *
 * Returns null if the magic bytes don't match a known safe type.
 */
export async function sniffMimeType(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const b = (...bytes: number[]) => bytes.every((v, i) => head[i] === v);

  if (b(0x89, 0x50, 0x4e, 0x47)) return 'image/png';
  if (b(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (b(0x47, 0x49, 0x46, 0x38)) return 'image/gif';
  if (b(0x42, 0x4d)) return 'image/bmp';
  if (b(0x52, 0x49, 0x46, 0x46)
      && head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50)
    return 'image/webp';
  if (b(0x25, 0x50, 0x44, 0x46)) return 'application/pdf';
  if (b(0x50, 0x4b, 0x03, 0x04)) return 'application/zip';
  if (head[0] === 0x7b || head[0] === 0x5b) return 'application/json';
  // UTF-8 text heuristic: no NULs in first 12 bytes.
  if (![...head].includes(0)) return 'text/plain';
  return null;
}

// ── PII scrubber ─────────────────────────────────────────────────────────────

const PII_PATTERNS: Array<{ name: string; re: RegExp; repl: string }> = [
  { name: 'ssn',    re: /\b\d{3}-\d{2}-\d{4}\b/g, repl: '[redacted-ssn]' },
  { name: 'credit', re: /\b(?:\d[ -]*?){13,19}\b/g, repl: '[redacted-card]' },
  { name: 'email',  re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, repl: '[redacted-email]' },
  { name: 'phone',  re: /\b(\+?\d{1,3}[ -])?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}\b/g, repl: '[redacted-phone]' },
  { name: 'apikey', re: /\b(sk|pk|rk)-[A-Za-z0-9]{20,}\b/g, repl: '[redacted-key]' },
];

/**
 * Redact common PII (SSN, credit card, email, phone, API keys) from free-
 * form text before sending to LLMs or third-party services.
 */
export function scrubPII(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let s = raw;
  for (const { re, repl } of PII_PATTERNS) s = s.replace(re, repl);
  return s;
}

// ── Deep-freeze helper (immutable config) ────────────────────────────────────

export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    for (const key of Object.keys(obj as object)) {
      deepFreeze((obj as Record<string, unknown>)[key]);
    }
    Object.freeze(obj);
  }
  return obj as Readonly<T>;
}

// ── Security Core aggregate ──────────────────────────────────────────────────

export const SecurityCore = Object.freeze({
  sanitizeString,
  sanitizeHref,
  sanitizeHTML,
  sanitizeCSS,
  sanitizeJSON,
  sanitizeUnicode,
  isSafeAttrName,
  buildTkxCSP,
  installTrustedTypes,
  isFramed,
  installFrameBuster,
  createRateLimiter,
  sniffMimeType,
  scrubPII,
  deepFreeze,
  /** Library identifier embedded in the bundle — do not remove. */
  __brand: 'TekiVex SecurityCore v2.6.0 © 007krcs',
});

export const Shield = {
  sanitize: sanitizeString,
  sanitizeProps,
  validateProps,
  createCSP,
  hasPermission,
  audit,
  getAuditLog,
  verifyAuditIntegrity,
};
