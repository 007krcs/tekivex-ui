import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxCommandPalette } from '../src/components/TkxCommandPalette';
import { TkxAccordion } from '../src/components/TkxAccordion';
import { TkxNumberInput } from '../src/components/TkxNumberInput';
import { TkxSlider } from '../src/components/TkxSlider';
import { TkxField } from '../src/components/TkxField';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('v3.31 LOW a11y fixes', () => {
  // ── CommandPalette: combobox has a robust accessible name ──────────────────
  it('TkxCommandPalette search input has an accessible name beyond placeholder', () => {
    render(
      <TkxCommandPalette
        commands={[{ id: 'a', title: 'Alpha', onSelect: () => {} }]}
        open
        onOpenChange={() => {}}
      />,
      { wrapper: W },
    );
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Search commands');
  });

  // ── Accordion: heading structure + no redundant role="button" ──────────────
  it('TkxAccordion wraps each trigger in a heading (default level 3)', () => {
    render(
      <TkxAccordion items={[{ id: '1', title: 'One', content: 'C1' }]} />,
      { wrapper: W },
    );
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.querySelector('button')).not.toBeNull();
  });

  it('TkxAccordion honors the headingLevel prop', () => {
    render(
      <TkxAccordion headingLevel={2} items={[{ id: '1', title: 'One', content: 'C1' }]} />,
      { wrapper: W },
    );
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('TkxAccordion trigger button carries no explicit role attribute', () => {
    render(
      <TkxAccordion items={[{ id: '1', title: 'One', content: 'C1' }]} />,
      { wrapper: W },
    );
    const btn = screen.getByRole('button', { name: /One/ });
    expect(btn.getAttribute('role')).toBeNull();
  });

  // ── NumberInput: spinbutton role makes aria-value* valid ───────────────────
  it('TkxNumberInput exposes a spinbutton with range semantics', () => {
    render(
      <TkxNumberInput label="Qty" value={5} min={0} max={10} onChange={() => {}} />,
      { wrapper: W },
    );
    const spin = screen.getByRole('spinbutton');
    expect(spin.getAttribute('aria-valuemin')).toBe('0');
    expect(spin.getAttribute('aria-valuemax')).toBe('10');
    expect(spin.getAttribute('aria-valuenow')).toBe('5');
    expect(spin.getAttribute('aria-valuetext')).toBe('5');
  });

  // ── Slider: visible label actually names the thumb ─────────────────────────
  it('TkxSlider single thumb is named by the visible label via aria-labelledby', () => {
    render(<TkxSlider label="Volume" defaultValue={30} />, { wrapper: W });
    const thumb = screen.getByRole('slider');
    const labelledBy = thumb.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const label = document.getElementById(labelledBy as string);
    expect(label?.textContent).toBe('Volume');
    expect(thumb).toHaveAccessibleName('Volume');
  });

  it('TkxSlider range thumbs keep distinguishable start/end names', () => {
    render(<TkxSlider label="Price" isRange rangeValue={[10, 90]} onRangeChange={() => {}} />, {
      wrapper: W,
    });
    const thumbs = screen.getAllByRole('slider');
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]).toHaveAccessibleName('Price start');
    expect(thumbs[1]).toHaveAccessibleName('Price end');
  });

  // ── Field: no dangling aria-describedby idrefs ──────────────────────────────
  it('TkxField drops the hint idref while an error is shown', () => {
    render(
      <TkxField label="Amount" hint="In INR" error="Too low">
        <input />
      </TkxField>,
      { wrapper: W },
    );
    const describedBy = screen.getByLabelText('Amount').getAttribute('aria-describedby') ?? '';
    expect(describedBy).toContain('-error');
    expect(describedBy).not.toContain('-hint');
    // Every referenced id must resolve.
    for (const ref of describedBy.split(' ').filter(Boolean)) {
      expect(document.getElementById(ref)).not.toBeNull();
    }
  });

  it('TkxField with isInvalid but no error string references no error id', () => {
    render(
      <TkxField label="Amount" isInvalid>
        <input />
      </TkxField>,
      { wrapper: W },
    );
    const input = screen.getByLabelText('Amount');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });
});
