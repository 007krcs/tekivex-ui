import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import {
  TkxSpreadsheet,
  evaluate,
  colLetter,
  colIndex,
  addr,
  parseAddr,
  spreadsheetToRecords,
  type SpreadsheetData,
} from '../src/components/TkxSpreadsheet';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

function Harness({ initial }: { initial: SpreadsheetData }) {
  const [data, setData] = useState<SpreadsheetData>(initial);
  return <TkxSpreadsheet cols={4} rows={5} data={data} onChange={setData} />;
}

describe('address helpers', () => {
  it('round-trips colLetter ↔ colIndex', () => {
    for (let i = 0; i < 30; i++) expect(colIndex(colLetter(i))).toBe(i);
  });
  it('handles double-letter columns', () => {
    expect(colLetter(26)).toBe('AA');
    expect(colIndex('AA')).toBe(26);
  });
  it('parses cell addresses', () => {
    expect(parseAddr('B3')).toEqual({ col: 1, row: 2 });
    expect(parseAddr('AA10')).toEqual({ col: 26, row: 9 });
    expect(parseAddr('bad')).toBeNull();
  });
  it('builds addresses from coords', () => {
    expect(addr(0, 0)).toBe('A1');
    expect(addr(2, 4)).toBe('C5');
  });
});

describe('evaluate()', () => {
  it('returns empty string for empty cells', () => {
    expect(evaluate('A1', {})).toBe('');
  });

  it('returns numbers for numeric literals', () => {
    expect(evaluate('A1', { A1: '42' })).toBe(42);
    expect(evaluate('A1', { A1: '3.14' })).toBe(3.14);
  });

  it('returns strings for non-numeric literals', () => {
    expect(evaluate('A1', { A1: 'hello' })).toBe('hello');
  });

  it('does basic arithmetic with operator precedence', () => {
    expect(evaluate('A1', { A1: '=1 + 2 * 3' })).toBe(7);
    expect(evaluate('A1', { A1: '=(1 + 2) * 3' })).toBe(9);
    expect(evaluate('A1', { A1: '=2 ^ 3' })).toBe(8);
  });

  it('resolves cell references', () => {
    expect(evaluate('B1', { A1: '5', B1: '=A1 * 2' })).toBe(10);
  });

  it('resolves nested references', () => {
    expect(evaluate('C1', { A1: '2', B1: '=A1*3', C1: '=B1+1' })).toBe(7);
  });

  it('SUM over a range', () => {
    expect(evaluate('A4', { A1: '1', A2: '2', A3: '3', A4: '=SUM(A1:A3)' })).toBe(6);
  });

  it('AVG / AVERAGE alias', () => {
    expect(evaluate('A4', { A1: '2', A2: '4', A3: '6', A4: '=AVG(A1:A3)' })).toBe(4);
    expect(evaluate('A4', { A1: '2', A2: '4', A3: '6', A4: '=AVERAGE(A1:A3)' })).toBe(4);
  });

  it('MIN / MAX', () => {
    expect(evaluate('A4', { A1: '5', A2: '2', A3: '8', A4: '=MIN(A1:A3)' })).toBe(2);
    expect(evaluate('A4', { A1: '5', A2: '2', A3: '8', A4: '=MAX(A1:A3)' })).toBe(8);
  });

  it('COUNT skips empty + error cells', () => {
    expect(evaluate('A4', { A1: '5', A3: '8', A4: '=COUNT(A1:A3)' })).toBe(2);
  });

  it('IF returns the right branch', () => {
    expect(evaluate('A1', { A1: '=IF(1, 10, 20)' })).toBe(10);
    expect(evaluate('A1', { A1: '=IF(0, 10, 20)' })).toBe(20);
  });

  it('ROUND truncates to N decimals', () => {
    expect(evaluate('A1', { A1: '=ROUND(3.14159, 2)' })).toBe(3.14);
    expect(evaluate('A1', { A1: '=ROUND(3.7, 0)' })).toBe(4);
  });

  it('detects circular references', () => {
    expect(evaluate('A1', { A1: '=B1', B1: '=A1' })).toBe('#CYCLE!');
  });

  it('returns #DIV/0! on division by zero', () => {
    expect(evaluate('A1', { A1: '=1/0' })).toBe('#DIV/0!');
  });

  it('returns #ERROR! on malformed formulas', () => {
    expect(evaluate('A1', { A1: '=1 +' })).toBe('#ERROR!');
    expect(evaluate('A1', { A1: '=)' })).toBe('#ERROR!');
  });

  it('returns #NAME? for unknown functions', () => {
    expect(evaluate('A1', { A1: '=BOGUS(1, 2)' })).toBe('#NAME?');
  });

  it('handles unary minus', () => {
    expect(evaluate('A1', { A1: '=-5 + 2' })).toBe(-3);
  });
});

