import '@testing-library/jest-dom';

// jsdom does not implement Element.prototype.scrollTo — provide a no-op stub
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function () {};
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
