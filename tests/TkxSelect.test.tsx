import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxSelect } from '../src/components/TkxSelect';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('TkxSelect', () => {
  it('renders with placeholder', () => {
    render(<TkxSelect options={options} placeholder="Choose fruit" />, { wrapper: Wrapper });
    expect(screen.getByText('Choose fruit')).toBeInTheDocument();
  });

  it('renders with a label', () => {
    render(<TkxSelect options={options} label="Fruit" />, { wrapper: Wrapper });
    expect(screen.getByText('Fruit')).toBeInTheDocument();
  });

  it('has combobox role', () => {
    render(<TkxSelect options={options} />, { wrapper: Wrapper });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(<TkxSelect options={options} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows options when opened', () => {
    render(<TkxSelect options={options} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('selects an option on click', () => {
    const onChange = vi.fn();
    render(<TkxSelect options={options} onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith('banana');
  });

  it('shows error message when invalid', () => {
    render(<TkxSelect options={options} isInvalid errorMessage="Required field" />, { wrapper: Wrapper });
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('is disabled when isDisabled is true', () => {
    render(<TkxSelect options={options} isDisabled />, { wrapper: Wrapper });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
