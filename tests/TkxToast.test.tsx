import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { TkxToastProvider, useToast, toast as globalToast } from '../src/components/TkxToast';
import { ThemeProvider } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TkxToastProvider>{children}</TkxToastProvider>
    </ThemeProvider>
  );
}

describe('TkxToast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
  });

  it('provider renders children', () => {
    const { getByText } = render(
      <TkxToastProvider>
        <div>child</div>
      </TkxToastProvider>,
      { wrapper: ThemeProvider as any },
    );
    expect(getByText('child')).toBeTruthy();
  });

  it('useToast().toast shows a toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    const { container } = render(<div />, { wrapper: Wrapper });
    act(() => { result.current.toast({ title: 'Hello' }); });
    // Toast content mounts somewhere in document
    expect(document.body.textContent).toMatch(/Hello/);
    act(() => { result.current.dismissAll(); });
  });

  it('returns an id from toast()', () => {
    render(<div />, { wrapper: Wrapper });
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    let id = '';
    act(() => { id = result.current.toast({ title: 'X' }); });
    expect(id).toMatch(/^tkx-toast-/);
    act(() => { result.current.dismissAll(); });
  });

  it('dismisses by id', () => {
    render(<div />, { wrapper: Wrapper });
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    let id = '';
    act(() => { id = result.current.toast({ title: 'Bye' }); });
    expect(document.body.textContent).toMatch(/Bye/);
    act(() => { result.current.dismiss(id); });
    expect(document.body.textContent).not.toMatch(/Bye/);
  });

  it('auto-dismisses after duration', () => {
    render(<div />, { wrapper: Wrapper });
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    act(() => { result.current.toast({ title: 'Ephemeral', duration: 500 }); });
    expect(document.body.textContent).toMatch(/Ephemeral/);
    act(() => { vi.advanceTimersByTime(600); });
    expect(document.body.textContent).not.toMatch(/Ephemeral/);
  });

  it('duration 0 keeps toast visible', () => {
    render(<div />, { wrapper: Wrapper });
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    act(() => { result.current.toast({ title: 'Sticky', duration: 0 }); });
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(document.body.textContent).toMatch(/Sticky/);
    act(() => { result.current.dismissAll(); });
  });

  it('queues beyond MAX_VISIBLE (5)', () => {
    render(<div />, { wrapper: Wrapper });
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    act(() => {
      for (let i = 0; i < 7; i++) result.current.toast({ title: `T${i}`, duration: 500 });
    });
    // Only 5 visible simultaneously
    const visible = ['T0','T1','T2','T3','T4'].filter((t) => document.body.textContent?.includes(t));
    expect(visible.length).toBe(5);
    expect(document.body.textContent).not.toMatch(/T6/);
    // Advance — queued toasts take over.
    act(() => { vi.advanceTimersByTime(600); });
    expect(document.body.textContent).toMatch(/T5|T6/);
    act(() => { result.current.dismissAll(); });
  });

  it('danger variant uses role=alert', () => {
    render(<div />, { wrapper: Wrapper });
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    act(() => { result.current.toast({ title: 'Err', variant: 'danger' }); });
    const alert = document.body.querySelector('[role="alert"]');
    expect(alert?.textContent).toMatch(/Err/);
    act(() => { result.current.dismissAll(); });
  });

  it('non-danger variants use role=status', () => {
    render(<div />, { wrapper: Wrapper });
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    act(() => { result.current.toast({ title: 'Ok', variant: 'success' }); });
    const status = document.body.querySelector('[role="status"]');
    expect(status?.textContent).toMatch(/Ok/);
    act(() => { result.current.dismissAll(); });
  });

  it('sanitizes title (strips script tags)', () => {
    render(<div />, { wrapper: Wrapper });
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    act(() => { result.current.toast({ title: '<script>alert(1)</script>Safe' }); });
    expect(document.body.querySelector('script')).toBeNull();
    expect(document.body.textContent).toMatch(/Safe/);
    act(() => { result.current.dismissAll(); });
  });

  it('action button fires callback', () => {
    render(<div />, { wrapper: Wrapper });
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    const onClick = vi.fn();
    act(() => {
      result.current.toast({ title: 'Undo?', action: { label: 'Undo', onClick } });
    });
    const btn = [...document.body.querySelectorAll('button')].find((b) => b.textContent?.includes('Undo'));
    expect(btn).toBeTruthy();
    act(() => { btn?.click(); });
    expect(onClick).toHaveBeenCalled();
    act(() => { result.current.dismissAll(); });
  });

  it('dismissAll clears everything', () => {
    render(<div />, { wrapper: Wrapper });
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    act(() => {
      result.current.toast({ title: 'A' });
      result.current.toast({ title: 'B' });
      result.current.toast({ title: 'C' });
    });
    expect(document.body.textContent).toMatch(/A/);
    act(() => { result.current.dismissAll(); });
    expect(document.body.textContent).not.toMatch(/A/);
    expect(document.body.textContent).not.toMatch(/B/);
  });

  it('two default providers do NOT double-render the same toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    const { container } = render(
      <ThemeProvider>
        <TkxToastProvider />
        <TkxToastProvider />
      </ThemeProvider>,
    );
    void container;
    act(() => { result.current.toast({ title: 'ONCE' }); });
    const matches = (document.body.textContent?.match(/ONCE/g) ?? []).length;
    expect(matches).toBe(1);
    act(() => { result.current.dismissAll(); });
  });

  it('an isolated provider keeps its toasts separate from the global store', () => {
    let isolatedToast: ReturnType<typeof useToast>['toast'] | null = null;
    function Grabber() {
      isolatedToast = useToast().toast;
      return null;
    }
    render(
      <ThemeProvider>
        <TkxToastProvider isolated>
          <Grabber />
        </TkxToastProvider>
      </ThemeProvider>,
    );
    // Fire on the GLOBAL store; the isolated region must not show it.
    act(() => { globalToast({ title: 'GLOBAL-ONLY' }); });
    // Fire on the ISOLATED store.
    act(() => { isolatedToast!({ title: 'ISO-ONLY' }); });
    expect(document.body.textContent).toMatch(/ISO-ONLY/);
    act(() => {
      // clean up global
    });
  });

  it('fires onDismiss when a toast is removed by timeout', () => {
    const onDismiss = vi.fn();
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    act(() => { result.current.toast({ title: 'X', duration: 1000, onDismiss }); });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('the module-level toast() targets the default store', () => {
    render(
      <ThemeProvider>
        <TkxToastProvider />
      </ThemeProvider>,
    );
    act(() => { globalToast({ title: 'FROM-MODULE' }); });
    expect(document.body.textContent).toMatch(/FROM-MODULE/);
  });
});
