import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeString,
  sanitizeProps,
  validateProps,
  audit,
  getAuditLog,
  verifyAuditIntegrity,
  sanitizeHref,
  sanitizeHTML,
  sanitizeCSS,
  sanitizeJSON,
  sanitizeUnicode,
  isSafeAttrName,
  buildTkxCSP,
  isFramed,
  createRateLimiter,
  sniffMimeType,
  scrubPII,
  deepFreeze,
  SecurityCore,
} from '../src/engine/security';

describe('sanitizeString', () => {
  it('escapes <', () => expect(sanitizeString('<')).toBe('&lt;'));
  it('escapes >', () => expect(sanitizeString('>')).toBe('&gt;'));
  it('escapes &', () => expect(sanitizeString('&')).toBe('&amp;'));
  it("escapes '", () => expect(sanitizeString("'")).toBe('&#39;'));
  it('escapes "', () => expect(sanitizeString('"')).toBe('&quot;'));

  it('escapes a complete XSS vector', () => {
    const input = '<script>alert("XSS")</script>';
    const result = sanitizeString(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('leaves safe strings untouched', () => {
    expect(sanitizeString('Hello World')).toBe('Hello World');
  });

  it('coerces non-string input to string then sanitizes', () => {
    expect(sanitizeString(42)).toBe('42');
    expect(sanitizeString(0)).toBe('0');
    expect(sanitizeString(true)).toBe('true');
  });

  // Regression: passing an optional prop that's null/undefined to a
  // component that does sanitizeString(prop) used to render the literal
  // word "undefined" / "null" in the UI (visible above the search box,
  // labels, hints, captions, etc.). The sanitizer now treats both as the
  // empty string so the surrounding JSX renders nothing.
  it('returns empty string for null', () => {
    expect(sanitizeString(null)).toBe('');
  });
  it('returns empty string for undefined', () => {
    expect(sanitizeString(undefined)).toBe('');
  });
  it('does not leak the word "undefined" anywhere', () => {
    expect(sanitizeString(undefined)).not.toContain('undefined');
    expect(sanitizeString(null)).not.toContain('null');
  });
});

describe('sanitizeProps', () => {
  it('sanitizes string values in a flat object', () => {
    const result = sanitizeProps({ label: '<b>Bold</b>', count: 5 });
    expect(result.label).toBe('&lt;b&gt;Bold&lt;/b&gt;');
    expect(result.count).toBe(5);
  });

  it('recursively sanitizes nested objects', () => {
    const result = sanitizeProps({ nested: { value: '<script>' } });
    expect((result.nested as { value: string }).value).toBe('&lt;script&gt;');
  });

  it('sanitizes string values in arrays', () => {
    const result = sanitizeProps({ items: ['<a>', 'safe'] });
    expect((result.items as string[])[0]).toBe('&lt;a&gt;');
    expect((result.items as string[])[1]).toBe('safe');
  });

  it('preserves non-string, non-object values', () => {
    const fn = () => {};
    const result = sanitizeProps({ fn, num: 42, bool: true });
    expect(result.fn).toBe(fn);
    expect(result.num).toBe(42);
    expect(result.bool).toBe(true);
  });
});

describe('validateProps', () => {
  it('passes when required string prop is present', () => {
    const result = validateProps({ label: 'hello' }, { label: { type: 'string', required: true } });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when required prop is missing', () => {
    const result = validateProps({}, { label: { type: 'string', required: true } });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("'label' is required");
  });

  it('fails when number is below min', () => {
    const result = validateProps({ value: -1 }, { value: { type: 'number', min: 0 } });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('>= 0');
  });

  it('fails when number exceeds max', () => {
    const result = validateProps({ value: 101 }, { value: { type: 'number', max: 100 } });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('<= 100');
  });

  it('fails when string does not match pattern', () => {
    const result = validateProps(
      { hex: 'zzz' },
      { hex: { type: 'string', pattern: /^#[0-9a-f]{6}$/i } },
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("'hex' does not match pattern");
  });

  it('fails when wrong type is provided', () => {
    const result = validateProps({ count: 'hello' }, { count: { type: 'number' } });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('type number');
  });
});

describe('Audit Trail', () => {
  it('creates an audit entry with component and action', () => {
    const entry = audit('render', 'TkxButton', { variant: 'solid' });
    expect(entry.component).toBe('TkxButton');
    expect(entry.action).toBe('render');
    // SHA-256 — 64 lowercase hex chars
    expect(entry.propsHash).toMatch(/^[0-9a-f]{64}$/);
    expect(entry.chainHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('verifyAuditIntegrity returns true for unmodified trail', () => {
    audit('render', 'TkxCard');
    expect(verifyAuditIntegrity()).toBe(true);
  });

  it('getAuditLog filters by component', () => {
    audit('click', 'TkxToggle');
    const logs = getAuditLog({ component: 'TkxToggle' });
    expect(logs.every((e) => e.component === 'TkxToggle')).toBe(true);
  });

  it('getAuditLog limits results', () => {
    audit('render', 'TkxBadge');
    audit('render', 'TkxBadge');
    const logs = getAuditLog({ limit: 1 });
    expect(logs).toHaveLength(1);
  });
});

// ── SecurityCore v2.6 ────────────────────────────────────────────────────────

describe('sanitizeHref', () => {
  it('allows https', () => expect(sanitizeHref('https://example.com')).toBe('https://example.com'));
  it('allows http', () => expect(sanitizeHref('http://example.com')).toBe('http://example.com'));
  it('allows mailto', () => expect(sanitizeHref('mailto:a@b.co')).toBe('mailto:a@b.co'));
  it('allows relative', () => expect(sanitizeHref('/path')).toBe('/path'));
  it('allows hash', () => expect(sanitizeHref('#x')).toBe('#x'));
  it('blocks javascript:', () => expect(sanitizeHref('javascript:alert(1)')).toBeNull());
  it('blocks JAVASCRIPT: (case)', () => expect(sanitizeHref('JAVASCRIPT:x')).toBeNull());
  it('blocks vbscript:', () => expect(sanitizeHref('vbscript:msgbox')).toBeNull());
  it('blocks data:text/html', () => expect(sanitizeHref('data:text/html,<script>')).toBeNull());
  it('blocks non-string', () => expect(sanitizeHref(null)).toBeNull());
  it('strips control chars', () => expect(sanitizeHref('java\x00script:x')).toBeNull());
});

describe('sanitizeHTML', () => {
  it('strips <script>', () => {
    const out = sanitizeHTML('<p>ok</p><script>alert(1)</script>');
    expect(out).not.toMatch(/script/i);
    expect(out).toMatch(/ok/);
  });
  it('strips onclick attribute', () => {
    const out = sanitizeHTML('<p onclick="x">hi</p>');
    expect(out).not.toMatch(/onclick/);
  });
  it('strips javascript: in href', () => {
    const out = sanitizeHTML('<a href="javascript:1">x</a>');
    expect(out).not.toMatch(/javascript/i);
  });
  it('allows safe tags', () => {
    const out = sanitizeHTML('<p><strong>bold</strong></p>');
    expect(out).toMatch(/<strong>/);
  });
  it('strips <iframe>', () => expect(sanitizeHTML('<iframe src=x>')).not.toMatch(/iframe/));
});

describe('sanitizeCSS', () => {
  it('allows simple color', () => expect(sanitizeCSS('color: red')).toMatch(/red/));
  it('strips javascript:', () => expect(sanitizeCSS('background: url(javascript:1)')).not.toMatch(/javascript/i));
  it('strips expression()', () => expect(sanitizeCSS('x: expression(alert(1))')).not.toMatch(/expression/i));
  it('strips @import', () => expect(sanitizeCSS('@import "x"')).not.toMatch(/@import/i));
});

describe('sanitizeJSON', () => {
  it('parses valid json', () => expect(sanitizeJSON<{ a: number }>('{"a":1}')).toEqual({ a: 1 }));
  it('returns null on invalid', () => expect(sanitizeJSON('{bad')).toBeNull());
  it('scrubs __proto__', () => {
    const out = sanitizeJSON<Record<string, unknown>>('{"__proto__":{"x":1}}');
    expect(out).not.toHaveProperty('__proto__');
  });
  it('scrubs constructor', () => {
    const out = sanitizeJSON<Record<string, unknown>>('{"constructor":{"x":1}}');
    expect(out && Object.getOwnPropertyNames(out)).not.toContain('constructor');
  });
});

describe('sanitizeUnicode', () => {
  it('strips zero-width space', () => expect(sanitizeUnicode('a\u200Bb')).toBe('ab'));
  it('strips zero-width non-joiner', () => expect(sanitizeUnicode('a\u200Cb')).toBe('ab'));
  it('strips bidi override', () => expect(sanitizeUnicode('a\u202Eb')).toBe('ab'));
  it('strips LTR override', () => expect(sanitizeUnicode('a\u202Db')).toBe('ab'));
  it('preserves regular text', () => expect(sanitizeUnicode('hello world')).toBe('hello world'));
});

describe('isSafeAttrName', () => {
  it('accepts data-x', () => expect(isSafeAttrName('data-foo')).toBe(true));
  it('accepts aria-label', () => expect(isSafeAttrName('aria-label')).toBe(true));
  it('accepts className', () => expect(isSafeAttrName('className')).toBe(true));
  it('rejects clobber name "submit"', () => expect(isSafeAttrName('submit')).toBe(false));
  it('rejects clobber name "cookie"', () => expect(isSafeAttrName('cookie')).toBe(false));
  it('rejects non-string', () => expect(isSafeAttrName(42)).toBe(false));
  it('rejects control chars', () => expect(isSafeAttrName('x\x00y')).toBe(false));
});

describe('buildTkxCSP', () => {
  it('contains default-src self', () => expect(buildTkxCSP()).toMatch(/default-src 'self'/));
  it('contains frame-ancestors none', () => expect(buildTkxCSP()).toMatch(/frame-ancestors 'none'/));
  it('contains object-src none', () => expect(buildTkxCSP()).toMatch(/object-src 'none'/));
  it('extends with extra hosts', () => {
    const out = buildTkxCSP({ imgHosts: ['https://cdn.x.com'] });
    expect(out).toMatch(/cdn\.x\.com/);
  });
});

describe('isFramed', () => {
  it('returns false in jsdom (no frame)', () => expect(isFramed()).toBe(false));
});

describe('createRateLimiter', () => {
  it('allows up to N calls', () => {
    const rl = createRateLimiter(3, 1000);
    expect(rl.check()).toBe(true);
    expect(rl.check()).toBe(true);
    expect(rl.check()).toBe(true);
    expect(rl.check()).toBe(false);
  });
  it('reset() refills tokens', () => {
    const rl = createRateLimiter(1, 1000);
    rl.check();
    expect(rl.check()).toBe(false);
    rl.reset();
    expect(rl.check()).toBe(true);
  });
});

describe('sniffMimeType', () => {
  it('detects PNG magic bytes', async () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const file = new File([bytes], 'x.bin');
    expect(await sniffMimeType(file)).toBe('image/png');
  });
  it('detects JPEG magic bytes', async () => {
    const bytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
    const file = new File([bytes], 'x.bin');
    expect(await sniffMimeType(file)).toBe('image/jpeg');
  });
  it('returns null on unknown', async () => {
    const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    const file = new File([bytes], 'x.bin');
    expect(await sniffMimeType(file)).toBeNull();
  });
});

describe('scrubPII', () => {
  it('scrubs emails', () => expect(scrubPII('mail: a@b.co')).not.toMatch(/a@b\.co/));
  it('scrubs SSN', () => expect(scrubPII('ssn 123-45-6789')).not.toMatch(/123-45-6789/));
  it('preserves safe text', () => expect(scrubPII('hello')).toMatch(/hello/));
});

describe('deepFreeze', () => {
  it('freezes nested objects', () => {
    const o: { a: { b: number } } = deepFreeze({ a: { b: 1 } });
    expect(Object.isFrozen(o)).toBe(true);
    expect(Object.isFrozen(o.a)).toBe(true);
  });
});

describe('SecurityCore aggregate', () => {
  it('is frozen', () => expect(Object.isFrozen(SecurityCore)).toBe(true));
  it('exposes core functions', () => {
    expect(typeof SecurityCore.sanitizeString).toBe('function');
    expect(typeof SecurityCore.sanitizeHTML).toBe('function');
    expect(typeof SecurityCore.buildTkxCSP).toBe('function');
  });
});
