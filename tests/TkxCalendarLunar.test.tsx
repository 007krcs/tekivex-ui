import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxCalendarLunar } from '../src/components/TkxCalendarLunar';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxCalendarLunar', () => {
  it('renders with label', () => {
    render(<TkxCalendarLunar label="DOB" value={null} onChange={() => {}} />, { wrapper: W });
    expect(screen.getByText('DOB')).toBeInTheDocument();
  });

  it('shows empty when value is null', () => {
    render(<TkxCalendarLunar label="DOB" value={null} onChange={() => {}} />, { wrapper: W });
    const visible = screen.getAllByLabelText(/DOB/i)[0] as HTMLInputElement;
    expect(visible.value).toBe('');
  });

  it('formats Gregorian dates by default', () => {
    const date = new Date(2026, 3, 27);
    render(<TkxCalendarLunar label="DOB" value={date} onChange={() => {}} />, { wrapper: W });
    const visible = screen.getAllByLabelText(/DOB/i)[0] as HTMLInputElement;
    expect(visible.value).toMatch(/2026/);
  });

  it('emits onChange with LunarDate payload when native picker fires', () => {
    const onChange = vi.fn();
    render(<TkxCalendarLunar label="DOB" value={null} onChange={onChange} />, { wrapper: W });
    // Find the native date picker (the secondary input)
    const allInputs = screen.getAllByRole('textbox');
    const native = document.querySelector('input[type="date"]') as HTMLInputElement;
    expect(native).toBeTruthy();
    fireEvent.change(native, { target: { value: '2026-04-27' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        gregorian: expect.any(Date),
        display: expect.any(String),
      }),
    );
  });

  it('respects min/max bounds — rejects out-of-range', () => {
    const onChange = vi.fn();
    render(
      <TkxCalendarLunar
        label="DOB"
        value={null}
        onChange={onChange}
        minDate={new Date(2026, 0, 1)}
        maxDate={new Date(2026, 11, 31)}
      />,
      { wrapper: W },
    );
    const native = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(native, { target: { value: '2025-01-01' } }); // before min
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Hindu calendar mode produces tithi + nakshatra in the LunarDate', () => {
    const onChange = vi.fn();
    render(
      <TkxCalendarLunar
        label="DOB"
        value={null}
        onChange={onChange}
        calendar="hindu"
      />,
      { wrapper: W },
    );
    const native = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(native, { target: { value: '2026-04-27' } });
    const call = onChange.mock.calls[0][0];
    expect(call.tithi).toBeGreaterThanOrEqual(1);
    expect(call.tithi).toBeLessThanOrEqual(30);
    expect(call.nakshatra).toBeGreaterThanOrEqual(1);
    expect(call.nakshatra).toBeLessThanOrEqual(27);
  });

  it('Hijri calendar mode renders a non-Gregorian display', () => {
    const date = new Date(2026, 3, 27);
    render(<TkxCalendarLunar label="DOB" value={date} onChange={() => {}} calendar="hijri" />, {
      wrapper: W,
    });
    const visible = screen.getAllByLabelText(/DOB/i)[0] as HTMLInputElement;
    // Hijri formatting via Intl produces a string that won't equal "2026"
    // alone — should mention the Hijri year (~1447 in this period).
    expect(visible.value).toMatch(/14\d\d/);
  });

  it('disables when disabled prop is set', () => {
    render(<TkxCalendarLunar label="DOB" value={null} onChange={() => {}} disabled />, {
      wrapper: W,
    });
    const visible = screen.getAllByLabelText(/DOB/i)[0] as HTMLInputElement;
    expect(visible).toBeDisabled();
  });
});
