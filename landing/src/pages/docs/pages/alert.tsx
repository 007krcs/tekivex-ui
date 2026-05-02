export function AlertDoc() {
  return (
    <>
      <p>
        <code>TkxAlert</code> is a colored notice for inline status messages — info,
        success, warning, error. Used at the top of forms, in toolbars, on dashboard panels.
        Comes with optional title, optional close button, optional action slot.
      </p>

      <h2>Variants</h2>
      <ul>
        <li><strong><code>info</code></strong> — neutral blue, "FYI" notices</li>
        <li><strong><code>success</code></strong> — green, "this worked" confirmations</li>
        <li><strong><code>warning</code></strong> — amber, "you might want to know" caveats</li>
        <li><strong><code>error</code></strong> — red, "this failed" notices</li>
      </ul>

      <h2>Examples</h2>

      <h3>Basic</h3>
      <pre><code>{`<TkxAlert variant="info" title="New version available">
  A minor update is ready to install.
</TkxAlert>

<TkxAlert variant="success" title="Saved">
  Your changes have been committed.
</TkxAlert>

<TkxAlert variant="warning" title="Approaching quota">
  85% of your monthly API budget is used.
</TkxAlert>

<TkxAlert variant="error" title="Upload failed">
  The file exceeded the 10 MB limit.
</TkxAlert>`}</code></pre>

      <h3>Closable</h3>
      <pre><code>{`<TkxAlert
  variant="info"
  closable
  onClose={() => setDismissed(true)}
>
  Beta features are now available in Settings.
</TkxAlert>`}</code></pre>

      <h3>With an action button</h3>
      <pre><code>{`<TkxAlert
  variant="warning"
  title="Storage almost full"
  action={<TkxButton size="sm" onClick={upgrade}>Upgrade plan</TkxButton>}
>
  You have 2.1 GB free out of 10 GB.
</TkxAlert>`}</code></pre>

      <h2>Accessibility</h2>
      <p>
        Alerts are rendered with <code>role="alert"</code> by default — screen readers
        announce them on appearance. If your alert is informational and doesn't need
        immediate attention, pass <code>role="status"</code> instead so it's announced
        politely (interrupting nothing).
      </p>
      <p>
        The variant icon is decorative; the visible title and body convey the meaning. Don't
        rely on icon-only alerts for important messages.
      </p>

      <h2>Don't use alerts for everything</h2>
      <p>
        Alerts are loud — they take vertical space and announce themselves. Reserve them for
        information the user needs to know <em>now</em>. Use:
      </p>
      <ul>
        <li><strong>Toasts</strong> (<code>TkxToast</code>) for transient confirmations like "Saved" — they auto-dismiss</li>
        <li><strong>Form-field errors</strong> (the <code>error</code> prop on <code>TkxInput</code>) for validation messages — they appear at the field, not the page</li>
        <li><strong>Empty states</strong> for "no results" — they belong inside the affected area</li>
      </ul>

      <h2>Common pitfalls</h2>
      <ul>
        <li>
          <strong>Stacking alerts.</strong> Three alerts in a row look like noise. Pick the
          most-important one or merge them into a numbered list inside one alert.
        </li>
        <li>
          <strong>Closable error alerts.</strong> Errors are usually <em>not</em> dismissible
          — the underlying problem still exists. Closing the message just hides it. Make
          errors closable only if the user can confirm they understood ("Got it").
        </li>
        <li>
          <strong>Long body text.</strong> If the alert needs more than 200 characters, link
          to a help page from the alert's action slot rather than dumping the whole
          explanation inline.
        </li>
      </ul>
    </>
  );
}
