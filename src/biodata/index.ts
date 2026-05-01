/**
 * tekivex-ui/biodata
 *
 * Sub-export bundling every biodata-domain symbol added in v2.7. Apps that
 * are *only* building biodata flows can import from this entry to skip the
 * rest of the library:
 *
 *   import { TkxBiodataPreview, TkxPdfExport, sceneToPdfBlob }
 *     from 'tekivex-ui/biodata';
 *
 * Apps that already use the main entry don't need this file — every symbol
 * here is also re-exported from the root.
 */

/* -------------------------------------------------------------------------- */
/* Components                                                                  */
/* -------------------------------------------------------------------------- */

export { TkxScreenshotGuard } from '../components/TkxScreenshotGuard';
export type { TkxScreenshotGuardProps } from '../components/TkxScreenshotGuard';
export { TkxPrintGuard } from '../components/TkxPrintGuard';
export type { TkxPrintGuardProps } from '../components/TkxPrintGuard';
export { TkxClipboardGuard } from '../components/TkxClipboardGuard';
export type { TkxClipboardGuardProps } from '../components/TkxClipboardGuard';
export { TkxDevToolsGuard } from '../components/TkxDevToolsGuard';
export type { TkxDevToolsGuardProps } from '../components/TkxDevToolsGuard';
export { TkxDynamicWatermark } from '../components/TkxDynamicWatermark';
export type { TkxDynamicWatermarkProps } from '../components/TkxDynamicWatermark';
export { TkxBiodataPreview } from '../components/TkxBiodataPreview';
export type { TkxBiodataPreviewProps } from '../components/TkxBiodataPreview';

export { TkxCanvasRenderer } from '../components/TkxCanvasRenderer';
export type { TkxCanvasRendererProps } from '../components/TkxCanvasRenderer';
export {
  TkxTemplateRenderer,
  createTemplateRegistry,
  useTemplateScene,
} from '../components/TkxTemplateRenderer';
export type {
  TkxTemplateRendererProps,
  TkxBiodataTemplate,
  TkxTemplateRegistry,
} from '../components/TkxTemplateRenderer';
export { TkxPdfExport } from '../components/TkxPdfExport';
export type { TkxPdfExportProps } from '../components/TkxPdfExport';
export { TkxImageExport } from '../components/TkxImageExport';
export type { TkxImageExportProps } from '../components/TkxImageExport';
export { TkxIndicShaper } from '../components/TkxIndicShaper';
export type { TkxIndicShaperProps } from '../components/TkxIndicShaper';

export { TkxFieldArray } from '../components/TkxFieldArray';
export type { TkxFieldArrayProps, TkxFieldArrayHelpers } from '../components/TkxFieldArray';
export { TkxImageCrop } from '../components/TkxImageCrop';
export type { TkxImageCropProps, TkxImageCropHandle } from '../components/TkxImageCrop';
export { TkxSignaturePad } from '../components/TkxSignaturePad';
export type { TkxSignaturePadProps, TkxSignaturePadHandle } from '../components/TkxSignaturePad';
export { TkxPhoneInput, DEFAULT_COUNTRIES } from '../components/TkxPhoneInput';
export type { TkxPhoneInputProps, CountryDialCode } from '../components/TkxPhoneInput';
export { TkxMaskedInput } from '../components/TkxMaskedInput';
export type { TkxMaskedInputProps } from '../components/TkxMaskedInput';

export { TkxPaymentProvider, useTkxPayment } from '../components/TkxPaymentProvider';
export type { TkxPaymentProviderProps } from '../components/TkxPaymentProvider';
export { TkxRazorpayCheckout } from '../components/TkxRazorpayCheckout';
export type { TkxRazorpayCheckoutProps } from '../components/TkxRazorpayCheckout';
export { TkxCaptcha } from '../components/TkxCaptcha';
export type { TkxCaptchaProps } from '../components/TkxCaptcha';
export { TkxSecureDownload } from '../components/TkxSecureDownload';
export type { TkxSecureDownloadProps } from '../components/TkxSecureDownload';
export { TkxHoneypot } from '../components/TkxHoneypot';
export type { TkxHoneypotProps } from '../components/TkxHoneypot';

