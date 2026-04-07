import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDisclosure } from '../src/headless/useDisclosure';
import { useDebounce, useDebouncedCallback } from '../src/headless/useDebounce';
import { useThrottle, useThrottledCallback } from '../src/headless/useThrottle';
import { useControllable } from '../src/headless/useControllable';
import { useListSelection } from '../src/headless/useListSelection';
import { useLocalStorage } from '../src/headless/useLocalStorage';
import { useFormState } from '../src/headless/useFormState';
import { useDisclosure as useDisclosure2 } from '../src/headless/useDisclosure';

// ── useDisclosure ─────────────────────────────────────────────────────────────

describe('useDisclosure', () => {
  it('initialises as closed by default', () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it('initialises with provided state', () => {
    const { result } = renderHook(() => useDisclosure(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('opens on open()', () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it('closes on close()', () => {
    const { result } = renderHook(() => useDisclosure(true));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('toggles on toggle()', () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });
});

// ── useDebounce ───────────────────────────────────────────────────────────────

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    );
    rerender({ value: 'b', delay: 300 });
    expect(result.current).toBe('a'); // still old
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('b');
  });

  it('resets timer on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebounce(v, 300),
      { initialProps: { v: 'a' } },
    );
    rerender({ v: 'b' });
    act(() => vi.advanceTimersByTime(100));
    rerender({ v: 'c' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('a'); // timer not elapsed
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('c');
  });
});

// ── useThrottle ───────────────────────────────────────────────────────────────

describe('useThrottle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useThrottle(0, 1000));
    expect(result.current).toBe(0);
  });

  it('throttles value updates', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: number }) => useThrottle(v, 1000),
      { initialProps: { v: 0 } },
    );
    rerender({ v: 1 });
    expect(result.current).toBe(0); // throttled
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(1);
  });
});

// ── useControllable ───────────────────────────────────────────────────────────

describe('useControllable', () => {
  it('uses defaultValue when no external value', () => {
    const { result } = renderHook(() =>
      useControllable<string>({ defaultValue: 'default' }),
    );
    expect(result.current[0]).toBe('default');
  });

  it('uses provided value when controlled', () => {
    const { result } = renderHook(() =>
      useControllable<string>({ value: 'controlled', defaultValue: 'default' }),
    );
    expect(result.current[0]).toBe('controlled');
  });

  it('calls onChange when setValue is called', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllable<string>({ defaultValue: 'start', onChange }),
    );
    act(() => result.current[1]('updated'));
    expect(onChange).toHaveBeenCalledWith('updated');
  });

  it('updates internal state when uncontrolled', () => {
    const { result } = renderHook(() =>
      useControllable<number>({ defaultValue: 0 }),
    );
    act(() => result.current[1](42));
    expect(result.current[0]).toBe(42);
  });
});

// ── useListSelection ──────────────────────────────────────────────────────────

describe('useListSelection', () => {
  const items = ['a', 'b', 'c', 'd'];

  it('starts with no selection by default', () => {
    const { result } = renderHook(() => useListSelection({ items }));
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.selectedArray).toEqual([]);
  });

  it('starts with initialSelected', () => {
    const { result } = renderHook(() =>
      useListSelection({ items, initialSelected: ['a', 'c'] }),
    );
    expect(result.current.isSelected('a')).toBe(true);
    expect(result.current.isSelected('b')).toBe(false);
    expect(result.current.isSelected('c')).toBe(true);
  });

  it('toggles selection', () => {
    const { result } = renderHook(() => useListSelection({ items, multiple: true }));
    act(() => result.current.toggle('b'));
    expect(result.current.isSelected('b')).toBe(true);
    act(() => result.current.toggle('b'));
    expect(result.current.isSelected('b')).toBe(false);
  });

  it('selectAll selects everything', () => {
    const { result } = renderHook(() => useListSelection({ items, multiple: true }));
    act(() => result.current.selectAll());
    expect(result.current.allSelected).toBe(true);
    expect(result.current.selectedCount).toBe(items.length);
  });

  it('deselectAll clears everything', () => {
    const { result } = renderHook(() =>
      useListSelection({ items, multiple: true, initialSelected: items }),
    );
    act(() => result.current.deselectAll());
    expect(result.current.selectedCount).toBe(0);
  });

  it('single selection replaces previous', () => {
    const { result } = renderHook(() => useListSelection({ items, multiple: false }));
    act(() => result.current.select('a'));
    act(() => result.current.select('b'));
    expect(result.current.isSelected('a')).toBe(false);
    expect(result.current.isSelected('b')).toBe(true);
  });
});

// ── useLocalStorage ───────────────────────────────────────────────────────────

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear());

  it('returns initialValue when nothing stored', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('persists value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', ''));
    act(() => result.current[1]('persisted'));
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('persisted'));
  });

  it('removes value from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'x'));
    act(() => result.current[1]('stored'));
    act(() => result.current[2]());
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('reads existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('pre-existing'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    expect(result.current[0]).toBe('pre-existing');
  });

  it('handles object values', () => {
    const { result } = renderHook(() => useLocalStorage<{ count: number }>('obj-key', { count: 0 }));
    act(() => result.current[1]({ count: 5 }));
    expect(result.current[0]).toEqual({ count: 5 });
  });
});

// ── useFormState ──────────────────────────────────────────────────────────────

describe('useFormState', () => {
  const setup = () =>
    renderHook(() =>
      useFormState({
        initialValues: { name: '', email: '' },
        validate: (vals) => {
          const errs: Record<string, string> = {};
          if (!vals.name) errs.name = 'Required';
          if (!vals.email.includes('@')) errs.email = 'Invalid email';
          return errs;
        },
      }),
    );

  it('initialises with provided values', () => {
    const { result } = setup();
    expect(result.current.values).toEqual({ name: '', email: '' });
  });

  it('updates a field value', () => {
    const { result } = setup();
    act(() => result.current.setValue('name', 'Alice'));
    expect(result.current.values.name).toBe('Alice');
  });

  it('marks field as touched', () => {
    const { result } = setup();
    expect(result.current.touched.name).toBeFalsy();
    act(() => result.current.touchField('name'));
    expect(result.current.touched.name).toBe(true);
  });

  it('validates and returns errors', async () => {
    const { result } = setup();
    await act(async () => { await result.current.validate(); });
    expect(result.current.errors.name).toBe('Required');
    expect(result.current.errors.email).toBe('Invalid email');
  });

  it('isValid is false with errors', async () => {
    const { result } = setup();
    await act(async () => { await result.current.validate(); });
    expect(result.current.isValid).toBe(false);
  });

  it('isValid is true when no errors', async () => {
    const { result } = setup();
    act(() => { result.current.setValue('name', 'Alice'); result.current.setValue('email', 'a@b.com'); });
    await act(async () => { await result.current.validate(); });
    expect(result.current.isValid).toBe(true);
  });

  it('resets to initial values', () => {
    const { result } = setup();
    act(() => result.current.setValue('name', 'Alice'));
    act(() => result.current.reset());
    expect(result.current.values).toEqual({ name: '', email: '' });
  });

  it('getFieldProps returns value and handlers', () => {
    const { result } = setup();
    const props = result.current.getFieldProps('name');
    expect(props.value).toBe('');
    expect(typeof props.onChange).toBe('function');
    expect(typeof props.onBlur).toBe('function');
  });
});
