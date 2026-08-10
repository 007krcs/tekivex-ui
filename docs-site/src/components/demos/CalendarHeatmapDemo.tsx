import { TkxCalendarHeatmap } from 'tekivex-ui';
import { Preview } from '../Preview';

// Deterministic six-month activity sample. A fixed start/end range keeps the
// grid identical on every build (no dependence on "today"), and the values
// come from a simple fixed formula — no Math.random.
const START = '2026-01-01';
const END = '2026-06-30';

function buildActivity(): { date: string; value: number }[] {
  const out: { date: string; value: number }[] = [];
  const start = new Date(2026, 0, 1);
  const end = new Date(2026, 5, 30);
  let i = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1), i++) {
    // Deterministic pseudo-random-looking pattern: quieter weekends,
    // wave of intensity across the year.
    const day = d.getDay();
    const weekendDamp = day === 0 || day === 6 ? 0.25 : 1;
    const wave = Math.sin(i / 9) + Math.sin(i / 23);
    const raw = Math.max(0, Math.round((wave + 1.2) * 4 * weekendDamp) - 2);
    if (raw > 0) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      out.push({ date: `${y}-${m}-${dd}`, value: raw });
    }
  }
  return out;
}

const ACTIVITY = buildActivity();

export function CalendarHeatmapBasic() {
  return (
    <Preview style={{ overflowX: 'auto' }}>
      <TkxCalendarHeatmap
        data={ACTIVITY}
        startDate={START}
        endDate={END}
        ariaLabel="Deploy activity, January through June 2026"
      />
    </Preview>
  );
}

export function CalendarHeatmapCustom() {
  return (
    <Preview label="custom colors + larger cells" style={{ overflowX: 'auto' }}>
      <TkxCalendarHeatmap
        data={ACTIVITY.filter((p) => p.date >= '2026-04-01')}
        startDate="2026-04-01"
        endDate={END}
        cellSize={14}
        gap={4}
        colors={['#1b263b', '#245741', '#2e8b57', '#3fc380', '#7df9aa']}
        formatTooltip={(p) =>
          p.value > 0 ? `${p.value} deploys on ${p.date}` : `No deploys on ${p.date}`
        }
        ariaLabel="Deploy activity, April through June 2026, custom green scale"
      />
    </Preview>
  );
}
