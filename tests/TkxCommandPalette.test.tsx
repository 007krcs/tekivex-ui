import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  TkxCommandPalette,
  fuzzyScore,
  type CommandPaletteCommand,
} from '../src/components/TkxCommandPalette';

const COMMANDS: CommandPaletteCommand[] = [
  { id: 'open-settings', title: 'Open settings', icon: '⚙️', section: 'App' },
  { id: 'search-docs',   title: 'Search docs',   icon: '🔍', section: 'Help' },
  { id: 'toggle-theme',  title: 'Toggle theme',  icon: '🌗', section: 'App' },
  { id: 'export',        title: 'Export project as JSON', icon: '📤', section: 'App', subtitle: 'Download .json' },
];

describe('fuzzyScore', () => {
  it('returns null when no subsequence match', () => {
    expect(fuzzyScore('xyz', 'hello')).toBeNull();
  });
  it('matches subsequences', () => {
    expect(fuzzyScore('hlo', 'hello')).not.toBeNull();
  });
  it('rewards prefix matches over middle hits', () => {
    const a = fuzzyScore('open', 'open settings')!;
    const b = fuzzyScore('open', 'reopen settings')!;
    expect(a).toBeGreaterThan(b);
  });
  it('rewards contiguous matches over spread-out hits', () => {
    const cont = fuzzyScore('settings', 'open settings')!;
    const spread = fuzzyScore('settings', 's e t t i n g s')!;
    expect(cont).toBeGreaterThan(spread);
  });
  it('empty query yields zero score (everything matches)', () => {
    expect(fuzzyScore('', 'anything')).toBe(0);
  });
});

