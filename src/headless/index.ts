// ── @tekivex/ui/headless ─────────────────────────────────────────────────────
// Behavior-only primitives, hooks, and utilities — zero styles shipped.
// Use these to build completely custom UI on top of TekiVex's battle-tested
// accessibility, form, and interaction logic.
//
// Import from '@tekivex/ui/headless' — no CSS, no theme tokens, no components.
//
// @example
// import { useDisclosure, useFocusTrap, useFormState, useRovingTabIndex } from '@tekivex/ui/headless';
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
export { sanitizeString, sanitizeProps } from '../engine/security';

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
