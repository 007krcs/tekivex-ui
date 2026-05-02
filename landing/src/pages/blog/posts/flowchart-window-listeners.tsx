export function FlowchartWindowListeners() {
  return (
    <>
      <p>
        We shipped <code>TkxFlowChart</code> with a connector port — a glowing <code>(+)</code>
        on the right edge of every node. Drag it to another node and an edge gets created. Tests
        passed. The visual was nice. A user opened the demo and reported{' '}
        <strong>"this isn't editable."</strong> The drag did nothing.
      </p>

      <p>
        Three rounds of investigation later we ripped out <code>setPointerCapture</code> and
        moved the drag to a window-level listener. Here's why.
      </p>

      <h2>Round 1: the visual was the bug?</h2>

      <p>
        First instinct: maybe the port is too small. We doubled it from 16×16 to 22×22, added a
        <code>+</code> glyph inside, gave it a 1.25× scale-up on hover, and put an instructional
        banner above the canvas. Test users could now <em>find</em> the port, but the drag still
        produced nothing. Visual fix shipped, real fix still ahead.
      </p>

      <h2>Round 2: pointer capture in theory</h2>

      <p>
        The original implementation registered <code>onPointerDown</code> /
        <code>onPointerMove</code> / <code>onPointerUp</code> on the port button itself, and
        called <code>setPointerCapture(e.pointerId)</code> on pointerdown. The contract is:
      </p>

      <blockquote>
        After <code>setPointerCapture</code>, every pointer event for that pointer ID is routed
        to the captured target until <code>releasePointerCapture</code> or pointerup.
      </blockquote>

      <p>
        That should mean: user presses the port, drags off the button, releases over another
        node — all those pointermoves and the final pointerup hit the port's React handlers. In
        jsdom that's exactly what happened. Tests passed.
      </p>

      <p>
        In Chrome and Firefox it didn't. Something about the combination of React's synthetic
        event system + <code>e.preventDefault()</code> on the pointerdown + the pointer-capture
        API caused pointermove events to stop being delivered to the captured target the
        moment the cursor crossed off the button. We didn't fully reproduce the WHY — pointer
        capture's interaction with synthetic-event delegation is poorly documented in the
        margins.
      </p>

      <h2>Round 3: the fix is to not use the React handlers</h2>

      <p>
        Window-level listeners don't go through React's synthetic event system. They get every
        pointer event in the document, regardless of which element is under the cursor. They
        also don't care about pointer capture — capture is a routing optimization, not a
        gating mechanism, and you can ignore it.
      </p>

      <pre><code>{`const onPortPointerDown = (e: PointerEvent, fromNodeId: string) => {
  e.stopPropagation();
  e.preventDefault();

  const pointerId = e.pointerId;
  const [gx, gy] = screenToGraph(e.clientX, e.clientY);
  dragRef.current = { kind: 'edge', pointerId, fromNodeId };
  setEdgeDraft({ fromNodeId, gx, gy });

  const onWindowMove = (ev: globalThis.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.kind !== 'edge' || drag.pointerId !== ev.pointerId) return;
    const [mx, my] = screenToGraph(ev.clientX, ev.clientY);
    setEdgeDraft({ fromNodeId: drag.fromNodeId, gx: mx, gy: my });
  };

  const onWindowUp = (ev: globalThis.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.kind !== 'edge' || drag.pointerId !== ev.pointerId) return;

    const target = document.elementFromPoint(ev.clientX, ev.clientY);
    const nodeEl = (target as Element | null)
      ?.closest('[data-tkx-node-id]') as HTMLElement | null;
    const toNodeId = nodeEl?.dataset.tkxNodeId;

    if (toNodeId && toNodeId !== drag.fromNodeId) {
      // … create the edge …
    }

    dragRef.current = null;
    setEdgeDraft(null);
    window.removeEventListener('pointermove', onWindowMove);
    window.removeEventListener('pointerup', onWindowUp);
    window.removeEventListener('pointercancel', onWindowUp);
  };

  window.addEventListener('pointermove', onWindowMove);
  window.addEventListener('pointerup', onWindowUp);
  window.addEventListener('pointercancel', onWindowUp);
};`}</code></pre>

      <p>
        Boring, predictable, works in every browser we tested.
      </p>

      <h2>Why this story matters</h2>

      <h3>Lesson 1 — passing tests is necessary but not sufficient</h3>

      <p>
        The original implementation had 47 unit tests, every one green. Coverage was 95%.
        jsdom's pointer-event implementation is "spec-compliant enough for unit tests" and our
        code passed it. Real browsers behave differently. The test suite wasn't wrong — it was
        testing the right behavior — but it was testing it through a model that ignored the
        pointer-capture interaction we were depending on.
      </p>

      <p>
        We added a <strong>window-level integration test</strong> that dispatches actual
        <code>PointerEvent</code> instances on <code>window</code>, not on the port button. That
        test would have caught the original bug in jsdom too, because the failure mode wasn't
        "the React handler doesn't run" — it was "we shouldn't be relying on the React
        handler."
      </p>

      <h3>Lesson 2 — pointer capture is for routing, not gating</h3>

      <p>
        Reading the W3C spec carefully, pointer capture is described as "redirecting subsequent
        pointer events to a specified target." It's an <em>optimization</em>: capture lets the
        browser skip hit-testing for a known target. It's not a guarantee that no other code
        will see the events.
      </p>

      <p>
        The lesson: if you absolutely need to receive every event in a sequence, listen on
        <code>window</code>. Don't bet on a particular target capturing them.
      </p>

      <h3>Lesson 3 — preventDefault has hidden side effects</h3>

      <p>
        We were calling <code>e.preventDefault()</code> on the pointerdown to stop text
        selection from kicking in while dragging. That's reasonable. But in the same browser /
        React combination, calling <code>preventDefault</code> on the synthetic pointerdown
        seems to have interacted with capture's internal state in a way that dropped the
        subsequent moves.
      </p>

      <p>
        Window listeners sidestep the entire question — there's no synthetic event, there's no
        capture target, there's just a global listener that fires every time the OS reports a
        pointer move.
      </p>

      <h2>What we kept</h2>

      <p>
        The React-prop handlers on the port are still registered. Real browsers route through
        the window listeners and the React handlers no-op. jsdom-driven synthetic events still
        work because they fire on the React handler. That keeps the unit-test surface intact
        while making the production path bulletproof.
      </p>

      <p>
        Two paths, one robust, one for tests. The price is a few extra lines of code; the
        win is a feature that actually works for users.
      </p>
    </>
  );
}
