// ─────────────────────────────────────────────────────────────────────────────
// DataDemo — bidirectional "spreadsheet ↔ chart" pipeline
//
// Two-pane demo:
//   - Left:  TkxSpreadsheet (editable, scrolls when rows exceed visible)
//   - Right: TkxDataExplorer (upload CSV/JSON, pick a chart)
//
// Flow is bidirectional:
//   1. Edit a cell on the left → records re-derive → chart re-renders.
//   2. Drop a CSV on the right → onDataLoad fires → recordsToSpreadsheet
//      regenerates the left sheet so both panes stay in sync.
//
// The spreadsheet sizes itself to fit (cols + rows grow with the data),
// so a 50-row CSV upload populates a 50-row spreadsheet, not just 8.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import {
  TkxSpreadsheet,
  spreadsheetToRecords,
  recordsToSpreadsheet,
  type SpreadsheetData,
} from 'tekivex-ui';
import { TkxDataExplorer, type DataRecord } from 'tekivex-ui/charts';

// Sample dataset shipped with the demo so visitors see something useful
// immediately. Header in row 1, body rows 2-7, with a SUM formula in row 8
// to show formula evaluation flowing into the chart.
const SAMPLE: SpreadsheetData = {
  cells: {
    A1: 'month', B1: 'revenue', C1: 'cost', D1: 'profit',

    A2: 'Jan', B2: '120', C2: '80',  D2: '=B2-C2',
    A3: 'Feb', B3: '135', C3: '85',  D3: '=B3-C3',
    A4: 'Mar', B4: '160', C4: '90',  D4: '=B4-C4',
    A5: 'Apr', B5: '180', C5: '95',  D5: '=B5-C5',
    A6: 'May', B6: '210', C6: '110', D6: '=B6-C6',
    A7: 'Jun', B7: '245', C7: '120', D7: '=B7-C7',
  },
};

const MIN_COLS = 4;
const MIN_ROWS = 8;

export function DataDemo() {
  const [sheet, setSheet] = useState<SpreadsheetData>(SAMPLE);
  // version bumps whenever an external upload replaces the sheet, so the
  // DataExplorer remounts with fresh initialData. Cell edits don't bump
  // (they'd reset chart-picker UI state).
  const [explorerKey, setExplorerKey] = useState(0);

  // ── Compute dynamic sheet bounds based on the data ──
  const { cols, rows } = useMemo(() => {
    let maxCol = 0;
    let maxRow = 0;
    for (const a of Object.keys(sheet.cells)) {
      const m = /^([A-Z]+)([0-9]+)$/.exec(a);
      if (!m) continue;
      const col =
        m[1].length === 1
          ? m[1].charCodeAt(0) - 65
          : (m[1].charCodeAt(0) - 64) * 26 + (m[1].charCodeAt(1) - 65);
      const row = +m[2] - 1;
      if (col > maxCol) maxCol = col;
      if (row > maxRow) maxRow = row;
    }
    return {
      cols: Math.max(MIN_COLS, maxCol + 1),
      rows: Math.max(MIN_ROWS, maxRow + 2), // +1 for last row + 1 trailing blank
    };
  }, [sheet]);

  const records = useMemo(
    () => spreadsheetToRecords(sheet, { cols, rows }),
    [sheet, cols, rows],
  );

  const handleExplorerLoad = (parsed: DataRecord[]) => {
    // Mirror the uploaded data into the left spreadsheet
    setSheet(recordsToSpreadsheet(parsed));
    // Bump the key only when a true external upload happens (records identity
    // changes via parse, not via cell edit)
    setExplorerKey((k) => k + 1);
  };

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
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: 999,
            color: '#0f766e',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          Live demo · bidirectional
        </div>
        <h2
          style={{
            margin: '0 0 12px',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            letterSpacing: '-0.03em',
            color: '#0a0a0f',
            fontWeight: 800,
          }}
        >
          Spreadsheet ↔ chart, <span className="tk-gradient-text">two-way</span>
        </h2>
        <p
          style={{
            margin: '0 auto',
            maxWidth: 660,
            color: '#1f2937',
            fontSize: 'clamp(14px, 1.3vw, 17px)',
            lineHeight: 1.65,
          }}
        >
          Edit any cell on the left — the chart on the right updates instantly.
          Drop a CSV/JSON on the right — the left spreadsheet repopulates with
          the parsed rows. Formulas evaluate before flowing into the chart, so{' '}
          <code style={code}>=B2-C2</code> in the <em>profit</em> column shows
          up as a real number.
        </p>
        <p style={{ margin: '12px auto 0', color: '#6b7280', fontSize: 12 }}>
          Currently rendering <strong style={{ color: '#0f766e' }}>{records.length}</strong> row
          {records.length === 1 ? '' : 's'} across <strong style={{ color: '#0f766e' }}>{cols}</strong> column{cols === 1 ? '' : 's'}.
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
          <div
            style={{
              maxHeight: 480,
              overflow: 'auto',
              borderRadius: 8,
              background: '#fafbfc',
              border: '1px solid #e5e7eb',
            }}
          >
            <TkxSpreadsheet
              cols={cols}
              rows={rows}
              data={sheet}
              onChange={setSheet}
              colWidth={88}
              rowHeight={28}
            />
          </div>
        </Pane>

        {/* ── Right: data explorer wired to spreadsheet rows ── */}
        <Pane label="② Pick a chart">
          {/* key remounts ONLY on external uploads, so manual cell edits
              don't reset the chart-picker UI. records prop still flows
              through on every render so the chart stays current. */}
          <TkxDataExplorer
            key={explorerKey}
            initialData={records}
            allowedCharts={['bar', 'line', 'area', 'pie']}
            chartHeight={280}
            previewRows={6}
            onDataLoad={handleExplorerLoad}
          />
        </Pane>
      </div>

      <p
        style={{
          marginTop: 24,
          textAlign: 'center',
          color: '#6b7280',
          fontSize: 12,
          fontStyle: 'italic',
        }}
      >
        spreadsheetToRecords() ↔ recordsToSpreadsheet() · zero glue code
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
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
        minWidth: 0, // critical so the inner table can shrink
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#0f766e',
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
  background: '#f0fdfa',
  color: '#0f766e',
};
