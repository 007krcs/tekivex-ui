import { PageShell } from './PageShell';
import { usePageMeta } from '../use-page-meta';

export const meta = {
  title: 'Privacy Policy — TekiVex UI',
  description:
    'How TekiVex UI collects, uses, and protects information about visitors to www.tekivex.com/ui and users of the open-source library.',
};

export function Privacy() {
  usePageMeta(meta.title, meta.description);
  return (
    <PageShell
      title="Privacy Policy"
      eyebrow="Legal"
      subtitle="How TekiVex UI handles information about visitors to www.tekivex.com/ui and developers using the open-source packages."
      breadcrumbs={[{ label: 'Privacy' }]}
      updated="2026-05-02"
    >
      <p>
        TekiVex UI is an open-source React component library distributed under the MIT license.
        This page explains what information www.tekivex.com/ui (the documentation site) and the
        published npm packages collect, why, and how it is handled. Plain language, no dark
        patterns.
      </p>

      <h2>What the documentation site collects</h2>
      <p>
        The site at <code>www.tekivex.com/ui</code> is a static React application served from a CDN. We
        intentionally avoid first-party tracking. The site itself does not set marketing cookies,
        does not fingerprint visitors, and does not run analytics scripts that build identity
        profiles.
      </p>
      <p>The site does receive the following information whenever a browser loads a page:</p>
      <ul>
        <li>
          <strong>Server access logs</strong> from our static hosting provider — the URL requested,
          the visitor's IP address, browser user-agent string, and the time of the request. These
          are kept for up to 30 days for operational purposes (debugging, abuse handling) and then
          rotated.
        </li>
        <li>
          <strong>Browser local storage</strong> for non-tracking preferences only — for example,
          if you toggle a theme or close an onboarding hint, that flag is stored on your device.
          The site never sends the contents of local storage to our servers.
        </li>
        <li>
          <strong>Embedded third-party assets</strong> — most pages load a small set of public
          static assets (font files, the site's own JavaScript bundle, three.js for the 3D
          demos). Those requests reach the CDN that hosts those assets and are subject to that
          CDN's own logging.
        </li>
      </ul>

      <h2>Advertising</h2>
      <p>
        The site may display advertising provided by Google AdSense. When ads are shown, Google
        and its partners may set cookies and use other identifiers to serve, render, and measure
        ads. This happens entirely inside the ad iframe and is governed by{' '}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          Google's privacy policy for partner sites
        </a>
        . You can opt out of personalized advertising through{' '}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
          Google Ads Settings
        </a>{' '}
        or by enabling Limit Ad Tracking on iOS / iPadOS. We do not share any first-party
        information with Google beyond what is automatically present in standard ad-request
        traffic (page URL, viewport size, language).
      </p>
      <p>
        Visitors in the European Economic Area, the United Kingdom, and Switzerland are presented
        with a Google-issued consent message before any non-essential ad-related cookies are
        stored on their device, in line with the IAB Transparency &amp; Consent Framework v2.
      </p>

      <h2>What the npm packages collect</h2>
      <p>
        The TekiVex UI packages (<code>tekivex-ui</code>, <code>tekivex-3d</code>, and our other
        packages) are libraries you install into your own application. They do not phone home,
        do not include telemetry, and do not require API keys to function. Whatever data your
        users enter into a TekiVex component lives in your own application's state — we do not
        receive it.
      </p>
      <p>
        Some optional components (for example, the AdSense documentation in this site, or
        third-party integrations like a Razorpay checkout helper) require the host application
        to load external SDKs. In every case the package documentation states which third
        parties are contacted and gives you a way to disable the integration.
      </p>

      <h2>Issue reports + GitHub</h2>
      <p>
        Bug reports and feature requests are filed on a public GitHub repository. When you open
        an issue or comment, GitHub stores your username, the contents of your post, and any
        attached files. That information is governed by{' '}
        <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer">
          GitHub's privacy statement
        </a>
        . We will never ask you to include passwords, API keys, or personally identifying
        information in a public issue — and if you do by accident, contact us and we will help
        delete the post.
      </p>

      <h2>Cookies, in detail</h2>
      <p>The site uses cookies (or equivalent local-storage flags) only for these purposes:</p>
      <table>
        <thead>
          <tr>
            <th>Cookie / key</th>
            <th>Purpose</th>
            <th>Lifetime</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>tk-theme</code></td>
            <td>Remember the dark/light theme toggle on this device</td>
            <td>1 year, local storage</td>
          </tr>
          <tr>
            <td><code>tk-immersive-hint-seen</code></td>
            <td>Hide the "drag to look" hint after first interaction</td>
            <td>Session, local storage</td>
          </tr>
          <tr>
            <td>Google ad cookies</td>
            <td>Set inside the ad iframe — not first-party</td>
            <td>Per Google policy</td>
          </tr>
        </tbody>
      </table>

      <h2>Data sharing and selling</h2>
      <p>
        We do not sell or rent any visitor information. The only third parties that receive any
        data are:
      </p>
      <ul>
        <li>
          <strong>The CDN that serves the site</strong> — receives standard request logs as
          described above.
        </li>
        <li>
          <strong>Google AdSense</strong> — only when ads are rendered, for the purpose of
          serving and measuring ads.
        </li>
        <li>
          <strong>GitHub</strong> — only if you choose to open an issue, in which case the data
          you post becomes public on the issue tracker.
        </li>
      </ul>

      <h2>Your rights</h2>
      <p>
        Because we do not run identifiers that connect a visitor across sessions, the volume of
        information about any one person is small. You still have the right to:
      </p>
      <ul>
        <li>
          Ask what information we hold that is associated with your IP address or your GitHub
          handle;
        </li>
        <li>
          Ask for that information to be deleted;
        </li>
        <li>
          Object to processing — in practice this means asking us to stop logging requests from
          your IP, which we will honor for as long as you continue to visit;
        </li>
        <li>
          Withdraw consent for advertising cookies if you previously accepted the consent
          dialog (re-open the dialog from the footer link).
        </li>
      </ul>
      <p>
        For any of those, email{' '}
        <a href="mailto:privacy@tekivex.com">privacy@tekivex.com</a>. We respond inside 7 days.
      </p>

      <h2>Children</h2>
      <p>
        The site is not directed at children under 13. We do not knowingly collect information
        about children. If you are a parent and believe your child has interacted with the site
        in a way that left identifiable information, contact us and we will delete it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        Material changes to this policy are announced on the home page for at least 30 days
        before they take effect. The "Last updated" date at the top reflects the most recent
        change. Earlier versions are kept in the public source repository's git history.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <a href="mailto:privacy@tekivex.com">privacy@tekivex.com</a>.
        Postal address available on request.
      </p>
    </PageShell>
  );
}
