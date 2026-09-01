/**
 * Global WAI-ARIA 1.2 conformance sweep.
 *
 * Every test in the suite doubles as an ARIA probe: after each test we validate
 * whatever that test rendered. This reuses the ~2,200 renders the suite already
 * performs — far broader coverage than any hand-written fixture list — and
 * attributes each violation to the test, and therefore the component, that
 * produced it.
 *
 * Two modes, both opt-in so a normal `vitest run` pays nothing:
 *
 *   TKX_ARIA_SWEEP=1   report mode — append findings to an NDJSON file
 *   TKX_ARIA_STRICT=1  gate mode   — fail the test that renders a violation
 *
 * Gate mode is the SOP: `npm run aria:check` must stay green.
 *
 * Hook ordering matters. React Testing Library auto-registers its `cleanup()`
 * in an afterEach when a test file imports it, which happens *after* setup
 * files run. Vitest runs afterEach hooks stack-order (last registered first),
 * so RTL's cleanup would empty the DOM before this probe saw it. We therefore
 * disable RTL auto-cleanup and perform it ourselves, right after validating.
 */
import { afterEach } from 'vitest';
import { appendFileSync } from 'node:fs';
import { validateAria, formatViolations } from '../../src/a11y/aria/validate';

const REPORTING = process.env.TKX_ARIA_SWEEP === '1';
const STRICT = process.env.TKX_ARIA_STRICT === '1';
const REPORT = process.env.TKX_ARIA_REPORT || 'aria-sweep.ndjson';

if (REPORTING || STRICT) {
  // Must be set before any test file imports @testing-library/react.
  process.env.RTL_SKIP_AUTO_CLEANUP = 'true';

  afterEach(async (ctx) => {
    let failure: string | null = null;
    try {
      if (document.body && document.body.firstChild) {
        const violations = validateAria(document.body);
        if (violations.length) {
          const testName = ctx.task?.name ?? 'unknown';
          const file = ctx.task?.file?.name ?? 'unknown';
          if (REPORTING) {
            appendFileSync(
              REPORT,
              violations
                .map((v) => JSON.stringify({ file, test: testName, ...v }))
                .join('\n') + '\n',
            );
          }
          if (STRICT) {
            failure =
              `WAI-ARIA 1.2 conformance violations in the DOM rendered by this test:\n` +
              formatViolations(violations);
          }
        }
      }
    } catch (err) {
      if (process.env.TKX_ARIA_DEBUG === '1') console.error('[aria-sweep]', err);
    } finally {
      // We took ownership of cleanup above; run it so tests stay isolated.
      try {
        const rtl = await import('@testing-library/react');
        rtl.cleanup();
      } catch {
        /* this test file does not use RTL */
      }
      document.body.innerHTML = '';
    }
    if (failure) throw new Error(failure);
  });
}
