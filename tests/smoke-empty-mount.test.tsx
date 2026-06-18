import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
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

const COMPONENTS: Array<[string, ComponentType<Record<string, unknown>>]> = [
  ['TkxDataGrid', TkxDataGrid as ComponentType<Record<string, unknown>>],
  ['TkxTable', TkxTable as ComponentType<Record<string, unknown>>],
  ['TkxSelect', TkxSelect as ComponentType<Record<string, unknown>>],
  ['TkxMenu', TkxMenu as ComponentType<Record<string, unknown>>],
  ['TkxAccordion', TkxAccordion as ComponentType<Record<string, unknown>>],
  ['TkxBreadcrumb', TkxBreadcrumb as ComponentType<Record<string, unknown>>],
  ['TkxStepper', TkxStepper as ComponentType<Record<string, unknown>>],
  ['TkxTreeView', TkxTreeView as ComponentType<Record<string, unknown>>],
  ['TkxToolbar', TkxToolbar as ComponentType<Record<string, unknown>>],
  ['TkxTransferList', TkxTransferList as ComponentType<Record<string, unknown>>],
  ['TkxSegmented', TkxSegmented as ComponentType<Record<string, unknown>>],
  ['TkxList', TkxList as ComponentType<Record<string, unknown>>],
  ['TkxOrgChart', TkxOrgChart as ComponentType<Record<string, unknown>>],
  ['TkxPivotTable', TkxPivotTable as ComponentType<Record<string, unknown>>],
  ['TkxSpreadsheet', TkxSpreadsheet as ComponentType<Record<string, unknown>>],
  ['TkxFormBuilder', TkxFormBuilder as ComponentType<Record<string, unknown>>],
  ['TkxAutoForm', TkxAutoForm as ComponentType<Record<string, unknown>>],
  ['TkxGantt', TkxGantt as ComponentType<Record<string, unknown>>],
  ['TkxMindMap', TkxMindMap as ComponentType<Record<string, unknown>>],
  ['TkxResult', TkxResult as ComponentType<Record<string, unknown>>],
  ['TkxChat', TkxChat as ComponentType<Record<string, unknown>>],
  ['TkxCommandPalette', TkxCommandPalette as ComponentType<Record<string, unknown>>],
];

afterEach(() => cleanup());

describe('empty-mount guard — data components render empty state, never crash', () => {
  for (const [name, Comp] of COMPONENTS) {
    it(`${name} survives a no-prop mount`, () => {
      expect(() => {
        const { unmount } = render(
          createElement(
            ThemeProvider,
            { theme: quantumDark } as Record<string, unknown>,
            createElement(Comp, {}),
          ),
        );
        unmount();
      }).not.toThrow();
    });
  }
});
