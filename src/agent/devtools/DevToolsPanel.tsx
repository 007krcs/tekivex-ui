'use client';

// ══════════════════════════════════════════════════════════════════════════════
// DevToolsPanel (#16) — Floating panel showing the live agent event stream.
// Drop it into any page during development. No styling deps — uses inline styles.
// ══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import type { AgentEvent } from '../core/events';

export interface DevToolsPanelProps {
  events: AgentEvent[];
  onClear?(): void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  startOpen?: boolean;
}

export function DevToolsPanel({
  events,
  onClear,
  position = 'bottom-right',
  startOpen = false,
}: DevToolsPanelProps) {
  const [open, setOpen] = useState(startOpen);
  const [filter, setFilter] = useState<string>('all');
  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: position.includes('bottom') ? 16 : undefined,
    top: position.includes('top') ? 16 : undefined,
    right: position.includes('right') ? 16 : undefined,
    left: position.includes('left') ? 16 : undefined,
    width: open ? 480 : 'auto',
    maxHeight: open ? '60vh' : 'auto',
    background: 'rgba(15, 15, 35, 0.96)',
    color: '#f0f0ff',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  };
  const btnStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    color: 'inherit',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '4px 8px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  };

  return (
    <aside style={containerStyle} aria-label="Agent DevTools">
      <header style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setOpen(!open)} style={btnStyle}>
          {open ? '▾ Agent DevTools' : '▸ Agent'}
        </button>
        <span style={{ opacity: 0.6 }}>{events.length} events</span>
        {open && onClear && (
          <button onClick={onClear} style={{ ...btnStyle, marginLeft: 'auto' }}>
            Clear
          </button>
        )}
      </header>
      {open && (
        <>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ ...btnStyle, cursor: 'pointer' }}
          >
            <option value="all">All events</option>
            <option value="step_start">Step starts</option>
            <option value="tool_call_start">Tool starts</option>
            <option value="tool_result">Tool results</option>
            <option value="tool_error">Tool errors</option>
            <option value="message_stop">Message stops</option>
            <option value="error">Errors</option>
          </select>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {filtered.map((e, i) => (
              <div
                key={i}
                style={{
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <code style={{ color: colorFor(e.type) }}>{e.type}</code>
                <pre
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: 11,
                    opacity: 0.85,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {JSON.stringify(redactErr(e), null, 1)}
                </pre>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}

function colorFor(type: string): string {
  if (type.startsWith('tool_call')) return '#f9a826';
  if (type === 'tool_result') return '#00c853';
  if (type === 'error' || type === 'tool_error') return '#ff6b6b';
  if (type === 'message_stop' || type === 'done') return '#00f5d4';
  if (type === 'step_start') return '#6366f1';
  return '#a0a0c0';
}

function redactErr(e: AgentEvent): unknown {
  if ('error' in e && e.error instanceof Error) {
    return { ...e, error: e.error.message };
  }
  return e;
}
