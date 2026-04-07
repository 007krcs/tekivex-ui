import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TkxForm, TkxFormField } from '../src/components/TkxForm';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxForm', () => {
  it('renders a form element', () => {
    render(
      <TkxForm>
        <div>Form content</div>
      </TkxForm>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('renders form fields with labels', () => {
    render(
      <TkxForm>
        <TkxFormField name="username" label="Username">
          <input />
        </TkxFormField>
      </TkxForm>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('calls onSubmit with form values', () => {
    const onSubmit = vi.fn();
    render(
      <TkxForm onSubmit={onSubmit} initialValues={{ name: 'Alice' }}>
        <TkxFormField name="name" label="Name">
          <input />
        </TkxFormField>
        <button type="submit">Submit</button>
      </TkxForm>,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('shows validation error for required field on submit', async () => {
    render(
      <TkxForm>
        <TkxFormField name="email" label="Email" rules={[{ required: true, message: 'Email is required' }]}>
          <input />
        </TkxFormField>
        <button type="submit">Submit</button>
      </TkxForm>,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('renders help text when provided', () => {
    render(
      <TkxForm>
        <TkxFormField name="password" label="Password" help="Must be 8+ characters">
          <input />
        </TkxFormField>
      </TkxForm>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Must be 8+ characters')).toBeInTheDocument();
  });
});
