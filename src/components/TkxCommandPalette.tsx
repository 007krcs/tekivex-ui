'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxCommandPalette — Cmd-K palette
//
// Standard keyboard-first command launcher pattern (Linear, Raycast, GitHub).
//
//   <TkxCommandPalette
//     commands={[
//       { id: 'open-settings', title: 'Open settings', icon: '⚙️',
//         section: 'App', shortcut: ['Cmd', ','], onSelect: ... },
//       { id: 'search-docs',   title: 'Search docs',   subtitle: 'Find anything in the docs',
//         section: 'Help',     onSelect: ... },
//     ]}
//     hotkey={{ ctrl: true, key: 'k' }}      // Cmd-K on Mac, Ctrl-K elsewhere
//   />
//
// What it gives you:
//   - Modal overlay rendered into document.body via a portal (never traps
//     focus inside a clipped ancestor)
//   - Built-in fuzzy-matcher (subsequence score with bonus for prefixes,
//     word-boundary hits, contiguous runs). No Fuse.js / Cmd.bar dep.
//   - Keyboard model: type-to-search, ↑/↓ navigate, Enter run, Esc close
//   - Sections (grouped headers), per-command icon + subtitle + shortcut hint
//   - Recent items: the five most-recently-run commands float to the top
//     of empty-query results (toggleable via `recents={false}`)
//   - Headless: parent owns the command list and the onSelect side-effect;
//     palette only resolves "which command did the user pick"
//   - Zero deps, ~370 LOC, full keyboard + ARIA combobox semantics.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

// ── Public types ────────────────────────────────────────────────────────────

export interface CommandPaletteCommand {
  id: string;
  title: string;
  /** One-line description shown under the title. */
  subtitle?: string;
  /** Section header to group this command under. */
  section?: string;
  /** Emoji or short text icon. */
  icon?: ReactNode;
  /** Right-aligned keyboard shortcut hint (renders as kbd pills). */
  shortcut?: string[];
  /** Free-form payload returned to onSelect / your callback. */
  data?: unknown;
  /** When set, hides this command from the palette. */
  hidden?: boolean;
  /** Per-command override of the global onSelect. */
  onSelect?: (cmd: CommandPaletteCommand) => void;
}

export interface CommandHotkey {
  /** Match the platform-default modifier (Cmd on Mac, Ctrl elsewhere). Default true. */
  ctrl?: boolean;
  /** Require the Shift key. Default false. */
  shift?: boolean;
  /** Require the Alt key. Default false. */
  alt?: boolean;
  /** The non-modifier key, lowercase. Required. */
  key: string;
}

export interface TkxCommandPaletteProps {
  /** All commands. Filter via `hidden: true` rather than recreating the list. */
  commands: CommandPaletteCommand[];
  /** Hotkey to open. Default Cmd-K / Ctrl-K. Pass null to disable. */
  hotkey?: CommandHotkey | null;
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean;
  /** Open-state callback (controlled or uncontrolled — fired both ways). */
  onOpenChange?: (open: boolean) => void;
  /** Placeholder shown in the search input. */
  placeholder?: string;
  /** Called when a command is picked (in addition to its own onSelect). */
  onSelect?: (cmd: CommandPaletteCommand) => void;
  /** Show a "Recents" group at the top when the query is empty. Default true. */
  recents?: boolean;
  /** Max recents kept. Default 5. */
  maxRecents?: number;
  /** Empty-state node. Default a friendly "No matches" line. */
  emptyState?: ReactNode;
  className?: string;
}

// ── Hotkey helpers ──────────────────────────────────────────────────────────

const isMac =
  typeof navigator !== 'undefined' &&
  /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || '');

function modifierMatch(e: KeyboardEvent | React.KeyboardEvent, ctrl: boolean): boolean {
  return ctrl ? (isMac ? e.metaKey : e.ctrlKey) : true;
}

// ── Fuzzy matcher ───────────────────────────────────────────────────────────

/** Score how well `query` matches `text`. Returns null on no match.
 *  Higher is better. Heuristics:
 *    - case-insensitive subsequence required (otherwise null)
 *    - prefix hit gets a big bonus
 *    - matches at word boundaries (after space / dash / underscore) score higher
 *    - contiguous runs score higher than spread-out hits  */
