import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxEmpty } from '../src/components/TkxEmpty';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxEmpty', () => {
  it('renders with default description', () => {
    render(<TkxEmpty />, { wrapper: Wrapper });
    // Default empty state should render something
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders custom description', () => {
    render(<TkxEmpty description="No results found" />, { wrapper: Wrapper });
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders default image illustration', () => {
    const { container } = render(<TkxEmpty image="default" />, { wrapper: Wrapper });
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders children as action area', () => {
    render(
      <TkxEmpty description="Empty">
        <button>Create New</button>
      </TkxEmpty>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('button', { name: 'Create New' })).toBeInTheDocument();
  });

  it('renders simple image variant', () => {
    const { container } = render(<TkxEmpty image="simple" description="Nothing here" />, { wrapper: Wrapper });
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
