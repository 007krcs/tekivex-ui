import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxOrgChart, type OrgNode } from '../src/components/TkxOrgChart';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

function wrap(ui: React.ReactElement) {
  return render(ui, { wrapper: Wrapper });
}

const data: OrgNode = {
  id: 'ceo',
  label: 'Alex Reed',
  subLabel: 'CEO',
  children: [
    {
      id: 'cto',
      label: 'Jamie Lin',
      subLabel: 'CTO',
      children: [
        { id: 'eng1', label: 'Sam P.', subLabel: 'Eng' },
        { id: 'eng2', label: 'Kim R.', subLabel: 'Eng' },
      ],
    },
    { id: 'cfo', label: 'Morgan Q.', subLabel: 'CFO' },
  ],
};

describe('TkxOrgChart', () => {
  // ── Basics ────────────────────────────────────────────────────────────────
  describe('basics', () => {
    it('renders root label', () => {
      wrap(<TkxOrgChart data={data} />);
      expect(screen.getByText('Alex Reed')).toBeInTheDocument();
    });

    it('renders all nodes expanded by default', () => {
      wrap(<TkxOrgChart data={data} />);
      expect(screen.getByText('Jamie Lin')).toBeInTheDocument();
      expect(screen.getByText('Sam P.')).toBeInTheDocument();
      expect(screen.getByText('Kim R.')).toBeInTheDocument();
      expect(screen.getByText('Morgan Q.')).toBeInTheDocument();
    });

    it('single-node chart still renders', () => {
      const solo: OrgNode = { id: 's', label: 'Solo' };
      wrap(<TkxOrgChart data={solo} />);
      expect(screen.getByText('Solo')).toBeInTheDocument();
    });

    it('renders badge text', () => {
      const withBadge: OrgNode = { id: 'x', label: 'X', badge: 'VP' };
      wrap(<TkxOrgChart data={withBadge} />);
      expect(screen.getByText('VP')).toBeInTheDocument();
    });

    it('horizontal direction renders', () => {
      wrap(<TkxOrgChart data={data} direction="horizontal" />);
      expect(screen.getByText('Alex Reed')).toBeInTheDocument();
    });
  });

  // ── Custom renderer ───────────────────────────────────────────────────────
  describe('custom renderer', () => {
    it('renderNode is called per node', () => {
      const renderNode = vi.fn((n: OrgNode) => <div>custom:{n.label}</div>);
      wrap(<TkxOrgChart data={data} renderNode={renderNode} />);
      // 5 nodes total: ceo, cto, cfo, eng1, eng2
      expect(renderNode).toHaveBeenCalledTimes(5);
      expect(screen.getByText('custom:Alex Reed')).toBeInTheDocument();
      expect(screen.getByText('custom:Sam P.')).toBeInTheDocument();
    });

    it('renderNode receives the isActive flag for the root', () => {
      const renderNode = vi.fn((n: OrgNode, isActive: boolean) => (
        <div>{n.label}:{isActive ? 'ACTIVE' : 'idle'}</div>
      ));
      wrap(<TkxOrgChart data={data} renderNode={renderNode} />);
      // Root is the initial active node.
      expect(screen.getByText('Alex Reed:ACTIVE')).toBeInTheDocument();
    });
  });

  // ── Interaction ───────────────────────────────────────────────────────────
  describe('interaction', () => {
    it('fires onNodeClick with the right node data', () => {
      const onNodeClick = vi.fn();
      const { container } = wrap(<TkxOrgChart data={data} onNodeClick={onNodeClick} />);
      const items = container.querySelectorAll('[role="treeitem"]');
      // Click the third item — depends on traversal order, but onNodeClick
      // should receive an OrgNode.
      fireEvent.click(items[0]);
      expect(onNodeClick).toHaveBeenCalledTimes(1);
      const arg = onNodeClick.mock.calls[0][0] as OrgNode;
      expect(arg.id).toBeTruthy();
      expect(arg.label).toBeTruthy();
    });

    it('clicking a specific node passes that node to onNodeClick', () => {
      const onNodeClick = vi.fn();
      wrap(<TkxOrgChart data={data} onNodeClick={onNodeClick} />);
      // Click the CTO's text — the treeitem wrapper handles the click.
      const cto = screen.getByText('Jamie Lin').closest('[role="treeitem"]') as HTMLElement;
      fireEvent.click(cto);
      const arg = onNodeClick.mock.calls[0][0] as OrgNode;
      expect(arg.id).toBe('cto');
      expect(arg.label).toBe('Jamie Lin');
    });

    it('collapsing a subtree hides its descendants', () => {
      wrap(<TkxOrgChart data={data} />);
      expect(screen.getByText('Sam P.')).toBeInTheDocument();
      // Find the CTO's collapse toggle and click it.
      const ctoCard = screen.getByText('Jamie Lin').closest('[role="treeitem"]') as HTMLElement;
      const toggle = ctoCard.querySelector('button[aria-label="Collapse subtree"]') as HTMLButtonElement;
      expect(toggle).not.toBeNull();
      fireEvent.click(toggle);
      expect(screen.queryByText('Sam P.')).not.toBeInTheDocument();
      expect(screen.queryByText('Kim R.')).not.toBeInTheDocument();
    });

    it('expanding restores hidden descendants', () => {
      wrap(<TkxOrgChart data={data} collapsedByDefault />);
      // With collapsedByDefault, deep descendants are hidden but CTO/CFO are still visible
      // (only root is *not* collapsed in the initial set).
      expect(screen.queryByText('Sam P.')).not.toBeInTheDocument();
      // Expand the CTO's subtree.
      const ctoCard = screen.getByText('Jamie Lin').closest('[role="treeitem"]') as HTMLElement;
      const toggle = ctoCard.querySelector('button[aria-label="Expand subtree"]') as HTMLButtonElement;
      expect(toggle).not.toBeNull();
      fireEvent.click(toggle);
      expect(screen.getByText('Sam P.')).toBeInTheDocument();
    });

    it('respects collapsedByDefault', () => {
      wrap(<TkxOrgChart data={data} collapsedByDefault />);
      expect(screen.getByText('Alex Reed')).toBeInTheDocument();
      expect(screen.queryByText('Sam P.')).not.toBeInTheDocument();
    });
  });

  // ── Zoom controls ─────────────────────────────────────────────────────────
  describe('zoom controls', () => {
    it('renders zoom controls when interactive', () => {
      wrap(<TkxOrgChart data={data} />);
      expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
      expect(screen.getByLabelText('Reset zoom')).toBeInTheDocument();
    });

    it('hides zoom controls when interactive=false', () => {
      wrap(<TkxOrgChart data={data} interactive={false} />);
      expect(screen.queryByLabelText('Zoom in')).not.toBeInTheDocument();
    });

    it('clicking zoom-in updates the stage transform scale', () => {
      const { container } = wrap(<TkxOrgChart data={data} />);
      const tree = container.querySelector('[role="tree"]') as HTMLElement;
      const stage = tree.querySelector('div[style*="transform"]') as HTMLElement;
      const initialTransform = stage.style.transform;
      fireEvent.click(screen.getByLabelText('Zoom in'));
      expect(stage.style.transform).not.toBe(initialTransform);
      expect(stage.style.transform).toMatch(/scale\(1\.1\)/);
    });

    it('reset-zoom button resets scale and pan', () => {
      const { container } = wrap(<TkxOrgChart data={data} initialZoom={2} />);
      const tree = container.querySelector('[role="tree"]') as HTMLElement;
      const stage = tree.querySelector('div[style*="transform"]') as HTMLElement;
      expect(stage.style.transform).toMatch(/scale\(2\)/);
      fireEvent.click(screen.getByLabelText('Reset zoom'));
      expect(stage.style.transform).toMatch(/scale\(1\)/);
    });

    it('zoom is clamped between 0.25 and 4', () => {
      const { container } = wrap(<TkxOrgChart data={data} initialZoom={100} />);
      const tree = container.querySelector('[role="tree"]') as HTMLElement;
      const stage = tree.querySelector('div[style*="transform"]') as HTMLElement;
      // 100 should clamp to 4.
      expect(stage.style.transform).toMatch(/scale\(4\)/);
    });
  });

  // ── Keyboard navigation ───────────────────────────────────────────────────
  describe('keyboard navigation', () => {
    it('ArrowDown moves active focus to first child', () => {
      const renderNode = vi.fn((n: OrgNode, isActive: boolean) => (
        <div>{n.label}:{isActive ? 'A' : '_'}</div>
      ));
      const { container } = wrap(<TkxOrgChart data={data} renderNode={renderNode} />);
      const tree = container.querySelector('[role="tree"]') as HTMLElement;
      // Root is active initially.
      expect(screen.getByText('Alex Reed:A')).toBeInTheDocument();
      fireEvent.keyDown(tree, { key: 'ArrowDown' });
      // Now CTO (first child) should be active.
      expect(screen.getByText('Jamie Lin:A')).toBeInTheDocument();
    });

    it('ArrowUp moves active focus to parent', () => {
      const renderNode = vi.fn((n: OrgNode, isActive: boolean) => (
        <div>{n.label}:{isActive ? 'A' : '_'}</div>
      ));
      const { container } = wrap(<TkxOrgChart data={data} renderNode={renderNode} />);
      const tree = container.querySelector('[role="tree"]') as HTMLElement;
      fireEvent.keyDown(tree, { key: 'ArrowDown' }); // CTO
      fireEvent.keyDown(tree, { key: 'ArrowUp' }); // back to CEO
      expect(screen.getByText('Alex Reed:A')).toBeInTheDocument();
    });

    it('Enter on active node fires onNodeClick', () => {
      const onNodeClick = vi.fn();
      const { container } = wrap(<TkxOrgChart data={data} onNodeClick={onNodeClick} />);
      const tree = container.querySelector('[role="tree"]') as HTMLElement;
      fireEvent.keyDown(tree, { key: 'Enter' });
      expect(onNodeClick).toHaveBeenCalledTimes(1);
      expect((onNodeClick.mock.calls[0][0] as OrgNode).id).toBe('ceo');
    });
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────
  describe('aria', () => {
    it('container has role="tree"', () => {
      const { container } = wrap(<TkxOrgChart data={data} />);
      expect(container.querySelector('[role="tree"]')).not.toBeNull();
    });

    it('each node has role="treeitem"', () => {
      const { container } = wrap(<TkxOrgChart data={data} />);
      expect(container.querySelectorAll('[role="treeitem"]').length).toBe(5);
    });

    it('nodes with children expose aria-expanded', () => {
      const { container } = wrap(<TkxOrgChart data={data} />);
      const ceo = container.querySelector('[role="treeitem"][aria-label="Alex Reed"]');
      expect(ceo?.getAttribute('aria-expanded')).toBe('true');
    });

    it('aria-expanded is "false" after collapse', () => {
      wrap(<TkxOrgChart data={data} />);
      const ctoCard = screen.getByText('Jamie Lin').closest('[role="treeitem"]') as HTMLElement;
      const toggle = ctoCard.querySelector('button[aria-label="Collapse subtree"]') as HTMLButtonElement;
      fireEvent.click(toggle);
      // After collapse the treeitem still exists but aria-expanded should flip.
      const ctoAfter = screen.getByText('Jamie Lin').closest('[role="treeitem"]') as HTMLElement;
      expect(ctoAfter.getAttribute('aria-expanded')).toBe('false');
    });

    it('aria-level reflects depth', () => {
      const { container } = wrap(<TkxOrgChart data={data} />);
      const ceo = container.querySelector('[aria-label="Alex Reed"]') as HTMLElement;
      const cto = container.querySelector('[aria-label="Jamie Lin"]') as HTMLElement;
      const eng = container.querySelector('[aria-label="Sam P."]') as HTMLElement;
      expect(ceo.getAttribute('aria-level')).toBe('1');
      expect(cto.getAttribute('aria-level')).toBe('2');
      expect(eng.getAttribute('aria-level')).toBe('3');
    });

    it('aria-selected="true" on the active node', () => {
      const { container } = wrap(<TkxOrgChart data={data} />);
      const ceo = container.querySelector('[aria-label="Alex Reed"]') as HTMLElement;
      expect(ceo.getAttribute('aria-selected')).toBe('true');
    });

    it('custom ariaLabel applied to root container', () => {
      const { container } = wrap(<TkxOrgChart data={data} ariaLabel="Company structure" />);
      expect(container.querySelector('[role="tree"][aria-label="Company structure"]')).not.toBeNull();
    });
  });

  // ── Security ──────────────────────────────────────────────────────────────
  describe('security', () => {
    it('sanitizes labels with script tags', () => {
      const evil: OrgNode = { id: 'x', label: '<script>alert(1)</script>OK' };
      const { container } = wrap(<TkxOrgChart data={evil} />);
      expect(container.querySelector('script')).toBeNull();
    });

    it('blocks javascript: avatar URLs', () => {
      const evil: OrgNode = { id: 'x', label: 'X', avatar: 'javascript:alert(1)' };
      const { container } = wrap(<TkxOrgChart data={evil} />);
      const img = container.querySelector('img');
      // Either no img is rendered, or src is not the javascript: scheme.
      if (img) expect(img.getAttribute('src')).not.toMatch(/javascript/i);
    });

    it('blocks vbscript: avatar URLs', () => {
      const evil: OrgNode = { id: 'x', label: 'X', avatar: 'vbscript:foo' };
      const { container } = wrap(<TkxOrgChart data={evil} />);
      const img = container.querySelector('img');
      if (img) expect(img.getAttribute('src')).not.toMatch(/vbscript/i);
    });

    it('allows http avatar URLs', () => {
      const ok: OrgNode = { id: 'x', label: 'X', avatar: 'https://example.com/a.png' };
      const { container } = wrap(<TkxOrgChart data={ok} />);
      const img = container.querySelector('img');
      expect(img?.getAttribute('src')).toBe('https://example.com/a.png');
    });
  });
});
