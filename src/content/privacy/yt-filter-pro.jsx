export default function YtFilterProPrivacyContent() {
  return (
    <>
      <section>
        <p>
          <strong>YouTube Filter Pro</strong> (“the Extension”) is provided by Coded Citadel.
        </p>
        <p>
          This policy explains what we <strong>may</strong> collect, and — just as important — what
          we <strong>never</strong> collect. We do not sell data. We do not build advertising
          profiles.
        </p>
      </section>

      <section>
        <h2>The short version</h2>
        <p>The Extension runs in your browser on YouTube. Filtering happens on your device.</p>
        <ul>
          <li>
            We <strong>may</strong> store an <strong>anonymous install ID</strong> (a random number,
            not your name, email, or Google account).
          </li>
          <li>
            We <strong>may</strong> collect <strong>anonymous usage</strong> such as which{' '}
            <em>types</em> of filters you use (for example “duration” or “views/day”), so we can
            improve the product.
          </li>
          <li>
            We <strong>never</strong> collect search terms, video titles, watch history, passwords, or
            other sensitive or personal content.
          </li>
        </ul>
        <div className="CC__privacy__callout">
          <p>
            <strong>We never collect:</strong>
          </p>
          <ul>
            <li>YouTube search terms or search queries</li>
            <li>Keywords you type into filters</li>
            <li>Video titles, descriptions, comments, or thumbnails</li>
            <li>Watch history, playlists, or “liked” videos</li>
            <li>Your YouTube / Google account, passwords, or cookies used to sign you in</li>
            <li>Location, contacts, payment details, or other sensitive personal data</li>
            <li>
              Anything from pages that are not YouTube (the Extension only runs on youtube.com)
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>1. Anonymous install ID (optional / may)</h2>
        <p>
          We <strong>may</strong> create a random identifier on your computer (Chrome storage). It is
          not your name, email, IP-as-identity, or YouTube account. We use it only to group
          anonymous usage and feedback (for example “this install reported a bug”) and, if you
          uninstall, to know that an anonymous install was removed. You can delete it by
          uninstalling the Extension.
        </p>
      </section>

      <section>
        <h2>2. Anonymous usage (optional / may)</h2>
        <p>
          We <strong>may</strong> collect high-level, anonymous product usage, such as:
        </p>
        <ul>
          <li>
            Which filter <em>categories</em> were on (duration, views, views/day, subscribers — not
            the numbers or words you entered)
          </li>
          <li>Sort / fetch settings, result counts, and whether you exported (format only)</li>
          <li>Whether the tutorial was started or finished</li>
        </ul>
        <p>This is aggregate product telemetry. It cannot tell us what you searched for on YouTube.</p>
      </section>

      <section>
        <h2>3. What stays on your device</h2>
        <p>
          Your filter presets, settings, and cached extra stats stay in Chrome storage on your
          computer. They are used locally to run filters. They are not uploaded as search content.
        </p>
      </section>

      <section>
        <h2>4. Feedback you choose to send</h2>
        <p>
          If you open “Report a bug” or send feedback, we store what <strong>you choose to type</strong>{' '}
          (message and optional email). A bug report <strong>may</strong> include a snapshot of the
          current filter settings and page URL so we can reproduce the issue. Do not include
          passwords or private data in that form. If you never send feedback, we never receive that
          content.
        </p>
      </section>

      <section>
        <h2>5. YouTube and other sites</h2>
        <p>
          YouTube is operated by Google; their terms and privacy policy apply to your use of YouTube.
          We may load country flags from a public CDN and store anonymous analytics/feedback with our
          database host (Supabase). Optional links (coffee, social) only load if you click them.
        </p>
      </section>

      <section>
        <h2>6. Why we may collect anonymous data</h2>
        <p>
          Only to operate and improve the Extension (which filters people use, crash/bug context,
          install vs uninstall). We do not use this data for ads.
        </p>
      </section>

      <section>
        <h2>7. Retention and sharing</h2>
        <p>
          Anonymous usage and feedback are kept only as long as needed to improve the product. We do
          not sell your data. Infrastructure providers (hosting, database) process it solely to run
          the service. We may disclose information if required by law.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>
          The Extension is not directed at children under 13 (or the age required in your country).
        </p>
      </section>

      <section>
        <h2>9. Your choices</h2>
        <ul>
          <li>Uninstall the Extension at any time — local storage is removed with it.</li>
          <li>Do not send feedback if you do not want a message stored.</li>
          <li>YouTube itself remains under Google’s privacy policy.</li>
        </ul>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Coded Citadel —{' '}
          <a href="https://ezfycode.com" rel="noopener noreferrer" target="_blank">
            ezfycode.com
          </a>
          . You can also use the Extension’s feedback form.
        </p>
      </section>
    </>
  )
}
