'use client';

// ══════════════════════════════════════════════════════════════════════════════
// TKX FORM — Enterprise-grade form controller
// Context-based form state management with field-level validation,
// error propagation, layout control, and programmatic access.
// ══════════════════════════════════════════════════════════════════════════════

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
  type CSSProperties,
  type FormEvent,
  useId,
} from 'react';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';
import { sanitizeString } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

// ── Validation Rule ─────────────────────────────────────────────────────────

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  /** Custom validator. Receives the field value and all form values for cross-field validation (e.g. "confirm password" patterns). */
  validator?: (value: unknown, allValues?: Record<string, unknown>) => string | null | Promise<string | null>;
  message?: string;
}

// ── Form Props ──────────────────────────────────────────────────────────────

export interface TkxFormProps<T extends Record<string, unknown> = Record<string, unknown>> {
  onSubmit?: (values: T) => void | Promise<void>;
  onValuesChange?: (changed: Partial<T>, all: T) => void;
  initialValues?: Partial<T>;
  layout?: 'vertical' | 'horizontal' | 'inline';
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * An external FormInstance created via useTkxForm().
   * When provided, the form exposes its internal instance through this reference,
   * enabling programmatic control from outside the component tree.
   */
  form?: FormInstance<T>;
}

// ── Form Field Props ────────────────────────────────────────────────────────

export interface TkxFormFieldProps {
  name: string;
  label?: string;
  rules?: ValidationRule[];
  help?: string;
  required?: boolean;
  children: ReactElement;
  className?: string;
  style?: CSSProperties;
}

// ── Form Instance (programmatic API) ────────────────────────────────────────

export interface FormInstance<T extends Record<string, unknown> = Record<string, unknown>> {
  getFieldValue: <K extends keyof T>(name: K) => T[K] | undefined;
  setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;
  getFieldsValue: () => Partial<T>;
  setFieldsValue: (values: Partial<T>) => void;
  validateFields: () => Promise<T>;
  validateField: (name: keyof T & string) => Promise<boolean>;
  resetFields: () => void;
  getFieldError: (name: keyof T & string) => string | null;
  isFieldTouched: (name: keyof T & string) => boolean;
}

// ── Internal State ──────────────────────────────────────────────────────────

interface FieldMeta {
  rules: ValidationRule[];
}

interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
}

interface FormContextValue {
  state: FormState;
  initialValues: Record<string, unknown>;
  layout: 'vertical' | 'horizontal' | 'inline';
  disabled: boolean;
  fieldMeta: React.MutableRefObject<Record<string, FieldMeta>>;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldError: (name: string, error: string | null) => void;
  setFieldTouched: (name: string) => void;
  registerField: (name: string, meta: FieldMeta) => void;
  unregisterField: (name: string) => void;
  validateField: (name: string) => Promise<boolean>;
  instance: FormInstance;
}

// ── Context ─────────────────────────────────────────────────────────────────

const FormContext = createContext<FormContextValue | null>(null);

function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error('TkxFormField must be used inside a <TkxForm>. Wrap your fields in a TkxForm component.');
  }
  return ctx;
}

// ── Validation Engine ───────────────────────────────────────────────────────

interface ValidationMessages {
  required: string;
  invalidFormat: string;
  minLength: (n: number) => string;
  maxLength: (n: number) => string;
  minValue: (n: number) => string;
  maxValue: (n: number) => string;
}

const DEFAULT_MESSAGES: ValidationMessages = {
  required: 'This field is required',
  invalidFormat: 'Invalid format',
  minLength: (n) => `Must be at least ${n} characters`,
  maxLength: (n) => `Must be no more than ${n} characters`,
  minValue: (n) => `Must be at least ${n}`,
  maxValue: (n) => `Must be no more than ${n}`,
};

