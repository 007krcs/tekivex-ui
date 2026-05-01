import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxThemeStudio } from '../src/components/TkxThemeStudio';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxThemeStudio', () => {
  it('renders editor + preview', () => {
    render(<TkxThemeStudio />, { wrapper: W });
    expect(screen.getByRole('region', { name: /Theme editor/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Theme Studio/i })).toBeInTheDocument();
  });

  it('shows token rows for each theme slot', () => {
    const { container } = render(<TkxThemeStudio />, { wrapper: W });
    expect(screen.getByText('Page background')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
    // 'Primary'/'Danger' show up as both token labels AND preview buttons
    expect(container.textContent).toContain('Primary');
    expect(container.textContent).toContain('Danger');
  });

  it('default export format is TS', () => {
    render(<TkxThemeStudio />, { wrapper: W });
    const code = screen.getByText(/import type.*ThemeTokens.*tekivex-ui/);
    expect(code).toBeInTheDocument();
  });

  it('switches to JSON format', () => {
    const { container } = render(<TkxThemeStudio />, { wrapper: W });
    const jsonTab = screen.getByRole('tab', { name: 'JSON' });
    fireEvent.click(jsonTab);
    expect(jsonTab).toHaveAttribute('aria-selected', 'true');
    expect(container.textContent).toMatch(/"bg":/);
  });

  it('switches to CSS format', () => {
    const { container } = render(<TkxThemeStudio />, { wrapper: W });
    const cssTab = screen.getByRole('tab', { name: 'CSS' });
    fireEvent.click(cssTab);
    expect(container.textContent).toMatch(/--tkx-bg:/);
  });

  it('color input change fires onChange', () => {
    const onChange = vi.fn();
    render(<TkxThemeStudio onChange={onChange} />, { wrapper: W });
    const inp = screen.getByLabelText('Page background color') as HTMLInputElement;
    fireEvent.change(inp, { target: { value: '#ff0000' } });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].bg).toBe('#ff0000');
  });

  it('reset restores starting tokens', () => {
    const onChange = vi.fn();
    render(<TkxThemeStudio onChange={onChange} />, { wrapper: W });
    const inp = screen.getByLabelText('Page background color') as HTMLInputElement;
    fireEvent.change(inp, { target: { value: '#ff0000' } });
    onChange.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Reset/i }));
    expect(onChange.mock.calls.at(-1)?.[0].bg).toBe(quantumDark.bg);
  });

  it('contrast badges render for tokens with thresholds', () => {
    const { container } = render(<TkxThemeStudio />, { wrapper: W });
    // "Body text" has threshold 7 against bg → AAA badge present somewhere
    expect(container.textContent).toMatch(/AAA|AA/);
  });
});
