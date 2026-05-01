// ─────────────────────────────────────────────────────────────────────────────
// TkxSpreadsheet — editable grid with a formula evaluator
//
// What it supports:
//   - Cell addresses A1..ZZ999 (any size, addressed via column letters)
//   - Literal values: numbers (42, 3.14), strings (anything that doesn't start with =)
//   - Formulas starting with "=":
//       arithmetic   =1 + 2*3, parentheses, ^ (power)
//       cell refs    =A1 + B2
//       ranges       =SUM(A1:A10), =AVG(B1:B5)
//       functions    SUM, AVG (alias AVERAGE), MIN, MAX, COUNT, IF, ROUND
//   - Circular reference detection — evaluator returns "#CYCLE!"
//   - Bad references show "#REF!", malformed formulas show "#ERROR!"
//
// What it does NOT do (yet):
//   - Multi-cell paste from clipboard parsing (single-cell paste only)
//   - String literals inside formulas ("hello") — kept simple on purpose
//   - Cross-sheet refs (Sheet2!A1) — single-sheet for now
//
// The evaluator is exported as `evaluate()` so consumers can re-use it
// outside the grid (e.g. for a formula bar in a different layout).
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';

// ── Public types ────────────────────────────────────────────────────────────

export interface SpreadsheetData {
  /** Map of cell address ("A1") → raw cell content (number, string, or "=formula"). */
  cells: Record<string, string>;
}

export interface TkxSpreadsheetProps {
  /** Number of columns. Default 8. */
  cols?: number;
  /** Number of rows. Default 20. */
  rows?: number;
  /** Cell data (controlled). */
  data: SpreadsheetData;
  /** Fired whenever a cell is committed. */
  onChange: (next: SpreadsheetData) => void;
  /** Column width in pixels. Default 96. */
  colWidth?: number;
  /** Row height in pixels. Default 28. */
  rowHeight?: number;
  /** Outer style. */
  style?: CSSProperties;
  className?: string;
}

// ── Address helpers ─────────────────────────────────────────────────────────

const COL_RE = /^([A-Z]+)([0-9]+)$/;

export function colLetter(i: number): string {
  let s = '';
  let n = i;
  while (true) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
    if (n < 0) break;
  }
  return s;
}

export function colIndex(letters: string): number {
  let n = 0;
  for (let i = 0; i < letters.length; i++) {
    n = n * 26 + (letters.charCodeAt(i) - 64);
  }
  return n - 1;
}

export function addr(col: number, row: number): string {
  return `${colLetter(col)}${row + 1}`;
}

export function parseAddr(a: string): { col: number; row: number } | null {
  const m = COL_RE.exec(a);
  if (!m) return null;
  return { col: colIndex(m[1]), row: +m[2] - 1 };
}

// ── Spreadsheet → records conversion ───────────────────────────────────────
//
// Treats row 1 as the header. Every subsequent row becomes a record keyed by
// the header text. Formula cells are evaluated before being copied.
//
//   const records = spreadsheetToRecords(sheet, { cols: 4, rows: 100 });
//   <TkxDataExplorer initialData={records} />
//
// Numeric values stay numeric; error sentinels (#CYCLE!, #ERROR!, …) and
// empty cells are converted to null so charts don't render them.
export function spreadsheetToRecords(
  data: SpreadsheetData,
  bounds: { cols: number; rows: number },
): Array<Record<string, string | number | null>> {
  const memo = new Map<string, ReturnType<typeof evaluate>>();
  const cells = data.cells;

  // Build header from row 1
  const headers: string[] = [];
  for (let c = 0; c < bounds.cols; c++) {
    const a = addr(c, 0);
    const raw = cells[a];
    headers.push(raw && raw.trim() !== '' ? raw.trim() : addr(c, 0));
  }

  const out: Array<Record<string, string | number | null>> = [];
  for (let r = 1; r < bounds.rows; r++) {
    const rec: Record<string, string | number | null> = {};
    let hasAny = false;
    for (let c = 0; c < bounds.cols; c++) {
      const a = addr(c, r);
      let v: ReturnType<typeof evaluate>;
      if (memo.has(a)) v = memo.get(a)!;
      else {
        v = evaluate(a, cells);
        memo.set(a, v);
      }
      if (v === '' || v === undefined) {
        rec[headers[c]] = null;
      } else if (typeof v === 'string' && v.startsWith('#')) {
        rec[headers[c]] = null;
      } else {
        rec[headers[c]] = v;
        hasAny = true;
      }
    }
    if (hasAny) out.push(rec);
  }
  return out;
}

