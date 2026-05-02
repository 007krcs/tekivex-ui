export function OnePagePrint() {
  return (
    <>
      <p>
        We shipped <code>TkxTemplateGenerator</code> — a smart UI that takes user data and one
        of 24 print-ready A4 templates and produces a downloadable PDF. The first user feedback
        was a bug report with a screenshot of Chrome's print dialog. <strong>"20 sheets of paper."</strong>
        The template was supposed to be one page. We were producing twenty.
      </p>

      <p>
        This post walks through the diagnosis, the dead-end first attempt, and the fix that
        actually works in every browser we tested.
      </p>

      <h2>The original (broken) implementation</h2>

      <p>
        The plan was straightforward. Render the chosen template inside a hidden-on-screen
        container with id <code>tkx-template-print-region</code>. When the user clicks
        Download, inject a print stylesheet that hides everything else, then call
        <code>window.print()</code>. Browser's own Save-as-PDF does the rest.
      </p>

      <pre><code>{`@media print {
  body * { visibility: hidden !important; }
  #tkx-template-print-region,
  #tkx-template-print-region * { visibility: visible !important; }
  #tkx-template-print-region {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    transform: none !important;
  }
  @page { margin: 0; size: A4; }
}`}</code></pre>

      <p>
        On paper this is fine. <code>visibility: hidden</code> takes everything off-screen,
        the template region stays visible, the page paginates as the single A4 sheet we
        designed. In practice the print preview showed twenty pages.
      </p>

      <h2>Why visibility:hidden is the wrong tool</h2>

      <p>
        <code>visibility: hidden</code> hides an element <em>visually</em>, but the element
        still occupies layout space. The browser still computes its width, its height, its
        place in the document flow. The print engine paginates the entire document including
        the invisible-but-still-laid-out hidden DOM.
      </p>

      <p>
        Our app has a multi-tab generator UI: a long form panel, a 24-card grid for the
        template picker, a preview area, a row of zoom controls, the page chrome. All of that
        is hidden during print, but all of it still <em>occupies</em> nineteen pages of layout
        flow before our visible template region begins. The browser dutifully paginates twenty
        sheets.
      </p>

      <p>
        Switching to <code>display: none</code> would solve the layout-flow part. But touching
        every off-screen ancestor is fragile — modal portals, error boundaries, third-party
        widgets, dev-mode React error overlays. Any of them adds layout-flow space and our
        page count creeps back up.
      </p>

      <h2>The fix: print from an isolated context</h2>

      <p>
        The browser already has a perfect "isolated context" primitive — the iframe. Open a
        hidden iframe, write only the page node and the host's stylesheets, call
        <code>iframe.contentWindow.print()</code>. The browser paginates only what is in the
        iframe, which is one A4 page.
      </p>

      <pre><code>{`function triggerPrint() {
  const region = document.getElementById('tkx-template-print-region');
  const page = region?.querySelector('[data-tkx-template-page]');
  if (!page) return;

  // Snapshot every host <style> + <link> so the iframe gets the same fonts,
  // tokens, and CSS variables as the on-screen preview.
  const styles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]'),
  ).map((el) => el.outerHTML).join('\\n');

  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(\`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        \${styles}
        <style>
          html, body { margin: 0; padding: 0; background: #fff; }
          [data-tkx-template-page] {
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
          @page { margin: 0; size: A4; }
        </style>
      </head>
      <body>\${page.outerHTML}</body>
    </html>\`);
  doc.close();

  iframe.addEventListener('load', () => {
    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();
    iframe.contentWindow!.addEventListener('afterprint', cleanup);
    setTimeout(cleanup, 4000); // Safari fallback
  });

  function cleanup() {
    setTimeout(() => iframe.remove(), 500);
  }
}`}</code></pre>

      <h2>The interesting bits</h2>

      <h3>Snapshotting host styles</h3>
      <p>
        The host page has its own design tokens — CSS custom properties, font imports, the
        works. The iframe is a brand-new document; without those styles, our template
        renders in serif Times New Roman. We snapshot every <code>&lt;style&gt;</code> and
        <code>&lt;link rel="stylesheet"&gt;</code> from the host and inject them into the
        iframe so it inherits the full styling environment.
      </p>

      <h3>Resetting the on-screen preview transforms</h3>
      <p>
        Our preview area renders the template at <code>scale(0.7)</code> so it fits the
        viewport. The printed copy needs to be at <code>scale(1)</code> for the browser to
        compute the page as A4. The iframe's <code>{'<style>'}</code> block resets
        <code>transform: none !important</code> on the page node to undo whatever the screen
        preview did.
      </p>

      <h3>Cleanup and the Safari quirk</h3>
      <p>
        Most browsers fire <code>afterprint</code> on the iframe's window when the print
        dialog closes. Safari sometimes doesn't. We register the event handler for the happy
        path and a 4-second backstop <code>setTimeout</code> so the iframe is always cleaned
        up even when Safari pretends nothing happened.
      </p>

      <h2>What this buys us</h2>

      <ul>
        <li><strong>Always one page.</strong> The iframe contains exactly the A4 page — pagination is deterministic.</li>
        <li><strong>No coordination with the host's CSS.</strong> The page can have any number of modals, popovers, error overlays, third-party widgets — the print fires from a fresh document.</li>
        <li><strong>Crisp selectable text.</strong> Browser's native Save-as-PDF rasterizes vectors, so emoji glyphs, custom fonts, and SVG arrows print at native resolution.</li>
        <li><strong>Embedded images work.</strong> Uploaded photos and custom religious logos are <code>data:</code> URIs by the time they hit the template, so they survive the iframe transplant without a fetch round-trip.</li>
        <li><strong>No extra dependencies.</strong> No Puppeteer, no html2canvas, no jsPDF.</li>
      </ul>

      <h2>What it doesn't give you</h2>

      <p>
        Browser-print won't help if you need to render a PDF on a server with no DOM. For that
        we ship <code>tekivex-pdf</code>, a separate package that produces PDFs from a React
        tree without a headless browser. The browser-print path is for the case where the user
        is the rendering target — resumes, biodatas, certificates, receipts.
      </p>

      <h2>The lesson</h2>

      <p>
        When pagination misbehaves, the instinct is to reach for more print-CSS. That's
        usually wrong. Print pagination is determined by layout flow, and layout flow is
        determined by the document tree. If you can't control the document tree (and in a
        large React app, you can't), put the printable thing in its own document.
      </p>

      <p>
        Sixty lines of JavaScript later, our resume builder produces one A4 page. Tests cover
        the iframe creation path. User report acknowledged, fix shipped, moving on to the
        next bug.
      </p>
    </>
  );
}
