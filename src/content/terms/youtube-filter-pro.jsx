import { Link } from 'react-router-dom'

export default function YoutubeFilterProTermsContent() {
  return (
    <>
      <section>
        <p>
          These terms govern your use of the <strong>YouTube Filter Pro</strong> Chrome extension
          (“the Extension”) provided by Coded Citadel. By installing or using the Extension, you
          agree to these terms and the{' '}
          <Link to="/privacy-policy/youtube-filter-pro">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>1. The service</h2>
        <p>
          The Extension helps you filter, sort, and export YouTube search results. Core search and
          filtering run in your browser. Optional settings (including Process mode) may use small
          helpers we operate only to fetch the same kind of <strong>public</strong> stats already
          shown on YouTube — see the Privacy Policy for a plain-language description.
        </p>
        <p>
          Parts of the Extension may be free; optional paid plans or donations, if offered, are
          voluntary and described in the product.
        </p>
      </section>

      <section>
        <h2>2. Not affiliated with YouTube</h2>
        <p>
          YouTube and related marks are trademarks of Google LLC. The Extension is an independent
          tool, not sponsored or endorsed by YouTube or Google. You must also follow YouTube’s Terms
          of Service and Google’s API terms when features use public YouTube data.
        </p>
      </section>

      <section>
        <h2>3. License</h2>
        <p>
          We grant you a personal, non-exclusive license to install and use the Extension in Chrome
          for lawful searching. You may not use it to violate YouTube’s rules or applicable law, or
          to abuse, overload, or circumvent limits on YouTube or our helpers.
        </p>
      </section>

      <section>
        <h2>4. Your responsibilities</h2>
        <ul>
          <li>
            Filter results depend on YouTube’s public data; counts (including views/day) can be
            estimates and may be incomplete.
          </li>
          <li>
            Optional External enrichment requests public video/channel identifiers only to retrieve
            public stats. Use the Extension reasonably — do not attempt to scrape or harvest data at
            a scale that harms YouTube, Google’s APIs, or our service.
          </li>
          <li>
            Do not rely on the Extension as the sole basis for legal, medical, financial, or safety
            decisions.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Availability</h2>
        <p>
          YouTube’s layout and APIs change. Helpers we operate may rate-limit, pause, or fall back
          to in-browser loading so your search can continue. We do not guarantee uninterrupted
          service or complete results. We may update or discontinue the Extension at any time.
        </p>
      </section>

      <section>
        <h2>6. Feedback</h2>
        <p>
          If you send feedback or a bug report, you allow us to use that content to improve the
          product. Bug reports may include your current search URL and filter settings.
        </p>
      </section>

      <section>
        <h2>7. Disclaimer</h2>
        <p>
          THE EXTENSION IS PROVIDED “AS IS” WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
        </p>
      </section>

      <section>
        <h2>8. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Coded Citadel is not liable for indirect,
          incidental, or consequential damages arising from your use of the Extension.
        </p>
      </section>

      <section>
        <h2>9. Changes</h2>
        <p>
          We may update these terms. Continued use after an update means you accept the new terms.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Coded Citadel —{' '}
          <a href="https://ezfycode.com" rel="noopener noreferrer" target="_blank">
            ezfycode.com
          </a>
          .
        </p>
      </section>
    </>
  )
}
