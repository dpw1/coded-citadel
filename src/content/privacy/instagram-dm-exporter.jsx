export default function InstagramDmExporterPrivacyContent() {
  return (
    <>
      <section>
        <p>
          This privacy policy describes how the <strong>Instagram DM Exporter</strong> Chrome extension
          (“the Extension”) handles information when you use it. The Extension is provided to help you
          export direct message conversations from Instagram’s website while you are logged in.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <div className="CC__privacy__callout">
          <p>
            If you have questions about this policy or the Extension, contact:
            <br />
            <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
          </p>
        </div>
      </section>

      <section>
        <h2>Single purpose</h2>
        <p>
          The Extension has a single, narrow purpose: to let you save a copy of an Instagram direct message
          thread you are viewing on <strong>instagram.com</strong> as a file (for example TXT, HTML, or JSON),
          using controls added to the page and optional settings in the extension popup.
        </p>
      </section>

      <section>
        <h2>What data the Extension accesses</h2>
        <p>
          The Extension runs only on <strong>https://www.instagram.com/</strong>. When you choose to export,
          it uses your existing Instagram web session in the browser to request message data needed to build
          the file you asked to download. That processing happens on your device as part of generating the export.
        </p>
        <p>
          The Extension uses Chrome’s <strong>storage</strong> APIs to save your preferences (such as default export
          format and display options) and to coordinate basic UI state between the Instagram tab and the popup.
          This data is stored locally by Chrome for the Extension; it is not sent to our servers.
        </p>
      </section>

      <section>
        <h2>What we do not do</h2>
        <ul>
          <li>
            We do <strong>not</strong> operate a backend service that receives your DMs, exports, or browsing history
            from the Extension.
          </li>
          <li>We do <strong>not</strong> sell or rent your personal information.</li>
          <li>We do <strong>not</strong> use your data for advertising, credit scoring, or lending.</li>
          <li>
            We do <strong>not</strong> load or execute remote code for the Extension’s logic; the Extension’s packaged
            code runs locally in your browser.
          </li>
        </ul>
      </section>

      <section>
        <h2>Third parties</h2>
        <p>
          Instagram (Meta) provides the website and messaging service. Their own terms and privacy policies apply
          to your use of Instagram. The Extension does not replace or override those terms.
        </p>
      </section>

      <section>
        <h2>Children’s privacy</h2>
        <p>
          The Extension is not directed at children under 13, and we do not knowingly collect personal information
          from children through the Extension.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update this policy from time to time. The “Last updated” date at the top will change when we do.
          Continued use of the Extension after changes means you accept the updated policy.
        </p>
      </section>

      <section>
        <h2>Disclaimer</h2>
        <p>
          You are responsible for using the Extension in compliance with Instagram’s terms of service and
          applicable laws. Only export conversations you are permitted to access and store.
        </p>
      </section>
    </>
  )
}
