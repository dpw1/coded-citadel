export default function ClaudeLimitMonitorPrivacyContent() {
  return (
    <>
      <section>
        <p>
          This Privacy Policy describes how <strong>Claude Limit Monitor</strong>
          (“the Extension,” “we,” “us”) handles information when you install and use
          our Chrome extension. The Extension is published by Coded Citadel and is
          intended for users who visit <strong>claude.ai</strong> while signed in.
        </p>
        <p>
          By installing or using the Extension, you agree to this Privacy Policy.
          If you do not agree, please uninstall the Extension.
        </p>
      </section>

      <section>
        <h2>1. Summary</h2>
        <ul>
          <li>
            The Extension has <strong>one purpose</strong>: to show your Claude.ai usage limits and reset
            timing on claude.ai, and optionally remind you when a limit resets.
          </li>
          <li>We <strong>do not sell</strong> your data.</li>
          <li>We <strong>do not run our own servers</strong> to collect or store your personal information.</li>
          <li>
            Your preferences are stored <strong>locally in Chrome</strong> on your device (and may sync via
            your Google account if you use Chrome sync).
          </li>
          <li>
            Usage information is read <strong>only from claude.ai</strong> while you use the site, using your
            existing Claude login session.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. What the Extension does</h2>
        <p>When you are on <strong>https://claude.ai</strong>, the Extension may:</p>
        <ul>
          <li>Display a usage bar showing session and/or weekly usage percentages and when limits reset.</li>
          <li>Let you choose where the bar appears (above the chat box, inside the chat box, or fixed on the right).</li>
          <li>Let you turn the on-page display on or off.</li>
          <li>
            If you enable it, schedule a <strong>local reminder</strong> and show a{' '}
            <strong>system notification</strong> when your limit reset time is reached.
          </li>
        </ul>
        <p>
          The Extension does <strong>not</strong> change how Claude generates replies,
          does not work on websites other than claude.ai, and does not inject ads.
        </p>
      </section>

      <section>
        <h2>3. Information we access</h2>

        <h2>3.1 Information from claude.ai (website content)</h2>
        <p>
          To provide usage information, the Extension reads data available to your
          browser while you are logged in to Claude.ai, such as:
        </p>
        <ul>
          <li>Usage percentages (for example, session and weekly limits).</li>
          <li>Reset timing (for example, when a limit will refresh).</li>
          <li>Related usage metadata returned by Claude’s own pages or APIs in your browser session.</li>
        </ul>
        <p>
          This data is used <strong>only</strong> to show you the usage display and
          to schedule reset reminders if you turn that feature on. We do not use it
          for advertising, credit decisions, or unrelated purposes.
        </p>
        <p>
          The Extension does <strong>not</strong> intentionally collect or store
          the full text of your chats, your password, or your payment details.
        </p>

        <h2>3.2 Information stored on your device (Chrome storage)</h2>
        <p>
          The Extension saves settings on your device using Chrome’s storage APIs, for example:
        </p>
        <ul>
          <li>Whether the usage bar is shown.</li>
          <li>Bar placement preference.</li>
          <li>Whether “notify when limit resets” is enabled.</li>
          <li>
            Locally stored reset alarm timing (derived from usage data) so reminders can work when the
            popup is closed.
          </li>
        </ul>
        <p>
          This information stays in your browser environment (and may sync across
          your devices if you use Chrome sync). We do not receive it on our servers.
        </p>

        <h2>3.3 Notifications</h2>
        <p>
          If you enable reset notifications (or use the test notification button),
          the Extension uses Chrome’s notification permission to show a{' '}
          <strong>system-level notification</strong> on your computer (for example,
          “Your claude limit has been reset.”). Notifications are controlled by your
          browser and operating system settings.
        </p>

        <h2>3.4 Alarms</h2>
        <p>
          If reset notifications are enabled, the Extension uses Chrome’s alarms
          permission to schedule a single local timer based on the reset time read
          from Claude. This allows reminders to fire even if you are on another tab
          or the extension popup is closed.
        </p>
      </section>

      <section>
        <h2>4. Permissions and why we need them</h2>
        <ul>
          <li><strong>storage</strong> — Save your preferences and local alarm timing on your device.</li>
          <li><strong>alarms</strong> — Schedule the reset reminder at the correct time.</li>
          <li><strong>notifications</strong> — Show reset reminders you opt into.</li>
          <li>
            <strong>Host access to https://claude.ai/*</strong> — Run only on Claude’s website to display
            usage information and read usage-related data in your session.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. What we do not collect</h2>
        <p>We do not intentionally collect:</p>
        <ul>
          <li>Your name, postal address, or government ID.</li>
          <li>Health or financial records.</li>
          <li>Passwords or payment card numbers through the Extension.</li>
          <li>Your browsing history on sites other than claude.ai.</li>
          <li>
            Keystroke logging, mouse tracking, or general “activity” monitoring outside what is needed to
            refresh usage on claude.ai.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Remote code</h2>
        <p>
          The Extension does <strong>not</strong> load or execute JavaScript from
          remote servers. All extension code is included in the extension package
          distributed through the Chrome Web Store.
        </p>
        <p>
          The popup may contain links you can open voluntarily (for example, a link
          to our YouTube channel or the Chrome Web Store reviews page). Those
          websites have their own privacy policies.
        </p>
      </section>

      <section>
        <h2>7. Sharing and sale of data</h2>
        <p>
          We <strong>do not sell</strong>, rent, or trade your personal information.
        </p>
        <p>
          We <strong>do not transfer</strong> your data to third parties for
          advertising, creditworthiness, or lending purposes.
        </p>
        <p>
          We do not send your usage data to our own backend servers as part of the
          Extension’s normal operation.
        </p>
        <p>
          Information may be processed by Google as part of Chrome, the Chrome Web
          Store, and Chrome sync, under Google’s policies.
        </p>
      </section>

      <section>
        <h2>8. Data retention</h2>
        <p>
          Preferences and alarm data remain in Chrome storage until you change them,
          clear extension data, or uninstall the Extension. Usage numbers shown on
          the page are refreshed from Claude while you use claude.ai and are not
          permanently archived by us on a server.
        </p>
      </section>

      <section>
        <h2>9. Children</h2>
        <p>
          The Extension is not directed at children under 13. We do not knowingly
          collect personal information from children.
        </p>
      </section>

      <section>
        <h2>10. Your choices</h2>
        <ul>
          <li>Turn the usage bar off in the Extension popup.</li>
          <li>Turn reset notifications off in the Extension popup.</li>
          <li>Disable notifications for Chrome or this Extension in your operating system or browser settings.</li>
          <li>
            Uninstall the Extension at any time from <code>chrome://extensions</code>.
          </li>
          <li>Clear the Extension’s stored data from Chrome’s extension settings.</li>
        </ul>
      </section>

      <section>
        <h2>11. Security</h2>
        <p>
          We design the Extension to process usage information locally in your
          browser. No security method is perfect; you are responsible for keeping
          your Claude account and device secure.
        </p>
      </section>

      <section>
        <h2>12. International users</h2>
        <p>
          If you use the Extension from outside your home country, your information
          may be processed on your device and by Google/Anthropic services you
          already use to access claude.ai, according to their terms and policies.
        </p>
      </section>

      <section>
        <h2>13. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The “Last updated”
          date at the top will change when we do. Continued use of the Extension after
          changes means you accept the updated policy.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>Questions about this Privacy Policy or the Extension:</p>
        <p>
          Email: <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
        </p>
      </section>
    </>
  )
}