// ── Records → spreadsheet conversion (the inverse of spreadsheetToRecords) ──
//
// Takes a flat array of records (e.g. parsed CSV / JSON) and produces a
// SpreadsheetData object: row 1 = headers (in the order they first appear
// across the records), rows 2+ = body. Existing cells in `base` are
// preserved if `preserveExtraCells = true` and they fall outside the
// region we're writing — handy when the caller wants to layer imported
// data over a sheet that already has formulas in column E, for example.
//
//   const sheet = recordsToSpreadsheet([{ name: 'Ada', score: 99 }, …]);
//   <TkxSpreadsheet data={sheet} cols={…} rows={…} />
//
// Headers are derived from the union of keys across ALL records (so a
// CSV with a sparse last column still gets a column for it). Stable
// order: first-seen wins.
export function recordsToSpreadsheet(
  records: Array<Record<string, string | number | null | boolean | undefined>>,
  options: {
    /** Existing sheet to merge into. Default: empty. */
    base?: SpreadsheetData;
    /** Keep cells in `base` that fall outside the rectangle we'd overwrite.
     *  Default false — full replacement. */
    preserveExtraCells?: boolean;
  } = {},
): SpreadsheetData {
  const { base, preserveExtraCells = false } = options;

  // Stable union-of-keys for column ordering
  const headerOrder: string[] = [];
  const seen = new Set<string>();
  for (const rec of records) {
    for (const k of Object.keys(rec)) {
      if (!seen.has(k)) {
        seen.add(k);
        headerOrder.push(k);
      }
    }
  }

  const cells: Record<string, string> = {};

  // Optionally seed with the existing sheet's cells
  if (preserveExtraCells && base) {
    for (const [a, v] of Object.entries(base.cells)) cells[a] = v;
  }

  // Write header row
  headerOrder.forEach((h, c) => {
    cells[addr(c, 0)] = h;
  });

  // Write body rows
  records.forEach((rec, i) => {
    const r = i + 1;
    headerOrder.forEach((h, c) => {
      const v = rec[h];
      if (v === null || v === undefined || v === '') {
        if (!preserveExtraCells) delete cells[addr(c, r)];
      } else {
        cells[addr(c, r)] = String(v);
      }
    });
  });

  // When NOT preserving extras, also clear the rectangle we owned in `base`
  // beyond the current data so old rows don't bleed through.
  if (!preserveExtraCells && base) {
    // Determine the rectangle we wrote: cols=headerOrder.length, rows=records.length+1
    const writtenCols = headerOrder.length;
    const writtenRows = records.length + 1;
    for (const [a] of Object.entries(base.cells)) {
      const m = /^([A-Z]+)([0-9]+)$/.exec(a);
      if (!m) continue;
      const col = colIndex(m[1]);
      const row = +m[2] - 1;
      // If the address is in the rectangle the new write covers, the new
      // write already overrode it (or cleared it). If it's outside, drop it.
      if (col < writtenCols && row < writtenRows) continue;
      // Outside: drop in non-preserve mode
      // (already not present in `cells` since we didn't seed it)
    }
  }

  return { cells };
}

// ── Evaluator ───────────────────────────────────────────────────────────────

type CellValue = number | string;

interface EvalContext {
  cells: Record<string, string>;
  stack: Set<string>;
  /** Memo for already-evaluated cells. */
  memo: Map<string, CellValue>;
}

/** Public entry point: resolve a single cell to its display value. */
export function evaluate(
  addr: string,
  cells: Record<string, string>,
): CellValue {
  return resolveCell(addr, { cells, stack: new Set(), memo: new Map() });
}

