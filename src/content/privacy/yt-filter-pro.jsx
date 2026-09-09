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
          profiles. Our goal is a small, practical tool that respects how you use YouTube.
        </p>
      </section>

      <section>
        <h2>The short version</h2>
        <p>
          The Extension runs in your browser on YouTube. Search and filtering stay on your device by
          default — calm, private, and under your control.
        </p>
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
            An optional Settings choice, <strong>Process mode → External</strong>, can ask our
            lightweight helper for <em>public</em> video/channel stats only (see section 5). Local
            mode stays the default.
          </li>
          <li>
            We <strong>never</strong> collect search terms, watch history, passwords, or other
            sensitive personal content to profile you.
          </li>
        </ul>
        <div className="CC__privacy__callout">
          <p>
            <strong>We never collect (for ads, profiling, or sale):</strong>
          </p>
          <ul>
            <li>YouTube search terms or search queries</li>
            <li>Keywords you type into filters</li>
            <li>Watch history, playlists, or “liked” videos as a dossier</li>
            <li>Your YouTube / Google sign-in cookies or passwords</li>
            <li>Location, contacts, payment card details, or other sensitive personal data</li>
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
          computer. They are used locally to run filters. They are not uploaded as a copy of your
          search history.
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
        <h2>5. Optional External enrichment (Process mode)</h2>
        <p>
          By default, extra stats (likes, comments, channel size, and similar) are loaded{' '}
          <strong>locally in your browser</strong> from YouTube — the same kind of public information
          you already see on the site.
        </p>
        <p>
          In Settings you can optionally choose <strong>Process mode → External (Cloudflare)</strong>.
          That mode is designed to be <strong>faster and lighter on your browser</strong> for the same
          public stats. When it is on:
        </p>
        <ul>
          <li>
            The Extension may send only <strong>public video or channel IDs</strong> (the short codes
            already in YouTube links) to our small helper running on{' '}
            <strong>Cloudflare Workers</strong>.
          </li>
          <li>
            The helper asks Google’s <strong>YouTube Data API</strong> for ordinary public stats
            (views, likes, comments, duration, publish time, subscriber counts, and similar) and
            returns them to your Extension so filters and the results panel can finish.
          </li>
          <li>
            We do <strong>not</strong> send your search query, filter keywords, Google login cookies,
            or account passwords on that path.
          </li>
          <li>
            Our API key for YouTube lives only on Cloudflare as a secret — it is not packed inside
            the Extension for others to extract.
          </li>
          <li>
            Responses may be held briefly in memory (about an hour) so the same public ID is not
            asked for repeatedly. This is for speed and quota — not to build a profile of you.
          </li>
          <li>
            If the helper is busy, rate-limited, or out of quota, the Extension simply falls back to
            the normal <strong>Local</strong> path in your browser. Search keeps working.
          </li>
        </ul>
        <p>
          You can switch back to <strong>Local</strong> anytime in Settings. Leaving External off
          means that helper is not used for enrichment.
        </p>
      </section>

      <section>
        <h2>6. YouTube, Cloudflare, and other providers</h2>
        <p>
          YouTube is operated by Google; their terms and privacy policy apply to your use of YouTube
          and, when External mode is on, to public stats fetched through the YouTube Data API.
        </p>
        <p>
          When you use External mode, Cloudflare hosts the enrichment helper. Standard web request
          metadata (such as IP address) may be processed by Cloudflare as with any website or
          Worker — solely to deliver the feature securely and reliably, not for advertising.
        </p>
        <p>
          We may load country flags from a public CDN and store anonymous analytics/feedback with our
          database host (Supabase). Optional links (coffee, social) only load if you click them. If
          you sign in for account or subscription features, that session is handled separately under
          those flows and is not required for basic search filtering.
        </p>
      </section>

      <section>
        <h2>7. Why we may collect anonymous data</h2>
        <p>
          Only to operate and improve the Extension (which filters people use, crash/bug context,
          install vs uninstall). We do not use this data for ads.
        </p>
      </section>

      <section>
        <h2>8. Retention and sharing</h2>
        <p>
          Anonymous usage and feedback are kept only as long as needed to improve the product.
          Enrichment helpers keep public ID stats only briefly (see section 5). We do not sell your
          data. Infrastructure providers (hosting, database, Cloudflare, Google’s API) process
          information solely to run the service. We may disclose information if required by law.
        </p>
      </section>

      <section>
        <h2>9. Children</h2>
        <p>
          The Extension is not directed at children under 13 (or the age required in your country).
        </p>
      </section>

      <section>
        <h2>10. Your choices</h2>
        <ul>
          <li>Uninstall the Extension at any time — local storage is removed with it.</li>
          <li>
            Keep <strong>Process mode → Local</strong> (default), or turn External off whenever you
            prefer everything to stay in-browser for enrichment.
          </li>
          <li>Do not send feedback if you do not want a message stored.</li>
          <li>YouTube itself remains under Google’s privacy policy.</li>
        </ul>
      </section>

      <section>
        <h2>11. Contact</h2>
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
