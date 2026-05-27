'use client';

/**
 * React Hook Form (RHF) bindings for tekivex-ui components.
 *
 * Why this exists:
 *   RHF has ~5M weekly npm downloads — wrapping our components in its
 *   `Controller` render-prop API lets every RHF team drop tekivex-ui in
 *   without rewriting form logic. We surface `field.value`, `field.onChange`,
 *   `field.onBlur`, and `fieldState.error?.message` into the underlying
 *   component's value/onChange/onBlur/error props.
 *
 * Why we don't `import 'react-hook-form'`:
 *   tekivex-ui ships zero runtime deps. The consumer brings their own
 *   `Controller` — any RHF version they have — and we never reach for the
 *   `react-hook-form` module. The structural types below (`RHFControl`,
 *   `RHFFieldRenderProps`) describe only what we read from RHF; any modern
 *   RHF (v7+) satisfies them.
 *
 * @example
 *   import { Controller, useForm } from 'react-hook-form';
 *   import { createRHFBindings } from 'tekivex-ui/headless';
 *
 *   const { TkxRHFInput, TkxRHFSelect, TkxRHFCheckbox } =
 *     createRHFBindings({ Controller });
 *
 *   function SignupForm() {
 *     const { control, handleSubmit } = useForm({ defaultValues: { email: '' } });
 *     return (
 *       <form onSubmit={handleSubmit(console.log)}>
 *         <TkxRHFInput name="email" control={control} label="Email"
 *           rules={{ required: 'Required' }} />
 *       </form>
 *     );
 *   }
 */

import type { ComponentType, ReactElement } from 'react';
import { TkxInput, type TkxInputProps } from '../components/TkxInput';
import { TkxSelect, type TkxSelectProps } from '../components/TkxSelect';
import { TkxCheckbox, type TkxCheckboxProps } from '../components/TkxCheckbox';
import { TkxToggle, type TkxToggleProps } from '../components/TkxToggle';
import { TkxRadio, type TkxRadioProps } from '../components/TkxRadio';
import { TkxNumberInput, type TkxNumberInputProps } from '../components/TkxNumberInput';
import { TkxDatePicker, type TkxDatePickerProps } from '../components/TkxDatePicker';

// ── Structural RHF types — we only model what we touch ─────────────────────

export interface RHFControl {
  _formState: { errors: Record<string, { message?: string } | undefined> };
}

export interface RHFFieldRenderProps<TValue = unknown> {
  field: {
    name: string;
    value: TValue;
    onChange: (v: TValue | unknown) => void;
    onBlur: () => void;
    ref: (instance: unknown) => void;
  };
  fieldState: {
    error?: { message?: string };
    isTouched: boolean;
    isDirty: boolean;
  };
}

interface ControllerProps<TValue = unknown> {
  name: string;
  control: RHFControl;
  rules?: object;
  defaultValue?: TValue;
  render: (props: RHFFieldRenderProps<TValue>) => ReactElement;
}

export type RHFControllerComponent = ComponentType<ControllerProps<unknown>>;

/** Props every binding accepts in addition to the underlying component's props. */
interface RHFBaseProps<TValue> {
  name: string;
  control: RHFControl;
  rules?: object;
  defaultValue?: TValue;
}

// ── The set of bindings the factory returns ────────────────────────────────

export interface RHFBindings {
  TkxRHFInput: ComponentType<RHFBaseProps<string> & Omit<TkxInputProps, 'value' | 'onChange' | 'onBlur' | 'error' | 'name'>>;
  TkxRHFSelect: ComponentType<RHFBaseProps<string | string[]> & Omit<TkxSelectProps, 'value' | 'onChange' | 'errorMessage'>>;
  TkxRHFCheckbox: ComponentType<RHFBaseProps<boolean> & Omit<TkxCheckboxProps, 'checked' | 'onChange' | 'errorMessage' | 'name'>>;
  TkxRHFToggle: ComponentType<RHFBaseProps<boolean> & Omit<TkxToggleProps, 'checked' | 'onChange'>>;
  TkxRHFRadio: ComponentType<RHFBaseProps<string> & Omit<TkxRadioProps, 'checked' | 'onChange' | 'name'>>;
  TkxRHFNumberInput: ComponentType<RHFBaseProps<number | null> & Omit<TkxNumberInputProps, 'value' | 'onChange' | 'errorMessage'>>;
  TkxRHFDatePicker: ComponentType<RHFBaseProps<Date | null> & Omit<TkxDatePickerProps, 'value' | 'onChange'>>;
}

