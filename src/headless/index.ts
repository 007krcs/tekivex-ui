'use client';

// ── tekivex-ui/headless ─────────────────────────────────────────────────────
// Behavior-only primitives, hooks, and utilities — zero styles shipped.
// Use these to build completely custom UI on top of TekiVex's battle-tested
// accessibility, form, and interaction logic.
//
// Import from 'tekivex-ui/headless' — no CSS, no theme tokens, no components.
//
// @example
// import { useDisclosure, useFocusTrap, useFormState, useRovingTabIndex } from 'tekivex-ui/headless';
// ─────────────────────────────────────────────────────────────────────────────

// ── Accessibility hooks ──────────────────────────────────────────────────────
export {
  useReducedMotion,
  useHighContrast,
  useFocusTrap,
  useAnnounce,
  useEscapeKey,
  useClickOutside,
} from '../hooks';

// ── Form primitives ──────────────────────────────────────────────────────────
export { useTkxForm } from '../components/TkxForm';
export type { FormInstance, ValidationRule } from '../components/TkxForm';

// ── Engine utilities ─────────────────────────────────────────────────────────
export { extractAtomicCSS, resetAtomicCSS, cx, tkxPlugin, tkxRemovePlugin, tkxListPlugins } from '../engine/tkx';
export { extractCSS, resetStyles, injectStyles, cssVar } from '../engine/css';
export { meetsAA, meetsAAA, contrastRatio } from '../engine/wcag';

// ── Security kernel ──────────────────────────────────────────────────────────
// Behavior-only security primitives. Same implementations the components use
// internally — exposed here so server-side consumers, Node/Edge runtimes, and
// custom-UI builders can reach them without pulling in the full component
// bundle. See: /recipes/secure-file-upload, /recipes/audit-trail,
// /recipes/pii-redaction-before-llm.
export {
  // Input sanitization
  sanitizeString,
  sanitizeProps,
  sanitizeUnicode,
  sanitizeJSON,
  // File type verification (real magic bytes, not Content-Type)
  sniffMimeType,
  // PII redaction (regex + Luhn-validated card numbers)
  scrubPII,
  // Tamper-evident audit log (SHA-256 hash-chained)
  audit,
  getAuditLog,
  verifyAuditIntegrity,
  sha256Hex,
  // CSP + Trusted Types
  buildTkxCSP,
  installTrustedTypes,
  // Environment checks
  isFramed,
  // Client-side rate limiting
  createRateLimiter,
} from '../engine/security';
export type {
  AuditEntry,
  AuditFilter,
  CSPDirectives,
  TkxCSPOptions,
  RateLimiter,
  PropSchema,
  ValidationResult,
  ComponentPermissions,
} from '../engine/security';

// ── Interaction hooks ────────────────────────────────────────────────────────
// Additional behavior primitives beyond the base hook set.

export { useDisclosure } from './useDisclosure';
export { useRovingTabIndex } from './useRovingTabIndex';
export { useFormState } from './useFormState';
export { useListSelection } from './useListSelection';
export { useDebounce } from './useDebounce';
export { useThrottle } from './useThrottle';
export { useControllable } from './useControllable';
export { useMediaQuery } from './useMediaQuery';
export { useLocalStorage } from './useLocalStorage';
export { useIntersectionObserver } from './useIntersectionObserver';
export { useWebSocket } from './useWebSocket';
export type { WebSocketOptions, WebSocketState } from './useWebSocket';
export { useSSE } from './useSSE';
export type { SSEOptions, SSEState } from './useSSE';
export { useInfiniteQuery } from './useInfiniteQuery';
export type { InfiniteQueryOptions, InfiniteQueryState } from './useInfiniteQuery';

// ── Validation resolvers (bring-your-own zod / valibot) ──────────────────────
export { zodResolver, useFormWithZod } from './zodResolver';
export type { ZodResolverConfig, ZodSchemaLike, ZodIssueLike } from './zodResolver';
export { valibotResolver, useFormWithValibot } from './valibotResolver';
export type {
  ValibotResolverConfig,
  ValibotSafeParseFn,
  ValibotSafeParseResult,
  ValibotIssueLike,
} from './valibotResolver';

// ── React Hook Form adapter (bring-your-own Controller) ──────────────────────
export { createRHFBindings } from './rhfBindings';
export type {
  RHFControl,
  RHFFieldRenderProps,
  RHFBindings,
  RHFControllerComponent,
  CreateRHFBindingsConfig,
} from './rhfBindings';