import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import {
  TkxDataExplorer,
  parseCSV,
  csvToRecords,
  inferColumnTypes,
} from '../src/charts/TkxDataExplorer';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// Recharts uses ResponsiveContainer which needs a width — stub it in jsdom.
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 600, height: 320 }}>{children}</div>
    ),
  };
});

describe('parseCSV', () => {
  it('parses a simple table', () => {
    expect(parseCSV('a,b\n1,2\n3,4')).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('handles quoted fields with embedded commas', () => {
    expect(parseCSV('name,desc\nAda,"Hello, world"\n')).toEqual([
      ['name', 'desc'],
      ['Ada', 'Hello, world'],
    ]);
  });

  it('handles doubled-quote escapes', () => {
    expect(parseCSV('a\n"He said ""hi"""')).toEqual([
      ['a'],
      ['He said "hi"'],
    ]);
  });

  it('handles CRLF line endings', () => {
    expect(parseCSV('a,b\r\n1,2\r\n3,4\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });
});

describe('csvToRecords', () => {
  it('coerces numeric values', () => {
    const rows = parseCSV('name,score\nAda,99\nGrace,95');
    const recs = csvToRecords(rows);
    expect(recs).toEqual([
      { name: 'Ada', score: 99 },
      { name: 'Grace', score: 95 },
    ]);
  });

  it('keeps string values as strings', () => {
    const rows = parseCSV('a,b\nfoo,bar');
    expect(csvToRecords(rows)).toEqual([{ a: 'foo', b: 'bar' }]);
  });

  it('treats empty cells as null', () => {
    const rows = parseCSV('a,b\n1,\n,2');
    expect(csvToRecords(rows)).toEqual([
      { a: 1, b: null },
      { a: null, b: 2 },
    ]);
  });

  it('returns empty for header-only data', () => {
    expect(csvToRecords(parseCSV('a,b'))).toEqual([]);
  });
});

describe('inferColumnTypes', () => {
  it('flags numeric and string columns', () => {
    const t = inferColumnTypes([
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
    ]);
    expect(t).toEqual({ a: 'number', b: 'string' });
  });

  it('flags mixed columns', () => {
    const t = inferColumnTypes([
      { v: 1 },
      { v: 'x' },
    ]);
    expect(t).toEqual({ v: 'mixed' });
  });

  it('skips nulls when inferring', () => {
    const t = inferColumnTypes([
      { v: null },
      { v: 1 },
      { v: 2 },
    ]);
    expect(t).toEqual({ v: 'number' });
  });
});

describe('TkxDataExplorer UI', () => {
  it('shows the upload zone when no data is loaded', () => {
    render(<TkxDataExplorer />, { wrapper: W });
    expect(screen.getByTestId('upload-zone')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-container')).not.toBeInTheDocument();
  });

  it('parses pasted CSV and shows the preview + chart picker', () => {
    render(<TkxDataExplorer />, { wrapper: W });
    fireEvent.change(screen.getByTestId('paste-area'), {
      target: { value: 'name,score\nAda,99\nGrace,95' },
    });
    fireEvent.click(screen.getByTestId('parse-button'));
    expect(screen.getByTestId('preview-row-0').textContent).toMatch(/Ada/);
    expect(screen.getByTestId('preview-row-1').textContent).toMatch(/Grace/);
    expect(screen.getByTestId('chart-bar')).toHaveAttribute('aria-selected', 'true');
  });

  it('parses pasted JSON', () => {
    render(<TkxDataExplorer />, { wrapper: W });
    fireEvent.change(screen.getByTestId('paste-area'), {
      target: { value: '[{"name":"Ada","score":99},{"name":"Grace","score":95}]' },
    });
    fireEvent.click(screen.getByTestId('parse-button'));
    expect(screen.getByTestId('preview-row-0').textContent).toMatch(/Ada/);
  });

  it('parses { data: [...] } JSON shape', () => {
    render(<TkxDataExplorer />, { wrapper: W });
    fireEvent.change(screen.getByTestId('paste-area'), {
      target: { value: '{"data":[{"name":"Ada","score":99}]}' },
    });
    fireEvent.click(screen.getByTestId('parse-button'));
    expect(screen.getByTestId('preview-row-0').textContent).toMatch(/Ada/);
  });

  it('surfaces parse errors via role="alert"', () => {
    render(<TkxDataExplorer />, { wrapper: W });
    fireEvent.change(screen.getByTestId('paste-area'), {
      target: { value: '{not valid json or csv {{{' },
    });
    fireEvent.click(screen.getByTestId('parse-button'));
    expect(screen.getByTestId('parse-error')).toBeInTheDocument();
  });

  it('switches chart type on click', () => {
    render(
      <TkxDataExplorer
        initialData={[
          { name: 'Ada', score: 99 },
          { name: 'Grace', score: 95 },
        ]}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByTestId('chart-line'));
    expect(screen.getByTestId('chart-line')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('chart-bar')).toHaveAttribute('aria-selected', 'false');
  });

  it('clears data on demand', () => {
    render(
      <TkxDataExplorer
        initialData={[{ name: 'Ada', score: 99 }]}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByTestId('clear-data'));
    expect(screen.queryByTestId('preview-row-0')).not.toBeInTheDocument();
    expect(screen.getByTestId('upload-zone')).toBeInTheDocument();
  });

  it('respects allowedCharts to restrict the picker', () => {
    render(
      <TkxDataExplorer
        initialData={[{ name: 'Ada', score: 99 }]}
        allowedCharts={['bar', 'line']}
      />,
      { wrapper: W },
    );
    expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-pie')).not.toBeInTheDocument();
  });

  it('fires onDataLoad after parse', () => {
    const onDataLoad = vi.fn();
    render(<TkxDataExplorer onDataLoad={onDataLoad} />, { wrapper: W });
    fireEvent.change(screen.getByTestId('paste-area'), {
      target: { value: 'a,b\n1,2' },
    });
    fireEvent.click(screen.getByTestId('parse-button'));
    expect(onDataLoad).toHaveBeenCalledWith([{ a: 1, b: 2 }]);
  });

  it('toggles Y series via the field chips', () => {
    render(
      <TkxDataExplorer
        initialData={[
          { name: 'A', x: 1, y: 2 },
          { name: 'B', x: 3, y: 4 },
        ]}
      />,
      { wrapper: W },
    );
    // Pre-selected: first numeric field
    expect(screen.getByTestId('y-x')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByTestId('y-y'));
    expect(screen.getByTestId('y-y')).toHaveAttribute('aria-pressed', 'true');
  });
});