export function fuzzyScore(query: string, text: string): number | null {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  let score = 0;
  let lastMatch = -2;
  let runLen = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] !== q[qi]) {
      runLen = 0;
      continue;
    }
    let bonus = 1;
    if (i === 0) bonus += 8;                              // matches at start of text
    else if (/[\s_\-./]/.test(t[i - 1])) bonus += 6;      // word-boundary hit
    if (i === lastMatch + 1) {
      runLen += 1;
      bonus += runLen * 2;                                // contiguous run bonus
    } else {
      runLen = 1;
    }
    score += bonus;
    lastMatch = i;
    qi += 1;
  }
  if (qi < q.length) return null;
  // Penalize long-tail commands so a 6-char title beats a 60-char one when both match.
  return score - t.length * 0.05;
}

// ── Component ───────────────────────────────────────────────────────────────

const DEFAULT_HOTKEY: CommandHotkey = { ctrl: true, key: 'k' };

interface ResultItem {
  cmd: CommandPaletteCommand;
  section: string;
  score: number;
  recent?: boolean;
}

export function TkxCommandPalette({
  commands,
  hotkey = DEFAULT_HOTKEY,
  open: controlledOpen,
  onOpenChange,
  placeholder = 'Type a command…',
  onSelect,
  recents = true,
  maxRecents = 5,
  emptyState,
  className,
}: TkxCommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const [query, setQuery] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const idBase = useId();

  // Open / close hotkey
  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === hotkey.key.toLowerCase() &&
        modifierMatch(e, hotkey.ctrl ?? true) &&
        (hotkey.shift ?? false) === e.shiftKey &&
        (hotkey.alt ?? false) === e.altKey
      ) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkey, open, setOpen]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      // Focus input on next paint
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Filter / score
  const results = useMemo<ResultItem[]>(() => {
    const visible = commands.filter((c) => !c.hidden);
    if (query.trim() === '') {
      // Empty query: recents first, then everything else in original order
      const out: ResultItem[] = [];
      const recentSet = new Set(recents ? recentIds : []);
      const recentMap = new Map(visible.map((c) => [c.id, c]));
      if (recents) {
        for (const id of recentIds) {
          const c = recentMap.get(id);
          if (c) out.push({ cmd: c, section: 'Recents', score: 0, recent: true });
        }
      }
      for (const c of visible) {
        if (recentSet.has(c.id)) continue;
        out.push({ cmd: c, section: c.section ?? 'Commands', score: 0 });
      }
      return out;
    }
    const scored: ResultItem[] = [];
    for (const c of visible) {
      const titleScore = fuzzyScore(query, c.title);
      const subScore = c.subtitle ? fuzzyScore(query, c.subtitle) : null;
      let best: number | null = null;
      if (titleScore !== null) best = titleScore;
      if (subScore !== null) best = best === null ? subScore - 4 : Math.max(best, subScore - 4);
      if (best !== null) scored.push({ cmd: c, section: c.section ?? 'Commands', score: best });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [commands, query, recentIds, recents]);

  // Group into sections preserving discovery order
  const grouped = useMemo(() => {
    const map = new Map<string, ResultItem[]>();
    const order: string[] = [];
    for (const r of results) {
      if (!map.has(r.section)) {
        map.set(r.section, []);
        order.push(r.section);
      }
      map.get(r.section)!.push(r);
    }
    return order.map((s) => ({ section: s, items: map.get(s)! }));
  }, [results]);

  // Flatten into a single array for keyboard navigation
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // Clamp activeIdx whenever results shrink
  useEffect(() => {
    if (activeIdx >= flat.length) setActiveIdx(Math.max(0, flat.length - 1));
  }, [flat.length, activeIdx]);

  const runCommand = useCallback(
    (cmd: CommandPaletteCommand) => {
      onSelect?.(cmd);
      cmd.onSelect?.(cmd);
      // Bump to recents
      setRecentIds((prev) => {
        const next = [cmd.id, ...prev.filter((id) => id !== cmd.id)];
        return next.slice(0, maxRecents);
      });
      setOpen(false);
    },
    [onSelect, setOpen, maxRecents],
  );

  // Keyboard nav inside the palette
  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
        break;
      case 'Enter': {
        e.preventDefault();
        const item = flat[activeIdx];
        if (item) runCommand(item.cmd);
        break;
      }
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIdx(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIdx(flat.length - 1);
        break;
    }
  };

  // Auto-scroll the active option into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const activeId = `${idBase}-opt-${activeIdx}`;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className={className}
      onClick={() => setOpen(false)}
      data-testid="tkx-command-palette"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'min(15vh, 120px) 16px 16px',
        background: 'rgba(8, 10, 25, 0.6)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(18, 20, 38, 0.92)',
          backdropFilter: 'blur(20px) saturate(140%)',
          border: '1px solid rgba(196,168,255,0.25)',
          borderRadius: 14,
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,245,212,0.08)',
          overflow: 'hidden',
          color: '#e8e8f4',
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 18, opacity: 0.7 }}>🔍</span>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded
            aria-controls={`${idBase}-list`}
            aria-activedescendant={flat.length ? activeId : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            placeholder={placeholder}
            data-testid="cmdk-input"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              color: 'inherit',
              fontFamily: 'inherit',
              minWidth: 0,
            }}
          />
          <kbd
            aria-hidden="true"
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#aaa',
              background: 'rgba(255,255,255,0.04)',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          id={`${idBase}-list`}
          role="listbox"
          data-testid="cmdk-list"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 6,
            overflow: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          {flat.length === 0 && (
            <li
              data-testid="cmdk-empty"
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: '#888',
                fontSize: 13,
              }}
            >
              {emptyState ?? `No matches for "${query}"`}
            </li>
          )}
          {grouped.map((g) => {
            // Compute the absolute starting index of this group within `flat`
            // so each item gets the right data-idx for keyboard nav.
            const start = flat.indexOf(g.items[0]);
            return (
              <li key={g.section} role="presentation">
                <div
                  style={{
                    padding: '8px 12px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#888',
                  }}
                >
                  {g.section}
                </div>
                <ul role="presentation" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {g.items.map((item, j) => {
                    const i = start + j;
                    const active = i === activeIdx;
                    return (
                      <li
                        key={item.cmd.id}
                        id={i === activeIdx ? activeId : undefined}
                        role="option"
                        aria-selected={active}
                        data-testid={`cmdk-item-${item.cmd.id}`}
                        data-idx={i}
                        onMouseMove={() => setActiveIdx(i)}
                        onClick={() => runCommand(item.cmd)}
                        style={cmdRowStyle(active)}
                      >
                        {item.cmd.icon && (
                          <span aria-hidden="true" style={{ fontSize: 16, opacity: 0.9 }}>
                            {item.cmd.icon}
                          </span>
                        )}
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontWeight: 600, fontSize: 13.5, color: '#e8e8f4', display: 'block' }}>
                            {item.cmd.title}
                          </span>
                          {item.cmd.subtitle && (
                            <span style={{ fontSize: 12, color: '#aaa', display: 'block' }}>
                              {item.cmd.subtitle}
                            </span>
                          )}
                        </span>
                        {item.cmd.shortcut && (
                          <span style={{ display: 'inline-flex', gap: 4 }}>
                            {item.cmd.shortcut.map((k, ki) => (
                              <kbd key={ki} style={kbdStyle(active)}>
                                {k}
                              </kbd>
                            ))}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}

function cmdRowStyle(active: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    minHeight: 44,
    borderRadius: 8,
    cursor: 'pointer',
    background: active ? 'rgba(123,142,255,0.16)' : 'transparent',
    outline: active ? '1px solid rgba(123,142,255,0.4)' : 'none',
    color: '#e8e8f4',
    transition: 'background 80ms',
  };
}

function kbdStyle(active: boolean): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    minWidth: 18,
    borderRadius: 4,
    textAlign: 'center',
    border: `1px solid ${active ? 'rgba(123,142,255,0.45)' : 'rgba(255,255,255,0.12)'}`,
    background: active ? 'rgba(123,142,255,0.14)' : 'rgba(255,255,255,0.04)',
    color: active ? '#c4a8ff' : '#aaa',
    fontFamily: 'ui-monospace, monospace',
  };
}
