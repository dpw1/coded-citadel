export default function BlueskyHideRepostPrivacyContent() {
  return (
    <>
      <section>
        <p>
          This Privacy Policy explains how the <strong>Hide Reposts for Bluesky</strong> Chrome extension
          (“the Extension,” “we,” “us”) handles information when you use it. The Extension is developed by{' '}
          <a href="https://www.youtube.com/@CodedCitadel" target="_blank" rel="noopener noreferrer">
            @CodedCitadel
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Summary</h2>
        <p>
          The Extension runs entirely in your browser. It does not operate its own servers and does not
          collect, sell, or share your personal data with us or with advertisers. Your settings are stored
          locally in Chrome (and may sync across your Chrome profile if you use Chrome Sync).
        </p>
      </section>

      <section>
        <h2>Where the Extension Runs</h2>
        <p>
          The Extension only activates on{' '}
          <a href="https://bsky.app" target="_blank" rel="noopener noreferrer">
            bsky.app
          </a>
          . It does not run on other websites.
        </p>
      </section>

      <section>
        <h2>Information the Extension Stores</h2>
        <p>
          To provide its features, the Extension stores the following data in{' '}
          <strong>Chrome storage on your device</strong>:
        </p>
        <ul>
          <li>
            <strong>Your preferences</strong> — whether hiding is enabled, and which followed accounts you
            have selected to filter.
          </li>
          <li>
            <strong>Your following list cache</strong> — account identifiers (DIDs), handles, display names,
            and avatar URLs, cached temporarily so the account picker loads faster.
          </li>
          <li>
            <strong>Usage statistics</strong> — a local count of how many reposts have been hidden, plus
            internal identifiers used to avoid double-counting. These stats never leave your device.
          </li>
        </ul>
        <p>
          Some preference data may be stored in <code>chrome.storage.sync</code> and synced across your
          Chrome browsers if you are signed into Chrome and have Sync enabled. Other data is stored in{' '}
          <code>chrome.storage.local</code> and stays on the device where the Extension is installed.
        </p>
      </section>

      <section>
        <h2>Information the Extension Reads (But Does Not Store on Our Servers)</h2>
        <p>When you open the account picker, the Extension may:</p>
        <ul>
          <li>
            Read your Bluesky session token from <strong>bsky.app’s own page storage</strong> (the same session
            you are already logged in with).
          </li>
          <li>
            Use that token to call <strong>Bluesky’s public API</strong> (
            <code>public.api.bsky.app</code>) to fetch your following list.
          </li>
          <li>Read and modify the Bluesky page DOM to hide reposts that match your settings.</li>
        </ul>
        <p>
          These requests go directly from your browser to Bluesky. We do not receive, log, or store your
          session token or following list on any server we operate.
        </p>
      </section>

      <section>
        <h2>What We Do Not Collect</h2>
        <ul>
          <li>We do not collect your name, email address, or Bluesky password.</li>
          <li>We do not collect your posts, messages, or browsing history outside of bsky.app.</li>
          <li>We do not use analytics, tracking pixels, or advertising networks.</li>
          <li>We do not sell or rent user data to third parties.</li>
        </ul>
      </section>

      <section>
        <h2>Third-Party Links</h2>
        <p>The Extension may display optional links that open in your browser when you click them, such as:</p>
        <ul>
          <li>The Chrome Web Store reviews page</li>
          <li>
            <a href="https://www.youtube.com/@CodedCitadel" target="_blank" rel="noopener noreferrer">
              YouTube (@CodedCitadel)
            </a>
          </li>
          <li>
            <a href="https://buymeacoffee.com/CodedCitadel" target="_blank" rel="noopener noreferrer">
              Buy Me a Coffee
            </a>
          </li>
        </ul>
        <p>
          Those sites have their own privacy policies. We do not control them and are not responsible for
          their practices.
        </p>
      </section>

      <section>
        <h2>Permissions Explained</h2>
        <ul>
          <li>
            <strong>storage</strong> — to save your settings and cached following list on your device.
          </li>
          <li>
            <strong>bsky.app</strong> — to add the sidebar button, filter your feed, and read your Bluesky
            session for the following list.
          </li>
          <li>
            <strong>public.api.bsky.app</strong> — to fetch your following list from Bluesky’s API using your
            existing session.
          </li>
        </ul>
      </section>

      <section>
        <h2>Data Retention and Deletion</h2>
        <p>
          All data the Extension stores remains on your device until you remove it. You can delete it at any
          time by uninstalling the Extension or clearing the Extension’s data in Chrome (
          <code>chrome://extensions</code> → Hide Reposts for Bluesky → Remove, or clear site/extension
          storage).
        </p>
      </section>

      <section>
        <h2>Children’s Privacy</h2>
        <p>
          The Extension is not directed at children under 13, and we do not knowingly collect personal
          information from children.
        </p>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The “Last updated” date at the top will reflect
          the most recent revision. Continued use of the Extension after changes are posted constitutes
          acceptance of the updated policy.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this Privacy Policy? Contact us via the support link on the{' '}
          <a href="https://chromewebstore.google.com" target="_blank" rel="noopener noreferrer">
            Chrome Web Store
          </a>{' '}
          listing for Hide Reposts for Bluesky, or through{' '}
          <a href="https://www.youtube.com/@CodedCitadel" target="_blank" rel="noopener noreferrer">
            @CodedCitadel on YouTube
          </a>
          .
        </p>
      </section>
    </>
  )
}
