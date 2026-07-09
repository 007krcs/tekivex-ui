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

  // Regression (a11y MEDIUM #6, deferred remainder): columns render as sibling
  // role="group" lists, so hierarchy must be expressed via explicit ARIA
  // structure props per APG Tree View.
  it('exposes aria-level/setsize/posinset across both columns', () => {
    render(<TkxCascader options={options} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('combobox'));

    // Drill into "India" so the second column renders.
    const india = screen.getByText('India').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.mouseEnter(india);

    // Column 1: India (1/2), USA (2/2), level 1.
    const usa = screen.getByText('USA').closest('[role="treeitem"]') as HTMLElement;
    expect(india).toHaveAttribute('aria-level', '1');
    expect(india).toHaveAttribute('aria-setsize', '2');
    expect(india).toHaveAttribute('aria-posinset', '1');
    expect(usa).toHaveAttribute('aria-level', '1');
    expect(usa).toHaveAttribute('aria-setsize', '2');
    expect(usa).toHaveAttribute('aria-posinset', '2');

    // Column 2: Karnataka (1/2), Tamil Nadu (2/2), level 2.
    const karnataka = screen.getByText('Karnataka').closest('[role="treeitem"]') as HTMLElement;
    const tamilNadu = screen.getByText('Tamil Nadu').closest('[role="treeitem"]') as HTMLElement;
    expect(karnataka).toHaveAttribute('aria-level', '2');
    expect(karnataka).toHaveAttribute('aria-setsize', '2');
    expect(karnataka).toHaveAttribute('aria-posinset', '1');
    expect(tamilNadu).toHaveAttribute('aria-level', '2');
    expect(tamilNadu).toHaveAttribute('aria-setsize', '2');
    expect(tamilNadu).toHaveAttribute('aria-posinset', '2');
  });

  it('flips parent aria-expanded when drilled into and back', () => {
    render(<TkxCascader options={options} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('combobox'));

    const india = screen.getByText('India').closest('[role="treeitem"]') as HTMLElement;
    const usa = screen.getByText('USA').closest('[role="treeitem"]') as HTMLElement;

    // Parent starts collapsed; leaves carry no aria-expanded at all.
    expect(india).toHaveAttribute('aria-expanded', 'false');
    expect(usa).not.toHaveAttribute('aria-expanded');

    // Drill in: parent expands and its child column appears.
    fireEvent.mouseEnter(india);
    expect(india).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Karnataka')).toBeInTheDocument();

    // Move to the sibling leaf: parent collapses again.
    fireEvent.mouseEnter(usa);
    expect(india).toHaveAttribute('aria-expanded', 'false');
    expect(usa).not.toHaveAttribute('aria-expanded');
  });

  it('expanded parent owns its child column group via aria-owns', () => {
    render(<TkxCascader options={options} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('combobox'));

    const india = screen.getByText('India').closest('[role="treeitem"]') as HTMLElement;

    // Collapsed: no owns idref (a dangling idref is an ARIA defect).
    expect(india).not.toHaveAttribute('aria-owns');

    fireEvent.mouseEnter(india);
    const ownsId = india.getAttribute('aria-owns');
    expect(ownsId).toBeTruthy();
    const owned = document.getElementById(ownsId!);
    expect(owned).not.toBeNull();
    expect(owned!.getAttribute('role')).toBe('group');
    // The owned group is the child column containing India's children.
    expect(owned).toContainElement(
      screen.getByText('Karnataka').closest('[role="treeitem"]') as HTMLElement,
    );
    expect(owned).toContainElement(
      screen.getByText('Tamil Nadu').closest('[role="treeitem"]') as HTMLElement,
    );
    // The leaf sibling never owns anything.
    const usa = screen.getByText('USA').closest('[role="treeitem"]') as HTMLElement;
    expect(usa).not.toHaveAttribute('aria-owns');
  });
});
