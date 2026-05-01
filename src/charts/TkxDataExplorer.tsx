'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxDataExplorer — upload data, pick a chart, render it
//
// One component that ties the whole "I have a CSV, show me a chart" loop:
//
//   1. Drop a .csv or .json file on the upload zone (or paste raw text)
//   2. We parse it into a list of records and infer column types
//   3. A preview table shows the first N rows + detected types
//   4. The user picks a chart type (bar / line / area / pie / scatter)
//      and which columns map to X axis + Y series
//   5. We render the chosen tekivex-ui chart
//
// Files never leave the browser — parsing is in-memory, no upload.
// CSV parser is built-in (no Papa Parse dep). JSON expects either an
// array of records or { data: [...] }.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
} from 'react';
import { TkxBarChart } from './TkxBarChart';
import { TkxLineChart } from './TkxLineChart';
import { TkxAreaChart } from './TkxAreaChart';
import { TkxPieChart } from './TkxPieChart';
import { TkxScatterChart } from './TkxScatterChart';

// ── Public types ────────────────────────────────────────────────────────────

export type DataRecord = Record<string, string | number | null>;
export type ChartKind = 'bar' | 'line' | 'area' | 'pie' | 'scatter';
export type ColumnType = 'number' | 'string' | 'mixed';

export interface TkxDataExplorerProps {
  /** Optional initial dataset (skips the upload step). */
  initialData?: DataRecord[];
  /** Restrict the chart picker. */
  allowedCharts?: ChartKind[];
  /** Number of preview rows shown. Default 5. */
  previewRows?: number;
  /** Chart height in pixels. Default 320. */
  chartHeight?: number;
  /** Fired whenever a dataset is loaded (after parse). */
  onDataLoad?: (data: DataRecord[]) => void;
  style?: CSSProperties;
  className?: string;
}

// ── CSV parser ──────────────────────────────────────────────────────────────

/** Parse a CSV string into a list of rows. Handles quoted fields, doubled
 *  quote escapes ("" inside quoted strings), and CRLF / LF line endings.
 *  No external dep — small enough to bundle with the chart pack. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuote = false;
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (inQuote) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuote = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuote = true;
      i++;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      // skip; \n handler below commits the row
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }
  // Trailing field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Convert raw CSV rows into typed records. First row is treated as the
 *  header. Numeric-looking values are coerced to Number. */
export function csvToRecords(rows: string[][]): DataRecord[] {
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim() || '_');
  const out: DataRecord[] = [];
  for (let r = 1; r < rows.length; r++) {
    if (rows[r].length === 1 && rows[r][0] === '') continue; // skip blank lines
    const rec: DataRecord = {};
    for (let c = 0; c < header.length; c++) {
      const raw = rows[r][c] ?? '';
      const trimmed = raw.trim();
      if (trimmed === '') {
        rec[header[c]] = null;
      } else {
        const num = Number(trimmed);
        rec[header[c]] = Number.isFinite(num) && trimmed !== '' && /^-?\d/.test(trimmed) ? num : trimmed;
      }
    }
    out.push(rec);
  }
  return out;
}

/** Infer per-column types from a sample of records. */
export function inferColumnTypes(records: DataRecord[]): Record<string, ColumnType> {
  const types: Record<string, ColumnType> = {};
  if (records.length === 0) return types;
  const fields = Object.keys(records[0]);
  for (const f of fields) {
    let hasNum = false;
    let hasStr = false;
    for (const rec of records) {
      const v = rec[f];
      if (v === null || v === undefined) continue;
      if (typeof v === 'number') hasNum = true;
      else hasStr = true;
      if (hasNum && hasStr) break;
    }
    types[f] = hasNum && hasStr ? 'mixed' : hasNum ? 'number' : 'string';
  }
  return types;
}

// ── Component ───────────────────────────────────────────────────────────────

const ALL_CHARTS: ChartKind[] = ['bar', 'line', 'area', 'pie', 'scatter'];

const CHART_LABELS: Record<ChartKind, string> = {
  bar: '📊 Bar',
  line: '📈 Line',
  area: '⛰️ Area',
  pie: '🥧 Pie',
  scatter: '✨ Scatter',
};

