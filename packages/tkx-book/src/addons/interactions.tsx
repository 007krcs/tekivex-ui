// ─────────────────────────────────────────────────────────────────────────────
// Interactions addon — record + replay user gestures.
//
// During recording, we listen on the story container for pointer + key
// events and store them with relative timestamps. Replay re-emits them
// against the same selectors at the same delays.
//
// Selector strategy: prefer data-testid → aria-label → role+name → fallback
// to a stable nth-of-type chain. This is the same heuristic Playwright /
// Testing Library use.
//
// What this is good for:
//   - "I clicked twice and got into a bad state — let me show you exactly what I did"
//   - Reproducing a flow during demos
//   - Quick smoke-test scripts checked into version control
//
// What it is NOT:
//   - A replacement for Playwright. CI-grade test recording is at
//     tests/visual/ + tests/. This is for inspection.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Addon, AddonContext } from './registry';

interface RecordedEvent {
  type: 'click' | 'input' | 'keydown' | 'pointer';
  /** Timestamp relative to recording start, in ms. */
  t: number;
  /** Stable selector for the target. */
  selector: string;
  /** Optional value (input change). */
  value?: string;
  /** Optional key (keydown). */
  key?: string;
}

function bestSelector(el: HTMLElement, root: HTMLElement): string {
  if (el.dataset.testid) return `[data-testid="${el.dataset.testid}"]`;
  const aria = el.getAttribute('aria-label');
  if (aria) return `[aria-label="${CSS.escape(aria)}"]`;
  const role = el.getAttribute('role');
  if (role && el.textContent) {
    return `[role="${role}"]:has-text(${CSS.escape(el.textContent.trim().slice(0, 30))})`;
  }
  // Build an nth-of-type chain up to root.
  const path: string[] = [];
  let cur: HTMLElement | null = el;
  while (cur && cur !== root) {
    const parent = cur.parentElement;
    if (!parent) break;
    const tag = cur.tagName.toLowerCase();
    const sameTag = Array.from(parent.children).filter((c) => c.tagName === cur!.tagName);
    const idx = sameTag.indexOf(cur) + 1;
    path.unshift(`${tag}:nth-of-type(${idx})`);
    cur = parent;
  }
  return path.join(' > ');
}

function findBySelector(root: HTMLElement, selector: string): HTMLElement | null {
  // Note: :has-text is a Playwright-ism — the browser doesn't support it.
  // We strip it and fall back to text matching manually.
  const hasTextMatch = selector.match(/^(.+?):has-text\((.+?)\)$/);
  if (hasTextMatch) {
    const [, base, text] = hasTextMatch;
    const candidates = Array.from(root.querySelectorAll<HTMLElement>(base));
    return candidates.find((c) => c.textContent?.includes(text.replace(/\\(.)/g, '$1'))) ?? null;
  }
  try {
    return root.querySelector<HTMLElement>(selector);
  } catch {
    return null;
  }
}

function InteractionsPanel({ containerRef, slug }: AddonContext) {
  const [recording, setRecording] = useState(false);
  const [events, setEvents] = useState<RecordedEvent[]>([]);
  const [replaying, setReplaying] = useState(false);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!recording) return;
    const root = containerRef.current;
    if (!root) return;
    startRef.current = Date.now();
    const log = (e: RecordedEvent) => setEvents((prev) => [...prev, e]);

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      log({
        type: 'click',
        t: Date.now() - startRef.current,
        selector: bestSelector(t, root),
      });
    };
    const onInput = (e: Event) => {
      const t = e.target as HTMLInputElement;
      log({
        type: 'input',
        t: Date.now() - startRef.current,
        selector: bestSelector(t, root),
        value: t.value,
      });
    };
    const onKey = (e: KeyboardEvent) => {
      log({
        type: 'keydown',
        t: Date.now() - startRef.current,
        selector: bestSelector(e.target as HTMLElement, root),
        key: e.key,
      });
    };

    root.addEventListener('click', onClick, true);
    root.addEventListener('input', onInput, true);
    root.addEventListener('keydown', onKey, true);
    return () => {
      root.removeEventListener('click', onClick, true);
      root.removeEventListener('input', onInput, true);
      root.removeEventListener('keydown', onKey, true);
    };
  }, [recording, containerRef]);

  const onClear = () => setEvents([]);
  const onCopy = () => {
    navigator.clipboard?.writeText(JSON.stringify(events, null, 2));
  };
  const onReplay = async () => {
    if (!containerRef.current) return;
    setReplaying(true);
    try {
      let cursor = 0;
      for (const e of events) {
        const wait = e.t - cursor;
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
        cursor = e.t;
        const target = findBySelector(containerRef.current, e.selector);
        if (!target) {
          // eslint-disable-next-line no-console
          console.warn('[tkx-book/interactions] selector not found:', e.selector);
          continue;
        }
        if (e.type === 'click') {
          target.click();
        } else if (e.type === 'input') {
          (target as HTMLInputElement).value = e.value ?? '';
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (e.type === 'keydown') {
          target.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, bubbles: true }));
        }
      }
    } finally {
      setReplaying(false);
    }
  };

  const wrap: CSSProperties = { padding: 16, height: '100%', overflow: 'auto' };
  const btn = (active = false): CSSProperties => ({
    padding: '6px 12px',
    border: `1px solid var(--tkx-${active ? 'danger' : 'primary'})`,
    borderRadius: 4,
    background: active ? 'var(--tkx-danger)' : 'transparent',
    color: active ? 'var(--tkx-bg)' : 'var(--tkx-primary)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  });

  return (
    <div style={wrap}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          style={btn(recording)}
          onClick={() => setRecording((r) => !r)}
        >
          {recording ? '⏹ Stop' : '⏺ Record'}
        </button>
        <button type="button" style={btn()} onClick={onReplay} disabled={replaying || events.length === 0}>
          {replaying ? 'Replaying…' : '▶ Replay'}
        </button>
        <button type="button" style={btn()} onClick={onClear} disabled={events.length === 0}>
          Clear
        </button>
        <button type="button" style={btn()} onClick={onCopy} disabled={events.length === 0}>
          Copy JSON
        </button>
      </div>

      {recording && (
        <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--tkx-warning)' }}>
          ● Recording — interact with the canvas above. Click stop when done.
        </div>
      )}

      {events.length === 0 ? (
        <div style={{ color: 'var(--tkx-textMuted)', fontSize: 13 }}>
          No events captured. Hit Record and interact with the canvas to begin.
        </div>
      ) : (
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--tkx-border)', color: 'var(--tkx-textMuted)' }}>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>t (ms)</th>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>type</th>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>target</th>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>value/key</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--tkx-border)' }}>
                <td style={{ padding: '4px 0', fontVariantNumeric: 'tabular-nums' }}>{e.t}</td>
                <td style={{ padding: '4px 0' }}>{e.type}</td>
                <td style={{ padding: '4px 0', fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
                  {e.selector}
                </td>
                <td style={{ padding: '4px 0', fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
                  {e.value ?? e.key ?? ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const interactionsAddon: Addon = {
  id: 'interactions',
  title: 'Interactions',
  render: (ctx) => <InteractionsPanel {...ctx} />,
};