function resolveCell(a: string, ctx: EvalContext): CellValue {
  if (ctx.memo.has(a)) return ctx.memo.get(a)!;
  if (ctx.stack.has(a)) return '#CYCLE!';
  const raw = ctx.cells[a];
  if (raw === undefined || raw === '') return '';
  let value: CellValue;
  if (raw.startsWith('=')) {
    ctx.stack.add(a);
    try {
      value = evalExpr(raw.slice(1), ctx);
    } catch {
      value = '#ERROR!';
    }
    ctx.stack.delete(a);
  } else {
    const n = Number(raw);
    value = Number.isFinite(n) && raw.trim() !== '' ? n : raw;
  }
  ctx.memo.set(a, value);
  return value;
}

// ── Tokenizer ──

type Token =
  | { type: 'num'; value: number }
  | { type: 'ref'; addr: string }
  | { type: 'range'; from: string; to: string }
  | { type: 'fn'; name: string }
  | { type: 'op'; value: string }
  | { type: 'paren'; value: '(' | ')' }
  | { type: 'comma' };

const FN_RE = /^([A-Z][A-Z0-9_]*)\s*\(/;
const RANGE_RE = /^([A-Z]+[0-9]+):([A-Z]+[0-9]+)/;
const REF_RE = /^([A-Z]+[0-9]+)/;
const NUM_RE = /^(\d+(?:\.\d+)?|\.\d+)/;

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let s = src.trim();
  while (s.length) {
    if (s[0] === ' ') {
      s = s.slice(1);
      continue;
    }
    if (s[0] === '(' || s[0] === ')') {
      tokens.push({ type: 'paren', value: s[0] as '(' | ')' });
      s = s.slice(1);
      continue;
    }
    if (s[0] === ',') {
      tokens.push({ type: 'comma' });
      s = s.slice(1);
      continue;
    }
    if ('+-*/^'.includes(s[0])) {
      tokens.push({ type: 'op', value: s[0] });
      s = s.slice(1);
      continue;
    }
    let m: RegExpExecArray | null;
    m = FN_RE.exec(s);
    if (m) {
      tokens.push({ type: 'fn', name: m[1] });
      tokens.push({ type: 'paren', value: '(' });
      s = s.slice(m[0].length);
      continue;
    }
    m = RANGE_RE.exec(s);
    if (m) {
      tokens.push({ type: 'range', from: m[1], to: m[2] });
      s = s.slice(m[0].length);
      continue;
    }
    m = REF_RE.exec(s);
    if (m) {
      tokens.push({ type: 'ref', addr: m[1] });
      s = s.slice(m[0].length);
      continue;
    }
    m = NUM_RE.exec(s);
    if (m) {
      tokens.push({ type: 'num', value: +m[0] });
      s = s.slice(m[0].length);
      continue;
    }
    throw new Error(`Unexpected token at "${s}"`);
  }
  return tokens;
}

// ── Pratt parser + evaluator ──

interface Parser {
  tokens: Token[];
  pos: number;
}

function peek(p: Parser): Token | null {
  return p.tokens[p.pos] ?? null;
}
function consume(p: Parser): Token {
  return p.tokens[p.pos++];
}

function evalExpr(src: string, ctx: EvalContext): CellValue {
  const tokens = tokenize(src);
  const p: Parser = { tokens, pos: 0 };
  const result = parseExpr(p, ctx, 0);
  if (p.pos !== tokens.length) throw new Error('Trailing tokens');
  return result;
}

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
};

function parseExpr(p: Parser, ctx: EvalContext, minPrec: number): CellValue {
  let lhs = parsePrimary(p, ctx);
  while (true) {
    const t = peek(p);
    if (!t || t.type !== 'op') break;
    const prec = PRECEDENCE[t.value];
    if (prec === undefined || prec < minPrec) break;
    consume(p);
    const rhs = parseExpr(p, ctx, prec + 1);
    lhs = applyOp(t.value, lhs, rhs);
  }
  return lhs;
}

