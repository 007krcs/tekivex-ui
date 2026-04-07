import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxAutocomplete } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const AUTOCOMPLETE_PROPS = [
  { name: 'options', type: 'AutocompleteOption[]', default: '—', description: 'Array of options to display. Each option has value, label, and optional description, icon, and disabled fields.' },
  { name: 'value', type: 'string', default: 'undefined', description: 'The currently selected value (controlled). Matches an option value.' },
  { name: 'onChange', type: '(value: string) => void', default: 'undefined', description: 'Callback fired when an option is selected. Receives the option value string.' },
  { name: 'onInputChange', type: '(input: string) => void', default: 'undefined', description: 'Callback fired when the text input changes. Useful for async filtering or search.' },
  { name: 'placeholder', type: 'string', default: 'undefined', description: 'Placeholder text shown in the input when empty.' },
  { name: 'label', type: 'string', default: '—', description: 'Accessible label for the autocomplete input. Required for screen readers.' },
  { name: 'isLoading', type: 'boolean', default: 'false', description: 'Shows a loading spinner inside the dropdown. Use when fetching options asynchronously.' },
  { name: 'emptyMessage', type: 'string', default: 'undefined', description: 'Message displayed when no options match the current input.' },
  { name: 'filterFn', type: '(option: AutocompleteOption, input: string) => boolean', default: 'Built-in fuzzy filter', description: 'Custom filter function. Overrides the default fuzzy matching.' },
  { name: 'freeSolo', type: 'boolean', default: 'false', description: 'Allows arbitrary text input not matching any option. The value is the raw input string.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged with built-in tkx() classes.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles merged on top of base styles.' },
];

