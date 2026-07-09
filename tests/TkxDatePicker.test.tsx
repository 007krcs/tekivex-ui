import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRef } from 'react';
import { render, fireEvent, screen, within, act } from '@testing-library/react';
import { TkxDatePicker, type DatePreset } from '../src/components/TkxDatePicker';
import { ThemeProvider } from '../src/themes';

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

function openPicker(input: HTMLElement) {
  fireEvent.click(input);
  fireEvent.focus(input);
}

function getInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input') as HTMLInputElement;
}

// Get the open calendar dialog (portalled to body).
function getDialog(): HTMLElement | null {
  return document.body.querySelector('[role="dialog"]');
}

// Find a day cell button by its accessible name (e.g., "Wednesday, April 15, 2026").
function getDayByLabel(year: number, month: number, day: number): HTMLButtonElement {
  const d = new Date(year, month, day);
  const label = d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const btn = document.body.querySelector(`[aria-label="${label}"]`) as HTMLButtonElement | null;
  if (!btn) throw new Error(`No day cell found for ${label}`);
  return btn;
}

function queryDayByLabel(year: number, month: number, day: number): HTMLButtonElement | null {
  const d = new Date(year, month, day);
  const label = d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return document.body.querySelector(`[aria-label="${label}"]`) as HTMLButtonElement | null;
}

