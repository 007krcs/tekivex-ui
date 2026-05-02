export function BadgeDoc() {
  return (
    <>
      <p>
        <code>TkxBadge</code> is a compact pill for tags, status indicators, version chips,
        and short labels. Renders inline so it composes inside titles, buttons, and table
        cells without breaking flow.
      </p>

      <h2>Variants + sizes</h2>
      <ul>
        <li><strong>Variants:</strong> <code>solid</code> (filled background), <code>outline</code> (border only)</li>
        <li><strong>Sizes:</strong> <code>sm</code>, <code>md</code> (default), <code>lg</code></li>
        <li>
          <strong>Color schemes:</strong> <code>neutral</code>, <code>info</code>,{' '}
          <code>success</code>, <code>warning</code>, <code>danger</code> — pick the one that
          matches the meaning
        </li>
      </ul>

      <h2>Examples</h2>

      <h3>Status badges</h3>
      <pre><code>{`<TkxBadge variant="solid"   colorScheme="success">Live</TkxBadge>
<TkxBadge variant="solid"   colorScheme="warning">Beta</TkxBadge>
<TkxBadge variant="outline" colorScheme="neutral">v3.16</TkxBadge>
<TkxBadge variant="solid"   colorScheme="danger">Deprecated</TkxBadge>`}</code></pre>

      <h3>Inline in a heading</h3>
      <pre><code>{`<h2>
  Onboarding flow
  <TkxBadge variant="outline" colorScheme="info" size="sm">Updated</TkxBadge>
</h2>`}</code></pre>

      <h3>Counters</h3>
      <p>
        Use a <code>solid</code> badge with a numeric child for unread counts and similar.
        Cap the displayed value at 99 to keep widths predictable.
      </p>
      <pre><code>{`<TkxBadge variant="solid" colorScheme="danger">
  {unread > 99 ? '99+' : unread}
</TkxBadge>`}</code></pre>

      <h2>Accessibility</h2>
      <p>
        Badges are decorative by default — they reinforce labels that exist elsewhere. When
        a badge conveys information that wouldn't otherwise be available (e.g. "3 unread"),
        wrap it in a screen-reader label so the meaning is announced:
      </p>
      <pre><code>{`<span aria-label={\`\${unread} unread messages\`}>
  Inbox
  <TkxBadge variant="solid" colorScheme="danger">{unread}</TkxBadge>
</span>`}</code></pre>

      <h2>Color is not the only signal</h2>
      <p>
        Don't use color alone to differentiate badge meanings. Pair the color with a label so
        users with color-vision deficiencies can still understand. "Deprecated" beats a red
        dot.
      </p>

      <h2>Common pitfalls</h2>
      <ul>
        <li>
          <strong>Don't use badges as buttons.</strong> A badge looks clickable to some users,
          but it's not. If you need an interaction, use <code>TkxButton</code> with a small
          size variant.
        </li>
        <li>
          <strong>Avoid more than two badges per row.</strong> Stacks of badges become noise;
          they stop drawing the eye and start crowding it.
        </li>
        <li>
          <strong>Match the variant to weight.</strong> Solid badges feel heavier; outline
          ones are lighter. Use solid for the most-important status, outline for everything
          else on the page.
        </li>
      </ul>
    </>
  );
}
