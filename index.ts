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

// New Components
export { TkxSelect } from './src/components/TkxSelect';
export type { TkxSelectProps, SelectOption, SelectSize } from './src/components/TkxSelect';

export { TkxCheckbox } from './src/components/TkxCheckbox';
export type { TkxCheckboxProps, CheckboxSize } from './src/components/TkxCheckbox';

export { TkxRadio, TkxRadioGroup } from './src/components/TkxRadio';
export type { TkxRadioProps, TkxRadioGroupProps } from './src/components/TkxRadio';

export { TkxToastProvider, useToast } from './src/components/TkxToast';
export type { TkxToastProps, ToastItem, ToastVariant, ToastPosition } from './src/components/TkxToast';

export { TkxAccordion } from './src/components/TkxAccordion';
export type { TkxAccordionProps, AccordionItem } from './src/components/TkxAccordion';

export { TkxDrawer } from './src/components/TkxDrawer';
export type { TkxDrawerProps, DrawerPlacement, DrawerSize } from './src/components/TkxDrawer';

export { TkxDatePicker } from './src/components/TkxDatePicker';
export type { TkxDatePickerProps, DatePickerMode } from './src/components/TkxDatePicker';

export { TkxSlider } from './src/components/TkxSlider';
export type { TkxSliderProps } from './src/components/TkxSlider';

export { TkxPagination } from './src/components/TkxPagination';
export type { TkxPaginationProps } from './src/components/TkxPagination';

export { TkxImage } from './src/components/TkxImage';
export type { TkxImageProps, ImageFit, ImageRatio } from './src/components/TkxImage';

export { TkxFileUpload } from './src/components/TkxFileUpload';
export type { TkxFileUploadProps } from './src/components/TkxFileUpload';

export { TkxRating } from './src/components/TkxRating';
export type { TkxRatingProps, RatingSize } from './src/components/TkxRating';

export { TkxChat, TkxChatBubble, TkxThinkingIndicator } from './src/components/TkxChat';
export type { TkxChatProps, TkxChatBubbleProps, ChatMessage, MessageRole } from './src/components/TkxChat';

export { TkxTag, TkxTagInput } from './src/components/TkxTag';
export type { TkxTagProps, TkxTagInputProps, TagVariant, TagSize, TagColorScheme } from './src/components/TkxTag';

export { TkxTimeline } from './src/components/TkxTimeline';
export type { TkxTimelineProps, TimelineItem, TimelineVariant, TimelineItemStatus } from './src/components/TkxTimeline';

export { TkxMenu } from './src/components/TkxMenu';
export type { TkxMenuProps } from './src/components/TkxMenu';

export { TkxClock } from './src/components/TkxClock';
export type { TkxClockProps } from './src/components/TkxClock';

export { TkxVideoPlayer } from './src/components/TkxVideoPlayer';
export type { TkxVideoPlayerProps } from './src/components/TkxVideoPlayer';

export { TkxStepper } from './src/components/TkxStepper';
export type { TkxStepperProps } from './src/components/TkxStepper';

export { TkxColorPicker } from './src/components/TkxColorPicker';
export type { TkxColorPickerProps, ColorFormat } from './src/components/TkxColorPicker';

export { TkxNumberInput } from './src/components/TkxNumberInput';
export type { TkxNumberInputProps } from './src/components/TkxNumberInput';

export { TkxOTP } from './src/components/TkxOTP';
export type { TkxOTPProps } from './src/components/TkxOTP';

export { TkxCommand, useTkxCommand } from './src/components/TkxCommand';
export type { TkxCommandProps, CommandItem } from './src/components/TkxCommand';

export { TkxCarousel } from './src/components/TkxCarousel';
export type { TkxCarouselProps } from './src/components/TkxCarousel';

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