describe('TkxDatePicker', () => {
  // ── Existing surface (preserved) ────────────────────────────────────────
  describe('basics (preserved)', () => {
    it('renders label', () => {
      const { getByText } = wrap(<TkxDatePicker label="Birthday" />);
      expect(getByText('Birthday')).toBeTruthy();
    });

    it('sanitizes label (strips script)', () => {
      const { container } = wrap(<TkxDatePicker label="<script>x</script>Date" />);
      expect(container.querySelector('label script')).toBeNull();
      expect(container.textContent).toMatch(/Date/);
    });

    it('renders placeholder', () => {
      const { container } = wrap(<TkxDatePicker placeholder="Select a date" />);
      expect(getInput(container).getAttribute('placeholder')).toBe('Select a date');
    });

    it('disabled state', () => {
      const { container } = wrap(<TkxDatePicker isDisabled label="X" />);
      const input = getInput(container);
      expect(input.hasAttribute('disabled') || input.getAttribute('aria-disabled') === 'true').toBe(true);
    });

    it('invalid state sets aria-invalid', () => {
      const { container } = wrap(<TkxDatePicker isInvalid errorMessage="Required" label="X" />);
      expect(getInput(container).getAttribute('aria-invalid')).toBe('true');
    });

    it('shows error message', () => {
      const { getByText } = wrap(<TkxDatePicker isInvalid errorMessage="Bad date" label="X" />);
      expect(getByText('Bad date')).toBeTruthy();
    });

    it('shows hint when no error', () => {
      const { getByText } = wrap(<TkxDatePicker hint="DD/MM/YYYY" label="X" />);
      expect(getByText('DD/MM/YYYY')).toBeTruthy();
    });
  });

  // ── Single-date basics ──────────────────────────────────────────────────
  describe('single-date', () => {
    it('opens calendar (dialog) when input is clicked', () => {
      const { container } = wrap(<TkxDatePicker label="X" />);
      openPicker(getInput(container));
      expect(getDialog()).not.toBeNull();
    });

    it('opens calendar when toggle chevron is clicked', () => {
      const { container } = wrap(<TkxDatePicker label="X" />);
      const toggle = container.querySelector('button[aria-label="Open calendar"]') as HTMLButtonElement;
      fireEvent.click(toggle);
      expect(getDialog()).not.toBeNull();
    });

    it('selecting a day fires onChange with that Date', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 15)} onChange={onChange} label="X" />,
      );
      openPicker(getInput(container));
      fireEvent.click(getDayByLabel(2026, 3, 10));
      expect(onChange).toHaveBeenCalled();
      const arg = onChange.mock.calls[0][0] as Date;
      expect(arg.getFullYear()).toBe(2026);
      expect(arg.getMonth()).toBe(3);
      expect(arg.getDate()).toBe(10);
    });

    it('selecting a day closes the picker (single, no time)', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 15)} onChange={onChange} label="X" />,
      );
      openPicker(getInput(container));
      expect(getDialog()).not.toBeNull();
      fireEvent.click(getDayByLabel(2026, 3, 20));
      expect(getDialog()).toBeNull();
    });

    it('clicking outside (pointerdown) closes the dialog', () => {
      const { container } = wrap(
        <div>
          <TkxDatePicker label="X" />
          <button data-testid="outside">outside</button>
        </div> as any,
      );
      openPicker(getInput(container));
      expect(getDialog()).not.toBeNull();
      fireEvent.pointerDown(screen.getByTestId('outside'));
      expect(getDialog()).toBeNull();
    });

    it('Escape key closes dialog and returns focus to input', () => {
      const { container } = wrap(<TkxDatePicker label="X" />);
      const input = getInput(container);
      openPicker(input);
      expect(getDialog()).not.toBeNull();
      // Component listens via document.addEventListener('keydown'), which is
      // a NATIVE listener — fireEvent.keyDown dispatches React's synthetic
      // event and doesn't reach native listeners. Dispatch the native event
      // inside act() so the setOpen state flush completes before assertion.
      act(() => {
        // bubbles: true ensures the listener at document level receives it
        // (default Event constructor disables bubbling).
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
        );
      });
      expect(getDialog()).toBeNull();
      expect(document.activeElement).toBe(input);
    });

    it('pre-filled value shows formatted in the input', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 22)} onChange={() => {}} label="X" />,
      );
      const v = getInput(container).value;
      expect(v).toMatch(/2026/);
      expect(v).toMatch(/22/);
      expect(v).toMatch(/04/);
    });

    it('null value renders empty input + placeholder visible', () => {
      const { container } = wrap(
        <TkxDatePicker value={null} onChange={() => {}} label="X" placeholder="Pick date" />,
      );
      const input = getInput(container);
      expect(input.value).toBe('');
      expect(input.getAttribute('placeholder')).toBe('Pick date');
    });
  });

  // ── Range mode ──────────────────────────────────────────────────────────
  describe('range mode', () => {
    // These tests click May 2026 day cells but don't pass a value/defaultMonth,
    // so the picker opens on whatever "today" is. Pin the clock to May 2026 so
    // the rendered month matches the fixtures regardless of the real date.
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 4, 1));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('mode="range" renders Apply/Cancel footer', () => {
      const { container } = wrap(<TkxDatePicker mode="range" label="X" />);
      openPicker(getInput(container));
      const dlg = getDialog()!;
      expect(within(dlg).getByText('Apply')).toBeInTheDocument();
      expect(within(dlg).getByText('Cancel')).toBeInTheDocument();
    });

    it('clicking two dates calls onRangeChange with [start, end] eventually', () => {
      const onRangeChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker
          mode="range"
          rangeValue={[null, null]}
          onRangeChange={onRangeChange}
          label="X"
        />,
      );
      // Component requires open via input focus + initial view month set
      openPicker(getInput(container));
      fireEvent.click(getDayByLabel(2026, 4, 5));
      fireEvent.click(getDayByLabel(2026, 4, 20));
      // First click → [start, null]; second click is staged (needsApply).
      // The first call should have been start-only.
      const firstCall = onRangeChange.mock.calls[0][0];
      expect(firstCall[0]).toBeInstanceOf(Date);
      expect((firstCall[0] as Date).getDate()).toBe(5);
      expect(firstCall[1]).toBeNull();
    });

    it('clicking before start swaps start/end (ordered range)', () => {
      const onRangeChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker
          mode="range"
          rangeValue={[null, null]}
          onRangeChange={onRangeChange}
          label="X"
        />,
      );
      openPicker(getInput(container));
      // First click: 20th
      fireEvent.click(getDayByLabel(2026, 4, 20));
      // Second click: 5th (earlier) → should swap. After this commit via Apply.
      fireEvent.click(getDayByLabel(2026, 4, 5));
      fireEvent.click(within(getDialog()!).getByText('Apply'));
      const last = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
      expect((last[0] as Date).getDate()).toBe(5);
      expect((last[1] as Date).getDate()).toBe(20);
    });

    it('Apply commits the pending range', () => {
      const onRangeChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker
          mode="range"
          onRangeChange={onRangeChange}
          label="X"
        />,
      );
      openPicker(getInput(container));
      fireEvent.click(getDayByLabel(2026, 4, 5));
      fireEvent.click(getDayByLabel(2026, 4, 10));
      fireEvent.click(within(getDialog()!).getByText('Apply'));
      expect(getDialog()).toBeNull();
      const last = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
      expect((last[0] as Date).getDate()).toBe(5);
      expect((last[1] as Date).getDate()).toBe(10);
    });

    it('Cancel discards pending and closes', () => {
      const onRangeChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker
          mode="range"
          rangeValue={[null, null]}
          onRangeChange={onRangeChange}
          label="X"
        />,
      );
      openPicker(getInput(container));
      fireEvent.click(getDayByLabel(2026, 4, 5));
      fireEvent.click(within(getDialog()!).getByText('Cancel'));
      expect(getDialog()).toBeNull();
    });

    it('clear button resets the range', () => {
      const onRangeChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker
          mode="range"
          rangeValue={[new Date(2026, 3, 10), new Date(2026, 3, 20)]}
          onRangeChange={onRangeChange}
          label="X"
        />,
      );
      const clear = container.querySelector('button[aria-label="Clear selection"]') as HTMLButtonElement;
      expect(clear).not.toBeNull();
      fireEvent.click(clear);
      expect(onRangeChange).toHaveBeenCalledWith([null, null]);
    });
  });

  // ── Multi mode ──────────────────────────────────────────────────────────
  describe('multi mode', () => {
    // Same as range mode: clicks target May 2026 with no value/defaultMonth,
    // so pin the clock to May 2026 for a deterministic rendered month.
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 4, 1));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('mode="multiple" — each click adds a date to the array', () => {
      const onMultiChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker
          mode="multiple"
          multiValue={[]}
          onMultiChange={onMultiChange}
          label="X"
        />,
      );
      openPicker(getInput(container));
      fireEvent.click(getDayByLabel(2026, 4, 5));
      const first = onMultiChange.mock.calls[0][0] as Date[];
      expect(first).toHaveLength(1);
      expect(first[0].getDate()).toBe(5);
    });

    it('clicking an already-selected date toggles it off', () => {
      const onMultiChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker
          mode="multiple"
          multiValue={[new Date(2026, 4, 5), new Date(2026, 4, 10)]}
          onMultiChange={onMultiChange}
          label="X"
        />,
      );
      openPicker(getInput(container));
      fireEvent.click(getDayByLabel(2026, 4, 5));
      const next = onMultiChange.mock.calls[0][0] as Date[];
      expect(next).toHaveLength(1);
      expect(next[0].getDate()).toBe(10);
    });

    it('input shows "N dates selected" count', () => {
      const { container } = wrap(
        <TkxDatePicker
          mode="multiple"
          multiValue={[new Date(2026, 4, 5), new Date(2026, 4, 10), new Date(2026, 4, 15)]}
          onMultiChange={() => {}}
          label="X"
        />,
      );
      expect(getInput(container).value).toBe('3 dates selected');
    });

    it('multi-mode input is readOnly (can\'t type freely)', () => {
      const { container } = wrap(
        <TkxDatePicker mode="multiple" multiValue={[]} onMultiChange={() => {}} label="X" />,
      );
      expect(getInput(container).readOnly).toBe(true);
    });
  });

  // ── Presets ─────────────────────────────────────────────────────────────
  describe('presets', () => {
    it('renders preset sidebar when showPresets + mode="range"', () => {
      const { container } = wrap(
        <TkxDatePicker mode="range" showPresets label="X" />,
      );
      openPicker(getInput(container));
      expect(within(getDialog()!).getByText('Quick select')).toBeInTheDocument();
    });

    it('renders 13 built-in presets', () => {
      const { container } = wrap(
        <TkxDatePicker mode="range" showPresets label="X" />,
      );
      openPicker(getInput(container));
      // Scope to the preset sidebar (parent of the "Quick select" header).
      const quickSelect = within(getDialog()!).getByText('Quick select');
      const sidebar = quickSelect.parentElement as HTMLElement;
      const presetBtns = sidebar.querySelectorAll('button');
      expect(presetBtns.length).toBe(13);
      // Spot-check a few labels that must be present
      const labels = Array.from(presetBtns).map((b) => b.textContent);
      expect(labels).toContain('Last 90 days');
      expect(labels).toContain('This quarter');
      expect(labels).toContain('Last year');
    });

    it('clicking a preset fires onRangeChange with the right range', () => {
      const onRangeChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker mode="range" showPresets onRangeChange={onRangeChange} label="X" />,
      );
      openPicker(getInput(container));
      // "Last 90 days" is unique to the preset sidebar (no clash with the footer).
      fireEvent.click(within(getDialog()!).getByText('Last 90 days'));
      const lastCall = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
      expect(lastCall[0]).toBeInstanceOf(Date);
      expect(lastCall[1]).toBeInstanceOf(Date);
      // 90-day span: ~89 days between start and end (start.setDate(-89)).
      const diffDays = Math.round(
        ((lastCall[1] as Date).getTime() - (lastCall[0] as Date).getTime()) / 86_400_000,
      );
      expect(diffDays).toBe(89);
    });

    it('customPresets override built-ins', () => {
      const customPresets: DatePreset[] = [
        { label: 'My Custom Range', getValue: () => [new Date(2026, 0, 1), new Date(2026, 0, 31)] },
      ];
      const { container } = wrap(
        <TkxDatePicker mode="range" showPresets customPresets={customPresets} label="X" />,
      );
      openPicker(getInput(container));
      const dlg = getDialog()!;
      expect(within(dlg).getByText('My Custom Range')).toBeInTheDocument();
      // Built-ins should NOT appear
      expect(within(dlg).queryByText('Last 90 days')).toBeNull();
    });
  });

  // ── Format / parsing ────────────────────────────────────────────────────
  describe('format and parsing', () => {
    it('dateFormat="DD/MM/YYYY" renders in EU order', () => {
      const { container } = wrap(
        <TkxDatePicker
          value={new Date(2026, 3, 22)}
          onChange={() => {}}
          dateFormat="DD/MM/YYYY"
          label="X"
        />,
      );
      expect(getInput(container).value).toBe('22/04/2026');
    });

    it('dateFormat="YYYY-MM-DD" renders ISO-style', () => {
      const { container } = wrap(
        <TkxDatePicker
          value={new Date(2026, 3, 22)}
          onChange={() => {}}
          dateFormat="YYYY-MM-DD"
          label="X"
        />,
      );
      expect(getInput(container).value).toBe('2026-04-22');
    });

    it('dateFormat="MMM D, YYYY" renders human-friendly', () => {
      const { container } = wrap(
        <TkxDatePicker
          value={new Date(2026, 3, 5)}
          onChange={() => {}}
          dateFormat="MMM D, YYYY"
          label="X"
        />,
      );
      expect(getInput(container).value).toBe('Apr 5, 2026');
    });

    it('typing MM/DD/YYYY parses and fires onChange', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={null} onChange={onChange} label="X" />,
      );
      const input = getInput(container);
      fireEvent.change(input, { target: { value: '04/22/2026' } });
      expect(onChange).toHaveBeenCalled();
      const arg = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Date;
      expect(arg.getFullYear()).toBe(2026);
      expect(arg.getMonth()).toBe(3);
      expect(arg.getDate()).toBe(22);
    });

    it('typing ISO YYYY-MM-DD parses', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={null} onChange={onChange} label="X" />,
      );
      fireEvent.change(getInput(container), { target: { value: '2026-04-22' } });
      const arg = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Date;
      expect(arg.getMonth()).toBe(3);
      expect(arg.getDate()).toBe(22);
    });

    it('typing invalid date does NOT crash or call onChange', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={null} onChange={onChange} label="X" />,
      );
      fireEvent.change(getInput(container), { target: { value: 'not-a-date' } });
      expect(onChange).not.toHaveBeenCalled();
      // Input still reflects user typing
      expect(getInput(container).value).toBe('not-a-date');
    });
  });

  // ── View modes ──────────────────────────────────────────────────────────
  describe('view modes', () => {
    it('clicking month name in day view drills into month view', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 15)} onChange={() => {}} label="X" />,
      );
      openPicker(getInput(container));
      // "April" button in header
      fireEvent.click(within(getDialog()!).getByText('April'));
      // Now in month view: should show "Jan", "Feb"... abbreviations
      const dlg = getDialog()!;
      expect(within(dlg).getByText('Jan')).toBeInTheDocument();
      expect(within(dlg).getByText('Dec')).toBeInTheDocument();
    });

    it('clicking year in day view drills into year/decade view', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 15)} onChange={() => {}} label="X" />,
      );
      openPicker(getInput(container));
      fireEvent.click(within(getDialog()!).getByText('2026'));
      // Decade label like "2020–2029"
      expect(within(getDialog()!).getByText(/2020.+2029/)).toBeInTheDocument();
    });

    it('selecting a month from month view returns to day view', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 15)} onChange={() => {}} label="X" />,
      );
      openPicker(getInput(container));
      fireEvent.click(within(getDialog()!).getByText('April'));
      // Month view active. Pick Sep.
      fireEvent.click(within(getDialog()!).getByText('Sep'));
      // Back to day view: September header button should be present
      expect(within(getDialog()!).getByText('September')).toBeInTheDocument();
    });
  });

  // ── Keyboard navigation ─────────────────────────────────────────────────
  describe('keyboard nav', () => {
    it('ArrowRight on the dialog advances focused date by 1 day', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={onChange} label="X" />,
      );
      openPicker(getInput(container));
      const dlg = getDialog()!;
      // Focus a day first so focusedDate state initializes to the 15th, then
      // ArrowRight moves focusedDate to the 16th, then Enter selects it.
      getDayByLabel(2026, 4, 15).focus();
      fireEvent.keyDown(dlg, { key: 'ArrowRight' });
      fireEvent.keyDown(dlg, { key: 'Enter' });
      expect(onChange).toHaveBeenCalled();
      const arg = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Date;
      expect(arg.getDate()).toBe(16);
    });

    it('ArrowDown advances focused date by 7 days (one week)', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 1)} onChange={onChange} label="X" />,
      );
      openPicker(getInput(container));
      const dlg = getDialog()!;
      getDayByLabel(2026, 4, 1).focus();
      fireEvent.keyDown(dlg, { key: 'ArrowDown' });
      fireEvent.keyDown(dlg, { key: 'Enter' });
      const arg = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Date;
      expect(arg.getDate()).toBe(8);
    });

    it('ArrowUp moves focused date back by 7 days', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={onChange} label="X" />,
      );
      openPicker(getInput(container));
      const dlg = getDialog()!;
      getDayByLabel(2026, 4, 15).focus();
      fireEvent.keyDown(dlg, { key: 'ArrowUp' });
      fireEvent.keyDown(dlg, { key: 'Enter' });
      const arg = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Date;
      expect(arg.getDate()).toBe(8);
    });
  });

  // ── Time picker ─────────────────────────────────────────────────────────
  describe('time picker', () => {
    it('showTime renders Hour and Min columns', () => {
      const { container } = wrap(
        <TkxDatePicker showTime label="X" />,
      );
      openPicker(getInput(container));
      const dlg = getDialog()!;
      expect(within(dlg).getByText('Hour')).toBeInTheDocument();
      expect(within(dlg).getByText('Min')).toBeInTheDocument();
    });

    it('clicking an hour fires onTimeChange', () => {
      const onTimeChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker
          showTime
          timeValue={{ h: 0, m: 0 }}
          onTimeChange={onTimeChange}
          label="X"
        />,
      );
      openPicker(getInput(container));
      const dlg = getDialog()!;
      // Scope to the Hour column: find the "Hour" label, then walk to its
      // sibling list of <button> children (the scroller is the next div).
      const hourLabel = within(dlg).getByText('Hour');
      const hourColumn = hourLabel.parentElement as HTMLElement; // column wrapper
      const hourScroller = hourColumn.querySelector('div[style*="overflow"]') as HTMLElement;
      const hourBtns = Array.from(hourScroller.querySelectorAll('button')) as HTMLButtonElement[];
      // Hours are 0-23 with padStart 2 → "14" is at index 14.
      const hour14 = hourBtns.find((b) => b.textContent === '14')!;
      fireEvent.click(hour14);
      expect(onTimeChange).toHaveBeenCalled();
      const arg = onTimeChange.mock.calls[onTimeChange.mock.calls.length - 1][0];
      expect(arg.h).toBe(14);
    });
  });

  // ── Locale ──────────────────────────────────────────────────────────────
  describe('locale', () => {
    it('locale="fr-FR" formats input value using French locale for fallback', () => {
      // No explicit dateFormat — uses locale toLocaleDateString.
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 22)} onChange={() => {}} locale="fr-FR" label="X" />,
      );
      // fr-FR with 2-digit month, 2-digit day, numeric year → "22/04/2026"
      const v = getInput(container).value;
      expect(v).toMatch(/22/);
      expect(v).toMatch(/04/);
      expect(v).toMatch(/2026/);
    });

    it('day-cell aria-label uses requested locale', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 15)} onChange={() => {}} locale="fr-FR" label="X" />,
      );
      openPicker(getInput(container));
      // In French, April is "avril"
      const buttons = document.body.querySelectorAll('[aria-label*="avril"]');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('minDate disables earlier days (button has disabled attr)', () => {
      const { container } = wrap(
        <TkxDatePicker
          value={new Date(2026, 4, 15)}
          onChange={() => {}}
          minDate={new Date(2026, 4, 10)}
          label="X"
        />,
      );
      openPicker(getInput(container));
      const earlyDay = queryDayByLabel(2026, 4, 5);
      expect(earlyDay).not.toBeNull();
      expect(earlyDay!.hasAttribute('disabled')).toBe(true);
      // After minDate threshold, day should be enabled
      const okDay = queryDayByLabel(2026, 4, 15);
      expect(okDay!.hasAttribute('disabled')).toBe(false);
    });

    it('maxDate disables later days', () => {
      const { container } = wrap(
        <TkxDatePicker
          value={new Date(2026, 4, 15)}
          onChange={() => {}}
          maxDate={new Date(2026, 4, 20)}
          label="X"
        />,
      );
      openPicker(getInput(container));
      const lateDay = queryDayByLabel(2026, 4, 25);
      expect(lateDay).not.toBeNull();
      expect(lateDay!.hasAttribute('disabled')).toBe(true);
    });

    it('disabledDates array marks specific days as disabled', () => {
      const { container } = wrap(
        <TkxDatePicker
          value={new Date(2026, 4, 15)}
          onChange={() => {}}
          disabledDates={[new Date(2026, 4, 17)]}
          label="X"
        />,
      );
      openPicker(getInput(container));
      const blockedDay = queryDayByLabel(2026, 4, 17);
      expect(blockedDay!.hasAttribute('disabled')).toBe(true);
    });

    it('disabledDates function (Sundays) disables matching days', () => {
      // In May 2026, find a Sunday and verify it's disabled.
      const { container } = wrap(
        <TkxDatePicker
          value={new Date(2026, 4, 15)}
          onChange={() => {}}
          disabledDates={(d) => d.getDay() === 0}
          label="X"
        />,
      );
      openPicker(getInput(container));
      // Find any day cell whose date object's getDay === 0 in the rendered month.
      const buttons = Array.from(document.body.querySelectorAll('button[aria-label]')) as HTMLButtonElement[];
      const sundays = buttons.filter((b) => /Sunday/.test(b.getAttribute('aria-label') || ''));
      expect(sundays.length).toBeGreaterThan(0);
      sundays.forEach((b) => expect(b.hasAttribute('disabled')).toBe(true));
    });

    it('clicking a disabled day does NOT fire onChange', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker
          value={new Date(2026, 4, 15)}
          onChange={onChange}
          disabledDates={[new Date(2026, 4, 17)]}
          label="X"
        />,
      );
      openPicker(getInput(container));
      const blocked = queryDayByLabel(2026, 4, 17)!;
      fireEvent.click(blocked);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('Today button in footer selects today\'s date', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={null} onChange={onChange} label="X" />,
      );
      openPicker(getInput(container));
      // Find the Today footer button (the only one with text 'Today' at root of dialog footer).
      const todayBtns = within(getDialog()!).getAllByText('Today');
      // There may also be a "Today" preset, but presets only render in range mode.
      fireEvent.click(todayBtns[0]);
      expect(onChange).toHaveBeenCalled();
      const arg = onChange.mock.calls[0][0] as Date;
      const realToday = new Date();
      expect(arg.getFullYear()).toBe(realToday.getFullYear());
      expect(arg.getMonth()).toBe(realToday.getMonth());
      expect(arg.getDate()).toBe(realToday.getDate());
    });

    it('clear button on single mode resets value', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 15)} onChange={onChange} label="X" />,
      );
      const clear = container.querySelector('button[aria-label="Clear selection"]') as HTMLButtonElement;
      expect(clear).not.toBeNull();
      fireEvent.click(clear);
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('numberOfMonths=2 renders dual calendar (two month headers)', () => {
      const { container } = wrap(
        <TkxDatePicker
          value={new Date(2026, 3, 15)}
          onChange={() => {}}
          numberOfMonths={2}
          label="X"
        />,
      );
      openPicker(getInput(container));
      const dlg = getDialog()!;
      // April (button) + May (span) should both appear.
      expect(within(dlg).getByText('April')).toBeInTheDocument();
      // The second month label is rendered as a span: "May 2026"
      expect(within(dlg).getByText(/May 2026/)).toBeInTheDocument();
    });

    it('aria-expanded reflects open state on the input', () => {
      const { container } = wrap(<TkxDatePicker label="X" />);
      const input = getInput(container);
      expect(input.getAttribute('aria-expanded')).toBe('false');
      openPicker(input);
      expect(input.getAttribute('aria-expanded')).toBe('true');
    });
  });

  // ── Preserved tests from original suite ─────────────────────────────────
  describe('preserved coverage', () => {
    it('opens calendar on click (legacy smoke)', () => {
      const { container } = wrap(<TkxDatePicker label="X" />);
      openPicker(getInput(container));
      expect(document.body.textContent?.length).toBeGreaterThan(0);
    });

    it('controlled value renders formatted date (legacy)', () => {
      const d = new Date(2026, 3, 22);
      const { container } = wrap(
        <TkxDatePicker value={d} onChange={() => {}} label="X" />,
      );
      expect(getInput(container).value).toMatch(/2026|22|Apr|04/);
    });

    it('range mode accepts rangeValue (legacy)', () => {
      const start = new Date(2026, 3, 10);
      const end = new Date(2026, 3, 20);
      const { container } = wrap(
        <TkxDatePicker mode="range" rangeValue={[start, end]} onRangeChange={() => {}} label="X" />,
      );
      expect(getInput(container).value).toMatch(/2026/);
    });

    it('multiple mode accepts multiValue (legacy)', () => {
      const dates = [new Date(2026, 3, 10), new Date(2026, 3, 15)];
      const { container } = wrap(
        <TkxDatePicker mode="multiple" multiValue={dates} onMultiChange={() => {}} label="X" />,
      );
      expect(container.querySelector('input')).toBeTruthy();
    });
  });

  // ── Defensive prop coercion / SSR safety ──────────────────────────────────
  // Regression tests for an SSR crash where the docs-site demo passed a
  // [Date | null, Date | null] tuple into `value` (which expects Date | null,
  // not an array). The component silently treated the array as a Date and
  // crashed on `.getFullYear()`. After the fix, non-Date `value` is coerced
  // to null and the calendar opens cleanly on today's month.
  describe('defensive prop coercion (SSR safety)', () => {
    it('renders cleanly when `value` is an array (consumer misuse — should not crash)', () => {
      const tuple = [new Date(2026, 3, 10), new Date(2026, 3, 20)] as unknown as Date | null;
      const { container } = wrap(
        <TkxDatePicker label="X" value={tuple} onChange={() => {}} />,
      );
      expect(container.querySelector('input')).toBeTruthy();
    });

    it('renders cleanly when `value` is an Invalid Date', () => {
      const { container } = wrap(
        <TkxDatePicker label="X" value={new Date('not-a-date')} onChange={() => {}} />,
      );
      expect(container.querySelector('input')).toBeTruthy();
      // Coerced to null, so input is empty rather than "Invalid Date".
      expect(getInput(container).value).toBe('');
    });

    it('renders cleanly when `rangeValue[0]` is a string (consumer misuse)', () => {
      const range = ['2026-04-10', null] as unknown as [Date | null, Date | null];
      const { container } = wrap(
        <TkxDatePicker mode="range" label="X" rangeValue={range} onRangeChange={() => {}} />,
      );
      expect(container.querySelector('input')).toBeTruthy();
    });

    it('renders cleanly when `multiValue` contains non-Date entries', () => {
      const mixed = [
        new Date(2026, 3, 10),
        'oops' as unknown as Date,
        null as unknown as Date,
        new Date(2026, 3, 15),
      ];
      const { container } = wrap(
        <TkxDatePicker mode="multiple" label="X" multiValue={mixed} onMultiChange={() => {}} />,
      );
      expect(container.querySelector('input')).toBeTruthy();
    });

    it('SSR shape: renderToString does not throw for the docs-site demo misuse', async () => {
      const { renderToString } = await import('react-dom/server');
      const tuple = [null, null] as unknown as Date | null;
      // This is exactly the shape DatePickerDemo was sending before the fix.
      expect(() =>
        renderToString(
          <ThemeProvider>
            <TkxDatePicker mode="range" label="X" value={tuple} onChange={() => {}} />
          </ThemeProvider>,
        ),
      ).not.toThrow();
    });
  });

  // ── Localized calendar labels ─────────────────────────────────────────────
  // Expected strings are computed with Intl in the test itself (not hardcoded)
  // so the assertions hold regardless of the ICU data the environment ships.
  describe('localized calendar labels', () => {
    it('locale="hi" renders the month header from Intl, not English', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 15)} onChange={() => {}} locale="hi" label="X" />,
      );
      openPicker(getInput(container));
      const dlg = getDialog()!;
      const expectedMonth = new Intl.DateTimeFormat('hi', { month: 'long' }).format(
        new Date(2026, 3, 1),
      );
      expect(within(dlg).getByText(expectedMonth)).toBeInTheDocument();
      // Credibility check: the header must actually be localized.
      expect(within(dlg).queryByText('April')).toBeNull();
    });

    it('locale="hi" renders weekday header labels from Intl (Sun..Sat)', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 15)} onChange={() => {}} locale="hi" label="X" />,
      );
      openPicker(getInput(container));
      const dlg = getDialog()!;
      const fmt = new Intl.DateTimeFormat('hi', { weekday: 'short' });
      // 2023-01-01 is a Sunday → Sun..Sat labels.
      const expectedLabels = Array.from({ length: 7 }, (_, i) =>
        fmt.format(new Date(2023, 0, 1 + i)),
      );
      for (const wd of expectedLabels) {
        expect(within(dlg).getAllByText(wd).length).toBeGreaterThan(0);
      }
    });

    it('default locale still renders English month names (backwards compat)', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 3, 15)} onChange={() => {}} label="X" />,
      );
      openPicker(getInput(container));
      expect(within(getDialog()!).getByText('April')).toBeInTheDocument();
    });
  });

  // ── weekStartsOn ──────────────────────────────────────────────────────────
  describe('weekStartsOn', () => {
    // Uncontrolled pickers open on "today" — pin the clock to May 2026 like
    // the sibling range/multi suites so the rendered month is deterministic.
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 4, 1));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    function getWeekdayHeaderCells(dlg: HTMLElement): HTMLElement[] {
      const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
      const labels = Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
      return (Array.from(dlg.querySelectorAll('div')) as HTMLElement[]).filter(
        (el) => el.children.length === 0 && labels.includes(el.textContent ?? ''),
      );
    }

    it('default (weekStartsOn=0): first weekday column is Sunday', () => {
      const { container } = wrap(<TkxDatePicker label="X" />);
      openPicker(getInput(container));
      const cells = getWeekdayHeaderCells(getDialog()!);
      expect(cells.length).toBe(7);
      const sunday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(
        new Date(2023, 0, 1),
      );
      expect(cells[0].textContent).toBe(sunday);
    });

    it('weekStartsOn={1}: first weekday column is Monday', () => {
      const { container } = wrap(<TkxDatePicker weekStartsOn={1} label="X" />);
      openPicker(getInput(container));
      const cells = getWeekdayHeaderCells(getDialog()!);
      expect(cells.length).toBe(7);
      const monday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(
        new Date(2023, 0, 2),
      );
      expect(cells[0].textContent).toBe(monday);
    });

    it('weekStartsOn={1}: dates land in the correct columns (May 1, 2026 is a Friday → column 4)', () => {
      const { container } = wrap(<TkxDatePicker weekStartsOn={1} label="X" />);
      openPicker(getInput(container));
      const may1 = getDayByLabel(2026, 4, 1);
      const grid = may1.parentElement as HTMLElement;
      const idx = Array.from(grid.children).indexOf(may1);
      // Monday-first week: Mon=0 … Fri=4.
      expect(idx % 7).toBe(4);
      // The grid should start with the previous month's Monday, Apr 27 2026.
      const firstCell = grid.children[0] as HTMLElement;
      expect(firstCell).toBe(queryDayByLabel(2026, 3, 27));
    });

    it('weekStartsOn={0} (default): May 1, 2026 (Friday) lands in column 5', () => {
      const { container } = wrap(<TkxDatePicker label="X" />);
      openPicker(getInput(container));
      const may1 = getDayByLabel(2026, 4, 1);
      const grid = may1.parentElement as HTMLElement;
      const idx = Array.from(grid.children).indexOf(may1);
      expect(idx % 7).toBe(5);
    });

    it('keyboard navigation still works with weekStartsOn={1}', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker weekStartsOn={1} value={new Date(2026, 4, 15)} onChange={onChange} label="X" />,
      );
      openPicker(getInput(container));
      const dlg = getDialog()!;
      getDayByLabel(2026, 4, 15).focus();
      fireEvent.keyDown(dlg, { key: 'ArrowDown' });
      fireEvent.keyDown(dlg, { key: 'Enter' });
      const arg = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Date;
      expect(arg.getDate()).toBe(22);
    });
  });

  // ── name prop (plain HTML form submission) ────────────────────────────────
  describe('name prop / hidden form input', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 4, 1));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('renders a hidden input that updates after selecting a date (single mode)', () => {
      const { container } = wrap(<TkxDatePicker name="dob" label="X" />);
      const hidden = container.querySelector('input[type="hidden"][name="dob"]') as HTMLInputElement;
      expect(hidden).not.toBeNull();
      expect(hidden.value).toBe('');
      // The visible text input is still the first input in the field.
      expect(getInput(container).type).toBe('text');
      openPicker(getInput(container));
      fireEvent.click(getDayByLabel(2026, 4, 15));
      expect(hidden.value).toBe('2026-05-15');
    });

    it('range mode posts "start/end" ISO joined with a slash', () => {
      const { container } = wrap(
        <TkxDatePicker
          mode="range"
          name="stay"
          rangeValue={[new Date(2026, 4, 5), new Date(2026, 4, 20)]}
          onRangeChange={() => {}}
          label="X"
        />,
      );
      const hidden = container.querySelector('input[type="hidden"][name="stay"]') as HTMLInputElement;
      expect(hidden.value).toBe('2026-05-05/2026-05-20');
    });

    it('no hidden input is rendered without a name prop', () => {
      const { container } = wrap(<TkxDatePicker label="X" />);
      expect(container.querySelector('input[type="hidden"]')).toBeNull();
    });
  });

  // ── Ref forwarding ────────────────────────────────────────────────────────
  describe('ref forwarding', () => {
    it('forwards ref to the visible text input element', () => {
      const ref = createRef<HTMLInputElement>();
      const { container } = wrap(<TkxDatePicker ref={ref} label="X" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current!.type).toBe('text');
      expect(ref.current).toBe(getInput(container));
    });

    it('displayName is preserved', () => {
      expect((TkxDatePicker as { displayName?: string }).displayName).toBe('TkxDatePicker');
    });
  });

  // ── A11y: combobox → dialog wiring (audit MEDIUM #14) ────────────────────
  describe('a11y: aria-controls / dialog wiring', () => {
    it('input has no aria-controls while closed', () => {
      const { container } = wrap(<TkxDatePicker label="X" />);
      expect(getInput(container).getAttribute('aria-controls')).toBeNull();
    });

    it('open input aria-controls points at the dialog id', () => {
      const { container } = wrap(<TkxDatePicker label="X" />);
      const input = getInput(container);
      openPicker(input);
      const dlg = getDialog()!;
      expect(dlg.id).toBeTruthy();
      expect(input.getAttribute('aria-controls')).toBe(dlg.id);
    });

    it('dialog has role="dialog" and an accessible name (label used when present)', () => {
      const { container } = wrap(<TkxDatePicker label="Birthday" />);
      openPicker(getInput(container));
      const dlg = getDialog()!;
      expect(dlg.getAttribute('role')).toBe('dialog');
      expect(dlg.getAttribute('aria-label')).toBe('Birthday');
    });

    it('dialog falls back to "Date picker" accessible name without a label', () => {
      const { container } = wrap(<TkxDatePicker />);
      openPicker(getInput(container));
      expect(getDialog()!.getAttribute('aria-label')).toBe('Date picker');
    });
  });

  // ── A11y: calendar keyboard operability (audit MEDIUM #15) ───────────────
  describe('a11y: calendar grid keyboard operability', () => {
    function openViaToggle(container: HTMLElement) {
      const toggle = container.querySelector('button[aria-label="Open calendar"]') as HTMLButtonElement;
      fireEvent.click(toggle);
    }

    it('exactly one day cell is in the Tab order (roving tabindex)', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={() => {}} label="X" />,
      );
      openPicker(getInput(container));
      const tabbable = document.body.querySelectorAll('[data-tkx-day][tabindex="0"]');
      expect(tabbable.length).toBe(1);
      expect(getDayByLabel(2026, 4, 15).tabIndex).toBe(0);
      expect(getDayByLabel(2026, 4, 16).tabIndex).toBe(-1);
    });

    it('dual-month view still exposes exactly one tabbable day cell', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={() => {}} numberOfMonths={2} label="X" />,
      );
      openPicker(getInput(container));
      const tabbable = document.body.querySelectorAll('[data-tkx-day][tabindex="0"]');
      expect(tabbable.length).toBe(1);
    });

    it('opening via the toggle button moves DOM focus into the grid (selected day)', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={() => {}} label="X" />,
      );
      openViaToggle(container);
      expect(document.activeElement).toBe(getDayByLabel(2026, 4, 15));
    });

    it('ArrowDown on the input moves focus into the grid when open', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={() => {}} label="X" />,
      );
      const input = getInput(container);
      openPicker(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(getDayByLabel(2026, 4, 15));
    });

    it('ArrowDown on the input opens the dialog and focuses the grid when closed', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={() => {}} label="X" />,
      );
      fireEvent.keyDown(getInput(container), { key: 'ArrowDown' });
      expect(getDialog()).not.toBeNull();
      expect(document.activeElement).toBe(getDayByLabel(2026, 4, 15));
    });

    it('Arrow keys move DOM focus between day cells (roving tabindex follows)', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={() => {}} label="X" />,
      );
      openViaToggle(container);
      const day15 = getDayByLabel(2026, 4, 15);
      fireEvent.keyDown(day15, { key: 'ArrowRight' });
      const day16 = getDayByLabel(2026, 4, 16);
      expect(document.activeElement).toBe(day16);
      expect(day16.tabIndex).toBe(0);
      expect(getDayByLabel(2026, 4, 15).tabIndex).toBe(-1);
      fireEvent.keyDown(day16, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(getDayByLabel(2026, 4, 23));
    });

    it('Arrow navigation across a month boundary moves the view and keeps DOM focus', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 31)} onChange={() => {}} label="X" />,
      );
      openViaToggle(container);
      fireEvent.keyDown(getDayByLabel(2026, 4, 31), { key: 'ArrowRight' });
      // View flips to June 2026 and focus lands on June 1.
      expect(within(getDialog()!).getByText('June')).toBeInTheDocument();
      expect(document.activeElement).toBe(getDayByLabel(2026, 5, 1));
    });

    it('Enter on the focused day cell selects it', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={onChange} label="X" />,
      );
      openViaToggle(container);
      fireEvent.keyDown(getDayByLabel(2026, 4, 15), { key: 'ArrowRight' });
      fireEvent.keyDown(getDayByLabel(2026, 4, 16), { key: 'Enter' });
      const arg = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Date;
      expect(arg.getDate()).toBe(16);
    });

    it('Space on the focused day cell selects it', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={onChange} label="X" />,
      );
      openViaToggle(container);
      fireEvent.keyDown(getDayByLabel(2026, 4, 15), { key: 'ArrowRight' });
      fireEvent.keyDown(getDayByLabel(2026, 4, 16), { key: ' ' });
      const arg = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Date;
      expect(arg.getDate()).toBe(16);
    });

    it('Escape while focus is inside the grid closes and returns focus to the input', () => {
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={() => {}} label="X" />,
      );
      openViaToggle(container);
      expect(document.activeElement).toBe(getDayByLabel(2026, 4, 15));
      act(() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
        );
      });
      expect(getDialog()).toBeNull();
      expect(document.activeElement).toBe(getInput(container));
    });

    it('keys on footer buttons are not hijacked by the grid handler', () => {
      const onChange = vi.fn();
      const { container } = wrap(
        <TkxDatePicker value={new Date(2026, 4, 15)} onChange={onChange} label="X" />,
      );
      openViaToggle(container);
      // Focus a day so focusedDate is set, then press Enter on the footer
      // "Today" button — the grid handler must NOT select the focused day.
      fireEvent.keyDown(getDayByLabel(2026, 4, 15), { key: 'ArrowRight' });
      const todayBtn = within(getDialog()!).getAllByText('Today')[0];
      fireEvent.keyDown(todayBtn, { key: 'Enter' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
