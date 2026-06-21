export default function YoutubeKeywordPrivacyContent() {
  return (
    <>
      <section>
        <p>
          This Privacy Policy explains how the <strong>YouTube Keyword Alert</strong> Chrome extension
          (“Extension”, “we”, “us”, or “our”) handles information when you install and use it.
        </p>
        <p>
          By installing or using the Extension, you agree to this Privacy Policy. If you do not agree,
          please uninstall the Extension.
        </p>
      </section>

      <section>
        <h2>1. Overview</h2>
        <p>
          YouTube Keyword Alert helps you create keyword filters and get notified when new YouTube videos
          match those filters. The Extension is designed to keep your data on your device. We do not operate
          a backend server that collects or stores your personal data for this Extension.
        </p>
      </section>

      <section>
        <h2>2. Information the Extension Processes</h2>
        <p>The Extension may process the following types of information:</p>
        <ul>
          <li>
            <strong>Settings and filters you create</strong>, such as filter names, keywords, exclusion rules,
            duration limits, subscriber limits, polling interval and notification preferences.
          </li>
          <li>
            <strong>YouTube search results and related metadata</strong>, such as video titles, channel names,
            video URLs, thumbnails, view counts, publish times, duration and other public information returned
            by YouTube searches.
          </li>
          <li>
            <strong>Extension state stored locally</strong>, such as previously found videos, last check times,
            cached YouTube API configuration and optional UI preferences.
          </li>
        </ul>
        <p>
          The Extension does <strong>not</strong> ask you to create an account and does <strong>not</strong>
          intentionally collect your name, email address, postal address, phone number, payment information,
          passwords or general web browsing history outside of what is needed to search YouTube for your filters.
        </p>
      </section>

      <section>
        <h2>3. How We Use Information</h2>
        <p>Information processed by the Extension is used only to:</p>
        <ul>
          <li>Run keyword searches on YouTube based on your filters</li>
          <li>Store and display matching videos inside the Extension</li>
          <li>Schedule background checks using your chosen polling interval</li>
          <li>Send optional Chrome notifications or in-page alerts on YouTube when enabled</li>
          <li>Import or export your filters when you choose to do so</li>
          <li>Keep the Extension working correctly after browser restarts</li>
        </ul>
        <p>
          We do <strong>not</strong> use your data for advertising, creditworthiness decisions, lending,
          profiling or unrelated analytics.
        </p>
      </section>

      <section>
        <h2>4. Where Data Is Stored</h2>
        <p>
          Your filters, settings, search results and cached data are stored locally in your browser using
          Chrome extension storage and, in some cases, local browser storage for UI preferences.
        </p>
        <p>
          This data stays on your device unless you remove it by clearing extension data, uninstalling the
          Extension or using built-in features such as clearing stored results or replacing imported filters.
        </p>
      </section>

      <section>
        <h2>5. Data Sharing and Third Parties</h2>
        <p>
          We do <strong>not</strong> sell, rent or trade your data to third parties.
        </p>
        <p>
          The Extension communicates directly with <strong>YouTube</strong> (google.com / youtube.com) to
          perform searches and retrieve public video and channel metadata. Those requests may use your existing
          YouTube session in the browser where applicable. YouTube is operated by Google and is subject to
          Google’s own terms and privacy policies.
        </p>
        <p>
          The Extension may also open links you choose to click, such as YouTube video pages, channel pages,
          the extension dashboard or pages on codedcitadel.com.
        </p>
        <p>
          We do not transmit your filter data or stored results to Coded Citadel servers as part of normal
          Extension operation.
        </p>
      </section>

      <section>
        <h2>6. Permissions Used</h2>
        <p>The Extension requests only the permissions needed for its core purpose:</p>
        <ul>
          <li><strong>alarms</strong> – to schedule background filter checks</li>
          <li><strong>storage</strong> – to save filters, settings and results locally</li>
          <li><strong>notifications</strong> – to show optional system notifications</li>
          <li><strong>tabs</strong> – to open the dashboard, open links you click and show optional alerts on YouTube tabs</li>
          <li><strong>host access to youtube.com</strong> – to search YouTube and run the content script on YouTube pages only</li>
        </ul>
      </section>

      <section>
        <h2>7. Remote Code</h2>
        <p>
          The executable code for this Extension is included in the extension package. The Extension does not
          load or execute remote JavaScript for its core functionality.
        </p>
      </section>

      <section>
        <h2>8. Data Retention</h2>
        <p>
          Data remains on your device until you delete it or uninstall the Extension. You can remove stored
          results from within the Extension settings. Uninstalling the Extension removes locally stored
          extension data from your browser.
        </p>
      </section>

      <section>
        <h2>9. Children’s Privacy</h2>
        <p>
          The Extension is not directed to children under 13, and we do not knowingly collect personal
          information from children.
        </p>
      </section>

      <section>
        <h2>10. Your Choices</h2>
        <p>You can:</p>
        <ul>
          <li>Disable or delete individual filters</li>
          <li>Turn notification options on or off in Settings</li>
          <li>Clear stored results from within the Extension</li>
          <li>Export or import your filters as JSON files</li>
          <li>Uninstall the Extension at any time from Chrome</li>
        </ul>
      </section>

      <section>
        <h2>11. Security</h2>
        <p>
          We take reasonable steps to design the Extension so that your data remains local to your browser.
          No method of storage or transmission is completely secure, but we do not intentionally collect
          sensitive personal information through this Extension.
        </p>
      </section>

      <section>
        <h2>12. International Users</h2>
        <p>
          The Extension is used locally in your browser. If you use YouTube, your interaction with YouTube
          may involve data processing by Google according to your location and Google’s policies.
        </p>
      </section>

      <section>
        <h2>13. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the “Last updated”
          date at the top of this page. Continued use of the Extension after changes means you accept the
          updated policy.
        </p>
      </section>

      <section>
        <h2>14. Contact Us</h2>
        <p>
          If you have questions, feedback or privacy concerns about YouTube Keyword Alert, contact us at:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
          <br />
          <strong>Website:</strong> <a href="https://codedcitadel.com">https://codedcitadel.com</a>
        </p>
      </section>
    </>
  )
}