describe('spreadsheetToRecords', () => {
  it('converts row 1 as header + body rows as records', () => {
    const data: SpreadsheetData = {
      cells: {
        A1: 'name', B1: 'score',
        A2: 'Ada',  B2: '99',
        A3: 'Grace', B3: '95',
      },
    };
    expect(spreadsheetToRecords(data, { cols: 2, rows: 3 })).toEqual([
      { name: 'Ada', score: 99 },
      { name: 'Grace', score: 95 },
    ]);
  });

  it('evaluates formulas before copying', () => {
    const data: SpreadsheetData = {
      cells: {
        A1: 'a', B1: 'b', C1: 'sum',
        A2: '2', B2: '3', C2: '=A2+B2',
      },
    };
    expect(spreadsheetToRecords(data, { cols: 3, rows: 2 })).toEqual([
      { a: 2, b: 3, sum: 5 },
    ]);
  });

  it('skips fully-blank rows', () => {
    const data: SpreadsheetData = {
      cells: { A1: 'x', A2: '1', A4: '2' },
    };
    expect(spreadsheetToRecords(data, { cols: 1, rows: 4 })).toEqual([
      { x: 1 },
      { x: 2 },
    ]);
  });

  it('renders error cells as null so charts skip them', () => {
    const data: SpreadsheetData = {
      cells: { A1: 'v', A2: '5', A3: '=1/0' },
    };
    expect(spreadsheetToRecords(data, { cols: 1, rows: 3 })).toEqual([
      { v: 5 },
    ]);
  });

  it('falls back to addr-style header when row 1 is blank for that column', () => {
    const data: SpreadsheetData = {
      cells: { A1: 'name', A2: 'Ada', B2: '99' },
    };
    expect(spreadsheetToRecords(data, { cols: 2, rows: 2 })).toEqual([
      { name: 'Ada', B1: 99 },
    ]);
  });
});

describe('TkxSpreadsheet UI', () => {
  it('renders column headers + row headers', () => {
    render(<Harness initial={{ cells: {} }} />, { wrapper: W });
    expect(screen.getByTestId('col-A')).toBeInTheDocument();
    expect(screen.getByTestId('col-D')).toBeInTheDocument();
    expect(screen.getByTestId('cell-A1')).toBeInTheDocument();
    expect(screen.getByTestId('cell-D5')).toBeInTheDocument();
  });

  it('selects A1 by default', () => {
    render(<Harness initial={{ cells: {} }} />, { wrapper: W });
    expect(screen.getByTestId('cell-A1')).toHaveAttribute('aria-selected', 'true');
  });

  it('moves selection with arrow keys', () => {
    render(<Harness initial={{ cells: {} }} />, { wrapper: W });
    const grid = screen.getByTestId('tkx-spreadsheet');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(screen.getByTestId('cell-B1')).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(screen.getByTestId('cell-B2')).toHaveAttribute('aria-selected', 'true');
  });

  it('renders evaluated formula values', () => {
    render(<Harness initial={{ cells: { A1: '5', A2: '7', A3: '=A1+A2' } }} />, { wrapper: W });
    expect(screen.getByTestId('cell-A3').textContent).toBe('12');
  });

  it('renders error sentinel for circular refs', () => {
    render(<Harness initial={{ cells: { A1: '=B1', B1: '=A1' } }} />, { wrapper: W });
    expect(screen.getByTestId('cell-A1').textContent).toBe('#CYCLE!');
  });

  it('starts editing on Enter and commits on Enter', () => {
    render(<Harness initial={{ cells: {} }} />, { wrapper: W });
    const grid = screen.getByTestId('tkx-spreadsheet');
    fireEvent.keyDown(grid, { key: 'Enter' });
    // rAF schedules focus; flush it
    act(() => {
      // Vitest jsdom doesn't run rAF automatically — fine, the input is in the DOM.
    });
    const input = screen.getByTestId('cell-input-A1') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '=2+3' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByTestId('cell-A1').textContent).toBe('5');
  });

  it('Delete clears the active cell', () => {
    render(<Harness initial={{ cells: { A1: '99' } }} />, { wrapper: W });
    expect(screen.getByTestId('cell-A1').textContent).toBe('99');
    fireEvent.keyDown(screen.getByTestId('tkx-spreadsheet'), { key: 'Delete' });
    expect(screen.getByTestId('cell-A1').textContent).toBe('');
  });

  it('Tab moves selection right, Shift+Tab moves left', () => {
    render(<Harness initial={{ cells: {} }} />, { wrapper: W });
    const grid = screen.getByTestId('tkx-spreadsheet');
    fireEvent.keyDown(grid, { key: 'Tab' });
    expect(screen.getByTestId('cell-B1')).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(grid, { key: 'Tab', shiftKey: true });
    expect(screen.getByTestId('cell-A1')).toHaveAttribute('aria-selected', 'true');
  });
});
