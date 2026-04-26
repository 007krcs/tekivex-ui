import { useState, useEffect, type CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxButton, TkxProgress, TkxBadge } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

// ── Animated Loading Sequence Demo ────────────────────────────────────────────

function AnimatedLoadingDemo({ theme }: { theme: ThemeTokens }) {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (value >= 100) { setRunning(false); return; }
    const id = setInterval(() => {
      setValue((v) => {
        const next = v + Math.floor(Math.random() * 8) + 3;
        return next >= 100 ? 100 : next;
      });
    }, 180);
    return () => clearInterval(id);
  }, [running, value]);

  const reset = () => { setValue(0); setRunning(false); };
  const start = () => { if (value >= 100) { setValue(0); }  setRunning(true); };

  const statusText = value === 0
    ? 'Not started'
    : value < 100
    ? `Loading… ${value}%`
    : 'Complete!';

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: theme.text }}>{statusText}</span>
        {value === 100 && (
          <TkxBadge variant="success" size="sm">Done</TkxBadge>
        )}
      </div>
      <TkxProgress
        value={running || value > 0 ? value : undefined}
        variant="linear"
        size="md"
        label="Loading assets"
        showValue
        style={{ marginBottom: 16 }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <TkxButton size="sm" colorScheme="primary" onClick={start} disabled={running}>
          {value >= 100 ? 'Restart' : running ? 'Running…' : 'Start'}
        </TkxButton>
        <TkxButton size="sm" variant="outline" colorScheme="secondary" onClick={reset} disabled={running && value < 100}>
          Reset
        </TkxButton>
      </div>
    </div>
  );
}

// ── File Upload Progress Demo ─────────────────────────────────────────────────

