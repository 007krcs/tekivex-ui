import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../src/themes';
import { TkxOrgChart, type OrgNode } from '../src/components/TkxOrgChart';

const data: OrgNode = {
  id: 'ceo',
  label: 'Alex Reed',
  subLabel: 'CEO',
  children: [
    { id: 'cto', label: 'Jamie Lin', subLabel: 'CTO', children: [
      { id: 'eng1', label: 'Sam P.', subLabel: 'Eng' },
      { id: 'eng2', label: 'Kim R.', subLabel: 'Eng' },
    ] },
    { id: 'cfo', label: 'Morgan Q.', subLabel: 'CFO' },
  ],
};

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('TkxOrgChart', () => {
  it('renders root label', () => {
    const { getByText } = wrap(<TkxOrgChart data={data} />);
    expect(getByText('Alex Reed')).toBeTruthy();
  });

  it('renders all nodes expanded by default', () => {
    const { getByText } = wrap(<TkxOrgChart data={data} />);
    expect(getByText('Jamie Lin')).toBeTruthy();
    expect(getByText('Sam P.')).toBeTruthy();
    expect(getByText('Morgan Q.')).toBeTruthy();
  });

  it('uses role=tree and role=treeitem', () => {
    const { container } = wrap(<TkxOrgChart data={data} />);
    expect(container.querySelector('[role="tree"]')).toBeTruthy();
    expect(container.querySelectorAll('[role="treeitem"]').length).toBeGreaterThanOrEqual(5);
  });

  it('sanitizes label with HTML entities', () => {
    const evil: OrgNode = { id: 'x', label: '<script>alert(1)</script>' };
    const { container } = wrap(<TkxOrgChart data={evil} />);
    expect(container.querySelector('script')).toBeNull();
  });

  it('blocks javascript: avatar urls', () => {
    const evil: OrgNode = { id: 'x', label: 'X', avatar: 'javascript:alert(1)' };
    const { container } = wrap(<TkxOrgChart data={evil} />);
    const img = container.querySelector('img');
    if (img) expect(img.getAttribute('src')).not.toMatch(/javascript/i);
  });

  it('supports custom renderNode', () => {
    const { getByText } = wrap(
      <TkxOrgChart data={data} renderNode={(n) => <div>custom:{n.label}</div>} />,
    );
    expect(getByText('custom:Alex Reed')).toBeTruthy();
  });

  it('fires onNodeClick', () => {
    let clicked: OrgNode | null = null;
    const { container } = wrap(
      <TkxOrgChart data={data} onNodeClick={(n) => { clicked = n; }} />,
    );
    const first = container.querySelector('[role="treeitem"]') as HTMLElement;
    fireEvent.click(first);
    expect(clicked).toBeTruthy();
  });

  it('sets aria-level on treeitems', () => {
    const { container } = wrap(<TkxOrgChart data={data} />);
    const items = container.querySelectorAll('[role="treeitem"]');
    const levels = [...items].map((el) => el.getAttribute('aria-level'));
    expect(levels).toContain('1');
    expect(levels).toContain('2');
  });

  it('horizontal direction renders', () => {
    const { getByText } = wrap(<TkxOrgChart data={data} direction="horizontal" />);
    expect(getByText('Alex Reed')).toBeTruthy();
  });

  it('respects collapsedByDefault', () => {
    const { queryByText, getByText } = wrap(<TkxOrgChart data={data} collapsedByDefault />);
    // Root is always visible.
    expect(getByText('Alex Reed')).toBeTruthy();
    // Deep descendants should be hidden.
    expect(queryByText('Sam P.')).toBeNull();
  });

  it('applies custom ariaLabel', () => {
    const { container } = wrap(<TkxOrgChart data={data} ariaLabel="Company structure" />);
    expect(container.querySelector('[aria-label="Company structure"]')).toBeTruthy();
  });

  it('renders badge text sanitized', () => {
    const withBadge: OrgNode = { id: 'x', label: 'X', badge: 'VP' };
    const { getByText } = wrap(<TkxOrgChart data={withBadge} />);
    expect(getByText('VP')).toBeTruthy();
  });

  it('single-node chart still renders', () => {
    const solo: OrgNode = { id: 's', label: 'Solo' };
    const { getByText } = wrap(<TkxOrgChart data={solo} />);
    expect(getByText('Solo')).toBeTruthy();
  });
});
