export function InputDoc() {
  return (
    <>
      <p>
        <code>TkxInput</code> is the text-input primitive. It bundles label, helper text,
        error state, prefix / suffix slots, and proper keyboard + screen-reader semantics
        into one component so you don't have to wire <code>aria-describedby</code>{' '}
        yourself.
      </p>

      <h2>Anatomy</h2>
      <ul>
        <li><strong>Label</strong> — required; mapped to the input via <code>htmlFor</code></li>
        <li><strong>Input</strong> — the actual <code>{'<input>'}</code></li>
        <li><strong>Helper text</strong> — optional sub-label, joined to the input via <code>aria-describedby</code></li>
        <li><strong>Error</strong> — replaces helper when set; styled red and announced via <code>role="alert"</code></li>
        <li><strong>Prefix / suffix</strong> — icons or short text inside the input frame</li>
      </ul>

      <h2>Examples</h2>

      <h3>Basic</h3>
      <pre><code>{`<TkxInput
  label="Full name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>`}</code></pre>

      <h3>With helper + error</h3>
      <pre><code>{`<TkxInput
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  helper="We'll never share your address."
  error={emailError}    // string when invalid, otherwise null
/>`}</code></pre>

      <h3>Prefix + suffix</h3>
      <pre><code>{`<TkxInput
  label="Username"
  prefix="@"
  suffix={loading ? <Spinner size="sm" /> : null}
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>`}</code></pre>

      <h3>Disabled / read-only</h3>
      <p>
        Disabled inputs render with reduced opacity and skip the focus ring. Read-only inputs
        keep full opacity and get a subtle border to indicate they're informational, not
        unavailable.
      </p>

      <h2>Accessibility</h2>
      <p>
        Every input must have a label. The label can be visible (the default) or visually
        hidden (pass <code>visuallyHiddenLabel</code>) — it's still announced. Don't rely on
        placeholder as a substitute label; placeholders disappear on focus and have low
        contrast.
      </p>
      <p>
        Errors are announced via <code>role="alert"</code> + <code>aria-live="polite"</code>.
        That means the error reads aloud to screen readers when it appears, but not before.
        Keep error messages specific — "Email must include @" is more useful than "Invalid."
      </p>

      <h2>Validation timing</h2>
      <p>
        We recommend validating on blur, not on every keystroke. Mid-typing errors are
        annoying and often wrong (the user might just not be done typing). Pair with a
        debounced validator if you need server-side validation.
      </p>

      <h2>Common pitfalls</h2>
      <ul>
        <li>
          <strong>Don't put a label inside a placeholder.</strong> Placeholders aren't
          announced as labels and disappear on focus.
        </li>
        <li>
          <strong>Don't change <code>type</code> at runtime.</strong> Some browsers reset the
          input value or leak it to autocomplete. Pick the type at mount.
        </li>
        <li>
          <strong>Don't skip the controlled value.</strong> Uncontrolled inputs work but
          force you to read DOM state via refs, which makes form validation harder.
        </li>
      </ul>
    </>
  );
}
