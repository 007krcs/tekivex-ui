import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { act } from '@testing-library/react';
import { TkxToastProvider } from '../src/components/TkxToast';
import { ThemeProvider } from '../src/themes';

/**
 * Regression for the App Router hydration failure: the provider used to
 * return a bare fragment on the server but a wrapper <div> on the client, so
 * the first client render never matched the server HTML. Both renders must
 * now produce identical markup; the toast region is portalled after mount.
 */
describe('TkxToastProvider — SSR hydration', () => {
  let root: Root | null = null;
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it('hydrates server HTML without a mismatch', () => {
    const tree = (
      <ThemeProvider mode="light">
        <TkxToastProvider position="top-right">
          <main>
            <h1>PlotPilot</h1>
          </main>
        </TkxToastProvider>
      </ThemeProvider>
    );
    const html = renderToString(tree);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const errors: unknown[] = [];
    const errSpy = vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args));
    try {
      act(() => {
        root = hydrateRoot(container, tree, { onRecoverableError: (e) => errors.push(e) });
      });
    } finally {
      errSpy.mockRestore();
    }
    expect(errors.map(String).join('\n')).not.toMatch(/hydrat|did not match|#418|#423/i);
    expect(container.querySelector('h1')?.textContent).toBe('PlotPilot');
    container.remove();
  });
});
