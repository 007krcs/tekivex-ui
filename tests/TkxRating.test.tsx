import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxRating } from '../src/components/TkxRating';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxRating', () => {
  it('renders 5 star items by default', () => {
    render(<TkxRating />, { wrapper: Wrapper });
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('renders custom number of stars', () => {
    render(<TkxRating max={10} />, { wrapper: Wrapper });
    expect(screen.getAllByRole('radio')).toHaveLength(10);
  });

  it('renders radiogroup role', () => {
    render(<TkxRating />, { wrapper: Wrapper });
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('has aria-label on the group', () => {
    render(<TkxRating label="Product rating" />, { wrapper: Wrapper });
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Product rating');
  });

  it('renders as readonly', () => {
    render(<TkxRating value={3} isReadOnly />, { wrapper: Wrapper });
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-readonly', 'true');
  });

  it('renders as disabled', () => {
    render(<TkxRating isDisabled />, { wrapper: Wrapper });
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows value text when showValue is true', () => {
    render(<TkxRating value={4} showValue />, { wrapper: Wrapper });
    expect(screen.getByText('4 / 5')).toBeInTheDocument();
  });

  // A11y regression (MEDIUM audit fix): the radiogroup holds a single tab
  // stop, so aria-activedescendant must track the active radio as arrow keys
  // change the value.
  it('exposes the active radio via aria-activedescendant as arrow keys change the value', () => {
    render(<TkxRating />, { wrapper: Wrapper });
    const group = screen.getByRole('radiogroup');
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r.id).toBeTruthy());

    // No selection yet → no active descendant
    expect(group).not.toHaveAttribute('aria-activedescendant');

    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(group.getAttribute('aria-activedescendant')).toBe(radios[0].id);
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');

    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(group.getAttribute('aria-activedescendant')).toBe(radios[1].id);

    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(group.getAttribute('aria-activedescendant')).toBe(radios[0].id);

    fireEvent.keyDown(group, { key: 'End' });
    expect(group.getAttribute('aria-activedescendant')).toBe(radios[4].id);

    fireEvent.keyDown(group, { key: 'Home' });
    expect(group).not.toHaveAttribute('aria-activedescendant');
  });

  it('half precision maps the active descendant to the containing radio', () => {
    render(<TkxRating precision={0.5} defaultValue={0} />, { wrapper: Wrapper });
    const group = screen.getByRole('radiogroup');
    const radios = screen.getAllByRole('radio');
    fireEvent.keyDown(group, { key: 'ArrowRight' }); // 0.5
    expect(group.getAttribute('aria-activedescendant')).toBe(radios[0].id);
    fireEvent.keyDown(group, { key: 'ArrowRight' }); // 1.0
    expect(group.getAttribute('aria-activedescendant')).toBe(radios[0].id);
    fireEvent.keyDown(group, { key: 'ArrowRight' }); // 1.5
    expect(group.getAttribute('aria-activedescendant')).toBe(radios[1].id);
  });
});
