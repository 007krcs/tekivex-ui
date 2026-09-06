import { PageShell } from './PageShell';
import { usePageMeta } from '../use-page-meta';
import { withBase } from '../base';

export const meta = {
  title: 'Terms of Service — TekiVex UI',
  description:
    'The terms that govern use of the www.tekivex.com/ui documentation site and the TekiVex UI open-source packages.',
};

export function Terms() {
  usePageMeta(meta.title, meta.description);
  return (
    <PageShell
      title="Terms of Service"
      eyebrow="Legal"
      subtitle="The rules of the road for using the TekiVex UI documentation site and the open-source packages."
      breadcrumbs={[{ label: 'Terms' }]}
      updated="2026-05-02"
    >
      <p>
        TekiVex UI is an open-source React component library distributed under the MIT license,
        and www.tekivex.com/ui is the documentation site for that project. These terms cover both.
        By using the site or the packages you agree to the terms below; if you don't agree,
        please don't use them.
      </p>

      <h2>1. The packages are MIT-licensed</h2>
      <p>
        Every package in the TekiVex UI family — <code>tekivex-ui</code>, <code>tekivex-3d</code>,
        <code>tekivex-pdf</code>, <code>tekivex-templates</code>, the resume / biodata template
        repos, and any future siblings — is released under the{' '}
        <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">
          MIT license
        </a>
        . That means you can use them in commercial products, modify them, redistribute them,
        sub-license them, and embed them in closed-source apps, provided you keep the original
        copyright notice in any substantial portion of the source you redistribute.
      </p>
      <p>
        The MIT license disclaims warranties — the software is provided "as is." We will do our
        best to fix bugs you report and to ship security patches promptly, but we make no
        guarantee of fitness for any particular purpose.
      </p>

      <h2>2. Acceptable use of the documentation site</h2>
      <p>The site is open to anyone. The following is not allowed:</p>
      <ul>
        <li>
          Automated scraping at a rate that imposes meaningful load on the CDN. Reasonable
          crawling for indexing is fine.
        </li>
        <li>
          Bypassing or interfering with the site's interactive demos in ways that could degrade
          the experience for other visitors.
        </li>
        <li>
          Using the site as part of a phishing campaign, clickjacking, or other deceptive
          practice.
        </li>
        <li>
          Embedding the site in an iframe on a page that misleads users about what they are
          looking at.
        </li>
      </ul>

      <h2>3. Issue reports + contributions</h2>
      <p>
        When you open an issue, propose a feature, or submit a pull request to one of the
        public repositories, you agree that the contribution is your own work or that you have
        the right to contribute it, and that it is licensed under the same MIT terms as the
        rest of the project. Please do not submit code or documentation lifted from a
        commercial product.
      </p>
      <p>
        Maintainers will review reports and PRs in good faith but cannot promise any particular
        response time. Feel free to nudge politely if a thread goes quiet for more than a week.
      </p>

      <h2>4. Trademarks</h2>
      <p>
        "TekiVex," "TekiVex UI," and the TekiVex wordmark are trademarks of the TekiVex UI
        contributors. The MIT license covers source code; it does <em>not</em> grant permission
        to use the marks for products other than the ones we ship. If you want to use the name
        in a way that could imply endorsement (a derivative product called "TekiVex Pro,"
        for instance), please reach out first.
      </p>

      <h2>5. Advertising</h2>
      <p>
        www.tekivex.com/ui may display advertising provided by Google AdSense. Ads are clearly
        labeled and rendered inside isolated iframes. We don't dictate which ads appear; that
        is determined by Google's auction. If a specific ad violates Google's policies you can
        report it directly via the small "i" icon on the ad itself.
      </p>

      <h2>6. Third-party links</h2>
      <p>
        The site links to GitHub, npm, MDN, three.js documentation, and similar external
        resources. We do not control those sites and are not responsible for their content,
        availability, or terms.
      </p>

      <h2>7. Disclaimer of warranties</h2>
      <p>
        The site, the packages, and any associated content are provided "as is" without
        warranty of any kind, express or implied — including but not limited to the implied
        warranties of merchantability, fitness for a particular purpose, and non-infringement.
        We do not warrant that the site will be uninterrupted or error-free.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, the TekiVex UI contributors will not
        be liable for any indirect, incidental, special, consequential, or punitive damages, or
        any loss of profits or revenues, arising out of or in connection with your use of the
        site or the packages — even if we have been advised of the possibility of such damages.
        Our total cumulative liability for direct damages will not exceed one hundred United
        States dollars ($100) per claimant.
      </p>

      <h2>9. Privacy</h2>
      <p>
        How information is handled is described in our <a href={withBase('/privacy')}>Privacy Policy</a>.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws of India, without regard to conflict of laws
        principles. The exclusive forum for any dispute is the courts located in Pune,
        Maharashtra. If you are a consumer in a jurisdiction whose law gives you mandatory
        protections that conflict with this section, those protections take precedence.
      </p>

      <h2>11. Changes</h2>
      <p>
        Material changes to these terms are announced on the home page for at least 30 days
        before they take effect. The "Last updated" date at the top reflects the most recent
        change. Continuing to use the site after a change takes effect counts as acceptance.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these terms: <a href="mailto:legal@tekivex.com">legal@tekivex.com</a>.
      </p>
    </PageShell>
  );
}
