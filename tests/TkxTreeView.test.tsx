import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxTreeView } from '../src/components/TkxTreeView';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';
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
      { id: 'child2', label: 'Child Two' },
    ],
  },
  { id: 'sibling', label: 'Sibling' },
];

describe('TkxTreeView', () => {
  it('renders the tree with role tree', () => {
    render(<TkxTreeView data={treeData} />, { wrapper: Wrapper });
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('renders root-level items', () => {
    render(<TkxTreeView data={treeData} />, { wrapper: Wrapper });
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('Sibling')).toBeInTheDocument();
  });

  it('shows children when node is expanded', () => {
    render(<TkxTreeView data={treeData} expanded={['root']} />, { wrapper: Wrapper });
    expect(screen.getByText('Child One')).toBeInTheDocument();
    expect(screen.getByText('Child Two')).toBeInTheDocument();
  });

  it('hides children when node is not expanded', () => {
    render(<TkxTreeView data={treeData} expanded={[]} />, { wrapper: Wrapper });
    expect(screen.queryByText('Child One')).not.toBeInTheDocument();
  });

  it('calls onSelect when a node is clicked', () => {
    const onSelect = vi.fn();
    render(<TkxTreeView data={treeData} onSelect={onSelect} expanded={['root']} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Child One'));
    expect(onSelect).toHaveBeenCalled();
  });
});
