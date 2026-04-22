# Storybook coverage plan

**Status:** 8 / 80 components covered (10%)  
**Goal:** 100% within 6 weeks of v2.7.0

## Covered

TkxButton, TkxBadge, TkxAlert, TkxInput, TkxCard, TkxToggle, TkxProgress, TkxAvatar.

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
