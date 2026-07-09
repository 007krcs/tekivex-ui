import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxSpeedDial } from '../src/components/TkxSpeedDial';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const actions = [
  { id: 'copy', icon: <span>C</span>, label: 'Copy', onClick: vi.fn() },
  { id: 'share', icon: <span>S</span>, label: 'Share', onClick: vi.fn() },
];

function openDial() {
  const fab = screen.getByRole('button', { name: 'Open actions menu' });
  fireEvent.click(fab);
  return fab;
}

describe('TkxSpeedDial', () => {
  it('renders the main FAB and no actions when closed', () => {
    render(<TkxSpeedDial actions={actions} />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: 'Open actions menu' })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens on FAB click and shows the actions', () => {
    render(<TkxSpeedDial actions={actions} />, { wrapper: Wrapper });
    openDial();
    expect(screen.getByRole('menuitem', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Share' })).toBeInTheDocument();
  });

  // ── MEDIUM a11y regression: aria-controls points at the real actions menu ──

  it('FAB aria-controls resolves to the rendered, visible actions menu', () => {
    render(<TkxSpeedDial actions={actions} />, { wrapper: Wrapper });
    const fab = screen.getByRole('button', { name: 'Open actions menu' });
    // Closed: no dangling idref.
    expect(fab.getAttribute('aria-controls')).toBeNull();
    expect(fab.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(fab);
    const controls = fab.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const menu = document.getElementById(controls as string) as HTMLElement;
    expect(menu).not.toBeNull();
    expect(menu.getAttribute('role')).toBe('menu');
    // Not a display:none shim — the operable buttons live inside it.
    expect(menu.style.display).not.toBe('none');
    const items = menu.querySelectorAll('button[role="menuitem"]');
    expect(items).toHaveLength(actions.length);
  });

  // ── MEDIUM a11y regression: focus returns to the FAB on close ──────────────

  it('returns focus to the FAB when closing while focus is inside the dial', () => {
    render(<TkxSpeedDial actions={actions} />, { wrapper: Wrapper });
    const fab = openDial();
    const copy = screen.getByRole('menuitem', { name: 'Copy' });
    copy.focus();
    expect(document.activeElement).toBe(copy);

    fireEvent.keyDown(copy, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(fab);
  });

  it('returns focus to the FAB after activating an action with Enter', () => {
    render(<TkxSpeedDial actions={actions} />, { wrapper: Wrapper });
    const fab = openDial();
    const share = screen.getByRole('menuitem', { name: 'Share' });
    share.focus();
    fireEvent.keyDown(share, { key: 'Enter' });
    expect(actions[1].onClick).toHaveBeenCalled();
    expect(document.activeElement).toBe(fab);
  });

  it('does NOT steal focus when closed from outside (backdrop/outside click)', () => {
    render(
      <>
        <button>elsewhere</button>
        <TkxSpeedDial actions={actions} />
      </>,
      { wrapper: Wrapper },
    );
    const fab = openDial();
    const outside = screen.getByRole('button', { name: 'elsewhere' });
    outside.focus();
    fireEvent.pointerDown(outside);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(outside);
    expect(document.activeElement).not.toBe(fab);
  });
});
