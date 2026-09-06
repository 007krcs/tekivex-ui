// Where this landing is mounted. '' when served standalone at '/', '/ui' when
// vendored into www.tekivex.com. Vite bakes BASE_URL from --base / VITE_BASE.
// React Router <Link>/<Navigate> get this via <BrowserRouter basename>; this
// helper is for plain <a href> / <img src> that point at sibling apps
// (/playground/, /book/), Astro docs pages (/security/) or public/ files.
export const BASE: string = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

export function withBase(rootAbsolutePath: string): string {
  return BASE + rootAbsolutePath;
}
