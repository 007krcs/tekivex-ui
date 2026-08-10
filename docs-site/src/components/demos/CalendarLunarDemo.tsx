import { useState } from 'react';
import { TkxCalendarLunar } from 'tekivex-ui';
import { Preview } from '../Preview';

// Fixed initial date keeps the demo deterministic; a fixed `locale` keeps
// the display string identical on server + client render.

export function CalendarLunarBasic() {
  const [date, setDate] = useState<Date | null>(() => new Date(2026, 0, 14));
  return (
    <Preview label="Default Gregorian display">
      <TkxCalendarLunar
        label="Pick a date"
        value={date}
        onChange={(v) => setDate(v.gregorian)}
        locale="en-US"
      />
    </Preview>
  );
}

export function CalendarLunarHindu() {
  const [date, setDate] = useState<Date | null>(() => new Date(2026, 0, 14));
  return (
    <Preview label='calendar="hindu" — Tithi + Nakshatra shown in the field'>
      <TkxCalendarLunar
        label="Hindu calendar"
        calendar="hindu"
        value={date}
        onChange={(v) => setDate(v.gregorian)}
        locale="en-US"
      />
    </Preview>
  );
}
