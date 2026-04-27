# tekivex-india

> India-specific component pack for `tekivex-ui`. Aadhaar / PAN / Voter ID / Driving Licence inputs with format validation, PIN-code → city/state lookup, ₹ with lakh/crore grouping, Tithi/Nakshatra calendar.

## Install

```bash
npm install tekivex-india tekivex-ui
```

`tekivex-ui` is a peer dependency — install both as a pair.

## Why a separate package

These components live inside `tekivex-ui` and tree-shake correctly when imported from there. This package is a **curated namespace** so:

- Indian-locale apps can pin to `tekivex-india` and get focused docs / focused TypeScript surface
- The semver of India-specific components can move independently of the main library
- Consumers who don't need Indian features don't see them in autocomplete

If you're already importing from `tekivex-ui`, you don't need this package — but it's there for clarity.

## What's in it

| Component | Purpose |
|---|---|
| `TkxAadhaarInput` | 12-digit Aadhaar entry with **Verhoeff checksum** validation (UIDAI's official check). Masks first 8 digits at render. |
| `TkxPanInput` | 10-char PAN with format check + entity-type-character validation. |
| `TkxVoterIdInput` | EPIC format check (3 letters + 7 digits). |
| `TkxDrivingLicenceInput` | State+RTO+year+sequence format with normalised output. |
| `TkxAddressInput` | India Post PIN→city/state autocomplete via `postalpincode.in`. |
| `TkxCurrencyInput` | Locale="en-IN" gives `1,23,456.78` (lakh/crore) instead of `123,456.78`. |
| `TkxCalendarLunar` | Hindu calendar mode shows Tithi (1–30) + Nakshatra (1–27). |
| `TkxPhoneInput` | Defaults to `+91`, full intl support. |

## Validators exported standalone

You can also use the validation logic without the component:

```tsx
import { isValidAadhaar, isValidPan, isValidVoterId, isValidDrivingLicence } from 'tekivex-india';

isValidAadhaar('234123412346');   // → true (real Verhoeff check)
isValidPan('ABCPK1234F');         // → true (P = individual)
isValidVoterId('ABC1234567');     // → true
isValidDrivingLicence('MH12 2010 0012345'); // → true
```

These are pure functions — safe to use in form-validation libraries (Yup, Zod, React Hook Form), server-side, or in tests.

## Status

Preview. Source-available; npm publish on demand.