export function TkxDataExplorer({
  initialData,
  allowedCharts = ALL_CHARTS,
  previewRows = 5,
  chartHeight = 320,
  onDataLoad,
  style,
  className,
}: TkxDataExplorerProps) {
  const [data, setData] = useState<DataRecord[]>(initialData ?? []);
  const [error, setError] = useState<string | null>(null);
  const [chartKind, setChartKind] = useState<ChartKind>(allowedCharts[0]);
  // Auto-pick X + Y from initialData so consumers don't have to.
  const initialXY = useMemo(() => {
    if (!initialData || initialData.length === 0) return { x: '', y: [] as string[] };
    const t = inferColumnTypes(initialData);
    const f = Object.keys(initialData[0]);
    const x = f.find((k) => t[k] === 'string' || t[k] === 'mixed') ?? f[0] ?? '';
    const yFirst = f.find((k) => t[k] === 'number');
    return { x, y: yFirst ? [yFirst] : [] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [xField, setXField] = useState<string>(initialXY.x);
  const [yFields, setYFields] = useState<string[]>(initialXY.y);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pasteText, setPasteText] = useState('');

  const types = useMemo(() => inferColumnTypes(data), [data]);
  const fields = useMemo(() => (data[0] ? Object.keys(data[0]) : []), [data]);
  const numericFields = useMemo(
    () => fields.filter((f) => types[f] === 'number'),
    [fields, types],
  );
  const stringFields = useMemo(
    () => fields.filter((f) => types[f] === 'string' || types[f] === 'mixed'),
    [fields, types],
  );

  // Reset axis selection when the dataset changes.
  const ingest = useCallback(
    (next: DataRecord[]) => {
      setData(next);
      const t = inferColumnTypes(next);
      const f = next[0] ? Object.keys(next[0]) : [];
      const firstString = f.find((x) => t[x] === 'string' || t[x] === 'mixed');
      const firstNumeric = f.find((x) => t[x] === 'number');
      setXField(firstString ?? f[0] ?? '');
      setYFields(firstNumeric ? [firstNumeric] : []);
      setError(null);
      onDataLoad?.(next);
    },
    [onDataLoad],
  );

  const ingestText = useCallback(
    (text: string, hint?: 'csv' | 'json') => {
      try {
        const trimmed = text.trim();
        if (!trimmed) {
          setError('Nothing to parse');
          return;
        }
        // JSON sniffing — file extension wins, then content
        const looksJson = hint === 'json' || trimmed[0] === '[' || trimmed[0] === '{';
        if (looksJson) {
          const parsed = JSON.parse(trimmed);
          const arr: DataRecord[] = Array.isArray(parsed)
            ? parsed
            : Array.isArray((parsed as { data?: unknown }).data)
              ? ((parsed as { data: DataRecord[] }).data)
              : null!;
          if (!arr) {
            setError('JSON must be an array of records or { data: [...] }');
            return;
          }
          if (arr.length === 0) {
            setError('No rows in JSON');
            return;
          }
          ingest(arr);
          return;
        }
        // CSV
        const rows = parseCSV(trimmed);
        const records = csvToRecords(rows);
        if (records.length === 0) {
          setError('No rows after the header');
          return;
        }
        ingest(records);
      } catch (e) {
        setError(`Parse failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
    [ingest],
  );

  const onFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? '');
        const hint: 'csv' | 'json' | undefined =
          file.name.toLowerCase().endsWith('.json') ? 'json' :
          file.name.toLowerCase().endsWith('.csv') ? 'csv' :
          undefined;
        ingestText(text, hint);
      };
      reader.onerror = () => setError('Could not read file');
      reader.readAsText(file);
    },
    [ingestText],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  const onChooseFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    // Reset so the same filename can be re-picked later
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Chart rendering ──
  const chartData = data;
  const ySeries = yFields.map((k) => ({ key: k, label: k }));

  let chart: React.ReactNode = null;
  if (data.length > 0 && xField && yFields.length > 0) {
    switch (chartKind) {
      case 'bar':
        chart = <TkxBarChart data={chartData} xKey={xField} series={ySeries} height={chartHeight} />;
        break;
      case 'line':
        chart = <TkxLineChart data={chartData} xKey={xField} series={ySeries} height={chartHeight} />;
        break;
      case 'area':
        chart = <TkxAreaChart data={chartData} xKey={xField} series={ySeries} height={chartHeight} />;
        break;
      case 'pie':
        chart = (
          <TkxPieChart
            data={chartData.map((row) => ({
              name: String(row[xField] ?? ''),
              value: Number(row[yFields[0]]) || 0,
            }))}
            height={chartHeight}
          />
        );
        break;
      case 'scatter':
        chart = (
          <TkxScatterChart
            series={[
              {
                name: yFields[0],
                data: chartData
                  .map((row) => ({
                    x: Number(row[xField]),
                    y: Number(row[yFields[0]]),
                  }))
                  .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
              },
            ]}
            height={chartHeight}
          />
        );
        break;
    }
  }

  // ── UI ──
  const sectionStyle: CSSProperties = {
    padding: 16,
    borderBottom: '1px solid var(--tkx-border, #2a2a3e)',
  };

  return (
    <div
      className={className}
      data-testid="tkx-data-explorer"
      style={{
        border: '1px solid var(--tkx-border, #2a2a3e)',
        borderRadius: 12,
        background: 'var(--tkx-bg, #0a0a0f)',
        color: 'var(--tkx-fg, #e8e8f4)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Upload zone */}
      <div style={sectionStyle}>
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop a CSV or JSON file"
          data-testid="upload-zone"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
          style={{
            border: `2px dashed ${dragOver ? 'var(--tkx-accent, #00f5d4)' : 'var(--tkx-border, #2a2a3e)'}`,
            borderRadius: 10,
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'rgba(0,245,212,0.04)' : 'var(--tkx-bg-subtle, #0d0d14)',
            transition: 'border-color 0.15s, background 0.15s',
            outline: 'none',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }} aria-hidden="true">📁</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Drop a CSV or JSON file here, or click to choose
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            Files are parsed in-browser — nothing is uploaded.
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.json,text/csv,application/json"
          onChange={onChooseFile}
          data-testid="file-input"
          style={{ display: 'none' }}
        />
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, color: '#aaa' }}>
            …or paste raw CSV / JSON
          </summary>
          <textarea
            data-testid="paste-area"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={'name,score\nAda,99\nGrace,95'}
            rows={6}
            style={{
              width: '100%',
              marginTop: 8,
              padding: 10,
              background: 'var(--tkx-bg-subtle, #0d0d14)',
              border: '1px solid var(--tkx-border, #2a2a3e)',
              borderRadius: 6,
              color: 'var(--tkx-fg, #e8e8f4)',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 12,
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="button"
            data-testid="parse-button"
            onClick={() => ingestText(pasteText)}
            style={{
              marginTop: 8,
              padding: '8px 14px',
              minHeight: 36,
              border: 'none',
              borderRadius: 6,
              background: 'var(--tkx-accent, #00f5d4)',
              color: '#0a0a0f',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Parse
          </button>
        </details>
        {error && (
          <div
            role="alert"
            data-testid="parse-error"
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 6,
              background: 'rgba(255,0,110,0.1)',
              border: '1px solid #ff006e',
              color: '#ff7eaf',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
      </div>

      {data.length > 0 && (
        <>
          {/* Chart picker */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
              <div>
                <label
                  htmlFor="tkx-de-chart"
                  style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}
                >
                  Chart
                </label>
                <div role="tablist" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {allowedCharts.map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="tab"
                      aria-selected={chartKind === k}
                      data-testid={`chart-${k}`}
                      onClick={() => setChartKind(k)}
                      style={{
                        padding: '8px 12px',
                        minHeight: 36,
                        borderRadius: 6,
                        border: `1px solid ${chartKind === k ? 'var(--tkx-accent, #00f5d4)' : 'var(--tkx-border, #2a2a3e)'}`,
                        background: chartKind === k ? 'rgba(0,245,212,0.12)' : 'transparent',
                        color: chartKind === k ? 'var(--tkx-accent, #00f5d4)' : 'var(--tkx-fg, #e8e8f4)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {CHART_LABELS[k]}
                    </button>
                  ))}
                </div>
              </div>

              <FieldSelect
                label={chartKind === 'pie' ? 'Category' : chartKind === 'scatter' ? 'X (numeric)' : 'X axis'}
                value={xField}
                onChange={setXField}
                options={chartKind === 'scatter' ? numericFields : fields}
                testId="x-field"
              />

              <div>
                <div
                  style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}
                >
                  {chartKind === 'pie' || chartKind === 'scatter' ? 'Value' : 'Y series'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {numericFields.map((f) => {
                    const on = yFields.includes(f);
                    const isSingle = chartKind === 'pie' || chartKind === 'scatter';
                    return (
                      <button
                        key={f}
                        type="button"
                        data-testid={`y-${f}`}
                        aria-pressed={on}
                        onClick={() => {
                          if (isSingle) setYFields([f]);
                          else setYFields(on ? yFields.filter((x) => x !== f) : [...yFields, f]);
                        }}
                        style={{
                          padding: '6px 10px',
                          minHeight: 32,
                          borderRadius: 6,
                          border: `1px solid ${on ? 'var(--tkx-accent, #00f5d4)' : 'var(--tkx-border, #2a2a3e)'}`,
                          background: on ? 'rgba(0,245,212,0.12)' : 'transparent',
                          color: on ? 'var(--tkx-accent, #00f5d4)' : '#aaa',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {f}
                      </button>
                    );
                  })}
                  {numericFields.length === 0 && (
                    <span style={{ fontSize: 12, color: '#888' }}>No numeric columns detected.</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                data-testid="clear-data"
                onClick={() => {
                  setData([]);
                  setError(null);
                  setXField('');
                  setYFields([]);
                }}
                style={{
                  marginLeft: 'auto',
                  padding: '8px 12px',
                  minHeight: 36,
                  borderRadius: 6,
                  border: '1px solid var(--tkx-border, #2a2a3e)',
                  background: 'transparent',
                  color: '#aaa',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Clear data
              </button>
            </div>
          </div>

          {/* Preview table — scrolls vertically when there are more rows than
              fit in the visible area. The `previewRows` prop now sizes the
              VISIBLE area (each row ~26px) rather than capping the row count;
              all rows are rendered into a sticky-header scrollable container
              so visitors can scroll through every row of the loaded data. */}
          <div style={sectionStyle}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#888',
                marginBottom: 8,
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <span>Data · {data.length} row{data.length === 1 ? '' : 's'}</span>
              {data.length > previewRows && (
                <span
                  style={{
                    fontSize: 10,
                    color: '#c4a8ff',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  scroll for more ↓
                </span>
              )}
            </div>
            <div
              data-testid="preview-table-scroll"
              style={{
                overflowX: 'auto',
                overflowY: 'auto',
                // ~26px per row + ~36px header
                maxHeight: previewRows * 26 + 36,
                border: '1px solid var(--tkx-border, #2a2a3e)',
                borderRadius: 6,
              }}
            >
              <table
                role="table"
                style={{
                  borderCollapse: 'collapse',
                  fontSize: 12,
                  fontFamily: 'ui-monospace, monospace',
                  width: '100%',
                }}
              >
                <thead>
                  <tr>
                    {fields.map((f) => (
                      <th
                        key={f}
                        scope="col"
                        style={{
                          padding: '6px 10px',
                          textAlign: 'left',
                          borderBottom: '1px solid var(--tkx-border, #2a2a3e)',
                          color: types[f] === 'number' ? 'var(--tkx-accent, #00f5d4)' : '#ccc',
                          fontWeight: 700,
                          position: 'sticky',
                          top: 0,
                          background: 'var(--tkx-bg-subtle, #0d0d14)',
                          zIndex: 1,
                        }}
                      >
                        <div>{f}</div>
                        <div style={{ fontSize: 10, fontWeight: 400, color: '#666', textTransform: 'uppercase' }}>
                          {types[f]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} data-testid={`preview-row-${i}`}>
                      {fields.map((f) => (
                        <td
                          key={f}
                          style={{
                            padding: '6px 10px',
                            borderBottom: '1px solid var(--tkx-border-soft, #1a1a25)',
                            color: row[f] === null ? '#555' : 'var(--tkx-fg, #e8e8f4)',
                          }}
                        >
                          {row[f] === null ? '—' : String(row[f])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div style={{ padding: 16 }} data-testid="chart-container">
            {chart || (
              <div
                style={{
                  padding: 32,
                  textAlign: 'center',
                  color: '#888',
                  fontSize: 13,
                  border: '1px dashed var(--tkx-border, #2a2a3e)',
                  borderRadius: 8,
                }}
              >
                Pick at least one numeric Y series above to render the chart.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  testId: string;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
        style={{
          padding: '8px 10px',
          minHeight: 36,
          borderRadius: 6,
          border: '1px solid var(--tkx-border, #2a2a3e)',
          background: 'var(--tkx-bg-subtle, #0d0d14)',
          color: 'var(--tkx-fg, #e8e8f4)',
          fontSize: 13,
          fontFamily: 'inherit',
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
