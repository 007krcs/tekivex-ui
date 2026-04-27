// @tekivex/india — India-specific component re-exports.
//
// All components live in `tekivex-ui` (so they tree-shake the same way as
// every other Tkx component). This package is a curated *namespace* over
// the India subset, per the audit's §5 v3.2 recommendation. Consumers who
// want only Indian-locale work can pin to `@tekivex/india` and get a
// focused dependency surface.

export { TkxAadhaarInput, isValidAadhaar } from 'tekivex-ui';
export type { AadhaarChangePayload, TkxAadhaarInputProps } from 'tekivex-ui';

export {
  TkxPanInput,
  TkxVoterIdInput,
  TkxDrivingLicenceInput,
  isValidPan,
  isValidVoterId,
  isValidDrivingLicence,
} from 'tekivex-ui';
export type {
  PanChangePayload,
  TkxPanInputProps,
  VoterIdChangePayload,
  TkxVoterIdInputProps,
  DrivingLicenceChangePayload,
  TkxDrivingLicenceInputProps,
} from 'tekivex-ui';

export { TkxAddressInput } from 'tekivex-ui';
export type { AddressValue, TkxAddressInputProps } from 'tekivex-ui';

export { TkxCurrencyInput } from 'tekivex-ui';
export type { CurrencyCode, TkxCurrencyInputProps } from 'tekivex-ui';

export { TkxCalendarLunar } from 'tekivex-ui';
export type {
  LunarCalendar,
  LunarDate,
  TkxCalendarLunarProps,
} from 'tekivex-ui';

export { TkxPhoneInput, COUNTRIES } from 'tekivex-ui';
export type {
  PhoneCountry,
  PhoneChangePayload,
  TkxPhoneInputProps,
} from 'tekivex-ui';
