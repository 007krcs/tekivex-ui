import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { TkxDataGrid } from '../src/components/TkxDataGrid';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';
import type { DataGridColumn } from '../src/components/TkxDataGrid';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

interface Row {
  id: string;
  name: string;
  age: number;
}

const columns: DataGridColumn<Row>[] = [
  { key: 'name', header: 'Name' },
  { key: 'age', header: 'Age' },
];

const data: Row[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
];

describe('TkxDataGrid', () => {
  it('renders column headers', () => {
    render(<TkxDataGrid columns={columns} data={data} rowKey="id" />, { wrapper: Wrapper });
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<TkxDataGrid columns={columns} data={data} rowKey="id" />, { wrapper: Wrapper });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders empty message when data is empty', () => {
    render(<TkxDataGrid columns={columns} data={[]} rowKey="id" emptyMessage="No records" />, { wrapper: Wrapper });
    expect(screen.getByText('No records')).toBeInTheDocument();
  });

  it('renders checkboxes when selectable is true', () => {
    render(<TkxDataGrid columns={columns} data={data} rowKey="id" selectable />, { wrapper: Wrapper });
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('calls onSelectionChange when a row checkbox is clicked', () => {
    const onSelectionChange = vi.fn();
    render(
      <TkxDataGrid columns={columns} data={data} rowKey="id" selectable onSelectionChange={onSelectionChange} />,
      { wrapper: Wrapper },
    );
    const checkboxes = screen.getAllByRole('checkbox');
    // Click the first row checkbox (index 1 since 0 is the header select-all)
    checkboxes[1].click();
    expect(onSelectionChange).toHaveBeenCalled();
  });

  // ── Sorting ────────────────────────────────────────────────────────────────

  describe('sorting', () => {
    function getDataRowsText(): string[] {
      const allRows = screen.getAllByRole('row');
      // Drop header rows (those containing columnheader cells)
      const dataRows = allRows.filter(r => within(r).queryAllByRole('columnheader').length === 0);
      return dataRows.map(r => r.textContent || '');
    }

    it('clicking a sortable column header sorts ascending, then descending', () => {
      const sortCols: DataGridColumn<Row>[] = [
        { key: 'name', header: 'Name', sortable: true },
        { key: 'age', header: 'Age', sortable: true },
      ];
      render(<TkxDataGrid columns={sortCols} data={data} rowKey="id" sortable />, { wrapper: Wrapper });

      const nameHeader = screen.getByRole('columnheader', { name: /Name/i });

      // First click: ascending → Alice, Bob
      fireEvent.click(nameHeader);
      let rows = getDataRowsText();
      expect(rows[0]).toContain('Alice');
      expect(rows[1]).toContain('Bob');
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

      // Second click: descending → Bob, Alice
      fireEvent.click(nameHeader);
      rows = getDataRowsText();
      expect(rows[0]).toContain('Bob');
      expect(rows[1]).toContain('Alice');
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it('numeric columns use numeric comparator (not lexical)', () => {
      const numData: Row[] = [
        { id: '1', name: 'A', age: 2 },
        { id: '2', name: 'B', age: 10 },
        { id: '3', name: 'C', age: 1 },
      ];
      render(
        <TkxDataGrid
          columns={[{ key: 'age', header: 'Age', sortable: true }]}
          data={numData}
          rowKey="id"
          sortable
        />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByRole('columnheader', { name: /Age/i }));
      const cells = screen.getAllByRole('gridcell').map(c => c.textContent);
      // ascending: 1, 2, 10 (not 1, 10, 2)
      expect(cells).toEqual(['1', '2', '10']);
    });

    it('string columns sort alphabetically (case-insensitive)', () => {
      const strData: Row[] = [
        { id: '1', name: 'banana', age: 0 },
        { id: '2', name: 'Apple', age: 0 },
        { id: '3', name: 'cherry', age: 0 },
      ];
      render(
        <TkxDataGrid
          columns={[{ key: 'name', header: 'Name', sortable: true }]}
          data={strData}
          rowKey="id"
          sortable
        />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByRole('columnheader', { name: /Name/i }));
      const cells = screen.getAllByRole('gridcell').map(c => c.textContent);
      expect(cells).toEqual(['Apple', 'banana', 'cherry']);
    });

    it('column with sortable: false does not sort on click', () => {
      const cols: DataGridColumn<Row>[] = [
        { key: 'name', header: 'Name', sortable: false },
      ];
      render(<TkxDataGrid columns={cols} data={data} rowKey="id" sortable />, { wrapper: Wrapper });
      const header = screen.getByRole('columnheader', { name: /Name/i });
      // aria-sort should NOT be set on non-sortable columns
      expect(header).not.toHaveAttribute('aria-sort');
      fireEvent.click(header);
      // Order should remain original
      const cells = screen.getAllByRole('gridcell').map(c => c.textContent);
      expect(cells[0]).toBe('Alice');
      expect(cells[1]).toBe('Bob');
    });

    it('external onSort callback is called with key and direction', () => {
      const onSort = vi.fn();
      const cols: DataGridColumn<Row>[] = [
        { key: 'name', header: 'Name', sortable: true },
      ];
      render(
        <TkxDataGrid columns={cols} data={data} rowKey="id" sortable onSort={onSort} />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByRole('columnheader', { name: /Name/i }));
      expect(onSort).toHaveBeenCalledWith('name', 'asc');
      fireEvent.click(screen.getByRole('columnheader', { name: /Name/i }));
      expect(onSort).toHaveBeenLastCalledWith('name', 'desc');
    });
  });

  // ── Filtering ──────────────────────────────────────────────────────────────

  describe('filtering', () => {
    it('per-column text filter narrows visible rows', () => {
      const cols: DataGridColumn<Row>[] = [
        { key: 'name', header: 'Name', filterable: true },
        { key: 'age', header: 'Age' },
      ];
      render(<TkxDataGrid columns={cols} data={data} rowKey="id" />, { wrapper: Wrapper });
      const filter = screen.getByLabelText('Filter by Name') as HTMLInputElement;
      fireEvent.change(filter, { target: { value: 'Ali' } });
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('filter is case-insensitive', () => {
      const cols: DataGridColumn<Row>[] = [
        { key: 'name', header: 'Name', filterable: true },
      ];
      render(<TkxDataGrid columns={cols} data={data} rowKey="id" />, { wrapper: Wrapper });
      const filter = screen.getByLabelText('Filter by Name') as HTMLInputElement;
      fireEvent.change(filter, { target: { value: 'BOB' } });
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('empty filter value shows all rows', () => {
      const cols: DataGridColumn<Row>[] = [
        { key: 'name', header: 'Name', filterable: true },
      ];
      render(<TkxDataGrid columns={cols} data={data} rowKey="id" />, { wrapper: Wrapper });
      const filter = screen.getByLabelText('Filter by Name') as HTMLInputElement;
      fireEvent.change(filter, { target: { value: 'Ali' } });
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      fireEvent.change(filter, { target: { value: '' } });
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('multiple column filters combine with AND', () => {
      const multiData: Row[] = [
        { id: '1', name: 'Alice', age: 30 },
        { id: '2', name: 'Alex', age: 25 },
        { id: '3', name: 'Bob', age: 30 },
      ];
      const cols: DataGridColumn<Row>[] = [
        { key: 'name', header: 'Name', filterable: true },
        { key: 'age', header: 'Age', filterable: true },
      ];
      render(<TkxDataGrid columns={cols} data={multiData} rowKey="id" />, { wrapper: Wrapper });
      fireEvent.change(screen.getByLabelText('Filter by Name'), { target: { value: 'Al' } });
      fireEvent.change(screen.getByLabelText('Filter by Age'), { target: { value: '30' } });
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Alex')).not.toBeInTheDocument(); // Al matches but age 25 fails
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();  // age 30 matches but name fails
    });
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  describe('pagination', () => {
    const bigData: Row[] = Array.from({ length: 12 }, (_, i) => ({
      id: String(i + 1),
      name: `User${i + 1}`,
      age: 20 + i,
    }));

    it('respects pageSize and next/prev buttons navigate pages', () => {
      render(
        <TkxDataGrid columns={columns} data={bigData} rowKey="id" pageSize={5} />,
        { wrapper: Wrapper },
      );
      // First page: User1..User5 visible
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.getByText('User5')).toBeInTheDocument();
      expect(screen.queryByText('User6')).not.toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Next page'));
      expect(screen.getByText('User6')).toBeInTheDocument();
      expect(screen.getByText('User10')).toBeInTheDocument();
      expect(screen.queryByText('User1')).not.toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Previous page'));
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.queryByText('User6')).not.toBeInTheDocument();
    });

    it('last page renders partial rows correctly', () => {
      // 12 rows, pageSize 5 → page 3 has 2 rows
      render(
        <TkxDataGrid columns={columns} data={bigData} rowKey="id" pageSize={5} />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByLabelText('Last page'));
      expect(screen.getByText('User11')).toBeInTheDocument();
      expect(screen.getByText('User12')).toBeInTheDocument();
      expect(screen.queryByText('User10')).not.toBeInTheDocument();
      // Range label should show "11–12 of 12"
      expect(screen.getByText(/11.*12.*of.*12/)).toBeInTheDocument();
    });

    it('changing filter resets to page 1', () => {
      const cols: DataGridColumn<Row>[] = [
        { key: 'name', header: 'Name', filterable: true },
        { key: 'age', header: 'Age' },
      ];
      render(
        <TkxDataGrid columns={cols} data={bigData} rowKey="id" pageSize={5} />,
        { wrapper: Wrapper },
      );
      // Navigate to last page
      fireEvent.click(screen.getByLabelText('Last page'));
      expect(screen.getByText('User12')).toBeInTheDocument();
      // Apply a filter — should bounce back to page 1
      fireEvent.change(screen.getByLabelText('Filter by Name'), { target: { value: 'User' } });
      // Page 1 of full filtered set
      expect(screen.getByText('User1')).toBeInTheDocument();
    });

    it('range label reflects total filtered row count', () => {
      render(
        <TkxDataGrid columns={columns} data={bigData} rowKey="id" pageSize={5} />,
        { wrapper: Wrapper },
      );
      // "1–5 of 12"
      expect(screen.getByText(/1.*5.*of.*12/)).toBeInTheDocument();
    });
  });

  // ── Selection ──────────────────────────────────────────────────────────────

  describe('selection', () => {
    it('select-all checkbox selects every visible row', () => {
      const onSelectionChange = vi.fn();
      render(
        <TkxDataGrid columns={columns} data={data} rowKey="id" selectable onSelectionChange={onSelectionChange} />,
        { wrapper: Wrapper },
      );
      const selectAll = screen.getByLabelText('Select all rows');
      fireEvent.click(selectAll);
      expect(onSelectionChange).toHaveBeenCalledWith(['1', '2']);
    });

    it('select-all when all selected deselects every row', () => {
      const onSelectionChange = vi.fn();
      render(
        <TkxDataGrid
          columns={columns}
          data={data}
          rowKey="id"
          selectable
          selectedRows={['1', '2']}
          onSelectionChange={onSelectionChange}
        />,
        { wrapper: Wrapper },
      );
      const deselectAll = screen.getByLabelText('Deselect all rows');
      fireEvent.click(deselectAll);
      expect(onSelectionChange).toHaveBeenCalledWith([]);
    });

    it('indeterminate state when only some rows selected', () => {
      render(
        <TkxDataGrid
          columns={columns}
          data={data}
          rowKey="id"
          selectable
          selectedRows={['1']}
        />,
        { wrapper: Wrapper },
      );
      const headerCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement;
      expect(headerCheckbox.indeterminate).toBe(true);
      expect(headerCheckbox.checked).toBe(false);
    });

    it('onSelectionChange fires with correct row IDs when toggling a row', () => {
      const onSelectionChange = vi.fn();
      render(
        <TkxDataGrid
          columns={columns}
          data={data}
          rowKey="id"
          selectable
          selectedRows={[]}
          onSelectionChange={onSelectionChange}
        />,
        { wrapper: Wrapper },
      );
      // Click Bob's row checkbox by aria-label
      fireEvent.click(screen.getByLabelText('Select row 2'));
      expect(onSelectionChange).toHaveBeenCalledWith(['2']);
    });
  });

  // ── CSV Export ─────────────────────────────────────────────────────────────

  describe('CSV export', () => {
    let createObjectURLSpy: ReturnType<typeof vi.fn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
    let clickSpy: ReturnType<typeof vi.spyOn>;
    let anchorHrefs: string[];
    let anchorDownloads: string[];
    let blobContents: string[];

    beforeEach(() => {
      anchorHrefs = [];
      anchorDownloads = [];
      blobContents = [];

      createObjectURLSpy = vi.fn((blob: Blob) => {
        // Read the blob contents synchronously via the constructor parts
        // Note: Blob.text() is async; we hook into Blob construction instead.
        return 'blob:mock-url';
      });
      revokeObjectURLSpy = vi.fn();
      (URL as any).createObjectURL = createObjectURLSpy;
      (URL as any).revokeObjectURL = revokeObjectURLSpy;

      // Intercept Blob to capture CSV content
      const RealBlob = global.Blob;
      (global as any).Blob = class extends RealBlob {
        constructor(parts: BlobPart[], opts?: BlobPropertyBag) {
          super(parts, opts);
          blobContents.push(parts.map(p => String(p)).join(''));
        }
      };

      clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
        anchorHrefs.push(this.href);
        anchorDownloads.push(this.download);
      });
    });

    afterEach(() => {
      clickSpy.mockRestore();
      delete (URL as any).createObjectURL;
      delete (URL as any).revokeObjectURL;
    });

    it('renders an Export CSV button when showExport is true', () => {
      render(
        <TkxDataGrid columns={columns} data={data} rowKey="id" showExport />,
        { wrapper: Wrapper },
      );
      expect(screen.getByRole('button', { name: /Export.*CSV/i })).toBeInTheDocument();
    });

    it('CSV content escapes commas, quotes, and newlines per RFC 4180', () => {
      const trickyData = [
        { id: '1', name: 'Smith, John', age: 30 },
        { id: '2', name: 'Quote "inside"', age: 25 },
        { id: '3', name: 'Multi\nLine', age: 40 },
      ];
      render(
        <TkxDataGrid columns={columns} data={trickyData} rowKey="id" showExport />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByRole('button', { name: /Export.*CSV/i }));

      expect(blobContents.length).toBeGreaterThan(0);
      const csv = blobContents[blobContents.length - 1];
      // Comma → quoted
      expect(csv).toContain('"Smith, John"');
      // Quote → doubled
      expect(csv).toContain('"Quote ""inside"""');
      // Newline → quoted
      expect(csv).toContain('"Multi\nLine"');
      // Header line present
      expect(csv.startsWith('Name,Age')).toBe(true);
    });

    it('exported filename uses exportFileName prop', () => {
      render(
        <TkxDataGrid
          columns={columns}
          data={data}
          rowKey="id"
          showExport
          exportFileName="my-users"
        />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByRole('button', { name: /Export.*CSV/i }));
      expect(anchorDownloads).toContain('my-users.csv');
    });
  });

  // ── Keyboard / ARIA ────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('renders grid role with row and gridcell roles', () => {
      render(<TkxDataGrid columns={columns} data={data} rowKey="id" />, { wrapper: Wrapper });
      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
      expect(screen.getAllByRole('gridcell').length).toBeGreaterThan(0);
      expect(screen.getAllByRole('columnheader').length).toBe(columns.length);
    });

    it('sort headers expose aria-sort reflecting current state', () => {
      const cols: DataGridColumn<Row>[] = [
        { key: 'name', header: 'Name', sortable: true },
      ];
      render(<TkxDataGrid columns={cols} data={data} rowKey="id" sortable />, { wrapper: Wrapper });
      const header = screen.getByRole('columnheader', { name: /Name/i });
      // initial: sortable but unsorted → "none"
      expect(header).toHaveAttribute('aria-sort', 'none');
      fireEvent.click(header);
      expect(header).toHaveAttribute('aria-sort', 'ascending');
      fireEvent.click(header);
      expect(header).toHaveAttribute('aria-sort', 'descending');
    });

    it('selected rows expose aria-selected="true"', () => {
      render(
        <TkxDataGrid
          columns={columns}
          data={data}
          rowKey="id"
          selectable
          selectedRows={['1']}
        />,
        { wrapper: Wrapper },
      );
      const allRows = screen.getAllByRole('row');
      const dataRows = allRows.filter(r => within(r).queryAllByRole('gridcell').length > 0);
      // Row for id=1 should be selected; row for id=2 should not
      const selected = dataRows.filter(r => r.getAttribute('aria-selected') === 'true');
      const unselected = dataRows.filter(r => r.getAttribute('aria-selected') === 'false');
      expect(selected).toHaveLength(1);
      expect(unselected).toHaveLength(1);
    });
  });

  // ── Column pinning ─────────────────────────────────────────────────────────

  describe('column pinning', () => {
    interface PRow { id: string; first: string; second: string; third: string; }
    const pData: PRow[] = [
      { id: '1', first: 'a1', second: 'b1', third: 'c1' },
      { id: '2', first: 'a2', second: 'b2', third: 'c2' },
    ];

    /**
     * Find a header <th> cell by its visible text. screen.getByRole avoids
     * accidentally matching filter inputs.
     */
    function getHeader(name: string): HTMLElement {
      return screen.getByRole('columnheader', { name: new RegExp(name, 'i') });
    }

    it('column with pinned: left renders position: sticky and left: 0px', () => {
      const cols: DataGridColumn<PRow>[] = [
        { key: 'first', header: 'First', pinned: 'left', width: 100 },
        { key: 'second', header: 'Second' },
      ];
      render(<TkxDataGrid columns={cols} data={pData} rowKey="id" />, { wrapper: Wrapper });
      const header = getHeader('First');
      expect(header.style.position).toBe('sticky');
      expect(header.style.left).toBe('0px');
      // Logical DOM order preserved
      const allHeaders = screen.getAllByRole('columnheader');
      expect(allHeaders[0].textContent).toContain('First');
      expect(allHeaders[1].textContent).toContain('Second');
    });

    it('two columns pinned left compute cumulative offset from explicit width', () => {
      const cols: DataGridColumn<PRow>[] = [
        { key: 'first', header: 'First', pinned: 'left', width: 120 },
        { key: 'second', header: 'Second', pinned: 'left', width: 80 },
        { key: 'third', header: 'Third' },
      ];
      render(<TkxDataGrid columns={cols} data={pData} rowKey="id" />, { wrapper: Wrapper });
      const first = getHeader('First');
      const second = getHeader('Second');
      expect(first.style.left).toBe('0px');
      // Second pinned-left column offsets by the width of First (120px)
      expect(second.style.left).toBe('120px');
    });

    it('column with pinned: right renders position: sticky and right: 0px', () => {
      const cols: DataGridColumn<PRow>[] = [
        { key: 'first', header: 'First' },
        { key: 'second', header: 'Second', pinned: 'right', width: 100 },
      ];
      render(<TkxDataGrid columns={cols} data={pData} rowKey="id" />, { wrapper: Wrapper });
      const header = getHeader('Second');
      expect(header.style.position).toBe('sticky');
      expect(header.style.right).toBe('0px');
    });

    it('pinned columns keep DOM order matching logical column order (a11y)', () => {
      const cols: DataGridColumn<PRow>[] = [
        { key: 'first', header: 'First' },
        { key: 'second', header: 'Second', pinned: 'left', width: 100 },
        { key: 'third', header: 'Third', pinned: 'right', width: 100 },
      ];
      render(<TkxDataGrid columns={cols} data={pData} rowKey="id" />, { wrapper: Wrapper });
      const headers = screen.getAllByRole('columnheader');
      // DOM order must match the columns[] array order even though pinned
      // columns visually float to the edges via CSS sticky.
      expect(headers[0].textContent).toContain('First');
      expect(headers[1].textContent).toContain('Second');
      expect(headers[2].textContent).toContain('Third');
    });

    it('sort still works when clicking a pinned column header', () => {
      const sortData: PRow[] = [
        { id: '1', first: 'b', second: 'x', third: 'x' },
        { id: '2', first: 'a', second: 'y', third: 'y' },
      ];
      const cols: DataGridColumn<PRow>[] = [
        { key: 'first', header: 'First', sortable: true, pinned: 'left', width: 100 },
        { key: 'second', header: 'Second' },
      ];
      render(<TkxDataGrid columns={cols} data={sortData} rowKey="id" sortable />, { wrapper: Wrapper });
      const header = getHeader('First');
      fireEvent.click(header);
      expect(header).toHaveAttribute('aria-sort', 'ascending');
      const cells = screen.getAllByRole('gridcell').map(c => c.textContent);
      // first cell of first data row should be 'a' after asc sort
      expect(cells[0]).toBe('a');
    });

    it('row selection still works when the grid has pinned columns', () => {
      const onSelectionChange = vi.fn();
      const cols: DataGridColumn<PRow>[] = [
        { key: 'first', header: 'First', pinned: 'left', width: 100 },
        { key: 'second', header: 'Second' },
      ];
      render(
        <TkxDataGrid
          columns={cols}
          data={pData}
          rowKey="id"
          selectable
          selectedRows={[]}
          onSelectionChange={onSelectionChange}
        />,
        { wrapper: Wrapper },
      );
      fireEvent.click(screen.getByLabelText('Select row 2'));
      expect(onSelectionChange).toHaveBeenCalledWith(['2']);
    });

    it('CSV export includes pinned columns in their logical (column-array) order, not reordered', () => {
      // Set up Blob capture inline — this test sits outside the outer
      // CSV describe block so it doesn't share the beforeEach there.
      const blobContents: string[] = [];
      const RealBlob = global.Blob;
      (global as any).Blob = class extends RealBlob {
        constructor(parts: BlobPart[], opts?: BlobPropertyBag) {
          super(parts, opts);
          blobContents.push(parts.map(p => String(p)).join(''));
        }
      };
      (URL as any).createObjectURL = vi.fn(() => 'blob:mock');
      (URL as any).revokeObjectURL = vi.fn();
      const clickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => {});

      try {
        const cols: DataGridColumn<PRow>[] = [
          { key: 'first', header: 'First' },
          { key: 'second', header: 'Second', pinned: 'left', width: 100 },
          { key: 'third', header: 'Third', pinned: 'right', width: 100 },
        ];
        render(
          <TkxDataGrid columns={cols} data={pData} rowKey="id" showExport />,
          { wrapper: Wrapper },
        );
        fireEvent.click(screen.getByRole('button', { name: /Export.*CSV/i }));
        const csv = blobContents[blobContents.length - 1];
        // Header line must match the column-array order, NOT pinned-first
        expect(csv.split('\n')[0]).toBe('First,Second,Third');
        // First data row must be 'a1,b1,c1' (logical, not visually reordered)
        expect(csv.split('\n')[1]).toBe('a1,b1,c1');
      } finally {
        (global as any).Blob = RealBlob;
        delete (URL as any).createObjectURL;
        delete (URL as any).revokeObjectURL;
        clickSpy.mockRestore();
      }
    });

    it('data-scrolled-left attribute appears on scroll container after horizontal scroll', () => {
      const cols: DataGridColumn<PRow>[] = [
        { key: 'first', header: 'First', pinned: 'left', width: 100 },
        { key: 'second', header: 'Second' },
        { key: 'third', header: 'Third' },
      ];
      const { container } = render(
        <TkxDataGrid columns={cols} data={pData} rowKey="id" />,
        { wrapper: Wrapper },
      );
      // The scroll container is the inner div with overflowX: auto. Find it
      // by walking the grid's children — it is the one with onScroll wired.
      const scrollDiv = container.querySelector(
        'div[role="grid"] > div:not([role])',
      ) as HTMLElement | null;
      expect(scrollDiv).not.toBeNull();
      // Initially scrollLeft is 0, so no data-scrolled-left attribute
      expect(scrollDiv!.hasAttribute('data-scrolled-left')).toBe(false);

      // Simulate the user scrolling horizontally: jsdom does not lay out so
      // we mock scrollLeft/scrollWidth/clientWidth, then fire a scroll event
      // and flush the rAF the component uses to throttle updates.
      Object.defineProperty(scrollDiv, 'scrollLeft', { configurable: true, value: 50 });
      Object.defineProperty(scrollDiv, 'scrollWidth', { configurable: true, value: 1000 });
      Object.defineProperty(scrollDiv, 'clientWidth', { configurable: true, value: 200 });

      // Flush rAF synchronously
      const rafSpy = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((cb: FrameRequestCallback): number => {
          cb(0);
          return 0;
        });

      fireEvent.scroll(scrollDiv!);
      expect(scrollDiv!.hasAttribute('data-scrolled-left')).toBe(true);
      rafSpy.mockRestore();
    });
  });

  // ── Row grouping + aggregations ────────────────────────────────────────────

  describe('row grouping', () => {
    interface GRow {
      id: string;
      name: string;
      category: string;
      price: number;
    }
    const gData: GRow[] = [
      { id: '1', name: 'Phone', category: 'Electronics', price: 600 },
      { id: '2', name: 'Laptop', category: 'Electronics', price: 1200 },
      { id: '3', name: 'TV', category: 'Electronics', price: 800 },
      { id: '4', name: 'Shirt', category: 'Clothing', price: 30 },
      { id: '5', name: 'Pants', category: 'Clothing', price: 50 },
    ];
    const baseCols: DataGridColumn<GRow>[] = [
      { key: 'category', header: 'Category' },
      { key: 'name', header: 'Name' },
      { key: 'price', header: 'Price' },
    ];

    function getGroupRows(): HTMLElement[] {
      // Group header rows carry data-group-row="" via the component.
      return Array.from(document.querySelectorAll('[data-group-row]')) as HTMLElement[];
    }
    function getDetailRows(): HTMLElement[] {
      // Detail rows under a group carry data-group-key but NOT data-group-row.
      return Array.from(
        document.querySelectorAll('tr[data-group-key]:not([data-group-row])'),
      ) as HTMLElement[];
    }

    it('groupBy="category" renders one group header per distinct value with correct row counts', () => {
      render(
        <TkxDataGrid columns={baseCols} data={gData} rowKey="id" groupBy="category" />,
        { wrapper: Wrapper },
      );
      const groupRows = getGroupRows();
      expect(groupRows.length).toBe(2);
      const text = groupRows.map(r => r.textContent || '').join(' | ');
      expect(text).toContain('Electronics');
      expect(text).toContain('3 rows');
      expect(text).toContain('Clothing');
      expect(text).toContain('2 rows');
    });

    it('clicking a group header collapses the group (detail rows leave the DOM)', () => {
      render(
        <TkxDataGrid columns={baseCols} data={gData} rowKey="id" groupBy="category" />,
        { wrapper: Wrapper },
      );
      expect(getDetailRows().length).toBe(5);
      const electronicsHeader = getGroupRows().find(r =>
        (r.textContent || '').includes('Electronics'),
      )!;
      fireEvent.click(electronicsHeader);
      // 3 electronics rows gone; 2 clothing rows remain
      expect(getDetailRows().length).toBe(2);
    });

    it('clicking a collapsed group header re-expands it', () => {
      render(
        <TkxDataGrid
          columns={baseCols}
          data={gData}
          rowKey="id"
          groupBy="category"
          defaultExpandedGroups="none"
        />,
        { wrapper: Wrapper },
      );
      expect(getDetailRows().length).toBe(0);
      const electronicsHeader = getGroupRows().find(r =>
        (r.textContent || '').includes('Electronics'),
      )!;
      fireEvent.click(electronicsHeader);
      expect(getDetailRows().length).toBe(3);
    });

    it("aggregate: 'sum' renders sum of numeric column in the group header", () => {
      const cols: DataGridColumn<GRow>[] = [
        { key: 'category', header: 'Category' },
        { key: 'name', header: 'Name' },
        { key: 'price', header: 'Price', aggregate: 'sum' },
      ];
      render(
        <TkxDataGrid columns={cols} data={gData} rowKey="id" groupBy="category" />,
        { wrapper: Wrapper },
      );
      const electronicsHeader = getGroupRows().find(r =>
        (r.textContent || '').includes('Electronics'),
      )!;
      // 600 + 1200 + 800 = 2600
      expect(electronicsHeader.textContent).toContain('2600');
    });

    it("aggregate: 'avg' renders average", () => {
      const cols: DataGridColumn<GRow>[] = [
        { key: 'category', header: 'Category' },
        { key: 'price', header: 'Price', aggregate: 'avg' },
      ];
      render(
        <TkxDataGrid columns={cols} data={gData} rowKey="id" groupBy="category" />,
        { wrapper: Wrapper },
      );
      const clothingHeader = getGroupRows().find(r =>
        (r.textContent || '').includes('Clothing'),
      )!;
      // (30 + 50) / 2 = 40
      expect(clothingHeader.textContent).toContain('40');
    });

    it("aggregate: 'count' works on non-numeric columns", () => {
      const cols: DataGridColumn<GRow>[] = [
        { key: 'category', header: 'Category' },
        { key: 'name', header: 'Name', aggregate: 'count' },
      ];
      render(
        <TkxDataGrid columns={cols} data={gData} rowKey="id" groupBy="category" />,
        { wrapper: Wrapper },
      );
      const electronicsHeader = getGroupRows().find(r =>
        (r.textContent || '').includes('Electronics'),
      )!;
      // Count aggregate cell rendered in the Name column → '3'
      const nameAgg = electronicsHeader.querySelector('[data-group-agg="name"]');
      expect(nameAgg?.textContent).toBe('3');
    });

    it("aggregate: 'min' and 'max' both work", () => {
      const cols: DataGridColumn<GRow>[] = [
        { key: 'category', header: 'Category' },
        { key: 'price', header: 'Price', aggregate: 'min' },
      ];
      const { rerender } = render(
        <TkxDataGrid columns={cols} data={gData} rowKey="id" groupBy="category" />,
        { wrapper: Wrapper },
      );
      let electronicsHeader = getGroupRows().find(r =>
        (r.textContent || '').includes('Electronics'),
      )!;
      expect(electronicsHeader.querySelector('[data-group-agg="price"]')?.textContent).toBe('600');

      rerender(
        <Wrapper>
          <TkxDataGrid
            columns={[
              { key: 'category', header: 'Category' },
              { key: 'price', header: 'Price', aggregate: 'max' },
            ]}
            data={gData}
            rowKey="id"
            groupBy="category"
          />
        </Wrapper>,
      );
      electronicsHeader = getGroupRows().find(r =>
        (r.textContent || '').includes('Electronics'),
      )!;
      expect(electronicsHeader.querySelector('[data-group-agg="price"]')?.textContent).toBe('1200');
    });

    it('custom aggregate function runs and its result renders', () => {
      const cols: DataGridColumn<GRow>[] = [
        { key: 'category', header: 'Category' },
        { key: 'price', header: 'Price', aggregate: (rows) => `~$${rows.length * 100}` },
      ];
      render(
        <TkxDataGrid columns={cols} data={gData} rowKey="id" groupBy="category" />,
        { wrapper: Wrapper },
      );
      const electronicsHeader = getGroupRows().find(r =>
        (r.textContent || '').includes('Electronics'),
      )!;
      expect(electronicsHeader.querySelector('[data-group-agg="price"]')?.textContent).toBe('~$300');
    });

    it('defaultExpandedGroups="none" starts everything collapsed', () => {
      render(
        <TkxDataGrid
          columns={baseCols}
          data={gData}
          rowKey="id"
          groupBy="category"
          defaultExpandedGroups="none"
        />,
        { wrapper: Wrapper },
      );
      expect(getGroupRows().length).toBe(2);
      expect(getDetailRows().length).toBe(0);
    });

    it('defaultExpandedGroups=["Electronics"] starts only that group expanded', () => {
      render(
        <TkxDataGrid
          columns={baseCols}
          data={gData}
          rowKey="id"
          groupBy="category"
          defaultExpandedGroups={['Electronics']}
        />,
        { wrapper: Wrapper },
      );
      // Only the 3 Electronics rows are rendered as details
      expect(getDetailRows().length).toBe(3);
    });

    it('onGroupToggle fires with (key, expanded) when a group is toggled', () => {
      const onGroupToggle = vi.fn();
      render(
        <TkxDataGrid
          columns={baseCols}
          data={gData}
          rowKey="id"
          groupBy="category"
          onGroupToggle={onGroupToggle}
        />,
        { wrapper: Wrapper },
      );
      const electronicsHeader = getGroupRows().find(r =>
        (r.textContent || '').includes('Electronics'),
      )!;
      fireEvent.click(electronicsHeader);
      expect(onGroupToggle).toHaveBeenCalledWith('Electronics', false);
      fireEvent.click(electronicsHeader);
      expect(onGroupToggle).toHaveBeenLastCalledWith('Electronics', true);
    });

    it('aria-expanded on the disclosure cell reflects state', () => {
      render(
        <TkxDataGrid
          columns={baseCols}
          data={gData}
          rowKey="id"
          groupBy="category"
        />,
        { wrapper: Wrapper },
      );
      const electronicsHeader = getGroupRows().find(r =>
        (r.textContent || '').includes('Electronics'),
      )!;
      const disclosure = electronicsHeader.querySelector('[aria-expanded]');
      expect(disclosure).not.toBeNull();
      expect(disclosure!.getAttribute('aria-expanded')).toBe('true');
      fireEvent.click(electronicsHeader);
      const after = electronicsHeader.querySelector('[aria-expanded]');
      expect(after!.getAttribute('aria-expanded')).toBe('false');
    });

    it('CSV export skips group headers — only detail rows are exported', () => {
      const blobContents: string[] = [];
      const RealBlob = global.Blob;
      (global as any).Blob = class extends RealBlob {
        constructor(parts: BlobPart[], opts?: BlobPropertyBag) {
          super(parts, opts);
          blobContents.push(parts.map(p => String(p)).join(''));
        }
      };
      (URL as any).createObjectURL = vi.fn(() => 'blob:mock');
      (URL as any).revokeObjectURL = vi.fn();
      const clickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => {});
      try {
        render(
          <TkxDataGrid
            columns={baseCols}
            data={gData}
            rowKey="id"
            groupBy="category"
            showExport
          />,
          { wrapper: Wrapper },
        );
        fireEvent.click(screen.getByRole('button', { name: /Export.*CSV/i }));
        const csv = blobContents[blobContents.length - 1];
        const lines = csv.split('\n');
        // 1 header line + 5 data rows, no group separator lines
        expect(lines.length).toBe(6);
        expect(lines[0]).toBe('Category,Name,Price');
        // "(3 rows)" or similar group-header text must NOT appear anywhere
        expect(csv).not.toContain('rows)');
      } finally {
        (global as any).Blob = RealBlob;
        delete (URL as any).createObjectURL;
        delete (URL as any).revokeObjectURL;
        clickSpy.mockRestore();
      }
    });

    it('groupBy + filter compose: only matching rows appear inside groups', () => {
      const cols: DataGridColumn<GRow>[] = [
        { key: 'category', header: 'Category' },
        { key: 'name', header: 'Name', filterable: true },
        { key: 'price', header: 'Price' },
      ];
      render(
        <TkxDataGrid columns={cols} data={gData} rowKey="id" groupBy="category" />,
        { wrapper: Wrapper },
      );
      fireEvent.change(screen.getByLabelText('Filter by Name'), { target: { value: 'phone' } });
      // Only Electronics group survives, with 1 row
      const groupRows = getGroupRows();
      expect(groupRows.length).toBe(1);
      expect(groupRows[0].textContent).toContain('Electronics');
      expect(groupRows[0].textContent).toContain('1 row');
      expect(getDetailRows().length).toBe(1);
    });

    it('groupBy referencing a non-existent column logs a warning and renders ungrouped', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <TkxDataGrid columns={baseCols} data={gData} rowKey="id" groupBy="bogus" />,
        { wrapper: Wrapper },
      );
      // No group rows rendered
      expect(getGroupRows().length).toBe(0);
      // But all data rows still rendered
      const allRows = screen.getAllByRole('row');
      const dataRows = allRows.filter(r => within(r).queryAllByRole('gridcell').length > 0);
      expect(dataRows.length).toBe(5);
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it('column pinning still works under grouping (pinned column DOM order preserved)', () => {
      const cols: DataGridColumn<GRow>[] = [
        { key: 'category', header: 'Category' },
        { key: 'name', header: 'Name', pinned: 'left', width: 100 },
        { key: 'price', header: 'Price' },
      ];
      render(
        <TkxDataGrid columns={cols} data={gData} rowKey="id" groupBy="category" />,
        { wrapper: Wrapper },
      );
      // Header order matches column order
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0].textContent).toContain('Category');
      expect(headers[1].textContent).toContain('Name');
      expect(headers[2].textContent).toContain('Price');
      // Group rows render and pinned-name cell still has data-pinned attr
      const groupRow = getGroupRows()[0];
      const pinnedCell = groupRow.querySelector('td[data-pinned="left"]');
      expect(pinnedCell).not.toBeNull();
    });
  });

  // ── Cell editing ───────────────────────────────────────────────────────────

  describe('cell editing', () => {
    interface ERow {
      id: string;
      name: string;
      age: number;
      role: string;
      locked?: boolean;
    }
    const eData: ERow[] = [
      { id: '1', name: 'Alice', age: 30, role: 'admin' },
      { id: '2', name: 'Bob', age: 25, role: 'user' },
    ];

    function getCellByText(text: string): HTMLElement {
      // Walks gridcells and finds one containing the supplied text. Avoids
      // false matches against header cells.
      const cells = screen.getAllByRole('gridcell');
      const found = cells.find(c => (c.textContent || '').trim() === text);
      if (!found) throw new Error(`No cell with exact text "${text}"`);
      return found;
    }

    it('column without `editable` does not enter edit mode on double-click', () => {
      const cols: DataGridColumn<ERow>[] = [
        { key: 'name', header: 'Name' },
        { key: 'age', header: 'Age' },
      ];
      render(
        <TkxDataGrid columns={cols} data={eData} rowKey="id" />,
        { wrapper: Wrapper },
      );
      const cell = getCellByText('Alice');
      fireEvent.doubleClick(cell);
      // No editor input should appear
      expect(screen.queryByLabelText('Edit Name')).not.toBeInTheDocument();
    });

    it('column with editable: true enters edit mode on double-click', () => {
      const cols: DataGridColumn<ERow>[] = [
        { key: 'name', header: 'Name', editable: true },
      ];
      render(
        <TkxDataGrid columns={cols} data={eData} rowKey="id" />,
        { wrapper: Wrapper },
      );
      fireEvent.doubleClick(getCellByText('Alice'));
      const input = screen.getByLabelText('Edit Name') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('Alice');
    });

    it('editing + Enter commits and fires onCellEdit with correct args', () => {
      const onCellEdit = vi.fn();
      const cols: DataGridColumn<ERow>[] = [
        { key: 'name', header: 'Name', editable: true },
      ];
      render(
        <TkxDataGrid
          columns={cols}
          data={eData}
          rowKey="id"
          onCellEdit={onCellEdit}
        />,
        { wrapper: Wrapper },
      );
      fireEvent.doubleClick(getCellByText('Alice'));
      const input = screen.getByLabelText('Edit Name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Alicia' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onCellEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          rowId: '1',
          columnKey: 'name',
          newValue: 'Alicia',
          oldValue: 'Alice',
        }),
      );
      // Editor leaves the DOM
      expect(screen.queryByLabelText('Edit Name')).not.toBeInTheDocument();
    });

    it('editing + Escape cancels, fires onCellEditCancel, cell text reverts', () => {
      const onCellEdit = vi.fn();
      const onCellEditCancel = vi.fn();
      const cols: DataGridColumn<ERow>[] = [
        { key: 'name', header: 'Name', editable: true },
      ];
      render(
        <TkxDataGrid
          columns={cols}
          data={eData}
          rowKey="id"
          onCellEdit={onCellEdit}
          onCellEditCancel={onCellEditCancel}
        />,
        { wrapper: Wrapper },
      );
      fireEvent.doubleClick(getCellByText('Alice'));
      const input = screen.getByLabelText('Edit Name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Bogus' } });
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onCellEditCancel).toHaveBeenCalledWith(
        expect.objectContaining({ rowId: '1', columnKey: 'name' }),
      );
      expect(onCellEdit).not.toHaveBeenCalled();
      // Original text still visible
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('blur commits the edit (same as Enter)', () => {
      const onCellEdit = vi.fn();
      const cols: DataGridColumn<ERow>[] = [
        { key: 'name', header: 'Name', editable: true },
      ];
      render(
        <TkxDataGrid
          columns={cols}
          data={eData}
          rowKey="id"
          onCellEdit={onCellEdit}
        />,
        { wrapper: Wrapper },
      );
      fireEvent.doubleClick(getCellByText('Alice'));
      const input = screen.getByLabelText('Edit Name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Allison' } });
      fireEvent.blur(input);
      expect(onCellEdit).toHaveBeenCalledWith(
        expect.objectContaining({ newValue: 'Allison', oldValue: 'Alice' }),
      );
    });

    it('validateCell returning a string blocks commit and shows error message', () => {
      const onCellEdit = vi.fn();
      const cols: DataGridColumn<ERow>[] = [
        {
          key: 'name',
          header: 'Name',
          editable: true,
          validateCell: (v: any) => (String(v).length < 2 ? 'Too short' : null),
        },
      ];
      render(
        <TkxDataGrid
          columns={cols}
          data={eData}
          rowKey="id"
          onCellEdit={onCellEdit}
        />,
        { wrapper: Wrapper },
      );
      fireEvent.doubleClick(getCellByText('Alice'));
      const input = screen.getByLabelText('Edit Name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'X' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      // Editor remains, onCellEdit not called, error visible
      expect(onCellEdit).not.toHaveBeenCalled();
      expect(screen.getByLabelText('Edit Name')).toBeInTheDocument();
      expect(screen.getByRole('alert').textContent).toBe('Too short');
    });

    it('number editor renders type="number"', () => {
      const cols: DataGridColumn<ERow>[] = [
        { key: 'age', header: 'Age', editable: true, editor: 'number' },
      ];
      render(
        <TkxDataGrid columns={cols} data={eData} rowKey="id" />,
        { wrapper: Wrapper },
      );
      fireEvent.doubleClick(getCellByText('30'));
      const input = screen.getByLabelText('Edit Age') as HTMLInputElement;
      expect(input.type).toBe('number');
    });

    it('select editor renders a <select> with supplied options', () => {
      const cols: DataGridColumn<ERow>[] = [
        {
          key: 'role',
          header: 'Role',
          editable: true,
          editor: 'select',
          editorOptions: {
            options: [
              { value: 'admin', label: 'Administrator' },
              { value: 'user', label: 'User' },
            ],
          },
        },
      ];
      render(
        <TkxDataGrid columns={cols} data={eData} rowKey="id" />,
        { wrapper: Wrapper },
      );
      fireEvent.doubleClick(getCellByText('admin'));
      const select = screen.getByLabelText('Edit Role') as HTMLSelectElement;
      expect(select.tagName).toBe('SELECT');
      expect(select.querySelectorAll('option').length).toBe(2);
      expect(select.value).toBe('admin');
    });

    it('custom editor function receives onCommit/onCancel callbacks', () => {
      const onCellEdit = vi.fn();
      const cols: DataGridColumn<ERow>[] = [
        {
          key: 'name',
          header: 'Name',
          editable: true,
          editor: ({ value, onCommit, onCancel }) => (
            <div>
              <button onClick={() => onCommit(`${value}!`)}>commit-custom</button>
              <button onClick={onCancel}>cancel-custom</button>
            </div>
          ),
        },
      ];
      render(
        <TkxDataGrid
          columns={cols}
          data={eData}
          rowKey="id"
          onCellEdit={onCellEdit}
        />,
        { wrapper: Wrapper },
      );
      fireEvent.doubleClick(getCellByText('Alice'));
      fireEvent.click(screen.getByText('commit-custom'));
      expect(onCellEdit).toHaveBeenCalledWith(
        expect.objectContaining({ newValue: 'Alice!' }),
      );
    });

    it('editable predicate disables editing for rows that fail it', () => {
      const lockedData: ERow[] = [
        { id: '1', name: 'Alice', age: 30, role: 'admin', locked: false },
        { id: '2', name: 'Bob', age: 25, role: 'user', locked: true },
      ];
      const cols: DataGridColumn<ERow>[] = [
        {
          key: 'name',
          header: 'Name',
          editable: (row: ERow) => row.locked === false,
        },
      ];
      render(
        <TkxDataGrid columns={cols} data={lockedData} rowKey="id" />,
        { wrapper: Wrapper },
      );
      // Alice (unlocked) → editor appears
      fireEvent.doubleClick(getCellByText('Alice'));
      expect(screen.getByLabelText('Edit Name')).toBeInTheDocument();
      // Cancel out
      fireEvent.keyDown(screen.getByLabelText('Edit Name'), { key: 'Escape' });
      // Bob (locked) → no editor
      fireEvent.doubleClick(getCellByText('Bob'));
      expect(screen.queryByLabelText('Edit Name')).not.toBeInTheDocument();
    });

    it('editing a pinned column still opens the editor inside the sticky cell', () => {
      const cols: DataGridColumn<ERow>[] = [
        {
          key: 'name',
          header: 'Name',
          editable: true,
          pinned: 'left',
          width: 100,
        },
        { key: 'age', header: 'Age' },
      ];
      render(
        <TkxDataGrid columns={cols} data={eData} rowKey="id" />,
        { wrapper: Wrapper },
      );
      const cell = getCellByText('Alice');
      // Sanity: cell is sticky-positioned (pinned)
      expect(cell.getAttribute('data-pinned')).toBe('left');
      fireEvent.doubleClick(cell);
      const input = screen.getByLabelText('Edit Name');
      // Editor lives inside the same sticky <td>
      expect(cell.contains(input)).toBe(true);
    });

    it('group header rows cannot be edited (double-click is a no-op for editor)', () => {
      interface PRow { id: string; category: string; name: string; }
      const pData: PRow[] = [
        { id: '1', category: 'A', name: 'one' },
        { id: '2', category: 'A', name: 'two' },
      ];
      const cols: DataGridColumn<PRow>[] = [
        { key: 'category', header: 'Category' },
        // Name column is editable on detail rows
        { key: 'name', header: 'Name', editable: true },
      ];
      render(
        <TkxDataGrid
          columns={cols}
          data={pData}
          rowKey="id"
          groupBy="category"
        />,
        { wrapper: Wrapper },
      );
      // Group header carries data-group-row. Double-click anywhere on it
      // should NOT open an editor (it toggles collapse instead).
      const groupRow = document.querySelector('[data-group-row]') as HTMLElement;
      expect(groupRow).not.toBeNull();
      // Find the cell inside the group header that aligns with the editable
      // column. It's a rowheader/gridcell within the group <tr>, NOT a real
      // editable cell.
      fireEvent.doubleClick(groupRow);
      expect(screen.queryByLabelText('Edit Name')).not.toBeInTheDocument();
    });

    it('onCellEdit returning a Promise shows a saving state until resolved', async () => {
      let resolveFn: () => void = () => {};
      const onCellEdit = vi.fn(
        () =>
          new Promise<void>(r => {
            resolveFn = r;
          }),
      );
      const cols: DataGridColumn<ERow>[] = [
        { key: 'name', header: 'Name', editable: true },
      ];
      render(
        <TkxDataGrid
          columns={cols}
          data={eData}
          rowKey="id"
          onCellEdit={onCellEdit}
        />,
        { wrapper: Wrapper },
      );
      fireEvent.doubleClick(getCellByText('Alice'));
      const input = screen.getByLabelText('Edit Name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Allison' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      // While the promise is pending, the cell carries data-saving
      const savingCell = document.querySelector('td[data-saving]');
      expect(savingCell).not.toBeNull();
      // Resolve and flush microtasks inside act so React commits the state
      // update before the assertion.
      await act(async () => {
        resolveFn();
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(document.querySelector('td[data-saving]')).toBeNull();
    });

    it('editor input has aria-label="Edit {header}"', () => {
      const cols: DataGridColumn<ERow>[] = [
        { key: 'name', header: 'Full Name', editable: true },
      ];
      render(
        <TkxDataGrid columns={cols} data={eData} rowKey="id" />,
        { wrapper: Wrapper },
      );
      fireEvent.doubleClick(getCellByText('Alice'));
      expect(screen.getByLabelText('Edit Full Name')).toBeInTheDocument();
    });

    it('F2 on a focused editable cell enters edit mode', () => {
      const cols: DataGridColumn<ERow>[] = [
        { key: 'name', header: 'Name', editable: true },
      ];
      render(
        <TkxDataGrid columns={cols} data={eData} rowKey="id" />,
        { wrapper: Wrapper },
      );
      const cell = getCellByText('Alice');
      // Editable cells get tabIndex=0
      expect(cell.getAttribute('tabindex')).toBe('0');
      fireEvent.keyDown(cell, { key: 'F2' });
      expect(screen.getByLabelText('Edit Name')).toBeInTheDocument();
    });

    it('editable cell has aria-readonly="false"', () => {
      const cols: DataGridColumn<ERow>[] = [
        { key: 'name', header: 'Name', editable: true },
        { key: 'age', header: 'Age' },
      ];
      render(
        <TkxDataGrid columns={cols} data={eData} rowKey="id" />,
        { wrapper: Wrapper },
      );
      const editableCell = getCellByText('Alice');
      const readOnlyCell = getCellByText('30');
      expect(editableCell.getAttribute('aria-readonly')).toBe('false');
      expect(readOnlyCell.hasAttribute('aria-readonly')).toBe(false);
    });
  });

  // ── Tree data ──────────────────────────────────────────────────────────────

  describe('tree data', () => {
    interface TRow {
      id: string;
      name: string;
      size: number;
      children?: TRow[];
    }
    const tData: TRow[] = [
      {
        id: 'root-1',
        name: 'docs',
        size: 0,
        children: [
          { id: 'leaf-1', name: 'README.md', size: 12 },
          {
            id: 'sub-1',
            name: 'guides',
            size: 0,
            children: [
              { id: 'leaf-2', name: 'intro.md', size: 8 },
              { id: 'leaf-3', name: 'advanced.md', size: 15 },
            ],
          },
        ],
      },
      {
        id: 'root-2',
        name: 'src',
        size: 0,
        children: [{ id: 'leaf-4', name: 'index.ts', size: 5 }],
      },
    ];
    const tCols: DataGridColumn<TRow>[] = [
      { key: 'name', header: 'Name', tree: true },
      { key: 'size', header: 'Size' },
    ];

    function getTreeRows(): HTMLElement[] {
      return Array.from(document.querySelectorAll('[data-tree-row]')) as HTMLElement[];
    }
    function getCarets(): HTMLElement[] {
      return Array.from(document.querySelectorAll('[data-tree-caret]')) as HTMLElement[];
    }
    function getLeafPlaceholders(): HTMLElement[] {
      return Array.from(document.querySelectorAll('[data-tree-leaf]')) as HTMLElement[];
    }

    it('parent rows render a disclosure caret', () => {
      render(
        <TkxDataGrid columns={tCols} data={tData} rowKey="id" childRowsKey="children" />,
        { wrapper: Wrapper },
      );
      // Initially collapsed → only top-level rows shown. Both top-level
      // rows have children, so 2 carets visible.
      expect(getCarets().length).toBe(2);
    });

    it('leaf rows render a space-reserving placeholder (no caret)', () => {
      render(
        <TkxDataGrid
          columns={tCols}
          data={tData}
          rowKey="id"
          childRowsKey="children"
          defaultExpandedRows="all"
        />,
        { wrapper: Wrapper },
      );
      // 3 leaves shown when fully expanded: README.md, intro.md, advanced.md, index.ts
      // = 4 leaves; carets = 3 parents (docs, guides, src)
      expect(getCarets().length).toBe(3);
      expect(getLeafPlaceholders().length).toBe(4);
    });

    it('clicking caret expands children with aria-level=2', () => {
      render(
        <TkxDataGrid columns={tCols} data={tData} rowKey="id" childRowsKey="children" />,
        { wrapper: Wrapper },
      );
      // initially 2 top-level rows
      expect(getTreeRows().length).toBe(2);
      // expand "docs" (first caret)
      fireEvent.click(getCarets()[0]);
      // Now docs + its 2 children + src = 4 rows
      const rows = getTreeRows();
      expect(rows.length).toBe(4);
      // README.md sits at depth 1 → aria-level=2
      const readme = rows.find(r => (r.textContent || '').includes('README.md'))!;
      expect(readme.getAttribute('aria-level')).toBe('2');
    });

    it('clicking caret again collapses children', () => {
      render(
        <TkxDataGrid columns={tCols} data={tData} rowKey="id" childRowsKey="children" />,
        { wrapper: Wrapper },
      );
      const caret = getCarets()[0];
      fireEvent.click(caret); // expand
      expect(getTreeRows().length).toBe(4);
      fireEvent.click(getCarets()[0]); // collapse again
      expect(getTreeRows().length).toBe(2);
    });

    it('defaultExpandedRows="all" expands every parent recursively', () => {
      render(
        <TkxDataGrid
          columns={tCols}
          data={tData}
          rowKey="id"
          childRowsKey="children"
          defaultExpandedRows="all"
        />,
        { wrapper: Wrapper },
      );
      // 2 roots + 2 first-level children of docs (one is the "guides" parent)
      // + 2 leaves under guides + 1 leaf under src = 7 rows
      expect(getTreeRows().length).toBe(7);
      expect(screen.getByText('advanced.md')).toBeInTheDocument();
    });

    it('defaultExpandedRows=[id] only expands the listed parent', () => {
      render(
        <TkxDataGrid
          columns={tCols}
          data={tData}
          rowKey="id"
          childRowsKey="children"
          defaultExpandedRows={['root-2']}
        />,
        { wrapper: Wrapper },
      );
      // root-1 collapsed, root-2 expanded → 2 roots + 1 leaf under src = 3 rows
      expect(getTreeRows().length).toBe(3);
      expect(screen.getByText('index.ts')).toBeInTheDocument();
      expect(screen.queryByText('README.md')).not.toBeInTheDocument();
    });

    it('onRowExpand fires with correct (rowId, expanded) args', () => {
      const onRowExpand = vi.fn();
      render(
        <TkxDataGrid
          columns={tCols}
          data={tData}
          rowKey="id"
          childRowsKey="children"
          onRowExpand={onRowExpand}
        />,
        { wrapper: Wrapper },
      );
      fireEvent.click(getCarets()[0]); // expand root-1
      expect(onRowExpand).toHaveBeenLastCalledWith('root-1', true);
      fireEvent.click(getCarets()[0]); // collapse root-1
      expect(onRowExpand).toHaveBeenLastCalledWith('root-1', false);
    });

    it('deep nesting (3 levels) renders with correct aria-level + indent', () => {
      render(
        <TkxDataGrid
          columns={tCols}
          data={tData}
          rowKey="id"
          childRowsKey="children"
          defaultExpandedRows="all"
          indentSize={20}
        />,
        { wrapper: Wrapper },
      );
      const rows = getTreeRows();
      const advanced = rows.find(r => (r.textContent || '').includes('advanced.md'))!;
      // advanced.md is at depth 2 (root → guides → advanced.md) → aria-level=3
      expect(advanced.getAttribute('aria-level')).toBe('3');
      expect(advanced.getAttribute('data-tree-depth')).toBe('2');
    });

    it('table role becomes treegrid when childRowsKey is set', () => {
      render(
        <TkxDataGrid columns={tCols} data={tData} rowKey="id" childRowsKey="children" />,
        { wrapper: Wrapper },
      );
      expect(screen.getByRole('treegrid')).toBeInTheDocument();
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });

    it('cell editing works on a child row', () => {
      const onCellEdit = vi.fn();
      const editCols: DataGridColumn<TRow>[] = [
        { key: 'name', header: 'Name', tree: true, editable: true },
        { key: 'size', header: 'Size' },
      ];
      render(
        <TkxDataGrid
          columns={editCols}
          data={tData}
          rowKey="id"
          childRowsKey="children"
          defaultExpandedRows="all"
          onCellEdit={onCellEdit}
        />,
        { wrapper: Wrapper },
      );
      // README.md is a child row at depth 1
      const readmeCell = screen.getByText('README.md').closest('td')!;
      fireEvent.doubleClick(readmeCell);
      const input = screen.getByLabelText('Edit Name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'README-v2.md' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onCellEdit).toHaveBeenCalledWith(
        expect.objectContaining({ rowId: 'leaf-1', newValue: 'README-v2.md' }),
      );
    });

    it('groupBy wins when both groupBy and childRowsKey are set (tree ignored, warning logged)', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const flatData: TRow[] = [
        { id: '1', name: 'A', size: 1, children: [{ id: '1a', name: 'A1', size: 2 }] },
        { id: '2', name: 'B', size: 3, children: [{ id: '2a', name: 'B1', size: 4 }] },
      ];
      render(
        <TkxDataGrid
          columns={tCols}
          data={flatData}
          rowKey="id"
          childRowsKey="children"
          groupBy="name"
        />,
        { wrapper: Wrapper },
      );
      // grid role (not treegrid) → groupBy won
      expect(screen.queryByRole('treegrid')).not.toBeInTheDocument();
      expect(screen.getByRole('grid')).toBeInTheDocument();
      // No tree carets present
      expect(getCarets().length).toBe(0);
      // Warning logged
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('childRowsKey is ignored when groupBy is set'),
      );
      warn.mockRestore();
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('empty data renders empty state without crashing', () => {
      expect(() =>
        render(<TkxDataGrid columns={columns} data={[]} rowKey="id" />, { wrapper: Wrapper }),
      ).not.toThrow();
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('null/undefined cell values do not render literal "undefined" or "null"', () => {
      const sparseData = [
        { id: '1', name: undefined as any, age: null as any },
        { id: '2', name: null as any, age: undefined as any },
      ];
      render(<TkxDataGrid columns={columns} data={sparseData} rowKey="id" />, { wrapper: Wrapper });
      const cells = screen.getAllByRole('gridcell').map(c => c.textContent);
      // No cell should literally contain the word "undefined" or "null"
      cells.forEach(text => {
        expect(text).not.toBe('undefined');
        expect(text).not.toBe('null');
      });
    });
  });
});
