// ── Security Shield ──────────────────────────────────────────────────────────
// XSS prevention, CSP, prop validation, tamper-evident audit trail

import { fnv1aHash } from './quantum';

// ── Sync SHA-256 (FIPS 180-4) ────────────────────────────────────────────────
// Pure-JS SHA-256 so the audit chain stays synchronous (`crypto.subtle.digest`
// is async only). ~80 LOC, zero deps, deterministic. Used for tamper-evident
// hash-chaining of audit entries.

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

/**
 * SHA-256 of a string. Returns lowercase hex (64 chars).
 * FIPS 180-4 conformant. Used for the tamper-evident audit chain.
 */
export function sha256Hex(input: string): string {
  // UTF-8 encode
  const utf8: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let c = input.charCodeAt(i);
    if (c < 0x80) utf8.push(c);
    else if (c < 0x800) utf8.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c < 0xd800 || c >= 0xe000) utf8.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    else {
      i++;
      c = 0x10000 + (((c & 0x3ff) << 10) | (input.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }

  const bitLen = utf8.length * 8;
  utf8.push(0x80);
  while ((utf8.length % 64) !== 56) utf8.push(0);
  // 64-bit big-endian length (we cap at 2^32 bits — fine for audit entries)
  for (let i = 0; i < 4; i++) utf8.push(0);
  utf8.push((bitLen >>> 24) & 0xff, (bitLen >>> 16) & 0xff, (bitLen >>> 8) & 0xff, bitLen & 0xff);

  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const W = new Uint32Array(64);

  for (let chunk = 0; chunk < utf8.length; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = (utf8[chunk + i * 4] << 24) | (utf8[chunk + i * 4 + 1] << 16) | (utf8[chunk + i * 4 + 2] << 8) | utf8[chunk + i * 4 + 3];
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA256_K[i] + W[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + mj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }

  let out = '';
  for (let i = 0; i < 8; i++) out += (H[i] >>> 0).toString(16).padStart(8, '0');
  return out;
}

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
// ── Security event stream ────────────────────────────────────────────────────
// The kernel blocks XSS, Trojan-Source unicode, PII leaks, clickjacking, and
// rate-limit abuse — but silently. This pub/sub surfaces each defensive action
// as an observable event so a consumer can render a live security dashboard
// (see TkxSecurityDashboard / SecurityProvider) or forward events to a SIEM.
// Zero overhead when no listener is attached and nothing is blocked.

export type SecurityEventType =
  | 'xss-sanitized'
  | 'unicode-stripped'
  | 'pii-redacted'
  | 'audit'
  | 'clickjacking-detected'
  | 'rate-limited'
  | 'mime-rejected';

export type SecuritySeverity = 'info' | 'warning' | 'critical';

export interface SecurityEvent {
  readonly id: string;
  readonly type: SecurityEventType;
  readonly timestamp: number;
  readonly severity: SecuritySeverity;
  readonly message: string;
  readonly detail?: Readonly<Record<string, unknown>>;
}

type SecurityEventListener = (evt: SecurityEvent) => void;
const securityListeners = new Set<SecurityEventListener>();
const recentSecurityEvents: SecurityEvent[] = [];
const MAX_RECENT_EVENTS = 500;
let securityEventSeq = 0;

/** Subscribe to security events. Returns an unsubscribe function. */
export function onSecurityEvent(listener: SecurityEventListener): () => void {
  securityListeners.add(listener);
  return () => {
    securityListeners.delete(listener);
  };
}

/** Snapshot of the most recent security events (bounded ring buffer of 500). */
export function getRecentSecurityEvents(): readonly SecurityEvent[] {
  return recentSecurityEvents.slice();
}

/** Clear the in-memory event buffer (does NOT affect the SHA-256 audit trail). */
export function clearSecurityEvents(): void {
  recentSecurityEvents.length = 0;
}

/** Emit a security event. Public so consumers can record their own signals. */
export function emitSecurityEvent(
  type: SecurityEventType,
  message: string,
  severity: SecuritySeverity = 'info',
  detail?: Record<string, unknown>,
): SecurityEvent {
  const evt: SecurityEvent = Object.freeze({
    id: `se_${++securityEventSeq}`,
    type,
    timestamp: Date.now(),
    severity,
    message,
    detail: detail ? Object.freeze({ ...detail }) : undefined,
  });
  recentSecurityEvents.push(evt);
  if (recentSecurityEvents.length > MAX_RECENT_EVENTS) recentSecurityEvents.shift();
  for (const listener of securityListeners) {
    // A listener throwing must never break the primitive that emitted.
    try { listener(evt); } catch { /* swallow */ }
  }
  return evt;
}

export function sanitizeString(input: unknown): string {
  // Treat null/undefined as the empty string. Without this guard,
  // String(undefined) returns the literal "undefined", which silently
  // leaks into every component that calls sanitizeString(optionalProp)
  // — labels, hints, captions, search placeholders all start showing
  // the word "undefined" when the prop is absent.
  if (input == null) return "";
  let s = String(input);
  // Strip NUL + disallowed C0 controls (keep \t \n \r).
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  let escapes = 0;
  const out = s.replace(/[<>&'"`]/g, (char) => { escapes++; return HTML_ENTITIES[char] ?? char; });
  if (escapes > 0) {
    emitSecurityEvent(
      'xss-sanitized',
      `Escaped ${escapes} HTML-sensitive character${escapes === 1 ? '' : 's'} before render`,
      'warning',
      { escapes },
    );
  }
  return out;
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
  const propsHash = sha256Hex(JSON.stringify(meta ?? {}));
  const prevChainHash = auditTrail.length > 0
    ? auditTrail[auditTrail.length - 1].chainHash
    : '0000000000000000000000000000000000000000000000000000000000000000';
  const chainHash = sha256Hex(prevChainHash + propsHash + component + action);

  const entry: AuditEntry = Object.freeze({
    timestamp: Date.now(),
    component,
    action,
    propsHash,
    chainHash,
  });

  auditTrail = Object.freeze([...auditTrail, entry]);
  emitSecurityEvent(
    'audit',
    `${component}: ${action}`,
    'info',
    { component, action, chainHash: entry.chainHash },
  );
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
  let prevChainHash = '0000000000000000000000000000000000000000000000000000000000000000';

  for (const entry of auditTrail) {
    const expectedChain = sha256Hex(prevChainHash + entry.propsHash + entry.component + entry.action);
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
  const out = raw.replace(
    /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD]/g,
    '',
  );
  if (out.length !== raw.length) {
    // Bidi / zero-width chars are the Trojan-Source attack vector (CVE-2021-42574).
    emitSecurityEvent(
      'unicode-stripped',
      'Removed bidirectional / zero-width control characters (Trojan-Source vector)',
      'critical',
      { charsRemoved: raw.length - out.length },
    );
  }
  return out;
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
  emitSecurityEvent(
    'clickjacking-detected',
    'Page is embedded in a cross-origin frame — clickjacking precondition',
    'critical',
  );
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
      if (tokens <= 0) {
        emitSecurityEvent(
          'rate-limited',
          'Action throttled — token bucket exhausted',
          'warning',
          { capacity: n, intervalMs },
        );
        return false;
      }
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
  emitSecurityEvent(
    'mime-rejected',
    `File "${file.name}" rejected — magic bytes match no allow-listed type (claimed: ${file.type || 'unknown'})`,
    'critical',
    { name: file.name, claimedType: file.type },
  );
  return null;
}

// ── PII scrubber ─────────────────────────────────────────────────────────────

/**
 * Luhn (mod-10) check for credit-card numbers. Eliminates the false-positive
 * problem where any 13-19 digit sequence would be redacted as a card number.
 * Returns true if the digit string passes the Luhn checksum.
 */
function luhnValid(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (n < 0 || n > 9) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum > 0 && sum % 10 === 0;
}

const PII_PATTERNS: Array<{ name: string; re: RegExp; repl: string | ((m: string) => string) }> = [
  { name: 'ssn',    re: /\b\d{3}-\d{2}-\d{4}\b/g, repl: '[redacted-ssn]' },
  // Credit card — match candidate digit runs, then Luhn-validate before redacting.
  // Without Luhn this regex false-positives on any 13-19 digit sequence (order ids,
  // tracking numbers, timestamps).
  {
    name: 'credit',
    re: /\b(?:\d[ -]?){13,19}\b/g,
    repl: (m: string) => {
      const digits = m.replace(/[ -]/g, '');
      if (digits.length < 13 || digits.length > 19) return m;
      return luhnValid(digits) ? '[redacted-card]' : m;
    },
  },
  { name: 'email',  re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, repl: '[redacted-email]' },
  { name: 'phone',  re: /\b(\+?\d{1,3}[ -])?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}\b/g, repl: '[redacted-phone]' },
  { name: 'apikey', re: /\b(sk|pk|rk)-[A-Za-z0-9]{20,}\b/g, repl: '[redacted-key]' },
];

/**
 * Redact common PII (SSN, Luhn-valid credit cards, email, phone, API keys)
 * from free-form text before sending to LLMs or third-party services.
 *
 * Credit-card matching uses regex + Luhn (mod-10) so 13-19 digit sequences
 * that aren't real card numbers are not falsely redacted.
 */
export function scrubPII(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let s = raw;
  let redactions = 0;
  for (const { re, repl } of PII_PATTERNS) {
    s = typeof repl === 'function'
      ? s.replace(re, (m: string) => { redactions++; return (repl as (m: string) => string)(m); })
      : s.replace(re, (m: string) => { redactions++; return repl as string; });
  }
  if (redactions > 0) {
    emitSecurityEvent(
      'pii-redacted',
      `Redacted ${redactions} PII token${redactions === 1 ? '' : 's'} before the text left the trust boundary`,
      'warning',
      { redactions },
    );
  }
  return s;
}

/** Exported for testing. */
export { luhnValid };

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
