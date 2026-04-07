import { useState, useCallback, useRef } from 'react';

export type FormFieldValue = string | number | boolean | string[] | null | undefined;

export interface FieldState {
  value: FormFieldValue;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

export interface UseFormStateOptions<T extends Record<string, FormFieldValue>> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export interface UseFormStateReturn<T extends Record<string, FormFieldValue>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
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
 *   validate: ({ email }) => ({
 *     email: !email.includes('@') ? 'Invalid email' : undefined,
 *   }),
 * });
 */
export function useFormState<T extends Record<string, FormFieldValue>>({
  initialValues,
  validate: validateFn,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [values, setValuesState] = useState<T>({ ...initialValues });
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const initialRef = useRef(initialValues);

  const setValue = useCallback((name: keyof T, value: FormFieldValue) => {
    setValuesState(prev => ({ ...prev, [name]: value }));
  }, []);

  const setValues = useCallback((partial: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...partial }));
  }, []);

  const touchField = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    if (!validateFn) return true;
    const newErrors = validateFn(values);
    const filtered = Object.fromEntries(
      Object.entries(newErrors).filter(([, v]) => v != null),
    ) as Partial<Record<keyof T, string>>;
    setErrors(filtered);
    // Touch all fields so errors show
    const allTouched = Object.fromEntries(
      Object.keys(values).map(k => [k, true]),
    ) as Partial<Record<keyof T, boolean>>;
    setTouched(allTouched);
    return Object.keys(filtered).length === 0;
  }, [values, validateFn]);

  const reset = useCallback(() => {
    setValuesState({ ...initialRef.current });
    setErrors({});
    setTouched({});
  }, []);

  const dirty = Object.keys(values).some(
    k => values[k as keyof T] !== initialRef.current[k as keyof T],
  );

  const isValid = Object.keys(errors).length === 0;

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

  return { values, errors, touched, dirty, isValid, setValue, setValues, touchField, validate, reset, getFieldProps };
}