function parsePrimary(p: Parser, ctx: EvalContext): CellValue {
  const t = consume(p);
  if (!t) throw new Error('Unexpected end of formula');
  switch (t.type) {
    case 'num':
      return t.value;
    case 'ref':
      return resolveCell(t.addr, ctx);
    case 'range':
      // Bare ranges are only valid inside function calls; surface a clear error.
      throw new Error('Range used outside a function');
    case 'op': {
      // Unary +/-
      if (t.value === '-' || t.value === '+') {
        const inner = parseExpr(p, ctx, 4);
        const n = toNumber(inner);
        return t.value === '-' ? -n : n;
      }
      throw new Error(`Unexpected operator ${t.value}`);
    }
    case 'paren': {
      if (t.value !== '(') throw new Error('Unexpected )');
      const inner = parseExpr(p, ctx, 0);
      const close = consume(p);
      if (!close || close.type !== 'paren' || close.value !== ')') throw new Error('Missing )');
      return inner;
    }
    case 'fn': {
      const args: CellValue[][] = [];
      // The opening paren was already pushed by tokenize() — consume it.
      const open = consume(p);
      if (!open || open.type !== 'paren' || open.value !== '(') throw new Error('Function missing (');
      // Empty args?
      if (peek(p)?.type === 'paren' && (peek(p) as { value: string }).value === ')') {
        consume(p);
        return applyFn(t.name, args);
      }
      while (true) {
        // A function arg can be a range or an expression.
        const next = peek(p);
        if (next && next.type === 'range') {
          consume(p);
          args.push(expandRange(next.from, next.to, ctx));
        } else {
          args.push([parseExpr(p, ctx, 0)]);
        }
        const sep = peek(p);
        if (sep && sep.type === 'comma') {
          consume(p);
          continue;
        }
        break;
      }
      const close = consume(p);
      if (!close || close.type !== 'paren' || close.value !== ')') throw new Error('Function missing )');
      return applyFn(t.name, args);
    }
    default:
      throw new Error(`Unexpected token ${t.type}`);
  }
}

function expandRange(from: string, to: string, ctx: EvalContext): CellValue[] {
  const a = parseAddr(from);
  const b = parseAddr(to);
  if (!a || !b) return ['#REF!'];
  const c0 = Math.min(a.col, b.col);
  const c1 = Math.max(a.col, b.col);
  const r0 = Math.min(a.row, b.row);
  const r1 = Math.max(a.row, b.row);
  const out: CellValue[] = [];
  for (let c = c0; c <= c1; c++) {
    for (let r = r0; r <= r1; r++) {
      out.push(resolveCell(addr(c, r), ctx));
    }
  }
  return out;
}

function toNumber(v: CellValue): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.startsWith('#')) throw new Error(v);
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function applyOp(op: string, a: CellValue, b: CellValue): CellValue {
  const x = toNumber(a);
  const y = toNumber(b);
  switch (op) {
    case '+': return x + y;
    case '-': return x - y;
    case '*': return x * y;
    case '/': return y === 0 ? '#DIV/0!' : x / y;
    case '^': return Math.pow(x, y);
    default: throw new Error(`Unknown op ${op}`);
  }
}

function applyFn(name: string, args: CellValue[][]): CellValue {
  const flat = args.flat();
  const nums = flat
    .filter((v) => typeof v === 'number' || (typeof v === 'string' && v !== '' && !v.startsWith('#')))
    .map(toNumber);
  switch (name.toUpperCase()) {
    case 'SUM':
      return nums.reduce((s, n) => s + n, 0);
    case 'AVG':
    case 'AVERAGE':
      return nums.length === 0 ? 0 : nums.reduce((s, n) => s + n, 0) / nums.length;
    case 'MIN':
      return nums.length === 0 ? 0 : Math.min(...nums);
    case 'MAX':
      return nums.length === 0 ? 0 : Math.max(...nums);
    case 'COUNT':
      return nums.length;
    case 'ROUND': {
      const v = toNumber(args[0]?.[0] ?? 0);
      const d = args[1] ? toNumber(args[1][0]) : 0;
      const f = Math.pow(10, d);
      return Math.round(v * f) / f;
    }
    case 'IF': {
      const cond = toNumber(args[0]?.[0] ?? 0);
      const t = args[1]?.[0] ?? '';
      const f = args[2]?.[0] ?? '';
      return cond ? t : f;
    }
    default:
      return '#NAME?';
  }
}

