/**
 * axe-core harness for jsdom.
 *
 * axe is the industry-standard implementation of the WCAG / ARIA rule set, so
 * it is the second opinion alongside our spec validator. Under jsdom it cannot
 * evaluate anything that needs layout or paint, so those rules are disabled
 * explicitly rather than left to report misleading passes — real colour and
 * focus-visibility checks belong in the Playwright suite.
 */
import axe, { type AxeResults, type RunOptions } from 'axe-core';

/** Rules that cannot produce a trustworthy result without layout. */
const LAYOUT_DEPENDENT = [
  'color-contrast',
  'link-in-text-block',
  'scrollable-region-focusable',
  'target-size',
];

export interface AxeViolation {
  id: string;
  impact: string;
  help: string;
  nodes: string[];
}

export async function runAxe(
  container: Element,
  options: RunOptions = {},
): Promise<AxeViolation[]> {
  const results: AxeResults = await axe.run(container, {
    resultTypes: ['violations'],
    rules: Object.fromEntries(LAYOUT_DEPENDENT.map((id) => [id, { enabled: false }])),
    ...options,
  });
  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? 'unknown',
    help: v.help,
    nodes: v.nodes.map((n) => n.html),
  }));
}

export function formatAxe(violations: AxeViolation[]): string {
  if (!violations.length) return 'no violations';
  return violations
    .map(
      (v) =>
        `  [${v.impact}] ${v.id}: ${v.help}\n` +
        v.nodes.slice(0, 3).map((n) => `      ${n}`).join('\n'),
    )
    .join('\n');
}
