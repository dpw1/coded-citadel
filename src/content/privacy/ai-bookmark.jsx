export default function AiBookmarkPrivacyContent() {
  return (
    <>
      <section className="CC__privacy__callout">
        <p>
          AI Bookmark helps you save specific AI replies from Claude, ChatGPT, and Grok and manage them
          in one place. This policy explains what information the extension collects, how it is used,
          and your choices.
        </p>
      </section>

      <section>
        <h2>1. Who we are</h2>
        <p>
          AI Bookmark is a Chrome extension published by the developer of this extension (“we”, “us”,
          or “our”). If you have questions about this policy, contact us at:{' '}
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>.
        </p>
      </section>

      <section>
        <h2>2. What the extension does</h2>
        <p>
          When you click the bookmark button on a supported AI chat site, the extension saves that
          reply — along with the related prompt — to your personal library. You can search, tag, add
          notes, and reopen the original conversation at that exact reply.
        </p>
        <p>The extension only runs on:</p>
        <ul>
          <li>
            <a href="https://claude.ai">claude.ai</a>
          </li>
          <li>
            <a href="https://chatgpt.com">chatgpt.com</a>
          </li>
          <li>
            <a href="https://grok.com">grok.com</a> and{' '}
            <a href="https://www.grok.com">www.grok.com</a>
          </li>
        </ul>
        <p>
          It does not run on other websites and does not collect your general browsing history.
        </p>
      </section>

      <section>
        <h2>3. Information we collect</h2>
        <p>We collect information only when needed to provide the extension’s features.</p>

        <h2>3.1 Account information</h2>
        <p>When you sign in with Google, we receive:</p>
        <ul>
          <li>Your Google account email address</li>
          <li>Authentication tokens needed to keep you signed in</li>
          <li>A user identifier used to associate bookmarks with your account</li>
        </ul>
        <p>
          We do not receive or store your Google password. Sign-in is handled through Chrome’s identity
          API and Google OAuth.
        </p>

        <h2>3.2 Bookmark data you choose to save</h2>
        <p>When you explicitly bookmark a reply, we store:</p>
        <ul>
          <li>The prompt and AI reply text you selected</li>
          <li>Any images included in that saved exchange, if present</li>
          <li>The conversation title and URL</li>
          <li>Scroll position data used to return you to the same reply</li>
          <li>Tags and notes you add in the bookmark manager</li>
          <li>The platform name (Claude, ChatGPT, or Grok)</li>
          <li>Creation and update timestamps</li>
        </ul>
        <p>We do not save chat content unless you click to bookmark it.</p>

        <h2>3.3 Optional feedback</h2>
        <p>If you use the in-app feedback form, we may collect:</p>
        <ul>
          <li>Your feedback message</li>
          <li>An optional email address, if you choose to provide one</li>
          <li>A random local identifier used only to reduce duplicate submissions</li>
          <li>The extension name (“AI Bookmark”)</li>
        </ul>

        <h2>3.4 Local device storage</h2>
        <p>
          The extension stores some data locally in Chrome using the <code>chrome.storage</code> API,
          including:
        </p>
        <ul>
          <li>Your sign-in session</li>
          <li>Your light/dark theme preference</li>
          <li>A small cache of recent bookmarks for faster popup loading</li>
        </ul>
      </section>

      <section>
        <h2>4. What we do not collect</h2>
        <ul>
          <li>Your full web browsing history</li>
          <li>Health, financial, or payment information</li>
          <li>Your location or GPS data</li>
          <li>Keystrokes, mouse movement, scroll behavior, or other activity monitoring</li>
          <li>Advertising identifiers or analytics tracking data</li>
          <li>Passwords or Google account credentials</li>
        </ul>
      </section>

      <section>
        <h2>5. How we use your information</h2>
        <p>We use collected information only to:</p>
        <ul>
          <li>Authenticate you and keep you signed in</li>
          <li>Save, sync, display, update, and delete your bookmarks</li>
          <li>Reopen saved conversations and scroll to the correct reply</li>
          <li>Remember your UI preferences</li>
          <li>Receive and review optional user feedback</li>
          <li>Operate, maintain, and improve the extension</li>
        </ul>
        <p>
          We do not sell your data. We do not use your data for advertising, credit decisions, or
          unrelated profiling.
        </p>
      </section>

      <section>
        <h2>6. Where data is stored and processed</h2>
        <p>
          Bookmark data and account-linked information are stored in a secure Supabase database. Access
          is restricted so each user can only access their own bookmarks.
        </p>
        <p>
          Authentication is handled through Google Sign-In. Optional feedback may also be stored in
          Supabase.
        </p>
        <p>Some data is stored locally on your device through Chrome extension storage.</p>
      </section>

      <section>
        <h2>7. Third-party services</h2>
        <p>The extension uses these third-party services:</p>
        <ul>
          <li>
            <strong>Google Sign-In</strong> — for authentication. Google’s privacy policy applies to
            sign-in:{' '}
            <a href="https://policies.google.com/privacy">https://policies.google.com/privacy</a>
          </li>
          <li>
            <strong>Supabase</strong> — for secure storage of bookmarks and optional feedback.{' '}
            <a href="https://supabase.com/privacy">https://supabase.com/privacy</a>
          </li>
          <li>
            <strong>Google Fonts</strong> — for UI typography in the popup and manager pages. Only
            font stylesheets are loaded; no remote JavaScript is executed from Google Fonts.{' '}
            <a href="https://developers.google.com/fonts/faq#what_does_using_the_google_fonts_api_mean_for_the_privacy_of_my_users">
              Google Fonts privacy information
            </a>
          </li>
        </ul>
        <p>
          We do not share your bookmark data with advertisers, data brokers, or other unrelated third
          parties.
        </p>
      </section>

      <section>
        <h2>8. Data retention</h2>
        <p>
          Your bookmarks remain stored until you delete them or delete your account access by signing
          out and requesting deletion. Authentication tokens remain on your device until you sign out
          or uninstall the extension. Optional feedback may be retained so we can review and improve
          the product.
        </p>
      </section>

      <section>
        <h2>9. Your choices and rights</h2>
        <p>You can:</p>
        <ul>
          <li>Choose not to sign in — bookmark saving requires sign-in</li>
          <li>Delete individual bookmarks from the bookmark manager</li>
          <li>Sign out at any time from the popup or manager</li>
          <li>Uninstall the extension, which removes local extension data from your browser</li>
          <li>Contact us to request deletion of account-linked data stored on our backend</li>
        </ul>
        <p>
          To make a privacy request, email{' '}
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>.
        </p>
      </section>

      <section>
        <h2>10. Security</h2>
        <p>
          We use industry-standard measures including authenticated access, encrypted connections
          (HTTPS), and database access controls that limit each user to their own data. No method of
          storage or transmission is 100% secure, but we work to protect your information
          appropriately.
        </p>
      </section>

      <section>
        <h2>11. Children’s privacy</h2>
        <p>
          AI Bookmark is not directed at children under 13, and we do not knowingly collect personal
          information from children under 13.
        </p>
      </section>

      <section>
        <h2>12. Changes to this policy</h2>
        <p>
          We may update this privacy policy from time to time. If we make material changes, we will
          update the effective date at the top of this page. Continued use of the extension after
          changes means you accept the updated policy.
        </p>
      </section>

      <section>
        <h2>13. Contact</h2>
        <p>For privacy questions, feedback, or data requests:</p>
        <p>
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
        </p>
      </section>

      <p className="CC__privacy__end">© 2026 AI Bookmark. All rights reserved.</p>
    </>
  )
}
