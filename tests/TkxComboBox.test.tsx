import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxComboBox } from '../src/components/TkxComboBox';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('TkxComboBox', () => {
  it('renders a labelled combobox wired for a11y', () => {
    render(<TkxComboBox label="Tags" hint="Pick some tags" options={FRUITS} />, { wrapper: W });
    const input = screen.getByRole('combobox', { name: 'Tags' });
    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-describedby')).toContain('-hint');
  });

  it('survives a bare mount (label is the only required prop)', () => {
    expect(() => render(<TkxComboBox label="X" />, { wrapper: W })).not.toThrow();
  });

  it('forwards a ref to the inner input', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TkxComboBox label="X" ref={ref} />, { wrapper: W });
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('opens on focus and typing filters options (case-insensitive substring)', () => {
    render(<TkxComboBox label="Tags" options={FRUITS} />, { wrapper: W });
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getAllByRole('option')).toHaveLength(3);
    fireEvent.change(input, { target: { value: 'aN' } });
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toContain('Banana');
  });

  it('ArrowDown + Enter selects: chip appears, onChange fires with array, list stays open', () => {
    const onChange = vi.fn();
    render(<TkxComboBox label="Tags" options={FRUITS} onChange={onChange} />, { wrapper: W });
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // opens (already open) → first move
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['apple'], [FRUITS[0]]);
    expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeTruthy();
    // multi-select convention: listbox stays open, query cleared
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('selecting clears the typed query', () => {
    render(<TkxComboBox label="Tags" options={FRUITS} />, { wrapper: W });
    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'che' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('');
    expect(screen.getByRole('button', { name: 'Remove Cherry' })).toBeTruthy();
  });

  it('chip remove button removes the value', () => {
    const onChange = vi.fn();
    render(
      <TkxComboBox label="Tags" options={FRUITS} defaultValue={['apple', 'banana']} onChange={onChange} />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove Apple' }));
    expect(onChange).toHaveBeenCalledWith(['banana'], [FRUITS[1]]);
    expect(screen.queryByRole('button', { name: 'Remove Apple' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Remove Banana' })).toBeTruthy();
  });

  it('Backspace on an empty input removes the last chip', () => {
    const onChange = vi.fn();
    render(
      <TkxComboBox label="Tags" options={FRUITS} defaultValue={['apple', 'banana']} onChange={onChange} />,
      { wrapper: W },
    );
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['apple'], [FRUITS[0]]);
    expect(screen.queryByRole('button', { name: 'Remove Banana' })).toBeNull();
  });

  it('controlled value renders chips and does not self-mutate', () => {
    const onChange = vi.fn();
    render(
      <TkxComboBox label="Tags" options={FRUITS} value={['banana', 'cherry']} onChange={onChange} />,
      { wrapper: W },
    );
    expect(screen.getByRole('button', { name: 'Remove Banana' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove Cherry' })).toBeTruthy();
    // Removing reports through onChange but chips stay (parent owns state)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Banana' }));
    expect(onChange).toHaveBeenCalledWith(['cherry'], [FRUITS[2]]);
    expect(screen.getByRole('button', { name: 'Remove Banana' })).toBeTruthy();
  });

  it('maxSelected blocks further selection and marks options aria-disabled', () => {
    const onChange = vi.fn();
    render(
      <TkxComboBox
        label="Tags"
        options={FRUITS}
        defaultValue={['apple']}
        maxSelected={1}
        onChange={onChange}
      />,
      { wrapper: W },
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    const banana = screen.getAllByRole('option').find((o) => o.textContent?.includes('Banana'))!;
    expect(banana.getAttribute('aria-disabled')).toBe('true');
    fireEvent.mouseDown(banana);
    expect(onChange).not.toHaveBeenCalled();
    // the already-selected option can still be deselected
    const apple = screen.getAllByRole('option').find((o) => o.textContent?.includes('Apple'))!;
    expect(apple.getAttribute('aria-disabled')).toBeNull();
    fireEvent.mouseDown(apple);
    expect(onChange).toHaveBeenCalledWith([], []);
  });

  it('disabled options are skipped by keyboard nav and not selectable', () => {
    const onChange = vi.fn();
    const opts = [
      { value: 'a', label: 'Alpha', disabled: true },
      { value: 'b', label: 'Beta' },
    ];
    render(<TkxComboBox label="Tags" options={opts} onChange={onChange} />, { wrapper: W });
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    // Alpha (disabled) was skipped; Beta selected
    expect(onChange).toHaveBeenCalledWith(['b'], [opts[1]]);
    fireEvent.mouseDown(screen.getAllByRole('option').find((o) => o.textContent?.includes('Alpha'))!);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('Escape closes the listbox', () => {
    render(<TkxComboBox label="Tags" options={FRUITS} />, { wrapper: W });
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeTruthy();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('uses aria-activedescendant instead of roving focus', () => {
    render(<TkxComboBox label="Tags" options={FRUITS} />, { wrapper: W });
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const active = input.getAttribute('aria-activedescendant')!;
    expect(active).toBeTruthy();
    expect(document.getElementById(active)?.textContent).toContain('Apple');
  });

  it('listbox is aria-multiselectable and options expose aria-selected', () => {
    render(<TkxComboBox label="Tags" options={FRUITS} defaultValue={['apple']} />, { wrapper: W });
    fireEvent.focus(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    expect(listbox.getAttribute('aria-multiselectable')).toBe('true');
    const apple = screen.getAllByRole('option').find((o) => o.textContent?.includes('Apple'))!;
    expect(apple.getAttribute('aria-selected')).toBe('true');
    const banana = screen.getAllByRole('option').find((o) => o.textContent?.includes('Banana'))!;
    expect(banana.getAttribute('aria-selected')).toBe('false');
  });

  it('renders a hidden input carrying name + comma-joined values', () => {
    const { container } = render(
      <TkxComboBox label="Tags" options={FRUITS} name="tags" defaultValue={['apple', 'cherry']} />,
      { wrapper: W },
    );
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe('tags');
    expect(hidden.value).toBe('apple,cherry');
  });

  it('clear-all button empties the selection (clearable default)', () => {
    const onChange = vi.fn();
    render(
      <TkxComboBox label="Tags" options={FRUITS} defaultValue={['apple', 'banana']} onChange={onChange} />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onChange).toHaveBeenCalledWith([], []);
    expect(screen.queryByRole('button', { name: 'Remove Apple' })).toBeNull();
  });

  it('shows an error with role=alert and aria-invalid', () => {
    render(<TkxComboBox label="Tags" error="Pick at least one" />, { wrapper: W });
    expect(screen.getByRole('alert').textContent).toContain('Pick at least one');
    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBe('true');
  });

  // -- WAI-ARIA 1.2 conformance regressions ---------------------------------
  describe('aria conformance', () => {
    it('emits no dangling aria-controls while the listbox is closed', () => {
      render(<TkxComboBox label="Tags" options={FRUITS} />, { wrapper: W });
      const input = screen.getByRole('combobox');
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(input.hasAttribute('aria-controls')).toBe(false);
      expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    });

    it('aria-controls appears and resolves to the listbox once open', () => {
      render(<TkxComboBox label="Tags" options={FRUITS} />, { wrapper: W });
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      const controls = input.getAttribute('aria-controls')!;
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls)).toBe(screen.getByRole('listbox'));
    });

    it('the combobox is named by the label prop', () => {
      render(<TkxComboBox label="Recipients" options={FRUITS} />, { wrapper: W });
      expect(screen.getByRole('combobox', { name: 'Recipients' })).toBeTruthy();
    });

    it('falls back to the placeholder for its name when the label is blank', () => {
      render(<TkxComboBox label="" placeholder="Add recipients" options={FRUITS} />, { wrapper: W });
      expect(screen.getByRole('combobox', { name: 'Add recipients' })).toBeTruthy();
    });

    it('is named even with neither a label nor a placeholder', () => {
      render(<TkxComboBox label="" options={FRUITS} />, { wrapper: W });
      const name = screen.getByRole('combobox').getAttribute('aria-label');
      expect(name && name.trim().length).toBeTruthy();
    });
  });
});
