import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxAvatar } from '../src/components/TkxAvatar';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxAvatar', () => {
  it('renders with an image when src is provided', () => {
    render(<TkxAvatar src="https://example.com/avatar.jpg" alt="User" />, { wrapper: Wrapper });
    expect(screen.getByAltText('User')).toBeInTheDocument();
  });

  it('renders initials when no image src', () => {
    render(<TkxAvatar alt="John Doe" initials="JD" />, { wrapper: Wrapper });
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders fallback icon when no src or initials', () => {
    render(<TkxAvatar alt="Unknown user" />, { wrapper: Wrapper });
    expect(screen.getByRole('img', { name: 'Unknown user' })).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { container } = render(<TkxAvatar alt="Small" size="sm" />, { wrapper: Wrapper });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('renders xl size', () => {
    const { container } = render(<TkxAvatar alt="XL" size="xl" />, { wrapper: Wrapper });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: '72px', height: '72px' });
  });

  it('shows status indicator when provided', () => {
    render(<TkxAvatar alt="User" status="online" />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Status: online')).toBeInTheDocument();
  });

  it('limits initials to 2 characters', () => {
    render(<TkxAvatar alt="User" initials="ABC" />, { wrapper: Wrapper });
    expect(screen.getByText('AB')).toBeInTheDocument();
  });
});
