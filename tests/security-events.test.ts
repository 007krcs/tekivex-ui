import { describe, it, expect, beforeEach } from 'vitest';
import {
  onSecurityEvent,
  getRecentSecurityEvents,
  clearSecurityEvents,
  emitSecurityEvent,
  sanitizeUnicode,
  sanitizeString,
  scrubPII,
  audit,
  createRateLimiter,
  sniffMimeType,
} from '../src/engine/security';

describe('security event stream', () => {
  beforeEach(() => clearSecurityEvents());

  it('emits + delivers to subscribers, and unsubscribe stops delivery', () => {
    const seen: string[] = [];
    const unsub = onSecurityEvent((e) => seen.push(e.type));
    emitSecurityEvent('xss-sanitized', 'test', 'warning');
    expect(seen).toEqual(['xss-sanitized']);
    unsub();
    emitSecurityEvent('audit', 'test2');
    expect(seen).toEqual(['xss-sanitized']); // no new delivery after unsub
  });

  it('records into the bounded ring buffer', () => {
    emitSecurityEvent('pii-redacted', 'a', 'warning');
    emitSecurityEvent('audit', 'b');
    const recent = getRecentSecurityEvents();
    expect(recent.length).toBe(2);
    expect(recent.map((e) => e.type)).toEqual(['pii-redacted', 'audit']);
  });

  it('a throwing listener never breaks emission', () => {
    onSecurityEvent(() => { throw new Error('boom'); });
    expect(() => emitSecurityEvent('audit', 'still works')).not.toThrow();
    expect(getRecentSecurityEvents().length).toBe(1);
  });

  // ── Kernel emission wiring ─────────────────────────────────────────────────

  it('sanitizeUnicode emits a critical Trojan-Source event when it strips chars', () => {
    const seen: Array<{ type: string; severity: string }> = [];
    onSecurityEvent((e) => seen.push({ type: e.type, severity: e.severity }));
    // U+202E is RIGHT-TO-LEFT OVERRIDE — the Trojan-Source vector.
    const out = sanitizeUnicode('safe‮evil');
    expect(out).toBe('safeevil');
    expect(seen).toContainEqual({ type: 'unicode-stripped', severity: 'critical' });
  });

  it('sanitizeUnicode does NOT emit for clean input', () => {
    const seen: string[] = [];
    onSecurityEvent((e) => seen.push(e.type));
    sanitizeUnicode('perfectly normal text');
    expect(seen).toEqual([]);
  });

  it('scrubPII emits a pii-redacted event with the redaction count', () => {
    const events: any[] = [];
    onSecurityEvent((e) => events.push(e));
    scrubPII('email me at jane@example.com or 4111 1111 1111 1111');
    const piiEvent = events.find((e) => e.type === 'pii-redacted');
    expect(piiEvent).toBeDefined();
    expect(piiEvent.detail.redactions).toBeGreaterThanOrEqual(1);
  });

  it('scrubPII does NOT emit when there is no PII', () => {
    const seen: string[] = [];
    onSecurityEvent((e) => seen.push(e.type));
    scrubPII('the quick brown fox');
    expect(seen).toEqual([]);
  });

  it('sanitizeString emits a warning when it escapes HTML-sensitive chars', () => {
    const events: any[] = [];
    onSecurityEvent((e) => events.push(e));
    sanitizeString('<img src=x onerror=alert(1)>');
    const evt = events.find((e) => e.type === 'xss-sanitized');
    expect(evt).toBeDefined();
    expect(evt.severity).toBe('warning');
    expect(evt.detail.escapes).toBeGreaterThanOrEqual(1);
  });

  it('sanitizeString does NOT emit for plain text', () => {
    const seen: string[] = [];
    onSecurityEvent((e) => seen.push(e.type));
    sanitizeString('just a normal label');
    expect(seen).toEqual([]);
  });

  it('createRateLimiter emits rate-limited once the bucket is exhausted', () => {
    const events: any[] = [];
    onSecurityEvent((e) => events.push(e));
    const limiter = createRateLimiter(2, 60_000);
    expect(limiter.check()).toBe(true);
    expect(limiter.check()).toBe(true);
    expect(limiter.check()).toBe(false); // exhausted
    const evt = events.find((e) => e.type === 'rate-limited');
    expect(evt).toBeDefined();
    expect(evt.severity).toBe('warning');
  });

  it('sniffMimeType emits mime-rejected when magic bytes match nothing', async () => {
    const events: any[] = [];
    onSecurityEvent((e) => events.push(e));
    // A NUL byte up front → not text, not any known magic signature.
    const file = new File([new Uint8Array([0x00, 0x01, 0x02, 0x03])], 'evil.png', {
      type: 'image/png',
    });
    const result = await sniffMimeType(file);
    expect(result).toBeNull();
    const evt = events.find((e) => e.type === 'mime-rejected');
    expect(evt).toBeDefined();
    expect(evt.severity).toBe('critical');
  });

  it('audit() emits an info security event mirroring the entry', () => {
    const events: any[] = [];
    onSecurityEvent((e) => events.push(e));
    audit('login', 'AuthForm', { userId: 'u1' });
    const auditEvt = events.find((e) => e.type === 'audit');
    expect(auditEvt).toBeDefined();
    expect(auditEvt.severity).toBe('info');
    expect(auditEvt.message).toContain('AuthForm');
  });
});
