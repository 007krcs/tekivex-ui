import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxTimeline } from '../src/components/TkxTimeline';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';
import type { TimelineItem } from '../src/components/TkxTimeline';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const sampleItems: TimelineItem[] = [
  { id: '1', title: 'Step One', status: 'completed' },
  { id: '2', title: 'Step Two', status: 'active' },
  { id: '3', title: 'Step Three', status: 'pending' },
];

describe('TkxTimeline', () => {
  it('renders all timeline items', () => {
    render(<TkxTimeline items={sampleItems} />, { wrapper: Wrapper });
    expect(screen.getByText('Step One')).toBeInTheDocument();
    expect(screen.getByText('Step Two')).toBeInTheDocument();
    expect(screen.getByText('Step Three')).toBeInTheDocument();
  });

  it('renders with description text', () => {
    const items: TimelineItem[] = [
      { id: '1', title: 'Deploy', description: 'Deployed to production' },
    ];
    render(<TkxTimeline items={items} />, { wrapper: Wrapper });
    expect(screen.getByText('Deployed to production')).toBeInTheDocument();
  });

  it('renders with timestamp', () => {
    const items: TimelineItem[] = [
      { id: '1', title: 'Created', timestamp: '2026-01-01' },
    ];
    render(<TkxTimeline items={items} />, { wrapper: Wrapper });
    expect(screen.getByText('2026-01-01')).toBeInTheDocument();
  });

  it('renders with compact variant', () => {
    const { container } = render(<TkxTimeline items={sampleItems} variant="compact" />, { wrapper: Wrapper });
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with alternating variant', () => {
    const { container } = render(<TkxTimeline items={sampleItems} variant="alternating" />, { wrapper: Wrapper });
    expect(container.firstChild).toBeInTheDocument();
  });
});
