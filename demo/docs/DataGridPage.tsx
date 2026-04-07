import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxDataGrid } from '@tekivex/ui';
import type { DataGridColumn } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Fake data ────────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  startDate: string;
  status: 'active' | 'on-leave' | 'terminated';
}

const EMPLOYEES: Employee[] = [
  { id: '1', name: 'Alice Chen', role: 'Staff Engineer', department: 'Engineering', salary: 185000, startDate: '2019-03-12', status: 'active' },
  { id: '2', name: 'Bob Martinez', role: 'Product Manager', department: 'Product', salary: 162000, startDate: '2020-07-01', status: 'active' },
  { id: '3', name: 'Carol Wu', role: 'UX Designer', department: 'Design', salary: 138000, startDate: '2021-01-15', status: 'on-leave' },
  { id: '4', name: 'David Kim', role: 'Backend Engineer', department: 'Engineering', salary: 155000, startDate: '2020-11-20', status: 'active' },
  { id: '5', name: 'Eva Johansson', role: 'Data Scientist', department: 'Analytics', salary: 170000, startDate: '2022-04-10', status: 'active' },
  { id: '6', name: 'Frank Osei', role: 'DevOps Lead', department: 'Engineering', salary: 175000, startDate: '2018-09-05', status: 'active' },
  { id: '7', name: 'Grace Patel', role: 'QA Engineer', department: 'Engineering', salary: 130000, startDate: '2023-02-28', status: 'terminated' },
];

// ── Columns ──────────────────────────────────────────────────────────────────

const BASIC_COLUMNS: DataGridColumn<Employee>[] = [
  { key: 'name', header: 'Name', width: 180, sortable: true },
  { key: 'role', header: 'Role', width: 180 },
  { key: 'department', header: 'Department', width: 140, sortable: true },
  { key: 'salary', header: 'Salary', width: 120, align: 'right', sortable: true,
    renderCell: (v: number) => `$${v.toLocaleString()}`,
  },
  { key: 'startDate', header: 'Start Date', width: 130, sortable: true },
  { key: 'status', header: 'Status', width: 110 },
];

// ── Props definitions ────────────────────────────────────────────────────────

