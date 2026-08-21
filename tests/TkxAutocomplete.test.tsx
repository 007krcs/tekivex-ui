import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxAutocomplete } from '../src/components/TkxAutocomplete';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';
import type { AutocompleteOption } from '../src/components/TkxAutocomplete';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const options: AutocompleteOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('TkxAutocomplete', () => {
  it('renders the input element', () => {
    render(<TkxAutocomplete options={options} label="Fruit" />, { wrapper: Wrapper });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('has combobox role', () => {
    render(<TkxAutocomplete options={options} label="Fruit" />, { wrapper: Wrapper });
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });

  it('renders label text', () => {
    render(<TkxAutocomplete options={options} label="Select Fruit" />, { wrapper: Wrapper });
    expect(screen.getByText('Select Fruit')).toBeInTheDocument();
  });

  it('renders placeholder', () => {
    render(<TkxAutocomplete options={options} label="Fruit" placeholder="Search..." />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('opens dropdown on input focus and typing', () => {
    render(<TkxAutocomplete options={options} label="Fruit" />, { wrapper: Wrapper });
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'A' } });
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  // -- WAI-ARIA 1.2 conformance regressions ---------------------------------
  describe('aria conformance', () => {
    it('emits no dangling aria-controls while the listbox is closed', () => {
      render(<TkxAutocomplete options={options} label="Fruit" />, { wrapper: Wrapper });
      const input = screen.getByRole('combobox');
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(input.hasAttribute('aria-controls')).toBe(false);
      expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    });

    it('aria-controls appears and resolves to the listbox once open', () => {
      render(<TkxAutocomplete options={options} label="Fruit" />, { wrapper: Wrapper });
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'A' } });
      const controls = input.getAttribute('aria-controls')!;
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls)).toBe(screen.getByRole('listbox'));
    });

    it('the combobox is named by the label prop', () => {
      render(<TkxAutocomplete options={options} label="Fruit" />, { wrapper: Wrapper });
      expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeInTheDocument();
    });

    it('falls back to the placeholder for its name when the label is blank', () => {
      render(
        <TkxAutocomplete options={options} label="" placeholder="Search fruit" />,
        { wrapper: Wrapper },
      );
      expect(screen.getByRole('combobox', { name: 'Search fruit' })).toBeInTheDocument();
    });

    it('is named even with neither a label nor a placeholder', () => {
      render(<TkxAutocomplete options={options} label="" />, { wrapper: Wrapper });
      const name = screen.getByRole('combobox').getAttribute('aria-label');
      expect(name && name.trim().length).toBeTruthy();
    });
  });
});
