import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import {
  zodResolver,
  useFormWithZod,
  valibotResolver,
  useFormWithValibot,
  type ZodSchemaLike,
  type ValibotSafeParseFn,
} from '../src/headless';

// ── Fake Zod schema factory ─────────────────────────────────────────────────
// Matches the structural ZodSchemaLike type — no real zod dep needed.
function fakeZodSchema(
  validator: (v: unknown) => { path: (string | number)[]; message: string }[],
): ZodSchemaLike {
  return {
    safeParse(value) {
      const issues = validator(value);
      if (issues.length === 0) return { success: true, data: value };
      return { success: false, error: { issues } };
    },
  };
}

// ── Fake Valibot safeParse + schema ─────────────────────────────────────────
function fakeValibot(
  validator: (v: unknown) => { path?: { key: string | number }[]; message: string }[],
): { safeParse: ValibotSafeParseFn; schema: unknown } {
  const schema = { __id: 'fake' };
  const safeParse: ValibotSafeParseFn = (_schema, value) => {
    const issues = validator(value);
    if (issues.length === 0) return { success: true, output: value };
    return { success: false, issues };
  };
  return { safeParse, schema };
}

// ────────────────────────────────────────────────────────────────────────────
// Zod resolver
// ────────────────────────────────────────────────────────────────────────────

