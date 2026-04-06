import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxButton, TkxCard, TkxCardHeader, TkxCardBody, TkxCardFooter,
  TkxBadge, TkxInput, TkxAccordion, TkxAvatar, TkxDivider, TkxAlert, TkxRating
} from '@tekivex/ui';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { DemoSection } from '../layout/DemoSection';

// ── Data ────────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '\u26A1', title: 'Lightning Fast', desc: 'Optimized builds with tree-shaking and code-splitting. Sub-second load times out of the box.' },
  { icon: '\uD83C\uDFA8', title: 'Themeable', desc: 'Full design-token system with light/dark modes. Customize every color, radius, and shadow.' },
  { icon: '\uD83D\uDCF1', title: 'Responsive', desc: 'Mobile-first layouts with built-in breakpoint hooks. Every component adapts seamlessly.' },
  { icon: '\u267F', title: 'Accessible', desc: 'WCAG 2.1 AA compliant. Full keyboard navigation, ARIA labels, and screen reader support.' },
  { icon: '\uD83D\uDD12', title: 'Type-Safe', desc: 'Written in TypeScript with strict types. IntelliSense and compile-time safety everywhere.' },
  { icon: '\uD83E\uDDE9', title: 'Composable', desc: 'Compound components that snap together. Build complex UIs from simple, reusable primitives.' },
];

