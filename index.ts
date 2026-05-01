// ── TekiVex UI — Root Barrel Export ─────────────────────────────────────────
// Quantum-Class Component Framework | WCAG 2.1 AAA | WAI-ARIA 1.2

import './src/styles/global.css';

// Theme System
export { ThemeProvider, ThemeContext, useTheme, createTheme, quantumDark, auroraLight, generatePalette, typography, spacing, breakpoints, shadows, zIndex, radii } from './src/themes';
export type { ThemeTokens, ThemeProviderProps, ColorPalette } from './src/themes';

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

// Enterprise Components (v2.1+)
export * from './src/components/TkxBreadcrumb';
export * from './src/components/TkxPopover';
export * from './src/components/TkxAutocomplete';
export * from './src/components/TkxTreeView';
export * from './src/components/TkxToolbar';
export * from './src/components/TkxTransferList';
export * from './src/components/TkxSpeedDial';
export * from './src/components/TkxAppBar';
export * from './src/components/TkxBottomNav';
export * from './src/components/TkxSnackbar';
export * from './src/components/TkxDataGrid';
export * from './src/components/TkxMasonry';
export * from './src/components/TkxRichTextDisplay';
export * from './src/components/TkxMarkdown';

// Core Components (v2.2+)
export * from './src/components/TkxForm';
export * from './src/components/TkxLayout';
export * from './src/components/TkxConfigProvider';
export * from './src/components/TkxTypography';
export * from './src/components/TkxSpin';
export * from './src/components/TkxEmpty';
export * from './src/components/TkxStatistic';

// Components (v2.3+)
export * from './src/components/TkxSegmented';
export * from './src/components/TkxMentions';
export * from './src/components/TkxQRCode';
export * from './src/components/TkxResult';
export * from './src/components/TkxTour';
export * from './src/components/TkxWatermark';
export * from './src/components/TkxAffix';
export * from './src/components/TkxAnchor';
export * from './src/components/TkxCascader';
export * from './src/components/TkxList';

export { TkxOrgChart } from './src/components/TkxOrgChart';
export type { TkxOrgChartProps, OrgNode } from './src/components/TkxOrgChart';

// i18n / RTL — locale strings live in '@tekivex/ui/i18n' to keep the main bundle small.
// Provider, hooks and direction utils stay here so most apps can use i18n with one English locale or none.
export { I18nProvider } from './src/i18n/I18nProvider';
export { useI18n, useLocale, useDirection, isRTL, I18nContext } from './src/i18n';
// Note: locale strings (enUS, esES, frFR, ...) and LOCALES are now exported from '@tekivex/ui/i18n'
export type { LocaleStrings, LocaleCode, Direction, I18nContextValue } from './src/i18n';
export type { I18nProviderProps } from './src/i18n/I18nProvider';

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
export {
  Shield,
  SecurityCore,
  sanitizeString,
  sanitizeHref,
  sanitizeHTML,
  sanitizeCSS,
  sanitizeJSON,
  sanitizeUnicode,
  sanitizeProps,
  validateProps,
  isSafeAttrName,
  buildTkxCSP,
  installTrustedTypes,
  isFramed,
  installFrameBuster,
  createRateLimiter,
  sniffMimeType,
  scrubPII,
  deepFreeze,
  audit,
  getAuditLog,
  verifyAuditIntegrity,
} from './src/engine/security';
export type { TkxCSPOptions, RateLimiter } from './src/engine/security';
export { WCAGEngine, contrastRatio, meetsAA, meetsAAA, getAccessibleForeground, createFocusTrap, prefersReducedMotion, prefersHighContrast } from './src/engine/wcag';
export { TKX, css, fromObject, responsive, keyframes, cssVar, extractCSS, injectStyles } from './src/engine/css';

// TKX Atomic CSS Engine — the utility-first system (better than Tailwind)
export { tkx, tx, cx, extractAtomicCSS, resetAtomicCSS, tkxPlugin, tkxRemovePlugin, tkxListPlugins, resolvePluginUtility } from './src/engine/tkx';
export type { TkxPluginDef } from './src/engine/tkx';
export type { TkxInput as TkxUtilityInput } from './src/engine/tkx';

export { TkxDropdown } from './src/components/TkxDropdown';
export type { TkxDropdownProps, DropdownItem, DropdownGroup } from './src/components/TkxDropdown';

// ── AI-native components ──────────────────────────────────────────────────────
export { TkxAIConfidenceBar } from './src/components/TkxAIConfidenceBar';
export type { TkxAIConfidenceBarProps } from './src/components/TkxAIConfidenceBar';
export { TkxAIChatBubble } from './src/components/TkxAIChatBubble';
export type { TkxAIChatBubbleProps, AIRole } from './src/components/TkxAIChatBubble';
export { TkxAIThinking } from './src/components/TkxAIThinking';
export type { TkxAIThinkingProps } from './src/components/TkxAIThinking';

