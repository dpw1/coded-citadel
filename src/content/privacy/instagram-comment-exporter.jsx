export default function InstagramCommentExporterPrivacyContent() {
  return (
    <>
      <section>
        <p>
          This Privacy Policy describes how the Chrome extension{' '}
          <strong>Instagram Comments Exporter</strong> (“Extension,” “we,” “us”) handles
          information when you use it. The Extension is published by Coded Citadel
          (“Developer”).
        </p>
      </section>

      <section>
        <h2>Single purpose</h2>
        <p>
          The Extension has one purpose: to help you extract and export public Instagram post
          and Reel comments (including nested replies) from pages you choose, and save or export
          that data on your device.
        </p>
      </section>

      <section>
        <h2>Summary</h2>
        <ul>
          <li>
            Extracted comment data is stored <strong>locally in your browser</strong>.
          </li>
          <li>
            We do <strong>not</strong> sell your data.
          </li>
          <li>
            We do <strong>not</strong> use your data for advertising or credit decisions.
          </li>
          <li>
            Feedback is sent only if <strong>you</strong> choose to submit it.
          </li>
        </ul>
      </section>

      <section>
        <h2>Information the Extension processes</h2>

        <h3>1. Instagram comment data (stored locally)</h3>
        <p>
          When you open an Instagram post or Reel and start an extraction, the Extension collects
          public comment information from that page, such as:
        </p>
        <ul>
          <li>Usernames and display names</li>
          <li>Comment text and media (e.g. GIF URLs when present)</li>
          <li>Like counts and timestamps</li>
          <li>Profile picture URLs and verified status</li>
          <li>Post identifiers (e.g. shortcode) and extraction progress</li>
        </ul>
        <p>
          This data is saved in <code>chrome.storage.local</code> on your device so you can pause,
          resume, view history, and export. It is not uploaded to our servers for storage or sync.
        </p>

        <h3>2. Extension settings (stored locally)</h3>
        <p>
          Your preferences (export format, visible columns, date format, rate-limit behavior, and
          similar settings) are stored locally in your browser.
        </p>

        <h3>3. Optional feedback (sent to our server)</h3>
        <p>
          If you use the <strong>Bugs &amp; Feedback</strong> tab and click{' '}
          <strong>Send feedback</strong>, we receive:
        </p>
        <ul>
          <li>Your message (required)</li>
          <li>Email address (optional, only if you enter one)</li>
          <li>App name</li>
          <li>
            A random anonymous visitor ID stored in the page’s local storage (used to reduce
            duplicate spam submissions)
          </li>
        </ul>
        <p>
          Feedback is transmitted to our database provider (Supabase) over HTTPS. We use it only to
          read and respond to user feedback and improve the Extension.
        </p>
      </section>

      <section>
        <h2>What we do not collect</h2>
        <ul>
          <li>Passwords or Instagram login credentials</li>
          <li>Your full browsing history across the web</li>
          <li>Health, financial, or payment information</li>
          <li>Location or GPS data</li>
          <li>
            Keystrokes, mouse movements, or general activity tracking outside the Extension’s own
            UI
          </li>
        </ul>
      </section>

      <section>
        <h2>How Instagram access works</h2>
        <p>
          The Extension runs only on Instagram post and Reel URLs. Comment fetching uses your
          existing Instagram browser session (cookies already present while you are logged in). We
          do not receive your Instagram password. You must be logged into Instagram for extraction
          to work.
        </p>
      </section>

      <section>
        <h2>Permissions and why they are used</h2>
        <ul>
          <li>
            <strong>storage / unlimitedStorage</strong> — Save settings, extraction jobs, comment
            cache, and history on your device.
          </li>
          <li>
            <strong>instagram.com</strong> — Inject the exporter UI and read public comment data
            from posts and Reels you open.
          </li>
          <li>
            <strong>Supabase host</strong> — Submit optional feedback when you choose to send it.
          </li>
        </ul>
      </section>

      <section>
        <h2>Third parties</h2>
        <ul>
          <li>
            <strong>Instagram / Meta</strong> — Source of public comment data you choose to extract
            while using instagram.com.
          </li>
          <li>
            <strong>Supabase</strong> — Hosts optional feedback submissions only.
          </li>
          <li>
            <strong>Google Fonts</strong> — The Extension may load the Inter font from Google Fonts
            for UI styling. No personal data is intentionally sent as part of that request beyond
            standard web font delivery.
          </li>
        </ul>
        <p>We do not sell or rent user data to third parties.</p>
      </section>

      <section>
        <h2>Data retention and deletion</h2>
        <p>
          Local extraction data and settings remain on your device until you clear them using the
          Extension’s storage controls, clear extension data in Chrome, or uninstall the Extension.
          Feedback you submit is retained as long as needed to operate support and improve the
          product.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          The Extension is not directed at children under 13, and we do not knowingly collect
          personal information from children.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          We use HTTPS for feedback transmission. Local data stays in your browser under Chrome’s
          extension storage model. No method of transmission or storage is 100% secure, but we take
          reasonable steps appropriate to the nature of the data handled.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li>Do not start extraction if you do not want comment data saved locally.</li>
          <li>Clear cached data from the Extension settings.</li>
          <li>Do not submit feedback if you do not want to send a message or email.</li>
          <li>Uninstall the Extension to remove locally stored extension data.</li>
        </ul>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The “Last updated” date at the top
          will reflect the latest version. Continued use of the Extension after changes means you
          accept the updated policy.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions, privacy requests, or bug reports:
          <br />
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
        </p>
      </section>

      <p className="CC__privacy__end">
        Instagram Comments Exporter · Chrome Web Store extension
      </p>
    </>
  )
}
