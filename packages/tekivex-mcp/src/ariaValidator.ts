/**
 * Bridge the library's WAI-ARIA validator to a plain HTML string.
 *
 * The validator walks a DOM, so the server needs a parser. Node 20+ has none
 * built in, so we accept an injected DOM implementation: the CLI wires up
 * jsdom when it is installed, and the tool degrades to a clear error rather
 * than a false "conformant" when it is not. Reporting a pass we cannot prove
 * would be worse than reporting nothing.
 */
import { validateAria } from 'tekivex-ui/a11y-aria';
import type { AriaCheck } from './tools.js';

export interface DomFactory {
  (html: string): { body: ParentNode } | null;
}

/** Wrap a DOM factory into the validator signature the server expects. */
export function createAriaValidator(domFactory: DomFactory) {
  return (html: string): AriaCheck[] => {
    const doc = domFactory(html);
    if (!doc) {
      throw new Error(
        'No DOM implementation available. Install jsdom to enable ui_audit_accessibility.',
      );
    }
    return validateAria(doc.body);
  };
}

/** Try jsdom; return null when it is not installed. */
export async function defaultDomFactory(): Promise<DomFactory | null> {
  try {
    const { JSDOM } = await import('jsdom');
    return (html: string) => {
      const dom = new JSDOM(`<!doctype html><body>${html}</body>`);
      // The validator uses CSS.escape, which jsdom does not implement.
      const win = dom.window as unknown as { CSS?: { escape(s: string): string } };
      if (!win.CSS) win.CSS = { escape: (s: string) => s.replace(/([^\w-])/g, '\$1') };
      const g = globalThis as unknown as { CSS?: { escape(s: string): string } };
      if (!g.CSS) g.CSS = win.CSS;
      return { body: dom.window.document.body };
    };
  } catch {
    return null;
  }
}
