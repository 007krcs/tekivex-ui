import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxFormulaBar } from '../src/components/TkxFormulaBar';
import { type SpreadsheetData } from '../src/components/TkxSpreadsheet';

function Harness({
  initial = { cells: { A1: 'hello', B2: '=A1' } },
  initialActive = { col: 0, row: 0 },
}: {
  initial?: SpreadsheetData;
  initialActive?: { col: number; row: number };
} = {}) {
  const [data, setData] = useState(initial);
  const [active, setActive] = useState(initialActive);
  return (
    <TkxFormulaBar
      data={data}
      active={active}
      onChange={setData}
      onActiveChange={setActive}
    />
  );
}

describe('TkxFormulaBar rendering', () => {
  it('renders the toolbar with role="toolbar"', () => {
    render(<Harness />);
    expect(screen.getByTestId('tkx-formula-bar')).toHaveAttribute('role', 'toolbar');
    expect(screen.getByTestId('tkx-formula-bar')).toHaveAttribute('aria-label', 'Formula bar');
  });

  it('shows the active cell address in the name-box', () => {
    render(<Harness initialActive={{ col: 2, row: 4 }} />);
    expect(screen.getByTestId('formula-bar-name')).toHaveValue('C5');
  });

  it('shows the raw cell content in the formula input', () => {
    render(<Harness initial={{ cells: { A1: '=SUM(A2:A10)' } }} />);
    expect(screen.getByTestId('formula-bar-input')).toHaveValue('=SUM(A2:A10)');
  });

  it('shows empty input when the active cell is empty', () => {
    render(<Harness initial={{ cells: {} }} />);
    expect(screen.getByTestId('formula-bar-input')).toHaveValue('');
  });

  it('renders the live result strip only for formulas', () => {
    const { rerender } = render(<Harness initial={{ cells: { A1: '42' } }} />);
    expect(screen.queryByTestId('formula-bar-result')).not.toBeInTheDocument();

    rerender(
      // Force-remount via key so internal state resets
      <Harness key="formula" initial={{ cells: { A1: '5', A2: '=A1*2' } }} initialActive={{ col: 0, row: 1 }} />,
    );
    expect(screen.getByTestId('formula-bar-result')).toBeInTheDocument();
    expect(screen.getByTestId('formula-bar-result').textContent).toMatch(/10/);
  });

  it('hides the result strip when showResult=false', () => {
    function H() {
      const [data, setData] = useState<SpreadsheetData>({ cells: { A1: '=1+1' } });
      return (
        <TkxFormulaBar
          data={data}
          active={{ col: 0, row: 0 }}
          onChange={setData}
          showResult={false}
        />
      );
    }
    render(<H />);
    expect(screen.queryByTestId('formula-bar-result')).not.toBeInTheDocument();
  });
});

describe('TkxFormulaBar editing', () => {
  it('commits a typed value on Enter', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState<SpreadsheetData>({ cells: {} });
      return (
        <TkxFormulaBar
          data={data}
          active={{ col: 0, row: 0 }}
          onChange={(next) => {
            onChange(next);
            setData(next);
          }}
        />
      );
    }
    render(<H />);
    const input = screen.getByTestId('formula-bar-input');
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith({ cells: { A1: '42' } });
  });

  it('commits on blur as well', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState<SpreadsheetData>({ cells: {} });
      return (
        <TkxFormulaBar
          data={data}
          active={{ col: 0, row: 0 }}
          onChange={(next) => {
            onChange(next);
            setData(next);
          }}
        />
      );
    }
    render(<H />);
    const input = screen.getByTestId('formula-bar-input');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith({ cells: { A1: 'hello' } });
  });

  it('removes the cell from the map when committed value is empty', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState<SpreadsheetData>({ cells: { A1: 'old', B1: 'keep' } });
      return (
        <TkxFormulaBar
          data={data}
          active={{ col: 0, row: 0 }}
          onChange={(next) => {
            onChange(next);
            setData(next);
          }}
        />
      );
    }
    render(<H />);
    const input = screen.getByTestId('formula-bar-input');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith({ cells: { B1: 'keep' } });
  });

  it('Escape reverts the draft to the cell\'s actual value', () => {
    render(<Harness initial={{ cells: { A1: 'original' } }} />);
    const input = screen.getByTestId('formula-bar-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'wip-edit' } });
    expect(input.value).toBe('wip-edit');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.value).toBe('original');
  });

  it('updates the formula input when the active cell changes externally', () => {
    function H() {
      const [active, setActive] = useState({ col: 0, row: 0 });
      const [data] = useState<SpreadsheetData>({ cells: { A1: 'first', B1: 'second' } });
      return (
        <>
          <button data-testid="jump" onClick={() => setActive({ col: 1, row: 0 })}>jump</button>
          <TkxFormulaBar data={data} active={active} onChange={() => {}} />
        </>
      );
    }
    render(<H />);
    expect(screen.getByTestId('formula-bar-input')).toHaveValue('first');
    fireEvent.click(screen.getByTestId('jump'));
    expect(screen.getByTestId('formula-bar-input')).toHaveValue('second');
  });
});

