// ── Security Shield ──────────────────────────────────────────────────────────
// XSS prevention, CSP, prop validation, immutable audit trail

import { fnv1aHash } from './quantum';

// ── XSS Sanitization ─────────────────────────────────────────────────────────

const HTML_ENTITIES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&#39;',
  '"': '&quot;',
};

export function sanitizeString(input: unknown): string {
  return String(input).replace(/[<>&'"]/g, (char) => HTML_ENTITIES[char] ?? char);
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
