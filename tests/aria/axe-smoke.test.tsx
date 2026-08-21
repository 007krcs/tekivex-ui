import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../../src/themes';
import { runAxe, formatAxe } from './axe';
import { TkxButton } from '../../src/components/TkxButton';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('axe-core harness', () => {
  it('runs under jsdom and passes a known-good component', async () => {
    const { container } = render(<TkxButton>Save</TkxButton>, { wrapper: W });
    const v = await runAxe(container);
    expect(formatAxe(v)).toBe('no violations');
  });

  // This fixture renders invalid markup ON PURPOSE to prove the detector
  // works, so it must be exempt from the strict global sweep that would
  // otherwise (correctly) fail it.
  it('detects a known-bad pattern', { skip: process.env.TKX_ARIA_STRICT === '1' }, async () => {
    const { container } = render(
      <div>
        <img src="x.png" />
        <button aria-labelledby="missing" />
      </div>,
    );
    const v = await runAxe(container);
    expect(v.length).toBeGreaterThan(0);
  });
});
