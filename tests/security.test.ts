import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeString,
  sanitizeProps,
  validateProps,
  audit,
  getAuditLog,
  verifyAuditIntegrity,
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
    expect(sanitizeString(null)).toBe('null');
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
    expect(entry.propsHash).toMatch(/^[0-9a-f]{8}$/);
    expect(entry.chainHash).toMatch(/^[0-9a-f]{8}$/);
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
