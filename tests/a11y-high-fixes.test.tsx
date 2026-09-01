import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxDropdown } from '../src/components/TkxDropdown';
import { TkxMenu } from '../src/components/TkxMenu';
import { TkxCascader } from '../src/components/TkxCascader';
import { TkxCarousel } from '../src/components/TkxCarousel';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('v3.29 HIGH a11y fixes', () => {
  // ── Dropdown: non-interactive trigger becomes keyboard-operable ─────────────
  describe('TkxDropdown menu-button keyboard support', () => {
    // DropdownItem is keyed by `key` and has no per-item onClick — selection
    // is reported through the component-level onSelect prop.
    const items = [
      { key: 'a', label: 'Alpha' },
      { key: 'b', label: 'Beta' },
    ];

    it('promotes a NON-interactive trigger to a focusable button and opens on Enter', () => {
      render(<TkxDropdown trigger={<span>Menu</span>} items={items} />, { wrapper: W });
      const trigger = screen.getByRole('button');
      expect(trigger.getAttribute('tabindex')).toBe('0');
      fireEvent.keyDown(trigger, { key: 'Enter' });
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    it('does NOT double up as a button when the trigger is already a <button>', () => {
      render(<TkxDropdown trigger={<button>Open</button>} items={items} />, { wrapper: W });
      // Exactly one button named "Open" — the wrapper stays a passthrough.
      expect(screen.getAllByRole('button', { name: 'Open' })).toHaveLength(1);
    });
  });

  // ── Menu: aria-activedescendant tracks the active item ──────────────────────
  it('TkxMenu exposes the active item via aria-activedescendant on ArrowDown', () => {
    render(
      <TkxMenu
        trigger={<button>Open</button>}
        items={[
          { id: 'x', label: 'Cut' },
          { id: 'y', label: 'Copy' },
        ]}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Open'));
    const menu = document.querySelector('[role="menu"]') as HTMLElement;
    expect(menu).not.toBeNull();
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    const active = menu.getAttribute('aria-activedescendant');
    expect(active).toBeTruthy();
    // The referenced id must exist in the DOM (valid activedescendant).
    expect(document.getElementById(active as string)).not.toBeNull();
  });

  // ── Cascader: tree is keyboard-operable ─────────────────────────────────────
  it('TkxCascader treeitems are focusable and select on Enter', () => {
    const onChange = vi.fn();
    render(
      <TkxCascader
        options={[
          { value: 'in', label: 'India', children: [{ value: 'ka', label: 'Karnataka' }] },
        ]}
        onChange={onChange}
      />,
      { wrapper: W },
    );
    // Open the popup.
    fireEvent.click(screen.getByRole('combobox'));
    const first = screen.getAllByRole('treeitem')[0];
    expect(first.getAttribute('tabindex')).toBe('0');
    // ArrowRight drills into the child column, then Enter selects the leaf.
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    const leaf = screen.getByText('Karnataka').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(leaf, { key: 'Enter' });
    expect(onChange).toHaveBeenCalled();
  });

  // ── Carousel: accessible pause control (WCAG 2.2.2) ─────────────────────────
  const slides = [
    { id: '1', content: <div>Slide 1</div> },
    { id: '2', content: <div>Slide 2</div> },
  ];

  it('TkxCarousel renders a keyboard-accessible pause toggle when autoPlay is on', () => {
    render(<TkxCarousel autoPlay slides={slides} />, { wrapper: W });
    const pause = screen.getByRole('button', { name: /stop automatic slide show/i });
    expect(pause).toBeInTheDocument();
    fireEvent.click(pause);
    // After pausing, the control offers to start again.
    expect(screen.getByRole('button', { name: /start automatic slide show/i })).toBeInTheDocument();
  });

  it('TkxCarousel shows no pause control when autoPlay is off', () => {
    render(<TkxCarousel slides={slides} />, { wrapper: W });
    expect(screen.queryByRole('button', { name: /slide show/i })).toBeNull();
  });
});
