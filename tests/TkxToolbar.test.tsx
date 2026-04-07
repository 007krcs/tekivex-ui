import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxToolbar } from '../src/components/TkxToolbar';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';
import type { ToolbarItem } from '../src/components/TkxToolbar';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const items: ToolbarItem[] = [
  { id: 'bold', label: 'Bold', type: 'button' },
  { id: 'italic', label: 'Italic', type: 'button' },
  { id: 'sep1', label: '', type: 'separator' },
  { id: 'underline', label: 'Underline', type: 'button' },
];

describe('TkxToolbar', () => {
  it('renders with toolbar role', () => {
    render(<TkxToolbar items={items} />, { wrapper: Wrapper });
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('renders toolbar items as buttons', () => {
    render(<TkxToolbar items={items} />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
  });

  it('calls onClick when a toolbar button is clicked', () => {
    const onClick = vi.fn();
    const clickItems: ToolbarItem[] = [
      { id: 'save', label: 'Save', type: 'button', onClick },
    ];
    render(<TkxToolbar items={clickItems} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled items', () => {
    const disabledItems: ToolbarItem[] = [
      { id: 'redo', label: 'Redo', type: 'button', disabled: true },
    ];
    render(<TkxToolbar items={disabledItems} />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled();
  });

  it('renders aria-label when provided', () => {
    render(<TkxToolbar items={items} ariaLabel="Text formatting" />, { wrapper: Wrapper });
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', 'Text formatting');
  });
});
