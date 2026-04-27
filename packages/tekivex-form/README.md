# tekivex-form

> Single-purpose form-input package. Re-exports every form widget shipped in `tekivex-ui` so apps that only need form inputs can install one small package instead of the full library.

```bash
npm install tekivex-form
```

## What's in here

All form-related components from `tekivex-ui`, re-exported so you don't pull in the full 99-component bundle when you only need inputs:

| Family | Components |
|---|---|
| **Container + state** | `TkxForm`, `TkxFormField` |
| **Text inputs** | `TkxInput`, `TkxNumberInput`, `TkxCurrencyInput`, `TkxPhoneInput`, `TkxAddressInput` |
| **Indian KYC** | `TkxAadhaarInput` (Verhoeff), `TkxPanInput`, `TkxVoterIdInput`, `TkxDrivingLicenceInput` |
| **Selection** | `TkxSelect`, `TkxAutocomplete`, `TkxCheckbox`, `TkxRadio`, `TkxToggle`, `TkxSegmented` |
| **Date / range** | `TkxDatePicker`, `TkxSlider`, `TkxRating` |
| **Files + pickers** | `TkxFileUpload`, `TkxColorPicker` |
| **OTP / verification** | `TkxOTP` (with WebOTP), `TkxCaptcha` (Turnstile / hCaptcha / reCAPTCHA) |
| **Signature** | `TkxSignaturePad` |

## Usage

```tsx
import { TkxForm, TkxFormField, TkxInput, TkxPhoneInput, TkxAadhaarInput } from 'tekivex-form';
import { ThemeProvider } from 'tekivex-ui';
import 'tekivex-ui/styles';

export function SignupForm() {
  return (
    <ThemeProvider mode="auto">
      <TkxForm onSubmit={(values) => console.log(values)}>
        <TkxFormField name="email" label="Email" required>
          <TkxInput type="email" />
        </TkxFormField>

        <TkxFormField name="phone" label="Phone">
          <TkxPhoneInput defaultCountry="IN" />
        </TkxFormField>

        <TkxFormField name="aadhaar" label="Aadhaar number">
          <TkxAadhaarInput />
        </TkxFormField>
      </TkxForm>
    </ThemeProvider>
  );
}
```

## Why a separate package?

`tekivex-ui` ships 99 components. If your app is form-heavy and doesn't use the rest (charts, layout, AI components, real-time widgets), `tekivex-form` lets you depend on a smaller surface area. Both packages share the same React copy via the `tekivex-ui` peer dependency, so there's no double-React bug.

This is a re-export package — every component is implemented in `tekivex-ui` and shipped from there. If you already have `tekivex-ui` in your dependency tree, prefer importing directly from it.

## Accessibility

All components meet WCAG 2.1 AAA — same guarantees as `tekivex-ui`:

- 7:1 contrast ratios on all text + control states
- 44×44 minimum touch targets
- Full keyboard navigation
- Screen-reader landmarks + announcements
- `prefers-reduced-motion` respected

## License

MIT © tekivex-ui contributors
