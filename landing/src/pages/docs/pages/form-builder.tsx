export function FormBuilderDoc() {
  return (
    <>
      <p>
        <code>TkxFormBuilder</code> is a visual form designer. Three panes: a palette of
        field types on the left, an editable canvas in the middle, an inspector for the
        selected field on the right. Plus a live-preview tab that renders the actual form
        with native validation, and a JSON view for export / import.
      </p>

      <h2>What you can build</h2>
      <p>Eight field types ship out of the box:</p>
      <ul>
        <li><code>text</code>, <code>email</code>, <code>number</code></li>
        <li><code>textarea</code></li>
        <li><code>select</code>, <code>radio</code> (option-based)</li>
        <li><code>checkbox</code></li>
        <li><code>date</code></li>
      </ul>
      <p>Each field has editable label, name (auto-sanitized to a JS identifier), placeholder, help text, required flag, min/max for numbers, regex pattern for text inputs, and per-option label/value pairs for select / radio.</p>

      <h2>Examples</h2>

      <h3>Controlled</h3>
      <pre><code>{`import { TkxFormBuilder, type FormSchema } from 'tekivex-ui';

const [schema, setSchema] = useState<FormSchema>({
  title: 'Contact form',
  fields: [
    { id: 'f1', type: 'text',  name: 'name',  label: 'Full name',  required: true },
    { id: 'f2', type: 'email', name: 'email', label: 'Email',      required: true },
  ],
});

<TkxFormBuilder schema={schema} onChange={setSchema} />`}</code></pre>

      <h3>Validating with the bundled helper</h3>
      <pre><code>{`import { validateField } from 'tekivex-ui';

for (const field of schema.fields) {
  const error = validateField(field, values[field.name]);
  if (error) console.log(\`\${field.name}: \${error}\`);
}`}</code></pre>

      <p>
        <code>validateField()</code> handles required, email format, number min/max, and
        regex pattern matching. Bad regex patterns are tolerated gracefully — they just
        don't match anything, instead of throwing.
      </p>

      <h2>Schema shape</h2>
      <p>The <code>FormSchema</code> is JSON-serialisable so you can persist it to a backend or version-control it:</p>
      <pre><code>{`{
  "title": "Contact form",
  "description": "We'll get back to you within 24 hours.",
  "fields": [
    {
      "id": "f1",
      "type": "select",
      "name": "topic",
      "label": "Topic",
      "required": true,
      "options": [
        { "label": "Sales",   "value": "sales" },
        { "label": "Support", "value": "support" }
      ]
    }
  ]
}`}</code></pre>

      <h2>Reordering + accessibility</h2>
      <p>
        Field reordering is done with up / down arrow buttons, not drag-and-drop. The
        keyboard model is more reliable across mouse, touch, and screen-reader users, and
        avoids the "did the field actually drop?" ambiguity. Each button has{' '}
        <code>aria-label</code> identifying which field will move.
      </p>

      <h2>Common patterns</h2>

      <h3>Persist to localStorage</h3>
      <p>
        Wrap the controlled state with <code>useEffect</code> + <code>JSON.stringify</code>{' '}
        and you have an auto-saving form designer in five lines.
      </p>

      <h3>Server round-trip</h3>
      <p>
        The schema is JSON; <code>POST</code> it to your backend, store it, render the same
        schema later through the live preview tab. The schema doesn't need any server
        knowledge of the field types.
      </p>

      <h2>What it doesn't do</h2>
      <ul>
        <li><strong>No conditional logic.</strong> "Show field X if Y is checked" is a future feature; today every field renders unconditionally.</li>
        <li><strong>No multi-step / wizard form.</strong> Ship the form as a single page or compose <code>TkxStepper</code> on top.</li>
        <li><strong>No file uploads.</strong> File-input field type planned for v3.18.</li>
      </ul>
    </>
  );
}
