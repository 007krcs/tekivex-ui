# Formula bar

`TkxFormulaBar` sits above (or below) `TkxSpreadsheet` and shows the **raw
content** of the active cell — so formulas read as `=A1+B2`, not as their
rendered value. A name-box on the left jumps the active cell when you type
an address into it.

## Drop-in

```tsx
import {
  TkxSpreadsheet,
  TkxFormulaBar,
  type SpreadsheetData,
} from 'tekivex-ui';

const [data, setData]     = useState<SpreadsheetData>({ cells: {} });
const [active, setActive] = useState({ col: 0, row: 0 });

return (
  <>
    <TkxFormulaBar
      data={data}
      active={active}
      onChange={setData}
      onActiveChange={setActive}
    />
    <TkxSpreadsheet
      data={data}
      onChange={setData}
      cols={8}
      rows={20}
    />
  </>
);
```

## Layout

```
┌─────────┬───┬─────────────────────────────┬───────────────┐
│  A1     │fₓ │ =SUM(A2:A10)                │ = 42          │
└─────────┴───┴─────────────────────────────┴───────────────┘
   ^^^                                       ^^^
   name-box                                  live result
```

- **Name box** — current cell address (e.g. `B7`). Type a new address +
  Enter to jump. Bad input reverts on blur.
- **fₓ prefix** — visual cue, no behavior.
- **Formula input** — the raw cell content. Enter / blur commits.
  Escape reverts the draft.
- **Live result** — only renders for formula cells. Shows the
  evaluated number, or the error sentinel (`#CYCLE!`, `#DIV/0!`,
  `#ERROR!`, `#NAME?`) in danger color.

## Keyboard model

| Key                   | What happens                                                  |
| --------------------- | ------------------------------------------------------------- |
| `Enter` (formula box) | Commit the new content, fire `onChange`                       |
| `Escape` (formula)    | Revert the draft to the cell's last-saved content             |
| `Enter` (name box)    | Parse the address (case-insensitive); if valid, fire `onActiveChange` |
| `Escape` (name box)   | Revert to the active cell's address                           |

## Test coverage

100% lines / 100% functions / 100% statements / 90.32% branches.
18 tests cover rendering, editing, name-box parsing, formula
evaluation, error sentinel display, and external-active-cell sync.

## Pairs naturally with

- `TkxSpreadsheet` — same `SpreadsheetData` shape, same evaluator.
- `spreadsheetToRecords()` — converts the sheet into `Record<string, …>[]`
  for `TkxDataExplorer`'s charts.
