// ─────────────────────────────────────────────────────────────────────────────
// DataDemo — live "spreadsheet → chart" pipeline
//
// Two-pane demo:
//   - Left:  TkxSpreadsheet pre-filled with sample data
//   - Right: TkxDataExplorer showing the same rows, with a chart picker
//
// Edit any cell on the left → the right side re-renders with the new
// numbers. Drop a CSV onto the right side instead and the spreadsheet
// updates from that. It's the same data, two views.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import {
  TkxSpreadsheet,
  spreadsheetToRecords,
  type SpreadsheetData,
} from 'tekivex-ui';
import { TkxDataExplorer } from 'tekivex-ui/charts';

const COLS = 4;
const ROWS = 8;

// Sample dataset shipped with the demo so visitors see something useful
// immediately. Header in row 1, body rows 2-7, with a SUM formula in row 8
// to show formula evaluation flowing into the chart.
const SAMPLE: SpreadsheetData = {
  cells: {
    A1: 'month', B1: 'revenue', C1: 'cost', D1: 'profit',

    A2: 'Jan', B2: '120', C2: '80', D2: '=B2-C2',
    A3: 'Feb', B3: '135', C3: '85', D3: '=B3-C3',
    A4: 'Mar', B4: '160', C4: '90', D4: '=B4-C4',
    A5: 'Apr', B5: '180', C5: '95', D5: '=B5-C5',
    A6: 'May', B6: '210', C6: '110', D6: '=B6-C6',
    A7: 'Jun', B7: '245', C7: '120', D7: '=B7-C7',
  },
};

export function DataDemo() {
  const [sheet, setSheet] = useState<SpreadsheetData>(SAMPLE);

  const records = useMemo(
    () => spreadsheetToRecords(sheet, { cols: COLS, rows: ROWS }),
    [sheet],
  );

  return (
    <section
      id="data-demo"
      style={{
        position: 'relative',
        padding: 'clamp(48px, 8vw, 96px) 24px',
        maxWidth: 1280,
        margin: '0 auto',
        zIndex: 1,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(0,245,212,0.1)',
            border: '1px solid rgba(0,245,212,0.3)',
            borderRadius: 999,
            color: '#00f5d4',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          Live demo
        </div>
        <h2
          style={{
            margin: '0 0 12px',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #00f5d4, #3a86ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Spreadsheet → chart, live
        </h2>
        <p
          style={{
            margin: '0 auto',
            maxWidth: 640,
            color: '#aaa',
            fontSize: 'clamp(14px, 1.3vw, 17px)',
            lineHeight: 1.6,
          }}
        >
          Edit any cell on the left — the chart on the right updates instantly.
          Formulas evaluate before the data flows through, so <code style={code}>=B2-C2</code> in
          the <em>profit</em> column shows up as a real number on the chart.
          Drop a CSV onto the right pane to swap in your own data.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        }}
        className="tk-data-demo-grid"
      >
        {/* ── Left: the editable spreadsheet ── */}
        <Pane label="① Edit the data">
          <div style={{ overflowX: 'auto' }}>
            <TkxSpreadsheet
              cols={COLS}
              rows={ROWS}
              data={sheet}
              onChange={setSheet}
              colWidth={88}
              rowHeight={28}
            />
          </div>
        </Pane>

        {/* ── Right: data explorer wired to spreadsheet rows ── */}
        <Pane label="② Pick a chart">
          {/* key forces a remount when records identity changes so the
              auto-pick of X / Y fields runs again on first import. */}
          <TkxDataExplorer
            key={records.length === 0 ? 'empty' : 'loaded'}
            initialData={records}
            allowedCharts={['bar', 'line', 'area', 'pie']}
            chartHeight={280}
            previewRows={4}
          />
        </Pane>
      </div>

      <p
        style={{
          marginTop: 24,
          textAlign: 'center',
          color: '#666',
          fontSize: 12,
        }}
      >
        TkxSpreadsheet → spreadsheetToRecords() → TkxDataExplorer ·
        every package on npm, zero glue code
      </p>

      <style>{`
        @media (max-width: 900px) {
          .tk-data-demo-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function Pane({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        padding: 16,
        borderRadius: 14,
        background: 'rgba(13, 13, 20, 0.7)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        minWidth: 0, // critical so the inner table can shrink
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#00f5d4',
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

const code: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85em',
  padding: '1px 6px',
  borderRadius: 4,
  background: 'rgba(0,245,212,0.1)',
  color: '#00f5d4',
};