const DATAGRID_PROPS = [
  { name: 'columns', type: 'DataGridColumn<T>[]', description: 'Column definitions including key, header, width, sortable, align, renderCell, etc.', required: true },
  { name: 'data', type: 'T[]', description: 'Array of row data objects.', required: true },
  { name: 'rowKey', type: 'string | ((row: T) => string)', description: 'Unique key field or accessor for each row.', required: true },
  { name: 'selectable', type: 'boolean', default: 'false', description: 'Enable row selection with checkboxes.' },
  { name: 'selectedRows', type: 'string[]', default: '[]', description: 'Controlled selected row IDs.' },
  { name: 'onSelectionChange', type: '(ids: string[]) => void', default: 'undefined', description: 'Callback when selection changes.' },
  { name: 'sortable', type: 'boolean', default: 'false', description: 'Enable column sorting globally.' },
  { name: 'onSort', type: '(key: string, direction: "asc" | "desc") => void', default: 'undefined', description: 'Callback when a column header is clicked for sorting.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Show skeleton loading state.' },
  { name: 'emptyMessage', type: 'string', default: '"No data"', description: 'Message displayed when data is empty.' },
  { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Stick column headers to the top when scrolling.' },
  { name: 'striped', type: 'boolean', default: 'false', description: 'Alternate row background colors.' },
  { name: 'bordered', type: 'boolean', default: 'false', description: 'Add borders between cells.' },
  { name: 'compact', type: 'boolean', default: 'false', description: 'Reduce row padding for denser layout.' },
  { name: 'maxHeight', type: 'number | string', default: 'undefined', description: 'Constrain the grid height with vertical scrolling.' },
  { name: 'onRowClick', type: '(row: T) => void', default: 'undefined', description: 'Callback when a row body is clicked.' },
];

const COLUMN_PROPS = [
  { name: 'key', type: 'string', description: 'Property name used to read the cell value from each row.', required: true },
  { name: 'header', type: 'string', description: 'Text displayed in the column header.', required: true },
  { name: 'width', type: 'number | string', default: 'auto', description: 'Fixed column width.' },
  { name: 'sortable', type: 'boolean', default: 'false', description: 'Whether this column is sortable.' },
  { name: 'filterable', type: 'boolean', default: 'false', description: 'Whether this column supports filtering.' },
  { name: 'resizable', type: 'boolean', default: 'false', description: 'Whether the column can be resized by dragging.' },
  { name: 'renderCell', type: '(value: any, row: T) => ReactNode', default: 'undefined', description: 'Custom cell renderer.' },
  { name: 'renderHeader', type: '(col: DataGridColumn<T>) => ReactNode', default: 'undefined', description: 'Custom header renderer.' },
  { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", description: 'Text alignment for the column.' },
  { name: 'pinned', type: "'left' | 'right'", default: 'undefined', description: 'Pin column to the left or right edge.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function DataGridPage({ theme }: { theme: ThemeTokens }) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Basic Grid ─────────────────────────────────────────────────── */}

      <DemoSection
        title="Basic Data Grid"
        description="A simple grid with columns and data. Salary uses a custom renderCell for formatting."
        theme={theme}
        code={`<TkxDataGrid
  columns={[
    { key: 'name', header: 'Name', width: 180, sortable: true },
    { key: 'role', header: 'Role', width: 180 },
    { key: 'department', header: 'Department', width: 140 },
    { key: 'salary', header: 'Salary', width: 120, align: 'right',
      renderCell: (v) => \`$\${v.toLocaleString()}\`,
    },
    { key: 'startDate', header: 'Start Date', width: 130 },
    { key: 'status', header: 'Status', width: 110 },
  ]}
  data={employees}
  rowKey="id"
/>`}
      >
        <TkxDataGrid columns={BASIC_COLUMNS} data={EMPLOYEES} rowKey="id" />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Selectable Rows ────────────────────────────────────────────── */}

      <DemoSection
        title="Selectable Rows"
        description="Enable row selection via checkboxes. Control selected state with selectedRows and onSelectionChange."
        theme={theme}
        code={`const [selected, setSelected] = useState<string[]>([]);

<TkxDataGrid
  columns={columns}
  data={employees}
  rowKey="id"
  selectable
  selectedRows={selected}
  onSelectionChange={setSelected}
/>`}
      >
        <div>
          <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 12 }}>
            Selected: {selectedRows.length === 0 ? 'none' : selectedRows.join(', ')}
          </div>
          <TkxDataGrid
            columns={BASIC_COLUMNS}
            data={EMPLOYEES}
            rowKey="id"
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Sortable ───────────────────────────────────────────────────── */}

      <DemoSection
        title="Sortable Columns"
        description="Set sortable on both the grid and individual columns. Click column headers to toggle sort direction."
        theme={theme}
        code={`<TkxDataGrid
  columns={columns} // columns with sortable: true
  data={employees}
  rowKey="id"
  sortable
/>`}
      >
        <TkxDataGrid columns={BASIC_COLUMNS} data={EMPLOYEES} rowKey="id" sortable />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Striped & Bordered ─────────────────────────────────────────── */}

      <DemoSection
        title="Striped and Bordered"
        description="Apply striped and bordered props for visual distinction between rows and cells."
        theme={theme}
        code={`<TkxDataGrid
  columns={columns}
  data={employees}
  rowKey="id"
  striped
  bordered
/>`}
      >
        <TkxDataGrid columns={BASIC_COLUMNS} data={EMPLOYEES} rowKey="id" striped bordered />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Compact ────────────────────────────────────────────────────── */}

      <DemoSection
        title="Compact Mode"
        description="Reduce row padding for a denser layout, ideal for data-heavy views."
        theme={theme}
        code={`<TkxDataGrid
  columns={columns}
  data={employees}
  rowKey="id"
  compact
  striped
/>`}
      >
        <TkxDataGrid columns={BASIC_COLUMNS} data={EMPLOYEES} rowKey="id" compact striped />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Loading State ──────────────────────────────────────────────── */}

      <DemoSection
        title="Loading State"
        description="Set loading to show skeleton placeholders while data is being fetched."
        theme={theme}
        code={`<TkxDataGrid
  columns={columns}
  data={[]}
  rowKey="id"
  loading
/>`}
      >
        <TkxDataGrid columns={BASIC_COLUMNS} data={[]} rowKey="id" loading />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props table ────────────────────────────────────────────────── */}

      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxDataGrid Props
        </h3>
        <PropTable props={DATAGRID_PROPS} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          DataGridColumn Props
        </h3>
        <PropTable props={COLUMN_PROPS} />
      </div>
    </div>
  );
}
