import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxBreadcrumb } from '../src/components/TkxBreadcrumb';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';
import type { BreadcrumbItem } from '../src/components/TkxBreadcrumb';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Details' },
];

describe('TkxBreadcrumb', () => {
  it('renders all breadcrumb items', () => {
    render(<TkxBreadcrumb items={items} />, { wrapper: Wrapper });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('renders navigation element', () => {
    render(<TkxBreadcrumb items={items} />, { wrapper: Wrapper });
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('marks the last item as current page with aria-current', () => {
    render(<TkxBreadcrumb items={items} />, { wrapper: Wrapper });
    const lastItem = screen.getByText('Details');
    expect(lastItem.closest('[aria-current="page"]')).toBeInTheDocument();
  });

  it('renders custom separator', () => {
    render(<TkxBreadcrumb items={items} separator={<span data-testid="sep">/</span>} />, { wrapper: Wrapper });
    const separators = screen.getAllByTestId('sep');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('calls onNavigate when an item is clicked', () => {
    const onNavigate = vi.fn();
    render(<TkxBreadcrumb items={items} onNavigate={onNavigate} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Home'));
    expect(onNavigate).toHaveBeenCalledWith(items[0], 0);
  });
});