// Biodata content-protection components (Phase 0b)
export { TkxScreenshotGuard } from './src/components/TkxScreenshotGuard';
export type { TkxScreenshotGuardProps } from './src/components/TkxScreenshotGuard';
export { TkxPrintGuard } from './src/components/TkxPrintGuard';
export type { TkxPrintGuardProps } from './src/components/TkxPrintGuard';
export { TkxClipboardGuard } from './src/components/TkxClipboardGuard';
export type { TkxClipboardGuardProps } from './src/components/TkxClipboardGuard';
export { TkxDevToolsGuard } from './src/components/TkxDevToolsGuard';
export type { TkxDevToolsGuardProps } from './src/components/TkxDevToolsGuard';
export { TkxDynamicWatermark } from './src/components/TkxDynamicWatermark';
export type { TkxDynamicWatermarkProps } from './src/components/TkxDynamicWatermark';

// Biodata rendering components (Phase 0b)
export { TkxCanvasRenderer } from './src/components/TkxCanvasRenderer';
export type { TkxCanvasRendererProps } from './src/components/TkxCanvasRenderer';
export {
  TkxTemplateRenderer,
  createTemplateRegistry,
  useTemplateScene,
} from './src/components/TkxTemplateRenderer';
export type {
  TkxTemplateRendererProps,
  TkxBiodataTemplate,
  TkxTemplateRegistry,
} from './src/components/TkxTemplateRenderer';
export { TkxPdfExport } from './src/components/TkxPdfExport';
export type { TkxPdfExportProps } from './src/components/TkxPdfExport';
export { TkxImageExport } from './src/components/TkxImageExport';
export type { TkxImageExportProps } from './src/components/TkxImageExport';
export { TkxIndicShaper } from './src/components/TkxIndicShaper';
export type { TkxIndicShaperProps } from './src/components/TkxIndicShaper';

// Biodata form-helper components (Phase 0b)
export { TkxFieldArray } from './src/components/TkxFieldArray';
export type { TkxFieldArrayProps, TkxFieldArrayHelpers } from './src/components/TkxFieldArray';
export { TkxImageCrop } from './src/components/TkxImageCrop';
export type { TkxImageCropProps, TkxImageCropHandle } from './src/components/TkxImageCrop';
export { TkxSignaturePad } from './src/components/TkxSignaturePad';
export type { TkxSignaturePadProps, TkxSignaturePadHandle } from './src/components/TkxSignaturePad';
export { TkxPhoneInput, DEFAULT_COUNTRIES } from './src/components/TkxPhoneInput';
export type { TkxPhoneInputProps, CountryDialCode } from './src/components/TkxPhoneInput';
export { TkxMaskedInput } from './src/components/TkxMaskedInput';
export type { TkxMaskedInputProps } from './src/components/TkxMaskedInput';

// Biodata payment + download components (Phase 0b)
export { TkxPaymentProvider, useTkxPayment } from './src/components/TkxPaymentProvider';
export type { TkxPaymentProviderProps } from './src/components/TkxPaymentProvider';
export { TkxRazorpayCheckout } from './src/components/TkxRazorpayCheckout';
export type { TkxRazorpayCheckoutProps } from './src/components/TkxRazorpayCheckout';
export { TkxCaptcha } from './src/components/TkxCaptcha';
export type { TkxCaptchaProps } from './src/components/TkxCaptcha';
export { TkxSecureDownload } from './src/components/TkxSecureDownload';
export type { TkxSecureDownloadProps } from './src/components/TkxSecureDownload';
export { TkxHoneypot } from './src/components/TkxHoneypot';
export type { TkxHoneypotProps } from './src/components/TkxHoneypot';

// Note: heavy feature bundles are exposed via subpath exports to keep the root bundle small.
//   Quantum AI components & engine  → '@tekivex/ui/quantum'
//     (TkxQuantumForm, TkxThemeBuilder, TkxPlayground, QuantumAI, Qubit, QuantumAnnealer, ...)
//   Real-Time UI components         → '@tekivex/ui/realtime'
//     (TkxLiveFeed, TkxLiveMetrics, TkxRealTimeChart, TkxLiveLog)
//   27-locale i18n strings          → '@tekivex/ui/i18n'
//   Charts (recharts wrapper)       → '@tekivex/ui/charts'
//   Headless hooks                  → '@tekivex/ui/headless'
