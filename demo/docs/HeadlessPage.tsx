import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import {
  useDisclosure,
  useDebounce,
  useThrottle,
  useControllable,
  useListSelection,
  useLocalStorage,
  useMediaQuery,
  useFormState,
} from '../../src/headless';

interface Props { theme: ThemeTokens }

// ── Live demos ─────────────────────────────────────────────────────────────────

function DisclosureDemo({ theme }: { theme: ThemeTokens }) {
  const { isOpen, open, close, toggle } = useDisclosure(false);
  const btnBase = {
    padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...btnBase, background: theme.primary, color: '#fff' }} onClick={open}>Open</button>
        <button style={{ ...btnBase, background: theme.surfaceAlt, color: theme.text }} onClick={close}>Close</button>
        <button style={{ ...btnBase, background: theme.surfaceAlt, color: theme.text }} onClick={toggle}>Toggle</button>
      </div>
      <div style={{
        padding: '12px 16px', borderRadius: 8, border: `1px solid ${theme.border}`,
        background: theme.surface, fontSize: 13, color: theme.text,
      }}>
        State: <strong style={{ color: isOpen ? theme.success : theme.danger }}>{isOpen ? 'Open' : 'Closed'}</strong>
      </div>
    </div>
  );
}

function DebounceDemo({ theme }: { theme: ThemeTokens }) {
  const [input, setInput] = useState('');
  const debounced = useDebounce(input, 500);
  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 6,
    border: `1px solid ${theme.border}`, background: theme.surface,
    color: theme.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        style={inputStyle}
        placeholder="Type something..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
        <span style={{ color: theme.textMuted }}>Live: <strong style={{ color: theme.text }}>{input || '—'}</strong></span>
        <span style={{ color: theme.textMuted }}>Debounced (500ms): <strong style={{ color: theme.primary }}>{debounced || '—'}</strong></span>
      </div>
    </div>
  );
}

function ThrottleDemo({ theme }: { theme: ThemeTokens }) {
  const [count, setCount] = useState(0);
  const throttled = useThrottle(count, 1000);
  const btnStyle = {
    padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer',
    background: theme.primary, color: '#fff', fontSize: 13, fontWeight: 600,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button style={btnStyle} onClick={() => setCount((c) => c + 1)}>Click fast! (+1)</button>
      <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
        <span style={{ color: theme.textMuted }}>Raw clicks: <strong style={{ color: theme.text }}>{count}</strong></span>
        <span style={{ color: theme.textMuted }}>Throttled (1s): <strong style={{ color: theme.primary }}>{throttled}</strong></span>
      </div>
    </div>
  );
}

function ControllableDemo({ theme }: { theme: ThemeTokens }) {
  const [external, setExternal] = useState<string | undefined>(undefined);
  const [value, setValue] = useControllable<string>({
    value: external,
    onChange: setExternal,
    defaultValue: 'default',
  });
  const inputStyle = {
    padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}`,
    background: theme.surface, color: theme.text, fontSize: 13, outline: 'none',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <input style={inputStyle} placeholder="Controlled value" value={external ?? ''} onChange={(e) => setExternal(e.target.value)} />
        <button
          style={{ padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: theme.surfaceAlt, color: theme.text, fontSize: 12 }}
          onClick={() => setExternal(undefined)}
        >Reset to uncontrolled</button>
      </div>
      <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>
        Resolved value: <strong style={{ color: theme.primary }}>{value}</strong>
        {external === undefined && <span style={{ color: theme.textMuted }}> (using defaultValue)</span>}
      </p>
    </div>
  );
}

function ListSelectionDemo({ theme }: { theme: ThemeTokens }) {
  const items = ['React', 'TypeScript', 'Vite', 'Vitest', 'Recharts', 'TekiVex UI'];
  const { isSelected, toggle, selectedArray, allSelected, toggleAll } = useListSelection({ items, multiple: true });
  const chipStyle = (selected: boolean) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
    fontSize: 12, fontWeight: 600, userSelect: 'none' as const,
    border: `1px solid ${selected ? theme.primary : theme.border}`,
    background: selected ? `${theme.primary}18` : theme.surface,
    color: selected ? theme.primary : theme.text,
    transition: 'all 0.15s',
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((item) => (
          <span key={item} style={chipStyle(isSelected(item))} onClick={() => toggle(item)} role="checkbox" aria-checked={isSelected(item)}>
            {isSelected(item) ? '✓ ' : ''}{item}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}>
        <button
          style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'none', color: theme.text, cursor: 'pointer', fontSize: 12 }}
          onClick={toggleAll}
        >{allSelected ? 'Deselect all' : 'Select all'}</button>
        <span style={{ color: theme.textMuted }}>Selected: <strong style={{ color: theme.primary }}>{selectedArray.join(', ') || 'none'}</strong></span>
      </div>
    </div>
  );
}

function LocalStorageDemo({ theme }: { theme: ThemeTokens }) {
  const [value, setValue, remove] = useLocalStorage('tkx-demo-name', '');
  const inputStyle = {
    padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}`,
    background: theme.surface, color: theme.text, fontSize: 13, outline: 'none',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={inputStyle} placeholder="Type to persist..." value={value} onChange={(e) => setValue(e.target.value)} />
        <button
          style={{ padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: theme.danger, color: '#fff', fontSize: 12 }}
          onClick={remove}
        >Clear</button>
      </div>
      <p style={{ fontSize: 12, color: theme.textMuted, margin: 0 }}>Stored in <code>localStorage['tkx-demo-name']</code>. Reload the page — value persists.</p>
    </div>
  );
}

