import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import {
  TkxGantt,
  parseDay,
  formatDay,
  dayDiff,
  type GanttTask,
} from '../src/components/TkxGantt';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const TASKS: GanttTask[] = [
  { id: 't1', label: 'Design',  start: '2026-05-01', end: '2026-05-05', progress: 1 },
  { id: 't2', label: 'Build',   start: '2026-05-06', end: '2026-05-12', progress: 0.5, dependencies: ['t1'] },
  { id: 't3', label: 'Verify',  start: '2026-05-13', end: '2026-05-15', dependencies: ['t2'] },
];

describe('parseDay / formatDay / dayDiff', () => {
  it('parses ISO YYYY-MM-DD as UTC midnight', () => {
    const d = parseDay('2026-05-01');
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(4);
    expect(d.getUTCDate()).toBe(1);
    expect(d.getUTCHours()).toBe(0);
  });

  it('round-trips through formatDay', () => {
    expect(formatDay(parseDay('2026-12-31'))).toBe('2026-12-31');
  });

  it('rejects malformed input', () => {
    expect(() => parseDay('not-a-date')).toThrow();
  });

  it('computes inclusive day diff', () => {
    expect(dayDiff(parseDay('2026-05-01'), parseDay('2026-05-03'))).toBe(2);
    expect(dayDiff(parseDay('2026-05-01'), parseDay('2026-05-01'))).toBe(0);
  });
});

describe('TkxGantt', () => {
  it('renders a label + bar for every task', () => {
    render(<TkxGantt tasks={TASKS} />, { wrapper: W });
    for (const t of TASKS) {
      expect(screen.getByTestId(`gantt-label-${t.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`gantt-bar-${t.id}`)).toBeInTheDocument();
    }
  });

  it('selects the first task by default', () => {
    render(<TkxGantt tasks={TASKS} />, { wrapper: W });
    expect(screen.getByTestId('gantt-bar-t1')).toHaveAttribute('aria-pressed', 'true');
  });

  it('selects a task on click and fires onSelect', () => {
    const onSelect = vi.fn();
    render(<TkxGantt tasks={TASKS} onSelect={onSelect} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('gantt-bar-t2'));
    expect(onSelect).toHaveBeenCalledWith('t2', expect.objectContaining({ id: 't2' }));
    expect(screen.getByTestId('gantt-bar-t2')).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders a dependency arrow per dependency', () => {
    render(<TkxGantt tasks={TASKS} />, { wrapper: W });
    expect(screen.getByTestId('gantt-arrow-t1-to-t2')).toBeInTheDocument();
    expect(screen.getByTestId('gantt-arrow-t2-to-t3')).toBeInTheDocument();
  });

  it('arrow-down moves selection to the next task', () => {
    render(<TkxGantt tasks={TASKS} />, { wrapper: W });
    fireEvent.keyDown(screen.getByTestId('tkx-gantt'), { key: 'ArrowDown' });
    expect(screen.getByTestId('gantt-bar-t2')).toHaveAttribute('aria-pressed', 'true');
  });

  it('arrow-right shifts the selected task by one day', () => {
    const onTaskChange = vi.fn();
    render(<TkxGantt tasks={TASKS} onTaskChange={onTaskChange} />, { wrapper: W });
    fireEvent.keyDown(screen.getByTestId('tkx-gantt'), { key: 'ArrowRight' });
    expect(onTaskChange).toHaveBeenCalledWith(
      't1',
      { start: '2026-05-02', end: '2026-05-06' },
      expect.objectContaining({ id: 't1' }),
    );
  });

  it('arrow-left shifts the selected task back by one day', () => {
    const onTaskChange = vi.fn();
    render(<TkxGantt tasks={TASKS} onTaskChange={onTaskChange} />, { wrapper: W });
    fireEvent.keyDown(screen.getByTestId('tkx-gantt'), { key: 'ArrowLeft' });
    expect(onTaskChange).toHaveBeenCalledWith(
      't1',
      { start: '2026-04-30', end: '2026-05-04' },
      expect.objectContaining({ id: 't1' }),
    );
  });

  it('respects controlled selectedId', () => {
    render(<TkxGantt tasks={TASKS} selectedId="t3" />, { wrapper: W });
    expect(screen.getByTestId('gantt-bar-t3')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('gantt-bar-t1')).toHaveAttribute('aria-pressed', 'false');
  });

  it('exposes a readable aria-label on each bar', () => {
    render(<TkxGantt tasks={TASKS} />, { wrapper: W });
    expect(screen.getByTestId('gantt-bar-t1')).toHaveAttribute(
      'aria-label',
      'Design: 2026-05-01 to 2026-05-05',
    );
  });

  it('handles empty task list without crashing', () => {
    render(<TkxGantt tasks={[]} />, { wrapper: W });
    expect(screen.getByTestId('tkx-gantt')).toBeInTheDocument();
  });
});
