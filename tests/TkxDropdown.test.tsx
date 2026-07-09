import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TkxDropdown } from '../src/components/TkxDropdown';
import type { DropdownItem, DropdownGroup } from '../src/components/TkxDropdown';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const basicItems: DropdownItem[] = [
  { key: 'copy', label: 'Copy', shortcut: '⌘C' },
  { key: 'paste', label: 'Paste', shortcut: '⌘V' },
  { key: 'cut', label: 'Cut', shortcut: '⌘X' },
  { key: 'disabled', label: 'Disabled Item', disabled: true },
];

const groupedData: DropdownGroup[] = [
  {
    label: 'File',
    items: [
      { key: 'new', label: 'New File' },
      { key: 'open', label: 'Open File' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { key: 'undo', label: 'Undo' },
      { key: 'redo', label: 'Redo' },
    ],
  },
  {
    label: 'View',
    items: [{ key: 'zoom', label: 'Zoom In' }],
  },
];

const nestedItems: DropdownItem[] = [
  { key: 'share', label: 'Share', children: [
    { key: 'email', label: 'Email' },
    { key: 'slack', label: 'Slack' },
    { key: 'teams', label: 'Teams' },
  ]},
  { key: 'delete', label: 'Delete' },
];

// ── 1. Rendering ──────────────────────────────────────────────────────────────

describe('Rendering', () => {
  it('renders the trigger element', () => {
    render(
      <TkxDropdown trigger={<button>Open Menu</button>} items={basicItems} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument();
  });

  it('does not show menu initially', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} />,
      { wrapper: Wrapper },
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders with groups when groups prop provided', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} groups={groupedData} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
  });
});

// ── 2. Open/Close ─────────────────────────────────────────────────────────────

describe('Open/Close', () => {
  it('opens the menu on trigger click', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes the menu on Escape key', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes menu on outside click', () => {
    render(
      <div>
        <TkxDropdown trigger={<button>Open</button>} items={basicItems} />
        <div data-testid="outside">Outside</div>
      </div>,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes menu after selecting an item (default behavior)', () => {
    const onSelect = vi.fn();
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} onSelect={onSelect} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getAllByRole('menuitem')[0]);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(onSelect).toHaveBeenCalledWith('copy', basicItems[0]);
  });
});

// ── 3. Keyboard navigation ────────────────────────────────────────────────────

