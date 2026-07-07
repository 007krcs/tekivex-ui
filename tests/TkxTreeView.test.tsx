import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxTreeView } from '../src/components/TkxTreeView';
import { ThemeProvider, quantumDark } from '../src/themes';
import type { TreeNode } from '../src/components/TkxTreeView';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const treeData: TreeNode[] = [
  {
    id: 'root',
    label: 'Root',
    children: [
      { id: 'child1', label: 'Child One' },
      {
        id: 'child2',
        label: 'Child Two',
        children: [{ id: 'gchild', label: 'Grandchild' }],
      },
    ],
  },
  { id: 'sibling', label: 'Sibling' },
];

describe('TkxTreeView', () => {
  // ── Basics ────────────────────────────────────────────────────────────────
  describe('basics', () => {
    it('renders with role="tree"', () => {
      render(<TkxTreeView data={treeData} />, { wrapper: Wrapper });
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('renders root-level items', () => {
      render(<TkxTreeView data={treeData} />, { wrapper: Wrapper });
      expect(screen.getByText('Root')).toBeInTheDocument();
      expect(screen.getByText('Sibling')).toBeInTheDocument();
    });

    it('children are hidden by default (collapsed)', () => {
      render(<TkxTreeView data={treeData} />, { wrapper: Wrapper });
      expect(screen.queryByText('Child One')).not.toBeInTheDocument();
    });

    it('empty data renders without crash', () => {
      render(<TkxTreeView data={[]} />, { wrapper: Wrapper });
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });
  });

  // ── Expansion ─────────────────────────────────────────────────────────────
  describe('expansion', () => {
    it('clicking expand chevron reveals children', () => {
      render(<TkxTreeView data={treeData} />, { wrapper: Wrapper });
      expect(screen.queryByText('Child One')).not.toBeInTheDocument();
      // Click the Root treeitem.
      fireEvent.click(screen.getByText('Root'));
      expect(screen.getByText('Child One')).toBeInTheDocument();
      expect(screen.getByText('Child Two')).toBeInTheDocument();
    });

    it('clicking expanded chevron collapses children (uncontrolled)', () => {
      // Use uncontrolled mode so internal state can flip back.
      render(<TkxTreeView data={treeData} />, { wrapper: Wrapper });
      // Expand first.
      fireEvent.click(screen.getByText('Root'));
      expect(screen.getByText('Child One')).toBeInTheDocument();
      // Collapse.
      fireEvent.click(screen.getByText('Root'));
      expect(screen.queryByText('Child One')).not.toBeInTheDocument();
    });

    it('controlled expanded prop respected', () => {
      render(<TkxTreeView data={treeData} expanded={['root']} />, { wrapper: Wrapper });
      expect(screen.getByText('Child One')).toBeInTheDocument();
    });

    it('onExpand fires when expanding a node', () => {
      const onExpand = vi.fn();
      render(<TkxTreeView data={treeData} onExpand={onExpand} />, { wrapper: Wrapper });
      fireEvent.click(screen.getByText('Root'));
      expect(onExpand).toHaveBeenCalled();
      // Most recent call should include 'root'.
      const lastCall = onExpand.mock.calls[onExpand.mock.calls.length - 1][0] as string[];
      expect(lastCall).toContain('root');
    });

    it('aria-expanded toggles on click', () => {
      render(<TkxTreeView data={treeData} />, { wrapper: Wrapper });
      const rootItem = screen.getByText('Root').closest('[role="treeitem"]') as HTMLElement;
      expect(rootItem.getAttribute('aria-expanded')).toBe('false');
      fireEvent.click(screen.getByText('Root'));
      const rootAfter = screen.getByText('Root').closest('[role="treeitem"]') as HTMLElement;
      expect(rootAfter.getAttribute('aria-expanded')).toBe('true');
    });
  });

  // ── Selection ─────────────────────────────────────────────────────────────
  describe('selection', () => {
    it('calls onSelect when a leaf is clicked', () => {
      const onSelect = vi.fn();
      render(
        <TkxTreeView data={treeData} onSelect={onSelect} expanded={['root']} />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByText('Child One'));
      expect(onSelect).toHaveBeenCalledWith(['child1']);
    });

    it('selecting same leaf again deselects it (single-select)', () => {
      const onSelect = vi.fn();
      render(
        <TkxTreeView data={treeData} onSelect={onSelect} expanded={['root']} />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByText('Child One'));
      expect(onSelect).toHaveBeenLastCalledWith(['child1']);
      fireEvent.click(screen.getByText('Child One'));
      expect(onSelect).toHaveBeenLastCalledWith([]);
    });

    it('multiSelect allows selecting multiple leaves', () => {
      const onSelect = vi.fn();
      render(
        <TkxTreeView
          data={treeData}
          multiSelect
          onSelect={onSelect}
          expanded={['root']}
        />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByText('Child One'));
      expect(onSelect).toHaveBeenLastCalledWith(['child1']);
      fireEvent.click(screen.getByText('Sibling'));
      // The multiSelect onSelect receives the cumulative array; verify both ids present.
      const lastArg = onSelect.mock.calls[onSelect.mock.calls.length - 1][0] as string[];
      expect(lastArg).toContain('child1');
      expect(lastArg).toContain('sibling');
    });

    it('multiSelect: clicking selected leaf again unchecks it', () => {
      const onSelect = vi.fn();
      render(
        <TkxTreeView
          data={treeData}
          multiSelect
          selected={['child1', 'sibling']}
          onSelect={onSelect}
          expanded={['root']}
        />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByText('Child One'));
      expect(onSelect).toHaveBeenLastCalledWith(['sibling']);
    });

    it('selected nodes have aria-selected="true"', () => {
      render(
        <TkxTreeView data={treeData} selected={['sibling']} />,
        { wrapper: Wrapper },
      );
      const sib = screen.getByText('Sibling').closest('[role="treeitem"]') as HTMLElement;
      expect(sib.getAttribute('aria-selected')).toBe('true');
    });

    it('disabled nodes cannot be selected', () => {
      const onSelect = vi.fn();
      const dataWithDisabled: TreeNode[] = [
        { id: 'a', label: 'Active' },
        { id: 'd', label: 'Disabled', disabled: true },
      ];
      render(<TkxTreeView data={dataWithDisabled} onSelect={onSelect} />, {
        wrapper: Wrapper,
      });
      fireEvent.click(screen.getByText('Disabled'));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('disabled nodes get aria-disabled', () => {
      const dataWithDisabled: TreeNode[] = [
        { id: 'd', label: 'Disabled', disabled: true },
      ];
      render(<TkxTreeView data={dataWithDisabled} />, { wrapper: Wrapper });
      const item = screen.getByText('Disabled').closest('[role="treeitem"]') as HTMLElement;
      expect(item.getAttribute('aria-disabled')).toBe('true');
    });
  });

  // ── Keyboard navigation ───────────────────────────────────────────────────
  describe('keyboard navigation', () => {
    it('ArrowDown moves focus to next visible node', () => {
      render(<TkxTreeView data={treeData} expanded={['root']} />, { wrapper: Wrapper });
      const items = screen.getAllByRole('treeitem');
      items[0].focus();
      fireEvent.keyDown(items[0], { key: 'ArrowDown' });
      expect(document.activeElement).toBe(items[1]);
    });

    it('ArrowUp moves focus to previous visible node', () => {
      render(<TkxTreeView data={treeData} expanded={['root']} />, { wrapper: Wrapper });
      const items = screen.getAllByRole('treeitem');
      items[1].focus();
      fireEvent.keyDown(items[1], { key: 'ArrowUp' });
      expect(document.activeElement).toBe(items[0]);
    });

    it('ArrowRight expands a collapsed node with children', () => {
      const onExpand = vi.fn();
      render(<TkxTreeView data={treeData} onExpand={onExpand} />, { wrapper: Wrapper });
      const items = screen.getAllByRole('treeitem');
      items[0].focus();
      fireEvent.keyDown(items[0], { key: 'ArrowRight' });
      expect(onExpand).toHaveBeenCalled();
      const lastCall = onExpand.mock.calls[onExpand.mock.calls.length - 1][0] as string[];
      expect(lastCall).toContain('root');
    });

    it('ArrowLeft collapses an expanded node with children', () => {
      const onExpand = vi.fn();
      render(
        <TkxTreeView data={treeData} expanded={['root']} onExpand={onExpand} />,
        { wrapper: Wrapper },
      );
      const items = screen.getAllByRole('treeitem');
      items[0].focus();
      fireEvent.keyDown(items[0], { key: 'ArrowLeft' });
      expect(onExpand).toHaveBeenCalled();
      const lastCall = onExpand.mock.calls[onExpand.mock.calls.length - 1][0] as string[];
      expect(lastCall).not.toContain('root');
    });

    it('Home jumps to first visible node', () => {
      render(<TkxTreeView data={treeData} expanded={['root']} />, { wrapper: Wrapper });
      const items = screen.getAllByRole('treeitem');
      items[items.length - 1].focus();
      fireEvent.keyDown(items[items.length - 1], { key: 'Home' });
      expect(document.activeElement).toBe(items[0]);
    });

    it('End jumps to last visible node', () => {
      render(<TkxTreeView data={treeData} expanded={['root']} />, { wrapper: Wrapper });
      const items = screen.getAllByRole('treeitem');
      items[0].focus();
      fireEvent.keyDown(items[0], { key: 'End' });
      expect(document.activeElement).toBe(items[items.length - 1]);
    });

    it('Enter selects the focused leaf', () => {
      const onSelect = vi.fn();
      render(
        <TkxTreeView data={treeData} onSelect={onSelect} expanded={['root']} />,
        { wrapper: Wrapper },
      );
      const items = screen.getAllByRole('treeitem');
      // items[1] is Child One (a leaf).
      items[1].focus();
      fireEvent.keyDown(items[1], { key: 'Enter' });
      expect(onSelect).toHaveBeenCalledWith(['child1']);
    });

    it('Space selects the focused leaf', () => {
      const onSelect = vi.fn();
      render(
        <TkxTreeView data={treeData} onSelect={onSelect} expanded={['root']} />,
        { wrapper: Wrapper },
      );
      const items = screen.getAllByRole('treeitem');
      items[1].focus();
      fireEvent.keyDown(items[1], { key: ' ' });
      expect(onSelect).toHaveBeenCalledWith(['child1']);
    });
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────
  describe('aria', () => {
    it('container has role="tree"', () => {
      render(<TkxTreeView data={treeData} />, { wrapper: Wrapper });
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('items have aria-level reflecting depth', () => {
      render(<TkxTreeView data={treeData} expanded={['root', 'child2']} />, {
        wrapper: Wrapper,
      });
      const root = screen.getByText('Root').closest('[role="treeitem"]') as HTMLElement;
      const child = screen.getByText('Child One').closest('[role="treeitem"]') as HTMLElement;
      const grand = screen.getByText('Grandchild').closest('[role="treeitem"]') as HTMLElement;
      expect(root.getAttribute('aria-level')).toBe('1');
      expect(child.getAttribute('aria-level')).toBe('2');
      expect(grand.getAttribute('aria-level')).toBe('3');
    });

    it('tree has aria-multiselectable when multiSelect is true', () => {
      render(<TkxTreeView data={treeData} multiSelect />, { wrapper: Wrapper });
      expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
    });

    it('tree omits aria-multiselectable when single-select', () => {
      render(<TkxTreeView data={treeData} />, { wrapper: Wrapper });
      expect(screen.getByRole('tree')).not.toHaveAttribute('aria-multiselectable');
    });
  });

  // ── Visual props ──────────────────────────────────────────────────────────
  describe('visual props', () => {
    it('showCheckboxes renders a checkbox per row', () => {
      const { container } = render(
        <TkxTreeView data={treeData} showCheckboxes />,
        { wrapper: Wrapper },
      );
      // Checkbox is a span[role="presentation"] containing a 16x16 box; just
      // verify presence by checking the SVG-less checkbox span count matches
      // the visible item count.
      const items = container.querySelectorAll('[role="treeitem"]');
      // For each item there is exactly one checkbox span containing the box.
      // We assert there are at least as many presentation spans as items.
      const checkboxes = container.querySelectorAll('span[role="presentation"]');
      expect(checkboxes.length).toBeGreaterThanOrEqual(items.length);
    });

    it('renders icon when provided', () => {
      const dataWithIcon: TreeNode[] = [
        { id: 'a', label: 'With icon', icon: <span data-testid="my-icon">★</span> },
      ];
      render(<TkxTreeView data={dataWithIcon} />, { wrapper: Wrapper });
      expect(screen.getByTestId('my-icon')).toBeInTheDocument();
    });
  });

  // ── Security ──────────────────────────────────────────────────────────────
  describe('security', () => {
    it('sanitizes node labels with script tags', () => {
      const evil: TreeNode[] = [{ id: 'x', label: '<script>alert(1)</script>OK' }];
      const { container } = render(<TkxTreeView data={evil} />, { wrapper: Wrapper });
      expect(container.querySelector('script')).toBeNull();
    });
  });

  // ── aria-setsize / aria-posinset (per sibling group) ───────────────────────
  describe('aria set counts', () => {
    it('computes aria-setsize/aria-posinset per sibling group, not per depth', () => {
      render(<TkxTreeView data={treeData} expanded={['root', 'child2']} />, {
        wrapper: Wrapper,
      });
      const item = (label: string) =>
        screen.getByText(label).closest('[role="treeitem"]') as HTMLElement;

      // Root group = [Root, Sibling] → setsize 2.
      expect(item('Root').getAttribute('aria-setsize')).toBe('2');
      expect(item('Root').getAttribute('aria-posinset')).toBe('1');
      expect(item('Sibling').getAttribute('aria-setsize')).toBe('2');
      expect(item('Sibling').getAttribute('aria-posinset')).toBe('2');

      // Root's children = [Child One, Child Two] → setsize 2, independent of the
      // (buggy) old depth-scoped count which would have merged sibling groups.
      expect(item('Child One').getAttribute('aria-setsize')).toBe('2');
      expect(item('Child One').getAttribute('aria-posinset')).toBe('1');
      expect(item('Child Two').getAttribute('aria-posinset')).toBe('2');

      // Grandchild is an only child → setsize 1, posinset 1.
      expect(item('Grandchild').getAttribute('aria-setsize')).toBe('1');
      expect(item('Grandchild').getAttribute('aria-posinset')).toBe('1');
    });
  });

  // ── Roving tabindex ────────────────────────────────────────────────────────
  describe('roving tabindex', () => {
    it('first visible item is the initial tab stop', () => {
      render(<TkxTreeView data={treeData} expanded={['root']} />, { wrapper: Wrapper });
      const items = screen.getAllByRole('treeitem');
      expect(items[0].getAttribute('tabindex')).toBe('0');
      expect(items[1].getAttribute('tabindex')).toBe('-1');
    });

    it('tab stop follows keyboard focus', () => {
      render(<TkxTreeView data={treeData} expanded={['root']} />, { wrapper: Wrapper });
      let items = screen.getAllByRole('treeitem');
      items[0].focus();
      fireEvent.keyDown(items[0], { key: 'ArrowDown' });
      items = screen.getAllByRole('treeitem');
      expect(document.activeElement).toBe(items[1]);
      expect(items[1].getAttribute('tabindex')).toBe('0');
      expect(items[0].getAttribute('tabindex')).toBe('-1');
    });
  });

  // ── Virtualization (large trees) ───────────────────────────────────────────
  describe('virtualization', () => {
    // Flatten count must exceed the internal threshold (50) to window.
    function bigLeaves(n: number): TreeNode[] {
      return Array.from({ length: n }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` }));
    }

    it('small trees keep the exact all-rendered <ul> path (no windowing)', () => {
      render(<TkxTreeView data={bigLeaves(10)} />, { wrapper: Wrapper });
      const tree = screen.getByRole('tree');
      expect(tree.tagName).toBe('UL');
      // All 10 rows are present in the DOM.
      expect(screen.getAllByRole('treeitem')).toHaveLength(10);
      expect(screen.getByText('Node 9')).toBeInTheDocument();
    });

    it('large trees window: the scroll container is role="tree" and only a slice renders', () => {
      render(<TkxTreeView data={bigLeaves(60)} />, { wrapper: Wrapper });
      const tree = screen.getByRole('tree');
      // Now a scrollable div, not a <ul>.
      expect(tree.tagName).toBe('DIV');
      expect(tree).toHaveStyle({ overflowY: 'auto' });
      // Only a windowed subset renders, not all 60 rows.
      const rendered = screen.getAllByRole('treeitem');
      expect(rendered.length).toBeGreaterThan(0);
      expect(rendered.length).toBeLessThan(60);
      // A far-down node is NOT in the DOM yet.
      expect(screen.queryByText('Node 59')).not.toBeInTheDocument();
    });

    it('windowed rows still carry full-model aria set counts', () => {
      render(<TkxTreeView data={bigLeaves(60)} />, { wrapper: Wrapper });
      const first = screen.getByText('Node 0').closest('[role="treeitem"]') as HTMLElement;
      // setsize reflects the FULL sibling group (60), not the rendered slice.
      expect(first.getAttribute('aria-setsize')).toBe('60');
      expect(first.getAttribute('aria-posinset')).toBe('1');
    });

    it('focusing an off-window node scrolls it into view then focuses it (End key)', () => {
      render(<TkxTreeView data={bigLeaves(60)} />, { wrapper: Wrapper });
      // Last node is off-window initially.
      expect(screen.queryByText('Node 59')).not.toBeInTheDocument();

      const items = screen.getAllByRole('treeitem');
      items[0].focus();
      fireEvent.keyDown(items[0], { key: 'End' });

      // It is now mounted and holds focus.
      const last = screen.getByText('Node 59').closest('[role="treeitem"]') as HTMLElement;
      expect(last).toBeInTheDocument();
      expect(document.activeElement).toBe(last);
      expect(last.getAttribute('tabindex')).toBe('0');
    });

    it('expand/collapse in a windowed tree recomputes visible model correctly', () => {
      // First root has children; enough leaves after it to force windowing.
      const data: TreeNode[] = [
        {
          id: 'parent',
          label: 'Parent',
          children: [
            { id: 'kid-a', label: 'Kid A' },
            { id: 'kid-b', label: 'Kid B' },
          ],
        },
        ...Array.from({ length: 60 }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` })),
      ];
      render(<TkxTreeView data={data} />, { wrapper: Wrapper });
      expect(screen.getByRole('tree').tagName).toBe('DIV');
      // Collapsed: children absent.
      expect(screen.queryByText('Kid A')).not.toBeInTheDocument();

      // Expand near the top of the window.
      fireEvent.click(screen.getByText('Parent'));
      const kidA = screen.getByText('Kid A').closest('[role="treeitem"]') as HTMLElement;
      expect(kidA).toBeInTheDocument();
      expect(kidA.getAttribute('aria-level')).toBe('2');
      expect(kidA.getAttribute('aria-setsize')).toBe('2');
      expect(kidA.getAttribute('aria-posinset')).toBe('1');

      // Collapse again: children drop back out of the visible model.
      fireEvent.click(screen.getByText('Parent'));
      expect(screen.queryByText('Kid A')).not.toBeInTheDocument();
    });

    it('collapsing an ancestor of the focused node keeps exactly one tab stop', () => {
      // Regression: when focusedId points at a node that leaves the flattened
      // model (collapse via chevron does not run setFocusedId), the tab stop
      // must fall back to the first row — not vanish, leaving the whole tree
      // untabbable.
      const data: TreeNode[] = [
        {
          id: 'parent',
          label: 'Parent',
          children: [
            { id: 'kid-a', label: 'Kid A' },
            { id: 'kid-b', label: 'Kid B' },
          ],
        },
        { id: 'sib', label: 'Sibling' },
      ];
      render(<TkxTreeView data={data} />, { wrapper: Wrapper });
      // Expand, focus a descendant (focusedId := kid-b), then collapse Parent.
      fireEvent.click(screen.getByText('Parent'));
      const kidB = screen.getByText('Kid B').closest('[role="treeitem"]') as HTMLElement;
      fireEvent.focus(kidB);
      fireEvent.click(screen.getByText('Parent'));
      expect(screen.queryByText('Kid B')).not.toBeInTheDocument();
      const tabbable = screen
        .getAllByRole('treeitem')
        .filter((el) => el.getAttribute('tabindex') === '0');
      expect(tabbable).toHaveLength(1);
    });
  });
});
