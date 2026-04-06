import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxDatePicker,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const DATE_PICKER_PROPS = [
  { name: 'label', type: 'string', required: true, description: 'Visible label for the date input, associated via htmlFor/id.' },
  { name: 'value', type: 'Date | null', default: 'null', description: 'Controlled selected date. Use null for an empty state.' },
  { name: 'onChange', type: '(date: Date | null) => void', default: 'undefined', description: 'Callback fired when a date is selected or cleared.' },
  { name: 'mode', type: "'single' | 'range'", default: "'single'", description: "Single date selection or a date range (returns { from: Date; to: Date | null })." },
  { name: 'rangeValue', type: '[Date | null, Date | null]', default: 'undefined', description: 'Controlled range value tuple [from, to] when mode="range".' },
  { name: 'onRangeChange', type: '(range: [Date | null, Date | null]) => void', default: 'undefined', description: 'Callback for range changes when mode="range".' },
  { name: 'minDate', type: 'Date', default: 'undefined', description: 'Minimum selectable date. Dates before this are disabled in the calendar.' },
  { name: 'maxDate', type: 'Date', default: 'undefined', description: 'Maximum selectable date. Dates after this are disabled in the calendar.' },
  { name: 'disabledDates', type: 'Date[] | ((date: Date) => boolean)', default: 'undefined', description: 'Specific dates or a predicate function marking dates as unselectable.' },
  { name: 'placeholder', type: 'string', default: "'Select a date'", description: 'Placeholder shown in the input trigger when no date is selected.' },
  { name: 'format', type: 'string', default: "'MMM D, YYYY'", description: 'Display format string for the selected date.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents interaction with the date picker.' },
  { name: 'error', type: 'string', default: 'undefined', description: 'Validation error message linked via aria-describedby.' },
  { name: 'isRequired', type: 'boolean', default: 'false', description: 'Shows required asterisk and sets aria-required.' },
  { name: 'closeOnSelect', type: 'boolean', default: 'true', description: 'Automatically close the calendar popover on selection (single mode only).' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function DatePickerPage({ theme }: { theme: ThemeTokens }) {
  const [basicDate, setBasicDate] = useState<Date | null>(null);
  const [rangeDate, setRangeDate] = useState<[Date | null, Date | null]>([null, null]);
  const [minMaxDate, setMinMaxDate] = useState<Date | null>(null);
  const [disabledDate, setDisabledDate] = useState<Date | null>(null);

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

  // Disable all weekends
  function isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  function formatDate(date: Date | null): string {
    if (!date) return 'none';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const noteBoxStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    padding: '20px 24px',
    marginBottom: '24px',
  };

  const noteHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 12px',
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
            { criterion: '1.4.3 Contrast', level: 'AAA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '3.3.4 Error Prevention', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxDatePicker
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A fully accessible date picker with calendar popover, supporting single date and range selection, min/max
        constraints, and custom disabled dates. The calendar grid is fully keyboard navigable with arrow keys and
        screen reader announcements at every navigation step.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> The calendar uses{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="grid"</code>{' '}
        with each day cell as{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="gridcell"</code>.
        Selected dates carry{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-selected="true"</code>.
        Disabled dates have{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-disabled="true"</code>.
      </p>

      {/* ── 1. Basic ── */}
      <DemoSection
        title="Basic Date Picker"
        description="Single date selection. The trigger input shows the formatted date when selected. Click the input or press Enter/Space to open the calendar popover."
        theme={theme}
        code={`const [date, setDate] = useState<Date | null>(null);

<TkxDatePicker
  label="Date of Birth"
  value={date}
  onChange={setDate}
  placeholder="Select a date…"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <TkxDatePicker
            label="Date of Birth"
            value={basicDate}
            onChange={setBasicDate}
            placeholder="Select a date…"
          />
          {basicDate && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
              Selected: <strong style={{ color: theme.text }}>{formatDate(basicDate)}</strong>
            </p>
          )}
        </div>
      </DemoSection>

      {/* ── 2. Range Mode ── */}
      <DemoSection
        title="Date Range Picker"
        description="Set mode='range' to allow selection of a start and end date. The first click sets 'from', the second sets 'to'. Dates between the range are highlighted."
        theme={theme}
        code={`const [range, setRange] = useState({ from: null, to: null });

<TkxDatePicker
  label="Trip Dates"
  mode="range"
  rangeValue={range}
  onRangeChange={setRange}
  placeholder="Select date range…"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <TkxDatePicker
            label="Trip Dates"
            mode="range"
            rangeValue={rangeDate}
            onRangeChange={setRangeDate}
            placeholder="Select date range…"
          />
          {(rangeDate[0] || rangeDate[1]) && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
              From: <strong style={{ color: theme.text }}>{formatDate(rangeDate[0])}</strong>
              {' '}— To: <strong style={{ color: theme.text }}>{formatDate(rangeDate[1])}</strong>
            </p>
          )}
        </div>
      </DemoSection>

      {/* ── 3. Min/Max Dates ── */}
      <DemoSection
        title="Min / Max Date Constraints"
        description="Set minDate and maxDate to restrict the selectable range. Dates outside the bounds are grayed out and cannot be clicked or keyboard-selected."
        theme={theme}
        code={`const today = new Date();
const threeMonthsLater = new Date(today.getFullYear(), today.getMonth() + 3, 0);

<TkxDatePicker
  label="Appointment Date"
  value={date}
  onChange={setDate}
  minDate={today}
  maxDate={threeMonthsLater}
  placeholder="Choose a future date…"
  hint="Available appointments: today to 3 months from now."
/>`}
      >
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <TkxDatePicker
            label="Appointment Date"
            value={minMaxDate}
            onChange={setMinMaxDate}
            minDate={minDate}
            maxDate={maxDate}
            placeholder="Choose a future date…"
            hint="Available appointments: today through the next 3 months."
          />
        </div>
      </DemoSection>

      {/* ── 4. Disabled Dates ── */}
      <DemoSection
        title="Disabled Dates (Weekends)"
        description="Pass a predicate function to disabledDates to programmatically disable dates. Here we disable all weekends. Disabled dates are announced to screen readers via aria-disabled."
        theme={theme}
        code={`function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

<TkxDatePicker
  label="Business Day"
  value={date}
  onChange={setDate}
  disabledDates={isWeekend}
  hint="Weekends are not available."
/>`}
      >
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <TkxDatePicker
            label="Business Day"
            value={disabledDate}
            onChange={setDisabledDate}
            disabledDates={isWeekend}
            minDate={minDate}
            hint="Weekends are not available for booking."
          />
        </div>
      </DemoSection>

      {/* ── 5. Disabled Input ── */}
      <DemoSection
        title="Disabled State"
        description="When disabled is true, the trigger input is non-interactive. The calendar cannot be opened. Useful for locked form fields where the date is set externally."
        theme={theme}
        code={`<TkxDatePicker
  label="Contract Start Date (locked)"
  value={new Date('2024-01-15')}
  onChange={() => {}}
  disabled
  hint="Set by your administrator. Contact support to change."
/>`}
      >
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <TkxDatePicker
            label="Contract Start Date (locked)"
            value={new Date('2024-01-15')}
            onChange={() => {}}
            disabled
            hint="Set by your administrator. Contact support to change."
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={DATE_PICKER_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="3.3.4 Error Prevention" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Calendar Grid Navigation</p>
        <p style={noteItemStyle}><strong>Arrow keys</strong> move between days. <strong>Page Up/Down</strong> navigate between months. <strong>Home/End</strong> jump to the first/last day of the week. <strong>Enter/Space</strong> select the focused date. <strong>Escape</strong> closes the popover.</p>
        <p style={noteItemStyle}>Each day cell is announced with its full date: "Wednesday, June 5, 2024" so screen reader users always know what they are about to select.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Localization</p>
        <p style={noteItemStyle}>The calendar uses the browser's <code>Intl.DateTimeFormat</code> API for day/month names. Pass a <code>locale</code> prop to override the browser locale. The <code>format</code> prop controls the display format in the trigger input.</p>
      </div>
    </div>
  );
}
