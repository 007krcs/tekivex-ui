/**
 * WAI-ARIA 1.2 conformance validator.
 *
 * This is the same checker that gates the library's own build (see
 * docs/ARIA-CONFORMANCE-SOP.md), exposed so consumers can run it against their
 * own rendered output — in their test suite, in CI, or through the MCP server.
 *
 * It validates a DOM subtree, so it needs a DOM: a browser, jsdom, or any
 * equivalent. It checks structure only; contrast and focus visibility need a
 * real browser and are deliberately out of scope.
 */
export { validateAria, formatViolations, effectiveRole, accessibleName } from './validate';
export type { AriaViolation, ValidateOptions } from './validate';
export * from './spec';
