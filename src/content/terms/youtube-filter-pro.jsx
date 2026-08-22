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
          The Extension helps you filter, sort, and export YouTube search results. It is provided
          free of charge. Optional donations are voluntary.
        </p>
      </section>

      <section>
        <h2>2. Not affiliated with YouTube</h2>
        <p>
          YouTube and related marks are trademarks of Google LLC. The Extension is an independent
          tool, not sponsored or endorsed by YouTube or Google. You must also follow YouTube’s Terms
          of Service.
        </p>
      </section>

      <section>
        <h2>3. License</h2>
        <p>
          We grant you a personal, non-exclusive license to install and use the Extension in Chrome
          for lawful searching. You may not use it to violate YouTube’s rules or applicable law.
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
            Do not rely on the Extension as the sole basis for legal, medical, financial, or safety
            decisions.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Availability</h2>
        <p>
          YouTube’s layout and APIs change. We do not guarantee uninterrupted service or complete
          results. We may update or discontinue the Extension at any time.
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
