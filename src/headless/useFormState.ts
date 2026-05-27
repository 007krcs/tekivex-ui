'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type FormFieldValue = string | number | boolean | string[] | null | undefined;

export interface FieldState {
  value: FormFieldValue;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

/**
 * Validator return type — allows per-field string errors plus an optional
 * form-level `_root` key for cross-field / server / captcha errors.
 */
export type ValidateResult<T> = Partial<Record<keyof T, string>> & {
  _root?: string;
};

export interface UseFormStateOptions<T extends Record<string, FormFieldValue>> {
  initialValues: T;
  validate?: (values: T) => ValidateResult<T>;
  /**
   * Per-field async validators. Each receives the field's value plus the full
   * values object and returns a Promise that resolves to an error string or
   * null (no error). Called after `debounceMs` of inactivity on the field.
   *
   * If the value changes again before the validator resolves, the in-flight
   * call is cancelled (its result is ignored — no state update).
   */
  validateAsync?: {
    [K in keyof T]?: (value: T[K], values: T) => Promise<string | null>;
  };
  /** Debounce window (ms) before invoking an async validator. Default 300. */
  debounceMs?: number;
}

export interface UseFormStateReturn<T extends Record<string, FormFieldValue>> {
  values: T;
  /** Merged sync + async errors. Async errors override sync for the same field. */
  errors: Partial<Record<keyof T, string>>;
  /** Async-only errors (separate from sync so the UI can show "Checking…"). */
  asyncErrors: Partial<Record<keyof T, string>>;
  /** True per-field while an async validator is in flight. */
  validating: Partial<Record<keyof T, boolean>>;
  /** Form-level error from the validator's `_root` key. */
  rootError: string | undefined;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  isValid: boolean;
  setValue: (name: keyof T, value: FormFieldValue) => void;
  setValues: (values: Partial<T>) => void;
  touchField: (name: keyof T) => void;
  validate: () => boolean;
  reset: () => void;
  getFieldProps: (name: keyof T) => {
    value: FormFieldValue;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean | undefined;
    'aria-describedby': string | undefined;
  };
}

/**
 * Headless form state manager — no components, no context, no validation library required.
 * Works with any input elements.
 *
 * @example
 * const { values, errors, getFieldProps, validate } = useFormState({
 *   initialValues: { email: '', password: '' },
 *   validate: ({ email, password }) => ({
 *     email: !email.includes('@') ? 'Invalid email' : undefined,
 *     _root: email === password ? 'Email and password must not match' : undefined,
 *   }),
 *   validateAsync: {
 *     email: async (value) => {
 *       const taken = await checkEmailTaken(value);
 *       return taken ? 'Already taken' : null;
 *     },
 *   },
 *   debounceMs: 300,
 * });
 */
export function useFormState<T extends Record<string, FormFieldValue>>({
  initialValues,
  validate: validateFn,
  validateAsync,
  debounceMs = 300,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [values, setValuesState] = useState<T>({ ...initialValues });
  const [syncErrors, setSyncErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [asyncErrors, setAsyncErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [validating, setValidating] = useState<Partial<Record<keyof T, boolean>>>({});
  const [rootError, setRootError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const initialRef = useRef(initialValues);

  // Per-field debounce timers + token to invalidate stale async results.
  const timersRef = useRef<Partial<Record<keyof T, ReturnType<typeof setTimeout>>>>({});
  const tokensRef = useRef<Partial<Record<keyof T, number>>>({});
  // Keep latest values accessible inside the debounced closure.
  const valuesRef = useRef<T>(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);
  // Keep async validators map accessible (config may change between renders).
  const validateAsyncRef = useRef(validateAsync);
  useEffect(() => {
    validateAsyncRef.current = validateAsync;
  }, [validateAsync]);

  const scheduleAsyncValidation = useCallback(
    (name: keyof T) => {
      const fn = validateAsyncRef.current?.[name];
      if (!fn) return;
      const existing = timersRef.current[name];
      if (existing) clearTimeout(existing);
      timersRef.current[name] = setTimeout(() => {
        const token = (tokensRef.current[name] ?? 0) + 1;
        tokensRef.current[name] = token;
        setValidating((prev) => ({ ...prev, [name]: true }));
        Promise.resolve()
          .then(() => fn(valuesRef.current[name], valuesRef.current))
          .then((result) => {
            // Discard if a newer call has been scheduled.
            if (tokensRef.current[name] !== token) return;
            setValidating((prev) => {
              const next = { ...prev };
              delete next[name];
              return next;
            });
            setAsyncErrors((prev) => {
              const next = { ...prev };
              if (result) next[name] = result;
              else delete next[name];
              return next;
            });
          })
          .catch(() => {
            if (tokensRef.current[name] !== token) return;
            setValidating((prev) => {
              const next = { ...prev };
              delete next[name];
              return next;
            });
          });
      }, debounceMs);
    },
    [debounceMs],
  );

  const setValue = useCallback(
    (name: keyof T, value: FormFieldValue) => {
      setValuesState((prev) => ({ ...prev, [name]: value }));
      // Bump the token immediately so any in-flight call resolves into a no-op.
      tokensRef.current[name] = (tokensRef.current[name] ?? 0) + 1;
      scheduleAsyncValidation(name);
    },
    [scheduleAsyncValidation],
  );

  const setValues = useCallback(
    (partial: Partial<T>) => {
      setValuesState((prev) => ({ ...prev, ...partial }));
      for (const key of Object.keys(partial) as Array<keyof T>) {
        tokensRef.current[key] = (tokensRef.current[key] ?? 0) + 1;
        scheduleAsyncValidation(key);
      }
    },
    [scheduleAsyncValidation],
  );

  const touchField = useCallback((name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    if (!validateFn) return true;
    const raw = validateFn(values) as ValidateResult<T>;
    const { _root, ...rest } = raw;
    const filtered = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v != null),
    ) as Partial<Record<keyof T, string>>;
    setSyncErrors(filtered);
    setRootError(_root || undefined);
    // Touch all fields so errors show
    const allTouched = Object.fromEntries(
      Object.keys(values).map((k) => [k, true]),
    ) as Partial<Record<keyof T, boolean>>;
    setTouched(allTouched);
    return Object.keys(filtered).length === 0 && !_root;
  }, [values, validateFn]);

  const reset = useCallback(() => {
    // Cancel any pending async work.
    for (const key of Object.keys(timersRef.current) as Array<keyof T>) {
      const t = timersRef.current[key];
      if (t) clearTimeout(t);
      tokensRef.current[key] = (tokensRef.current[key] ?? 0) + 1;
    }
    timersRef.current = {};
    setValuesState({ ...initialRef.current });
    setSyncErrors({});
    setAsyncErrors({});
    setValidating({});
    setRootError(undefined);
    setTouched({});
  }, []);

  // Clean up timers on unmount.
  useEffect(() => {
    return () => {
      for (const key of Object.keys(timersRef.current) as Array<keyof T>) {
        const t = timersRef.current[key];
        if (t) clearTimeout(t);
      }
    };
  }, []);

  // Merge sync + async errors. Async wins when both present.
  const errors: Partial<Record<keyof T, string>> = { ...syncErrors, ...asyncErrors };

  const dirty = Object.keys(values).some(
    (k) => values[k as keyof T] !== initialRef.current[k as keyof T],
  );

  const isValid = Object.keys(errors).length === 0 && !rootError;

  const getFieldProps = useCallback(
    (name: keyof T) => ({
      value: values[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setValue(name, e.target.value);
      },
      onBlur: () => touchField(name),
      'aria-invalid': touched[name] && !!errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `${String(name)}-error` : undefined,
    }),
    [values, errors, touched, setValue, touchField],
  );

  return {
    values,
    errors,
    asyncErrors,
    validating,
    rootError,
    touched,
    dirty,
    isValid,
    setValue,
    setValues,
    touchField,
    validate,
    reset,
    getFieldProps,
  };
}