describe('TkxFormulaBar name-box navigation', () => {
  it('jumps to a typed cell address on Enter', () => {
    const onActiveChange = vi.fn();
    function H() {
      const [active, setActive] = useState({ col: 0, row: 0 });
      return (
        <TkxFormulaBar
          data={{ cells: {} }}
          active={active}
          onChange={() => {}}
          onActiveChange={(next) => {
            onActiveChange(next);
            setActive(next);
          }}
        />
      );
    }
    render(<H />);
    const name = screen.getByTestId('formula-bar-name');
    fireEvent.change(name, { target: { value: 'D7' } });
    fireEvent.keyDown(name, { key: 'Enter' });
    expect(onActiveChange).toHaveBeenCalledWith({ col: 3, row: 6 });
  });

  it('lowercases the typed address before parsing', () => {
    const onActiveChange = vi.fn();
    function H() {
      const [active, setActive] = useState({ col: 0, row: 0 });
      return (
        <TkxFormulaBar
          data={{ cells: {} }}
          active={active}
          onChange={() => {}}
          onActiveChange={(next) => {
            onActiveChange(next);
            setActive(next);
          }}
        />
      );
    }
    render(<H />);
    const name = screen.getByTestId('formula-bar-name');
    fireEvent.change(name, { target: { value: 'b2' } });
    fireEvent.keyDown(name, { key: 'Enter' });
    expect(onActiveChange).toHaveBeenCalledWith({ col: 1, row: 1 });
  });

  it('reverts the name-box on bad input + Enter', () => {
    render(<Harness initialActive={{ col: 4, row: 2 }} />);
    const name = screen.getByTestId('formula-bar-name') as HTMLInputElement;
    fireEvent.change(name, { target: { value: 'not-a-cell' } });
    fireEvent.keyDown(name, { key: 'Enter' });
    expect(name.value).toBe('E3');
  });

  it('reverts on blur if the address did not parse', () => {
    render(<Harness initialActive={{ col: 0, row: 0 }} />);
    const name = screen.getByTestId('formula-bar-name') as HTMLInputElement;
    fireEvent.change(name, { target: { value: 'garbage' } });
    fireEvent.blur(name);
    expect(name.value).toBe('A1');
  });

  it('Escape on the name-box reverts the draft', () => {
    render(<Harness initialActive={{ col: 0, row: 0 }} />);
    const name = screen.getByTestId('formula-bar-name') as HTMLInputElement;
    fireEvent.change(name, { target: { value: 'wip' } });
    fireEvent.keyDown(name, { key: 'Escape' });
    expect(name.value).toBe('A1');
  });
});

describe('TkxFormulaBar formula evaluation', () => {
  it('shows error sentinel for #CYCLE!', () => {
    function H() {
      const [data, setData] = useState<SpreadsheetData>({
        cells: { A1: '=B1', B1: '=A1' },
      });
      return (
        <TkxFormulaBar
          data={data}
          active={{ col: 0, row: 0 }}
          onChange={setData}
        />
      );
    }
    render(<H />);
    expect(screen.getByTestId('formula-bar-result').textContent).toMatch(/#CYCLE!/);
  });

  it('shows the evaluated number for arithmetic', () => {
    function H() {
      const [data, setData] = useState<SpreadsheetData>({ cells: { A1: '=2*3+1' } });
      return (
        <TkxFormulaBar
          data={data}
          active={{ col: 0, row: 0 }}
          onChange={setData}
        />
      );
    }
    render(<H />);
    expect(screen.getByTestId('formula-bar-result').textContent).toMatch(/7/);
  });
});
