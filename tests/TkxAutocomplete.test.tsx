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
});
