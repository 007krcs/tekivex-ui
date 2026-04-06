import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxStepper } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const STEPPER_PROPS = [
  { name: 'steps', type: 'Step[]', required: true, description: 'Array of step objects. Each step has id, title, optional description, icon, status, optional flag, and error message.' },
  { name: 'activeStep', type: 'number', default: '0', description: 'Zero-based index of the currently active step.' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Lays the stepper out horizontally (row) or vertically (column).' },
  { name: 'variant', type: "'default' | 'outlined' | 'filled'", default: "'default'", description: 'Visual style of the step circles.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the circle diameter, font size, and connector width.' },
  { name: 'clickable', type: 'boolean', default: 'false', description: 'When true, completed and active steps can be clicked to navigate.' },
  { name: 'onStepClick', type: '(index: number) => void', default: 'undefined', description: 'Callback fired when a clickable step is clicked, receives the step index.' },
  { name: 'showStepNumbers', type: 'boolean', default: 'true', description: 'Renders the step number inside the circle for pending/active steps.' },
  { name: 'alternateLabel', type: 'boolean', default: 'false', description: 'Horizontal only — places labels below the connector on alternating sides.' },
  { name: 'connector', type: "'solid' | 'dashed' | 'dotted'", default: "'solid'", description: 'Line style of the connector between steps.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names applied to the root element.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root element.' },
];

const STEP_PROPS = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the step.' },
  { name: 'title', type: 'string', required: true, description: 'Step label rendered beside or below the circle.' },
  { name: 'description', type: 'string', default: 'undefined', description: 'Secondary text rendered beneath the title.' },
  { name: 'icon', type: 'ReactNode', default: 'undefined', description: 'Custom icon rendered inside the step circle instead of the number or status icon.' },
  { name: 'status', type: "'completed' | 'active' | 'error' | 'pending'", default: 'undefined', description: 'Overrides the status derived from activeStep. Useful for manual control.' },
  { name: 'optional', type: 'boolean', default: 'false', description: 'Renders an "Optional" sub-label beneath the title.' },
  { name: 'error', type: 'string', default: 'undefined', description: 'Error message shown below the step when status is "error".' },
];

// ── Shared step data ──────────────────────────────────────────────────────────

const CHECKOUT_STEPS = [
  { id: 'cart',    title: 'Cart',     description: 'Review items' },
  { id: 'address', title: 'Address',  description: 'Shipping info' },
  { id: 'payment', title: 'Payment',  description: 'Card details' },
  { id: 'review',  title: 'Review',   description: 'Confirm order' },
];

const VERTICAL_STEPS = [
  { id: 'account', title: 'Create account',   description: 'Enter your email and password' },
  { id: 'profile', title: 'Set up profile',   description: 'Add your name and avatar' },
  { id: 'plan',    title: 'Choose a plan',    description: 'Select a subscription tier', optional: true },
  { id: 'confirm', title: 'Confirm email',    description: 'Click the link we sent you' },
];

