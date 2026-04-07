import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxRadio, TkxRadioGroup } from '../src/components/TkxRadio';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxRadio', () => {
  it('renders a radio group with items', () => {
    render(
      <TkxRadioGroup name="color" label="Pick a color">
        <TkxRadio label="Red" value="red" />
        <TkxRadio label="Blue" value="blue" />
      </TkxRadioGroup>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('renders labels for each radio', () => {
    render(
      <TkxRadioGroup name="fruit">
        <TkxRadio label="Apple" value="apple" />
        <TkxRadio label="Banana" value="banana" />
      </TkxRadioGroup>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const onChange = vi.fn();
    render(
      <TkxRadioGroup name="size" value="sm" onChange={onChange}>
        <TkxRadio label="Small" value="sm" />
        <TkxRadio label="Large" value="lg" />
      </TkxRadioGroup>,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByText('Large'));
    expect(onChange).toHaveBeenCalledWith('lg');
  });

  it('reflects selected value', () => {
    render(
      <TkxRadioGroup name="choice" value="b">
        <TkxRadio label="A" value="a" />
        <TkxRadio label="B" value="b" />
      </TkxRadioGroup>,
      { wrapper: Wrapper },
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[1]).toBeChecked();
    expect(radios[0]).not.toBeChecked();
  });

  it('supports disabled state on group', () => {
    render(
      <TkxRadioGroup name="disabled" isDisabled>
        <TkxRadio label="Option" value="opt" />
      </TkxRadioGroup>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('displays error message', () => {
    render(
      <TkxRadioGroup name="err" isInvalid errorMessage="Selection required">
        <TkxRadio label="A" value="a" />
      </TkxRadioGroup>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Selection required');
  });
});
