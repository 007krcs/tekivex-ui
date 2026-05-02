export function BidirectionalSpreadsheetChart() {
  return (
    <>
      <p>
        Our landing has a section called Data Demo. On the left, a live spreadsheet — edit any
        cell and the chart on the right updates instantly. On the right, a CSV / JSON upload
        zone with a chart picker — drop in a file and the spreadsheet on the left repopulates
        with the parsed rows.
      </p>

      <p>
        It's the same data, two views. Edit one, the other follows. The pattern took us about
        100 lines of glue and one <code>useMemo</code>. Here's how it composes.
      </p>

      <h2>The pieces</h2>

      <p>The demo wires three of our components together:</p>

      <ul>
        <li>
          <strong><code>TkxSpreadsheet</code></strong> — controlled grid with a real formula
          evaluator (SUM, AVG, MIN, MAX, COUNT, IF, ROUND, ranges, cycle detection).
        </li>
        <li>
          <strong><code>TkxDataExplorer</code></strong> — drop-zone for CSV / JSON, preview
          table, chart picker, live chart.
        </li>
        <li>
          <strong>Two helpers</strong> — <code>spreadsheetToRecords</code> converts the
          cell-keyed shape into a flat array of records. <code>recordsToSpreadsheet</code>
          does the inverse, with a stable union-of-keys ordering so columns stay in the same
          place across re-renders.
        </li>
      </ul>

      <h2>The single source of truth</h2>

      <p>
        Both views render from one piece of state — a <code>SpreadsheetData</code> object
        keyed by cell address (<code>{`{ A1: 'name', B1: 'score', A2: 'Ada', B2: '99', … }`}</code>).
        That keeps the model small and easy to memo. The records array consumed by
        <code>TkxDataExplorer</code> is derived, not stored.
      </p>

      <pre><code>{`const [sheet, setSheet] = useState<SpreadsheetData>(SAMPLE);

const records = useMemo(
  () => spreadsheetToRecords(sheet, { cols, rows }),
  [sheet, cols, rows],
);`}</code></pre>

      <p>
        That's the entire forward direction. Every time the user edits a cell, React re-renders,
        the memo sees a new <code>sheet</code> reference, recomputes the records, and the chart
        explorer re-renders the chart. The formula evaluator runs <em>inside</em>{' '}
        <code>spreadsheetToRecords</code>, so a cell containing <code>=B2*0.95</code> shows up
        as a real number on the chart.
      </p>

      <h2>The reverse direction is one callback</h2>

      <p>
        When the user uploads a CSV inside <code>TkxDataExplorer</code>, the explorer fires
        an <code>onDataLoad</code> callback with the parsed records. We convert them back into
        a sheet shape and replace the state.
      </p>

      <pre><code>{`<TkxDataExplorer
  initialData={records}
  onDataLoad={(parsed) => {
    setSheet(recordsToSpreadsheet(parsed));
    setExplorerKey((k) => k + 1);
  }}
/>`}</code></pre>

      <p>
        That's it. The spreadsheet on the left is now controlled by the same state we just
        replaced; React re-renders, the new cells show up, and the chart explorer remounts
        with the same records via the bumped key.
      </p>

      <h2>Why bump the key on upload</h2>

      <p>
        Subtle gotcha: <code>TkxDataExplorer</code> takes <code>initialData</code> as a prop,
        not <code>data</code>. Internally it copies that into <code>useState</code> on first
        render, then owns the chart picker state. Cell edits flow into the explorer through
        prop changes (the records array updates and the chart re-renders); but a fresh
        upload should also reset the chart-picker UI back to "auto-pick X / first numeric Y."
      </p>

      <p>
        We bump a <code>key</code> only on uploads, not on cell edits. That way edits don't
        wipe the chart-picker state but uploads do. The distinction matters when a user has
        configured "show qty + revenue stacked" and then switches the dataset — the new
        dataset's columns are different, so resetting is the right behavior.
      </p>

      <h2>Dynamic sheet bounds</h2>

      <p>
        A 50-row CSV upload is bigger than the demo's 8-row default sheet. We compute
        <code>cols</code> and <code>rows</code> dynamically from the cell addresses present in
        the sheet:
      </p>

      <pre><code>{`const { cols, rows } = useMemo(() => {
  let maxCol = 0, maxRow = 0;
  for (const a of Object.keys(sheet.cells)) {
    const m = /^([A-Z]+)([0-9]+)$/.exec(a);
    if (!m) continue;
    const col = colIndex(m[1]);
    const row = +m[2] - 1;
    if (col > maxCol) maxCol = col;
    if (row > maxRow) maxRow = row;
  }
  return {
    cols: Math.max(MIN_COLS, maxCol + 1),
    rows: Math.max(MIN_ROWS, maxRow + 2),
  };
}, [sheet]);`}</code></pre>

      <p>
        Wrap the spreadsheet in <code>maxHeight</code> with <code>overflow: auto</code> and
        50-row uploads scroll inside their pane instead of stretching the section.
      </p>

      <h2>The pattern</h2>

      <p>
        The reason this is small is that we picked the right shape for the source-of-truth.
        Cell-addressed objects are a great fit for a spreadsheet — sparse, cheap to memo,
        easy to round-trip with formulas. Records are a great fit for charts — dense,
        recharts-ready, easy to filter. The two helpers are pure functions; everything else
        is React's normal data-flow.
      </p>

      <p>
        We didn't reach for Zustand. We didn't need a query client. We didn't write
        bidirectional bindings. <code>useState</code> + <code>useMemo</code> + two pure
        functions is enough — and it scales to 50, 500, or 5,000 rows without touching the
        wiring.
      </p>

      <h2>What we'd change</h2>

      <p>
        For very large datasets (50,000+ records) the formula evaluator becomes the bottleneck —
        it re-evaluates the entire sheet on every cell edit. We have memoization inside the
        evaluator but not invalidation by dependency. Adding a dirty-cell tracking pass would
        let us evaluate only the cells whose dependencies changed.
      </p>

      <p>
        For the demo's purposes (≤200 rows, ≤10 columns), the naive recompute is well under a
        millisecond, so we left it. If you want to push past that, the <code>tekivex-ui</code>{' '}
        spreadsheet evaluator is exported as <code>evaluateCell</code> and you can build your
        own dependency graph on top of it.
      </p>
    </>
  );
}
