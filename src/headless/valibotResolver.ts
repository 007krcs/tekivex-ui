'use client';

/**
 * Valibot resolver for `useFormState` — bring-your-own-valibot.
 *
 * Why this exists:
 *   Valibot is a tree-shakable alternative to Zod. Same story as the Zod
 *   resolver — wrap `safeParse` output into the `Record<string, string>`
 *   shape `useFormState` expects.
 *
 * Why we don't `import 'valibot'`:
 *   tekivex-ui ships zero runtime deps. Valibot's `safeParse` is a free
 *   function (not a method on the schema, unlike Zod), so the cleanest API
 *   is to have the consumer pass it in. That way we never reach for the
 *   `valibot` module at all — works with any Valibot version.
 *
 * @example
 *   import * as v from 'valibot';
 *   import { useFormWithValibot } from 'tekivex-ui/headless';
 *
 *   const schema = v.object({
 *     email: v.pipe(v.string(), v.email()),
 *     age: v.pipe(v.number(), v.minValue(18)),
 *   });
 *
 *   function SignupForm() {
 *     const form = useFormWithValibot({
 *       safeParse: v.safeParse,
 *       schema,
 *       initialValues: { email: '', age: 0 },
 *       onSubmit: (values) => console.log(values),
 *     });
 *     return <form onSubmit={form.handleSubmit} />;
 *   }
 */

import { useCallback } from 'react';
import { useFormState, type FormFieldValue, type UseFormStateReturn } from './useFormState';

export interface ValibotIssueLike {
  path?: { key: string | number }[];
  message: string;
}

export interface ValibotSafeParseResult {
  success: boolean;
  output?: unknown;
  issues?: ValibotIssueLike[];
}

export type ValibotSafeParseFn = (schema: unknown, value: unknown) => ValibotSafeParseResult;

export interface ValibotResolverConfig<T extends Record<string, FormFieldValue>> {
  safeParse: ValibotSafeParseFn;
  schema: unknown;
  initialValues: T;
  onSubmit?: (values: T) => void | Promise<void>;
}

/**
 * Wrap a Valibot schema + its `safeParse` into a `validate` function for
 * `useFormState`. Nested paths flatten to dot-notation keys.
 */
export function valibotResolver<T extends Record<string, FormFieldValue>>(
  safeParse: ValibotSafeParseFn,
  schema: unknown,
): (values: T) => Partial<Record<keyof T, string>> {
  return (values: T) => {
    const result = safeParse(schema, values);
    if (result.success) return {};
    const errors: Record<string, string> = {};
    for (const issue of result.issues ?? []) {
      const segs = (issue.path ?? []).map(p => String(p.key));
      const key = segs.length > 0 ? segs.join('.') : '_root';
      if (!errors[key]) errors[key] = issue.message;
    }
    return errors as Partial<Record<keyof T, string>>;
  };
}

/**
 * Convenience hook: `useFormState` + Valibot schema in one call.
 */
export function useFormWithValibot<T extends Record<string, FormFieldValue>>(
  opts: ValibotResolverConfig<T>,
): UseFormStateReturn<T> & { handleSubmit: (e?: { preventDefault?: () => void }) => Promise<void> } {
  const form = useFormState<T>({
    initialValues: opts.initialValues,
    validate: valibotResolver<T>(opts.safeParse, opts.schema),
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
