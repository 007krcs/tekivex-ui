import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

function getCombobox() {
  return screen.getByRole('combobox');
}

function getListbox() {
  return screen.queryByRole('listbox');
}

describe('TkxSelect', () => {
  // ── Basics ──────────────────────────────────────────────────────────────
  describe('basics', () => {
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
      expect(getCombobox()).toBeInTheDocument();
    });

    it('renders default locale placeholder when none provided', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      // English default from i18n
      expect(screen.getByText('Select...')).toBeInTheDocument();
    });
  });

  // ── Single-select interactions ───────────────────────────────────────────
  describe('single-select interactions', () => {
    it('opens dropdown on trigger click', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      expect(getCombobox()).toHaveAttribute('aria-expanded', 'true');
      expect(getListbox()).toBeInTheDocument();
    });

    it('shows all options when opened', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('selecting an option fires onChange with the value', () => {
      const onChange = vi.fn();
      render(<TkxSelect options={options} onChange={onChange} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      fireEvent.click(screen.getByText('Banana'));
      expect(onChange).toHaveBeenCalledWith('banana');
    });

    it('selecting an option closes the menu', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      expect(getListbox()).toBeInTheDocument();
      fireEvent.click(screen.getByText('Banana'));
      expect(getListbox()).not.toBeInTheDocument();
      expect(getCombobox()).toHaveAttribute('aria-expanded', 'false');
    });

    it('clicking the trigger again while open closes the menu', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      expect(getListbox()).toBeInTheDocument();
      fireEvent.click(getCombobox());
      expect(getListbox()).not.toBeInTheDocument();
    });

    it('clicking outside closes the menu', () => {
      render(
        <div>
          <TkxSelect options={options} />
          <button>outside</button>
        </div>,
        { wrapper: Wrapper },
      );
      fireEvent.click(getCombobox());
      expect(getListbox()).toBeInTheDocument();
      fireEvent.pointerDown(screen.getByText('outside'));
      expect(getListbox()).not.toBeInTheDocument();
    });

    it('pressing Escape on trigger closes the menu', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      const trigger = getCombobox();
      fireEvent.click(trigger);
      expect(getListbox()).toBeInTheDocument();
      fireEvent.keyDown(trigger, { key: 'Escape' });
      expect(getListbox()).not.toBeInTheDocument();
    });

    it('selected value reflects in the trigger label', () => {
      render(<TkxSelect options={options} defaultValue="cherry" />, { wrapper: Wrapper });
      // Trigger should display the selected option's label
      expect(getCombobox()).toHaveTextContent('Cherry');
    });
  });

  // ── Multi-select ─────────────────────────────────────────────────────────
  describe('multi-select', () => {
    it('allows selecting multiple values without closing', () => {
      const onChange = vi.fn();
      render(<TkxSelect options={options} multiple onChange={onChange} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      fireEvent.click(screen.getByText('Apple'));
      // Should NOT close
      expect(getListbox()).toBeInTheDocument();
      fireEvent.click(screen.getByText('Banana'));
      // Most recent call: both values
      expect(onChange).toHaveBeenLastCalledWith(['apple', 'banana']);
    });

    it('selecting an already-selected value deselects it', () => {
      const onChange = vi.fn();
      render(
        <TkxSelect options={options} multiple defaultValue={['apple', 'banana']} onChange={onChange} />,
        { wrapper: Wrapper },
      );
      fireEvent.click(getCombobox());
      // Apple appears both as a chip and as an option — pick the option
      const appleOption = screen
        .getAllByRole('option')
        .find((o) => o.textContent?.includes('Apple'))!;
      fireEvent.click(appleOption);
      expect(onChange).toHaveBeenLastCalledWith(['banana']);
    });

    it('each selected value renders as a chip in the trigger', () => {
      render(
        <TkxSelect options={options} multiple defaultValue={['apple', 'banana']} />,
        { wrapper: Wrapper },
      );
      // Chip remove buttons expose label "Remove X"
      expect(screen.getByLabelText('Remove Apple')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove Banana')).toBeInTheDocument();
    });

    it('clicking the chip remove button deselects that value', () => {
      const onChange = vi.fn();
      render(
        <TkxSelect options={options} multiple defaultValue={['apple', 'banana']} onChange={onChange} />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByLabelText('Remove Apple'));
      expect(onChange).toHaveBeenLastCalledWith(['banana']);
      // Menu should not open because remove button stops propagation
      expect(getListbox()).not.toBeInTheDocument();
    });

    it('onChange fires with an array of values when multiple', () => {
      const onChange = vi.fn();
      render(<TkxSelect options={options} multiple onChange={onChange} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      fireEvent.click(screen.getByText('Cherry'));
      const arg = onChange.mock.calls[0][0];
      expect(Array.isArray(arg)).toBe(true);
      expect(arg).toEqual(['cherry']);
    });

    it('listbox has aria-multiselectable when multiple', () => {
      render(<TkxSelect options={options} multiple />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      expect(getListbox()).toHaveAttribute('aria-multiselectable', 'true');
    });
  });

  // ── Searchable ───────────────────────────────────────────────────────────
  describe('searchable', () => {
    it('renders a search input when searchable', () => {
      render(<TkxSelect options={options} searchable />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      expect(screen.getByLabelText(/search options/i)).toBeInTheDocument();
    });

    it('typing filters options', () => {
      render(<TkxSelect options={options} searchable />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const input = screen.getByLabelText(/search options/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ban' } });
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
      expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
    });

    it('search is case-insensitive', () => {
      render(<TkxSelect options={options} searchable />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const input = screen.getByLabelText(/search options/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'CHER' } });
      expect(screen.getByText('Cherry')).toBeInTheDocument();
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });

    it('clearing the search restores all options', () => {
      render(<TkxSelect options={options} searchable />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const input = screen.getByLabelText(/search options/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ban' } });
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
      fireEvent.change(input, { target: { value: '' } });
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Cherry')).toBeInTheDocument();
    });

    it('pressing Enter in search selects the first filtered option', () => {
      const onChange = vi.fn();
      render(<TkxSelect options={options} searchable onChange={onChange} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const input = screen.getByLabelText(/search options/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ban' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('banana');
    });

    it('renders "No options found" when nothing matches', () => {
      render(<TkxSelect options={options} searchable />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const input = screen.getByLabelText(/search options/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'zzz' } });
      expect(screen.getByText(/no options found/i)).toBeInTheDocument();
    });
  });

  // ── Keyboard navigation ─────────────────────────────────────────────────
  describe('keyboard navigation', () => {
    it('ArrowDown on closed trigger opens the menu', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      const trigger = getCombobox();
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      expect(getListbox()).toBeInTheDocument();
    });

    it('ArrowDown moves activedescendant forward', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      const trigger = getCombobox();
      fireEvent.click(trigger);
      // After open, activeIndex is 0 → apple
      expect(trigger.getAttribute('aria-activedescendant')).toMatch(/-opt-apple$/);
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      expect(trigger.getAttribute('aria-activedescendant')).toMatch(/-opt-banana$/);
    });

    it('ArrowUp moves activedescendant backward', () => {
      render(<TkxSelect options={options} defaultValue="cherry" />, { wrapper: Wrapper });
      const trigger = getCombobox();
      fireEvent.click(trigger);
      // Selected value sets activeIndex to 2 (cherry)
      expect(trigger.getAttribute('aria-activedescendant')).toMatch(/-opt-cherry$/);
      fireEvent.keyDown(trigger, { key: 'ArrowUp' });
      expect(trigger.getAttribute('aria-activedescendant')).toMatch(/-opt-banana$/);
    });

    it('Enter selects the active option', () => {
      const onChange = vi.fn();
      render(<TkxSelect options={options} onChange={onChange} />, { wrapper: Wrapper });
      const trigger = getCombobox();
      fireEvent.click(trigger);
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      fireEvent.keyDown(trigger, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('banana');
    });

    it('Home jumps to first option, End jumps to last', () => {
      render(<TkxSelect options={options} defaultValue="banana" />, { wrapper: Wrapper });
      const trigger = getCombobox();
      fireEvent.click(trigger);
      fireEvent.keyDown(trigger, { key: 'End' });
      expect(trigger.getAttribute('aria-activedescendant')).toMatch(/-opt-cherry$/);
      fireEvent.keyDown(trigger, { key: 'Home' });
      expect(trigger.getAttribute('aria-activedescendant')).toMatch(/-opt-apple$/);
    });

    it('typeahead jumps to matching option', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      const trigger = getCombobox();
      fireEvent.click(trigger);
      // Trigger typeahead via printable key
      fireEvent.keyDown(trigger, { key: 'c' });
      expect(trigger.getAttribute('aria-activedescendant')).toMatch(/-opt-cherry$/);
    });

    it('Space on closed trigger opens the menu', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      const trigger = getCombobox();
      trigger.focus();
      fireEvent.keyDown(trigger, { key: ' ' });
      expect(getListbox()).toBeInTheDocument();
    });
  });

  // ── Portal positioning ──────────────────────────────────────────────────
  describe('portal positioning', () => {
    it('renders the listbox into document.body (portal)', () => {
      const { container } = render(<TkxSelect options={options} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const listbox = getListbox();
      expect(listbox).toBeInTheDocument();
      // The listbox should NOT be a descendant of the rendered container
      expect(container.contains(listbox)).toBe(false);
      // It should be a descendant of document.body
      expect(document.body.contains(listbox!)).toBe(true);
    });

    it('positions menu width to match the trigger width', () => {
      const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 100, left: 50, right: 250, bottom: 140, width: 200, height: 40, x: 50, y: 100, toJSON: () => ({}),
      } as DOMRect);

      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const listbox = getListbox()!;
      expect(listbox.style.width).toBe('200px');
      spy.mockRestore();
    });

    it('flips above when there is no room below', () => {
      // Trigger near bottom of viewport with very little space below
      const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 700, left: 0, right: 200, bottom: 740, width: 200, height: 40, x: 0, y: 700, toJSON: () => ({}),
      } as DOMRect);
      // window.innerHeight defaults to 768 in jsdom → spaceBelow ~= 22, spaceAbove ~= 694
      // dropdownHeight default = 280; spaceBelow < 200 and < spaceAbove → placement = 'above'

      render(<TkxSelect options={options} maxMenuHeight={280} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const listbox = getListbox()!;
      // Above placement: top = rect.top + scrollY - gap(6) - min(280,280) = 700 - 6 - 280 = 414
      expect(parseInt(listbox.style.top, 10)).toBeLessThan(700);
      spy.mockRestore();
    });
  });

  // ── Virtual scroll ──────────────────────────────────────────────────────
  describe('virtual scroll', () => {
    const manyOptions = Array.from({ length: 200 }, (_, i) => ({
      value: `v${i}`,
      label: `Option ${i}`,
    }));

    it('with 200 options, only a subset of <option> nodes is in the DOM', () => {
      render(<TkxSelect options={manyOptions} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      // Virtual scroll kicks in at 100+; we should NOT render all 200 options
      const rendered = screen.getAllByRole('option');
      expect(rendered.length).toBeLessThan(manyOptions.length);
      // Should render at least a handful (overscan + visible)
      expect(rendered.length).toBeGreaterThan(0);
    });

    it('selecting via virtual scroll still fires onChange with the correct value', () => {
      const onChange = vi.fn();
      render(<TkxSelect options={manyOptions} onChange={onChange} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      // First visible option should be Option 0
      fireEvent.click(screen.getByText('Option 0'));
      expect(onChange).toHaveBeenCalledWith('v0');
    });
  });

  // ── ARIA ────────────────────────────────────────────────────────────────
  describe('aria', () => {
    it('combobox role and aria-haspopup on trigger', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      const trigger = getCombobox();
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('aria-expanded toggles with menu state', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      const trigger = getCombobox();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('aria-controls points at the listbox id', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      const trigger = getCombobox();
      const controlsId = trigger.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
      fireEvent.click(trigger);
      const listbox = getListbox()!;
      expect(listbox.id).toBe(controlsId);
    });

    it('selected options have aria-selected="true"', () => {
      render(<TkxSelect options={options} defaultValue="banana" />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const opts = screen.getAllByRole('option');
      const selected = opts.filter(o => o.getAttribute('aria-selected') === 'true');
      expect(selected).toHaveLength(1);
      expect(selected[0]).toHaveTextContent('Banana');
    });

    it('aria-activedescendant points at the focused option', () => {
      render(<TkxSelect options={options} />, { wrapper: Wrapper });
      const trigger = getCombobox();
      fireEvent.click(trigger);
      const activeId = trigger.getAttribute('aria-activedescendant');
      expect(activeId).toBeTruthy();
      // The element with that id should be a role="option"
      const activeEl = document.getElementById(activeId!);
      expect(activeEl).not.toBeNull();
      expect(activeEl).toHaveAttribute('role', 'option');
    });

    it('disabled options expose aria-disabled', () => {
      const disabledOpts = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ];
      render(<TkxSelect options={disabledOpts} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const opts = screen.getAllByRole('option');
      const disabled = opts.find(o => o.getAttribute('aria-disabled') === 'true');
      expect(disabled).toBeDefined();
      expect(disabled).toHaveTextContent('B');
    });
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('renders error message when invalid', () => {
      render(<TkxSelect options={options} isInvalid errorMessage="Required field" />, { wrapper: Wrapper });
      expect(screen.getByRole('alert')).toHaveTextContent('Required field');
    });

    it('is disabled when isDisabled is true', () => {
      render(<TkxSelect options={options} isDisabled />, { wrapper: Wrapper });
      expect(getCombobox()).toBeDisabled();
    });

    it('disabled select cannot be opened by click', () => {
      render(<TkxSelect options={options} isDisabled />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      expect(getListbox()).not.toBeInTheDocument();
    });

    it('disabled options cannot be selected via click', () => {
      const onChange = vi.fn();
      const disabledOpts = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ];
      render(<TkxSelect options={disabledOpts} onChange={onChange} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      fireEvent.click(screen.getByText('B'));
      expect(onChange).not.toHaveBeenCalled();
      // Menu remains open because nothing committed
      expect(getListbox()).toBeInTheDocument();
    });

    it('empty options array renders "No options found" without crash', () => {
      render(<TkxSelect options={[]} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      expect(screen.getByText(/no options found/i)).toBeInTheDocument();
    });

    it('null/undefined-derived placeholder does not render literal "undefined"', () => {
      // Passing an empty string placeholder shouldn't leak the word "undefined"
      const { container } = render(<TkxSelect options={options} placeholder="" />, { wrapper: Wrapper });
      expect(container.textContent).not.toMatch(/undefined/);
      expect(container.textContent).not.toMatch(/^null$/);
    });

    it('clearable shows clear button that resets selection', () => {
      const onChange = vi.fn();
      render(
        <TkxSelect options={options} clearable defaultValue="apple" onChange={onChange} />,
        { wrapper: Wrapper },
      );
      const clear = screen.getByLabelText(/clear selection/i);
      fireEvent.click(clear);
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('renders group headers when options have groups', () => {
      const grouped = [
        { value: 'a1', label: 'Apple', group: 'Fruits' },
        { value: 'b1', label: 'Beet', group: 'Veg' },
      ];
      render(<TkxSelect options={grouped} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Veg')).toBeInTheDocument();
    });

    it('group headers are not options (not selectable as role=option)', () => {
      const grouped = [
        { value: 'a1', label: 'Apple', group: 'Fruits' },
        { value: 'b1', label: 'Beet', group: 'Veg' },
      ];
      render(<TkxSelect options={grouped} />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      // Only 2 real options (group rows are aria-hidden divs, not role=option)
      expect(screen.getAllByRole('option')).toHaveLength(2);
    });
  });

  // ── A11y regressions (MEDIUM audit fixes) ────────────────────────────────
  describe('a11y regressions (medium audit fixes)', () => {
    it('searchable: search input owns the combobox contract and aria-activedescendant follows ArrowDown', () => {
      render(<TkxSelect options={options} searchable />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const input = screen.getByLabelText(/search options/i);
      expect(input).toHaveAttribute('role', 'combobox');
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input.getAttribute('aria-controls')).toBe(getListbox()!.id);
      // Open sets activeIndex 0 → apple
      expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-apple$/);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      const activeId = input.getAttribute('aria-activedescendant')!;
      expect(activeId).toMatch(/-opt-banana$/);
      expect(document.getElementById(activeId)).toHaveAttribute('role', 'option');
    });

    it('searchable: trigger is downgraded while open, so exactly one combobox exists', () => {
      render(<TkxSelect options={options} searchable />, { wrapper: Wrapper });
      fireEvent.click(getCombobox());
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes).toHaveLength(1);
      expect(comboboxes[0].tagName).toBe('INPUT');
    });

    it('tag remove and clear-all are real buttons, not nested inside another interactive element', () => {
      render(
        <TkxSelect options={options} multiple clearable defaultValue={['apple']} />,
        { wrapper: Wrapper },
      );
      const remove = screen.getByLabelText('Remove Apple');
      const clear = screen.getByLabelText(/clear selection/i);
      expect(remove.tagName).toBe('BUTTON');
      expect(clear.tagName).toBe('BUTTON');
      // No interactive ancestor (previously nested inside the trigger <button>)
      expect(remove.parentElement?.closest('button, [role="button"]')).toBeNull();
      expect(clear.parentElement?.closest('button, [role="button"]')).toBeNull();
    });

    it('tag remove is keyboard-operable (focusable, Enter activates)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TkxSelect options={options} multiple defaultValue={['apple', 'banana']} onChange={onChange} />,
        { wrapper: Wrapper },
      );
      const remove = screen.getByLabelText('Remove Apple');
      remove.focus();
      expect(document.activeElement).toBe(remove);
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenLastCalledWith(['banana']);
      // Activation must not toggle the dropdown open
      expect(getListbox()).not.toBeInTheDocument();
    });

    it('clear-all is keyboard-operable (focusable, Enter activates)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TkxSelect options={options} multiple clearable defaultValue={['apple']} onChange={onChange} />,
        { wrapper: Wrapper },
      );
      const clear = screen.getByLabelText(/clear selection/i);
      clear.focus();
      expect(document.activeElement).toBe(clear);
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenLastCalledWith([]);
    });

    it('Backspace on the trigger removes the last selected tag (multiple)', () => {
      const onChange = vi.fn();
      render(
        <TkxSelect options={options} multiple defaultValue={['apple', 'banana']} onChange={onChange} />,
        { wrapper: Wrapper },
      );
      fireEvent.keyDown(getCombobox(), { key: 'Backspace' });
      expect(onChange).toHaveBeenLastCalledWith(['apple']);
    });
  });
});
