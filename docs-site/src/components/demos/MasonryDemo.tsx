import { TkxMasonry } from 'tekivex-ui';
import { Preview } from '../Preview';

const CARDS = [
  { h: 80,  c: '#fef3c7', title: 'Quick win' },
  { h: 140, c: '#dbeafe', title: 'Long task' },
  { h: 100, c: '#dcfce7', title: 'Medium' },
  { h: 60,  c: '#fce7f3', title: 'Tiny' },
  { h: 160, c: '#e0e7ff', title: 'Big block' },
  { h: 90,  c: '#fef3c7', title: 'Short' },
  { h: 120, c: '#dcfce7', title: 'Mid' },
  { h: 80,  c: '#dbeafe', title: 'Compact' },
];

export function MasonryBasic() {
  return (
    <Preview label="3-column masonry with mixed heights">
      <div style={{ width: '100%', maxWidth: 560 }}>
        <TkxMasonry columns={3} gap={12}>
          {CARDS.map((c, i) => (
            <div
              key={i}
              style={{
                height: c.h,
                background: c.c,
                borderRadius: 8,
                padding: 12,
                fontSize: 12,
                fontWeight: 600,
                color: '#1f2937',
              }}
            >
              {c.title} — {c.h}px
            </div>
          ))}
        </TkxMasonry>
      </div>
    </Preview>
  );
}
