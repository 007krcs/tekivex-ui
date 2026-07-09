import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxCascader } from '../src/components/TkxCascader';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const options = [
  {
    value: 'in',
    label: 'India',
    children: [
      { value: 'ka', label: 'Karnataka' },
      { value: 'tn', label: 'Tamil Nadu' },
    ],
  },
  { value: 'us', label: 'USA' },
];

describe('TkxCascader', () => {
  it('opens the tree popup from the combobox trigger', () => {
    render(<TkxCascader options={options} />, { wrapper: Wrapper });
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('selects a leaf and fires onChange', () => {
    const onChange = vi.fn();
    render(<TkxCascader options={options} onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('India'));
    fireEvent.click(screen.getByText('Karnataka'));
    expect(onChange).toHaveBeenCalledWith(
      ['in', 'ka'],
      expect.arrayContaining([expect.objectContaining({ value: 'in' })]),
    );
  });

  // Regression (a11y MEDIUM): the role="combobox" trigger had no aria-controls
  // and the popup tree had no id, so the combobox↔popup relationship was never
  // conveyed to AT.
  it('wires the combobox to the popup tree via aria-controls', () => {
    render(<TkxCascader options={options} />, { wrapper: Wrapper });
    const trigger = screen.getByRole('combobox');

    // Closed: no dangling idref.
    expect(trigger).not.toHaveAttribute('aria-controls');

    fireEvent.click(trigger);
    const tree = screen.getByRole('tree');
    expect(tree.id).toBeTruthy();
    expect(trigger).toHaveAttribute('aria-controls', tree.id);
  });

  // Regression (a11y MEDIUM): the combobox exposed no aria-activedescendant,
  // so AT could not tell which treeitem was active. Treeitems now carry
  // deterministic ids the trigger points at.
  it('exposes the active treeitem via aria-activedescendant on the combobox', () => {
    render(<TkxCascader options={options} />, { wrapper: Wrapper });
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Activate "India" (mouse hover mirrors keyboard traversal state).
    const india = screen.getByText('India').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.mouseEnter(india);

    const activeId = trigger.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    const active = document.getElementById(activeId!);
    expect(active).not.toBeNull();
    expect(active!.getAttribute('role')).toBe('treeitem');
    expect(active).toBe(india);

    // Drill into the child column: the deepest active option wins.
    const karnataka = screen.getByText('Karnataka').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.mouseEnter(karnataka);
    expect(trigger.getAttribute('aria-activedescendant')).toBe(karnataka.id);
  });

  it('every treeitem has a unique id for activedescendant targeting', () => {
    render(<TkxCascader options={options} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('combobox'));
    const items = screen.getAllByRole('treeitem');
    const ids = items.map((el) => el.id);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
