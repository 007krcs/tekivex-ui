import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxMindMap, type MindMapNode } from '../src/components/TkxMindMap';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const TREE: MindMapNode = {
  id: 'root',
  label: 'Root',
  children: [
    {
      id: 'a',
      label: 'A',
      children: [
        { id: 'a1', label: 'A1' },
        { id: 'a2', label: 'A2' },
      ],
    },
    { id: 'b', label: 'B' },
    {
      id: 'c',
      label: 'C',
      children: [{ id: 'c1', label: 'C1' }],
    },
  ],
};

describe('TkxMindMap', () => {
  it('renders every node by default', () => {
    render(<TkxMindMap root={TREE} />, { wrapper: W });
    for (const id of ['root', 'a', 'a1', 'a2', 'b', 'c', 'c1']) {
      expect(screen.getByTestId(`mindmap-node-${id}`)).toBeInTheDocument();
    }
  });

  it('selects the root node by default and reflects aria-selected', () => {
    render(<TkxMindMap root={TREE} />, { wrapper: W });
    expect(screen.getByTestId('mindmap-node-root')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('mindmap-node-a')).toHaveAttribute('aria-selected', 'false');
  });

  it('selects a node on click and fires onSelect', () => {
    const onSelect = vi.fn();
    render(<TkxMindMap root={TREE} onSelect={onSelect} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('mindmap-node-a'));
    expect(onSelect).toHaveBeenCalledWith('a', expect.objectContaining({ id: 'a' }));
    expect(screen.getByTestId('mindmap-node-a')).toHaveAttribute('aria-selected', 'true');
  });

  it('collapses a subtree via the toggle button and hides descendants', () => {
    const onToggle = vi.fn();
    render(<TkxMindMap root={TREE} onToggle={onToggle} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('mindmap-toggle-a'));
    expect(onToggle).toHaveBeenCalledWith('a', true);
    expect(screen.queryByTestId('mindmap-node-a1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mindmap-node-a2')).not.toBeInTheDocument();
    // sibling subtrees stay
    expect(screen.getByTestId('mindmap-node-c1')).toBeInTheDocument();
  });

  it('exposes aria-expanded on internal nodes', () => {
    render(<TkxMindMap root={TREE} />, { wrapper: W });
    expect(screen.getByTestId('mindmap-node-a')).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByTestId('mindmap-toggle-a'));
    expect(screen.getByTestId('mindmap-node-a')).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not render aria-expanded on leaves', () => {
    render(<TkxMindMap root={TREE} />, { wrapper: W });
    expect(screen.getByTestId('mindmap-node-b')).not.toHaveAttribute('aria-expanded');
    expect(screen.getByTestId('mindmap-node-a1')).not.toHaveAttribute('aria-expanded');
  });

  it('arrow-right moves selection to the first child', () => {
    render(<TkxMindMap root={TREE} />, { wrapper: W });
    const tree = screen.getByTestId('tkx-mindmap');
    fireEvent.keyDown(tree, { key: 'ArrowRight' });
    expect(screen.getByTestId('mindmap-node-a')).toHaveAttribute('aria-selected', 'true');
  });

  it('arrow-down moves selection to the next sibling', () => {
    render(<TkxMindMap root={TREE} />, { wrapper: W });
    const tree = screen.getByTestId('tkx-mindmap');
    fireEvent.keyDown(tree, { key: 'ArrowRight' }); // root -> a
    fireEvent.keyDown(tree, { key: 'ArrowDown' });  // a -> b
    expect(screen.getByTestId('mindmap-node-b')).toHaveAttribute('aria-selected', 'true');
  });

  it('arrow-left moves selection to the parent', () => {
    render(<TkxMindMap root={TREE} />, { wrapper: W });
    const tree = screen.getByTestId('tkx-mindmap');
    fireEvent.keyDown(tree, { key: 'ArrowRight' }); // root -> a
    fireEvent.keyDown(tree, { key: 'ArrowRight' }); // a -> a1
    fireEvent.keyDown(tree, { key: 'ArrowLeft' });  // a1 -> a
    expect(screen.getByTestId('mindmap-node-a')).toHaveAttribute('aria-selected', 'true');
  });

  it('Enter toggles the selected node', () => {
    render(<TkxMindMap root={TREE} />, { wrapper: W });
    const tree = screen.getByTestId('tkx-mindmap');
    fireEvent.keyDown(tree, { key: 'ArrowRight' }); // root -> a
    fireEvent.keyDown(tree, { key: 'Enter' });
    expect(screen.queryByTestId('mindmap-node-a1')).not.toBeInTheDocument();
  });

  it('respects controlled selectedId', () => {
    const { rerender } = render(<TkxMindMap root={TREE} selectedId="b" />, { wrapper: W });
    expect(screen.getByTestId('mindmap-node-b')).toHaveAttribute('aria-selected', 'true');
    rerender(
      <ThemeProvider theme={quantumDark}>
        <TkxMindMap root={TREE} selectedId="c1" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('mindmap-node-c1')).toHaveAttribute('aria-selected', 'true');
  });

  it('respects pre-collapsed nodes from the tree shape', () => {
    const tree: MindMapNode = {
      id: 'root',
      label: 'Root',
      children: [
        {
          id: 'a',
          label: 'A',
          collapsed: true,
          children: [{ id: 'a1', label: 'A1' }],
        },
      ],
    };
    render(<TkxMindMap root={tree} />, { wrapper: W });
    expect(screen.queryByTestId('mindmap-node-a1')).not.toBeInTheDocument();
    expect(screen.getByTestId('mindmap-node-a')).toHaveAttribute('aria-expanded', 'false');
  });
});
