import '@testing-library/jest-dom';

// jsdom does not implement Element.prototype.scrollTo — provide a no-op stub
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function () {};
}

// jsdom does not implement Element.prototype.scrollIntoView — provide a no-op stub
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {};
}

// jsdom returns zero-rect for getBoundingClientRect — provide a realistic stub
const _origGetBCR = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function () {
  const result = _origGetBCR ? _origGetBCR.call(this) : null;
  if (result && (result.width > 0 || result.height > 0)) return result;
  return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
};

// jsdom Window does not have getBoundingClientRect — add a stub so TkxAffix
// scroll checks don't throw when `window instanceof Window` check fails.
if (typeof (window as unknown as Record<string, unknown>).getBoundingClientRect !== 'function') {
  (window as unknown as Record<string, unknown>).getBoundingClientRect = () => ({
    top: 0, left: 0, right: 1024, bottom: 768, width: 1024, height: 768, x: 0, y: 0, toJSON: () => ({}),
  });
}

// jsdom does not implement ResizeObserver — recharts v3 calls `new ResizeObserver()`
// inside ResponsiveContainer, which throws "is not a constructor" without this.
if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver !== 'function') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub;
}

// jsdom does not implement window.matchMedia — provide a minimal stub
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom does not implement HTMLCanvasElement.getContext fully — provide a
// stub that returns a no-op 2D context so canvas-using components don't
// throw "Not implemented" warnings during tests. Real rendering is covered
// by Playwright visual regression at tests/visual/.
const _origGetContext = HTMLCanvasElement.prototype.getContext as
  | ((id: string, opts?: any) => any)
  | undefined;
HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, id: string, opts?: any) {
  try {
    const real = _origGetContext?.call(this, id as any, opts);
    if (real) return real;
  } catch {
    /* fall through */
  }
  if (id === '2d') {
    const noop = () => {};
    return {
      canvas: this,
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      globalAlpha: 1,
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      filter: 'none',
      // Drawing methods — no-ops, return undefined.
      fillRect: noop,
      strokeRect: noop,
      clearRect: noop,
      fillText: noop,
      strokeText: noop,
      beginPath: noop,
      closePath: noop,
      moveTo: noop,
      lineTo: noop,
      arc: noop,
      arcTo: noop,
      bezierCurveTo: noop,
      quadraticCurveTo: noop,
      rect: noop,
      stroke: noop,
      fill: noop,
      clip: noop,
      save: noop,
      restore: noop,
      translate: noop,
      rotate: noop,
      scale: noop,
      transform: noop,
      setTransform: noop,
      resetTransform: noop,
      drawImage: noop,
      putImageData: noop,
      // Returning fields used by capture pipelines.
      createImageData: (w: number, h: number) =>
        ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4), colorSpace: 'srgb' as any }),
      getImageData: (_x: number, _y: number, w: number, h: number) =>
        ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4), colorSpace: 'srgb' as any }),
      measureText: (text: string) => ({ width: text.length * 6 }) as TextMetrics,
    };
  }
  return null;
} as any;

// HTMLCanvasElement.toBlob — call back asynchronously with a tiny PNG blob
// so consumers that await `toBlob` don't hang.
if (!('toBlob' in HTMLCanvasElement.prototype)) {
  (HTMLCanvasElement.prototype as any).toBlob = function (
    cb: (blob: Blob | null) => void,
  ) {
    setTimeout(() => cb(new Blob([], { type: 'image/png' })), 0);
  };
}

// HTMLCanvasElement.toDataURL — return a tiny known data URL.
if (HTMLCanvasElement.prototype.toDataURL.toString().includes('Not implemented')) {
  HTMLCanvasElement.prototype.toDataURL = () =>
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';
}
