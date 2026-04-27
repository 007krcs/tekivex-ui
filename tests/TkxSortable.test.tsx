import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxSortable } from '../src/components/TkxSortable';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const ITEMS = [
  { id: 'a', data: 'Alpha' },
  { id: 'b', data: 'Bravo' },
  { id: 'c', data: 'Charlie' },
];

describe('TkxSortable', () => {
  it('renders all items', () => {
    render(
      <TkxSortable items={ITEMS} onChange={() => {}} renderItem={(item) => <span>{String(item.data)}</span>} />,
      { wrapper: W },
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Bravo')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('arrow-key reorder fires onChange with new ordering (vertical)', () => {
    const onChange = vi.fn();
    render(
      <TkxSortable
        items={ITEMS}
        onChange={onChange}
        renderItem={(item) => <span>{String(item.data)}</span>}
      />,
      { wrapper: W },
    );
    const listItems = screen.getAllByRole('listitem');
    listItems[0].focus();
    fireEvent.keyDown(listItems[0], { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls[0][0];
    expect(next[0].id).toBe('b'); // Alpha moved down
    expect(next[1].id).toBe('a');
  });

  it('does not move past list bounds', () => {
    const onChange = vi.fn();
    render(
      <TkxSortable items={ITEMS} onChange={onChange} renderItem={(item) => <span>{String(item.data)}</span>} />,
      { wrapper: W },
    );
    const listItems = screen.getAllByRole('listitem');
    fireEvent.keyDown(listItems[0], { key: 'ArrowUp' }); // already at top
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(listItems[2], { key: 'ArrowDown' }); // already at bottom
    expect(onChange).not.toHaveBeenCalled();
  });

  it('horizontal orientation uses left/right keys', () => {
    const onChange = vi.fn();
    render(
      <TkxSortable
        items={ITEMS}
        onChange={onChange}
        orientation="horizontal"
        renderItem={(item) => <span>{String(item.data)}</span>}
      />,
      { wrapper: W },
    );
    const listItems = screen.getAllByRole('listitem');
    fireEvent.keyDown(listItems[0], { key: 'ArrowDown' }); // wrong axis
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(listItems[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalled();
  });

  it('respects disabled prop', () => {
    const onChange = vi.fn();
    render(
      <TkxSortable
        items={ITEMS}
        onChange={onChange}
        disabled
        renderItem={(item) => <span>{String(item.data)}</span>}
      />,
      { wrapper: W },
    );
    const listItems = screen.getAllByRole('listitem');
    fireEvent.keyDown(listItems[0], { key: 'ArrowDown' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders ariaLabel on the list landmark', () => {
    render(
      <TkxSortable
        items={ITEMS}
        onChange={() => {}}
        ariaLabel="My list"
        renderItem={(item) => <span>{String(item.data)}</span>}
      />,
      { wrapper: W },
    );
    expect(screen.getByRole('list', { name: 'My list' })).toBeInTheDocument();
  });

  it('drag drop reorders items', () => {
    const onChange = vi.fn();
    render(
      <TkxSortable items={ITEMS} onChange={onChange} renderItem={(item) => <span>{String(item.data)}</span>} />,
      { wrapper: W },
    );
    const listItems = screen.getAllByRole('listitem');
    // Simulate drag from item 0 to item 2.
    fireEvent.dragStart(listItems[0], { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    fireEvent.dragOver(listItems[2], {
      dataTransfer: { dropEffect: '' },
      preventDefault: () => {},
    });
    fireEvent.drop(listItems[2], {
      dataTransfer: { dropEffect: '' },
      preventDefault: () => {},
    });
    expect(onChange).toHaveBeenCalled();
  });
});
