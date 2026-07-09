import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxMentions } from '../src/components/TkxMentions';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const options = [
  { value: 'alice', label: 'Alice' },
  { value: 'bob', label: 'Bob' },
  { value: 'charlie', label: 'Charlie' },
];

function getInput() {
  return screen.getByRole('combobox') as HTMLTextAreaElement;
}

function openSuggestions() {
  const input = getInput();
  fireEvent.change(input, { target: { value: '@' } });
  return input;
}

describe('TkxMentions', () => {
  it('renders a combobox textarea, collapsed by default', () => {
    render(<TkxMentions options={options} />, { wrapper: Wrapper });
    const input = getInput();
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(input).not.toHaveAttribute('aria-controls');
  });

  it('typing the trigger character opens the suggestion listbox', () => {
    render(<TkxMentions options={options} />, { wrapper: Wrapper });
    const input = openSuggestions();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('combobox references the open listbox via aria-controls', () => {
    render(<TkxMentions options={options} />, { wrapper: Wrapper });
    const input = openSuggestions();
    const listbox = screen.getByRole('listbox');
    expect(listbox.id).toBeTruthy();
    expect(input.getAttribute('aria-controls')).toBe(listbox.id);
  });

  it('exposes the active option via aria-activedescendant and follows arrow keys', () => {
    render(<TkxMentions options={options} />, { wrapper: Wrapper });
    const input = openSuggestions();
    const opts = screen.getAllByRole('option');
    // Every option must carry an id for the activedescendant relationship
    opts.forEach((o) => expect(o.id).toBeTruthy());

    // Initially the first option is active
    expect(input.getAttribute('aria-activedescendant')).toBe(opts[0].id);
    expect(opts[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toBe(opts[1].id);
    expect(opts[1]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.getAttribute('aria-activedescendant')).toBe(opts[0].id);
  });

  it('Enter inserts the active mention and collapses the listbox', () => {
    const onChange = vi.fn();
    render(<TkxMentions options={options} onChange={onChange} />, { wrapper: Wrapper });
    const input = openSuggestions();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith('@bob ');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('Escape closes the listbox and clears aria-activedescendant', () => {
    render(<TkxMentions options={options} />, { wrapper: Wrapper });
    const input = openSuggestions();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });
});
