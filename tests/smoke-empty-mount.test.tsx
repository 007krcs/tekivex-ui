import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { type ComponentType } from 'react';
import { ThemeProvider, quantumDark } from '../src/themes';
import {
  TkxDataGrid, TkxTable, TkxSelect, TkxMenu, TkxAccordion, TkxBreadcrumb,
  TkxStepper, TkxTreeView, TkxToolbar, TkxTransferList, TkxSegmented, TkxList,
  TkxOrgChart, TkxPivotTable, TkxSpreadsheet, TkxFormBuilder, TkxAutoForm,
  TkxGantt, TkxMindMap, TkxResult, TkxChat, TkxCommandPalette,
} from '../index';

// ─────────────────────────────────────────────────────────────────────────────
// Empty-mount regression guard.
//
// A real consumer mounts a component before its data has loaded — `data`,
// `options`, `schema`, etc. are briefly `undefined`. A library component must
// render an empty/placeholder state, NOT hard-crash the whole React tree.
//
// A broad sweep across all ~100 components found 42 that crashed this way; this
// guards the highest-risk data-driven ones against re-breaking. Kept to a
// single ≤24-mount file so one jsdom worker doesn't exhaust its heap.
// ─────────────────────────────────────────────────────────────────────────────

// Deliberately loose element type: the point of this sweep is to mount each
// component with NO props at all, i.e. omitting props the component declares as
// required. A heterogeneous list of differently-typed components can only be
// held as `ComponentType<any>`.
const COMPONENTS: Array<[string, ComponentType<any>]> = [
  ['TkxDataGrid', TkxDataGrid],
  ['TkxTable', TkxTable],
  ['TkxSelect', TkxSelect],
  ['TkxMenu', TkxMenu],
  ['TkxAccordion', TkxAccordion],
  ['TkxBreadcrumb', TkxBreadcrumb],
  ['TkxStepper', TkxStepper],
  ['TkxTreeView', TkxTreeView],
  ['TkxToolbar', TkxToolbar],
  ['TkxTransferList', TkxTransferList],
  ['TkxSegmented', TkxSegmented],
  ['TkxList', TkxList],
  ['TkxOrgChart', TkxOrgChart],
  ['TkxPivotTable', TkxPivotTable],
  ['TkxSpreadsheet', TkxSpreadsheet],
  ['TkxFormBuilder', TkxFormBuilder],
  ['TkxAutoForm', TkxAutoForm],
  ['TkxGantt', TkxGantt],
  ['TkxMindMap', TkxMindMap],
  ['TkxResult', TkxResult],
  ['TkxChat', TkxChat],
  ['TkxCommandPalette', TkxCommandPalette],
];

afterEach(() => cleanup());

describe('empty-mount guard — data components render empty state, never crash', () => {
  for (const [name, Comp] of COMPONENTS) {
    it(`${name} survives a no-prop mount`, () => {
      expect(() => {
        const { unmount } = render(
          <ThemeProvider theme={quantumDark}>
            <Comp />
          </ThemeProvider>,
        );
        unmount();
      }).not.toThrow();
    });
  }
});
