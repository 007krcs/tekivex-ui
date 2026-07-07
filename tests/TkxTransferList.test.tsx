import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxTransferList, type TransferItem } from '../src/components/TkxTransferList';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const small: TransferItem[] = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
];

const many: TransferItem[] = Array.from({ length: 5000 }, (_, i) => ({
  value: `v${i}`,
  label: `Item ${i}`,
}));

describe('TkxTransferList', () => {
  it('renders both panels with all rows for a small list', () => {
    render(<TkxTransferList sourceItems={small} targetItems={[]} onTransfer={() => {}} />, { wrapper: W });
    expect(screen.getByText('Apple')).toBeTruthy();
    expect(screen.getByText('Banana')).toBeTruthy();
    expect(screen.getByText('Cherry')).toBeTruthy();
  });

  it('transfers a selected item to the target panel', () => {
    const onTransfer = vi.fn();
    render(<TkxTransferList sourceItems={small} targetItems={[]} onTransfer={onTransfer} />, { wrapper: W });
    fireEvent.click(screen.getByText('Banana'));
    fireEvent.click(screen.getByLabelText('Move selected items to target list'));
    expect(onTransfer).toHaveBeenCalledTimes(1);
    const [remainingSource, newTarget] = onTransfer.mock.calls[0];
    expect(remainingSource.map((i: TransferItem) => i.value)).toEqual(['a', 'c']);
    expect(newTarget.map((i: TransferItem) => i.value)).toEqual(['b']);
  });

  it('small list is NOT virtualized — every option is in the DOM', () => {
    render(<TkxTransferList sourceItems={small} targetItems={[]} onTransfer={() => {}} />, { wrapper: W });
    // 3 source options (target empty). No spacers, all rows present.
    expect(screen.getAllByRole('option').length).toBe(3);
  });

  it('large list IS virtualized — only a window of rows renders', () => {
    render(<TkxTransferList sourceItems={many} targetItems={[]} onTransfer={() => {}} />, { wrapper: W });
    const options = screen.getAllByRole('option');
    // Far fewer than 5000 rendered; the window is small.
    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThan(200);
    // aria-setsize still reflects the FULL list for screen readers.
    expect(options[0].getAttribute('aria-setsize')).toBe('5000');
  });

  it('the first row is keyboard-reachable (roving tabindex) in a virtualized list', () => {
    render(<TkxTransferList sourceItems={many} targetItems={[]} onTransfer={() => {}} />, { wrapper: W });
    const options = screen.getAllByRole('option');
    const tabbable = options.filter((o) => o.getAttribute('tabindex') === '0');
    expect(tabbable.length).toBe(1);
    expect(tabbable[0].getAttribute('aria-posinset')).toBe('1');
  });

  it('search filters the visible rows', () => {
    render(<TkxTransferList sourceItems={small} targetItems={[]} onTransfer={() => {}} searchable />, { wrapper: W });
    const search = screen.getByLabelText('Search Available');
    fireEvent.change(search, { target: { value: 'ban' } });
    const source = search.closest('div')!.parentElement!;
    expect(within(source).queryByText('Apple')).toBeNull();
    expect(within(source).getByText('Banana')).toBeTruthy();
  });

  it('survives a bare mount', () => {
    expect(() =>
      render(<TkxTransferList sourceItems={[]} targetItems={[]} onTransfer={() => {}} />, { wrapper: W }),
    ).not.toThrow();
  });
});
