export default function YoutubeAiSummaryPrivacyContent() {
  return (
    <>
      <section>
        <p>
          This policy describes how the Chrome extension <strong>YouTube Quick AI Summary</strong>
          (“the Extension”) handles information. The Extension is made by Coded Citadel.
        </p>
      </section>

      <section>
        <h2>Summary</h2>
        <p>
          The Extension does <strong>not</strong> create an account, does <strong>not</strong> collect
          your name, email, or payment details, and does <strong>not</strong> send your data to a
          server we operate. Summaries and follow-up questions are requested through
          <strong> YouTube’s own AI (Gemini)</strong> while you are on YouTube, using your existing
          YouTube session. Settings and a short local cache stay in your browser.
        </p>
      </section>

      <section>
        <h2>Who this applies to</h2>
        <p>
          This policy covers the Extension when installed from the Chrome Web Store and used on{' '}
          <code>youtube.com</code> and <code>m.youtube.com</code>.
        </p>
      </section>

      <section>
        <h2>Permissions</h2>
        <ul>
          <li>
            <strong>storage</strong> — to save your preferences and a local cache of recent summaries
            on this device.
          </li>
          <li>
            <strong>youtube.com / m.youtube.com</strong> — to show the summarize button on video
            thumbnails, Shorts, and watch pages, and to request summaries through YouTube’s AI while
            you are signed in.
          </li>
        </ul>
        <p>
          The Extension does not request access to your browsing history, other websites, your
          microphone, or your camera.
        </p>
      </section>

      <section>
        <h2>Information stored on your device</h2>
        <p>The Extension may store the following locally with Chrome’s storage API:</p>
        <ul>
          <li>Your chosen summary language and first-response length (super short / short / complete).</li>
          <li>Whether to generate an automatic first summary when you click the button.</li>
          <li>A count of how many summaries you have generated (shown in the popup).</li>
          <li>
            Cached summary text, follow-up suggestions, and related session tokens for a video, keyed
            by YouTube video ID, so the same video does not need to be summarized again immediately.
            Cached entries expire after 7 days.
          </li>
        </ul>
        <p>
          This data stays on your computer unless you export a chat yourself (for example copy, CSV,
          JSON, or similar). Uninstalling the Extension removes this local data.
        </p>
      </section>

      <section>
        <h2>Information sent when you summarize or chat</h2>
        <p>
          When you ask for a summary or send a follow-up question, the Extension talks to YouTube’s
          AI on your behalf from the YouTube page. That request can include:
        </p>
        <ul>
          <li>The YouTube video ID you selected.</li>
          <li>Your prompt or question, including your language preference.</li>
          <li>Your existing YouTube sign-in session (the same session the YouTube website already uses).</li>
        </ul>
        <p>
          YouTube / Google may process video transcripts or other video context, your questions, and
          the AI reply under{' '}
          <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
            Google’s Privacy Policy
          </a>{' '}
          and YouTube’s terms. We do not receive a copy of those requests on our servers.
        </p>
        <p>
          You must be signed into YouTube, and YouTube’s AI must be available for that video.
          Availability is controlled by YouTube, not by us.
        </p>
      </section>

      <section>
        <h2>What we do not collect</h2>
        <ul>
          <li>We do not operate an analytics, advertising, or crash-reporting service in the Extension.</li>
          <li>We do not sell personal information.</li>
          <li>We do not require you to create an account with us.</li>
          <li>We do not upload your watch history or chat exports to our own backend.</li>
        </ul>
      </section>

      <section>
        <h2>Optional third-party links</h2>
        <p>
          The popup may link to{' '}
          <a href="https://buymeacoffee.com/CodedCitadel" rel="noopener noreferrer" target="_blank">
            Buy Me a Coffee
          </a>{' '}
          and to the Chrome Web Store reviews page. If you open those sites, their own privacy
          policies apply. We only learn about a donation if the payment provider shares it with us as
          the recipient.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          The Extension is not directed at children under 13. It is intended for people who already
          use YouTube under YouTube’s own age and account rules.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If this policy changes in a material way, we will update the effective date on this page.
          Continued use of the Extension after an update means you accept the revised policy.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy or the Extension: visit{' '}
          <a href="https://buymeacoffee.com/CodedCitadel" rel="noopener noreferrer" target="_blank">
            buymeacoffee.com/CodedCitadel
          </a>{' '}
          and send a message there.
        </p>
      </section>

      <p className="CC__privacy__end">
        YouTube is a trademark of Google LLC. This Extension is not affiliated with, endorsed by, or
        sponsored by YouTube or Google.
      </p>
    </>
  )
}