const PRICING = [
  {
    name: 'Starter',
    price: 0,
    period: 'forever',
    features: ['Up to 3 projects', 'Core components', 'Community support', 'MIT license'],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    period: '/month',
    features: ['Unlimited projects', 'All 60+ components', 'Priority support', 'Figma design kit', 'Advanced templates'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    period: '/month',
    features: ['Everything in Pro', 'Custom theming service', 'Dedicated Slack channel', 'SLA guarantee', 'SSO & audit logs'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Lead Engineer, Flowstack', avatar: 'SC', rating: 5, quote: 'TekiVex cut our development time in half. The components are polished, accessible, and incredibly easy to customize.' },
  { name: 'Marcus Rivera', role: 'CTO, LaunchPad', avatar: 'MR', rating: 5, quote: 'We evaluated a dozen UI libraries. TekiVex was the only one that matched our design standards without fighting the framework.' },
  { name: 'Aisha Patel', role: 'Frontend Lead, NovaByte', avatar: 'AP', rating: 4, quote: 'The theming system is phenomenal. We shipped dark mode in an afternoon instead of a sprint. Highly recommend for any React team.' },
];

const FAQ_ITEMS = [
  { id: 'faq-1', title: 'Is TekiVex UI free to use?', content: 'Yes! The Starter tier is completely free and open-source under the MIT license. You can use it in personal and commercial projects without any restrictions.' },
  { id: 'faq-2', title: 'Does it work with Next.js and Vite?', content: 'Absolutely. TekiVex UI works with any React framework including Next.js (App Router & Pages), Vite, Remix, and Create React App. Server components are fully supported.' },
  { id: 'faq-3', title: 'How do I customize the theme?', content: 'Wrap your app with the ThemeProvider and pass your own design tokens. Every color, spacing value, radius, and shadow can be overridden. We also provide a visual theme editor in the Pro tier.' },
  { id: 'faq-4', title: 'Is it accessible?', content: 'All components meet WCAG 2.1 AA standards. They include proper ARIA attributes, keyboard navigation, focus management, and screen reader announcements. We run automated and manual accessibility audits on every release.' },
  { id: 'faq-5', title: 'Can I use individual components without installing everything?', content: 'Yes. TekiVex UI supports tree-shaking out of the box. Only the components you import are included in your bundle. Average component size is under 3KB gzipped.' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────────

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────────────────────────

export function LandingPageTemplate({ theme }: { theme: ThemeTokens }) {
  const bp = useBreakpoint();
  const [email, setEmail] = useState('');

  // ── Shared styles ──────────────────────────────────────────────────────────

  const sectionPadding: CSSProperties = {
    padding: bp.isMobile ? '48px 16px' : bp.isTablet ? '64px 32px' : '80px 48px',
    maxWidth: 1200,
    margin: '0 auto',
  };

  const sectionTitle: CSSProperties = {
    fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
    fontWeight: 800,
    color: theme.text,
    textAlign: 'center',
    margin: '0 0 8px',
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  };

  const sectionSubtitle: CSSProperties = {
    fontSize: '15px',
    color: theme.textMuted,
    textAlign: 'center',
    maxWidth: 560,
    margin: '0 auto 40px',
    lineHeight: 1.7,
  };

  // ── Hero ──────────────────────────────────────────────────────────────────

  const heroSection = (
    <div
      style={{
        background: `linear-gradient(135deg, ${theme.primary}14 0%, ${theme.surface} 50%, ${theme.secondary}14 100%)`,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div
        style={{
          ...sectionPadding,
          padding: bp.isMobile ? '56px 16px' : bp.isTablet ? '72px 32px' : '96px 48px',
          textAlign: bp.isMobile ? 'center' : 'left',
          display: 'flex',
          flexDirection: 'column',
          alignItems: bp.isMobile ? 'center' : 'flex-start',
        }}
      >
        <TkxBadge variant="info" style={{ marginBottom: 16 }}>
          v2.0 just shipped
        </TkxBadge>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            color: theme.text,
            margin: '0 0 16px',
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            maxWidth: 680,
          }}
        >
          Build stunning interfaces{' '}
          <span style={{ color: theme.primary }}>in record time</span>
        </h1>

        <p
          style={{
            fontSize: bp.isMobile ? '16px' : '18px',
            color: theme.textMuted,
            lineHeight: 1.7,
            maxWidth: 540,
            margin: '0 0 32px',
          }}
        >
          A production-ready React component library with 60+ accessible, themeable
          components. Ship faster without sacrificing quality.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: bp.isMobile ? 'center' : 'flex-start',
            marginBottom: 40,
          }}
        >
          <TkxButton variant="primary" size="lg">Get Started</TkxButton>
          <TkxButton variant="outline" size="lg">View Components</TkxButton>
        </div>

        <div
          style={{
            display: 'flex',
            gap: bp.isMobile ? 16 : 24,
            flexWrap: 'wrap',
            justifyContent: bp.isMobile ? 'center' : 'flex-start',
            alignItems: 'center',
          }}
        >
          {['MIT Licensed', '60+ Components', 'TypeScript', 'WCAG AA'].map((badge) => (
            <span
              key={badge}
              style={{
                fontSize: '13px',
                color: theme.textMuted,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckIcon color={theme.success} />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Features Grid ─────────────────────────────────────────────────────────

  const featuresSection = (
    <div style={{ backgroundColor: theme.bg }}>
      <div style={sectionPadding}>
        <h2 style={sectionTitle}>Everything you need to build</h2>
        <p style={sectionSubtitle}>
          From buttons to data tables, every component is designed for real-world
          applications with accessibility and performance in mind.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: bp.isMobile ? '1fr' : bp.isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: bp.isMobile ? 16 : 20,
          }}
        >
          {FEATURES.map((f) => (
            <TkxCard key={f.title}>
              <TkxCardBody>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: `${theme.primary}14`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    marginBottom: 14,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.text, margin: '0 0 6px' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '14px', color: theme.textMuted, margin: 0, lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </TkxCardBody>
            </TkxCard>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Pricing ───────────────────────────────────────────────────────────────

  const orderedPricing = bp.isMobile
    ? [...PRICING].sort((a, b) => (a.popular ? -1 : b.popular ? 1 : 0))
    : PRICING;

  const pricingSection = (
    <div
      style={{
        background: `linear-gradient(180deg, ${theme.surfaceAlt} 0%, ${theme.bg} 100%)`,
      }}
    >
      <div style={sectionPadding}>
        <h2 style={sectionTitle}>Simple, transparent pricing</h2>
        <p style={sectionSubtitle}>
          Start free and scale as you grow. No hidden fees, no surprises.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: bp.isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: bp.isMobile ? 20 : 24,
            alignItems: 'start',
          }}
        >
          {orderedPricing.map((plan) => (
            <TkxCard
              key={plan.name}
              style={{
                border: plan.popular ? `2px solid ${theme.primary}` : undefined,
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                  <TkxBadge variant="primary">Popular</TkxBadge>
                </div>
              )}
              <TkxCardHeader>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: theme.text, margin: 0 }}>
                  {plan.name}
                </h3>
              </TkxCardHeader>
              <TkxCardBody>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: '40px', fontWeight: 800, color: theme.text, letterSpacing: '-0.04em' }}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ fontSize: '14px', color: theme.textMuted }}>{plan.period}</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
                  {plan.features.map((feat) => (
                    <span
                      key={feat}
                      style={{
                        fontSize: '14px',
                        color: theme.text,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <CheckIcon color={theme.success} />
                      {feat}
                    </span>
                  ))}
                </div>
              </TkxCardBody>
              <TkxCardFooter>
                <TkxButton
                  variant={plan.popular ? 'primary' : 'outline'}
                  style={{ width: '100%' }}
                >
                  {plan.cta}
                </TkxButton>
              </TkxCardFooter>
            </TkxCard>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Testimonials ──────────────────────────────────────────────────────────

  const testimonialsSection = (
    <div style={{ backgroundColor: theme.bg }}>
      <div style={sectionPadding}>
        <h2 style={sectionTitle}>Loved by developers</h2>
        <p style={sectionSubtitle}>
          Teams of all sizes trust TekiVex UI to build their products.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: bp.isMobile ? '1fr' : bp.isTablet ? '1fr' : 'repeat(3, 1fr)',
            gap: bp.isMobile ? 16 : 20,
          }}
        >
          {TESTIMONIALS.map((t) => (
            <TkxCard key={t.name}>
              <TkxCardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <TkxAvatar name={t.name} size="md" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: theme.textMuted }}>{t.role}</div>
                  </div>
                </div>
                <TkxRating value={t.rating} readOnly label={`${t.name}'s rating`} />
                <p
                  style={{
                    fontSize: '14px',
                    color: theme.text,
                    lineHeight: 1.7,
                    margin: '12px 0 0',
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
              </TkxCardBody>
            </TkxCard>
          ))}
        </div>
      </div>
    </div>
  );

  // ── FAQ ────────────────────────────────────────────────────────────────────

  const faqSection = (
    <div style={{ backgroundColor: theme.surfaceAlt }}>
      <div style={{ ...sectionPadding, maxWidth: 720 }}>
        <h2 style={sectionTitle}>Frequently asked questions</h2>
        <p style={{ ...sectionSubtitle, marginBottom: 32 }}>
          Got questions? We have answers.
        </p>

        <TkxAccordion
          items={FAQ_ITEMS}
          variant="separated"
        />
      </div>
    </div>
  );

  // ── CTA Footer ────────────────────────────────────────────────────────────

  const ctaFooter = (
    <div
      style={{
        background: `linear-gradient(135deg, ${theme.primary}18 0%, ${theme.secondary}18 100%)`,
        borderTop: `1px solid ${theme.border}`,
      }}
    >
      <div
        style={{
          ...sectionPadding,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: theme.text,
            margin: '0 0 12px',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
          }}
        >
          Ready to build something amazing?
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: theme.textMuted,
            maxWidth: 460,
            margin: '0 auto 28px',
            lineHeight: 1.7,
          }}
        >
          Join thousands of developers shipping better products with TekiVex UI.
          Get updates and early access to new components.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexDirection: bp.isMobile ? 'column' : 'row',
            width: bp.isMobile ? '100%' : 'auto',
            maxWidth: 440,
          }}
        >
          <TkxInput
            label="Email"
            hideLabel
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 1 }}
          />
          <TkxButton variant="primary" size="lg">
            Subscribe
          </TkxButton>
        </div>
      </div>
    </div>
  );

  // ── Build Your Own ────────────────────────────────────────────────────────

  const buildYourOwn = (
    <div style={{ backgroundColor: theme.bg }}>
      <div style={sectionPadding}>
        <h2 style={sectionTitle}>Build your own</h2>
        <p style={sectionSubtitle}>
          Copy these patterns to create your own landing page sections with TekiVex UI components.
        </p>

        {/* Hero Section example */}
        <DemoSection
          title="Hero Section"
          description="Build a compelling hero with heading, subtext, and CTA buttons."
          code={`<div style={{ textAlign: 'center', padding: '60px 20px' }}>
  <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800 }}>
    Build faster, ship sooner
  </h1>
  <p style={{ color: '#6b7280', fontSize: 18, maxWidth: 500, margin: '12px auto 32px' }}>
    A compelling subtitle that explains your value proposition in one sentence.
  </p>
  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
    <TkxButton variant="primary" size="lg">Get Started</TkxButton>
    <TkxButton variant="outline" size="lg">Learn More</TkxButton>
  </div>
</div>`}
          theme={theme}
        >
          <div style={{ textAlign: 'center', padding: '32px 12px', width: '100%' }}>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: 800,
                color: theme.text,
                margin: '0 0 8px',
                letterSpacing: '-0.03em',
              }}
            >
              Build faster, ship sooner
            </h1>
            <p
              style={{
                color: theme.textMuted,
                fontSize: '15px',
                maxWidth: 420,
                margin: '0 auto 24px',
                lineHeight: 1.6,
              }}
            >
              A compelling subtitle that explains your value proposition in one sentence.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <TkxButton variant="primary" size="lg">Get Started</TkxButton>
              <TkxButton variant="outline" size="lg">Learn More</TkxButton>
            </div>
          </div>
        </DemoSection>

        {/* Pricing Card example */}
        <DemoSection
          title="Pricing Card"
          description="A single pricing tier card with feature list and CTA."
          code={`<TkxCard style={{ maxWidth: 340 }}>
  <TkxCardHeader>
    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Pro Plan</h3>
  </TkxCardHeader>
  <TkxCardBody>
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 40, fontWeight: 800 }}>$29</span>
      <span style={{ fontSize: 14, color: '#6b7280' }}>/month</span>
    </div>
    {['Unlimited projects', 'All 60+ components', 'Priority support'].map(f => (
      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14 }}>
        <span style={{ color: 'green' }}>\\u2713</span> {f}
      </div>
    ))}
  </TkxCardBody>
  <TkxCardFooter>
    <TkxButton variant="primary" style={{ width: '100%' }}>Start Free Trial</TkxButton>
  </TkxCardFooter>
</TkxCard>`}
          theme={theme}
        >
          <TkxCard style={{ maxWidth: 340, width: '100%' }}>
            <TkxCardHeader>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: theme.text, margin: 0 }}>Pro Plan</h3>
            </TkxCardHeader>
            <TkxCardBody>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: '40px', fontWeight: 800, color: theme.text, letterSpacing: '-0.04em' }}>$29</span>
                <span style={{ fontSize: '14px', color: theme.textMuted }}>/month</span>
              </div>
              {['Unlimited projects', 'All 60+ components', 'Priority support'].map((f) => (
                <div
                  key={f}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                    fontSize: '14px',
                    color: theme.text,
                  }}
                >
                  <CheckIcon color={theme.success} />
                  {f}
                </div>
              ))}
            </TkxCardBody>
            <TkxCardFooter>
              <TkxButton variant="primary" style={{ width: '100%' }}>Start Free Trial</TkxButton>
            </TkxCardFooter>
          </TkxCard>
        </DemoSection>

        {/* FAQ Accordion example */}
        <DemoSection
          title="FAQ Accordion"
          description="Expandable FAQ section using TkxAccordion with an items array."
          code={`const faqItems = [
  { id: 'q1', title: 'Is it free to use?', content: 'Yes! The Starter tier is free and open-source under the MIT license.' },
  { id: 'q2', title: 'Does it support Next.js?', content: 'Absolutely. Works with Next.js App Router, Pages, Vite, Remix, and CRA.' },
  { id: 'q3', title: 'How do I customize the theme?', content: 'Use ThemeProvider with your own design tokens to override any value.' },
];

<TkxAccordion items={faqItems} variant="separated" />`}
          theme={theme}
        >
          <div style={{ width: '100%' }}>
            <TkxAccordion
              items={[
                { id: 'demo-q1', title: 'Is it free to use?', content: 'Yes! The Starter tier is free and open-source under the MIT license.' },
                { id: 'demo-q2', title: 'Does it support Next.js?', content: 'Absolutely. Works with Next.js App Router, Pages, Vite, Remix, and CRA.' },
                { id: 'demo-q3', title: 'How do I customize the theme?', content: 'Use ThemeProvider with your own design tokens to override any value.' },
              ]}
              variant="separated"
            />
          </div>
        </DemoSection>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh' }}>
      {heroSection}
      {featuresSection}
      <TkxDivider />
      {pricingSection}
      {testimonialsSection}
      <TkxDivider />
      {faqSection}
      {ctaFooter}
      <TkxDivider />
      {buildYourOwn}
    </div>
  );
}
