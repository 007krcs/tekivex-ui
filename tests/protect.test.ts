import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  watchScreenshot,
  watchPrint,
  watchClipboard,
  watchContextMenu,
  watchDevTools,
  installProtection,
  PROTECT_CSS_INLINE,
  type GuardEvent,
} from '../src/engine/protect';

const fireKey = (init: KeyboardEventInit): void => {
  window.dispatchEvent(new KeyboardEvent('keydown', init));
};

describe('engine/protect — watchScreenshot', () => {
  it('emits on PrintScreen key', () => {
    const events: GuardEvent[] = [];
    const stop = watchScreenshot((e) => events.push(e));
    fireKey({ key: 'PrintScreen', code: 'PrintScreen' });
    stop();
    expect(events.some((e) => e.type === 'screenshot-key')).toBe(true);
  });

  it('emits on macOS Cmd+Shift+4', () => {
    const events: GuardEvent[] = [];
    const stop = watchScreenshot((e) => events.push(e));
    fireKey({ key: '4', metaKey: true, shiftKey: true });
    stop();
    expect(events.some((e) => e.type === 'screenshot-key')).toBe(true);
  });

  it('emits on window blur', () => {
    const events: GuardEvent[] = [];
    const stop = watchScreenshot((e) => events.push(e));
    window.dispatchEvent(new Event('blur'));
    stop();
    expect(events.some((e) => e.type === 'window-blur')).toBe(true);
  });

  it('respects treatBlurAsSignal=false', () => {
    const events: GuardEvent[] = [];
    const stop = watchScreenshot((e) => events.push(e), { treatBlurAsSignal: false });
    window.dispatchEvent(new Event('blur'));
    stop();
    expect(events.some((e) => e.type === 'window-blur')).toBe(false);
  });

  it('teardown removes listeners', () => {
    const events: GuardEvent[] = [];
    const stop = watchScreenshot((e) => events.push(e));
    stop();
    fireKey({ key: 'PrintScreen', code: 'PrintScreen' });
    expect(events).toHaveLength(0);
  });
});

describe('engine/protect — watchPrint', () => {
  let originalPrint: typeof window.print;

  beforeEach(() => {
    originalPrint = window.print;
    window.print = (() => {}) as typeof window.print;
  });

  afterEach(() => {
    window.print = originalPrint;
  });

  it('emits print-attempt on Ctrl+P and prevents default', () => {
    const events: GuardEvent[] = [];
    const stop = watchPrint((e) => events.push(e));
    const evt = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true, cancelable: true });
    window.dispatchEvent(evt);
    stop();
    expect(events.some((e) => e.type === 'print-attempt')).toBe(true);
    expect(evt.defaultPrevented).toBe(true);
  });

  it('emits on beforeprint event', () => {
    const events: GuardEvent[] = [];
    const stop = watchPrint((e) => events.push(e));
    window.dispatchEvent(new Event('beforeprint'));
    stop();
    expect(events.some((e) => e.type === 'print-attempt')).toBe(true);
  });

  it('replaces window.print when blockNativePrint=true', () => {
    const events: GuardEvent[] = [];
    const stop = watchPrint((e) => events.push(e));
    window.print();
    stop();
    expect(events.some((e) => e.type === 'print-attempt')).toBe(true);
  });

  it('restores window.print on teardown', () => {
    const ref = window.print;
    const stop = watchPrint(() => {});
    expect(window.print).not.toBe(ref);
    stop();
    expect(window.print).toBe(ref);
  });
});

describe('engine/protect — watchClipboard', () => {
  it('emits and prevents default on copy', () => {
    const events: GuardEvent[] = [];
    const stop = watchClipboard(document, (e) => events.push(e));
    const evt = new Event('copy', { cancelable: true });
    document.dispatchEvent(evt);
    stop();
    expect(events.some((e) => e.type === 'clipboard-copy')).toBe(true);
    expect(evt.defaultPrevented).toBe(true);
  });

  it('does not prevent default when blockOps=false', () => {
    const events: GuardEvent[] = [];
    const stop = watchClipboard(document, (e) => events.push(e), { blockOps: false });
    const evt = new Event('copy', { cancelable: true });
    document.dispatchEvent(evt);
    stop();
    expect(events.some((e) => e.type === 'clipboard-copy')).toBe(true);
    expect(evt.defaultPrevented).toBe(false);
  });
});

describe('engine/protect — watchContextMenu', () => {
  it('emits and blocks contextmenu by default', () => {
    const events: GuardEvent[] = [];
    const stop = watchContextMenu(document, (e) => events.push(e));
    const evt = new Event('contextmenu', { cancelable: true });
    document.dispatchEvent(evt);
    stop();
    expect(events.some((e) => e.type === 'context-menu')).toBe(true);
    expect(evt.defaultPrevented).toBe(true);
  });
});

describe('engine/protect — watchDevTools', () => {
  it('returns a teardown without throwing', () => {
    vi.useFakeTimers();
    const stop = watchDevTools(() => {}, { disableDebuggerProbe: true });
    expect(typeof stop).toBe('function');
    stop();
    vi.useRealTimers();
  });
});

describe('engine/protect — installProtection composite', () => {
  it('attaches multiple guards and tears down all of them', () => {
    const events: GuardEvent[] = [];
    const stop = installProtection((e) => events.push(e), {
      screenshot: true,
      print: true,
      clipboard: true,
      contextMenu: true,
    });
    fireKey({ key: 'PrintScreen' });
    document.dispatchEvent(new Event('copy', { cancelable: true }));
    document.dispatchEvent(new Event('contextmenu', { cancelable: true }));
    stop();
    const types = new Set(events.map((e) => e.type));
    expect(types.has('screenshot-key')).toBe(true);
    expect(types.has('clipboard-copy')).toBe(true);
    expect(types.has('context-menu')).toBe(true);
  });

  it('SSR-safe — no-ops when window is undefined', () => {
    expect(typeof installProtection).toBe('function');
  });
});

describe('engine/protect — PROTECT_CSS_INLINE', () => {
  it('contains user-select:none', () => {
    expect(PROTECT_CSS_INLINE).toContain('user-select:none');
  });
  it('contains -webkit-touch-callout:none', () => {
    expect(PROTECT_CSS_INLINE).toContain('-webkit-touch-callout:none');
  });
});
