import { useState } from 'react';
import { TkxAutoForm, type FormSchema } from 'tekivex-ui';
import { Preview } from '../Preview';

// TkxAutoForm renders a whole form from a FormSchema: { title?, description?,
// fields: FormField[] }. Each FormField = { id, type, name, label, placeholder?,
// helpText?, required?, options?, min?, max?, pattern? }.

const contactSchema: FormSchema = {
  title: 'Contact us',
  description: 'We usually reply within one business day.',
  fields: [
    { id: 'f1', type: 'text', name: 'name', label: 'Name', required: true, placeholder: 'Ada Lovelace' },
    { id: 'f2', type: 'email', name: 'email', label: 'Email', required: true, placeholder: 'ada@example.com' },
    {
      id: 'f3',
      type: 'select',
      name: 'topic',
      label: 'Topic',
      required: true,
      options: [
        { label: 'Bug report', value: 'bug' },
        { label: 'Feature request', value: 'feature' },
        { label: 'Other', value: 'other' },
      ],
    },
    { id: 'f4', type: 'textarea', name: 'message', label: 'Message', helpText: 'Markdown is fine.' },
    { id: 'f5', type: 'checkbox', name: 'updates', label: 'Updates', placeholder: 'Email me product updates' },
  ],
};

export function AutoFormBasic() {
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  return (
    <Preview label="Schema-driven form" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 320, maxWidth: 480 }}>
        <TkxAutoForm
          schema={contactSchema}
          defaultValues={{ topic: 'bug' }}
          submitLabel="Send message"
          onSubmit={(data) => setPayload(data)}
        />
        {payload && (
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              fontSize: 12,
              borderRadius: 8,
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(payload, null, 2)}
          </pre>
        )}
      </div>
    </Preview>
  );
}
