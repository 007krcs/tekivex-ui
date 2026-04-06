import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipNav, LiveRegion, VisuallyHidden } from '../../src/a11y';

describe('SkipNav', () => {
  it('renders an anchor with default href', () => {
    render(<SkipNav />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#tkx-main-content');
  });

  it('accepts custom contentId and label', () => {
    render(<SkipNav contentId="my-content" label="Skip to content" />);
    const link = screen.getByRole('link', { name: /skip to content/i });
    expect(link).toHaveAttribute('href', '#my-content');
  });
});

describe('LiveRegion', () => {
  it('renders with aria-live="polite" by default', () => {
    render(<LiveRegion>Status message</LiveRegion>);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
  });

  it('renders with aria-live="assertive" when specified', () => {
    render(<LiveRegion politeness="assertive">Alert!</LiveRegion>);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders children', () => {
    render(<LiveRegion>Hello screen reader</LiveRegion>);
    expect(screen.getByText('Hello screen reader')).toBeInTheDocument();
  });
});

describe('VisuallyHidden', () => {
  it('applies sr-only class', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    const el = screen.getByText('Hidden text');
    expect(el).toHaveClass('tkx-sr-only');
  });

  it('renders as span by default', () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    expect(screen.getByText('Hidden').tagName.toLowerCase()).toBe('span');
  });

  it('renders as a different element with "as" prop', () => {
    render(<VisuallyHidden as="p">Hidden paragraph</VisuallyHidden>);
    expect(screen.getByText('Hidden paragraph').tagName.toLowerCase()).toBe('p');
  });
});
