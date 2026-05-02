// ─────────────────────────────────────────────────────────────────────────────
// Docs registry — slug → metadata + a render function for the body.
// Each component gets its own route at /docs/<slug>.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react';

import { ButtonDoc } from './pages/button';
import { CardDoc } from './pages/card';
import { BadgeDoc } from './pages/badge';
import { InputDoc } from './pages/input';
import { AvatarDoc } from './pages/avatar';
import { AlertDoc } from './pages/alert';
import { FormBuilderDoc } from './pages/form-builder';
import { FlowChartDoc } from './pages/flow-chart';
import { SpreadsheetDoc } from './pages/spreadsheet';
import { DataExplorerDoc } from './pages/data-explorer';

export interface DocPage {
  slug: string;
  name: string;
  category: string;
  summary: string;
  pkg: string;
  render: () => ReactNode;
}

export const DOC_PAGES: DocPage[] = [
  { slug: 'button',          name: 'TkxButton',         category: 'Primitives',       summary: 'Accessible button with variants, sizes, and loading state.', pkg: 'tekivex-ui', render: ButtonDoc },
  { slug: 'card',            name: 'TkxCard',           category: 'Primitives',       summary: 'Composable card with header, body, footer slots.',          pkg: 'tekivex-ui', render: CardDoc },
  { slug: 'badge',           name: 'TkxBadge',          category: 'Primitives',       summary: 'Compact pill for tags, status, counts.',                     pkg: 'tekivex-ui', render: BadgeDoc },
  { slug: 'input',           name: 'TkxInput',          category: 'Form inputs',      summary: 'Text input with label, error, helper text, and disabled state.', pkg: 'tekivex-ui', render: InputDoc },
  { slug: 'avatar',          name: 'TkxAvatar',         category: 'Display + content',summary: 'Profile photo with status dots + initial-only fallback.',    pkg: 'tekivex-ui', render: AvatarDoc },
  { slug: 'alert',           name: 'TkxAlert',          category: 'Overlays + feedback', summary: 'Colored notice for info / success / warning / error.',     pkg: 'tekivex-ui', render: AlertDoc },
  { slug: 'form-builder',    name: 'TkxFormBuilder',    category: 'Productivity',     summary: 'Three-pane visual form designer with live preview + JSON export.', pkg: 'tekivex-ui', render: FormBuilderDoc },
  { slug: 'flow-chart',      name: 'TkxFlowChart',      category: 'Productivity',     summary: 'Node-edge graph editor with drag, pan, zoom, keyboard nav, and inline editing.', pkg: 'tekivex-ui', render: FlowChartDoc },
  { slug: 'spreadsheet',     name: 'TkxSpreadsheet',    category: 'Productivity',     summary: 'Editable cell grid with a real formula evaluator.',          pkg: 'tekivex-ui', render: SpreadsheetDoc },
  { slug: 'data-explorer',   name: 'TkxDataExplorer',   category: 'Charts',           summary: 'Drop a CSV / JSON, preview, pick a chart, render.',          pkg: 'tekivex-ui/charts', render: DataExplorerDoc },
];

export function findDoc(slug: string) {
  return DOC_PAGES.find((d) => d.slug === slug);
}

export function docsByCategory() {
  const map = new Map<string, DocPage[]>();
  for (const d of DOC_PAGES) {
    if (!map.has(d.category)) map.set(d.category, []);
    map.get(d.category)!.push(d);
  }
  return Array.from(map.entries());
}
