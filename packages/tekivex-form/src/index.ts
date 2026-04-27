// ─────────────────────────────────────────────────────────────────────────────
// tekivex-form
//
// Single-purpose form-input package. Re-exports the form-related surface
// of tekivex-ui so consumers who only need form widgets can install one
// small package instead of the full library:
//
//     npm install tekivex-form
//
// Tree-shakeable — only the components you import end up in your bundle.
// Backed by tekivex-ui as a peerDependency, so React is shared with your
// host app.
// ─────────────────────────────────────────────────────────────────────────────

// ── Container + state ────────────────────────────────────────────────────────
export { TkxForm, TkxFormField } from 'tekivex-ui';
export type { TkxFormProps, TkxFormFieldProps } from 'tekivex-ui';

// ── Text-style inputs ────────────────────────────────────────────────────────
export { TkxInput } from 'tekivex-ui';
export type { TkxInputProps } from 'tekivex-ui';

export { TkxNumberInput } from 'tekivex-ui';
export type { TkxNumberInputProps } from 'tekivex-ui';

export { TkxCurrencyInput } from 'tekivex-ui';
export type { TkxCurrencyInputProps, CurrencyCode } from 'tekivex-ui';

export { TkxPhoneInput } from 'tekivex-ui';
export type { TkxPhoneInputProps, PhoneChangePayload, PhoneCountry } from 'tekivex-ui';

export { TkxAddressInput } from 'tekivex-ui';
export type { TkxAddressInputProps, AddressValue } from 'tekivex-ui';

// ── Indian KYC inputs ────────────────────────────────────────────────────────
export { TkxAadhaarInput } from 'tekivex-ui';
export type { TkxAadhaarInputProps, AadhaarChangePayload } from 'tekivex-ui';

export {
  TkxPanInput,
  TkxVoterIdInput,
  TkxDrivingLicenceInput,
} from 'tekivex-ui';
export type {
  TkxPanInputProps,
  TkxVoterIdInputProps,
  TkxDrivingLicenceInputProps,
} from 'tekivex-ui';

// ── Selection + boolean inputs ───────────────────────────────────────────────
export { TkxSelect } from 'tekivex-ui';
export type { TkxSelectProps } from 'tekivex-ui';

export { TkxAutocomplete } from 'tekivex-ui';
export type { TkxAutocompleteProps } from 'tekivex-ui';

export { TkxCheckbox } from 'tekivex-ui';
export type { TkxCheckboxProps } from 'tekivex-ui';

export { TkxRadio } from 'tekivex-ui';
export type { TkxRadioProps } from 'tekivex-ui';

export { TkxToggle } from 'tekivex-ui';
export type { TkxToggleProps } from 'tekivex-ui';

export { TkxSegmented } from 'tekivex-ui';
export type { TkxSegmentedProps } from 'tekivex-ui';

// ── Date / time / range ──────────────────────────────────────────────────────
export { TkxDatePicker } from 'tekivex-ui';
export type { TkxDatePickerProps } from 'tekivex-ui';

export { TkxSlider } from 'tekivex-ui';
export type { TkxSliderProps } from 'tekivex-ui';

export { TkxRating } from 'tekivex-ui';
export type { TkxRatingProps } from 'tekivex-ui';

// ── Pickers + file ───────────────────────────────────────────────────────────
export { TkxColorPicker } from 'tekivex-ui';
export type { TkxColorPickerProps } from 'tekivex-ui';

export { TkxFileUpload } from 'tekivex-ui';
export type { TkxFileUploadProps } from 'tekivex-ui';

// ── OTP / verification ───────────────────────────────────────────────────────
export { TkxOTP } from 'tekivex-ui';
export type { TkxOTPProps } from 'tekivex-ui';

export { TkxCaptcha } from 'tekivex-ui';
export type { TkxCaptchaProps } from 'tekivex-ui';

// ── Display + signature ──────────────────────────────────────────────────────
export { TkxSignaturePad } from 'tekivex-ui';
export type { TkxSignaturePadProps, TkxSignaturePadHandle } from 'tekivex-ui';