export { TkxShareSheet } from '../components/TkxShareSheet';
export type { TkxShareSheetProps, TkxShareTarget } from '../components/TkxShareSheet';
export { TkxFontPicker } from '../components/TkxFontPicker';
export type { TkxFontPickerProps, FontFaceOption } from '../components/TkxFontPicker';
export { TkxInstallPrompt } from '../components/TkxInstallPrompt';
export type { TkxInstallPromptProps } from '../components/TkxInstallPrompt';

/* -------------------------------------------------------------------------- */
/* Engine modules — namespaced so the biodata entry is one stop                */
/* -------------------------------------------------------------------------- */

export * as Protect from '../engine/protect';
export * as Captcha from '../engine/captcha';
export * as CanvasEngine from '../engine/canvas';
export * as Payment from '../engine/payment';
export * as Pdf from '../engine/pdf';
export * as Shaper from '../engine/shaper';

/* -------------------------------------------------------------------------- */
/* Frequently-used scene + PDF helpers re-exported flat                        */
/* -------------------------------------------------------------------------- */

export {
  validateScene,
  renderScene,
  renderToBlob,
  preloadImages,
  collectImageSources,
  buildFontShorthand,
  wrapText,
  measureBlock,
  PAGE_A4,
  PAGE_LETTER,
  PAGE_LEGAL,
  DEFAULT_FONT_FAMILY,
} from '../engine/canvas';
export type {
  Scene,
  SceneNode,
  TextNode,
  RectNode,
  LineNode,
  ImageNode,
  GroupNode,
  ImageFit,
  TextAlign,
  TextBaseline,
  Color,
} from '../engine/canvas';

export {
  PdfDocument,
  sceneToPdfBlob,
  sceneToPdfBytes,
  renderSceneToPdfDocument,
} from '../engine/pdf';
export type {
  PdfDocumentInfo,
  RenderSceneToPdfOptions,
} from '../engine/pdf';

export { createRazorpayProvider, verifyRazorpaySignature } from '../engine/payment';
export type {
  CheckoutRequest,
  CheckoutResult,
  CheckoutSuccess,
  CheckoutCancelled,
  CheckoutFailed,
  PaymentProvider,
  RazorpayProviderOptions,
  MoneyAmount,
  PaymentCustomer,
} from '../engine/payment';

export {
  CaptchaIssuer,
  createMemoryChallengeStore,
  issueMath,
  issueSlider,
  issueImageGrid,
  verifyMath,
  verifySlider,
  verifyImageGrid,
  signChallenge,
  verifySignedChallenge,
  verifySignedSolution,
} from '../engine/captcha';
export type {
  CaptchaType,
  Challenge,
  ChallengeBase,
  MathChallenge,
  SliderChallenge,
  ImageGridChallenge,
  ImageGridItem,
  CaptchaResult,
  ChallengeStore,
} from '../engine/captcha';

export {
  scriptOf,
  isComplexScript,
  hasComplexScript,
  isRtl,
  splitClusters,
  splitRuns,
  rasterizeText,
  categorize,
} from '../engine/shaper';
export type {
  Script,
  Cluster,
  CharCategory,
  Run,
  RunMode,
  RasterizeOptions,
  RasterizedText,
} from '../engine/shaper';

export {
  installProtection,
  watchScreenshot,
  watchPrint,
  watchClipboard,
  watchContextMenu,
  watchDevTools,
  PROTECT_CSS_INLINE,
} from '../engine/protect';
export type {
  GuardEvent,
  GuardEventType,
  GuardListener,
  ProtectionConfig,
  Teardown,
} from '../engine/protect';
