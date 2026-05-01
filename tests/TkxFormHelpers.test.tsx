import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useState, createRef } from 'react';
import {
  TkxFieldArray,
  TkxMaskedInput,
  TkxPhoneInput,
  TkxSignaturePad,
  type TkxSignaturePadHandle,
} from '../index';

/* -------------------------------------------------------------------------- */
/* TkxFieldArray                                                              */
/* -------------------------------------------------------------------------- */

describe('TkxFieldArray', () => {
  it('renders the initial items via the render-prop', () => {
    render(
      <TkxFieldArray<string> defaultValue={['Ram', 'Sita']}>
        {({ items }) => (
          <ul>
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        )}
      </TkxFieldArray>,
    );
    expect(screen.getByText('Ram')).toBeTruthy();
    expect(screen.getByText('Sita')).toBeTruthy();
  });

  it('add appends an item and remove drops one', () => {
    function Harness() {
      return (
        <TkxFieldArray<string> defaultValue={['a']}>
          {({ items, add, remove }) => (
            <div>
              <span data-testid="count">{items.length}</span>
              <button onClick={() => add('b')}>+</button>
              <button onClick={() => remove(0)}>-</button>
            </div>
          )}
        </TkxFieldArray>
      );
    }
    render(<Harness />);
    expect(screen.getByTestId('count').textContent).toBe('1');
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    fireEvent.click(screen.getByText('-'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('respects max and min', () => {
    function Harness() {
      return (
        <TkxFieldArray<string> defaultValue={['a']} max={2} min={1}>
          {({ items, add, remove }) => (
            <div>
              <span data-testid="count">{items.length}</span>
              <button onClick={() => add('x')}>+</button>
              <button onClick={() => remove(0)}>-</button>
            </div>
          )}
        </TkxFieldArray>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('+')); // would exceed max=2
    expect(screen.getByTestId('count').textContent).toBe('2');
    fireEvent.click(screen.getByText('-'));
    fireEvent.click(screen.getByText('-')); // would drop below min=1
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('move reorders items', () => {
    function Harness() {
      return (
        <TkxFieldArray<string> defaultValue={['a', 'b', 'c']}>
          {({ items, move }) => (
            <div>
              <span data-testid="order">{items.join(',')}</span>
              <button onClick={() => move(0, 2)}>mv</button>
            </div>
          )}
        </TkxFieldArray>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByText('mv'));
    expect(screen.getByTestId('order').textContent).toBe('b,c,a');
  });

  it('keyOf returns stable keys across re-renders', () => {
    const seen = new Map<string, string>();
    function Harness() {
      return (
        <TkxFieldArray<string> defaultValue={['a', 'b']}>
          {({ items, keyOf, add }) => (
            <div>
              {items.map((it, i) => {
                const k = keyOf(i);
                seen.set(`${i}-${it}`, k);
                return <span key={k}>{`${k}=${it}`}</span>;
              })}
              <button onClick={() => add('c')}>+</button>
            </div>
          )}
        </TkxFieldArray>
      );
    }
    render(<Harness />);
    const before = seen.get('0-a');
    fireEvent.click(screen.getByText('+'));
    expect(seen.get('0-a')).toBe(before); // existing key unchanged after add
  });
});

/* -------------------------------------------------------------------------- */
/* TkxMaskedInput                                                              */
/* -------------------------------------------------------------------------- */

describe('TkxMaskedInput', () => {
  it('Aadhaar mask groups digits as XXXX XXXX XXXX', () => {
    function Harness() {
      const [v, setV] = useState('');
      return (
        <TkxMaskedInput
          mask="9999 9999 9999"
          value={v}
          onChange={setV}
          inputMode="numeric"
        />
      );
    }
    render(<Harness />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '123456789012' } });
    expect(input.value).toBe('1234 5678 9012');
  });

  it('PAN mask formats AAAAA9999A and uppercases letters', () => {
    function Harness() {
      const [v, setV] = useState('');
      return <TkxMaskedInput mask="AAAAA9999A" value={v} onChange={setV} />;
    }
    render(<Harness />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abcde1234x' } });
    expect(input.value).toBe('ABCDE1234X');
  });

  it('rejects characters that do not match the slot type', () => {
    function Harness() {
      const [v, setV] = useState('');
      return <TkxMaskedInput mask="9999" value={v} onChange={setV} />;
    }
    render(<Harness />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12ab34' } });
    expect(input.value).toBe('1234');
  });

  it('marks invalid when validate predicate fails', () => {
    function Harness() {
      const [v, setV] = useState('');
      return (
        <TkxMaskedInput
          mask="9999"
          value={v}
          onChange={setV}
          validate={(raw) => raw.length === 0 || raw.length === 4}
        />
      );
    }
    const { container } = render(<Harness />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12' } });
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});

/* -------------------------------------------------------------------------- */
/* TkxPhoneInput                                                                */
/* -------------------------------------------------------------------------- */

describe('TkxPhoneInput', () => {
  it('formats Indian numbers as 5+5 grouping and emits +91 prefix', () => {
    const onChange = vi.fn();
    render(<TkxPhoneInput onChange={onChange} />);
    const input = screen.getByLabelText(/Country dial code/i)
      .parentElement!.querySelector('input[type="tel"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '9876543210' } });
    expect(input.value).toBe('98765 43210');
    expect(onChange).toHaveBeenLastCalledWith('+919876543210', {
      dialCode: '+91',
      nationalNumber: '9876543210',
    });
  });

  it('changes dial code when a different country is picked', () => {
    const onChange = vi.fn();
    render(<TkxPhoneInput onChange={onChange} />);
    const select = screen.getByLabelText(/Country dial code/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'US-+1' } });
    const input = select.parentElement!.querySelector('input[type="tel"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '4155551234' } });
    expect(onChange).toHaveBeenLastCalledWith('+14155551234', {
      dialCode: '+1',
      nationalNumber: '4155551234',
    });
  });
});

/* -------------------------------------------------------------------------- */
/* TkxSignaturePad                                                              */
/* -------------------------------------------------------------------------- */

describe('TkxSignaturePad', () => {
  it('mounts a canvas with armed data attribute', () => {
    const { container } = render(<TkxSignaturePad />);
    expect(container.querySelector('[data-tkx-signature-pad="armed"]')).toBeTruthy();
  });

  it('exposes clear, undo and isEmpty via ref', () => {
    const ref = createRef<TkxSignaturePadHandle>();
    render(<TkxSignaturePad ref={ref} />);
    expect(ref.current?.isEmpty()).toBe(true);
    act(() => ref.current?.clear());
    expect(ref.current?.isEmpty()).toBe(true);
  });
});
