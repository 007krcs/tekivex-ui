import { describe, it, expect } from 'vitest';
import { useState, type ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  createRHFBindings,
  type RHFControl,
  type RHFFieldRenderProps,
} from '../src/headless';

// ── Minimal fake Controller — calls render() with a fake field ─────────────
// Matches the structural shape react-hook-form's Controller exposes. No real
// `react-hook-form` dep needed — keeps this test suite zero-dep like the
// resolver tests next door.

interface FakeControllerProps {
  name: string;
  control: RHFControl;
  defaultValue?: unknown;
  rules?: object;
  render: (props: RHFFieldRenderProps<unknown>) => ReactElement;
}

function FakeController({ name, control, defaultValue, render }: FakeControllerProps) {
  const [value, setValue] = useState<unknown>(defaultValue ?? '');
  const error = control._formState?.errors?.[name];
  return render({
    field: {
      name,
      value,
      onChange: (v: unknown) => setValue(v),
      onBlur: () => {},
      ref: () => {},
    },
    fieldState: {
      error: error ? { message: error.message } : undefined,
      isTouched: false,
      isDirty: false,
    },
  });
}

function makeControl(errors: Record<string, { message?: string }> = {}): RHFControl {
  return { _formState: { errors } };
}

// ────────────────────────────────────────────────────────────────────────────
// Suite
// ────────────────────────────────────────────────────────────────────────────

describe('createRHFBindings', () => {
  it('returns an object with all expected binding keys', () => {
    const bindings = createRHFBindings({ Controller: FakeController as never });
    expect(bindings).toHaveProperty('TkxRHFInput');
    expect(bindings).toHaveProperty('TkxRHFSelect');
    expect(bindings).toHaveProperty('TkxRHFCheckbox');
    expect(bindings).toHaveProperty('TkxRHFToggle');
    expect(bindings).toHaveProperty('TkxRHFRadio');
    expect(bindings).toHaveProperty('TkxRHFNumberInput');
    expect(bindings).toHaveProperty('TkxRHFDatePicker');
  });

  // ── TkxRHFInput ────────────────────────────────────────────────────────────

  it('TkxRHFInput renders with the passed label', () => {
    const { TkxRHFInput } = createRHFBindings({ Controller: FakeController as never });
    render(<TkxRHFInput name="email" control={makeControl()} label="Email Address" />);
    expect(screen.getByText('Email Address')).toBeTruthy();
  });

  it('TkxRHFInput propagates user typing through field.onChange', () => {
    const { TkxRHFInput } = createRHFBindings({ Controller: FakeController as never });
    render(<TkxRHFInput name="email" control={makeControl()} label="Email" />);
    const input = screen.getByLabelText('Email') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'alice@example.com' } });
    expect(input.value).toBe('alice@example.com');
  });

  it('TkxRHFInput surfaces an error message from control._formState.errors', () => {
    const { TkxRHFInput } = createRHFBindings({ Controller: FakeController as never });
    const control = makeControl({ email: { message: 'Required field' } });
    render(<TkxRHFInput name="email" control={control} label="Email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  // ── TkxRHFSelect ───────────────────────────────────────────────────────────

  it('TkxRHFSelect renders the supplied options inside its dropdown', () => {
    const { TkxRHFSelect } = createRHFBindings({ Controller: FakeController as never });
    render(
      <TkxRHFSelect
        name="country"
        control={makeControl()}
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('United States')).toBeTruthy();
    expect(screen.getByText('Canada')).toBeTruthy();
  });

  it('TkxRHFSelect propagates a user selection', () => {
    const { TkxRHFSelect } = createRHFBindings({ Controller: FakeController as never });
    render(
      <TkxRHFSelect
        name="country"
        control={makeControl()}
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ]}
      />,
    );
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Canada'));
    // After commit, trigger label reflects selection
    expect(trigger).toHaveTextContent('Canada');
  });

  // ── TkxRHFCheckbox ─────────────────────────────────────────────────────────

  it('TkxRHFCheckbox toggles a boolean value', () => {
    const { TkxRHFCheckbox } = createRHFBindings({ Controller: FakeController as never });
    render(<TkxRHFCheckbox name="tos" control={makeControl()} label="Accept terms" />);
    const box = screen.getByLabelText('Accept terms') as HTMLInputElement;
    expect(box.checked).toBe(false);
    fireEvent.click(box);
    expect(box.checked).toBe(true);
    fireEvent.click(box);
    expect(box.checked).toBe(false);
  });

  it('TkxRHFCheckbox checked state mirrors a true defaultValue', () => {
    const { TkxRHFCheckbox } = createRHFBindings({ Controller: FakeController as never });
    render(
      <TkxRHFCheckbox name="sub" control={makeControl()} defaultValue={true} label="Subscribe" />,
    );
    expect((screen.getByLabelText('Subscribe') as HTMLInputElement).checked).toBe(true);
  });

  // ── TkxRHFToggle ───────────────────────────────────────────────────────────

  it('TkxRHFToggle flips on press', () => {
    const { TkxRHFToggle } = createRHFBindings({ Controller: FakeController as never });
    render(<TkxRHFToggle name="dark" control={makeControl()} label="Dark mode" />);
    const switchBtn = screen.getByRole('switch');
    expect(switchBtn.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(switchBtn);
    expect(switchBtn.getAttribute('aria-checked')).toBe('true');
  });

  // ── TkxRHFRadio ────────────────────────────────────────────────────────────

  it('TkxRHFRadio selects its value when clicked', () => {
    const { TkxRHFRadio } = createRHFBindings({ Controller: FakeController as never });
    render(
      <>
        <TkxRHFRadio name="size" control={makeControl()} value="sm" label="Small" />
        <TkxRHFRadio name="size" control={makeControl()} value="lg" label="Large" />
      </>,
    );
    const small = screen.getByLabelText('Small') as HTMLInputElement;
    fireEvent.click(small);
    expect(small.checked).toBe(true);
  });

  // ── defaultValue ───────────────────────────────────────────────────────────

  it('TkxRHFInput respects defaultValue', () => {
    const { TkxRHFInput } = createRHFBindings({ Controller: FakeController as never });
    render(
      <TkxRHFInput
        name="nickname"
        control={makeControl()}
        defaultValue="ada"
        label="Nickname"
      />,
    );
    expect((screen.getByLabelText('Nickname') as HTMLInputElement).value).toBe('ada');
  });

  // ── Smoke: 3 bindings coexist in one form ──────────────────────────────────

  it('multiple bindings render together inside one form', () => {
    const { TkxRHFInput, TkxRHFCheckbox, TkxRHFToggle } = createRHFBindings({
      Controller: FakeController as never,
    });
    const control = makeControl();
    render(
      <form>
        <TkxRHFInput name="email" control={control} label="Email" />
        <TkxRHFCheckbox name="tos" control={control} label="Accept terms" />
        <TkxRHFToggle name="dark" control={control} label="Dark mode" />
      </form>,
    );
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Accept terms')).toBeTruthy();
    expect(screen.getByRole('switch')).toBeTruthy();
  });
});
