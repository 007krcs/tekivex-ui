'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxFormulaBar — companion to TkxSpreadsheet
//
// Sits above (or below) a spreadsheet and shows the RAW content of the
// active cell (so formulas show "=A1+B2" instead of the rendered value),
// plus a name-box on the left for the cell address. Editing is committed
// straight back to the SpreadsheetData on Enter / blur.
//
//   const [active, setActive] = useState<{col: number; row: number}>({col:0,row:0});
//   const [data, setData] = useState<SpreadsheetData>({ cells: {} });
//
//   <TkxFormulaBar
//     data={data}
//     active={active}
//     onChange={setData}
//     onActiveChange={setActive}
//   />
//   <TkxSpreadsheet data={data} onChange={setData} />
//
// Why a separate component instead of folding it into TkxSpreadsheet:
//   - Apps that want a chrome-less grid (embedded dashboards) skip the bar
//   - Apps that want the bar at a different position (bottom, modal) get to
//   - Lets the user wire up status messages around it (parse error, formula
//     debugger, etc.) without modifying the grid component
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { addr, parseAddr, evaluate, type SpreadsheetData } from './TkxSpreadsheet';
import { sanitizeUnicode } from '../engine/security';

export interface TkxFormulaBarProps {
  /** The same SpreadsheetData passed to TkxSpreadsheet. */
  data: SpreadsheetData;
  /** Currently active cell. */
  active: { col: number; row: number };
  /** Fired with the new SpreadsheetData when the user commits a change. */
  onChange: (next: SpreadsheetData) => void;
  /** Called when the user types a new address into the name-box and presses Enter. */
  onActiveChange?: (next: { col: number; row: number }) => void;
  /** Show the live evaluated value to the right of the formula. Default true. */
  showResult?: boolean;
  /** Bar height in pixels. Default 36. */
  height?: number;
  /** Outer style. */
  style?: CSSProperties;
  className?: string;
}

export function TkxFormulaBar({
  data,
  active,
  onChange,
  onActiveChange,
  showResult = true,
  height = 36,
  style,
  className,
}: TkxFormulaBarProps) {
  const a = addr(active.col, active.row);
  const raw = data.cells[a] ?? '';

  // Local edit state so typing doesn't fire onChange on every keystroke.
  const [draft, setDraft] = useState(raw);
  const [nameDraft, setNameDraft] = useState(a);

  // Keep drafts in sync when the active cell changes externally
  useEffect(() => {
    setDraft(raw);
    setNameDraft(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a]);

  const result = showResult && raw.startsWith('=') ? evaluate(a, data.cells) : '';

  const commitFormula = () => {
    const next = { ...data.cells };
    if (draft === '') delete next[a];
    else next[a] = draft;
    onChange({ cells: next });
  };

  const onFormulaKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitFormula();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDraft(raw);
    }
  };

  const onNameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const parsed = parseAddr(nameDraft.trim().toUpperCase());
      if (parsed) onActiveChange?.(parsed);
      else setNameDraft(a); // bad input — revert
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setNameDraft(a);
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Formula bar"
      data-testid="tkx-formula-bar"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        height,
        background: 'var(--tkx-bg-subtle, #0d0d14)',
        border: '1px solid var(--tkx-border, #2a2a3e)',
        borderRadius: 8,
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 13,
        ...style,
      }}
    >
      {/* Name box */}
      <input
        aria-label="Cell address"
        data-testid="formula-bar-name"
        value={nameDraft}
        onChange={(e) => setNameDraft(sanitizeUnicode(e.target.value))}
        onKeyDown={onNameKey}
        onBlur={() => {
          // Revert on blur if the address didn't parse — prevents "stuck" bad text.
          const parsed = parseAddr(nameDraft.trim().toUpperCase());
          if (!parsed) setNameDraft(a);
        }}
        style={{
          width: 90,
          flex: '0 0 90px',
          padding: '0 10px',
          border: 'none',
          borderRight: '1px solid var(--tkx-border, #2a2a3e)',
          background: 'transparent',
          color: 'var(--tkx-accent, #00f5d4)',
          fontWeight: 700,
          textAlign: 'center',
          textTransform: 'uppercase',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          outline: 'none',
        }}
      />

      {/* fx prefix */}
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0 12px',
          color: '#888',
          fontStyle: 'italic',
          fontFamily: 'serif',
          fontSize: 14,
          borderRight: '1px solid var(--tkx-border-soft, #1a1a25)',
        }}
      >
        f<sub style={{ fontSize: 9 }}>x</sub>
      </span>

      {/* Formula input */}
      <input
        aria-label="Cell content"
        data-testid="formula-bar-input"
        value={draft}
        onChange={(e) => setDraft(sanitizeUnicode(e.target.value))}
        onKeyDown={onFormulaKey}
        onBlur={commitFormula}
        placeholder="Type a value or =formula"
        style={{
          flex: 1,
          minWidth: 0,
          padding: '0 12px',
          border: 'none',
          background: 'transparent',
          color: draft.startsWith('=') ? 'var(--tkx-accent, #00f5d4)' : 'var(--tkx-fg, #e8e8f4)',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          outline: 'none',
        }}
      />

      {/* Live result */}
      {showResult && raw.startsWith('=') && (
        <span
          data-testid="formula-bar-result"
          aria-label="Evaluated value"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 12px',
            borderLeft: '1px solid var(--tkx-border-soft, #1a1a25)',
            background: 'rgba(0,245,212,0.06)',
            color: typeof result === 'string' && result.startsWith('#') ? '#ff006e' : '#c4a8ff',
            fontWeight: 600,
            minWidth: 80,
            justifyContent: 'flex-end',
          }}
        >
          = {String(result)}
        </span>
      )}
    </div>
  );
}
