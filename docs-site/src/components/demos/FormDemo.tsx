import { useState } from 'react';
import { TkxForm, TkxFormField, TkxInput, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

interface ContactForm {
  name?: string;
  email?: string;
  message?: string;
}

export function FormBasic() {
  const [submitted, setSubmitted] = useState<ContactForm | null>(null);
  return (
    <Preview label="Vertical form — submit to see emitted values" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <TkxForm<ContactForm>
          layout="vertical"
          onSubmit={(values) => setSubmitted(values)}
        >
          <TkxFormField name="name" label="Name" required>
            <TkxInput placeholder="Your name" />
          </TkxFormField>
          <TkxFormField name="email" label="Email" required>
            <TkxInput type="email" placeholder="you@example.com" />
          </TkxFormField>
          <TkxFormField name="message" label="Message">
            <TkxInput placeholder="What's on your mind?" />
          </TkxFormField>
          <TkxButton type="submit" variant="primary">Submit</TkxButton>
        </TkxForm>
        {submitted && (
          <pre style={{ marginTop: 12, fontSize: 11, color: '#475569', background: 'rgba(127,127,127,0.08)', padding: 8, borderRadius: 6 }}>
{JSON.stringify(submitted, null, 2)}
          </pre>
        )}
      </div>
    </Preview>
  );
}
