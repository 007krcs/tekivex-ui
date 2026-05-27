import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { TkxMenu, type MenuItem } from '../src/components/TkxMenu';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

function wrap(ui: React.ReactElement) {
  return render(ui, { wrapper: Wrapper });
}

function getTrigger() {
  // The component wraps the trigger in a span[role="button"]; the inner
  // <button> also has role="button". Return the outer wrapper that owns
  // the click handler and aria-expanded.
  return screen.getByText('Open').closest('[role="button"]') as HTMLElement;
}

function getMenu() {
  return document.querySelector('[role="menu"]') as HTMLElement | null;
}

// Close any open menu before unmount by clicking outside. This avoids React's
// "node to be removed is not a child of this node" error when unmount and
// the portal-mounted menu panel race during cleanup.
function closeMenuIfOpen() {
  if (getMenu()) {
    // Close via Escape keydown on the menu container — synchronous.
    fireEvent.keyDown(getMenu()!, { key: 'Escape' });
  }
}

describe('TkxMenu', () => {
  // ── Basics ─────────────────────────────────────────────────────────────────
  describe('basics', () => {
    it('renders trigger', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'Action A' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      expect(getTrigger()).toBeInTheDocument();
    });

    it('renders menu items when opened', () => {
      const items: MenuItem[] = [
        { id: 'a', label: 'Action A' },
        { id: 'b', label: 'Action B' },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      expect(screen.getByText('Action A')).toBeInTheDocument();
      expect(screen.getByText('Action B')).toBeInTheDocument();
    });

    it('clicking the trigger opens the menu', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'Action A' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      expect(getMenu()).toBeNull();
      fireEvent.click(getTrigger());
      expect(getMenu()).not.toBeNull();
    });

    it('renders menu into document.body (portal)', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'X' }];
      const { container } = wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const menu = getMenu()!;
      expect(container.contains(menu)).toBe(false);
      expect(document.body.contains(menu)).toBe(true);
    });
  });

  // ── Activation ─────────────────────────────────────────────────────────────
  describe('activation', () => {
    it('selecting an action item fires onClick and closes menu', () => {
      const onClick = vi.fn();
      const items: MenuItem[] = [{ id: 'a', label: 'Do it', onClick }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      fireEvent.click(screen.getByText('Do it'));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(getMenu()).toBeNull();
    });

    it('disabled item does not fire onClick', () => {
      const onClick = vi.fn();
      const items: MenuItem[] = [{ id: 'a', label: 'Nope', disabled: true, onClick }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      fireEvent.click(screen.getByText('Nope'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('fires onOpen callback when menu opens', () => {
      const onOpen = vi.fn();
      const items: MenuItem[] = [{ id: 'a', label: 'X' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} onOpen={onOpen} />);
      fireEvent.click(getTrigger());
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('fires onClose callback when menu closes', () => {
      const onClose = vi.fn();
      const items: MenuItem[] = [{ id: 'a', label: 'X', onClick: () => {} }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} onClose={onClose} />);
      fireEvent.click(getTrigger());
      fireEvent.click(screen.getByText('X'));
      expect(onClose).toHaveBeenCalled();
    });

    it('clicking trigger again while open closes menu', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'X' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      expect(getMenu()).not.toBeNull();
      fireEvent.click(getTrigger());
      expect(getMenu()).toBeNull();
    });

    it('clicking outside closes the menu', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'X' }];
      wrap(
        <>
          <TkxMenu trigger={<button>Open</button>} items={items} />
          <button>Outside</button>
        </>,
      );
      fireEvent.click(getTrigger());
      expect(getMenu()).not.toBeNull();
      fireEvent.pointerDown(screen.getByText('Outside'));
      expect(getMenu()).toBeNull();
    });

    it('isDisabled prevents opening', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'X' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} isDisabled />);
      fireEvent.click(getTrigger());
      expect(getMenu()).toBeNull();
    });
  });

  // ── Keyboard ───────────────────────────────────────────────────────────────
  describe('keyboard', () => {
    it('Escape closes the menu', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'X' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const menu = getMenu()!;
      fireEvent.keyDown(menu, { key: 'Escape' });
      expect(getMenu()).toBeNull();
    });

    it('ArrowDown activates first item, then next item', () => {
      const items: MenuItem[] = [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const menu = getMenu()!;
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      // First arrow-down moves activeIdx from -1 to 0 (item A).
      expect(menu.querySelector('[data-midx="0"]')).not.toBeNull();
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      // Should now be highlighting index 1 (item B). Background color is set
      // when active, so check the inline style.
      const itemB = menu.querySelector('[data-midx="1"]') as HTMLElement;
      expect(itemB.style.backgroundColor).not.toBe('transparent');
    });

    it('ArrowUp from -1 wraps to last item', () => {
      const items: MenuItem[] = [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const menu = getMenu()!;
      fireEvent.keyDown(menu, { key: 'ArrowUp' });
      // -1 → -2 → wrap → flat.length - 1 = 1
      const itemB = menu.querySelector('[data-midx="1"]') as HTMLElement;
      expect(itemB.style.backgroundColor).not.toBe('transparent');
    });

    it('Home jumps to first item, End jumps to last', () => {
      const items: MenuItem[] = [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const menu = getMenu()!;
      fireEvent.keyDown(menu, { key: 'End' });
      const last = menu.querySelector('[data-midx="2"]') as HTMLElement;
      expect(last.style.backgroundColor).not.toBe('transparent');
      fireEvent.keyDown(menu, { key: 'Home' });
      const first = menu.querySelector('[data-midx="0"]') as HTMLElement;
      expect(first.style.backgroundColor).not.toBe('transparent');
    });

    it('Enter activates the focused item', () => {
      const onClick = vi.fn();
      const items: MenuItem[] = [
        { id: 'a', label: 'A', onClick },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const menu = getMenu()!;
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      fireEvent.keyDown(menu, { key: 'Enter' });
      expect(onClick).toHaveBeenCalled();
    });

    it('Tab closes the menu', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'A' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const menu = getMenu()!;
      fireEvent.keyDown(menu, { key: 'Tab' });
      expect(getMenu()).toBeNull();
    });

    it('trigger ArrowDown opens menu', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'A' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.keyDown(getTrigger(), { key: 'ArrowDown' });
      expect(getMenu()).not.toBeNull();
    });

    it('typeahead jumps to matching item', () => {
      const items: MenuItem[] = [
        { id: 'a', label: 'Apple' },
        { id: 'b', label: 'Banana' },
        { id: 'c', label: 'Cherry' },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const menu = getMenu()!;
      fireEvent.keyDown(menu, { key: 'c' });
      const cherry = menu.querySelector('[data-midx="2"]') as HTMLElement;
      expect(cherry.style.backgroundColor).not.toBe('transparent');
    });
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────
  describe('aria', () => {
    it('container has role="menu"', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'X' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      expect(getMenu()).not.toBeNull();
    });

    it('action items have role="menuitem"', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'X' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      expect(document.querySelectorAll('[role="menuitem"]').length).toBeGreaterThan(0);
    });

    it('aria-expanded on trigger reflects open state', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'X' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      const triggerBtn = getTrigger();
      expect(triggerBtn.getAttribute('aria-expanded')).toBe('false');
      fireEvent.click(triggerBtn);
      expect(triggerBtn.getAttribute('aria-expanded')).toBe('true');
    });

    it('aria-haspopup="menu" on trigger', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'X' }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      expect(getTrigger().getAttribute('aria-haspopup')).toBe('menu');
    });

    it('check item has role="menuitemcheckbox" with aria-checked', () => {
      const items: MenuItem[] = [
        { type: 'check', id: 'c', label: 'Toggle', checked: true },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const cb = document.querySelector('[role="menuitemcheckbox"]')!;
      expect(cb.getAttribute('aria-checked')).toBe('true');
    });

    it('radio group items have role="menuitemradio"', () => {
      const items: MenuItem[] = [
        {
          type: 'radio-group',
          id: 'r',
          value: 'b',
          options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
        },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const radios = document.querySelectorAll('[role="menuitemradio"]');
      expect(radios.length).toBe(2);
      const checked = [...radios].find((r) => r.getAttribute('aria-checked') === 'true');
      expect(checked?.textContent).toMatch(/B/);
    });

    it('separator has role="separator"', () => {
      const items: MenuItem[] = [
        { id: 'a', label: 'A' },
        { type: 'separator', id: 's' },
        { id: 'b', label: 'B' },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      expect(document.querySelector('[role="separator"]')).not.toBeNull();
    });

    it('disabled item has aria-disabled', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'Nope', disabled: true }];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const item = screen.getByText('Nope').closest('[role="menuitem"]')!;
      expect(item.getAttribute('aria-disabled')).toBe('true');
    });
  });

  // ── Submenu ────────────────────────────────────────────────────────────────
  describe('submenu', () => {
    it('submenu item has aria-haspopup="menu" and aria-expanded', () => {
      const items: MenuItem[] = [
        { type: 'submenu', id: 'sub', label: 'More', items: [{ id: 'x', label: 'X' }] },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const sub = screen.getByText('More').closest('[role="menuitem"]')!;
      expect(sub.getAttribute('aria-haspopup')).toBe('menu');
      expect(sub.getAttribute('aria-expanded')).toBe('false');
    });

    it('clicking submenu item opens nested menu', async () => {
      const items: MenuItem[] = [
        { type: 'submenu', id: 'sub', label: 'More', items: [{ id: 'x', label: 'Item X' }] },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const sub = screen.getByText('More').closest('[role="menuitem"]') as HTMLElement;
      fireEvent.click(sub);
      // Submenu opens via openSubmenu() — uses getBoundingClientRect to
      // position the panel. Wait for the second render.
      expect(await screen.findByText('Item X')).toBeInTheDocument();
    });

    it('ArrowRight on focused submenu opens nested menu', async () => {
      const items: MenuItem[] = [
        { type: 'submenu', id: 'sub', label: 'More', items: [{ id: 'x', label: 'Item X' }] },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const menu = getMenu()!;
      fireEvent.keyDown(menu, { key: 'ArrowDown' }); // focus first item (submenu)
      fireEvent.keyDown(menu, { key: 'ArrowRight' });
      expect(await screen.findByText('Item X')).toBeInTheDocument();
    });

    it('disabled submenu does not open', () => {
      const items: MenuItem[] = [
        {
          type: 'submenu',
          id: 'sub',
          label: 'More',
          disabled: true,
          items: [{ id: 'x', label: 'Item X' }],
        },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const sub = screen.getByText('More').closest('[role="menuitem"]') as HTMLElement;
      fireEvent.click(sub);
      expect(screen.queryByText('Item X')).not.toBeInTheDocument();
    });
  });

  // ── Security ───────────────────────────────────────────────────────────────
  describe('security', () => {
    it('sanitizes item labels (strips script tags)', () => {
      const items: MenuItem[] = [
        { id: 'a', label: '<script>alert(1)</script>Safe' },
      ];
      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      expect(document.querySelector('[role="menu"] script')).toBeNull();
      expect(document.body.textContent).toMatch(/Safe/);
    });
  });

  // ── Positioning ────────────────────────────────────────────────────────────
  describe('positioning', () => {
    it('flips up when no room below', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'X' }];
      // Mock trigger near bottom of viewport so there is no room below.
      const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 700, left: 0, right: 200, bottom: 740, width: 200, height: 40,
        x: 0, y: 700, toJSON: () => ({}),
      } as DOMRect);

      wrap(<TkxMenu trigger={<button>Open</button>} items={items} />);
      fireEvent.click(getTrigger());
      const menu = getMenu()!;
      // window.innerHeight defaults to 768; menu would overflow below — should flip up.
      // estimatedH = min(1 * 38 + 12, 360) = 50; spaceBelow = 768 - 740 = 28 < 50 + 6.
      // Flip up: top = 700 - 6 - 50 = 644
      expect(parseInt(menu.style.top, 10)).toBeLessThan(700);
      spy.mockRestore();
    });
  });
});
