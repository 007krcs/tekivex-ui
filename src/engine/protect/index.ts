/**
 * Tekivex UI — engine/protect
 *
 * Detection primitives for content-protection features. Each watcher is a pure
 * function returning a teardown. Higher-level components (TkxScreenshotGuard,
 * TkxPrintGuard, TkxClipboardGuard, TkxDevToolsGuard) compose these.
 *
 * Honest scope: browsers cannot truly block screen capture — especially OS-level
 * captures on mobile. These primitives raise the cost of casual leakage and
 * provide hooks to react (blank content, watermark, audit-log) when an attempt
 * is heuristically detected.
 */

export type GuardEventType =
  | 'screenshot-key'
  | 'window-blur'
  | 'visibility-hidden'
  | 'visibility-visible'
  | 'fullscreen-exit'
  | 'print-attempt'
  | 'print-after'
  | 'clipboard-copy'
  | 'clipboard-cut'
  | 'clipboard-paste'
  | 'drag-start'
  | 'context-menu'
  | 'devtools-open'
  | 'devtools-close';

export interface GuardEvent {
  type: GuardEventType;
  timestamp: number;
  meta?: Record<string, unknown>;
}

export type GuardListener = (event: GuardEvent) => void;
export type Teardown = () => void;

const now = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();

const emit = (
  listener: GuardListener,
  type: GuardEventType,
  meta?: Record<string, unknown>,
): void => {
  try {
    listener({ type, timestamp: now(), meta });
  } catch {
    /* listener errors must never break the host page */
  }
};

const SSR = typeof window === 'undefined' || typeof document === 'undefined';

/* -------------------------------------------------------------------------- */
/* Screenshot heuristics                                                      */
/* -------------------------------------------------------------------------- */

export interface WatchScreenshotOptions {
  /** Treat window blur as a screenshot signal (mobile screen-capture often blurs). */
  treatBlurAsSignal?: boolean;
  /** Treat tab hidden / visibility change as a screenshot signal. */
  treatHiddenAsSignal?: boolean;
}

/**
 * Watch for keypresses, blur, and visibility transitions that commonly
 * precede or accompany a screenshot. Cannot truly block OS-level capture.
 */
export function watchScreenshot(
  listener: GuardListener,
  options: WatchScreenshotOptions = {},
): Teardown {
  if (SSR) return () => {};
  const { treatBlurAsSignal = true, treatHiddenAsSignal = true } = options;

  const onKey = (e: KeyboardEvent): void => {
    // PrintScreen, plus common screenshot shortcuts on macOS (Cmd+Shift+3/4/5)
    // and Windows (Win+Shift+S, Win+PrtScn).
    const k = e.key;
    const code = e.code;
    const isPrintScreen = k === 'PrintScreen' || code === 'PrintScreen';
    const isMacShot =
      e.metaKey && e.shiftKey && (k === '3' || k === '4' || k === '5');
    const isWinSnip = (e.metaKey || e.getModifierState('OS')) && e.shiftKey && k.toLowerCase() === 's';
    if (isPrintScreen || isMacShot || isWinSnip) {
      emit(listener, 'screenshot-key', { key: k, code });
    }
  };

  const onBlur = (): void => {
    if (treatBlurAsSignal) emit(listener, 'window-blur');
  };

  const onVisibility = (): void => {
    if (!treatHiddenAsSignal) return;
    if (document.visibilityState === 'hidden') {
      emit(listener, 'visibility-hidden');
    } else {
      emit(listener, 'visibility-visible');
    }
  };

  const onFullscreen = (): void => {
    if (!document.fullscreenElement) emit(listener, 'fullscreen-exit');
  };

  window.addEventListener('keydown', onKey, true);
  window.addEventListener('keyup', onKey, true);
  window.addEventListener('blur', onBlur);
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('fullscreenchange', onFullscreen);

  return () => {
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('keyup', onKey, true);
    window.removeEventListener('blur', onBlur);
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('fullscreenchange', onFullscreen);
  };
}

/* -------------------------------------------------------------------------- */
/* Print interception                                                         */
/* -------------------------------------------------------------------------- */

export interface WatchPrintOptions {
  /** When true, replace window.print with a no-op while watcher is active. */
  blockNativePrint?: boolean;
  /** When true, intercept Ctrl+P / Cmd+P keystrokes and prevent default. */
  blockPrintShortcut?: boolean;
}

