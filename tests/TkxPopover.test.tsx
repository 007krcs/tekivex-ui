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
});