const ERROR_STEPS = [
  { id: 'upload', title: 'Upload file',   status: 'completed' as const },
  { id: 'parse',  title: 'Parse data',   status: 'error' as const, error: 'Invalid CSV format on row 14' },
  { id: 'import', title: 'Import rows',  status: 'pending' as const },
  { id: 'done',   title: 'Done',         status: 'pending' as const },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function StepperPage({ theme }: { theme: ThemeTokens }) {
  const [activeStep, setActiveStep] = useState(1);

  const codeInline = (s: string) => ({
    fontSize: '12px',
    backgroundColor: `${theme.primary}14`,
    color: theme.primary,
    padding: '1px 5px',
    borderRadius: '4px',
  } as React.CSSProperties);

  const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    backgroundColor: disabled ? theme.surfaceAlt : theme.primary,
    color: disabled ? theme.textMuted : '#fff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.15s',
    opacity: disabled ? 0.5 : 1,
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxStepper
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A guided multi-step indicator that communicates progress through a sequence of tasks. Supports
        horizontal and vertical layouts, clickable navigation, error states, and custom connectors.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> Each step exposes{' '}
        <code style={codeInline('')}>role="listitem"</code> within a{' '}
        <code style={codeInline('')}>role="list"</code>. Active and completed states are announced via{' '}
        <code style={codeInline('')}>aria-current</code> and{' '}
        <code style={codeInline('')}>aria-label</code> attributes.
      </p>

      {/* ── 1. Horizontal ── */}
      <DemoSection
        title="Horizontal Stepper"
        description="The default orientation. Steps flow left-to-right with a connector line between circles. Step 2 (Address) is active here with step 1 completed."
        theme={theme}
        code={`<TkxStepper
  steps={[
    { id: 'cart',    title: 'Cart',    description: 'Review items' },
    { id: 'address', title: 'Address', description: 'Shipping info' },
    { id: 'payment', title: 'Payment', description: 'Card details' },
    { id: 'review',  title: 'Review',  description: 'Confirm order' },
  ]}
  activeStep={1}
/>`}
      >
        <TkxStepper
          steps={CHECKOUT_STEPS}
          activeStep={1}
        />
      </DemoSection>

      {/* ── 2. Vertical ── */}
      <DemoSection
        title="Vertical Stepper"
        description="Set orientation to vertical for a top-to-bottom layout. Ideal for sidebars or narrow containers. Descriptions render inline beneath each title."
        theme={theme}
        code={`<TkxStepper
  steps={verticalSteps}
  activeStep={2}
  orientation="vertical"
/>`}
      >
        <div style={{ maxWidth: 340 }}>
          <TkxStepper
            steps={VERTICAL_STEPS}
            activeStep={2}
            orientation="vertical"
          />
        </div>
      </DemoSection>

      {/* ── 3. Error state ── */}
      <DemoSection
        title="Error State"
        description={`Set a step's status to "error" and provide an error message. The circle turns danger-red and the error string is displayed below the step label.`}
        theme={theme}
        code={`<TkxStepper
  steps={[
    { id: 'upload', title: 'Upload file', status: 'completed' },
    { id: 'parse',  title: 'Parse data',  status: 'error',
      error: 'Invalid CSV format on row 14' },
    { id: 'import', title: 'Import rows', status: 'pending' },
    { id: 'done',   title: 'Done',        status: 'pending' },
  ]}
  activeStep={1}
/>`}
      >
        <TkxStepper
          steps={ERROR_STEPS}
          activeStep={1}
        />
      </DemoSection>

      {/* ── 4. Dashed connector ── */}
      <DemoSection
        title="Dashed Connector"
        description={`Use the connector prop to change the line style between steps. Supported values are "solid" (default), "dashed", and "dotted".`}
        theme={theme}
        code={`<TkxStepper
  steps={checkoutSteps}
  activeStep={2}
  connector="dashed"
/>`}
      >
        <TkxStepper
          steps={CHECKOUT_STEPS}
          activeStep={2}
          connector="dashed"
        />
      </DemoSection>

      {/* ── 5. Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Three sizes are available: sm (24 px circle), md (32 px, default), and lg (40 px). Font sizes and connector widths scale accordingly."
        theme={theme}
        code={`<TkxStepper steps={steps} activeStep={1} size="sm" />
<TkxStepper steps={steps} activeStep={1} size="md" />
<TkxStepper steps={steps} activeStep={1} size="lg" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {(['sm', 'md', 'lg'] as const).map(sz => (
            <div key={sz}>
              <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                size="{sz}"
              </p>
              <TkxStepper
                steps={CHECKOUT_STEPS}
                activeStep={1}
                size={sz}
              />
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── 6. Interactive ── */}
      <DemoSection
        title="Interactive Navigation"
        description="Combine activeStep state with prev/next buttons for a fully interactive wizard. The clickable prop also lets users jump directly to any reachable step."
        theme={theme}
        code={`const [activeStep, setActiveStep] = useState(0);

<TkxStepper
  steps={checkoutSteps}
  activeStep={activeStep}
  clickable
  onStepClick={setActiveStep}
/>
<button onClick={() => setActiveStep(s => Math.max(0, s - 1))}>Back</button>
<button onClick={() => setActiveStep(s => Math.min(steps.length - 1, s + 1))}>Next</button>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <TkxStepper
            steps={CHECKOUT_STEPS}
            activeStep={activeStep}
            clickable
            onStepClick={setActiveStep}
          />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              style={navBtnStyle(activeStep === 0)}
              disabled={activeStep === 0}
              onClick={() => setActiveStep(s => Math.max(0, s - 1))}
            >
              Back
            </button>
            <button
              style={navBtnStyle(activeStep === CHECKOUT_STEPS.length - 1)}
              disabled={activeStep === CHECKOUT_STEPS.length - 1}
              onClick={() => setActiveStep(s => Math.min(CHECKOUT_STEPS.length - 1, s + 1))}
            >
              Next
            </button>
            <span style={{ fontSize: '13px', color: theme.textMuted }}>
              Step{' '}
              <strong style={{ color: theme.text }}>{activeStep + 1}</strong>
              {' '}of{' '}
              <strong style={{ color: theme.text }}>{CHECKOUT_STEPS.length}</strong>
              {' — '}{CHECKOUT_STEPS[activeStep].title}
            </span>
          </div>
        </div>
      </DemoSection>

      {/* ── 7. Filled variant ── */}
      <DemoSection
        title="Filled Variant"
        description={`The "filled" variant applies a solid primary background to the active step circle instead of an outline, giving a stronger visual emphasis.`}
        theme={theme}
        code={`<TkxStepper
  steps={checkoutSteps}
  activeStep={1}
  variant="filled"
/>`}
      >
        <TkxStepper
          steps={CHECKOUT_STEPS}
          activeStep={1}
          variant="filled"
        />
      </DemoSection>

      {/* ── Props tables ── */}
      <div style={{ marginTop: '64px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          TkxStepperProps
        </h2>
        <p style={{ fontSize: '14px', color: theme.textMuted, margin: '0 0 24px', lineHeight: '1.6' }}>
          Props accepted by the <code style={codeInline('')}>TkxStepper</code> component.
        </p>
        <PropTable props={STEPPER_PROPS} theme={theme} />
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Step (object shape)
        </h2>
        <p style={{ fontSize: '14px', color: theme.textMuted, margin: '0 0 24px', lineHeight: '1.6' }}>
          Each item in the <code style={codeInline('')}>steps</code> array.
        </p>
        <PropTable props={STEP_PROPS} theme={theme} />
      </div>

    </div>
  );
}
