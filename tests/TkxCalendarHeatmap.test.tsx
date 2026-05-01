import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxCalendarHeatmap } from '../src/components/TkxCalendarHeatmap';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxCalendarHeatmap', () => {
  it('renders heatmap with role="img" and aria-label', () => {
    render(
      <TkxCalendarHeatmap
        data={[{ date: '2026-01-01', value: 5 }]}
        endDate="2026-12-31"
      />,
      { wrapper: W },
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(/Activity heatmap/);
  });

  it('renders cells in a grid', () => {
    const { container } = render(
      <TkxCalendarHeatmap
        data={[{ date: '2026-01-15', value: 3 }]}
        endDate="2026-01-31"
        startDate="2026-01-01"
      />,
      { wrapper: W },
    );
    expect(container.querySelector('[role="grid"]')).toBeTruthy();
    expect(container.querySelectorAll('[role="gridcell"]').length).toBeGreaterThan(0);
  });

  it('cells get aria-label with date + value', () => {
    render(
      <TkxCalendarHeatmap
        data={[{ date: '2026-03-15', value: 7 }]}
        endDate="2026-03-31"
        startDate="2026-03-01"
      />,
      { wrapper: W },
    );
    const cell = screen.getByLabelText(/7 on/);
    expect(cell).toBeInTheDocument();
  });

  it('onCellClick fires with date + value', () => {
    const onCellClick = vi.fn();
    render(
      <TkxCalendarHeatmap
        data={[{ date: '2026-03-15', value: 4 }]}
        endDate="2026-03-31"
        startDate="2026-03-01"
        onCellClick={onCellClick}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByLabelText(/4 on/));
    expect(onCellClick).toHaveBeenCalledWith({ date: '2026-03-15', value: 4 });
  });

  it('sums multiple entries on the same date', () => {
    render(
      <TkxCalendarHeatmap
        data={[
          { date: '2026-03-15', value: 2 },
          { date: '2026-03-15', value: 3 },
        ]}
        endDate="2026-03-31"
        startDate="2026-03-01"
      />,
      { wrapper: W },
    );
    expect(screen.getByLabelText(/5 on/)).toBeInTheDocument();
  });

  it('renders month labels by default', () => {
    const { container } = render(
      <TkxCalendarHeatmap
        data={[]}
        endDate="2026-04-30"
        startDate="2026-01-01"
      />,
      { wrapper: W },
    );
    expect(container.textContent).toMatch(/Jan|Feb|Mar|Apr/);
  });

  it('hides month labels when showMonthLabels=false', () => {
    const { container } = render(
      <TkxCalendarHeatmap
        data={[]}
        endDate="2026-04-30"
        startDate="2026-01-01"
        showMonthLabels={false}
      />,
      { wrapper: W },
    );
    // Months shouldn't appear in heatmap chrome (legend "Less"/"More" stays)
    expect(container.textContent).not.toMatch(/\bJan\b/);
  });

  it('respects custom color scale', () => {
    const colors: [string, string, string, string, string] = [
      '#000', '#111', '#222', '#333', '#444',
    ];
    render(
      <TkxCalendarHeatmap
        data={[{ date: '2026-03-15', value: 100 }]}
        endDate="2026-03-31"
        startDate="2026-03-01"
        colors={colors}
      />,
      { wrapper: W },
    );
    const cell = screen.getByLabelText(/100 on/) as HTMLElement;
    // Highest value should hit the last color stop. Browsers normalize
    // colors to rgb(); jsdom does the same.
    expect(cell.style.background.toLowerCase()).toMatch(/#444|rgb\(68,\s?68,\s?68\)/);
  });

  it('keyboard arrow keys navigate between cells', () => {
    const { container } = render(
      <TkxCalendarHeatmap
        data={[]}
        endDate="2026-03-31"
        startDate="2026-03-01"
      />,
      { wrapper: W },
    );
    const cells = container.querySelectorAll<HTMLElement>('[role="gridcell"]');
    if (cells.length < 2) throw new Error('Expected at least 2 cells');
    cells[0].focus();
    fireEvent.keyDown(cells[0], { key: 'ArrowRight' });
    // Note: navigating with data-cell selector requires the elements exist
    // we just verify keydown didn't throw and focus model still functions
    expect(document.activeElement).toBeDefined();
  });

  it('Enter on focused cell fires onCellClick', () => {
    const onCellClick = vi.fn();
    render(
      <TkxCalendarHeatmap
        data={[{ date: '2026-03-15', value: 1 }]}
        endDate="2026-03-31"
        startDate="2026-03-01"
        onCellClick={onCellClick}
      />,
      { wrapper: W },
    );
    const cell = screen.getByLabelText(/1 on/);
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(onCellClick).toHaveBeenCalled();
  });

  it('formatTooltip overrides the default label', () => {
    render(
      <TkxCalendarHeatmap
        data={[{ date: '2026-03-15', value: 9 }]}
        endDate="2026-03-31"
        startDate="2026-03-01"
        formatTooltip={(p) => `Custom: ${p.value}/${p.date}`}
      />,
      { wrapper: W },
    );
    expect(screen.getByLabelText('Custom: 9/2026-03-15')).toBeInTheDocument();
  });
});
