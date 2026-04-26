import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxCascader } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

const CASCADER_PROPS = [
  { name: 'options', type: 'CascaderOption[]', default: '—', description: 'Tree-structured options. Each node has value, label, optional children[], and optional disabled.', required: true },
  { name: 'value', type: 'string[]', default: 'undefined', description: 'Controlled selected path as an array of values from root to leaf.' },
  { name: 'onChange', type: '(value: string[], selectedOptions: CascaderOption[]) => void', default: 'undefined', description: 'Called when a leaf node is selected, passing both the value path and the matching option objects.' },
  { name: 'placeholder', type: 'string', default: "'Please select'", description: 'Placeholder text shown when nothing is selected.' },
  { name: 'label', type: 'string', default: 'undefined', description: 'Accessible label rendered above the trigger button.' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'Allows selecting multiple leaf paths simultaneously.' },
];

const LOCATION_OPTIONS = [
  {
    value: 'north-america',
    label: 'North America',
    children: [
      {
        value: 'usa',
        label: 'United States',
        children: [
          { value: 'ca', label: 'California' },
          { value: 'ny', label: 'New York' },
          { value: 'tx', label: 'Texas' },
          { value: 'wa', label: 'Washington' },
        ],
      },
      {
        value: 'canada',
        label: 'Canada',
        children: [
          { value: 'on', label: 'Ontario' },
          { value: 'bc', label: 'British Columbia' },
          { value: 'qc', label: 'Québec' },
        ],
      },
    ],
  },
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'uk',
        label: 'United Kingdom',
        children: [
          { value: 'england', label: 'England' },
          { value: 'scotland', label: 'Scotland' },
          { value: 'wales', label: 'Wales' },
        ],
      },
      {
        value: 'germany',
        label: 'Germany',
        children: [
          { value: 'bavaria', label: 'Bavaria' },
          { value: 'berlin', label: 'Berlin' },
          { value: 'nrw', label: 'North Rhine-Westphalia' },
        ],
      },
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'idf', label: 'Île-de-France' },
          { value: 'paca', label: 'Provence-Alpes-Côte d\'Azur' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [
      {
        value: 'india',
        label: 'India',
        children: [
          { value: 'mh', label: 'Maharashtra' },
          { value: 'dl', label: 'Delhi' },
          { value: 'ka', label: 'Karnataka' },
        ],
      },
      {
        value: 'japan',
        label: 'Japan',
        children: [
          { value: 'tokyo', label: 'Tokyo' },
          { value: 'osaka', label: 'Osaka' },
        ],
      },
    ],
  },
];

const CATEGORY_OPTIONS = [
  {
    value: 'electronics',
    label: 'Electronics',
    children: [
      {
        value: 'phones',
        label: 'Phones & Tablets',
        children: [
          { value: 'smartphones', label: 'Smartphones' },
          { value: 'tablets', label: 'Tablets' },
          { value: 'accessories', label: 'Accessories' },
        ],
      },
      {
        value: 'computers',
        label: 'Computers',
        children: [
          { value: 'laptops', label: 'Laptops' },
          { value: 'desktops', label: 'Desktops' },
          { value: 'peripherals', label: 'Peripherals' },
        ],
      },
      {
        value: 'audio',
        label: 'Audio',
        children: [
          { value: 'headphones', label: 'Headphones' },
          { value: 'speakers', label: 'Speakers' },
        ],
      },
    ],
  },
  {
    value: 'clothing',
    label: 'Clothing',
    children: [
      {
        value: 'mens',
        label: "Men's",
        children: [
          { value: 'shirts', label: 'Shirts' },
          { value: 'pants', label: 'Pants' },
          { value: 'shoes', label: 'Shoes' },
        ],
      },
      {
        value: 'womens',
        label: "Women's",
        children: [
          { value: 'dresses', label: 'Dresses' },
          { value: 'tops', label: 'Tops' },
          { value: 'shoes-w', label: 'Shoes' },
        ],
      },
    ],
  },
];

export function CascaderPage({ theme }: { theme: ThemeTokens }) {
  const [location, setLocation] = useState<string[]>([]);
  const [category, setCategory] = useState<string[]>([]);

  const divider = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };
  const logBox = {
    marginTop: 12,
    padding: '10px 14px',
    borderRadius: 8,
    backgroundColor: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    fontSize: 13,
    color: theme.textMuted,
    fontFamily: 'monospace',
    minHeight: 36,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Location ─────────────────────────────────────────────────────── */}
      <DemoSection
        title="Location Selector"
        description="Navigate Continent → Country → State/Province using the column-based cascader. Hover over a parent to expand its children."
        theme={theme}
        code={`<TkxCascader
  label="Location"
  placeholder="Select region..."
  options={locationOptions}
  value={location}
  onChange={(val) => setLocation(val)}
/>`}
      >
        <div>
          <TkxCascader
            label="Location"
            placeholder="Select region..."
            options={LOCATION_OPTIONS}
            value={location}
            onChange={(val) => setLocation(val)}
          />
          {location.length > 0 && (
            <div style={logBox}>
              Selected path: {location.join(' → ')}
            </div>
          )}
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── E-commerce Category ─────────────────────────────────────────── */}
      <DemoSection
        title="Product Category"
        description="Drill-down category selection for e-commerce, CMS, or inventory systems. Supports unlimited depth."
        theme={theme}
        code={`<TkxCascader
  label="Product Category"
  placeholder="Browse categories..."
  options={categoryOptions}
  value={category}
  onChange={setCategory}
/>`}
      >
        <div>
          <TkxCascader
            label="Product Category"
            placeholder="Browse categories..."
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
          />
          {category.length > 0 && (
            <div style={logBox}>
              Category: {category.join(' / ')}
            </div>
          )}
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Why Cascader ─────────────────────────────────────────────────── */}
      <div style={{ padding: '28px 32px', borderRadius: 12, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: theme.text }}>🌲 When to Use Cascader vs Select</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13, color: theme.primary }}>Use Cascader when:</p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: theme.textMuted, lineHeight: 1.8 }}>
              <li>Data is deeply hierarchical (3+ levels)</li>
              <li>Parent selection has meaning (e.g., continent → country)</li>
              <li>You need the full path, not just the leaf</li>
              <li>Options number in the hundreds+</li>
            </ul>
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13, color: theme.text }}>Use Select when:</p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: theme.textMuted, lineHeight: 1.8 }}>
              <li>Flat list of options (1 level)</li>
              <li>Options are &lt;50 items</li>
              <li>Parent context isn't needed</li>
              <li>Simple single or multi-select</li>
            </ul>
          </div>
        </div>
      </div>

      <hr style={divider} />

      {/* ── Props ──────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>TkxCascader Props</h3>
        <PropTable props={CASCADER_PROPS} />
      </div>
    </div>
  );
}
