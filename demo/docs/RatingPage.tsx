import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxRating,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const RATING_PROPS = [
  { name: 'value', type: 'number', default: '0', description: 'Controlled rating value. Must be between 0 and count.' },
  { name: 'onChange', type: '(value: number) => void', default: 'undefined', description: 'Callback fired when the user selects a rating. Omit to make the rating read-only.' },
  { name: 'count', type: 'number', default: '5', description: 'Total number of star/icon items to display.' },
  { name: 'precision', type: "'full' | 'half'", default: "'full'", description: "Precision of selectable values. 'half' allows half-star ratings (0.5 increments)." },
  { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls the icon size and interactive area.' },
  { name: 'colorScheme', type: "'primary' | 'warning' | 'danger' | 'success' | 'secondary'", default: "'warning'", description: 'Fill color of selected icons.' },
  { name: 'icon', type: "'star' | 'heart' | 'circle' | ReactNode", default: "'star'", description: "Icon shape used for each item. Pass a custom ReactNode for fully custom icons." },
  { name: 'showValue', type: 'boolean', default: 'false', description: 'Shows the numeric value next to the rating (e.g., "4.5 / 5").' },
  { name: 'readOnly', type: 'boolean', default: 'false', description: 'Prevents interaction. The rating is displayed but not interactive.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Visually dims the component and prevents interaction.' },
  { name: 'label', type: 'string', default: 'undefined', description: 'Accessible group label. If omitted, a default like "Rating" is used for screen readers.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles on the root wrapper.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function RatingPage({ theme }: { theme: ThemeTokens }) {
  const [basic, setBasic] = useState(3);
  const [half, setHalf] = useState(3.5);
  const [heart, setHeart] = useState(4);
  const [circle, setCircle] = useState(3);
  const [product, setProduct] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const noteBoxStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    padding: '20px 24px',
    marginBottom: '24px',
  };

  const noteHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 12px',
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
  };

  const LABELS: Record<number, string> = {
    1: 'Terrible',
    2: 'Poor',
    3: 'Average',
    4: 'Good',
    5: 'Excellent',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.4.3 Contrast', level: 'AAA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxRating
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        An accessible star (or custom icon) rating component. Each interactive rating is implemented as a radio
        button group for maximum AT compatibility — arrow keys navigate between values, and screen readers
        announce the rating in full context ("3 stars out of 5").
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> Interactive ratings use{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="radiogroup"</code>{' '}
        with each star as{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="radio"</code>.
        Read-only ratings use{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="img"</code>{' '}
        with a descriptive{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-label</code>.
      </p>

      {/* ── 1. Basic ── */}
      <DemoSection
        title="Basic Rating"
        description="Controlled rating with useState. Click any star to set the value. Hover previews the rating before committing. The selected value is shown alongside."
        theme={theme}
        code={`const [value, setValue] = useState(3);

<TkxRating
  label="Product rating"
  value={value}
  onChange={setValue}
  showValue
/>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <TkxRating
            label="Product rating"
            value={basic}
            onChange={setBasic}
            showValue
          />
          <span style={{ fontSize: '13px', color: theme.textMuted }}>
            {basic > 0 ? LABELS[Math.round(basic)] : 'Not rated'}
          </span>
        </div>
      </DemoSection>

      {/* ── 2. Read-only ── */}
      <DemoSection
        title="Read-Only"
        description="Omit onChange (or set readOnly) for a display-only rating. Screen readers announce it as an image: 'Product satisfaction, 4.2 out of 5 stars'."
        theme={theme}
        code={`// Static display ratings from data
<TkxRating value={4.8} readOnly showValue label="Overall score" />
<TkxRating value={4.2} readOnly showValue label="Design quality" />
<TkxRating value={3.7} readOnly showValue label="Documentation" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Overall Score', value: 4.8 },
            { label: 'Design Quality', value: 4.2 },
            { label: 'Documentation', value: 3.7 },
            { label: 'Performance', value: 4.5 },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: theme.textMuted, minWidth: '140px' }}>{label}</span>
              <TkxRating value={value} readOnly showValue label={label} />
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── 3. Half-star precision ── */}
      <DemoSection
        title="Half-Star Precision"
        description="Set precision='half' to allow 0.5 increments. Users can select half stars by clicking/hovering on the left half of each star icon."
        theme={theme}
        code={`const [value, setValue] = useState(3.5);

<TkxRating
  label="Quality rating"
  value={value}
  onChange={setValue}
  precision="half"
  showValue
/>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <TkxRating
            label="Quality rating"
            value={half}
            onChange={setHalf}
            precision="half"
            showValue
          />
          <span style={{ fontSize: '13px', color: theme.textMuted }}>{half}/5</span>
        </div>
      </DemoSection>

      {/* ── 4. Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Four sizes from compact sm to large xl. All sizes meet WCAG 2.5.5 minimum 44×44 px touch target for the interactive area."
        theme={theme}
        code={`<TkxRating value={4} readOnly size="sm" />
<TkxRating value={4} readOnly size="md" />
<TkxRating value={4} readOnly size="lg" />
<TkxRating value={4} readOnly size="xl" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: theme.textMuted, minWidth: '24px' }}>{s}</span>
              <TkxRating value={4} readOnly size={s} label={`Size ${s} example`} />
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── 5. Color Schemes ── */}
      <DemoSection
        title="Color Schemes"
        description="Five color schemes for the filled icons. The default is 'warning' (gold) which matches the universal star rating convention. Override for brand-specific contexts."
        theme={theme}
        code={`<TkxRating value={4} readOnly colorScheme="warning"   />
<TkxRating value={4} readOnly colorScheme="primary"   />
<TkxRating value={4} readOnly colorScheme="danger"    />
<TkxRating value={4} readOnly colorScheme="success"   />
<TkxRating value={4} readOnly colorScheme="secondary" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(['warning', 'primary', 'danger', 'success', 'secondary'] as const).map((cs) => (
            <div key={cs} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: theme.textMuted, minWidth: '80px' }}>{cs}</span>
              <TkxRating value={4} readOnly colorScheme={cs} label={`${cs} color scheme example`} />
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── 6. Show Value ── */}
      <DemoSection
        title="Show Value"
        description="showValue displays the numeric score next to the icons. The format is 'X / count' and updates live as the user hovers or selects."
        theme={theme}
        code={`<TkxRating value={3.5} readOnly showValue precision="half" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <TkxRating value={4.8} readOnly showValue count={5} label="Overall (showValue)" />
          <TkxRating value={8.2} readOnly showValue count={10} label="Score out of 10" />
          <TkxRating value={3.5} readOnly showValue precision="half" label="Half-star with value" />
        </div>
      </DemoSection>

      {/* ── 7. Custom Icons ── */}
      <DemoSection
        title="Custom Icons"
        description="Pass icon='heart' or icon='circle' for built-in alternatives, or pass a custom ReactNode for fully bespoke icons."
        theme={theme}
        code={`<TkxRating label="Favorites" icon="heart" colorScheme="danger" value={heart} onChange={setHeart} />
<TkxRating label="Difficulty" icon="circle" colorScheme="primary" value={circle} onChange={setCircle} />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: theme.textMuted, minWidth: '80px' }}>Hearts</span>
            <TkxRating
              label="Favorites"
              icon="heart"
              colorScheme="danger"
              value={heart}
              onChange={setHeart}
              showValue
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: theme.textMuted, minWidth: '80px' }}>Circles</span>
            <TkxRating
              label="Difficulty"
              icon="circle"
              colorScheme="primary"
              value={circle}
              onChange={setCircle}
              showValue
            />
          </div>
        </div>
      </DemoSection>

      {/* ── 8. Live review form ── */}
      <DemoSection
        title="Product Review Form"
        description="A realistic interactive review widget. Rate the product and submit to see the result. Demonstrates TkxRating inside a form context."
        theme={theme}
        code={`const [rating, setRating] = useState(0);

<TkxRating
  label="Your rating"
  value={rating}
  onChange={setRating}
  size="lg"
  showValue
/>
<p>{LABELS[rating] || 'Select a rating'}</p>`}
      >
        <div style={{ padding: '24px', borderRadius: '12px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, maxWidth: '360px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center' as const, padding: '16px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌟</div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>
                Thanks for your {product}-star review!
              </p>
              <p style={{ fontSize: '13px', color: theme.textMuted, margin: '0 0 16px' }}>
                {LABELS[product]}
              </p>
              <button
                style={{ fontSize: '13px', color: theme.primary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => { setSubmitted(false); setProduct(0); }}
              >
                Leave another review
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: theme.text }}>
                How would you rate this product?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
                <TkxRating
                  label="Product rating"
                  value={product}
                  onChange={setProduct}
                  size="lg"
                />
                <p style={{ margin: 0, fontSize: '13px', color: product > 0 ? theme.text : theme.textMuted, fontWeight: product > 0 ? 600 : 400 }}>
                  {product > 0 ? LABELS[product] : 'Select a star'}
                </p>
              </div>
              <button
                disabled={product === 0}
                onClick={() => setSubmitted(true)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: product > 0 ? theme.primary : theme.border,
                  color: product > 0 ? '#fff' : theme.textMuted,
                  cursor: product > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Submit Review
              </button>
            </div>
          )}
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={RATING_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.4.3 Contrast (Minimum)" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Radio Group Pattern</p>
        <p style={noteItemStyle}>Interactive ratings use the radio group pattern. Arrow keys navigate between stars, and the selected value is announced as: "3 stars, 3 of 5". This is more discoverable than a custom slider for most users.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Read-Only Display</p>
        <p style={noteItemStyle}>Read-only ratings are a single element with <code>role="img"</code> and <code>aria-label="Product rating: 4.2 out of 5 stars"</code>. They are not focusable and do not appear in the tab order.</p>
      </div>
    </div>
  );
}