export function watchPrint(
  listener: GuardListener,
  options: WatchPrintOptions = {},
): Teardown {
  if (SSR) return () => {};
  const { blockNativePrint = true, blockPrintShortcut = true } = options;

  const onBefore = (): void => emit(listener, 'print-attempt');
  const onAfter = (): void => emit(listener, 'print-after');

  const onKey = (e: KeyboardEvent): void => {
    const isPrint = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p';
    if (isPrint) {
      emit(listener, 'print-attempt', { source: 'shortcut' });
      if (blockPrintShortcut) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  window.addEventListener('beforeprint', onBefore);
  window.addEventListener('afterprint', onAfter);
  window.addEventListener('keydown', onKey, true);

  let originalPrint: typeof window.print | undefined;
  let printReplaced = false;
  if (blockNativePrint && typeof window.print === 'function') {
    originalPrint = window.print;
    window.print = function tkxBlockedPrint(): void {
      emit(listener, 'print-attempt', { source: 'window.print' });
      // Do nothing — host page can re-enable by calling teardown.
    };
    printReplaced = true;
  }

  return () => {
    window.removeEventListener('beforeprint', onBefore);
    window.removeEventListener('afterprint', onAfter);
    window.removeEventListener('keydown', onKey, true);
    if (printReplaced && originalPrint) window.print = originalPrint;
  };
}

/* -------------------------------------------------------------------------- */
/* Clipboard interception                                                     */
/* -------------------------------------------------------------------------- */

export interface WatchClipboardOptions {
  /** Block copy/cut/paste/drag operations on the target. */
  blockOps?: boolean;
  /** Replacement text written to clipboard when a copy is intercepted. */
  decoyText?: string;
}

/**
 * Watch (and optionally block) clipboard operations on a target element.
 * Pass document.body to scope to the whole document.
 */
export function watchClipboard(
  target: HTMLElement | Document,
  listener: GuardListener,
  options: WatchClipboardOptions = {},
): Teardown {
  if (SSR) return () => {};
  const { blockOps = true, decoyText } = options;

  const handle = (type: GuardEventType, e: Event): void => {
    emit(listener, type, { target: (e.target as Element)?.tagName });
    if (!blockOps) return;
    e.preventDefault();
    if ((type === 'clipboard-copy' || type === 'clipboard-cut') && decoyText) {
      const ce = e as ClipboardEvent;
      ce.clipboardData?.setData('text/plain', decoyText);
    }
  };

  const onCopy = (e: Event): void => handle('clipboard-copy', e);
  const onCut = (e: Event): void => handle('clipboard-cut', e);
  const onPaste = (e: Event): void => handle('clipboard-paste', e);
  const onDrag = (e: Event): void => handle('drag-start', e);

  target.addEventListener('copy', onCopy as EventListener);
  target.addEventListener('cut', onCut as EventListener);
  target.addEventListener('paste', onPaste as EventListener);
  target.addEventListener('dragstart', onDrag as EventListener);

  return () => {
    target.removeEventListener('copy', onCopy as EventListener);
    target.removeEventListener('cut', onCut as EventListener);
    target.removeEventListener('paste', onPaste as EventListener);
    target.removeEventListener('dragstart', onDrag as EventListener);
  };
}

/* -------------------------------------------------------------------------- */
/* Context-menu suppression                                                   */
/* -------------------------------------------------------------------------- */

export function watchContextMenu(
  target: HTMLElement | Document,
  listener: GuardListener,
  block = true,
): Teardown {
  if (SSR) return () => {};
  const onMenu = (e: Event): void => {
    emit(listener, 'context-menu');
    if (block) e.preventDefault();
  };
  target.addEventListener('contextmenu', onMenu as EventListener);
  return () => target.removeEventListener('contextmenu', onMenu as EventListener);
}

/* -------------------------------------------------------------------------- */
/* DevTools detection                                                         */
/* -------------------------------------------------------------------------- */

export interface WatchDevToolsOptions {
  /** Pixel delta between outer and inner dimensions that suggests devtools is open. */
  sizeThreshold?: number;
  /** Polling interval in ms. */
  pollInterval?: number;
  /** Time threshold in ms — a `debugger` statement that takes longer than this is treated as devtools-open. */
  debuggerThreshold?: number;
  /** Disable the debugger heuristic (it can interrupt legitimate users running their own devtools). */
  disableDebuggerProbe?: boolean;
}

/**
 * Heuristic devtools detector. Two signals:
 *  1. Window size delta (devtools docked changes innerWidth/innerHeight vs outer).
 *  2. `debugger` timing — a no-op `debugger` statement runs in <1ms normally;
 *     when devtools is open and pauses, it takes much longer.
 *
 * Either signal alone is noisy; only emit `devtools-open` when both agree, OR
 * when size delta is large (>= 200px) which is unambiguous.
 */
export function watchDevTools(
  listener: GuardListener,
  options: WatchDevToolsOptions = {},
): Teardown {
  if (SSR) return () => {};
  const {
    sizeThreshold = 160,
    pollInterval = 1000,
    debuggerThreshold = 100,
    disableDebuggerProbe = false,
  } = options;

  let isOpen = false;

  const sizeSignal = (): boolean => {
    const wDelta = Math.abs(window.outerWidth - window.innerWidth);
    const hDelta = Math.abs(window.outerHeight - window.innerHeight);
    return wDelta > sizeThreshold || hDelta > sizeThreshold;
  };

  const debuggerSignal = (): boolean => {
    if (disableDebuggerProbe) return false;
    const start = now();
    // eslint-disable-next-line no-debugger
    debugger;
    return now() - start > debuggerThreshold;
  };

  const tick = (): void => {
    const sizeOpen = sizeSignal();
    const dbgOpen = debuggerSignal();
    const veryLargeSize =
      Math.abs(window.outerWidth - window.innerWidth) > 200 ||
      Math.abs(window.outerHeight - window.innerHeight) > 200;
    const opened = veryLargeSize || (sizeOpen && dbgOpen);
    if (opened && !isOpen) {
      isOpen = true;
      emit(listener, 'devtools-open', { sizeOpen, dbgOpen });
    } else if (!opened && isOpen) {
      isOpen = false;
      emit(listener, 'devtools-close');
    }
  };

  const id = window.setInterval(tick, pollInterval);
  return () => window.clearInterval(id);
}

/* -------------------------------------------------------------------------- */
/* Composite engine                                                           */
/* -------------------------------------------------------------------------- */

export interface ProtectionConfig {
  screenshot?: boolean | WatchScreenshotOptions;
  print?: boolean | WatchPrintOptions;
  clipboard?: boolean | WatchClipboardOptions;
  contextMenu?: boolean;
  devtools?: boolean | WatchDevToolsOptions;
  /** Element scope for clipboard and contextMenu watchers. Defaults to document. */
  target?: HTMLElement | Document;
}

/**
 * Single entry point that wires all selected guards. Returns one teardown
 * that detaches every listener.
 */
export function installProtection(
  listener: GuardListener,
  config: ProtectionConfig = {},
): Teardown {
  if (SSR) return () => {};
  const target = config.target ?? document;
  const teardowns: Teardown[] = [];

  if (config.screenshot) {
    const opts = typeof config.screenshot === 'object' ? config.screenshot : {};
    teardowns.push(watchScreenshot(listener, opts));
  }
  if (config.print) {
    const opts = typeof config.print === 'object' ? config.print : {};
    teardowns.push(watchPrint(listener, opts));
  }
  if (config.clipboard) {
    const opts = typeof config.clipboard === 'object' ? config.clipboard : {};
    teardowns.push(watchClipboard(target, listener, opts));
  }
  if (config.contextMenu) {
    teardowns.push(watchContextMenu(target, listener, true));
  }
  if (config.devtools) {
    const opts = typeof config.devtools === 'object' ? config.devtools : {};
    teardowns.push(watchDevTools(listener, opts));
  }

  return () => {
    for (const t of teardowns) t();
  };
}

/**
 * CSS string that disables text selection, drag, and the iOS callout menu on
 * a region. Apply via inline style or a class — host page chooses.
 */
export const PROTECT_CSS_INLINE: string = [
  'user-select:none',
  '-webkit-user-select:none',
  '-moz-user-select:none',
  '-ms-user-select:none',
  '-webkit-touch-callout:none',
  '-webkit-user-drag:none',
  'user-drag:none',
].join(';');
