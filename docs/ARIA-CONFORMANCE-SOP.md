# ARIA conformance — standing operating procedure

Every component and every element must comply with WAI-ARIA 1.2. This is
enforced automatically, on every test run, rather than by periodic review.

## The gate

```bash
npm run aria:check     # fails the build on ANY violation — this is the SOP
npm run aria:sweep     # report mode: writes aria-sweep.ndjson, never fails
npm run aria:report    # triage view of the last sweep
```

`aria:check` must stay green. Run it before every release, and in CI alongside
`npm test`.

## How it works

Every test in the suite doubles as an ARIA probe. After each test, whatever
that test rendered is validated; in `check` mode a violation fails that test,
naming the component responsible. This reuses the ~2,200 renders the suite
already performs, which is far broader coverage than any hand-written fixture
list, and it means **new components are covered the moment they get their first
test** — no separate a11y fixture to remember to write.

A normal `vitest run` is unaffected and pays no cost; both modes are opt-in via
environment variables set by the npm scripts.

### Two engines

| | What it covers |
|---|---|
| `tests/aria/validate.ts` | The W3C **specification**: valid/abstract roles, valid `aria-*` attributes, value grammars (enum/boolean/numeric), idref integrity, required properties per role, prohibited properties per role, required context roles, `aria-hidden` over focusable content, accessible-name requirements, duplicate ids |
| `tests/aria/axe.ts` (axe-core) | The industry rule set, as an independent second opinion |

`tests/aria/aria-spec.ts` encodes the rules straight from
<https://www.w3.org/TR/wai-aria-1.2/#role_definitions>. When the spec changes,
that file is the single place to update.

Rules that need layout or paint (colour contrast, target size, link-in-text)
are **disabled** under jsdom rather than left to report misleading passes —
they belong in the Playwright suite, which runs in a real browser.

## Scope, honestly stated

This gate proves *structural* conformance. It cannot prove usability. It does
not replace testing with real assistive technology, and a green gate is not a
certification. What it does guarantee is that the defect classes below can
never silently return.

Two limits worth knowing:

- **Required-attribute and required-context rules are enforced only for
  authored roles.** A native `<option>` or `<tr>` gets its semantics from HTML,
  so demanding author-supplied `aria-selected` on it would be wrong. (An early
  version of the validator did exactly that and produced 182 false positives.)
- **Test fixtures need their own typecheck.** `tsconfig.json` covers `src` +
  `index.ts` only — what ships — so for a long time a fixture could pass props
  that do not exist and nothing complained. That is how two CommandPalette
  fixtures came to use `label` instead of `title`, rendering unnamed options,
  and how TkxMenu fixtures passed `key` instead of `id`. The sweep catches the
  *symptom*; `npm run typecheck:tests` (`tsconfig.tests.json`) catches the
  *cause*. Run both.

## Defect classes this has caught

Each of these was live in shipped code before the gate existed:

- **Dangling idrefs** — `aria-controls` / `aria-activedescendant` /
  `aria-describedby` pointing at popups, panels, and error nodes that are not
  rendered. Found in Select, ComboBox, Autocomplete, Tabs, DataGrid,
  PhoneInput, Checkbox, Input. In DataGrid the id referenced **never existed at
  all**, expanded or collapsed.
- **Unnamed widgets** — `role="switch"` / `combobox` / `spinbutton` /
  `progressbar` / `option` with no accessible name. The recurring cause is a
  `<label for>` pointing at an element that is not labelable (a `<button>` or a
  `<div role=…>`), which silently names nothing.
- **Prohibited properties** — `aria-selected` on `role="menuitem"` and on
  `role="listitem"`.
- **Invalid values** — `aria-valuenow="NaN"` reaching a `role="meter"`.

## When the gate fails

The failure names the rule, the offending element, and the test that rendered
it. Fix the component, not the assertion. If you believe a finding is a false
positive, fix `aria-spec.ts` or `validate.ts` and say why in the commit — never
add a blanket ignore.

The one legitimate exemption in the tree is `tests/aria/axe-smoke.test.tsx`,
which renders invalid markup on purpose to prove the detector works, and is
skipped in strict mode for that reason.

## The full pre-release check

```bash
npm test                  # 2,255 unit tests
npm run typecheck         # src + index.ts (what ships)
npm run typecheck:tests   # test fixtures — catches wrong-prop fixtures
npm run aria:check        # WAI-ARIA 1.2 conformance, fails on any violation
npm run build             # dist + d.ts shims
```

## Consumer-visible ARIA changes

Fixing conformance can change an element's accessible name, which changes how
`getByRole(role, { name })` resolves in a consumer's own tests. Changes so far:

| Version | Component | Change |
|---|---|---|
| 4.2.0 | `TkxSelect` | The trigger's accessible name is now its `label` (or placeholder), not the selected option's text. This is the APG combobox behaviour — the value is conveyed by the listbox's `aria-selected` — but `getByRole('combobox', { name: 'SelectedValue' })` must become the label text. |
| 4.2.0 | `TkxToggle` | `role="switch"` is now named via `aria-labelledby` pointing at the visible label. Previously the `<label for>` targeted a `<button>`, which is not a labelable element, so the switch had **no** name at all — queries by name start working rather than break. |
| 4.2.0 | `TkxForm` fields | Same fix: the field label now actually names its control. |

When a fix like this lands, record it here and in the CHANGELOG — a silently
changed accessible name is an API change for anyone testing by role and name.