function MediaQueryDemo({ theme }: { theme: ThemeTokens }) {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  const isLarge = useMediaQuery('(min-width: 1024px)');
  const chip = (label: string, active: boolean) => ({
    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: active ? `${theme.success}20` : `${theme.danger}20`,
    color: active ? theme.success : theme.danger,
    border: `1px solid ${active ? theme.success : theme.danger}40`,
    marginRight: 8,
  });
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <span style={chip('prefers-color-scheme: dark', isDark)}>dark mode: {isDark ? 'true' : 'false'}</span>
      <span style={chip('min-width: 1024px', isLarge)}>viewport ≥ 1024px: {isLarge ? 'true' : 'false'}</span>
    </div>
  );
}

function FormStateDemo({ theme }: { theme: ThemeTokens }) {
  const { values, errors, touched, isValid, setValue, touchField, validate, reset } = useFormState({
    initialValues: { name: '', email: '', age: '' },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      if (!vals.name) errs.name = 'Name is required';
      if (!vals.email || !vals.email.includes('@')) errs.email = 'Valid email required';
      if (vals.age && Number(vals.age) < 18) errs.age = 'Must be at least 18';
      return errs;
    },
  });

  const inputStyle = {
    padding: '8px 12px', borderRadius: 6, width: '100%',
    border: `1px solid ${theme.border}`, background: theme.surface,
    color: theme.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
  };
  const errStyle = { fontSize: 12, color: theme.danger, marginTop: 3 };
  const field = (key: 'name' | 'email' | 'age', label: string, type = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted }}>{label}</label>
      <input
        style={{ ...inputStyle, borderColor: touched[key] && errors[key] ? theme.danger : theme.border }}
        type={type}
        value={values[key]}
        onChange={(e) => setValue(key, e.target.value)}
        onBlur={() => touchField(key)}
        placeholder={label}
      />
      {touched[key] && errors[key] && <span style={errStyle}>{errors[key]}</span>}
    </div>
  );

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={(e) => { e.preventDefault(); validate(); }}>
      {field('name', 'Name')}
      {field('email', 'Email', 'email')}
      {field('age', 'Age', 'number')}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button type="submit" style={{ padding: '8px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', background: theme.primary, color: '#fff', fontSize: 13, fontWeight: 600 }}>Validate</button>
        <button type="button" onClick={reset} style={{ padding: '8px 18px', borderRadius: 6, border: `1px solid ${theme.border}`, cursor: 'pointer', background: 'none', color: theme.text, fontSize: 13 }}>Reset</button>
        <span style={{ fontSize: 12, color: isValid ? theme.success : theme.danger, alignSelf: 'center' }}>{isValid ? '✓ Valid' : '✗ Invalid'}</span>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function HeadlessPage({ theme }: Props) {
  const sectionStyle = { maxWidth: 900, margin: '0 auto', padding: '40px 32px' };
  const headingStyle = { fontSize: '2rem', fontWeight: 700, color: theme.text, marginBottom: '8px' };
  const subStyle = { fontSize: '1rem', color: theme.textMuted, marginBottom: '40px', lineHeight: '1.6' };

  return (
    <div style={sectionStyle}>
      <h1 style={headingStyle}>Headless Primitives</h1>
      <p style={subStyle}>
        Framework-agnostic React hooks exported from{' '}
        <code style={{ backgroundColor: theme.surfaceAlt, padding: '1px 6px', borderRadius: 4, fontSize: '0.9em' }}>
          @tekivex/ui/headless
        </code>
        . Bring your own UI — no styles imposed. Perfect for building design systems on top of TekiVex.
      </p>

      <DemoSection title="useDisclosure" description="Manages open/closed state for modals, drawers, tooltips, and any toggle." theme={theme}
        code={`const { isOpen, open, close, toggle } = useDisclosure(false);`}>
        <DisclosureDemo theme={theme} />
      </DemoSection>

      <DemoSection title="useDebounce" description="Delays updating a value until the user stops changing it. Ideal for search inputs and API calls." theme={theme}
        code={`const debouncedValue = useDebounce(inputValue, 500);`}>
        <DebounceDemo theme={theme} />
      </DemoSection>

      <DemoSection title="useThrottle" description="Limits how often a value can update. Perfect for scroll handlers, resize events, and rapid clicks." theme={theme}
        code={`const throttledValue = useThrottle(count, 1000);`}>
        <ThrottleDemo theme={theme} />
      </DemoSection>

      <DemoSection title="useControllable" description="Unified controlled/uncontrolled state — same pattern used by Radix UI and Mantine. Automatically falls back to defaultValue when no external value is provided." theme={theme}
        code={`const [value, setValue] = useControllable({ value, onChange, defaultValue: 'default' });`}>
        <ControllableDemo theme={theme} />
      </DemoSection>

      <DemoSection title="useListSelection" description="Multi / single selection state with selectAll, toggleAll, and set-based helpers." theme={theme}
        code={`const { isSelected, toggle, selectedArray, toggleAll } = useListSelection({ items, multiple: true });`}>
        <ListSelectionDemo theme={theme} />
      </DemoSection>

      <DemoSection title="useLocalStorage" description="SSR-safe persistent state backed by localStorage. Survives page reloads." theme={theme}
        code={`const [value, setValue, remove] = useLocalStorage('my-key', defaultValue);`}>
        <LocalStorageDemo theme={theme} />
      </DemoSection>

      <DemoSection title="useMediaQuery" description="Reactive media query matching. Rerenders automatically when the viewport or user preferences change." theme={theme}
        code={`const isDark = useMediaQuery('(prefers-color-scheme: dark)');
const isLarge = useMediaQuery('(min-width: 1024px)');`}>
        <MediaQueryDemo theme={theme} />
      </DemoSection>

      <DemoSection title="useFormState" description="Headless form management with validation, dirty tracking, and field-level error state. No opinions on UI." theme={theme}
        code={`const { values, errors, touched, isValid, setValue, touchField, validate, reset } = useFormState({
  initialValues: { name: '', email: '' },
  validate: (vals) => {
    const errs: Record<string, string> = {};
    if (!vals.name) errs.name = 'Name is required';
    return errs;
  },
});`}>
        <FormStateDemo theme={theme} />
      </DemoSection>

      <PropTable
        theme={theme}
        title="Available Hooks"
        rows={[
          { prop: 'useDisclosure', type: '(init?) → { isOpen, open, close, toggle }', description: 'Open/closed state manager.' },
          { prop: 'useDebounce', type: '<T>(value, delay) → T', description: 'Debounced value.' },
          { prop: 'useThrottle', type: '<T>(value, interval) → T', description: 'Throttled value.' },
          { prop: 'useControllable', type: '<T>({ value?, onChange?, defaultValue }) → [T, set]', description: 'Controlled/uncontrolled unification.' },
          { prop: 'useListSelection', type: '({ items, multiple? }) → selection API', description: 'Multi/single selection with set operations.' },
          { prop: 'useLocalStorage', type: '<T>(key, init) → [T, set, remove]', description: 'SSR-safe persisted state.' },
          { prop: 'useMediaQuery', type: '(query) → boolean', description: 'Reactive media query.' },
          { prop: 'useBreakpoint', type: '() → { sm, md, lg, xl, xxl, isMobile, isTablet, isDesktop }', description: 'Named breakpoint booleans.' },
          { prop: 'useFormState', type: '<T>({ initialValues, validate? }) → form API', description: 'Headless form state with validation.' },
          { prop: 'useRovingTabIndex', type: '({ count, orientation?, loop? }) → roving API', description: 'WAI-ARIA roving tabIndex for keyboard navigation.' },
          { prop: 'useIntersectionObserver', type: '({ threshold?, rootMargin?, once? }) → { ref, isIntersecting, entry }', description: 'Viewport intersection detection.' },
        ]}
      />
    </div>
  );
}
