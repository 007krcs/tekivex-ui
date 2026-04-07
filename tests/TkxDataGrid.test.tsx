import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
