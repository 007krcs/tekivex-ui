import { useState } from 'react';
import { TkxCurrencyInput, type CurrencyCode } from 'tekivex-ui';
import type { Story } from '../src/types';

function CurrencyStory(p: any) {
  const [value, setValue] = useState<number | null>(p.initialValue);
  return (
    <div style={{ minWidth: 280 }}>
      <TkxCurrencyInput
        label={p.label}
        value={value}
        onChange={setValue}
        currency={p.currency as CurrencyCode}
      />
      <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
        Numeric value: <code>{String(value)}</code>
      </p>
    </div>
  );
}

export const currencyInput: Story = {
  name: 'TkxCurrencyInput',
  description: 'Locale-aware currency. INR uses lakh/crore (1,23,456).',
  controls: {
    label: { type: 'text', default: 'Annual income' },
    currency: { type: 'select', options: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD'], default: 'INR' },
    initialValue: { type: 'number', default: 1234567, min: 0, step: 1000 },
  },
  render: (p) => <CurrencyStory {...p} />,
};
