export default function DexPrivacyContent() {
  return (
    <>
      <section>
        <p>
          This Privacy Policy explains how <strong>DEX</strong> (“the Extension,” “we,” “us,” or “our”)
          handles information when you use our Chrome extension published by{' '}
          <strong>CodedCitadel</strong> (“the Developer”).
        </p>
        <p>
          DEX helps you export Discord messages and attachments from{' '}
          <a href="https://discord.com" rel="noopener noreferrer" target="_blank">
            discord.com
          </a>{' '}
          while you are logged in. We designed the Extension so that your data stays on your device unless
          you choose to save an export file or open an external link.
        </p>
      </section>

      <section>
        <h2>1. Summary</h2>
        <ul>
          <li>
            We do <strong>not</strong> sell your data.
          </li>
          <li>
            We do <strong>not</strong> use your data for advertising.
          </li>
          <li>
            We do <strong>not</strong> run third-party analytics or tracking in the Extension.
          </li>
          <li>
            We do <strong>not</strong> receive your Discord messages, attachments, or account token on our
            servers.
          </li>
          <li>Exports and settings are processed locally in your browser.</li>
        </ul>
      </section>

      <section>
        <h2>2. Information the Extension Accesses</h2>
        <p>
          To provide export functionality, the Extension may access the following information{' '}
          <strong>only while you are using Discord in your browser</strong>:
        </p>
        <ul>
          <li>
            Discord messages, channel names, DM content, timestamps, usernames, reactions, embeds, and related
            metadata needed for export.
          </li>
          <li>Attachment URLs and files you choose to preview or download.</li>
          <li>
            Your Discord authorization token from your active browser session, used locally to call Discord’s
            API on your behalf.
          </li>
          <li>Basic Discord page context needed to detect channels, servers, and DMs you select.</li>
        </ul>
        <p>
          This information is used solely to let you browse, fetch, and export Discord content you request. It
          is not transmitted to the Developer’s servers.
        </p>
      </section>

      <section>
        <h2>3. Information Stored Locally on Your Device</h2>
        <p>The Extension stores some data locally in your browser, including:</p>
        <ul>
          <li>
            <strong>Extension settings</strong> such as default export format, fetch delay, file naming
            template, and UI preferences.
          </li>
          <li>
            <strong>Temporary export cache</strong> to avoid re-fetching messages during the same session.
          </li>
          <li>
            <strong>Usage counters</strong> such as how many exports you have completed, used only for
            in-extension features like rating prompts.
          </li>
        </ul>
        <p>
          Local storage may use Chrome extension storage APIs and IndexedDB. You can remove this data by
          uninstalling the Extension or resetting settings inside the Extension where available.
        </p>
      </section>

      <section>
        <h2>4. Files You Export or Download</h2>
        <p>
          When you click Export or download attachments, files are saved to your computer using Chrome’s
          download functionality. Those files remain under your control. We do not receive copies of exported
          files.
        </p>
      </section>

      <section>
        <h2>5. Permissions We Request</h2>
        <ul>
          <li>
            <strong>discord.com host access:</strong> required to inject the Extension UI and read/fetch Discord
            content you choose to export.
          </li>
          <li>
            <strong>storage:</strong> required to save your settings and temporary export cache locally.
          </li>
          <li>
            <strong>downloads:</strong> required to save export files and attachment downloads to your device.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Remote Code</h2>
        <p>
          The Extension does not load or execute remote JavaScript. All Extension code and assets are bundled
          inside the package installed from the Chrome Web Store.
        </p>
      </section>

      <section>
        <h2>7. External Links and Optional Actions</h2>
        <p>
          Some parts of the Extension may open external websites only when you choose to interact with them,
          such as:
        </p>
        <ul>
          <li>Opening the Chrome Web Store to leave a rating.</li>
          <li>Opening a Buy Me a Coffee support page.</li>
          <li>Opening a thank-you or uninstall page on codedcitadel.com after install or uninstall.</li>
        </ul>
        <p>
          Those websites are governed by their own privacy policies. We do not receive your Discord data
          through those links.
        </p>
      </section>

      <section>
        <h2>8. Data Sharing</h2>
        <p>
          We do not sell, rent, or trade user data. We do not share Discord content or personal information
          with third parties for marketing, analytics, creditworthiness, or lending purposes.
        </p>
        <p>
          Discord API requests are made directly between your browser and Discord’s services using your
          logged-in session, not through the Developer’s servers.
        </p>
      </section>

      <section>
        <h2>9. Data Retention</h2>
        <p>
          Data stored locally remains on your device until you clear it, reset Extension settings, or uninstall
          the Extension. We do not maintain a remote copy of your Discord exports or account data.
        </p>
      </section>

      <section>
        <h2>10. Children’s Privacy</h2>
        <p>
          The Extension is not directed to children under 13, and we do not knowingly collect personal
          information from children.
        </p>
      </section>

      <section>
        <h2>11. Security</h2>
        <p>
          We take reasonable steps to keep the Extension’s functionality local to your browser and limited to
          discord.com. No method of electronic storage is completely secure, but we do not operate servers
          that store your Discord exports.
        </p>
      </section>

      <section>
        <h2>12. Your Choices</h2>
        <ul>
          <li>You choose which channels, DMs, date ranges, and formats to export.</li>
          <li>You choose whether to download attachments or open external support/rating links.</li>
          <li>You can uninstall the Extension at any time to stop all Extension activity.</li>
        </ul>
      </section>

      <section>
        <h2>13. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If we do, we will revise the “Last updated”
          date above. Continued use of the Extension after changes means you accept the updated policy.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>If you have questions about this Privacy Policy or the Extension, contact:</p>
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
          <br />
          <strong>Developer:</strong> CodedCitadel
        </p>
      </section>
    </>
  )
}