describe('TkxCommandPalette', () => {
  it('does not render when closed', () => {
    render(<TkxCommandPalette commands={COMMANDS} />);
    expect(screen.queryByTestId('tkx-command-palette')).not.toBeInTheDocument();
  });

  it('renders when controlled open=true', () => {
    render(<TkxCommandPalette commands={COMMANDS} open onOpenChange={() => {}} />);
    expect(screen.getByTestId('tkx-command-palette')).toBeInTheDocument();
    expect(screen.getByTestId('cmdk-input')).toBeInTheDocument();
  });

  it('lists all commands grouped by section when query is empty', () => {
    render(<TkxCommandPalette commands={COMMANDS} open onOpenChange={() => {}} />);
    expect(screen.getByTestId('cmdk-item-open-settings')).toBeInTheDocument();
    expect(screen.getByTestId('cmdk-item-search-docs')).toBeInTheDocument();
    expect(screen.getByText('App')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('filters commands as the user types', () => {
    render(<TkxCommandPalette commands={COMMANDS} open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByTestId('cmdk-input'), { target: { value: 'sett' } });
    expect(screen.getByTestId('cmdk-item-open-settings')).toBeInTheDocument();
    expect(screen.queryByTestId('cmdk-item-search-docs')).not.toBeInTheDocument();
  });

  it('shows the empty state when nothing matches', () => {
    render(<TkxCommandPalette commands={COMMANDS} open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByTestId('cmdk-input'), { target: { value: 'qqqq' } });
    expect(screen.getByTestId('cmdk-empty')).toBeInTheDocument();
  });

  it('marks the first option as active by default', () => {
    render(<TkxCommandPalette commands={COMMANDS} open onOpenChange={() => {}} />);
    expect(screen.getByTestId('cmdk-item-open-settings')).toHaveAttribute('aria-selected', 'true');
  });

  it('arrow-down moves selection to the next item', () => {
    render(<TkxCommandPalette commands={COMMANDS} open onOpenChange={() => {}} />);
    fireEvent.keyDown(screen.getByTestId('cmdk-input'), { key: 'ArrowDown' });
    expect(screen.getByTestId('cmdk-item-toggle-theme')).toHaveAttribute('aria-selected', 'true');
  });

  it('Enter fires the command\'s onSelect + the global onSelect', () => {
    const globalSelect = vi.fn();
    const localSelect = vi.fn();
    const cmds: CommandPaletteCommand[] = [
      ...COMMANDS,
      { id: 'do-thing', title: 'Do thing', onSelect: localSelect },
    ];
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <TkxCommandPalette
          commands={cmds}
          open={open}
          onOpenChange={setOpen}
          onSelect={globalSelect}
        />
      );
    }
    render(<Harness />);
    fireEvent.change(screen.getByTestId('cmdk-input'), { target: { value: 'do thing' } });
    fireEvent.keyDown(screen.getByTestId('cmdk-input'), { key: 'Enter' });
    expect(globalSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'do-thing' }));
    expect(localSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'do-thing' }));
  });

  it('Escape closes the palette', () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <span data-testid="open-state">{open ? 'open' : 'closed'}</span>
          <TkxCommandPalette commands={COMMANDS} open={open} onOpenChange={setOpen} />
        </>
      );
    }
    render(<Harness />);
    fireEvent.keyDown(screen.getByTestId('cmdk-input'), { key: 'Escape' });
    expect(screen.getByTestId('open-state').textContent).toBe('closed');
  });

  it('Cmd-K hotkey toggles the palette open', () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <span data-testid="open-state">{open ? 'open' : 'closed'}</span>
          <TkxCommandPalette commands={COMMANDS} open={open} onOpenChange={setOpen} />
        </>
      );
    }
    render(<Harness />);
    // Default hotkey: ctrl+k (or cmd+k). jsdom's navigator.platform isn't Mac, so ctrl.
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByTestId('open-state').textContent).toBe('open');
  });

  it('hidden commands are excluded from results', () => {
    render(
      <TkxCommandPalette
        commands={[...COMMANDS, { id: 'secret', title: 'Secret command', hidden: true }]}
        open
        onOpenChange={() => {}}
      />,
    );
    expect(screen.queryByTestId('cmdk-item-secret')).not.toBeInTheDocument();
  });

  // ── A11y: modal focus trap + focus restore (a11y-audit MEDIUM #4 / #5) ────

  it('moves focus into the dialog (search input) on open', () => {
    render(<TkxCommandPalette commands={COMMANDS} open onOpenChange={() => {}} />);
    expect(document.activeElement).toBe(screen.getByTestId('cmdk-input'));
  });

  it('Tab keeps focus inside the dialog', () => {
    render(<TkxCommandPalette commands={COMMANDS} open onOpenChange={() => {}} />);
    const input = screen.getByTestId('cmdk-input');
    input.focus();
    fireEvent.keyDown(input, { key: 'Tab' });
    expect(screen.getByTestId('tkx-command-palette').contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
    expect(screen.getByTestId('tkx-command-palette').contains(document.activeElement)).toBe(true);
  });

  function OpenerHarness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button data-testid="opener" onClick={() => setOpen(true)}>open palette</button>
        <TkxCommandPalette commands={COMMANDS} open={open} onOpenChange={setOpen} />
      </>
    );
  }

  it('restores focus to the opener when closed via Escape', () => {
    render(<OpenerHarness />);
    const opener = screen.getByTestId('opener');
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByTestId('tkx-command-palette')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByTestId('cmdk-input'), { key: 'Escape' });
    expect(screen.queryByTestId('tkx-command-palette')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
  });

  it('restores focus to the opener when a command is run', () => {
    render(<OpenerHarness />);
    const opener = screen.getByTestId('opener');
    opener.focus();
    fireEvent.click(opener);
    fireEvent.keyDown(screen.getByTestId('cmdk-input'), { key: 'Enter' });
    expect(screen.queryByTestId('tkx-command-palette')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
  });

  it('restores focus to the opener when closed via backdrop click', () => {
    render(<OpenerHarness />);
    const opener = screen.getByTestId('opener');
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(screen.getByTestId('tkx-command-palette'));
    expect(screen.queryByTestId('tkx-command-palette')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
  });
});
