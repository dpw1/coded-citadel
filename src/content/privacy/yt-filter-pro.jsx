export default function YtFilterProPrivacyContent() {
  return (
    <>
      <section>
        <h2>Overview</h2>
        <p>
          Youtube Filter Pro (“the extension”) is a Chrome browser extension that helps you filter
          YouTube search results. This policy explains what information the extension handles and how
          it is used.
        </p>
        <p>
          <strong>Summary:</strong> The extension does not collect, sell, or share your personal data
          with the developer. All filtering happens on your device. Only your filter settings are
          stored locally using Chrome’s built-in storage APIs.
        </p>
      </section>

      <section>
        <h2>Who operates this extension</h2>
        <p>
          This extension is provided by Coded Citadel (“we,” “us,” or “the developer”).
        </p>
        <p>
          Contact:{' '}
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
        </p>
      </section>

      <section>
        <h2>Information we do not collect</h2>
        <p>We do not collect, store on our servers, sell, or share:</p>
        <ul>
          <li>Your name, email address, or other personally identifiable information</li>
          <li>Your Google or YouTube account credentials</li>
          <li>Your search queries or browsing history sent to our servers</li>
          <li>Payment or financial information</li>
          <li>Location data (GPS, IP-based tracking, etc.)</li>
          <li>Analytics, advertising identifiers, or usage telemetry sent to the developer</li>
        </ul>
        <p>
          The extension has no backend servers operated by the developer and does not transmit your
          YouTube activity to us.
        </p>
      </section>

      <section>
        <h2>How the extension works on your device</h2>
        <p>
          When you use YouTube at{' '}
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
            https://www.youtube.com
          </a>
          , the extension runs scripts only on that site to:
        </p>
        <ul>
          <li>Show a Filters button and filter panel</li>
          <li>
            Read public metadata from videos on the search results page (for example: title, channel
            name, view count, duration, and relative publish date) that YouTube already displays
          </li>
          <li>Hide or fade search results that do not match your chosen filters</li>
        </ul>
        <p>
          This processing happens entirely in your browser. We do not receive copies of that
          metadata.
        </p>
      </section>

      <section>
        <h2>Data stored on your device (Chrome storage)</h2>
        <p>
          The extension uses Chrome’s storage permission to save your filter preferences (for
          example: duration range, view count limits, channel/title keywords, and related options)
          using:
        </p>
        <ul>
          <li>
            <strong>chrome.storage.sync</strong> — may sync across your signed-in Chrome devices if
            Chrome Sync is enabled
          </li>
          <li>
            <strong>chrome.storage.local</strong> — stored locally for extension options
          </li>
        </ul>
        <p>
          This data is managed by Google Chrome on your device (and optionally synced by Google). It
          is not sent to servers operated by the developer.
        </p>
      </section>

      <section>
        <h2>Permissions</h2>
        <ul>
          <li>
            <strong>storage</strong> — save and restore your filter settings
          </li>
          <li>
            <strong>Host access:</strong>{' '}
            <code>https://www.youtube.com/*</code> — inject the extension’s interface and apply
            filters on YouTube search results
          </li>
        </ul>
      </section>

      <section>
        <h2>Remote code</h2>
        <p>
          The extension does not load or execute JavaScript, WebAssembly, or other code from remote
          servers. All extension code is included in the package you install from the Chrome Web
          Store.
        </p>
      </section>

      <section>
        <h2>Third parties</h2>
        <p>
          YouTube is operated by Google. Your use of YouTube remains subject to Google’s Privacy
          Policy and YouTube’s terms. This extension is an independent product and is not affiliated
          with, endorsed by, or sponsored by Google or YouTube.
        </p>
        <p>
          The extension does not share your data with advertisers, analytics providers, or other
          third parties operated by the developer.
        </p>
      </section>

      <section>
        <h2>Children’s privacy</h2>
        <p>
          The extension is not directed to children under 13, and we do not knowingly collect
          personal information from children.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the “Last
          updated” date at the top of this page. Continued use of the extension after changes means
          you accept the updated policy.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          If you have questions about this Privacy Policy or Youtube Filter Pro, contact us at{' '}
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>.
        </p>
      </section>
    </>
  )
}
