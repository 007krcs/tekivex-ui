import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxField } from '../src/components/TkxField';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxField', () => {
  it('wires label → child via htmlFor/id (element child)', () => {
    render(
      <TkxField label="Amount">
        <input />
      </TkxField>,
      { wrapper: W },
    );
    const input = screen.getByLabelText('Amount');
    expect(input.tagName).toBe('INPUT');
  });

  it('injects aria-describedby for hint and error', () => {
    render(
      <TkxField label="Amount" hint="In INR" error="Too low">
        <input />
      </TkxField>,
      { wrapper: W },
    );
    const input = screen.getByLabelText('Amount');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    expect(describedBy).toContain('-error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toContain('Too low');
  });

  it('hides hint while an error is shown', () => {
    render(
      <TkxField label="X" hint="Helpful" error="Broken">
        <input />
      </TkxField>,
      { wrapper: W },
    );
    expect(screen.queryByText('Helpful')).toBeNull();
    expect(screen.getByText('Broken')).toBeTruthy();
  });

  it('supports the function-child form', () => {
    render(
      <TkxField label="Custom" hint="hi">
        {(field) => <textarea {...field} data-testid="fn-child" />}
      </TkxField>,
      { wrapper: W },
    );
    const ta = screen.getByLabelText('Custom');
    expect(ta.getAttribute('data-testid')).toBe('fn-child');
    expect(ta.getAttribute('aria-describedby')).toContain('-hint');
  });

  it('respects a child-supplied id', () => {
    render(
      <TkxField label="Named">
        <input id="my-id" />
      </TkxField>,
      { wrapper: W },
    );
    expect(screen.getByLabelText('Named').id).toBe('my-id');
  });

  it('marks required with aria-required', () => {
    render(
      <TkxField label="Req" isRequired>
        <input />
      </TkxField>,
      { wrapper: W },
    );
    expect(screen.getByRole('textbox').getAttribute('aria-required')).toBe('true');
  });

  it('survives a childless mount (chrome only, no crash)', () => {
    expect(() => render(<TkxField label="Alone" />, { wrapper: W })).not.toThrow();
    expect(screen.getByText('Alone')).toBeTruthy();
  });
});
