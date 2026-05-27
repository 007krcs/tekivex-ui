import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Flush all microtasks queued by Promise.resolve().then chains.
// useFormState's async path goes: Promise.resolve().then(validator).then(setState) —
// so we need a few microtask turns before the state actually updates.
async function flushMicrotasks(times = 6): Promise<void> {
  for (let i = 0; i < times; i++) {
    await Promise.resolve();
  }
}
import { useFormState } from '../src/headless/useFormState';

// ────────────────────────────────────────────────────────────────────────────
// Deliverables A (async field validation) + B (form-level _root error)
// ────────────────────────────────────────────────────────────────────────────

describe('useFormState — async field validation', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('runs validateAsync after the debounce delay', async () => {
    const validator = vi.fn(async (v: string) =>
      v === 'taken@x.com' ? 'Already taken' : null,
    );
    const { result } = renderHook(() =>
      useFormState({
        initialValues: { email: '' as string },
        validateAsync: { email: validator },
        debounceMs: 300,
      }),
    );

    act(() => result.current.setValue('email', 'taken@x.com'));
    // Not yet — debounce hasn't elapsed.
    expect(validator).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
      await flushMicrotasks();
    });

    expect(validator).toHaveBeenCalledTimes(1);
    expect(result.current.asyncErrors.email).toBe('Already taken');
  });

  it('sets validating[field]=true during in-flight call and false after', async () => {
    let resolveFn!: (v: string | null) => void;
    const validator = vi.fn(
      () => new Promise<string | null>((res) => { resolveFn = res; }),
    );
    const { result } = renderHook(() =>
      useFormState({
        initialValues: { email: '' as string },
        validateAsync: { email: validator },
        debounceMs: 100,
      }),
    );

    act(() => result.current.setValue('email', 'a@b.com'));
    await act(async () => {
      vi.advanceTimersByTime(100);
      await flushMicrotasks();
    });

    expect(result.current.validating.email).toBe(true);

    await act(async () => {
      resolveFn(null);
      await flushMicrotasks();
    });

    expect(result.current.validating.email).toBeUndefined();
  });

  it('debounces — two rapid changes only fire the validator once', async () => {
    const validator = vi.fn(async () => null);
    const { result } = renderHook(() =>
      useFormState({
        initialValues: { email: '' as string },
        validateAsync: { email: validator },
        debounceMs: 300,
      }),
    );

    act(() => result.current.setValue('email', 'a'));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.setValue('email', 'ab'));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.setValue('email', 'abc'));
    await act(async () => {
      vi.advanceTimersByTime(300);
      await flushMicrotasks();
    });

    expect(validator).toHaveBeenCalledTimes(1);
    expect(validator).toHaveBeenLastCalledWith('abc', expect.any(Object));
  });

  it('async error appears in merged errors object', async () => {
    const { result } = renderHook(() =>
      useFormState({
        initialValues: { name: '' as string },
        validateAsync: { name: async () => 'Reserved' },
        debounceMs: 50,
      }),
    );

    act(() => result.current.setValue('name', 'admin'));
    await act(async () => {
      vi.advanceTimersByTime(50);
      await flushMicrotasks();
    });

    expect(result.current.errors.name).toBe('Reserved');
    expect(result.current.asyncErrors.name).toBe('Reserved');
  });

  it('async error overrides sync error for the same field', async () => {
    const { result } = renderHook(() =>
      useFormState({
        initialValues: { name: '' as string },
        validate: () => ({ name: 'Sync error' }),
        validateAsync: { name: async () => 'Async error' },
        debounceMs: 50,
      }),
    );

    act(() => result.current.validate());
    expect(result.current.errors.name).toBe('Sync error');

    act(() => result.current.setValue('name', 'x'));
    await act(async () => {
      vi.advanceTimersByTime(50);
      await flushMicrotasks();
    });

    expect(result.current.errors.name).toBe('Async error');
  });

  it('_root error from validator appears in rootError', () => {
    const { result } = renderHook(() =>
      useFormState({
        initialValues: { email: 'same', password: 'same' },
        validate: (v) => ({
          _root: v.email === v.password ? 'Must not match' : undefined,
        }),
      }),
    );

    act(() => { result.current.validate(); });
    expect(result.current.rootError).toBe('Must not match');
    expect(result.current.isValid).toBe(false);
  });

  it('_root does not appear in errors (kept separate)', () => {
    const { result } = renderHook(() =>
      useFormState({
        initialValues: { a: '' as string },
        validate: () => ({ _root: 'captcha failed' }),
      }),
    );

    act(() => { result.current.validate(); });
    expect(result.current.rootError).toBe('captcha failed');
    expect((result.current.errors as Record<string, string>)._root).toBeUndefined();
    expect(Object.keys(result.current.errors)).toHaveLength(0);
  });

  it('async + _root work together', async () => {
    const { result } = renderHook(() =>
      useFormState({
        initialValues: { email: '' as string, password: '' as string },
        validate: (v) => ({
          _root: v.email === v.password && v.email ? 'Must differ' : undefined,
        }),
        validateAsync: {
          email: async (v) => (v === 'taken' ? 'Taken' : null),
        },
        debounceMs: 50,
      }),
    );

    act(() => result.current.setValue('email', 'taken'));
    act(() => result.current.setValue('password', 'taken'));
    await act(async () => {
      vi.advanceTimersByTime(50);
      await flushMicrotasks();
    });

    expect(result.current.asyncErrors.email).toBe('Taken');
    act(() => { result.current.validate(); });
    expect(result.current.rootError).toBe('Must differ');
    expect(result.current.errors.email).toBe('Taken');
  });

  it('cancelled async validators do not update state', async () => {
    let resolveFirst!: (v: string | null) => void;
    let callIndex = 0;
    const validator = vi.fn((value: string) => {
      callIndex += 1;
      const idx = callIndex;
      return new Promise<string | null>((res) => {
        if (idx === 1) resolveFirst = res;
        else res(null); // second call resolves immediately with null
        void value;
      });
    });
    const { result } = renderHook(() =>
      useFormState({
        initialValues: { name: '' as string },
        validateAsync: { name: validator },
        debounceMs: 100,
      }),
    );

    // First change → fires validator (in-flight).
    act(() => result.current.setValue('name', 'first'));
    await act(async () => {
      vi.advanceTimersByTime(100);
      await flushMicrotasks();
    });
    expect(validator).toHaveBeenCalledTimes(1);

    // Second change → bumps the token, schedules a new validator call.
    act(() => result.current.setValue('name', 'second'));
    await act(async () => {
      vi.advanceTimersByTime(100);
      await flushMicrotasks();
    });

    // Now resolve the FIRST (stale) call — its result must be ignored.
    await act(async () => {
      resolveFirst('STALE — should be dropped');
      await flushMicrotasks();
    });

    expect(result.current.asyncErrors.name).toBeUndefined();
  });

  it('existing consumers without validateAsync still work (no breaking change)', () => {
    const { result } = renderHook(() =>
      useFormState({
        initialValues: { x: '' as string },
        validate: (v) => ({ x: v.x ? undefined : 'Required' }),
      }),
    );

    expect(result.current.validating).toEqual({});
    expect(result.current.asyncErrors).toEqual({});
    expect(result.current.rootError).toBeUndefined();
    act(() => { result.current.validate(); });
    expect(result.current.errors.x).toBe('Required');
    act(() => result.current.setValue('x', 'ok'));
    act(() => { result.current.validate(); });
    expect(result.current.errors.x).toBeUndefined();
  });
});