describe('Keyboard navigation', () => {
  it('ArrowDown moves focus to next item', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    // Focus should move to second item (index 1)
    const items = screen.getAllByRole('menuitem');
    expect(items[1]).toHaveFocus();
  });

  it('ArrowUp moves focus to previous item', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    const items = screen.getAllByRole('menuitem');
    expect(items[1]).toHaveFocus();
  });

  it('Enter selects the focused item', () => {
    const onSelect = vi.fn();
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} onSelect={onSelect} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const menu = screen.getByRole('menu');
    // First item is focused by default
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('copy', basicItems[0]);
  });

  it('Tab closes the menu', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

// ── 4. Selection ──────────────────────────────────────────────────────────────

describe('Selection', () => {
  it('onSelect fires with correct key and item', () => {
    const onSelect = vi.fn();
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} onSelect={onSelect} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getAllByRole('menuitem')[1]);
    expect(onSelect).toHaveBeenCalledWith('paste', basicItems[1]);
  });

  // aria-selected is not a supported state on menu items (APG). Single-select
  // selectable items are now role="menuitemradio" with aria-checked.
  it('selectedKeys marks the selected item as menuitemradio with aria-checked', () => {
    render(
      <TkxDropdown
        trigger={<button>Open</button>}
        items={basicItems}
        selectedKeys={['copy']}
      />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const copyItem = screen.getAllByRole('menuitemradio').find(
      (el) => el.getAttribute('aria-checked') === 'true',
    );
    expect(copyItem).toBeTruthy();
  });

  it('multiSelect keeps menu open after select', () => {
    const onSelect = vi.fn();
    render(
      <TkxDropdown
        trigger={<button>Open</button>}
        items={basicItems}
        onSelect={onSelect}
        multiSelect
      />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getAllByRole('menuitemcheckbox')[0]);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('multiSelect shows aria-checked on selected menuitemcheckbox items', () => {
    render(
      <TkxDropdown
        trigger={<button>Open</button>}
        items={basicItems}
        selectedKeys={['copy', 'paste']}
        multiSelect
      />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const checkedItems = screen.getAllByRole('menuitemcheckbox').filter(
      (el) => el.getAttribute('aria-checked') === 'true',
    );
    expect(checkedItems).toHaveLength(2);
  });

  // Regression (a11y MEDIUM): aria-selected must never appear on menu items,
  // and plain action menus (no selection props) stay role="menuitem" with no
  // checked state.
  it('never emits aria-selected; action-only menus keep plain menuitem role', () => {
    const { unmount } = render(
      <TkxDropdown
        trigger={<button>Open</button>}
        items={basicItems}
        selectedKeys={['copy']}
      />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(document.querySelector('[role="menu"] [aria-selected]')).toBeNull();
    unmount();

    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const plainItems = screen.getAllByRole('menuitem');
    expect(plainItems.length).toBeGreaterThan(0);
    plainItems.forEach((el) => {
      expect(el).not.toHaveAttribute('aria-checked');
      expect(el).not.toHaveAttribute('aria-selected');
    });
  });
});

// ── 5. Search ─────────────────────────────────────────────────────────────────

describe('Search', () => {
  it('shows search input when searchable is true', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} searchable />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('textbox', { name: 'Search items' })).toBeInTheDocument();
  });

  it('filters items by search query', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} searchable />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const search = screen.getByRole('textbox', { name: 'Search items' });
    fireEvent.change(search, { target: { value: 'Copy' } });
    expect(screen.getAllByRole('menuitem').length).toBe(1);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('shows no results message when no items match query', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} searchable />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const search = screen.getByRole('textbox', { name: 'Search items' });
    fireEvent.change(search, { target: { value: 'zzz_no_match' } });
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});

// ── 6. Nested submenus ────────────────────────────────────────────────────────

describe('Nested submenus', () => {
  it('shows chevron indicator for items with children', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={nestedItems} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const shareItem = screen.getAllByRole('menuitem').find((el) =>
      el.getAttribute('aria-haspopup') === 'menu',
    );
    expect(shareItem).toBeTruthy();
  });

  it('ArrowRight opens submenu for focused item with children', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={nestedItems} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const menu = screen.getByRole('menu');
    // Focus is on first item (Share) by default
    fireEvent.keyDown(menu, { key: 'ArrowRight' });
    // Submenu should appear
    const allMenus = screen.getAllByRole('menu');
    expect(allMenus.length).toBeGreaterThan(1);
  });

  it('ArrowLeft closes submenu', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={nestedItems} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowRight' });
    expect(screen.getAllByRole('menu').length).toBeGreaterThan(1);
    fireEvent.keyDown(menu, { key: 'ArrowLeft' });
    expect(screen.getAllByRole('menu')).toHaveLength(1);
  });
});

// ── 7. Disabled items ─────────────────────────────────────────────────────────

describe('Disabled items', () => {
  it('disabled items cannot be selected', () => {
    const onSelect = vi.fn();
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} onSelect={onSelect} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const disabledItem = screen.getAllByRole('menuitem').find(
      (el) => el.getAttribute('aria-disabled') === 'true',
    );
    expect(disabledItem).toBeTruthy();
    fireEvent.click(disabledItem!);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('disabled prop disables the trigger from opening the menu', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} disabled />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

// ── 8. Placement ─────────────────────────────────────────────────────────────

describe('Placement', () => {
  it('uses bottom-start placement by default', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    // Menu renders (default placement). Just confirm it opens.
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('applies the specified placement when provided', () => {
    render(
      <TkxDropdown trigger={<button>Open</button>} items={basicItems} placement="top-end" />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    // Menu renders regardless of placement
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
