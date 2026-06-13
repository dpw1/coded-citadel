export default function GmailToPdfPrivacyContent() {
  return (
    <>
      <section>
        <p>
          This Privacy Policy explains how the Chrome extension{' '}
          <strong>Gmail to PDF: Save Emails as PDF, HTML, TXT</strong>
          (“the Extension,” “we,” “us”) handles information when you use it.
          The Extension is operated by Coded Citadel. If you have any questions,
          contact us at{' '}
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>.
        </p>
      </section>

      <section>
        <h2>1. Summary</h2>
        <p>
          The Extension helps you save your own Gmail messages as files on your computer
          (PDF, HTML, TXT, or JSON). It runs only on <strong>mail.google.com</strong>.
          We do not operate external servers for this Extension, we do not sell user data,
          and we do not use advertising or third-party analytics.
        </p>
      </section>

      <section>
        <h2>2. Information the Extension Accesses</h2>
        <p>
          When you use the Extension, it may access the following types of information{' '}
          <strong>only when you take action</strong> (for example, selecting emails and clicking export):
        </p>
        <ul>
          <li>
            <strong>Email content</strong> — subject, body, headers, inline images, and attachment metadata
            needed to create your export file.
          </li>
          <li>
            <strong>Attachments and images</strong> — if you enable optional ZIP downloads, the Extension
            fetches attachment or image files from Gmail in your browser session.
          </li>
          <li>
            <strong>Gmail page data</strong> — which emails you have selected in Gmail, so the Extension
            knows what to export.
          </li>
        </ul>
        <p>
          The Extension does <strong>not</strong> read your Gmail when you are not using it to export.
          It does not run on websites other than Gmail.
        </p>
      </section>

      <section>
        <h2>3. How We Use Information</h2>
        <p>Information accessed by the Extension is used only to:</p>
        <ul>
          <li>Export the emails you selected into the file format you chose.</li>
          <li>Save exported files to your computer through your browser’s download feature.</li>
          <li>Optionally bundle attachments or images into ZIP files, if you enable that setting.</li>
          <li>Remember your export settings and a local history of recent exports.</li>
        </ul>
        <p>
          We do not use your data for advertising, profiling, credit decisions, or any purpose
          unrelated to saving your Gmail messages as local files.
        </p>
      </section>

      <section>
        <h2>4. Where Data Is Stored</h2>
        <p>
          Data is processed and stored locally in your browser unless you choose to save an export file:
        </p>
        <ul>
          <li>
            <strong>Exported files</strong> — saved to your device (PDF, HTML, TXT, JSON, or ZIP)
            using the browser download feature. We do not receive copies of these files.
          </li>
          <li>
            <strong>Settings</strong> — stored with <code>chrome.storage.sync</code>.
            If you use Chrome Sync, Google may sync these settings across your signed-in devices
            according to Google’s own sync policies.
          </li>
          <li>
            <strong>Export history</strong> — stored locally with <code>chrome.storage.local</code>
            on your device. It keeps up to the last 100 exports and includes metadata such as
            format, subject line, timestamp, status, and email count — not the full email body.
            You can clear this history from the Extension popup.
          </li>
          <li>
            <strong>Temporary PDF processing</strong> — large HTML used for PDF rendering may be
            held briefly in local IndexedDB on your device and removed after the export completes.
          </li>
        </ul>
        <p>
          We do not transmit your email content to our servers. There are no Coded Citadel servers
          involved in the export process.
        </p>
      </section>

      <section>
        <h2>5. Network Requests</h2>
        <p>
          The Extension makes network requests only to <strong>https://mail.google.com</strong>
          (and related Google/Gmail resources required to load your emails, print view, attachments,
          and images). These requests use your existing Gmail login in the browser.
          No other third-party services receive your email data from the Extension.
        </p>
      </section>

      <section>
        <h2>6. Permissions</h2>
        <p>The Extension requests only the permissions needed for its single purpose:</p>
        <ul>
          <li>
            <strong>Host access (mail.google.com)</strong> — to work inside Gmail and fetch the emails
            you choose to export.
          </li>
          <li><strong>downloads</strong> — to save exported files to your computer.</li>
          <li><strong>storage</strong> — to save your settings and local export history.</li>
          <li><strong>offscreen</strong> — to render PDF exports locally in the browser.</li>
        </ul>
      </section>

      <section>
        <h2>7. Data Sharing</h2>
        <p>
          We do <strong>not</strong> sell, rent, or trade your personal information.
          We do <strong>not</strong> share your email content with third parties for marketing
          or analytics.
        </p>
        <p>
          Your exported files are yours. Once saved to your device, they are outside the Extension
          and subject to how you choose to store or share them.
        </p>
      </section>

      <section>
        <h2>8. Remote Code</h2>
        <p>
          The Extension does not load or execute remote JavaScript. All code and libraries are
          bundled inside the Extension package.
        </p>
      </section>

      <section>
        <h2>9. Children’s Privacy</h2>
        <p>
          The Extension is not directed at children under 13, and we do not knowingly collect
          personal information from children.
        </p>
      </section>

      <section>
        <h2>10. Your Choices</h2>
        <ul>
          <li>You choose which emails to export and which format to use.</li>
          <li>
            You can change or disable optional features (attachments ZIP, images ZIP, JSON options, etc.)
            in Settings.
          </li>
          <li>You can clear export history from the History tab in the Extension popup.</li>
          <li>
            You can uninstall the Extension at any time from <code>chrome://extensions</code>, which
            removes Extension data stored locally on that browser profile (subject to Chrome’s own
            storage behavior).
          </li>
        </ul>
      </section>

      <section>
        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the
          “Last updated” date at the top of this page. Continued use of the Extension after changes
          means you accept the updated policy.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          For privacy questions, feedback, or support, contact:
          <br />
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
        </p>
      </section>
    </>
  )
}
