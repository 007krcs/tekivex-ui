import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { TkxTable, type ColumnDef } from '../src/components/TkxTable';
import { ThemeProvider } from '../src/themes';

interface Row { id: number; name: string; age: number; role: string }

const cols: ColumnDef<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age',  header: 'Age', sortable: true },
  { key: 'role', header: 'Role' },
];

const rows: Row[] = [
  { id: 1, name: 'Charlie', age: 30, role: 'Eng' },
  { id: 2, name: 'Alice',   age: 28, role: 'PM' },
  { id: 3, name: 'Bob',     age: 34, role: 'Design' },
];

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('TkxTable', () => {
  it('renders headers', () => {
    const { getByText } = wrap(<TkxTable columns={cols} data={rows} />);
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Age')).toBeTruthy();
    expect(getByText('Role')).toBeTruthy();
  });

  it('renders all rows', () => {
    const { getByText } = wrap(<TkxTable columns={cols} data={rows} />);
    expect(getByText('Charlie')).toBeTruthy();
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });

  it('uses scope="col" on headers', () => {
    const { container } = wrap(<TkxTable columns={cols} data={rows} />);
    const ths = container.querySelectorAll('th[scope="col"]');
    expect(ths.length).toBe(3);
  });

  it('sorts ascending then descending when sortable header clicked', () => {
    const { container, getAllByRole } = wrap(<TkxTable columns={cols} data={rows} sortable />);
    const nameHeader = container.querySelectorAll('th')[0] as HTMLElement;
    fireEvent.click(nameHeader);
    let cells = getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);
    expect(cells).toEqual(['Alice', 'Bob', 'Charlie']);
    fireEvent.click(nameHeader);
    cells = getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);
    expect(cells).toEqual(['Charlie', 'Bob', 'Alice']);
  });

  it('sorts numerically for number columns', () => {
    const { container, getAllByRole } = wrap(<TkxTable columns={cols} data={rows} sortable />);
    const ageHeader = container.querySelectorAll('th')[1] as HTMLElement;
    fireEvent.click(ageHeader);
    const ages = getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[1].textContent);
    expect(ages).toEqual(['28', '30', '34']);
  });

  it('sets aria-sort on sorted column', () => {
    const { container } = wrap(<TkxTable columns={cols} data={rows} sortable />);
    const nameHeader = container.querySelectorAll('th')[0] as HTMLElement;
    fireEvent.click(nameHeader);
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
    fireEvent.click(nameHeader);
    expect(nameHeader.getAttribute('aria-sort')).toBe('descending');
  });

  it('supports keyboard sort via Enter', () => {
    const { container, getAllByRole } = wrap(<TkxTable columns={cols} data={rows} sortable />);
    const nameHeader = container.querySelectorAll('th')[0] as HTMLElement;
    fireEvent.keyDown(nameHeader, { key: 'Enter' });
    const cells = getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);
    expect(cells[0]).toBe('Alice');
  });

  it('non-sortable column header is not a keyboard sort target', () => {
    const { container } = wrap(<TkxTable columns={cols} data={rows} sortable />);
    const roleHeader = container.querySelectorAll('th')[2] as HTMLElement;
    // Non-sortable headers should not declare role=button or tabindex=0.
    const isButton = roleHeader.getAttribute('role') === 'button';
    const isTabbable = roleHeader.getAttribute('tabindex') === '0';
    expect(isButton && isTabbable).toBe(false);
  });

  it('renders empty state when no data', () => {
    const { getByText } = wrap(
      <TkxTable columns={cols} data={[]} emptyState={<span>No rows</span>} />,
    );
    expect(getByText('No rows')).toBeTruthy();
  });

  it('calls onRowClick with row + index', () => {
    const onRowClick = vi.fn();
    const { getAllByRole } = wrap(
      <TkxTable columns={cols} data={rows} onRowClick={onRowClick} />,
    );
    fireEvent.click(getAllByRole('row')[1]);
    expect(onRowClick).toHaveBeenCalledWith(rows[0], 0);
  });

  it('marks selected rows with aria-selected', () => {
    const { getAllByRole } = wrap(
      <TkxTable columns={cols} data={rows} selectedRows={[1]} onRowClick={() => {}} />,
    );
    const bodyRows = getAllByRole('row').slice(1);
    expect(bodyRows[1].getAttribute('aria-selected')).toBe('true');
  });

  it('uses custom cell renderer', () => {
    const cols2: ColumnDef<Row>[] = [
      { key: 'name', header: 'Name', render: (v) => <em>{String(v).toUpperCase()}</em> },
    ];
    const { getByText } = wrap(<TkxTable columns={cols2} data={rows} />);
    expect(getByText('CHARLIE')).toBeTruthy();
  });

  it('renders caption sanitized', () => {
    const { container } = wrap(<TkxTable columns={cols} data={rows} caption="<script>x</script>Team" />);
    const cap = container.querySelector('caption');
    expect(cap?.textContent).toMatch(/Team/);
    expect(container.querySelector('caption script')).toBeNull();
  });

  it('shows loading skeleton when isLoading', () => {
    const { container } = wrap(<TkxTable columns={cols} data={[]} isLoading />);
    // Skeleton rows render something with role row beyond the header.
    const allRows = container.querySelectorAll('[role="row"], tr');
    expect(allRows.length).toBeGreaterThan(1);
  });
});
