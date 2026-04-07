import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxCard, TkxCardHeader, TkxCardBody, TkxCardFooter } from '../src/components/TkxCard';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxCard', () => {
  it('renders children content', () => {
    render(<TkxCard>Card content</TkxCard>, { wrapper: Wrapper });
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { container } = render(<TkxCard variant="glass">Glass card</TkxCard>, { wrapper: Wrapper });
    expect(container.querySelector('.tkx-card')).toBeInTheDocument();
  });

  it('renders as a button when isClickable', () => {
    render(<TkxCard isClickable>Clickable</TkxCard>, { wrapper: Wrapper });
    expect(screen.getByRole('button')).toHaveTextContent('Clickable');
  });

  it('renders header with title and subtitle', () => {
    render(
      <TkxCard>
        <TkxCardHeader title="Card Title" subtitle="Subtitle text" />
      </TkxCard>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('renders body content', () => {
    render(
      <TkxCard>
        <TkxCardBody>Body content here</TkxCardBody>
      </TkxCard>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Body content here')).toBeInTheDocument();
  });

  it('renders footer content', () => {
    render(
      <TkxCard>
        <TkxCardFooter>Footer actions</TkxCardFooter>
      </TkxCard>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Footer actions')).toBeInTheDocument();
  });

  it('renders as article element when as="article"', () => {
    const { container } = render(<TkxCard as="article">Article card</TkxCard>, { wrapper: Wrapper });
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
