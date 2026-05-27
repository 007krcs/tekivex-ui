'use client';

/**
 * Zod resolver for `useFormState` — bring-your-own-zod.
 *
 * Why this exists:
 *   `useFormState` accepts a plain `(values) => Record<string, string>` validator.
 *   This adapter converts a Zod schema's `safeParse` output into that shape so
 *   teams already invested in Zod don't have to hand-roll a validator.
 *
 * Why we don't `import 'zod'`:
 *   tekivex-ui ships with zero runtime deps. The user installs zod themselves;
 *   we accept any object that satisfies the structural `ZodSchemaLike` type
 *   below — which every modern Zod schema (v3+) does.
 *
 * @example
 *   import { z } from 'zod';
 *   import { useFormWithZod } from 'tekivex-ui/headless';
 *
 *   const schema = z.object({
 *     email: z.string().email(),
 *     age: z.number().min(18),
 *   });
 *
 *   function SignupForm() {
 *     const form = useFormWithZod({
 *       schema,
 *       initialValues: { email: '', age: 0 },
 *       onSubmit: (values) => console.log(values),
 *     });
 *     return <form onSubmit={(e) => { e.preventDefault(); form.validate(); }} />;
 *   }
 */

import { useCallback } from 'react';
import { useFormState, type FormFieldValue, type UseFormStateReturn } from './useFormState';

export interface ZodIssueLike {
  path: (string | number)[];
  message: string;
}

export interface ZodSchemaLike {
  safeParse(value: unknown): {
    success: boolean;
    data?: unknown;
    error?: { issues: ZodIssueLike[] };
  };
}

export interface ZodResolverConfig<T extends Record<string, FormFieldValue>> {
  schema: ZodSchemaLike;
  initialValues: T;
  onSubmit?: (values: T) => void | Promise<void>;
}

/**
 * Wrap a Zod schema into a `validate` function compatible with `useFormState`.
 * Nested paths (e.g. `user.email`) are flattened with dot-notation keys.
 */
export function zodResolver<T extends Record<string, FormFieldValue>>(
  schema: ZodSchemaLike,
): (values: T) => Partial<Record<keyof T, string>> {
  return (values: T) => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    const errors: Record<string, string> = {};
    for (const issue of result.error?.issues ?? []) {
      const key = issue.path.length > 0 ? issue.path.join('.') : '_root';
      if (!errors[key]) errors[key] = issue.message;
    }
    return errors as Partial<Record<keyof T, string>>;
  };
}

/**
 * Convenience hook: `useFormState` + Zod schema in one call.
 * Returns the same shape as `useFormState` plus `handleSubmit`.
 */
export function useFormWithZod<T extends Record<string, FormFieldValue>>(
  opts: ZodResolverConfig<T>,
): UseFormStateReturn<T> & { handleSubmit: (e?: { preventDefault?: () => void }) => Promise<void> } {
  const form = useFormState<T>({
    initialValues: opts.initialValues,
    validate: zodResolver<T>(opts.schema),
  });
  const handleSubmit = useCallback(
    async (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      if (form.validate() && opts.onSubmit) await opts.onSubmit(form.values);
    },
    [form, opts],
  );
  return { ...form, handleSubmit };
}
