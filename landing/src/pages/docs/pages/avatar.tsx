import { withBase } from '../../../base';
export function AvatarDoc() {
  return (
    <>
      <p>
        <code>TkxAvatar</code> renders a profile photo with a sensible fallback when no image
        loads. Three sizes, four shapes, optional status indicator, optional initial-only
        rendering when no <code>src</code> is provided.
      </p>

      <h2>Anatomy</h2>
      <ul>
        <li><strong>Sizes:</strong> <code>sm</code> (24px), <code>md</code> (32px, default), <code>lg</code> (48px), <code>xl</code> (64px)</li>
        <li><strong>Shapes:</strong> <code>circle</code> (default), <code>rounded</code>, <code>square</code></li>
        <li><strong>Status:</strong> <code>online</code>, <code>busy</code>, <code>offline</code> — colored dot in the bottom-right</li>
        <li><strong>Fallback:</strong> when <code>src</code> fails to load (or is omitted), shows the user's initials on a tinted background</li>
      </ul>

      <h2>Examples</h2>

      <h3>Photo</h3>
      <pre><code>{`<TkxAvatar
  src={withBase('/photos/aria.jpg')}
  alt="Aria Solis"
  size="lg"
  status="online"
/>`}</code></pre>

      <h3>Initials fallback</h3>
      <pre><code>{`<TkxAvatar name="Pat O'Reilly" size="md" />`}</code></pre>
      <p>
        The component derives the first letters of the first two name parts, so "Pat O'Reilly"
        becomes "PO." Single-name input shows the first two characters.
      </p>

      <h3>Avatar group</h3>
      <pre><code>{`<TkxAvatarGroup max={3}>
  <TkxAvatar src="..." alt="Aria" />
  <TkxAvatar src="..." alt="Kenji" />
  <TkxAvatar src="..." alt="Idris" />
  <TkxAvatar src="..." alt="Mira" />
  <TkxAvatar src="..." alt="Liam" />
</TkxAvatarGroup>`}</code></pre>
      <p>
        Renders the first three avatars + a "+2" overflow indicator. Hover or focus reveals
        the names. The overflow chip is the same size as the avatars to keep alignment clean.
      </p>

      <h2>Accessibility</h2>
      <p>
        The <code>alt</code> attribute is required for image avatars — pass the person's
        name. For initials avatars, the <code>name</code> prop populates a hidden{' '}
        <code>aria-label</code>. Status dots have an <code>aria-label</code>{' '}
        (e.g. "Online") so they're announced.
      </p>

      <h2>Image fallback strategy</h2>
      <p>
        When <code>src</code> errors (404, CORS, network), the component swaps to the
        initials fallback automatically. No flicker — we use the <code>onError</code> handler
        on the underlying <code>{'<img>'}</code> to track the failure and re-render with the
        fallback.
      </p>

      <h2>Common pitfalls</h2>
      <ul>
        <li>
          <strong>Don't pass empty alt for decorative use.</strong> An avatar that
          accompanies a name is still informational — it identifies the person to a user
          who recognizes faces. Pass the name as alt.
        </li>
        <li>
          <strong>Don't size the inner image manually.</strong> The component handles
          sizing — use the <code>size</code> prop. Manually-sized images break the status
          indicator's positioning.
        </li>
        <li>
          <strong>Avoid more than 5 avatars in a group.</strong> Use <code>max</code> to
          collapse longer lists; long avatar rows clutter the layout.
        </li>
      </ul>
    </>
  );
}
