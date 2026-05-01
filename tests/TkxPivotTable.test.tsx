import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxPivotTable, type PivotRecord } from '../src/components/TkxPivotTable';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const SALES: PivotRecord[] = [
  { region: 'East',  product: 'A', qty: 10, revenue: 100 },
  { region: 'East',  product: 'A', qty: 5,  revenue: 50 },
  { region: 'East',  product: 'B', qty: 7,  revenue: 70 },
  { region: 'West',  product: 'A', qty: 4,  revenue: 40 },
  { region: 'West',  product: 'B', qty: 8,  revenue: 80 },
  { region: 'West',  product: 'B', qty: 2,  revenue: 20 },
];

describe('TkxPivotTable', () => {
  it('renders one row per row-group key', () => {
    render(
      <TkxPivotTable
        data={SALES}
        rows={['region']}
        cols={['product']}
        values={[{ field: 'qty', agg: 'sum' }]}
      />,
      { wrapper: W },
    );
    expect(screen.getByTestId('pivot-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('pivot-row-1')).toBeInTheDocument();
    // East comes first (lex)
    expect(screen.getByTestId('pivot-row-0').textContent).toMatch(/East/);
  });

  it('renders one column header per col-group key', () => {
    render(
      <TkxPivotTable
        data={SALES}
        rows={['region']}
        cols={['product']}
        values={[{ field: 'qty', agg: 'sum' }]}
      />,
      { wrapper: W },
    );
    expect(screen.getByTestId('pivot-colhead-0-A')).toBeInTheDocument();
    expect(screen.getByTestId('pivot-colhead-0-B')).toBeInTheDocument();
  });

  it('aggregates sums correctly', () => {
    render(
      <TkxPivotTable
        data={SALES}
        rows={['region']}
        cols={['product']}
        values={[{ field: 'qty', agg: 'sum' }]}
      />,
      { wrapper: W },
    );
    // East · A: 10 + 5 = 15
    expect(screen.getByTestId('pivot-cell-0-0-0').textContent).toBe('15');
    // East · B: 7
    expect(screen.getByTestId('pivot-cell-0-1-0').textContent).toBe('7');
    // West · A: 4
    expect(screen.getByTestId('pivot-cell-1-0-0').textContent).toBe('4');
    // West · B: 8 + 2 = 10
    expect(screen.getByTestId('pivot-cell-1-1-0').textContent).toBe('10');
  });

  it('aggregates avg correctly', () => {
    render(
      <TkxPivotTable
        data={SALES}
        rows={['region']}
        cols={['product']}
        values={[{ field: 'qty', agg: 'avg' }]}
      />,
      { wrapper: W },
    );
    // East · A: (10+5)/2 = 7.5
    expect(screen.getByTestId('pivot-cell-0-0-0').textContent).toBe('7.5');
  });

  it('counts rows when agg is count', () => {
    render(
      <TkxPivotTable
        data={SALES}
        rows={['region']}
        cols={['product']}
        values={[{ agg: 'count', label: 'n' }]}
      />,
      { wrapper: W },
    );
    // East · A: 2 records
    expect(screen.getByTestId('pivot-cell-0-0-0').textContent).toBe('2');
  });

  it('renders min and max', () => {
    render(
      <TkxPivotTable
        data={SALES}
        rows={['region']}
        cols={['product']}
        values={[
          { field: 'qty', agg: 'min' },
          { field: 'qty', agg: 'max' },
        ]}
      />,
      { wrapper: W },
    );
    // East · A min/max: 5, 10
    expect(screen.getByTestId('pivot-cell-0-0-0').textContent).toBe('5');
    expect(screen.getByTestId('pivot-cell-0-0-1').textContent).toBe('10');
  });

  it('shows row totals + col totals + grand total', () => {
    render(
      <TkxPivotTable
        data={SALES}
        rows={['region']}
        cols={['product']}
        values={[{ field: 'qty', agg: 'sum' }]}
      />,
      { wrapper: W },
    );
    // East total: 22
    expect(screen.getByTestId('pivot-rowtotal-0-0').textContent).toBe('22');
    // West total: 14
    expect(screen.getByTestId('pivot-rowtotal-1-0').textContent).toBe('14');
    // A col total: 19, B col total: 17
    expect(screen.getByTestId('pivot-coltotal-0-0').textContent).toBe('19');
    expect(screen.getByTestId('pivot-coltotal-1-0').textContent).toBe('17');
    // Grand total: 36
    expect(screen.getByTestId('pivot-grandtotal-0').textContent).toBe('36');
  });

  it('handles empty col-group config (no col grouping)', () => {
    render(
      <TkxPivotTable
        data={SALES}
        rows={['region']}
        cols={[]}
        values={[{ field: 'qty', agg: 'sum' }]}
      />,
      { wrapper: W },
    );
    // 22, 14, 36 still all visible
    expect(screen.getByTestId('pivot-rowtotal-0-0').textContent).toBe('22');
    expect(screen.getByTestId('pivot-grandtotal-0').textContent).toBe('36');
  });

  it('respects a custom row sort comparator', () => {
    render(
      <TkxPivotTable
        data={SALES}
        rows={['region']}
        cols={['product']}
        values={[{ field: 'qty', agg: 'sum' }]}
        sortRows={(a, b) => (a < b ? 1 : a > b ? -1 : 0)} // reverse
      />,
      { wrapper: W },
    );
    // West first now
    expect(screen.getByTestId('pivot-row-0').textContent).toMatch(/West/);
  });

  it('hides totals when showTotals=false', () => {
    render(
      <TkxPivotTable
        data={SALES}
        rows={['region']}
        cols={['product']}
        values={[{ field: 'qty', agg: 'sum' }]}
        showTotals={false}
      />,
      { wrapper: W },
    );
    expect(screen.queryByTestId('pivot-totals-row')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pivot-rowtotal-0-0')).not.toBeInTheDocument();
  });

  it('throws when no values are configured', () => {
    expect(() =>
      render(
        <TkxPivotTable data={SALES} rows={['region']} values={[]} />,
        { wrapper: W },
      ),
    ).toThrow(/values/);
  });

  it('handles multi-level row groups', () => {
    render(
      <TkxPivotTable
        data={SALES}
        rows={['region', 'product']}
        cols={[]}
        values={[{ field: 'qty', agg: 'sum' }]}
      />,
      { wrapper: W },
    );
    // 4 leaves: East·A, East·B, West·A, West·B
    expect(screen.getByTestId('pivot-row-0').textContent).toMatch(/East/);
    expect(screen.getByTestId('pivot-row-3').textContent).toMatch(/West/);
  });
});