function FileUploadDemo({ theme }: { theme: ThemeTokens }) {
  const files = [
    { name: 'design-assets.zip', size: '14.2 MB', progress: 72, color: undefined },
    { name: 'project-report.pdf', size: '3.8 MB', progress: 100, color: undefined },
    { name: 'hero-video.mp4', size: '204 MB', progress: 31, color: undefined },
  ] as const;

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = files.filter((f) => !dismissed.has(f.name));

  const containerStyle: CSSProperties = {
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  const rowStyle: CSSProperties = {
    padding: '12px 14px',
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    backgroundColor: theme.surfaceAlt,
  };

  const fileIconStyle: CSSProperties = {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: `${theme.primary}18`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <div style={containerStyle}>
      {visible.length === 0 && (
        <div style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', padding: '12px 0' }}>
          All uploads complete.{' '}
          <button
            style={{ background: 'none', border: 'none', color: theme.primary, cursor: 'pointer', fontSize: 14, padding: 0 }}
            onClick={() => setDismissed(new Set())}
          >
            Reset demo
          </button>
        </div>
      )}
      {visible.map((file) => (
        <div key={file.name} style={rowStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <div style={fileIconStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth={2} aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                  {file.name}
                </span>
                {file.progress === 100 ? (
                  <TkxBadge variant="success" size="sm">Done</TkxBadge>
                ) : (
                  <button
                    aria-label={`Cancel upload for ${file.name}`}
                    onClick={() => setDismissed((s) => new Set([...s, file.name]))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, padding: 2, display: 'flex', alignItems: 'center' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              <span style={{ fontSize: 11, color: theme.textMuted }}>{file.size}</span>
            </div>
          </div>
          <TkxProgress
            value={file.progress}
            variant="linear"
            size="sm"
            label={`Uploading ${file.name}`}
            color={file.progress === 100 ? theme.success : undefined}
          />
        </div>
      ))}
    </div>
  );
}

// ── Multi-step Progress Demo ──────────────────────────────────────────────────

function MultiStepDemo({ theme }: { theme: ThemeTokens }) {
  const steps = ['Account Details', 'Payment Info', 'Confirmation'] as const;
  const [step, setStep] = useState(0);
  const pct = Math.round(((step) / (steps.length - 1)) * 100);

  const containerStyle: CSSProperties = {
    width: '100%',
    maxWidth: 480,
  };

  const stepRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 6,
  };

  return (
    <div style={containerStyle}>
      <div style={stepRowStyle}>
        {steps.map((s, i) => (
          <span
            key={s}
            style={{
              fontSize: 12,
              fontWeight: i === step ? 700 : 400,
              color: i <= step ? theme.primary : theme.textMuted,
              transition: 'color 200ms',
            }}
          >
            {s}
          </span>
        ))}
      </div>
      <TkxProgress
        value={pct}
        variant="linear"
        size="md"
        label={`Step ${step + 1} of ${steps.length}: ${steps[step]}`}
        style={{ marginBottom: 16 }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <TkxButton
          size="sm"
          variant="outline"
          colorScheme="secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </TkxButton>
        <TkxButton
          size="sm"
          colorScheme="primary"
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
        >
          {step === steps.length - 2 ? 'Confirm' : 'Next'}
        </TkxButton>
        {step === steps.length - 1 && (
          <TkxBadge variant="success" size="md" style={{ alignSelf: 'center' }}>Complete!</TkxBadge>
        )}
      </div>
    </div>
  );
}

// ── ProgressPage ──────────────────────────────────────────────────────────────

export function ProgressPage({ theme }: Props) {
  const pageStyle: CSSProperties = {
    maxWidth: 860,
    margin: '0 auto',
    padding: '48px 32px 80px',
  };

  const heroTagStyle: CSSProperties = {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 9999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    backgroundColor: `${theme.primary}18`,
    color: theme.primary,
    border: `1px solid ${theme.primary}35`,
    marginBottom: 24,
  };

  const h1Style: CSSProperties = {
    fontSize: '2rem',
    fontWeight: 800,
    color: theme.text,
    margin: '0 0 12px',
    letterSpacing: '-0.03em',
  };

  const leadStyle: CSSProperties = {
    fontSize: 15,
    color: theme.textMuted,
    lineHeight: 1.7,
    maxWidth: 620,
    margin: '0 0 20px',
  };

  const dividerStyle: CSSProperties = {
    border: 'none',
    borderTop: `1px solid ${theme.border}`,
    margin: '40px 0',
  };

  const sectionHeadStyle: CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: theme.text,
    margin: '0 0 16px',
    letterSpacing: '-0.02em',
  };

  const wcagNoteStyle: CSSProperties = {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 1.7,
    padding: '16px 18px',
    backgroundColor: `${theme.info}10`,
    border: `1px solid ${theme.info}30`,
    borderRadius: 10,
  };

  const wcagCodeStyle: CSSProperties = {
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: 12,
    backgroundColor: `${theme.info}18`,
    color: theme.info,
    padding: '1px 5px',
    borderRadius: 4,
  };

  return (
    <div style={pageStyle}>
      {/* ── Hero ── */}
      <span style={heroTagStyle}>Component Docs</span>
      <h1 style={h1Style}>TkxProgress</h1>
      <p style={leadStyle}>
        A versatile progress indicator supporting <strong>linear</strong> and{' '}
        <strong>circular</strong> variants, determinate and indeterminate states, and three sizes.
        Fully WAI-ARIA compliant with <code style={{ ...wcagCodeStyle, fontSize: 13 }}>role="progressbar"</code>,{' '}
        <code style={{ ...wcagCodeStyle, fontSize: 13 }}>aria-valuenow</code>, and reduced-motion support.
      </p>
      <WCAGBadgeGroup
        label="WCAG 2.1 Compliance"
        badges={[
          { criterion: '1.4.3 Contrast', level: 'AA', status: 'PASS' },
          { criterion: '4.1.2 Name, Role, Value', level: 'AA', status: 'PASS' },
          { criterion: '2.3.3 Animation', level: 'AAA', status: 'PASS' },
        ]}
      />

      <hr style={dividerStyle} />

      {/* ── Linear Progress ── */}
      <DemoSection
        title="Linear Progress"
        description="Determinate linear progress bar at 60%. Displays a filled track proportional to the value (0–100)."
        theme={theme}
        code={`<TkxProgress value={60} variant="linear" size="md" />`}
      >
        <div style={{ width: '100%', maxWidth: 480 }}>
          <TkxProgress value={60} variant="linear" size="md" />
        </div>
      </DemoSection>

      {/* ── Circular Progress ── */}
      <DemoSection
        title="Circular Progress"
        description="Determinate circular progress indicator at 75%. Ideal for compact spaces and dashboards."
        theme={theme}
        code={`<TkxProgress value={75} variant="circular" size="md" />`}
      >
        <TkxProgress value={75} variant="circular" size="md" />
      </DemoSection>

      {/* ── Indeterminate Linear ── */}
      <DemoSection
        title="Indeterminate Linear"
        description="When value is undefined the bar enters indeterminate mode, animating indefinitely to signal ongoing activity without a known end point."
        theme={theme}
        code={`<TkxProgress variant="linear" size="md" label="Loading" />`}
      >
        <div style={{ width: '100%', maxWidth: 480 }}>
          <TkxProgress variant="linear" size="md" label="Loading" />
        </div>
      </DemoSection>

      {/* ── Indeterminate Circular ── */}
      <DemoSection
        title="Indeterminate Circular"
        description="Circular indeterminate spinner — value omitted, animates with a full SVG arc rotation."
        theme={theme}
        code={`<TkxProgress variant="circular" size="md" label="Loading" />`}
      >
        <TkxProgress variant="circular" size="md" label="Loading" />
      </DemoSection>

      {/* ── Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Three sizes — sm, md (default), lg — available for both linear and circular variants."
        theme={theme}
        code={`{/* Linear sizes */}
<TkxProgress value={50} variant="linear" size="sm" />
<TkxProgress value={50} variant="linear" size="md" />
<TkxProgress value={50} variant="linear" size="lg" />

{/* Circular sizes */}
<TkxProgress value={50} variant="circular" size="sm" />
<TkxProgress value={50} variant="circular" size="md" />
<TkxProgress value={50} variant="circular" size="lg" />`}
      >
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Linear
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: theme.textMuted, width: 24, textAlign: 'right' }}>sm</span>
                <div style={{ flex: 1 }}><TkxProgress value={50} variant="linear" size="sm" /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: theme.textMuted, width: 24, textAlign: 'right' }}>md</span>
                <div style={{ flex: 1 }}><TkxProgress value={50} variant="linear" size="md" /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: theme.textMuted, width: 24, textAlign: 'right' }}>lg</span>
                <div style={{ flex: 1 }}><TkxProgress value={50} variant="linear" size="lg" /></div>
              </div>
            </div>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Circular
            </span>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <TkxProgress value={50} variant="circular" size={s} />
                  <span style={{ fontSize: 11, color: theme.textMuted }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DemoSection>

      {/* ── With Label & Value ── */}
      <DemoSection
        title="With Label & Value"
        description="Pass label to render a visible label above the bar, and showValue to display the percentage. Both are included in the accessible name."
        theme={theme}
        code={`<TkxProgress
  value={42}
  variant="linear"
  size="md"
  label="Uploading files"
  showValue
/>`}
      >
        <div style={{ width: '100%', maxWidth: 480 }}>
          <TkxProgress value={42} variant="linear" size="md" label="Uploading files" showValue />
        </div>
      </DemoSection>

      {/* ── Custom Color ── */}
      <DemoSection
        title="Custom Color"
        description="Override the fill color with the color prop. Accepts any valid CSS color string. Useful for semantic states like warning and danger."
        theme={theme}
        code={`<TkxProgress value={85} variant="linear" size="md" color={theme.success} label="Health" />
<TkxProgress value={55} variant="linear" size="md" color={theme.warning} label="CPU" />
<TkxProgress value={92} variant="linear" size="md" color={theme.danger} label="Disk usage" />
<TkxProgress value={60} variant="circular" size="md" color={theme.success} />
<TkxProgress value={38} variant="circular" size="md" color={theme.warning} />
<TkxProgress value={88} variant="circular" size="md" color={theme.danger} />`}
      >
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TkxProgress value={85} variant="linear" size="md" color={theme.success} label="Health" showValue />
          <TkxProgress value={55} variant="linear" size="md" color={theme.warning} label="CPU" showValue />
          <TkxProgress value={92} variant="linear" size="md" color={theme.danger} label="Disk usage" showValue />
          <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
            {[
              { color: theme.success, value: 85, lbl: 'Health' },
              { color: theme.warning, value: 55, lbl: 'CPU' },
              { color: theme.danger, value: 92, lbl: 'Disk' },
            ].map(({ color, value, lbl }) => (
              <div key={lbl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <TkxProgress value={value} variant="circular" size="md" color={color} label={lbl} />
                <span style={{ fontSize: 11, color: theme.textMuted }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </DemoSection>

      {/* ── Animated Loading Sequence ── */}
      <DemoSection
        title="Animated Loading Sequence"
        description="Interactive demo cycling from 0 to 100 with a randomised interval. Demonstrates smooth fill transitions and the indeterminate-to-determinate handoff."
        theme={theme}
        code={`function AnimatedLoading() {
  const [value, setValue] = useState<number | undefined>(undefined);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setValue((v = 0) => {
        const next = v + Math.floor(Math.random() * 8) + 3;
        return next >= 100 ? 100 : next;
      });
    }, 180);
    return () => clearInterval(id);
  }, [running]);

  return (
    <>
      <TkxProgress value={value} variant="linear" size="md" label="Loading assets" showValue />
      <TkxButton size="sm" onClick={() => setRunning(true)}>Start</TkxButton>
    </>
  );
}`}
      >
        <AnimatedLoadingDemo theme={theme} />
      </DemoSection>

      {/* ── File Upload Progress ── */}
      <DemoSection
        title="File Upload Progress"
        description="Realistic multi-file upload UI. Each file shows its name, size, upload progress, and a cancel action. Completed uploads display a success badge."
        theme={theme}
        code={`const files = [
  { name: 'design-assets.zip', size: '14.2 MB', progress: 72 },
  { name: 'project-report.pdf', size: '3.8 MB', progress: 100 },
  { name: 'hero-video.mp4', size: '204 MB', progress: 31 },
];

{files.map((file) => (
  <div key={file.name}>
    <span>{file.name}</span>
    {file.progress === 100
      ? <TkxBadge variant="success" size="sm">Done</TkxBadge>
      : <button aria-label={\`Cancel \${file.name}\`}>×</button>}
    <TkxProgress
      value={file.progress}
      variant="linear"
      size="sm"
      label={\`Uploading \${file.name}\`}
      color={file.progress === 100 ? theme.success : undefined}
    />
  </div>
))}`}
      >
        <FileUploadDemo theme={theme} />
      </DemoSection>

      {/* ── Multi-step Progress ── */}
      <DemoSection
        title="Multi-step Progress"
        description="Wizard-style stepper using a linear progress bar to visualise completion across named steps. Navigate with Back / Next buttons."
        theme={theme}
        code={`const steps = ['Account Details', 'Payment Info', 'Confirmation'];
const [step, setStep] = useState(0);
const pct = Math.round((step / (steps.length - 1)) * 100);

<div>
  <div>{steps.map((s, i) => <span key={s} style={{ color: i <= step ? theme.primary : theme.textMuted }}>{s}</span>)}</div>
  <TkxProgress value={pct} variant="linear" size="md" label={\`Step \${step + 1}\`} />
  <TkxButton onClick={() => setStep(s => s + 1)}>Next</TkxButton>
</div>`}
      >
        <MultiStepDemo theme={theme} />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Prop Table ── */}
      <section aria-labelledby="props-heading">
        <h2 id="props-heading" style={sectionHeadStyle}>Props</h2>
        <PropTable
          props={[
            { name: 'value', type: 'number', default: 'undefined', description: 'Current progress value (0–100). Omit or pass undefined for indeterminate mode.' },
            { name: 'variant', type: '"linear" | "circular"', default: '"linear"', description: 'Visual presentation of the progress indicator.' },
            { name: 'size', type: '"sm" | "md" | "lg"', default: '"md"', description: 'Controls track height (linear) or SVG diameter (circular).' },
            { name: 'label', type: 'string', description: 'Accessible label and visible text above the bar. Used as aria-label when provided.' },
            { name: 'showValue', type: 'boolean', default: 'false', description: 'Display the numeric percentage next to the label (determinate only).' },
            { name: 'color', type: 'string', description: 'Override the fill/stroke color. Accepts any valid CSS color string.' },
            { name: 'className', type: 'string', description: 'Additional CSS class names forwarded to the root element.' },
            { name: 'style', type: 'CSSProperties', description: 'Inline styles forwarded to the root element.' },
          ]}
        />
      </section>

      <hr style={dividerStyle} />

      {/* ── WCAG Notes ── */}
      <section aria-labelledby="wcag-heading">
        <h2 id="wcag-heading" style={sectionHeadStyle}>Accessibility Notes</h2>
        <div style={wcagNoteStyle}>
          <p style={{ margin: '0 0 10px' }}>
            Every <code style={wcagCodeStyle}>TkxProgress</code> renders with{' '}
            <code style={wcagCodeStyle}>role="progressbar"</code>,{' '}
            <code style={wcagCodeStyle}>aria-valuemin="0"</code>, and{' '}
            <code style={wcagCodeStyle}>aria-valuemax="100"</code>.
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}>
              In <strong>determinate</strong> mode, <code style={wcagCodeStyle}>aria-valuenow</code> is set to
              the clamped value so screen readers announce the exact percentage.
            </li>
            <li style={{ marginBottom: 6 }}>
              In <strong>indeterminate</strong> mode, <code style={wcagCodeStyle}>aria-valuenow</code> is omitted;
              screen readers announce the component as "busy" or "loading".
            </li>
            <li style={{ marginBottom: 6 }}>
              The <code style={wcagCodeStyle}>label</code> prop sets <code style={wcagCodeStyle}>aria-label</code> for
              an accessible description. Without a label the component falls back to the percentage string or "Loading".
            </li>
            <li>
              Animations respect the{' '}
              <code style={wcagCodeStyle}>prefers-reduced-motion</code> media query — all CSS transitions and
              keyframe animations are disabled when the user has requested reduced motion (WCAG 2.3.3 AAA).
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
