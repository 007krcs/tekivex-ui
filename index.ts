// ── TekiVex UI — Root Barrel Export ─────────────────────────────────────────
// Quantum-Class Component Framework | WCAG 2.1 AAA | WAI-ARIA 1.2

import './src/styles/global.css';

// Theme System
export { ThemeProvider, ThemeContext, useTheme, createTheme, quantumDark, auroraLight } from './src/themes';
export type { ThemeTokens, ThemeProviderProps } from './src/themes';

// Components
export { TkxButton } from './src/components/TkxButton';
export type { TkxButtonProps, ButtonVariant, ButtonSize, ButtonColorScheme } from './src/components/TkxButton';

export { TkxCard, TkxCardHeader, TkxCardBody, TkxCardFooter } from './src/components/TkxCard';
export type { TkxCardProps, TkxCardHeaderProps, CardVariant, CardPadding } from './src/components/TkxCard';

export { TkxInput } from './src/components/TkxInput';
export type { TkxInputProps } from './src/components/TkxInput';

export { TkxBadge } from './src/components/TkxBadge';
export type { TkxBadgeProps, BadgeVariant, BadgeSize } from './src/components/TkxBadge';

export { TkxProgress } from './src/components/TkxProgress';
export type { TkxProgressProps, ProgressVariant, ProgressSize } from './src/components/TkxProgress';

export { TkxToggle } from './src/components/TkxToggle';
export type { TkxToggleProps, ToggleSize } from './src/components/TkxToggle';

export { TkxAlert } from './src/components/TkxAlert';
export type { TkxAlertProps, AlertVariant } from './src/components/TkxAlert';

export { TkxModal } from './src/components/TkxModal';
export type { TkxModalProps, ModalSize } from './src/components/TkxModal';

export {
  TkxTabs,
  TkxTabList,
  TkxTab,
  TkxTabPanels,
  TkxTabPanel,
} from './src/components/TkxTabs';
export type { TkxTabsProps, TkxTabListProps, TkxTabProps, TkxTabPanelProps } from './src/components/TkxTabs';

export { TkxTooltip } from './src/components/TkxTooltip';
export type { TkxTooltipProps, TooltipPlacement } from './src/components/TkxTooltip';

export { TkxSkeleton } from './src/components/TkxSkeleton';
export type { TkxSkeletonProps, SkeletonVariant, SkeletonAnimation } from './src/components/TkxSkeleton';

export { TkxAvatar } from './src/components/TkxAvatar';
export type { TkxAvatarProps, AvatarSize, AvatarShape, AvatarStatus } from './src/components/TkxAvatar';

export { TkxTable } from './src/components/TkxTable';
export type { TkxTableProps, ColumnDef, SortDirection } from './src/components/TkxTable';

export { TkxDivider } from './src/components/TkxDivider';
export type { TkxDividerProps } from './src/components/TkxDivider';

// Accessibility Primitives
export { SkipNav, LiveRegion, FocusTrap, VisuallyHidden } from './src/a11y';
export type { SkipNavProps, LiveRegionProps, FocusTrapProps } from './src/a11y';

// Hooks
export {
  useReducedMotion,
  useHighContrast,
  useFocusTrap,
  useAnnounce,
  useEscapeKey,
  useClickOutside,
} from './src/hooks';

// Engine APIs (public surface)
export { Quantum, fnv1aHash, LRUCache, memoize, batchUpdate } from './src/engine/quantum';
export { Shield, sanitizeString, sanitizeProps, validateProps, audit, getAuditLog, verifyAuditIntegrity } from './src/engine/security';
export { WCAGEngine, contrastRatio, meetsAA, meetsAAA, getAccessibleForeground, createFocusTrap, prefersReducedMotion, prefersHighContrast } from './src/engine/wcag';
export { TKX, css, fromObject, responsive, keyframes, cssVar, extractCSS, injectStyles } from './src/engine/css';

// TKX Atomic CSS Engine — the utility-first system (better than Tailwind)
export { tkx, tx, cx, extractAtomicCSS, resetAtomicCSS } from './src/engine/tkx';
export type { TkxInput as TkxUtilityInput } from './src/engine/tkx';