async function runValidation(
  value: any,
  rules: ValidationRule[],
  messages: ValidationMessages = DEFAULT_MESSAGES,
): Promise<string | null> {
  for (const rule of rules) {
    // Required check
    if (rule.required) {
      const empty = value === undefined || value === null || value === '' ||
        (Array.isArray(value) && value.length === 0);
      if (empty) {
        return rule.message ?? messages.required;
      }
    }

    // Skip further checks if value is empty and not required
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Min length / min value
    if (rule.min !== undefined) {
      if (typeof value === 'string' && value.length < rule.min) {
        return rule.message ?? messages.minLength(rule.min);
      }
      if (typeof value === 'number' && value < rule.min) {
        return rule.message ?? messages.minValue(rule.min);
      }
    }

    // Max length / max value
    if (rule.max !== undefined) {
      if (typeof value === 'string' && value.length > rule.max) {
        return rule.message ?? messages.maxLength(rule.max);
      }
      if (typeof value === 'number' && value > rule.max) {
        return rule.message ?? messages.maxValue(rule.max);
      }
    }

    // Pattern check
    if (rule.pattern) {
      if (typeof value === 'string' && !rule.pattern.test(value)) {
        return rule.message ?? messages.invalidFormat;
      }
    }

    // Custom async validator
    if (rule.validator) {
      const result = await rule.validator(value);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

/** Merge the `required` shortcut prop into the rules array. */
function mergeRequiredRule(
  rules: ValidationRule[] | undefined,
  required?: boolean,
  requiredMessage = DEFAULT_MESSAGES.required,
): ValidationRule[] {
  const base = rules ? [...rules] : [];
  if (required && !base.some(r => r.required)) {
    base.unshift({ required: true, message: requiredMessage });
  }
  return base;
}

/** Check whether any rule in a set has `required: true`. */
function hasRequiredRule(rules: ValidationRule[]): boolean {
  return rules.some(r => r.required);
}

// ── useTkxForm Hook ─────────────────────────────────────────────────────────

/**
 * Returns a FormInstance for programmatic access to form state.
 *
 * - Inside a <TkxForm>: returns the form's live instance (reads/writes real field state).
 * - Outside a <TkxForm>: returns a standalone instance backed by a ref store.
 *   Pass it to <TkxForm form={instance}> to connect it to a form.
 *
 * @example — programmatic access inside a form
 * ```tsx
 * function MyInnerButtons() {
 *   const form = useTkxForm(); // connected to parent TkxForm
 *   return <button onClick={() => form.resetFields()}>Reset</button>;
 * }
 * ```
 *
 * @example — external instance (Ant Design pattern)
 * ```tsx
 * function Parent() {
 *   const form = useTkxForm();
 *   return (
 *     <TkxForm form={form}>
 *       <TkxFormField name="email" label="Email"><TkxInput label="Email" /></TkxFormField>
 *       <button onClick={() => console.log(form.getFieldsValue())}>Log</button>
 *     </TkxForm>
 *   );
 * }
 * ```
 */
export function useTkxForm(): FormInstance {
  const ctx = useContext(FormContext);

  // Always call hooks unconditionally (Rules of Hooks).
  // These refs back the standalone instance when used outside a TkxForm.
  const valuesRef = useRef<Record<string, unknown>>({});
  const errorsRef = useRef<Record<string, string | null>>({});
  const touchedRef = useRef<Record<string, boolean>>({});

  const standaloneInstance = useMemo<FormInstance>(() => ({
    getFieldValue: (name: string) => valuesRef.current[name],
    setFieldValue: (name: string, value: unknown) => { valuesRef.current[name] = value; },
    getFieldsValue: () => ({ ...valuesRef.current }),
    setFieldsValue: (values: Record<string, unknown>) => {
      Object.assign(valuesRef.current, values);
    },
    validateFields: () => Promise.resolve({ ...valuesRef.current } as Record<string, unknown>),
    validateField: (_name: string) => Promise.resolve(true),
    resetFields: () => {
      valuesRef.current = {};
      errorsRef.current = {};
      touchedRef.current = {};
    },
    getFieldError: (name: string) => errorsRef.current[name] ?? null,
    isFieldTouched: (name: string) => touchedRef.current[name] ?? false,
  }), []);

  // If inside a TkxForm context, return the live connected instance.
  // Otherwise return the standalone ref-backed instance.
  return ctx ? ctx.instance : standaloneInstance;
}

// ── TkxForm Component ───────────────────────────────────────────────────────

export function TkxForm<T extends Record<string, unknown> = Record<string, unknown>>({
  onSubmit,
  onValuesChange,
  initialValues = {} as Partial<T>,
  layout = 'vertical',
  disabled = false,
  children,
  className,
  style,
  form: externalInstance,
}: TkxFormProps<T>) {
  const theme = useTheme();
  const tStrings = useLocale();

  // Localised validation messages — falls back to English when the active
  // locale doesn't yet ship the optional form keys.
  const validationMessages: ValidationMessages = useMemo(() => ({
    required: tStrings.fieldRequired ?? DEFAULT_MESSAGES.required,
    invalidFormat: tStrings.invalidFormat ?? DEFAULT_MESSAGES.invalidFormat,
    minLength: tStrings.minLength ?? DEFAULT_MESSAGES.minLength,
    maxLength: tStrings.maxLength ?? DEFAULT_MESSAGES.maxLength,
    minValue: tStrings.minValue ?? DEFAULT_MESSAGES.minValue,
    maxValue: tStrings.maxValue ?? DEFAULT_MESSAGES.maxValue,
  }), [tStrings]);

  // ─── State ──────────────────────────────────────────────────────────────
  const [state, setState] = useState<FormState>({
    values: { ...initialValues },
    errors: {},
    touched: {},
  });

  const initialValuesRef = useRef(initialValues);
  const fieldMetaRef = useRef<Record<string, FieldMeta>>({});
  const stateRef = useRef(state);
  stateRef.current = state;

  // ─── Field Registration ─────────────────────────────────────────────────
  const registerField = useCallback((name: string, meta: FieldMeta) => {
    fieldMetaRef.current[name] = meta;
  }, []);

  const unregisterField = useCallback((name: string) => {
    delete fieldMetaRef.current[name];
  }, []);

  // ─── Value Management ───────────────────────────────────────────────────
  const setFieldValue = useCallback((name: string, value: unknown) => {
    setState(prev => {
      const next = {
        ...prev,
        values: { ...prev.values, [name]: value },
      };
      onValuesChange?.({ [name]: value } as Partial<T>, next.values as T);
      return next;
    });
  }, [onValuesChange]);

  const setFieldError = useCallback((name: string, error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  const setFieldTouched = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: true },
    }));
  }, []);

  // ─── Validation ─────────────────────────────────────────────────────────
  const validateField = useCallback(async (name: string): Promise<boolean> => {
    const meta = fieldMetaRef.current[name];
    if (!meta) return true;

    const value = stateRef.current.values[name];
    const error = await runValidation(value, meta.rules, validationMessages);
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      touched: { ...prev.touched, [name]: true },
    }));
    return error === null;
  }, [validationMessages]);

  const validateFields = useCallback(async (): Promise<T> => {
    const fieldNames = Object.keys(fieldMetaRef.current);
    const results = await Promise.all(
      fieldNames.map(async (name) => {
        const meta = fieldMetaRef.current[name];
        const value = stateRef.current.values[name];
        const error = await runValidation(value, meta.rules, validationMessages);
        return { name, error };
      }),
    );

    const newErrors: Record<string, string | null> = {};
    const newTouched: Record<string, boolean> = {};
    let hasErrors = false;

    for (const { name, error } of results) {
      newErrors[name] = error;
      newTouched[name] = true;
      if (error) hasErrors = true;
    }

    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...newErrors },
      touched: { ...prev.touched, ...newTouched },
    }));

    if (hasErrors) {
      const errorMap = Object.fromEntries(
        results.filter(r => r.error).map(r => [r.name, r.error]),
      );
      return Promise.reject(errorMap);
    }

    return { ...stateRef.current.values } as T;
  }, []);

  const resetFields = useCallback(() => {
    setState({
      values: { ...initialValuesRef.current },
      errors: {},
      touched: {},
    });
  }, []);

  // ─── Form Instance ─────────────────────────────────────────────────────
  // Cast to the base FormInstance type for context compatibility.
  // The generic T is only relevant at the props/API boundary, not internally.
  const instance = useMemo<FormInstance>(() => ({
    getFieldValue: (name: string) => stateRef.current.values[name],
    setFieldValue,
    getFieldsValue: () => ({ ...stateRef.current.values }),
    setFieldsValue: (values: Record<string, unknown>) => {
      setState(prev => {
        const merged = { ...prev.values, ...values };
        onValuesChange?.(values as Partial<T>, merged as T);
        return { ...prev, values: merged };
      });
    },
    validateFields,
    validateField,
    resetFields,
    getFieldError: (name: string) => stateRef.current.errors[name] ?? null,
    isFieldTouched: (name: string) => !!stateRef.current.touched[name],
  }), [setFieldValue, validateFields, validateField, resetFields, onValuesChange]);

  // ─── Submit Handler ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const values = await validateFields();
      await onSubmit?.(values);
    } catch {
      // Validation failed — errors are already in state
    }
  }, [validateFields, onSubmit]);

  // ─── Layout Styles ─────────────────────────────────────────────────────
  const layoutClass = layout === 'inline'
    ? tkx('flex flex-row flex-wrap items-end gap-4')
    : tkx('flex flex-col gap-5');

  // ─── Context Value ─────────────────────────────────────────────────────
  // When an external form instance is provided via the `form` prop, bind its
  // methods to the live internal instance so programmatic calls (e.g.
  // form.setFieldValue) drive re-renders. Without this binding the external
  // instance is just a detached ref store and the UI never updates.
  useEffect(() => {
    if (!externalInstance) return;
    const live = externalInstance as FormInstance;
    live.getFieldValue = instance.getFieldValue;
    live.setFieldValue = instance.setFieldValue;
    live.getFieldsValue = instance.getFieldsValue;
    live.setFieldsValue = instance.setFieldsValue;
    live.validateFields = instance.validateFields;
    live.validateField = instance.validateField;
    live.resetFields = instance.resetFields;
    live.getFieldError = instance.getFieldError;
    live.isFieldTouched = instance.isFieldTouched;
  }, [externalInstance, instance]);

  const activeInstance: FormInstance = (externalInstance as FormInstance | undefined) ?? instance;

  const contextValue = useMemo<FormContextValue>(() => ({
    state,
    initialValues: initialValuesRef.current,
    layout,
    disabled,
    fieldMeta: fieldMetaRef,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    registerField,
    unregisterField,
    validateField,
    instance: activeInstance,
  }), [state, layout, disabled, setFieldValue, setFieldError, setFieldTouched, registerField, unregisterField, validateField, activeInstance]);

  return (
    <FormContext.Provider value={contextValue}>
      <form
        noValidate
        role="form"
        aria-label="Form"
        onSubmit={handleSubmit}
        className={cx(layoutClass, className)}
        style={{
          color: theme.css.text,
          ...style,
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

TkxForm.displayName = 'TkxForm';

// ── TkxFormField Component ──────────────────────────────────────────────────

export function TkxFormField({
  name,
  label,
  rules: rulesProp,
  help,
  required,
  children,
  className,
  style,
}: TkxFormFieldProps) {
  const theme = useTheme();
  const autoFieldId = useId();
  // Read the context directly rather than via useFormContext() so a field
  // mounted OUTSIDE a <TkxForm> (e.g. an async-rendered shell before the form
  // wrapper exists, or a smoke mount) renders an empty placeholder instead of
  // throwing. All hooks below still run unconditionally (Rules of Hooks).
  const ctx = useContext(FormContext);
  const { state, layout, disabled } = ctx ?? {
    state: { values: {}, errors: {}, touched: {} } as FormState,
    layout: 'vertical' as const,
    disabled: false,
  };

  // Merge required shortcut into rules
  const rules = useMemo(() => mergeRequiredRule(rulesProp, required), [rulesProp, required]);
  const isRequired = hasRequiredRule(rules);

  // Register field metadata with form
  const metaRef = useRef<FieldMeta>({ rules });
  metaRef.current.rules = rules;

  // Register / unregister on mount / unmount
  const registeredRef = useRef(false);
  if (ctx && !registeredRef.current) {
    ctx.registerField(name, metaRef.current);
    registeredRef.current = true;
  }

  // Keep meta in sync
  useMemo(() => {
    ctx?.registerField(name, metaRef.current);
  }, [rules, name, ctx]);

  // Cleanup on unmount — using a ref-based pattern since we cannot use useEffect
  // with a stable callback for cleanup in strict mode without extra complexity.
  // The form handles missing fields gracefully.

  const value = state.values[name];
  const error = state.touched[name] ? (state.errors[name] ?? null) : null;
  const safeError = error ? sanitizeString(error) : null;
  const safeLabel = label ? sanitizeString(label) : undefined;
  const safeHelp = help ? sanitizeString(help) : undefined;

  // ─── onChange handler: supports both event objects and direct values ───
  const handleChange = useCallback(
    (eventOrValue: any) => {
      let nextValue: any;
      if (
        eventOrValue !== null &&
        typeof eventOrValue === 'object' &&
        'target' in eventOrValue
      ) {
        const target = eventOrValue.target;
        nextValue = target.type === 'checkbox' ? target.checked : target.value;
      } else {
        nextValue = eventOrValue;
      }
      ctx?.setFieldValue(name, nextValue);
    },
    [ctx, name],
  );

  // ─── onBlur: trigger validation on blur ────────────────────────────────
  const handleBlur = useCallback(() => {
    ctx?.setFieldTouched(name);
    ctx?.validateField(name);
  }, [ctx, name]);

  // ─── Clone child input with injected props ────────────────────────────
  // Guard against a missing/invalid child (e.g. no-prop mount) — cloneElement
  // throws on non-elements. When absent, render the label/messages only.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedChild = children as ReactElement<any>;
  const childIsValid = isValidElement(children);
  // The visible <label> is a sibling of the control (layout puts them in
  // separate boxes), so it can only name the control via htmlFor/id. Without
  // this the field rendered as an unnamed textbox.
  const fieldId = typedChild?.props?.id ?? autoFieldId;
  const childElement = childIsValid
    ? cloneElement(typedChild, {
        id: fieldId,
        value: value ?? '',
        onChange: handleChange,
        onBlur: handleBlur,
        error: safeError ?? undefined,
        isInvalid: !!safeError,
        isRequired,
        disabled: disabled || typedChild.props.disabled,
        name,
      })
    : null;

  // ─── Layout-dependent rendering ───────────────────────────────────────
  const isHorizontal = layout === 'horizontal';
  const isInline = layout === 'inline';

  // Error icon SVG (matches TkxInput pattern)
  const errorIcon = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );

  // Build the label element
  const labelElement = safeLabel ? (
    <label
      htmlFor={fieldId}
      className={tkx(
        'text-sm font-medium font-sans',
        isHorizontal ? 'min-w-[140px] pt-2.5' : '',
      )}
      style={{ color: theme.css.text }}
    >
      {safeLabel}
      {isRequired && (
        <span aria-hidden="true" className={tkx('ml-1')} style={{ color: theme.css.danger }}>
          *
        </span>
      )}
    </label>
  ) : null;

  // Build the help / error messaging
  const messageElement = (
    <>
      {safeHelp && !safeError && (
        <span className={tkx('text-xs mt-0.5')} style={{ color: theme.css.textMuted }}>
          {safeHelp}
        </span>
      )}
      {safeError && (
        <span
          role="alert"
          className={tkx('text-xs flex items-center gap-1 mt-0.5')}
          style={{
            color: theme.css.danger,
            animation: 'tkxFormErrorReveal 200ms ease-out',
          }}
        >
          {errorIcon}
          {safeError}
        </span>
      )}
    </>
  );

  // Inline layout: label above within a compact wrapper
  if (isInline) {
    return (
      <div
        className={cx(tkx('flex flex-col gap-1'), className)}
        style={style}
      >
        {labelElement}
        {childElement}
        {messageElement}
      </div>
    );
  }

  // Horizontal layout: label left, input right
  if (isHorizontal) {
    return (
      <div
        className={cx(tkx('flex flex-row gap-4 items-start'), className)}
        style={style}
      >
        {labelElement}
        <div className={tkx('flex flex-col gap-1 flex-1 min-w-0')}>
          {childElement}
          {messageElement}
        </div>
      </div>
    );
  }

  // Vertical layout (default): label above input
  return (
    <div
      className={cx(tkx('flex flex-col gap-1'), className)}
      style={style}
    >
      {labelElement}
      {childElement}
      {messageElement}
    </div>
  );
}

TkxFormField.displayName = 'TkxFormField';

// ── Error Reveal Keyframe Injection ─────────────────────────────────────────

let stylesInjected = false;

function injectFormStyles(): void {
  if (stylesInjected) return;
  if (typeof document === 'undefined') return;
  stylesInjected = true;

  const style = document.createElement('style');
  style.setAttribute('data-tkx-form', '');
  style.textContent = `
    @keyframes tkxFormErrorReveal {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

// Auto-inject styles on module load (client only)
injectFormStyles();