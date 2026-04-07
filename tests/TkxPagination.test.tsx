import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxPagination } from '../src/components/TkxPagination';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxPagination', () => {
  it('renders pagination navigation', () => {
    render(<TkxPagination total={100} />, { wrapper: Wrapper });
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('renders page buttons', () => {
    render(<TkxPagination total={50} pageSize={10} />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
  });

  it('calls onChange when a page is clicked', () => {
    const onChange = vi.fn();
    render(<TkxPagination total={100} pageSize={10} onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Page 2'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<TkxPagination total={100} defaultPage={1} />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<TkxPagination total={30} pageSize={10} page={3} />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('navigates to next page', () => {
    const onChange = vi.fn();
    render(<TkxPagination total={100} pageSize={10} defaultPage={1} onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('marks current page with aria-current', () => {
    render(<TkxPagination total={100} pageSize={10} page={3} />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Page 3')).toHaveAttribute('aria-current', 'page');
  });
});
