import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxTag } from '../src/components/TkxTag';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxTag', () => {
  it('renders children text', () => {
    render(<TkxTag>Status</TkxTag>, { wrapper: Wrapper });
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<TkxTag variant="solid">Solid</TkxTag>, { wrapper: Wrapper });
    expect(screen.getByText('Solid')).toBeInTheDocument();

    rerender(<ThemeProvider theme={quantumDark}><TkxTag variant="outline">Outline</TkxTag></ThemeProvider>);
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });

  it('renders a remove button when onRemove is provided', () => {
    const onRemove = vi.fn();
    render(<TkxTag onRemove={onRemove}>Closeable</TkxTag>, { wrapper: Wrapper });
    const removeBtn = screen.getByRole('button');
    expect(removeBtn).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<TkxTag onRemove={onRemove}>Removable</TkxTag>, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('renders left icon when provided', () => {
    render(<TkxTag leftIcon={<span data-testid="tag-icon">*</span>}>With Icon</TkxTag>, { wrapper: Wrapper });
    expect(screen.getByTestId('tag-icon')).toBeInTheDocument();
  });

  // Regression (a11y MEDIUM): with both `clickable` and `onRemove`, the remove
  // <button> used to be nested inside a span[role="button"] — an interactive
  // control inside another interactive control. They must be siblings.
  it('clickable + onRemove renders two sibling controls, not nested', () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <TkxTag clickable onClick={onClick} onRemove={onRemove}>Filter</TkxTag>,
      { wrapper: Wrapper },
    );

    const tagButton = screen.getByRole('button', { name: 'Filter' });
    const removeButton = screen.getByRole('button', { name: 'Remove Filter' });

    // Neither control may be a descendant of the other.
    expect(tagButton.contains(removeButton)).toBe(false);
    expect(removeButton.contains(tagButton)).toBe(false);
    // And the remove button must not sit inside ANY interactive ancestor.
    expect(removeButton.parentElement?.closest('button, [role="button"]')).toBeNull();

    // Each control still fires only its own handler.
    fireEvent.click(tagButton);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
    fireEvent.click(removeButton);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('clickable tag body is a real button activatable via keyboard semantics', () => {
    const onClick = vi.fn();
    render(<TkxTag clickable onClick={onClick}>Go</TkxTag>, { wrapper: Wrapper });
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn.tagName).toBe('BUTTON');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
