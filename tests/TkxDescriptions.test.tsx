import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxDescriptions } from '../src/components/TkxDescriptions';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const ITEMS = [
  { key: 'name', label: 'Name', children: 'Ada Lovelace' },
  { key: 'email', label: 'Email', children: 'ada@example.com' },
  { key: 'role', label: 'Role', children: 'Admin' },
];

describe('TkxDescriptions', () => {
  it('survives a bare mount (no props at all)', () => {
    expect(() => render(<TkxDescriptions />, { wrapper: W })).not.toThrow();
  });

  it('renders item labels and values', () => {
    render(<TkxDescriptions items={ITEMS} colon={false} />, { wrapper: W });
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('ada@example.com')).toBeTruthy();
  });

  it('renders title and the right-aligned extra slot', () => {
    render(
      <TkxDescriptions
        items={ITEMS}
        title="User Info"
        extra={<button type="button">Edit</button>}
      />,
      { wrapper: W },
    );
    expect(screen.getByText('User Info')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeTruthy();
  });

  it('bordered renders a real table with th/td cells', () => {
    const { container } = render(<TkxDescriptions items={ITEMS} bordered />, {
      wrapper: W,
    });
    const table = container.querySelector('table');
    expect(table).toBeTruthy();
    const th = container.querySelector('th');
    expect(th).toBeTruthy();
    expect(th!.getAttribute('scope')).toBe('row');
    expect(th!.textContent).toBe('Name');
    const td = container.querySelector('td');
    expect(td).toBeTruthy();
    expect(td!.textContent).toBe('Ada Lovelace');
    // No <dl> in bordered mode.
    expect(container.querySelector('dl')).toBeNull();
  });

  it('non-bordered renders semantic dl/dt/dd', () => {
    const { container } = render(<TkxDescriptions items={ITEMS} />, { wrapper: W });
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelector('dl')).toBeTruthy();
    expect(container.querySelectorAll('dt').length).toBe(3);
    expect(container.querySelectorAll('dd').length).toBe(3);
  });

  it('span merges columns in bordered mode (colSpan on the value cell)', () => {
    const { container } = render(
      <TkxDescriptions
        column={3}
        bordered
        items={[
          { key: 'a', label: 'A', children: 'a-val' },
          { key: 'b', label: 'B', children: 'b-val', span: 2 },
        ]}
      />,
      { wrapper: W },
    );
    const tds = Array.from(container.querySelectorAll('td'));
    const aCell = tds.find((td) => td.textContent === 'a-val')!;
    const bCell = tds.find((td) => td.textContent === 'b-val')!;
    // span 1 → colSpan 1; span 2 → colSpan 2*2-1 = 3 (label th takes one slot).
    expect(aCell.colSpan).toBe(1);
    expect(bCell.colSpan).toBe(3);
  });

  it('clamps an oversized span to the columns remaining in the row', () => {
    const { container } = render(
      <TkxDescriptions
        column={2}
        bordered
        items={[
          { key: 'a', label: 'A', children: 'a-val' },
          { key: 'b', label: 'B', children: 'b-val', span: 99 },
        ]}
      />,
      { wrapper: W },
    );
    const bCell = Array.from(container.querySelectorAll('td')).find(
      (td) => td.textContent === 'b-val',
    )!;
    // Only 1 column left in the row → span clamps to 1 → colSpan 1.
    expect(bCell.colSpan).toBe(1);
  });

  it('column={1} stacks items in a single-column grid', () => {
    const { container } = render(<TkxDescriptions items={ITEMS} column={1} />, {
      wrapper: W,
    });
    const dl = container.querySelector('dl') as HTMLElement;
    expect(dl.style.gridTemplateColumns).toContain('repeat(1');
  });

  it('appends a colon in horizontal layout by default', () => {
    render(<TkxDescriptions items={[ITEMS[0]]} layout="horizontal" />, { wrapper: W });
    expect(screen.getByText('Name:')).toBeTruthy();
  });

  it('omits the colon with colon={false} and in vertical layout', () => {
    const { container, rerender } = render(
      <TkxDescriptions items={[ITEMS[0]]} layout="horizontal" colon={false} />,
      { wrapper: W },
    );
    expect(container.querySelector('dt')!.textContent).toBe('Name');

    rerender(<TkxDescriptions items={[ITEMS[0]]} layout="vertical" />);
    expect(container.querySelector('dt')!.textContent).toBe('Name');
  });

  it('applies labelStyle to label cells', () => {
    const { container } = render(
      <TkxDescriptions items={[ITEMS[0]]} labelStyle={{ color: 'rgb(255, 0, 0)' }} />,
      { wrapper: W },
    );
    const dt = container.querySelector('dt') as HTMLElement;
    expect(dt.style.color).toBe('rgb(255, 0, 0)');
  });

  it('accepts a responsive column object without crashing in jsdom', () => {
    expect(() =>
      render(
        <TkxDescriptions items={ITEMS} column={{ xs: 1, sm: 2, md: 3, lg: 4 }} />,
        { wrapper: W },
      ),
    ).not.toThrow();
    // jsdom's matchMedia stub matches nothing → xs bucket → 1 column.
    expect(
      (document.querySelector('dl') as HTMLElement).style.gridTemplateColumns,
    ).toContain('repeat(1');
  });
});
