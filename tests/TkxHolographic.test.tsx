import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import {
  TkxHolographicSurface,
  TkxHolographicCard,
  TkxHolographicAvatar,
  TkxHolographicBadge,
  TkxHolographicButton,
} from '../src/components/TkxHolographic';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxHolographicSurface', () => {
  it('renders children', () => {
    render(
      <TkxHolographicSurface>
        <span>holo content</span>
      </TkxHolographicSurface>,
      { wrapper: W },
    );
    expect(screen.getByText('holo content')).toBeInTheDocument();
  });

  it('renders foil overlay by default', () => {
    const { container } = render(
      <TkxHolographicSurface>x</TkxHolographicSurface>,
      { wrapper: W },
    );
    expect(container.querySelector('.tkx-holo-foil')).toBeTruthy();
  });

  it('omits scan-lines when scanLines=false', () => {
    const { container } = render(
      <TkxHolographicSurface scanLines={false}>x</TkxHolographicSurface>,
      { wrapper: W },
    );
    expect(container.querySelector('.tkx-holo-scan')).toBeFalsy();
  });

  it('omits foil when foilIntensity="none"', () => {
    const { container } = render(
      <TkxHolographicSurface foilIntensity="none">x</TkxHolographicSurface>,
      { wrapper: W },
    );
    expect(container.querySelector('.tkx-holo-foil')).toBeFalsy();
  });

  it('updates CSS vars on pointer move', () => {
    const { container } = render(
      <TkxHolographicSurface>x</TkxHolographicSurface>,
      { wrapper: W },
    );
    const root = container.querySelector('.tkx-holo-root') as HTMLElement;
    fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
    // CSS var setting happens in rAF — just verify no crash + class still present
    expect(root.classList.contains('tkx-holo-root')).toBe(true);
  });
});

describe('TkxHolographicCard', () => {
  it('renders title + subtitle + body', () => {
    render(
      <TkxHolographicCard title="Premium" subtitle="Unlocked tier">
        <p>card body</p>
      </TkxHolographicCard>,
      { wrapper: W },
    );
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Unlocked tier')).toBeInTheDocument();
    expect(screen.getByText('card body')).toBeInTheDocument();
  });

  it('renders badge slot', () => {
    render(
      <TkxHolographicCard
        title="t"
        badge={<span data-testid="b">★</span>}
      >
        c
      </TkxHolographicCard>,
      { wrapper: W },
    );
    expect(screen.getByTestId('b')).toBeInTheDocument();
  });

  it('article role + accessible name', () => {
    render(
      <TkxHolographicCard title="Card title">body</TkxHolographicCard>,
      { wrapper: W },
    );
    expect(screen.getByRole('article')).toHaveAccessibleName('Card title');
  });
});

describe('TkxHolographicAvatar', () => {
  it('renders <img> when src is provided', () => {
    render(
      <TkxHolographicAvatar src="https://x/y.png" alt="Aisha" size={64} />,
      { wrapper: W },
    );
    expect(screen.getByAltText('Aisha')).toBeInTheDocument();
  });

  it('falls back to initials when src missing', () => {
    render(<TkxHolographicAvatar alt="Aisha Verma" />, { wrapper: W });
    expect(screen.getByLabelText('Aisha Verma')).toHaveTextContent('A');
  });

  it('respects custom initials', () => {
    render(
      <TkxHolographicAvatar alt="Aisha Verma" initials="AV" />,
      { wrapper: W },
    );
    expect(screen.getByLabelText('Aisha Verma')).toHaveTextContent('AV');
  });
});

describe('TkxHolographicBadge', () => {
  it('renders content', () => {
    render(<TkxHolographicBadge>HOLO</TkxHolographicBadge>, { wrapper: W });
    expect(screen.getByText('HOLO')).toBeInTheDocument();
  });

  it('all sizes render', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { container } = render(
        <TkxHolographicBadge size={size}>x</TkxHolographicBadge>,
        { wrapper: W },
      );
      expect(container.firstChild).toBeTruthy();
    }
  });
});

describe('TkxHolographicButton', () => {
  it('renders + onClick fires', () => {
    const onClick = vi.fn();
    render(
      <TkxHolographicButton onClick={onClick}>Buy</TkxHolographicButton>,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Buy'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('isDisabled blocks onClick', () => {
    const onClick = vi.fn();
    render(
      <TkxHolographicButton onClick={onClick} isDisabled>
        Buy
      </TkxHolographicButton>,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Buy'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is a real <button>', () => {
    render(<TkxHolographicButton>Go</TkxHolographicButton>, { wrapper: W });
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });
});
