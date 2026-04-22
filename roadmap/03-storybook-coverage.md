# Storybook coverage plan

**Status:** ⛔ BLOCKED — Storybook 9 peer-requires Vite ≤ 7; tekivex-ui is on Vite 8.  
**Attempted:** 2026-04-22 — `npm install @storybook/react-vite@^9` failed with ERESOLVE.  
**Unblocking options:**
1. Wait for a Storybook release that supports Vite 8 (open issue: storybookjs/storybook)
2. Maintain a separate Storybook workspace on Vite 7 (dev-time only, not shipped)
3. Ladle or Histoire as alternatives — both currently support Vite 8

**Recommendation:** option 2 or 3. Revisit when Storybook supports Vite 8.

**Goal when unblocked:** 100% component coverage within 6 weeks.

## Covered (draft stories written but not shippable)

TkxButton, TkxBadge, TkxAlert, TkxInput, TkxCard, TkxToggle, TkxProgress, TkxAvatar — eight `.stories.tsx` files written during the initial attempt, held locally until the tooling situation resolves.

## Next wave (priority: highest-traffic public API)

- TkxCheckbox, TkxRadio, TkxSelect, TkxTextarea — complete the form control set
- TkxModal, TkxDrawer, TkxPopover, TkxTooltip — overlay primitives
- TkxTabs, TkxAccordion, TkxBreadcrumb, TkxPagination — navigation
- TkxTable, TkxDataGrid, TkxList — data display
- TkxSpinner, TkxSkeleton, TkxToast — feedback

## Standards per story file

1. One file per component, `stories/TkxFoo.stories.tsx`
2. At minimum: one story per union-literal value of the primary variant prop
3. One story per interaction state (hover / focus / disabled / loading)
4. Complex components get a `Controlled` wrapper so toggling in the addons panel actually drives state
5. Use real prop names from `src/components/TkxFoo.tsx` — never invent. The variant catalog at `packages/figma-kit/dist/variants.json` is the authoritative enum.

## Enforcement

- CI job checks `stories/**/*.stories.tsx` count vs. `Tkx*` component count; fails at < 90%
- axe-storybook-testing runs in CI against all stories; any a11y violation fails the build
