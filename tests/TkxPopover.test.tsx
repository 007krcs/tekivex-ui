import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxPopover } from '../src/components/TkxPopover';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxPopover', () => {
  it('renders the trigger element', () => {
    render(
      <TkxPopover trigger={<button>Open</button>} content={<p>Popover body</p>} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('popover content is hidden by default', () => {
    render(
      <TkxPopover trigger={<button>Open</button>} content={<p>Popover body</p>} />,
      { wrapper: Wrapper },
    );
    expect(screen.queryByText('Popover body')).not.toBeInTheDocument();
  });

  it('shows content when trigger is clicked', () => {
    render(
      <TkxPopover trigger={<button>Open</button>} content={<p>Popover body</p>} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Popover body')).toBeInTheDocument();
  });

  it('shows content when isOpen is true (controlled)', () => {
    render(
      <TkxPopover trigger={<button>Open</button>} content={<p>Controlled body</p>} isOpen />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Controlled body')).toBeInTheDocument();
  });

  it('calls onOpenChange when trigger is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <TkxPopover trigger={<button>Open</button>} content={<p>Body</p>} onOpenChange={onOpenChange} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(onOpenChange).toHaveBeenCalled();
  });

  // ── MEDIUM a11y regression: trigger wrapper promotion ─────────────────────

  it('promotes a NON-interactive trigger to a focusable button and opens on Enter', () => {
    render(
      <TkxPopover trigger={<span>Info</span>} content={<p>Popover body</p>} />,
      { wrapper: Wrapper },
    );
    const trigger = screen.getByRole('button', { name: 'Info' });
    expect(trigger.getAttribute('tabindex')).toBe('0');
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByText('Popover body')).toBeInTheDocument();
  });

  it('does NOT double up as a button when the trigger is already a <button>', () => {
    render(
      <TkxPopover trigger={<button>Open</button>} content={<p>Body</p>} />,
      { wrapper: Wrapper },
    );
    // Exactly one button — the wrapper stays a role-less passthrough.
    expect(screen.getAllByRole('button')).toHaveLength(1);
    const wrapper = screen.getByRole('button', { name: 'Open' }).parentElement as HTMLElement;
    expect(wrapper.getAttribute('role')).toBeNull();
    expect(wrapper.getAttribute('tabindex')).toBeNull();
  });
});
