export function CardDoc() {
  return (
    <>
      <p>
        <code>TkxCard</code> is a flexible container for grouping related content. Three
        variants, four padding sizes, and composable sub-components for header / body / footer
        slots. Used heavily across the dashboard, settings, and product-detail templates.
      </p>

      <h2>Anatomy</h2>
      <ul>
        <li><strong>Variants:</strong> <code>elevated</code> (subtle shadow), <code>outlined</code> (border only), <code>filled</code> (tinted background)</li>
        <li>
          <strong>Sub-components:</strong> <code>TkxCardHeader</code>,{' '}
          <code>TkxCardBody</code>, <code>TkxCardFooter</code> — each takes its own padding
          override
        </li>
        <li>
          <strong>Optional clickable mode:</strong> pass <code>onClick</code> and the entire
          card becomes a focusable button with hover lift
        </li>
      </ul>

      <h2>Examples</h2>

      <h3>Composed card</h3>
      <pre><code>{`<TkxCard variant="elevated">
  <TkxCardHeader>
    <h3 style={{ margin: 0 }}>Q4 retrospective</h3>
  </TkxCardHeader>
  <TkxCardBody>
    Three releases shipped, eight components added, zero security incidents.
  </TkxCardBody>
  <TkxCardFooter>
    <TkxButton variant="primary">Read</TkxButton>
    <TkxButton variant="ghost">Skip</TkxButton>
  </TkxCardFooter>
</TkxCard>`}</code></pre>

      <h3>Clickable card</h3>
      <pre><code>{`<TkxCard variant="outlined" onClick={() => navigate('/team/aria')}>
  <TkxCardBody>
    <strong>Aria Solis</strong> — Senior Frontend Engineer
  </TkxCardBody>
</TkxCard>`}</code></pre>

      <p>
        Clickable cards render as <code>role="button"</code> with <code>tabindex="0"</code>,
        respond to Enter and Space, and ship a visible focus ring. The platform's normal
        button keyboard model just works.
      </p>

      <h2>Props (TkxCard)</h2>
      <table>
        <thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
        <tbody>
          <tr><td><code>variant</code></td><td><code>'elevated' | 'outlined' | 'filled'</code></td><td><code>'elevated'</code></td></tr>
          <tr><td><code>padding</code></td><td><code>'none' | 'sm' | 'md' | 'lg'</code></td><td><code>'md'</code></td></tr>
          <tr><td><code>onClick</code></td><td><code>(e) =&gt; void</code></td><td>—</td></tr>
          <tr><td><code>as</code></td><td><code>'div' | 'article' | 'section'</code></td><td><code>'div'</code></td></tr>
        </tbody>
      </table>

      <h2>Accessibility</h2>
      <p>
        Static cards render as a generic <code>{'<div>'}</code> by default; pass <code>as="article"</code> or
        <code>as="section"</code> when the card represents a self-contained piece of content
        (a blog post, a product). That gives screen readers structural context.
      </p>
      <p>
        Clickable cards must have a visible focus ring. The default ring meets WCAG 2.1
        AAA contrast against every variant. Don't disable it.
      </p>

      <h2>Common pitfalls</h2>
      <ul>
        <li>
          <strong>Avoid double-buttoning.</strong> If a clickable card has a Read More button
          inside it, both targets compete for clicks. Pick one — usually a clickable card
          with no inner button is cleaner.
        </li>
        <li>
          <strong>Don't nest interactive cards.</strong> A clickable card inside another
          clickable card breaks the focus model and confuses screen readers.
        </li>
        <li>
          <strong>Use header / body / footer for layout, not styling.</strong> If your design
          needs unusual padding, override via <code>style</code> or wrap content in your own
          component. Don't add new slots ad-hoc.
        </li>
      </ul>
    </>
  );
}
