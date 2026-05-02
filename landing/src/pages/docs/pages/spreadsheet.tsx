export function SpreadsheetDoc() {
  return (
    <>
      <p>
        <code>TkxSpreadsheet</code> is an editable cell grid with a real formula evaluator.
        Not a simulation — actual lexer, parser, and evaluator for formulas, with cell
        references, ranges, and cycle detection. ~600 lines of code, zero deps.
      </p>

      <h2>What works</h2>
      <ul>
        <li>Literal values: numbers (<code>42</code>, <code>3.14</code>), strings (anything that doesn't start with <code>=</code>)</li>
        <li>Formulas starting with <code>=</code> — arithmetic with operator precedence, parentheses, and the <code>^</code> power operator</li>
        <li>Cell references: <code>=A1 + B2</code></li>
        <li>Ranges: <code>=SUM(A1:A10)</code>, <code>=AVG(B1:B5)</code></li>
        <li>Functions: <code>SUM</code>, <code>AVG</code> (alias <code>AVERAGE</code>), <code>MIN</code>, <code>MAX</code>, <code>COUNT</code>, <code>IF</code>, <code>ROUND</code></li>
        <li>Circular reference detection — evaluator returns <code>#CYCLE!</code></li>
        <li>Bad references show <code>#REF!</code>; malformed formulas show <code>#ERROR!</code>; unknown functions show <code>#NAME?</code></li>
      </ul>

      <h2>Quick start</h2>
      <pre><code>{`import { TkxSpreadsheet, type SpreadsheetData } from 'tekivex-ui';

const [data, setData] = useState<SpreadsheetData>({
  cells: {
    A1: 'Item',  B1: 'Qty', C1: 'Price', D1: 'Total',
    A2: 'Pen',   B2: '3',   C2: '2',     D2: '=B2*C2',
    A3: 'Pad',   B3: '5',   C3: '4',     D3: '=B3*C3',
    A4: 'Total',                          D4: '=SUM(D2:D3)',
  },
});

<TkxSpreadsheet cols={4} rows={6} data={data} onChange={setData} />`}</code></pre>

      <h2>Keyboard model</h2>
      <p>Excel-like; muscle memory just works:</p>
      <ul>
        <li><strong>Arrow keys</strong> — move active cell</li>
        <li><strong>Tab / Shift+Tab</strong> — move active cell horizontally</li>
        <li><strong>Enter</strong> — open the active cell for editing; if already editing, commit + move down</li>
        <li><strong>F2</strong> — open the active cell for editing</li>
        <li><strong>Type any character</strong> — replaces the cell content with what you typed</li>
        <li><strong>Escape</strong> — cancel edit</li>
        <li><strong>Delete / Backspace</strong> — clear the active cell</li>
      </ul>

      <h2>Reusing the evaluator</h2>
      <p>
        <code>evaluateCell()</code> is exported so you can run the formula engine outside
        the grid — e.g. for server-side recalc, tests, a separate formula bar.
      </p>
      <pre><code>{`import { evaluateCell } from 'tekivex-ui';

const v = evaluateCell('D4', {
  D2: '=B2*C2', B2: '3', C2: '2',
  D3: '=B3*C3', B3: '5', C3: '4',
  D4: '=SUM(D2:D3)',
});
// v === 26`}</code></pre>

      <h2>Bridging to charts</h2>
      <p>
        The companion helper <code>spreadsheetToRecords()</code> converts the sheet to a
        flat array of records — row 1 becomes the header, rows 2+ become record values.
        Formula cells are evaluated before being copied, so a <code>SUM</code> column
        renders as a number, not a formula string. Feed that into{' '}
        <code>TkxDataExplorer</code> for a chart.
      </p>
      <pre><code>{`const records = spreadsheetToRecords(data, { cols: 4, rows: 100 });
<TkxDataExplorer initialData={records} />`}</code></pre>

      <h2>What the evaluator doesn't do</h2>
      <ul>
        <li>String literals inside formulas (<code>="hello"</code>) — kept simple on purpose</li>
        <li>Cross-sheet references (<code>Sheet2!A1</code>) — single-sheet for now</li>
        <li>Multi-cell paste from clipboard — single-cell paste only</li>
        <li>Cell formatting (currency, percentage, dates) — display formatting is your call</li>
      </ul>

      <h2>Performance</h2>
      <p>
        Tested up to 1,000 cells with mixed formulas at 60 FPS. The evaluator memoizes per
        evaluation, so a single recalc visits each cell at most once. Beyond that scale, a
        dirty-cell tracking pass (recompute only the cells whose deps changed) would help —
        not in the component today, but easy to add on top of <code>evaluateCell()</code>.
      </p>
    </>
  );
}