export interface CreateRHFBindingsConfig {
  Controller: RHFControllerComponent;
}

/**
 * Build a set of tekivex-ui components pre-wired to React Hook Form.
 * Pass in `Controller` from your own `react-hook-form` install.
 */
export function createRHFBindings(config: CreateRHFBindingsConfig): RHFBindings {
  const { Controller } = config;

  const TkxRHFInput: RHFBindings['TkxRHFInput'] = ({ name, control, rules, defaultValue, ...rest }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue ?? ('' as unknown)}
      render={({ field, fieldState }) => (
        <TkxInput
          {...rest}
          name={field.name}
          value={(field.value as string) ?? ''}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          ref={field.ref as unknown as React.Ref<HTMLInputElement>}
          error={fieldState.error?.message}
        />
      )}
    />
  );

  const TkxRHFSelect: RHFBindings['TkxRHFSelect'] = ({ name, control, rules, defaultValue, ...rest }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue ?? ('' as unknown)}
      render={({ field, fieldState }) => (
        <TkxSelect
          {...rest}
          value={field.value as string | string[]}
          onChange={(v) => field.onChange(v)}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );

  const TkxRHFCheckbox: RHFBindings['TkxRHFCheckbox'] = ({ name, control, rules, defaultValue, ...rest }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue ?? (false as unknown)}
      render={({ field, fieldState }) => (
        <TkxCheckbox
          {...rest}
          name={field.name}
          checked={Boolean(field.value)}
          onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
          onBlur={field.onBlur}
          ref={field.ref as unknown as React.Ref<HTMLInputElement>}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );

  const TkxRHFToggle: RHFBindings['TkxRHFToggle'] = ({ name, control, rules, defaultValue, ...rest }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue ?? (false as unknown)}
      render={({ field }) => (
        <TkxToggle
          {...rest}
          checked={Boolean(field.value)}
          onChange={(next) => field.onChange(next)}
          onBlur={field.onBlur}
          ref={field.ref as unknown as React.Ref<HTMLButtonElement>}
        />
      )}
    />
  );

  const TkxRHFRadio: RHFBindings['TkxRHFRadio'] = ({ name, control, rules, defaultValue, value: radioValue, ...rest }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue ?? ('' as unknown)}
      render={({ field }) => (
        <TkxRadio
          {...rest}
          name={field.name}
          value={radioValue}
          checked={String(field.value ?? '') === String(radioValue ?? '')}
          onChange={() => field.onChange(radioValue)}
          onBlur={field.onBlur}
          ref={field.ref as unknown as React.Ref<HTMLInputElement>}
        />
      )}
    />
  );

  const TkxRHFNumberInput: RHFBindings['TkxRHFNumberInput'] = ({ name, control, rules, defaultValue, ...rest }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue as unknown}
      render={({ field, fieldState }) => (
        <TkxNumberInput
          {...rest}
          value={(field.value as number | undefined) ?? undefined}
          onChange={(n) => field.onChange(n)}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );

  const TkxRHFDatePicker: RHFBindings['TkxRHFDatePicker'] = ({ name, control, rules, defaultValue, ...rest }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={(defaultValue ?? null) as unknown}
      render={({ field }) => (
        <TkxDatePicker
          {...rest}
          value={(field.value as Date | null | undefined) ?? null}
          onChange={(d) => field.onChange(d)}
        />
      )}
    />
  );

  return {
    TkxRHFInput,
    TkxRHFSelect,
    TkxRHFCheckbox,
    TkxRHFToggle,
    TkxRHFRadio,
    TkxRHFNumberInput,
    TkxRHFDatePicker,
  };
}
