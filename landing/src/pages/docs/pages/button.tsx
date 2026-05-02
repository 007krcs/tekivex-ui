export function ButtonDoc() {
  return (
    <>
      <p>
        <code>TkxButton</code> is the foundational button primitive in <code>tekivex-ui</code>.
        It is a real <code>{'<button>'}</code> element with WCAG 2.1 AAA defaults — 44×44
        minimum touch target on every size, 7:1 contrast on every variant, full keyboard
        navigation, and screen-reader-friendly disabled and loading states.
      </p>

      <h2>Anatomy</h2>
      <p>The component exposes four variants and three sizes:</p>
      <ul>
        <li><strong>Variants:</strong> <code>primary</code> (default), <code>secondary</code>, <code>ghost</code>, <code>danger</code></li>
        <li><strong>Sizes:</strong> <code>sm</code> (32px height), <code>md</code> (40px, default), <code>lg</code> (48px)</li>
        <li><strong>States:</strong> default, hover, focus, active, disabled, loading</li>
      </ul>

      <h2>Examples</h2>

      <h3>Basic usage</h3>
      <pre><code>{`import { TkxButton } from 'tekivex-ui';

<TkxButton variant="primary" onClick={save}>Save</TkxButton>
<TkxButton variant="secondary">Cancel</TkxButton>
<TkxButton variant="danger">Delete</TkxButton>`}</code></pre>

      <h3>Loading state</h3>
      <p>
        Pass <code>loading</code> to disable the button and show a spinner. The button keeps
        its width so the layout doesn't jump when the spinner appears.
      </p>
      <pre><code>{`<TkxButton variant="primary" loading={isSaving} onClick={save}>
  {isSaving ? 'Saving…' : 'Save'}
</TkxButton>`}</code></pre>

      <h3>Icon + label</h3>
      <p>
        Pass an icon as a child, or use the <code>leftIcon</code> / <code>rightIcon</code>
        slots. The icon should have <code>aria-hidden="true"</code> if the label conveys the
        meaning.
      </p>

      <h2>Props</h2>
      <table>
        <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td><code>variant</code></td><td><code>'primary' | 'secondary' | 'ghost' | 'danger'</code></td><td><code>'primary'</code></td><td>Visual treatment</td></tr>
          <tr><td><code>size</code></td><td><code>'sm' | 'md' | 'lg'</code></td><td><code>'md'</code></td><td>Height + padding scale</td></tr>
          <tr><td><code>loading</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Disables + shows spinner</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Standard HTML disabled</td></tr>
          <tr><td><code>fullWidth</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Stretches to container width</td></tr>
          <tr><td><code>leftIcon / rightIcon</code></td><td><code>ReactNode</code></td><td>—</td><td>Icon slots</td></tr>
        </tbody>
      </table>

      <h2>Accessibility</h2>
      <p>
        The component is a native <code>{'<button>'}</code>, so all the platform's keyboard
        and screen-reader behaviors come for free — Enter and Space activate, focus ring is
        visible, AT announces "button" with the visible label.
      </p>
      <p>
        When <code>loading</code> is true, the button gets <code>aria-busy="true"</code> and
        the spinner is hidden from AT to avoid redundant announcement. The visible label
        should communicate the state ("Saving…" instead of just "Save"), since visually-shown
        spinners aren't announced.
      </p>

      <h2>Common pitfalls</h2>
      <ul>
        <li>
          <strong>Don't wrap a button in an anchor.</strong> If the action navigates, render
          a real <code>{'<a>'}</code> styled as a button instead. The platform's keyboard
          model differs.
        </li>
        <li>
          <strong>Don't put non-button content inside.</strong> A button can hold text and
          icons; nesting other interactive controls (links, inputs) breaks the focus model.
        </li>
        <li>
          <strong>Loading and disabled are different.</strong> Loading means "currently
          processing — try again in a sec." Disabled means "cannot be activated until some
          condition is met." Don't conflate.
        </li>
      </ul>
    </>
  );
}
