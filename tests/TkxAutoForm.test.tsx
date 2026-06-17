import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxAutoForm } from '../src/components/TkxAutoForm';
import type { FormSchema } from '../src/components/TkxFormBuilder';
import {
  onSecurityEvent,
  clearSecurityEvents,
} from '../src/engine/security';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const SCHEMA: FormSchema = {
  title: 'Contact',
  description: 'Reach out',
  fields: [
    { id: 'f1', type: 'text', name: 'fullName', label: 'Full name', required: true },
    { id: 'f2', type: 'email', name: 'email', label: 'Email', required: true },
    { id: 'f3', type: 'textarea', name: 'message', label: 'Message' },
    {
      id: 'f4',
      type: 'select',
      name: 'topic',
      label: 'Topic',
      options: [
        { label: 'Sales', value: 'sales' },
        { label: 'Support', value: 'support' },
      ],
    },
  ],
};

describe('TkxAutoForm', () => {
  it('renders a control + label for every field in the schema', () => {
    render(
      <W>
        <TkxAutoForm schema={SCHEMA} />
      </W>,
    );
    expect(screen.getByLabelText(/Full name/)).toBeTruthy();
    expect(screen.getByLabelText(/Email/)).toBeTruthy();
    expect(screen.getByLabelText(/Message/)).toBeTruthy();
    expect(screen.getByLabelText(/Topic/)).toBeTruthy();
    expect(screen.getByText('Contact')).toBeTruthy();
    expect(screen.getByText('Reach out')).toBeTruthy();
  });

  it('blocks submit and shows an error summary when required fields are empty', () => {
    const onSubmit = vi.fn();
    render(
      <W>
        <TkxAutoForm schema={SCHEMA} onSubmit={onSubmit} />
      </W>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).not.toHaveBeenCalled();
    // The summary alert (the one with the "attention" heading) names both fields.
    const summary = screen
      .getAllByRole('alert')
      .find((el) => /attention/.test(el.textContent ?? ''));
    expect(summary).toBeTruthy();
    expect(summary!.textContent).toContain('Full name');
    expect(summary!.textContent).toContain('Email');
  });

  it('submits validated values when the form is valid', () => {
    const onSubmit = vi.fn();
    render(
      <W>
        <TkxAutoForm schema={SCHEMA} onSubmit={onSubmit} />
      </W>,
    );
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'ada@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const data = onSubmit.mock.calls[0][0];
    expect(data.fullName).toBe('Ada Lovelace');
    expect(data.email).toBe('ada@example.com');
  });

  it('rejects an invalid email', () => {
    const onSubmit = vi.fn();
    render(
      <W>
        <TkxAutoForm schema={SCHEMA} onSubmit={onSubmit} />
      </W>,
    );
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sanitises string values through the kernel before onSubmit (default)', () => {
    const onSubmit = vi.fn();
    render(
      <W>
        <TkxAutoForm schema={SCHEMA} onSubmit={onSubmit} />
      </W>,
    );
    fireEvent.change(screen.getByLabelText(/Full name/), {
      target: { value: '<script>alert(1)</script>' },
    });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'ada@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const { fullName } = onSubmit.mock.calls[0][0];
    expect(fullName).not.toContain('<script>');
    expect(fullName).toContain('&lt;script&gt;');
  });

  it('does NOT sanitise when sanitize={false}', () => {
    const onSubmit = vi.fn();
    render(
      <W>
        <TkxAutoForm schema={SCHEMA} onSubmit={onSubmit} sanitize={false} />
      </W>,
    );
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: '<b>raw</b>' } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'ada@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit.mock.calls[0][0].fullName).toBe('<b>raw</b>');
  });

  it('redacts PII when redactPII is set', () => {
    const onSubmit = vi.fn();
    render(
      <W>
        <TkxAutoForm schema={SCHEMA} onSubmit={onSubmit} redactPII />
      </W>,
    );
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText(/Message/), {
      target: { value: 'call me at jane@secret.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    const { message } = onSubmit.mock.calls[0][0];
    expect(message).toContain('[redacted-email]');
  });

  it('emits a security event on submit (lights up the dashboard)', () => {
    clearSecurityEvents();
    const seen: string[] = [];
    const unsub = onSecurityEvent((e) => seen.push(e.type));
    const onSubmit = vi.fn();
    render(
      <W>
        <TkxAutoForm schema={SCHEMA} onSubmit={onSubmit} />
      </W>,
    );
    fireEvent.change(screen.getByLabelText(/Full name/), {
      target: { value: '<img src=x>' },
    });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'ada@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(seen).toContain('xss-sanitized');
    unsub();
  });

  it('seeds defaultValues', () => {
    render(
      <W>
        <TkxAutoForm schema={SCHEMA} defaultValues={{ fullName: 'Seed' }} />
      </W>,
    );
    expect((screen.getByLabelText(/Full name/) as HTMLInputElement).value).toBe('Seed');
  });

  it('marks invalid fields with aria-invalid after a failed submit', () => {
    render(
      <W>
        <TkxAutoForm schema={SCHEMA} />
      </W>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByLabelText(/Full name/).getAttribute('aria-invalid')).toBe('true');
  });
});
