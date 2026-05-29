export default function SaveToDrivePrivacyContent() {
  return (
    <>
      <section>
        <h2>1. Introduction</h2>
        <p>
          Save Directly to Drive (“the Extension,” “we,” “us,” or “our”) is a Chrome browser extension
          that lets you save files from web pages directly to a folder in your Google Drive account.
        </p>
        <p>
          This Privacy Policy explains what information the Extension accesses, how it is used,
          where it is stored, and what choices you have. By installing or using the Extension,
          you agree to this policy.
        </p>
      </section>

      <section>
        <h2>2. Who We Are</h2>
        <p>The Extension is developed and operated by:</p>
        <ul>
          <li><strong>Developer:</strong> Coded Citadel</li>
          <li>
            <strong>Contact:</strong>{' '}
            <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
          </li>
          <li>
            <strong>Website:</strong>{' '}
            <a href="https://codedcitadel.com">https://codedcitadel.com</a>
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Summary</h2>
        <ul>
          <li>We do <strong>not</strong> sell your personal information.</li>
          <li>We do <strong>not</strong> use analytics, advertising, or third-party tracking services.</li>
          <li>Files you choose to save are uploaded to <strong>your own Google Drive</strong>.</li>
          <li>Most data stays on your device in Chrome local storage.</li>
          <li>Google receives data only when you sign in and use Google Drive or Google account services.</li>
        </ul>
      </section>

      <section>
        <h2>4. Information We Access and Use</h2>
        <p>The Extension only processes information needed to provide its core functionality.</p>

        <h2>4.1 Google Account Information</h2>
        <p>
          If you choose to connect your Google account, the Extension uses Chrome’s Identity API and
          Google OAuth to authenticate you. With your permission, we request these scopes:
        </p>
        <ul>
          <li><code>https://www.googleapis.com/auth/drive.file</code> — create and upload files to Google Drive</li>
          <li><code>https://www.googleapis.com/auth/userinfo.email</code> — display your email in the Extension</li>
          <li><code>https://www.googleapis.com/auth/userinfo.profile</code> — display your name in the Extension</li>
        </ul>
        <p>
          The <code>drive.file</code> scope is limited: the Extension can upload files it creates to your Drive,
          but it cannot browse, read, edit, or delete your existing Drive files outside that scope.
        </p>
        <p>We may access and store locally:</p>
        <ul>
          <li>Your Google account email address</li>
          <li>Your display name</li>
          <li>An OAuth access token used to communicate with Google APIs</li>
        </ul>

        <h2>4.2 Files and URLs You Choose to Save</h2>
        <p>
          When you save a file — for example via the context menu, popup, or on-page save dialog —
          the Extension may access:
        </p>
        <ul>
          <li>The file URL you selected</li>
          <li>The file name (including any name you choose in the rename dialog)</li>
          <li>The file content, which is downloaded temporarily so it can be uploaded to Google Drive</li>
        </ul>
        <p>
          File content is transmitted to Google Drive for storage in your account. We do not store
          uploaded file contents on our own servers because the Extension has no backend server.
        </p>

        <h2>4.3 Extension Settings and Activity History</h2>
        <p>The Extension stores the following locally in <code>chrome.storage.local</code> on your device:</p>
        <ul>
          <li>Your preferred Google Drive folder name</li>
          <li>Whether the rename dialog should appear before saving</li>
          <li>The Google Drive folder ID used for uploads</li>
          <li>
            A recent saves list (up to 50 entries), including file name, save date, Google Drive file ID,
            Drive view link, and source URL
          </li>
          <li>Sign-in status and related authentication data while connected</li>
        </ul>

        <h2>4.4 Browser Permissions</h2>
        <p>The Extension requests these Chrome permissions:</p>
        <ul>
          <li><strong>identity</strong> — sign in with Google</li>
          <li><strong>storage</strong> — save settings and recent saves locally</li>
          <li><strong>contextMenus</strong> — add a right-click “Save to Google Drive” option</li>
          <li><strong>activeTab</strong> — interact with the current tab when you initiate a save</li>
          <li><strong>notifications</strong> — show save success or error notifications</li>
          <li><strong>host access (&lt;all_urls&gt;)</strong> — detect and download file links from pages you visit when you choose to save them</li>
        </ul>
        <p>
          The Extension includes a content script on web pages so it can show save dialogs and status
          messages. It does not continuously collect browsing history. It only acts when you trigger a save.
        </p>
      </section>

      <section>
        <h2>5. How We Use Information</h2>
        <p>We use the information described above only to:</p>
        <ul>
          <li>Authenticate you with Google</li>
          <li>Upload files you request to your Google Drive folder</li>
          <li>Display your account info, settings, and recent saves in the Extension popup</li>
          <li>Remember your folder preference and rename setting</li>
          <li>Notify you about save results</li>
          <li>Diagnose errors locally through browser console logs (not sent to us)</li>
        </ul>
      </section>

      <section>
        <h2>6. What We Do Not Do</h2>
        <ul>
          <li>We do not sell, rent, or trade your personal information.</li>
          <li>We do not use analytics, advertising, or behavioral tracking tools.</li>
          <li>We do not operate a remote server that collects your data.</li>
          <li>We do not read or modify unrelated files in your Google Drive.</li>
        </ul>
      </section>

      <section>
        <h2>7. Third-Party Services</h2>
        <p>The Extension relies on services operated by third parties:</p>
        <ul>
          <li>
            <strong>Google Drive and Google Account APIs</strong> — used for authentication and file uploads.
            Google’s handling of your data is governed by{' '}
            <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
              Google’s Privacy Policy
            </a>.
          </li>
          <li>
            <strong>Google Fonts</strong> — the Extension popup may load fonts from Google servers.
            See{' '}
            <a href="https://developers.google.com/fonts/faq" rel="noopener noreferrer" target="_blank">
              Google Fonts FAQ
            </a>.
          </li>
          <li>
            <strong>Websites hosting files you save</strong> — when you save a file, the Extension downloads it
            from the source website you selected.
          </li>
        </ul>
        <p>We are not responsible for the privacy practices of third-party websites or services.</p>
      </section>

      <section>
        <h2>8. Data Storage and Retention</h2>
        <ul>
          <li>Settings, recent saves, and authentication data are stored locally in your browser.</li>
          <li>Uploaded files remain in your Google Drive account until you delete them.</li>
          <li>
            If you click <strong>Disconnect</strong>, the Extension removes your sign-in token, email,
            name, and cached folder ID from local storage. Settings and recent saves may remain until you
            clear extension data or uninstall the Extension.
          </li>
          <li>
            Uninstalling the Extension or clearing its site data in Chrome removes locally stored
            Extension data from your device.
          </li>
        </ul>
      </section>

      <section>
        <h2>9. Data Security</h2>
        <p>
          We take reasonable steps to protect information handled by the Extension. Authentication is
          handled through Google OAuth and Chrome’s Identity API. Communication with Google APIs uses HTTPS.
        </p>
        <p>
          No method of transmission or storage is completely secure. You are responsible for keeping
          your Google account secure.
        </p>
      </section>

      <section>
        <h2>10. Your Choices and Rights</h2>
        <p>You can:</p>
        <ul>
          <li>Decline to sign in — the Extension cannot upload files without Google authentication</li>
          <li>Disconnect your Google account at any time from the Extension popup</li>
          <li>Change your target folder name and rename preference in Settings</li>
          <li>Remove uploaded files directly in Google Drive</li>
          <li>Uninstall the Extension to stop all future data processing</li>
          <li>Clear Extension storage through Chrome’s extension settings</li>
        </ul>
        <p>
          Depending on where you live, you may have rights to access, correct, delete, or restrict
          processing of personal information. Because we do not operate a central database, most
          information is under your control in Chrome and Google Drive. Contact us using the details
          above for privacy-related requests.
        </p>
      </section>

      <section>
        <h2>11. Children’s Privacy</h2>
        <p>
          The Extension is not directed to children under 13 (or the minimum age required in your country),
          and we do not knowingly collect personal information from children.
        </p>
      </section>

      <section>
        <h2>12. International Users</h2>
        <p>
          If you use the Extension outside your home country, your information may be processed by
          Google in accordance with Google’s policies and infrastructure.
        </p>
      </section>

      <section>
        <h2>13. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the
          “Last updated” date at the top of this page. Continued use of the Extension after changes
          become effective constitutes acceptance of the updated policy.
        </p>
      </section>

      <section>
        <h2>14. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or how the Extension handles data, contact us at:
        </p>
        <p>
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
        </p>
      </section>

      <div className="CC__privacy__callout">
        <p>
          <strong>Chrome Web Store note:</strong> Google’s OAuth consent screen may display broad language
          such as “see, edit, create, and delete.” That wording is standard for apps using Google Drive
          scopes. This Extension uses the restricted <code>drive.file</code> scope and is intended only
          to upload files you explicitly choose to save.
        </p>
      </div>

      <p className="CC__privacy__end">&copy; 2026 Coded Citadel. All rights reserved.</p>
    </>
  )
}
