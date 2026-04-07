import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxForm,
  TkxFormField,
  TkxInput,
  TkxButton,
  useTkxForm,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Props definitions ────────────────────────────────────────────────────────

const FORM_PROPS = [
  { name: 'onSubmit', type: '(values: Record<string, any>) => void | Promise<void>', default: 'undefined', description: 'Called with all field values when the form is submitted and validation passes.' },
  { name: 'onValuesChange', type: '(changed: Record<string, any>, all: Record<string, any>) => void', default: 'undefined', description: 'Called whenever a field value changes, with the changed fields and all current values.' },
  { name: 'initialValues', type: 'Record<string, any>', default: '{}', description: 'Initial values for all fields, keyed by field name.' },
  { name: 'layout', type: "'vertical' | 'horizontal' | 'inline'", default: "'vertical'", description: 'Controls label/field arrangement: vertical stacks them, horizontal places labels beside fields, inline renders everything in a row.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all fields in the form.' },
  { name: 'children', type: 'ReactNode', description: 'Form content, typically TkxFormField components.', required: true },
  { name: 'className', type: 'string', default: 'undefined', description: 'Additional class name for the form element.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles for the form element.' },
];

const FORM_FIELD_PROPS = [
  { name: 'name', type: 'string', description: 'Field name used as the key in form values.', required: true },
  { name: 'label', type: 'string', default: 'undefined', description: 'Label text displayed above or beside the field.' },
  { name: 'rules', type: 'ValidationRule[]', default: '[]', description: 'Array of validation rules applied to this field.' },
  { name: 'help', type: 'string', default: 'undefined', description: 'Helper text displayed below the field.' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Marks the field as required (visual indicator, also add a required rule for validation).' },
  { name: 'children', type: 'ReactElement', description: 'A single input element. The form injects value and onChange props.', required: true },
  { name: 'className', type: 'string', default: 'undefined', description: 'Additional class name for the field wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles for the field wrapper.' },
];

const VALIDATION_RULE_PROPS = [
  { name: 'required', type: 'boolean', default: 'false', description: 'Field must have a non-empty value.' },
  { name: 'min', type: 'number', default: 'undefined', description: 'Minimum string length or numeric value.' },
  { name: 'max', type: 'number', default: 'undefined', description: 'Maximum string length or numeric value.' },
  { name: 'pattern', type: 'RegExp', default: 'undefined', description: 'Regular expression the value must match.' },
  { name: 'validator', type: '(value: any) => string | null | Promise<string | null>', default: 'undefined', description: 'Custom sync or async validator. Return an error string or null.' },
  { name: 'message', type: 'string', default: 'undefined', description: 'Custom error message used when the rule fails.' },
];

const FORM_INSTANCE_PROPS = [
  { name: 'getFieldValue', type: '(name: string) => any', description: 'Get the current value of a single field.' },
  { name: 'setFieldValue', type: '(name: string, value: any) => void', description: 'Set the value of a single field.' },
  { name: 'getFieldsValue', type: '() => Record<string, any>', description: 'Get all current field values.' },
  { name: 'setFieldsValue', type: '(values: Record<string, any>) => void', description: 'Set multiple field values at once.' },
  { name: 'validateFields', type: '() => Promise<Record<string, any>>', description: 'Validate all fields and return values if valid.' },
  { name: 'validateField', type: '(name: string) => Promise<boolean>', description: 'Validate a single field. Returns true if valid.' },
  { name: 'resetFields', type: '() => void', description: 'Reset all fields to their initial values and clear errors.' },
  { name: 'getFieldError', type: '(name: string) => string | null', description: 'Get the current error message for a field.' },
  { name: 'isFieldTouched', type: '(name: string) => boolean', description: 'Check whether a field has been interacted with.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function FormPage({ theme }: { theme: ThemeTokens }) {
  const [basicResult, setBasicResult] = useState<string | null>(null);
  const [programmaticLog, setProgrammaticLog] = useState<string[]>([]);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const logBoxStyle = {
    marginTop: 12,
    padding: '12px 16px',
    borderRadius: 8,
    backgroundColor: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    fontSize: 13,
    color: theme.textMuted,
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap' as const,
    maxHeight: 160,
    overflow: 'auto' as const,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Basic Form with Validation ─────────────────────────────────── */}

      <DemoSection
        title="Basic Form with Validation"
        description="A registration form with email (required, pattern) and password (required, min length) validation. Submit to see the result."
        theme={theme}
        code={`<TkxForm
  initialValues={{ email: '', password: '', name: '' }}
  onSubmit={(values) => console.log('Submitted:', values)}
>
  <TkxFormField
    name="name"
    label="Full Name"
    rules={[{ required: true, message: 'Name is required' }]}
    required
  >
    <TkxInput label="Full Name" placeholder="Jane Doe" />
  </TkxFormField>

  <TkxFormField
    name="email"
    label="Email"
    rules={[
      { required: true, message: 'Email is required' },
      { pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, message: 'Enter a valid email' },
    ]}
    required
  >
    <TkxInput label="Email" type="email" placeholder="jane@example.com" />
  </TkxFormField>

  <TkxFormField
    name="password"
    label="Password"
    rules={[
      { required: true, message: 'Password is required' },
      { min: 8, message: 'Must be at least 8 characters' },
    ]}
    required
  >
    <TkxInput type="password" placeholder="Min 8 characters" />
  </TkxFormField>

  <TkxButton type="submit">Register</TkxButton>
</TkxForm>`}
      >
        <div>
          <TkxForm
            initialValues={{ email: '', password: '', name: '' }}
            onSubmit={(values) => setBasicResult(JSON.stringify(values, null, 2))}
          >
            <TkxFormField
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Name is required' }]}
              required
            >
              <TkxInput placeholder="Jane Doe" />
            </TkxFormField>

            <TkxFormField
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Email is required' },
                { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              ]}
              required
            >
              <TkxInput type="email" placeholder="jane@example.com" />
            </TkxFormField>

            <TkxFormField
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Password is required' },
                { min: 8, message: 'Must be at least 8 characters' },
              ]}
              required
            >
              <TkxInput type="password" placeholder="Min 8 characters" />
            </TkxFormField>

            <div style={{ marginTop: 16 }}>
              <TkxButton type="submit">Register</TkxButton>
            </div>
          </TkxForm>

          {basicResult && (
            <div style={logBoxStyle}>
              Submitted values:{'\n'}{basicResult}
            </div>
          )}
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Horizontal Layout ──────────────────────────────────────────── */}

      <DemoSection
        title="Horizontal Layout"
        description="Labels are placed beside fields instead of above. Ideal for settings forms with short labels."
        theme={theme}
        code={`<TkxForm layout="horizontal" onSubmit={handleSubmit}>
  <TkxFormField name="username" label="Username" required
    rules={[{ required: true, message: 'Required' }]}>
    <TkxInput placeholder="Enter username" />
  </TkxFormField>

  <TkxFormField name="bio" label="Bio" help="A short description about yourself">
    <TkxInput placeholder="Tell us about yourself" />
  </TkxFormField>

  <TkxButton type="submit">Save</TkxButton>
</TkxForm>`}
      >
        <TkxForm
          layout="horizontal"
          initialValues={{ username: '', bio: '' }}
          onSubmit={(values) => setBasicResult(JSON.stringify(values, null, 2))}
        >
          <TkxFormField
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Username is required' }]}
            required
          >
            <TkxInput placeholder="Enter username" />
          </TkxFormField>

          <TkxFormField name="bio" label="Bio" help="A short description about yourself">
            <TkxInput placeholder="Tell us about yourself" />
          </TkxFormField>

          <div style={{ marginTop: 16 }}>
            <TkxButton type="submit">Save</TkxButton>
          </div>
        </TkxForm>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Inline Layout ──────────────────────────────────────────────── */}

      <DemoSection
        title="Inline Layout"
        description="All fields render in a single row. Useful for search bars or compact filter controls."
        theme={theme}
        code={`<TkxForm layout="inline" onSubmit={handleSearch}>
  <TkxFormField name="query">
    <TkxInput placeholder="Search..." />
  </TkxFormField>

  <TkxFormField name="category">
    <TkxInput placeholder="Category" />
  </TkxFormField>

  <TkxButton type="submit">Search</TkxButton>
</TkxForm>`}
      >
        <TkxForm
          layout="inline"
          initialValues={{ query: '', category: '' }}
          onSubmit={(values) => setBasicResult(JSON.stringify(values, null, 2))}
        >
          <TkxFormField name="query">
            <TkxInput placeholder="Search..." />
          </TkxFormField>

          <TkxFormField name="category">
            <TkxInput placeholder="Category" />
          </TkxFormField>

          <TkxButton type="submit">Search</TkxButton>
        </TkxForm>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Custom Async Validator ──────────────────────────────────────── */}

      <DemoSection
        title="Custom Validator"
        description="Use a custom validator function for complex validation logic. Supports both sync and async validators."
        theme={theme}
        code={`<TkxForm onSubmit={handleSubmit}>
  <TkxFormField
    name="code"
    label="Invite Code"
    rules={[
      { required: true, message: 'Code is required' },
      {
        validator: (value) => {
          if (value && value.length !== 6)
            return 'Code must be exactly 6 characters';
          if (value && !/^[A-Z0-9]+$/.test(value))
            return 'Only uppercase letters and digits';
          return null;
        },
      },
    ]}
    required
  >
    <TkxInput placeholder="ABC123" />
  </TkxFormField>

  <TkxButton type="submit">Verify</TkxButton>
</TkxForm>`}
      >
        <TkxForm
          initialValues={{ code: '' }}
          onSubmit={(values) => setBasicResult(JSON.stringify(values, null, 2))}
        >
          <TkxFormField
            name="code"
            label="Invite Code"
            rules={[
              { required: true, message: 'Code is required' },
              {
                validator: (value: string) => {
                  if (value && value.length !== 6)
                    return 'Code must be exactly 6 characters';
                  if (value && !/^[A-Z0-9]+$/.test(value))
                    return 'Only uppercase letters and digits';
                  return null;
                },
              },
            ]}
            required
          >
            <TkxInput placeholder="ABC123" />
          </TkxFormField>

          <div style={{ marginTop: 16 }}>
            <TkxButton type="submit">Verify</TkxButton>
          </div>
        </TkxForm>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Programmatic Access with useTkxForm ────────────────────────── */}

      <DemoSection
        title="Programmatic Access (useTkxForm)"
        description="Use the useTkxForm hook to get a FormInstance for reading, setting, validating, and resetting fields programmatically."
        theme={theme}
        code={`function MyForm() {
  const form = useTkxForm();

  return (
    <TkxForm
      initialValues={{ firstName: '', lastName: '' }}
      onSubmit={(vals) => console.log(vals)}
    >
      <TkxFormField name="firstName" label="First Name" required
        rules={[{ required: true, message: 'Required' }]}>
        <TkxInput placeholder="First" />
      </TkxFormField>

      <TkxFormField name="lastName" label="Last Name">
        <TkxInput placeholder="Last" />
      </TkxFormField>

      <TkxButton onClick={() => {
        const vals = form.getFieldsValue();
        console.log('Current values:', vals);
      }}>
        Read Values
      </TkxButton>

      <TkxButton onClick={() => {
        form.setFieldsValue({ firstName: 'John', lastName: 'Doe' });
      }}>
        Set Values
      </TkxButton>

      <TkxButton onClick={() => form.resetFields()}>
        Reset
      </TkxButton>

      <TkxButton type="submit">Submit</TkxButton>
    </TkxForm>
  );
}`}
      >
        <ProgrammaticFormDemo
          theme={theme}
          log={programmaticLog}
          onLog={(msg) => setProgrammaticLog((prev) => [...prev, msg])}
          onClear={() => setProgrammaticLog([])}
        />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Disabled Form ──────────────────────────────────────────────── */}

      <DemoSection
        title="Disabled Form"
        description="Set disabled on the form to disable all child fields at once."
        theme={theme}
        code={`<TkxForm disabled initialValues={{ email: 'locked@example.com' }}>
  <TkxFormField name="email" label="Email">
    <TkxInput />
  </TkxFormField>

  <TkxButton type="submit" disabled>Submit</TkxButton>
</TkxForm>`}
      >
        <TkxForm disabled initialValues={{ email: 'locked@example.com' }}>
          <TkxFormField name="email" label="Email">
            <TkxInput />
          </TkxFormField>

          <div style={{ marginTop: 16 }}>
            <TkxButton type="submit" disabled>Submit</TkxButton>
          </div>
        </TkxForm>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props tables ───────────────────────────────────────────────── */}

      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxForm Props
        </h3>
        <PropTable props={FORM_PROPS} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxFormField Props
        </h3>
        <PropTable props={FORM_FIELD_PROPS} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          ValidationRule Props
        </h3>
        <PropTable props={VALIDATION_RULE_PROPS} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          FormInstance Methods (useTkxForm)
        </h3>
        <PropTable props={FORM_INSTANCE_PROPS} />
      </div>
    </div>
  );
}

