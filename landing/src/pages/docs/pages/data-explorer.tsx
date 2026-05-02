export function DataExplorerDoc() {
  return (
    <>
      <p>
        <code>TkxDataExplorer</code> ships at <code>tekivex-ui/charts</code>. One component
        that ties the whole "I have a CSV, show me a chart" loop: drop a file or paste raw
        text, parse it, preview, pick a chart type, render. Built-in CSV parser, no Papa
        Parse dep.
      </p>

      <h2>The flow</h2>
      <ol>
        <li>User drops a <code>.csv</code> or <code>.json</code> file (or pastes raw text)</li>
        <li>The component parses into <code>Record&lt;string, number | string | null&gt;[]</code></li>
        <li>A preview table shows every row with detected column types</li>
        <li>The user picks a chart type (bar / line / area / pie / scatter)</li>
        <li>The user maps columns to X axis + Y series</li>
        <li>The chosen TkxChart renders</li>
      </ol>

      <h2>Quick start</h2>
      <pre><code>{`import { TkxDataExplorer } from 'tekivex-ui/charts';

<TkxDataExplorer
  initialData={[
    { month: 'Jan', revenue: 120, cost: 80 },
    { month: 'Feb', revenue: 135, cost: 85 },
    { month: 'Mar', revenue: 160, cost: 90 },
  ]}
/>`}</code></pre>

      <h2>Parsing CSV inline</h2>
      <p>
        The bundled <code>parseCSV</code> handles quoted fields, doubled-quote escapes
        (<code>""</code> inside a quoted string), and CRLF line endings. <code>csvToRecords</code>{' '}
        coerces numeric-looking values to numbers and treats blank cells as <code>null</code>.
      </p>
      <pre><code>{`import { parseCSV, csvToRecords } from 'tekivex-ui/charts';

const rows = parseCSV(csvText);
const records = csvToRecords(rows);`}</code></pre>

      <h2>Column type inference</h2>
      <p>
        <code>inferColumnTypes()</code> classifies each column as{' '}
        <code>'number' | 'string' | 'mixed'</code>, skipping <code>null</code> values. The
        chart picker uses the inferred types to suggest sensible defaults: the first string
        column becomes the X axis, the first numeric column becomes the Y series.
      </p>

      <h2>Bridging from a spreadsheet</h2>
      <p>
        <code>spreadsheetToRecords()</code> from the main <code>tekivex-ui</code> entry
        converts a <code>SpreadsheetData</code> directly into the records shape this
        component takes. Feed the result through <code>initialData</code> and you have a
        live chart bound to a live spreadsheet:
      </p>
      <pre><code>{`import { TkxSpreadsheet, spreadsheetToRecords } from 'tekivex-ui';
import { TkxDataExplorer } from 'tekivex-ui/charts';

const records = useMemo(
  () => spreadsheetToRecords(sheet, { cols, rows }),
  [sheet, cols, rows],
);

<TkxSpreadsheet data={sheet} onChange={setSheet} ... />
<TkxDataExplorer initialData={records} />`}</code></pre>

      <h2>Chart types</h2>
      <ul>
        <li><strong>bar</strong> — categorical X axis, multiple stacked Y series</li>
        <li><strong>line</strong> — temporal / ordinal X axis, multiple Y series</li>
        <li><strong>area</strong> — same as line with filled regions</li>
        <li><strong>pie</strong> — single Y series, X column becomes labels</li>
        <li><strong>scatter</strong> — both axes numeric, single Y series</li>
      </ul>
      <p>
        Restrict the picker via the <code>allowedCharts</code> prop — useful when you know
        the dataset only makes sense as a bar or line chart.
      </p>

      <h2>What it doesn't do</h2>
      <ul>
        <li>Multi-cell clipboard paste from spreadsheet apps — coming in a future minor</li>
        <li>String literals or cross-sheet refs in CSV (it's just CSV, not a query language)</li>
        <li>Drill-down or zoom inside charts — that's the underlying chart component's job</li>
      </ul>
    </>
  );
}
