// @tekivex/finance — financial-services component re-exports.
//
// Curated namespace per the audit's §5 v3.2 recommendation. Same components
// also available directly from `tekivex-ui`.

// KYC
export {
  TkxAadhaarInput,
  TkxPanInput,
  TkxVoterIdInput,
  TkxDrivingLicenceInput,
  isValidAadhaar,
  isValidPan,
  isValidVoterId,
  isValidDrivingLicence,
} from 'tekivex-ui';
export type {
  AadhaarChangePayload,
  TkxAadhaarInputProps,
  PanChangePayload,
  TkxPanInputProps,
  VoterIdChangePayload,
  TkxVoterIdInputProps,
  DrivingLicenceChangePayload,
  TkxDrivingLicenceInputProps,
} from 'tekivex-ui';

// Currency
export { TkxCurrencyInput } from 'tekivex-ui';
export type { CurrencyCode, TkxCurrencyInputProps } from 'tekivex-ui';

// Phone (for verification flows)
export { TkxPhoneInput } from 'tekivex-ui';
export type { PhoneChangePayload, TkxPhoneInputProps } from 'tekivex-ui';

// OTP
export { TkxOTP } from 'tekivex-ui';
export type { TkxOTPProps } from 'tekivex-ui';

// Captcha (anti-fraud)
export { TkxCaptcha } from 'tekivex-ui';
export type { TkxCaptchaProps, TkxCaptchaHandle } from 'tekivex-ui';

// Payments
export { TkxPaymentButton, TkxCheckout } from 'tekivex-ui';
export type {
  PaymentProvider,
  PaymentConfig,
  RazorpayConfig,
  StripeConfig,
  SquareConfig,
  PaymentSuccessResult,
  PaymentFailureResult,
  TkxPaymentButtonProps,
  CheckoutLineItem,
  TkxCheckoutProps,
} from 'tekivex-ui';

// Subscription / billing
export {
  TkxPlanSelector,
  TkxBillingCycleToggle,
  TkxProrationPreview,
} from 'tekivex-ui';
export type {
  SubscriptionPlan,
  BillingCycle,
  TkxPlanSelectorProps,
  TkxBillingCycleToggleProps,
  TkxProrationPreviewProps,
} from 'tekivex-ui';

// Statistic / numeric display (for statement totals, KPI cards)
export { TkxStatistic } from 'tekivex-ui';