// ── Programmatic form sub-component ──────────────────────────────────────────

function ProgrammaticFormInner({
  onLog,
}: {
  onLog: (msg: string) => void;
}) {
  const form = useTkxForm();

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
      <TkxButton
        variant="outline"
        onClick={() => {
          const vals = form.getFieldsValue();
          onLog(`getFieldsValue: ${JSON.stringify(vals)}`);
        }}
      >
        Read Values
      </TkxButton>
      <TkxButton
        variant="outline"
        onClick={() => {
          form.setFieldsValue({ firstName: 'John', lastName: 'Doe' });
          onLog('setFieldsValue({ firstName: "John", lastName: "Doe" })');
        }}
      >
        Set Values
      </TkxButton>
      <TkxButton
        variant="outline"
        onClick={() => {
          form.resetFields();
          onLog('resetFields()');
        }}
      >
        Reset
      </TkxButton>
      <TkxButton
        variant="outline"
        onClick={async () => {
          try {
            const vals = await form.validateFields();
            onLog(`validateFields passed: ${JSON.stringify(vals)}`);
          } catch {
            onLog('validateFields failed — check field errors');
          }
        }}
      >
        Validate
      </TkxButton>
      <TkxButton type="submit">Submit</TkxButton>
    </div>
  );
}

function ProgrammaticFormDemo({
  theme,
  log,
  onLog,
  onClear,
}: {
  theme: ThemeTokens;
  log: string[];
  onLog: (msg: string) => void;
  onClear: () => void;
}) {
  const logBoxStyle = {
    marginTop: 12,
    padding: '12px 16px',
    borderRadius: 8,
    backgroundColor: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    fontSize: 13,
    color: theme.textMuted,
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap' as const,
    maxHeight: 160,
    overflow: 'auto' as const,
  };

  return (
    <div>
      <TkxForm
        initialValues={{ firstName: '', lastName: '' }}
        onSubmit={(vals) => onLog(`Submitted: ${JSON.stringify(vals)}`)}
      >
        <TkxFormField
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: 'First name is required' }]}
          required
        >
          <TkxInput label="First Name" placeholder="First" />
        </TkxFormField>

        <TkxFormField name="lastName" label="Last Name">
          <TkxInput label="Last Name" placeholder="Last" />
        </TkxFormField>

        <ProgrammaticFormInner onLog={onLog} />
      </TkxForm>

      {log.length > 0 && (
        <div style={logBoxStyle}>
          {log.map((entry, i) => (
            <div key={i}>{entry}</div>
          ))}
          <div style={{ marginTop: 8 }}>
            <TkxButton size="sm" variant="ghost" onClick={onClear}>
              Clear log
            </TkxButton>
          </div>
        </div>
      )}
    </div>
  );
}