const OPTION_PROPS = [
  { name: 'value', type: 'string', default: '—', description: 'Unique value identifier for the option.' },
  { name: 'label', type: 'string', default: '—', description: 'Display text for the option.' },
  { name: 'description', type: 'string', default: 'undefined', description: 'Secondary description text shown below the label.' },
  { name: 'icon', type: 'ReactNode', default: 'undefined', description: 'Optional icon rendered to the left of the label.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'When true, the option cannot be selected.' },
];

// ── Inline icons ──────────────────────────────────────────────────────────────

function IconGlobe({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconCode({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconStar({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ── Sample data ──────────────────────────────────────────────────────────────

const FRUIT_OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'dragonfruit', label: 'Dragon Fruit' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
];

const LANGUAGE_OPTIONS = [
  { value: 'js', label: 'JavaScript', description: 'Dynamic scripting language for the web', icon: <IconCode color="currentColor" /> },
  { value: 'ts', label: 'TypeScript', description: 'Typed superset of JavaScript', icon: <IconCode color="currentColor" /> },
  { value: 'py', label: 'Python', description: 'General-purpose programming language', icon: <IconGlobe color="currentColor" /> },
  { value: 'rs', label: 'Rust', description: 'Systems programming with safety guarantees', icon: <IconStar color="currentColor" /> },
  { value: 'go', label: 'Go', description: 'Fast compiled language by Google', icon: <IconGlobe color="currentColor" />, disabled: true },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function AutocompletePage({ theme }: { theme: ThemeTokens }) {
  const [basicValue, setBasicValue] = useState('');
  const [richValue, setRichValue] = useState('');
  const [loadingValue, setLoadingValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [freeValue, setFreeValue] = useState('');

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const handleInputChangeWithLoading = (_input: string) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxAutocomplete
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 48px' }}>
        A combobox input that filters and suggests options as the user types. Features built-in
        fuzzy matching, support for descriptions and icons on options, loading state for async data,
        and a freeSolo mode for arbitrary text entry.
      </p>

      {/* ── 1. Basic Autocomplete ── */}
      <DemoSection
        title="Basic Autocomplete"
        description="A simple autocomplete with a list of string options. The built-in fuzzy filter matches characters in order, so typing 'df' matches 'Dragon Fruit'."
        theme={theme}
        code={`const [value, setValue] = useState('');

<TkxAutocomplete
  label="Select a fruit"
  placeholder="Search fruits..."
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    // ...
  ]}
  value={value}
  onChange={setValue}
/>`}
      >
        <div style={{ maxWidth: '320px' }}>
          <TkxAutocomplete
            label="Select a fruit"
            placeholder="Search fruits..."
            options={FRUIT_OPTIONS}
            value={basicValue}
            onChange={setBasicValue}
          />
          {basicValue && (
            <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '8px' }}>
              Selected: <strong style={{ color: theme.primary }}>{basicValue}</strong>
            </p>
          )}
        </div>
      </DemoSection>

      {/* ── 2. With Descriptions and Icons ── */}
      <DemoSection
        title="With Descriptions and Icons"
        description="Options can include a description shown as secondary text and an icon rendered to the left. Disabled options are visible but not selectable."
        theme={theme}
        code={`<TkxAutocomplete
  label="Select a language"
  placeholder="Search languages..."
  options={[
    { value: 'js', label: 'JavaScript', description: 'Dynamic scripting language', icon: <IconCode /> },
    { value: 'ts', label: 'TypeScript', description: 'Typed superset of JS', icon: <IconCode /> },
    { value: 'go', label: 'Go', description: 'Fast compiled language', icon: <IconGlobe />, disabled: true },
  ]}
  value={value}
  onChange={setValue}
/>`}
      >
        <div style={{ maxWidth: '360px' }}>
          <TkxAutocomplete
            label="Select a language"
            placeholder="Search languages..."
            options={LANGUAGE_OPTIONS}
            value={richValue}
            onChange={setRichValue}
          />
          {richValue && (
            <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '8px' }}>
              Selected: <strong style={{ color: theme.primary }}>{richValue}</strong>
            </p>
          )}
        </div>
      </DemoSection>

      {/* ── 3. Loading State ── */}
      <DemoSection
        title="Loading State"
        description="Set isLoading to true to display a spinner inside the dropdown. Use this while fetching options from an API via the onInputChange callback."
        theme={theme}
        code={`const [loading, setLoading] = useState(false);

<TkxAutocomplete
  label="Search"
  placeholder="Type to search..."
  options={results}
  isLoading={loading}
  onInputChange={(input) => {
    setLoading(true);
    fetchOptions(input).then(() => setLoading(false));
  }}
  value={value}
  onChange={setValue}
/>`}
      >
        <div style={{ maxWidth: '320px' }}>
          <TkxAutocomplete
            label="Search with loading"
            placeholder="Type to trigger loading..."
            options={FRUIT_OPTIONS}
            isLoading={isLoading}
            onInputChange={handleInputChangeWithLoading}
            value={loadingValue}
            onChange={setLoadingValue}
          />
          <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '8px' }}>
            {isLoading ? 'Loading...' : 'Type anything to simulate a 1.2s loading delay.'}
          </p>
        </div>
      </DemoSection>

      {/* ── 4. Free Solo ── */}
      <DemoSection
        title="Free Solo Mode"
        description="With freeSolo enabled, the input accepts arbitrary text that does not match any option. The value is the raw input string. Useful for tagging or custom entry fields."
        theme={theme}
        code={`<TkxAutocomplete
  label="Enter a tag"
  placeholder="Type or select..."
  options={fruitOptions}
  freeSolo
  value={value}
  onChange={setValue}
/>`}
      >
        <div style={{ maxWidth: '320px' }}>
          <TkxAutocomplete
            label="Enter a tag"
            placeholder="Type or select..."
            options={FRUIT_OPTIONS}
            freeSolo
            value={freeValue}
            onChange={setFreeValue}
          />
          {freeValue && (
            <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '8px' }}>
              Value: <strong style={{ color: theme.primary }}>{freeValue}</strong>
              {!FRUIT_OPTIONS.find(o => o.value === freeValue) && (
                <span style={{ color: theme.warning, marginLeft: '8px' }}>(custom entry)</span>
              )}
            </p>
          )}
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>
        TkxAutocompleteProps
      </h3>
      <div style={{ marginBottom: '32px' }}>
        <PropTable props={AUTOCOMPLETE_PROPS} />
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>
        AutocompleteOption
      </h3>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={OPTION_PROPS} />
      </div>
    </div>
  );
}
