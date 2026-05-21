export default function ClaudeDeepSearchPrivacyContent() {
  return (
    <>
      <section>
        <h2>Overview</h2>
        <p>
          Claude Deep Search (“the Extension”) is a Chrome extension that helps you search your own
          Claude.ai chat conversations. This policy explains what information the Extension accesses,
          how it is used, and your choices.
        </p>
        <p>
          The Extension is designed to work entirely on your device. We do not operate servers that
          receive, store, or process your conversation data.
        </p>
      </section>

      <section>
        <h2>Who we are</h2>
        <p>
          The Extension is published by the developer of Claude Deep Search. For privacy-related
          questions, contact us at{' '}
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>.
        </p>
      </section>

      <section>
        <h2>What information the Extension accesses</h2>
        <p>When you use claude.ai while signed in, the Extension may access:</p>
        <ul>
          <li>
            <strong>Chat conversations</strong> — titles, message text, and related metadata needed
            to build a local search index.
          </li>
          <li>
            <strong>Content from Claude’s website</strong> — data returned through Claude’s own APIs
            on claude.ai, using your existing browser session (the same access you already have when
            using Claude in the browser).
          </li>
          <li>
            <strong>Extension settings</strong> — for example, whether to re-index on page load and
            whether to index recent or all conversations.
          </li>
        </ul>
        <p>
          The Extension does not ask you to create an account with us, and it does not collect your
          name, email address, payment details, passwords, or other account credentials for Claude or
          any other service.
        </p>
      </section>

      <section>
        <h2>How we use information</h2>
        <p>We use the information described above only to:</p>
        <ul>
          <li>Build and update a local search index so you can find and open past conversations.</li>
          <li>Show search results and highlights within the Claude.ai interface.</li>
          <li>
            Remember your Extension preferences across Chrome sessions (when Chrome sync is enabled).
          </li>
        </ul>
        <p>
          We do not use your data for advertising, credit decisions, profiling, or any purpose
          unrelated to local search on Claude.ai.
        </p>
      </section>

      <section>
        <h2>Where information is stored</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Where it is stored</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Conversation index and search data</td>
              <td>
                Locally in your browser (IndexedDB and related storage associated with claude.ai)
              </td>
            </tr>
            <tr>
              <td>Indexing preferences</td>
              <td>
                Locally via Chrome’s storage API (<code>chrome.storage.sync</code>, if you use Chrome
                sync)
              </td>
            </tr>
            <tr>
              <td>Last index timestamp</td>
              <td>Locally in the browser’s storage on claude.ai</td>
            </tr>
          </tbody>
        </table>
        <p>
          Data stays on your device (and, for sync settings, within your Google Chrome profile via
          Google’s sync, if enabled). We do not transmit your conversations to our own servers.
        </p>
      </section>

      <section>
        <h2>Sharing with third parties</h2>
        <p>We do not sell, rent, or trade your personal information.</p>
        <p>
          We do not share your conversation content with third parties for marketing or unrelated
          purposes.
        </p>
        <p>
          The Extension communicates only with claude.ai (Anthropic’s website) using your active
          session, in the same way your browser does when you use Claude. We are not responsible for
          Anthropic’s privacy practices; please review Anthropic’s privacy policy for how Claude
          handles your data on their platform.
        </p>
      </section>

      <section>
        <h2>Permissions</h2>
        <ul>
          <li>
            <strong>storage</strong> — Saves your Extension settings (e.g. re-index options).
          </li>
          <li>
            <strong>https://claude.ai/* (host access)</strong> — Required to run on Claude.ai, call
            Claude’s APIs in your browser context, and inject the search UI. The Extension does not
            run on other websites.
          </li>
        </ul>
      </section>

      <section>
        <h2>Remote code</h2>
        <p>
          All Extension code is included in the package installed from the Chrome Web Store. The
          Extension does not load executable code from external servers.
        </p>
      </section>

      <section>
        <h2>Data retention and deletion</h2>
        <ul>
          <li>
            <strong>Uninstall the Extension</strong> — Removes Extension-specific settings from
            Chrome; indexed conversation data may remain in site storage until you clear it.
          </li>
          <li>
            <strong>Clear site data for claude.ai</strong> — Removes locally stored index data
            associated with that site.
          </li>
          <li>
            <strong>Disable or change indexing</strong> — Use the Extension popup settings or stop
            using the re-index options.
          </li>
        </ul>
        <p>
          You may contact us at{' '}
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a> if you have questions
          about deleting data.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          The Extension is not directed at children under 13 (or the minimum age in your
          jurisdiction). We do not knowingly collect personal information from children.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          No method of electronic storage is 100% secure. Because processing is local, security depends
          largely on your device, browser, and Claude account. Keep your device and Claude login
          secure.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The “Last updated” date at the top will change
          when we do. Continued use of the Extension after changes means you accept the updated
          policy.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct, or delete personal
          information. Because we do not hold your conversation data on our servers, most requests
          can be fulfilled by you locally (clearing site data or uninstalling the Extension). Contact{' '}
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a> for assistance.
        </p>
      </section>

      <section>
        <h2>Chrome Web Store disclosures</h2>
        <p>
          In line with our Chrome Web Store listing, the Extension may process website content and
          personal communications (your Claude chats) only on your device for search functionality. We
          do not use this data for unrelated purposes, do not sell it, and do not use it for
          creditworthiness or lending decisions.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Email: <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
        </p>
        <p>
          For questions about this privacy policy or Claude Deep Search, contact us at the address
          above.
        </p>
      </section>

      <p className="CC__privacy__end">End of Privacy Policy</p>
    </>
  )
}