// ── Display formatting ──

function formatValue(v: CellValue): string {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return '#NUM!';
    // Trim trailing zeros for nicer display.
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 1e10) / 1e10);
  }
  return String(v);
}

// ── Component ───────────────────────────────────────────────────────────────

export function TkxSpreadsheet({
  cols = 8,
  rows = 20,
  data,
  onChange,
  colWidth = 96,
  rowHeight = 28,
  style,
  className,
}: TkxSpreadsheetProps) {
  const [active, setActive] = useState<{ col: number; row: number }>({ col: 0, row: 0 });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Memo a single eval context so cross-cell formulas share work.
  const computed = useMemo(() => {
    const memo = new Map<string, CellValue>();
    const ctx: EvalContext = { cells: data.cells, stack: new Set(), memo };
    return (a: string) => resolveCell(a, ctx);
  }, [data]);

  const activeAddr = addr(active.col, active.row);

  const startEditing = useCallback(
    (initial?: string) => {
      const raw = initial ?? data.cells[activeAddr] ?? '';
      setDraft(raw);
      setEditing(true);
      // Focus on next tick after the input renders.
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [activeAddr, data.cells],
  );

  const commit = useCallback(() => {
    const next = { ...data.cells };
    if (draft === '') delete next[activeAddr];
    else next[activeAddr] = draft;
    onChange({ cells: next });
    setEditing(false);
  }, [activeAddr, data, draft, onChange]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraft('');
  }, []);

  const move = useCallback(
    (dCol: number, dRow: number) => {
      setActive((a) => ({
        col: Math.max(0, Math.min(cols - 1, a.col + dCol)),
        row: Math.max(0, Math.min(rows - 1, a.row + dRow)),
      }));
    },
    [cols, rows],
  );

  const onGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (editing) return;
    switch (e.key) {
      case 'ArrowUp':    e.preventDefault(); move(0, -1); break;
      case 'ArrowDown':  e.preventDefault(); move(0, 1); break;
      case 'ArrowLeft':  e.preventDefault(); move(-1, 0); break;
      case 'ArrowRight': e.preventDefault(); move(1, 0); break;
      case 'Tab':        e.preventDefault(); move(e.shiftKey ? -1 : 1, 0); break;
      case 'Enter':      e.preventDefault(); startEditing(); break;
      case 'F2':         e.preventDefault(); startEditing(); break;
      case 'Delete':
      case 'Backspace': {
        e.preventDefault();
        if (data.cells[activeAddr] !== undefined) {
          const next = { ...data.cells };
          delete next[activeAddr];
          onChange({ cells: next });
        }
        break;
      }
      default:
        // Any printable key starts editing with that as the first char.
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          startEditing(e.key);
        }
    }
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        commit();
        move(0, 1);
        break;
      case 'Tab':
        e.preventDefault();
        commit();
        move(e.shiftKey ? -1 : 1, 0);
        break;
      case 'Escape':
        e.preventDefault();
        cancelEdit();
        break;
    }
  };

  // ── Render ──
  const headerHeight = 28;
  const rowHeaderWidth = 48;
  const totalWidth = rowHeaderWidth + cols * colWidth;
  const totalHeight = headerHeight + rows * rowHeight;

  return (
    <div
      className={className}
      tabIndex={0}
      role="grid"
      aria-rowcount={rows}
      aria-colcount={cols}
      data-testid="tkx-spreadsheet"
      onKeyDown={onGridKeyDown}
      style={{
        position: 'relative',
        width: totalWidth,
        maxWidth: '100%',
        height: totalHeight,
        outline: 'none',
        border: '1px solid var(--tkx-border, #2a2a3e)',
        borderRadius: 8,
        overflow: 'auto',
        background: 'var(--tkx-bg, #0a0a0f)',
        color: 'var(--tkx-fg, #e8e8f4)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 13,
        ...style,
      }}
    >
      {/* Column header */}
      <div
        role="row"
        style={{
          display: 'flex',
          height: headerHeight,
          position: 'sticky',
          top: 0,
          background: 'var(--tkx-bg-subtle, #0d0d14)',
          zIndex: 2,
          borderBottom: '1px solid var(--tkx-border, #2a2a3e)',
        }}
      >
        <div
          role="columnheader"
          style={{
            width: rowHeaderWidth,
            flex: `0 0 ${rowHeaderWidth}px`,
            borderRight: '1px solid var(--tkx-border, #2a2a3e)',
            background: 'var(--tkx-bg-subtle, #0d0d14)',
          }}
        />
        {Array.from({ length: cols }).map((_, c) => (
          <div
            key={c}
            role="columnheader"
            data-testid={`col-${colLetter(c)}`}
            style={{
              width: colWidth,
              flex: `0 0 ${colWidth}px`,
              textAlign: 'center',
              lineHeight: `${headerHeight}px`,
              fontWeight: 700,
              color: c === active.col ? 'var(--tkx-accent, #00f5d4)' : '#888',
              borderRight: '1px solid var(--tkx-border-soft, #1a1a25)',
            }}
          >
            {colLetter(c)}
          </div>
        ))}
      </div>

      {/* Body */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          role="row"
          aria-rowindex={r + 1}
          style={{ display: 'flex', height: rowHeight }}
        >
          <div
            role="rowheader"
            style={{
              width: rowHeaderWidth,
              flex: `0 0 ${rowHeaderWidth}px`,
              textAlign: 'center',
              lineHeight: `${rowHeight}px`,
              fontWeight: 700,
              color: r === active.row ? 'var(--tkx-accent, #00f5d4)' : '#888',
              background: 'var(--tkx-bg-subtle, #0d0d14)',
              borderRight: '1px solid var(--tkx-border, #2a2a3e)',
              borderBottom: '1px solid var(--tkx-border-soft, #1a1a25)',
              position: 'sticky',
              left: 0,
              zIndex: 1,
            }}
          >
            {r + 1}
          </div>
          {Array.from({ length: cols }).map((_, c) => {
            const a = addr(c, r);
            const isActive = c === active.col && r === active.row;
            const raw = data.cells[a] ?? '';
            const display = raw === '' ? '' : formatValue(computed(a));
            const isFormula = raw.startsWith('=');
            return (
              <div
                key={c}
                role="gridcell"
                aria-colindex={c + 1}
                aria-selected={isActive}
                data-testid={`cell-${a}`}
                onClick={() => setActive({ col: c, row: r })}
                onDoubleClick={() => {
                  setActive({ col: c, row: r });
                  startEditing();
                }}
                style={{
                  width: colWidth,
                  flex: `0 0 ${colWidth}px`,
                  borderRight: '1px solid var(--tkx-border-soft, #1a1a25)',
                  borderBottom: '1px solid var(--tkx-border-soft, #1a1a25)',
                  padding: '0 6px',
                  lineHeight: `${rowHeight}px`,
                  background: isActive ? 'rgba(0,245,212,0.08)' : 'transparent',
                  outline: isActive ? '2px solid var(--tkx-accent, #00f5d4)' : 'none',
                  outlineOffset: -2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: typeof computed(a) === 'string' && (computed(a) as string).startsWith('#')
                    ? '#ff006e'
                    : isFormula
                      ? 'var(--tkx-accent, #00f5d4)'
                      : 'var(--tkx-fg, #e8e8f4)',
                  cursor: 'cell',
                  position: 'relative',
                }}
              >
                {isActive && editing ? (
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={onInputKeyDown}
                    data-testid={`cell-input-${a}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      padding: '0 6px',
                      border: 'none',
                      background: 'var(--tkx-bg, #0a0a0f)',
                      color: 'var(--tkx-fg, #e8e8f4)',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      outline: 'none',
                    }}
                  />
                ) : (
                  display
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