describe('zodResolver', () => {
  it('returns no errors when data is valid', () => {
    const schema = fakeZodSchema(() => []);
    const validate = zodResolver<{ email: string }>(schema);
    expect(validate({ email: 'ok@ok.com' })).toEqual({});
  });

  it('returns errors keyed by field path when invalid', () => {
    const schema = fakeZodSchema(() => [
      { path: ['email'], message: 'Invalid email' },
      { path: ['age'], message: 'Too young' },
    ]);
    const validate = zodResolver<{ email: string; age: string }>(schema);
    expect(validate({ email: 'x', age: '0' })).toEqual({
      email: 'Invalid email',
      age: 'Too young',
    });
  });

  it('flattens nested-path errors with dot notation', () => {
    const schema = fakeZodSchema(() => [
      { path: ['user', 'email'], message: 'bad email' },
      { path: ['user', 'profile', 'name'], message: 'no name' },
    ]);
    const validate = zodResolver(schema);
    const out = validate({} as Record<string, never>);
    expect(out).toEqual({
      'user.email': 'bad email',
      'user.profile.name': 'no name',
    });
  });

  it('treats empty schema (zero issues) as no-op', () => {
    const schema = fakeZodSchema(() => []);
    const validate = zodResolver(schema);
    expect(validate({ anything: 'goes' } as Record<string, string>)).toEqual({});
  });

  it('useFormWithZod renders, validate propagates errors on submit', async () => {
    const schema = fakeZodSchema((v) => {
      const values = v as { email: string };
      return values.email.includes('@')
        ? []
        : [{ path: ['email'], message: 'Need @' }];
    });
    const onSubmit = vi.fn();

    function Form() {
      const f = useFormWithZod({
        schema,
        initialValues: { email: '' },
        onSubmit,
      });
      return (
        <form onSubmit={f.handleSubmit}>
          <input data-testid="email" {...f.getFieldProps('email')} />
          {f.errors.email && <span data-testid="err">{f.errors.email}</span>}
          <button type="submit">Go</button>
        </form>
      );
    }

    render(<Form />);
    fireEvent.click(screen.getByText('Go'));
    await waitFor(() => expect(screen.getByTestId('err')).toHaveTextContent('Need @'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('useFormWithZod calls onSubmit (async) when valid', async () => {
    const schema = fakeZodSchema(() => []);
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    function Form() {
      const f = useFormWithZod({
        schema,
        initialValues: { name: 'Alice' },
        onSubmit,
      });
      return <button onClick={() => f.handleSubmit()}>Submit</button>;
    }

    render(<Form />);
    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Alice' }));
  });

  it('zodResolver dedupes multiple issues for same path (keeps first)', () => {
    const schema = fakeZodSchema(() => [
      { path: ['email'], message: 'first' },
      { path: ['email'], message: 'second' },
    ]);
    const validate = zodResolver<{ email: string }>(schema);
    expect(validate({ email: '' })).toEqual({ email: 'first' });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Valibot resolver
// ────────────────────────────────────────────────────────────────────────────

describe('valibotResolver', () => {
  it('returns no errors when data is valid', () => {
    const { safeParse, schema } = fakeValibot(() => []);
    const validate = valibotResolver<{ email: string }>(safeParse, schema);
    expect(validate({ email: 'ok@ok.com' })).toEqual({});
  });

  it('returns errors keyed by field path when invalid', () => {
    const { safeParse, schema } = fakeValibot(() => [
      { path: [{ key: 'email' }], message: 'Invalid email' },
      { path: [{ key: 'age' }], message: 'Too young' },
    ]);
    const validate = valibotResolver<{ email: string; age: string }>(safeParse, schema);
    expect(validate({ email: 'x', age: '0' })).toEqual({
      email: 'Invalid email',
      age: 'Too young',
    });
  });

  it('flattens nested-path errors with dot notation', () => {
    const { safeParse, schema } = fakeValibot(() => [
      { path: [{ key: 'user' }, { key: 'email' }], message: 'bad email' },
      {
        path: [{ key: 'user' }, { key: 'profile' }, { key: 'name' }],
        message: 'no name',
      },
    ]);
    const validate = valibotResolver(safeParse, schema);
    const out = validate({} as Record<string, never>);
    expect(out).toEqual({
      'user.email': 'bad email',
      'user.profile.name': 'no name',
    });
  });

  it('treats missing issues array as no-op', () => {
    const safeParse: ValibotSafeParseFn = () => ({ success: false });
    const validate = valibotResolver({} as never, {});
    // Missing schema/safeParse should still not blow up — use our above instead
    const v2 = valibotResolver(safeParse, {});
    expect(v2({ x: 'y' } as Record<string, string>)).toEqual({});
    // appease tsc: actually exercise the unused `validate` reference
    expect(typeof validate).toBe('function');
  });

  it('useFormWithValibot renders, validate propagates errors on submit', async () => {
    const { safeParse, schema } = fakeValibot((v) => {
      const values = v as { email: string };
      return values.email.includes('@')
        ? []
        : [{ path: [{ key: 'email' }], message: 'Need @' }];
    });
    const onSubmit = vi.fn();

    function Form() {
      const f = useFormWithValibot({
        safeParse,
        schema,
        initialValues: { email: '' },
        onSubmit,
      });
      return (
        <form onSubmit={f.handleSubmit}>
          <input data-testid="email" {...f.getFieldProps('email')} />
          {f.errors.email && <span data-testid="err">{f.errors.email}</span>}
          <button type="submit">Go</button>
        </form>
      );
    }

    render(<Form />);
    fireEvent.click(screen.getByText('Go'));
    await waitFor(() => expect(screen.getByTestId('err')).toHaveTextContent('Need @'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('useFormWithValibot calls onSubmit (async) when valid', async () => {
    const { safeParse, schema } = fakeValibot(() => []);
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    function Form() {
      const f = useFormWithValibot({
        safeParse,
        schema,
        initialValues: { name: 'Bob' },
        onSubmit,
      });
      return <button onClick={() => f.handleSubmit()}>Submit</button>;
    }

    render(<Form />);
    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Bob' }));
  });

  it('valibotResolver dedupes multiple issues for same path (keeps first)', () => {
    const { safeParse, schema } = fakeValibot(() => [
      { path: [{ key: 'email' }], message: 'first' },
      { path: [{ key: 'email' }], message: 'second' },
    ]);
    const validate = valibotResolver<{ email: string }>(safeParse, schema);
    expect(validate({ email: '' })).toEqual({ email: 'first' });
  });

  it('renderHook: useFormWithValibot exposes useFormState shape + handleSubmit', () => {
    const { safeParse, schema } = fakeValibot(() => []);
    const { result } = renderHook(() =>
      useFormWithValibot({
        safeParse,
        schema,
        initialValues: { x: 'y' },
      }),
    );
    expect(result.current.values).toEqual({ x: 'y' });
    expect(typeof result.current.validate).toBe('function');
    expect(typeof result.current.handleSubmit).toBe('function');
    expect(typeof result.current.getFieldProps).toBe('function');
  });
});
