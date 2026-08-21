import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import {
  TkxFormBuilder,
  validateField,
  type FormSchema,
  type FormField,
} from '../src/components/TkxFormBuilder';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

function Harness({ initial }: { initial: FormSchema }) {
  const [schema, setSchema] = useState<FormSchema>(initial);
  return <TkxFormBuilder schema={schema} onChange={setSchema} />;
}

describe('TkxFormBuilder', () => {
  it('renders the three tabs and starts on design', () => {
    render(<Harness initial={{ fields: [] }} />, { wrapper: W });
    expect(screen.getByTestId('tab-design')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('tab-preview')).toBeInTheDocument();
    expect(screen.getByTestId('tab-json')).toBeInTheDocument();
  });

  it('shows the empty-state hint when no fields exist', () => {
    render(<Harness initial={{ fields: [] }} />, { wrapper: W });
    expect(screen.getByText(/No fields yet/i)).toBeInTheDocument();
  });

  it('appends a field when clicking the palette', () => {
    render(<Harness initial={{ fields: [] }} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('palette-text'));
    expect(screen.getByText('Text 1')).toBeInTheDocument();
  });

  it('moves the selected field down', () => {
    render(<Harness initial={{ fields: [] }} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('palette-text'));
    fireEvent.click(screen.getByTestId('palette-email'));
    // The two fields should now exist in this order: Text 1, Email 2
    const labels = screen.getAllByText(/^(Text|Email) \d+/i).map((n) => n.textContent);
    expect(labels[0]).toMatch(/Text 1/);
    expect(labels[1]).toMatch(/Email 2/);

    fireEvent.click(screen.getByLabelText(/Move Text 1 down/i));
    const labelsAfter = screen.getAllByText(/^(Text|Email) \d+/i).map((n) => n.textContent);
    expect(labelsAfter[0]).toMatch(/Email 2/);
    expect(labelsAfter[1]).toMatch(/Text 1/);
  });

  it('removes a field via the remove button', () => {
    render(<Harness initial={{ fields: [] }} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('palette-text'));
    expect(screen.getByText('Text 1')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Remove Text 1/i));
    expect(screen.queryByText('Text 1')).not.toBeInTheDocument();
  });

  it('shows the inspector for the most-recently-added field', () => {
    render(<Harness initial={{ fields: [] }} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('palette-text'));
    expect(screen.getByLabelText('Label')).toHaveValue('Text 1');
  });

  it('renders the JSON view with the schema', () => {
    render(<Harness initial={{ title: 'Hi', fields: [] }} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('tab-json'));
    const view = screen.getByTestId('json-view');
    expect(view.textContent).toContain('"title": "Hi"');
  });

  it('renders the live preview with the field label', () => {
    const initial: FormSchema = {
      fields: [
        {
          id: 'f1',
          type: 'text',
          name: 'first',
          label: 'First name',
          required: true,
        },
      ],
    };
    render(<Harness initial={initial} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('tab-preview'));
    expect(screen.getByText('First name')).toBeInTheDocument();
  });

  it('shows a validation error when submitting without required value', () => {
    const initial: FormSchema = {
      fields: [
        {
          id: 'f1',
          type: 'text',
          name: 'first',
          label: 'First name',
          required: true,
        },
      ],
    };
    render(<Harness initial={initial} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('tab-preview'));
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/required/i);
  });

  it('submits valid values and renders them as JSON', () => {
    const initial: FormSchema = {
      fields: [
        {
          id: 'f1',
          type: 'email',
          name: 'email',
          label: 'Email',
          required: true,
        },
      ],
    };
    render(<Harness initial={initial} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('tab-preview'));
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'a@b.co' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByTestId('preview-submitted').textContent).toContain('"email": "a@b.co"');
  });
});

describe('validateField', () => {
  const f = (overrides: Partial<FormField> = {}): FormField => ({
    id: 'x',
    type: 'text',
    name: 'x',
    label: 'X',
    ...overrides,
  });

  it('flags required + empty', () => {
    expect(validateField(f({ required: true }), '')).toMatch(/required/i);
  });

  it('passes required + non-empty', () => {
    expect(validateField(f({ required: true }), 'hi')).toBeNull();
  });

  it('flags malformed email', () => {
    expect(validateField(f({ type: 'email' }), 'not-an-email')).toMatch(/invalid/i);
  });

  it('passes valid email', () => {
    expect(validateField(f({ type: 'email' }), 'a@b.co')).toBeNull();
  });

  it('enforces number min/max', () => {
    expect(validateField(f({ type: 'number', min: 5 }), '3')).toMatch(/≥ 5/);
    expect(validateField(f({ type: 'number', max: 10 }), '11')).toMatch(/≤ 10/);
    expect(validateField(f({ type: 'number', min: 5, max: 10 }), '7')).toBeNull();
  });

  it('enforces regex pattern', () => {
    expect(validateField(f({ pattern: '^\\d+$' }), 'abc')).toMatch(/format/i);
    expect(validateField(f({ pattern: '^\\d+$' }), '123')).toBeNull();
  });

  it('ignores broken patterns gracefully', () => {
    expect(validateField(f({ pattern: '[invalid(' }), 'abc')).toBeNull();
  });
});

// ── ARIA regression: listitem must not carry a prohibited selected state ────
describe('TkxFormBuilder — canvas rows use aria-current, not aria-selected', () => {
  it('never puts aria-selected on a role="listitem"', () => {
    const { container } = render(<Harness initial={{ fields: [] }} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('palette-text'));
    fireEvent.click(screen.getByTestId('palette-email'));
    const rows = container.querySelectorAll('[role="listitem"]');
    expect(rows.length).toBe(2);
    rows.forEach((r) => expect(r).not.toHaveAttribute('aria-selected'));
  });

  it('marks the row the properties panel is editing with aria-current', () => {
    const { container } = render(<Harness initial={{ fields: [] }} />, { wrapper: W });
    fireEvent.click(screen.getByTestId('palette-text'));
    fireEvent.click(screen.getByTestId('palette-email'));
    const rows = Array.from(container.querySelectorAll('[role="listitem"]'));

    fireEvent.click(rows[0]);
    expect(rows[0]).toHaveAttribute('aria-current', 'true');
    expect(rows[1]).not.toHaveAttribute('aria-current');

    fireEvent.click(rows[1]);
    expect(rows[1]).toHaveAttribute('aria-current', 'true');
    expect(rows[0]).not.toHaveAttribute('aria-current');
  });
});
