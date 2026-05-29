import { Link } from 'react-router-dom'

export default function SaveToDriveTermsContent() {
  return (
    <>
      <section>
        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms of Service (“Terms”) govern your access to and use of the
          <strong> Save Directly to Drive</strong> Chrome browser extension
          (“Extension,” “Service,” “we,” “us,” or “our”).
        </p>
        <p>
          By installing, accessing, or using the Extension, you agree to be bound by these Terms
          and our{' '}
          <Link to="/privacy-policy/save-to-drive-chrome-extension">Privacy Policy</Link>.
          If you do not agree, do not install or use the Extension.
        </p>
      </section>

      <section>
        <h2>2. Who We Are</h2>
        <p>The Extension is provided by:</p>
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
        <h2>3. Description of the Service</h2>
        <p>
          Save Directly to Drive lets you save files from web pages directly to a folder in your
          Google Drive account. Features may include:
        </p>
        <ul>
          <li>Signing in with your Google account</li>
          <li>Saving files via the Extension popup, context menu, or on-page save dialog</li>
          <li>Choosing a target Google Drive folder and optional rename-before-save behavior</li>
          <li>Viewing a local list of recent saves within the Extension</li>
        </ul>
        <p>
          The Extension operates primarily in your browser and communicates with Google services
          to authenticate you and upload files you choose to save. We do not operate a separate
          backend server that stores your files.
        </p>
      </section>

      <section>
        <h2>4. Eligibility</h2>
        <p>
          You must be old enough to use the Extension and Google services in your jurisdiction,
          and you must have the legal capacity to enter into these Terms. If you use the Extension
          on behalf of an organization, you represent that you have authority to bind that organization.
        </p>
      </section>

      <section>
        <h2>5. Google Account and Third-Party Services</h2>
        <p>
          Use of the Extension requires a Google account and your authorization through Google OAuth.
          Your use of Google Drive, Google Account, and related Google services is subject to
          Google’s own terms and policies, including{' '}
          <a href="https://policies.google.com/terms" rel="noopener noreferrer" target="_blank">
            Google Terms of Service
          </a>{' '}
          and{' '}
          <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
            Google Privacy Policy
          </a>.
        </p>
        <p>
          We are not responsible for Google’s services, availability, outages, account suspensions,
          storage limits, pricing, or policy enforcement.
        </p>
        <p>
          The Extension requests limited Google Drive access through the{' '}
          <code>drive.file</code> scope, which is intended to allow uploads of files created or
          opened by the Extension. Google’s consent screen may use broader wording; see our{' '}
          <Link to="/privacy-policy/save-to-drive-chrome-extension">Privacy Policy</Link> for clarification.
        </p>
      </section>

      <section>
        <h2>6. Your Responsibilities</h2>
        <p>You agree that you will:</p>
        <ul>
          <li>Use the Extension only for lawful purposes</li>
          <li>Save only files you have the legal right to access, copy, or store</li>
          <li>Comply with applicable copyright, privacy, and data protection laws</li>
          <li>Keep your Google account credentials secure</li>
          <li>Review files and links before saving them</li>
          <li>Ensure your use of Google Drive complies with Google’s policies and storage limits</li>
        </ul>
        <p>
          You are solely responsible for the content you choose to download and upload, including
          files obtained from third-party websites.
        </p>
      </section>

      <section>
        <h2>7. Acceptable Use</h2>
        <p>You may not use the Extension to:</p>
        <ul>
          <li>Violate any law or third-party rights</li>
          <li>Infringe copyrights, trademarks, or other intellectual property</li>
          <li>Upload malware, harmful code, or illegal content</li>
          <li>Attempt to reverse engineer, interfere with, or abuse the Extension or Google APIs</li>
          <li>Circumvent authentication, permissions, or security measures</li>
          <li>Use the Extension in a way that could harm us, Google, other users, or third parties</li>
        </ul>
        <p>
          We may suspend or terminate access to the Extension if we reasonably believe you have
          violated these Terms, although we have no obligation to monitor your use.
        </p>
      </section>

      <section>
        <h2>8. Files, Links, and Third-Party Websites</h2>
        <p>
          When you save a file, the Extension accesses the URL you selected and transfers the file
          to your Google Drive account. We do not control third-party websites, file hosts, or the
          accuracy, legality, or safety of content available on them.
        </p>
        <p>
          Any relationship you have with a third-party website is solely between you and that site.
          We are not responsible for losses resulting from content, links, downloads, or services
          provided by third parties.
        </p>
      </section>

      <section>
        <h2>9. No Ownership of Your Content</h2>
        <p>
          You retain ownership of the files you upload through the Extension, subject to your
          agreements with Google and any applicable law. We do not claim ownership over your files
          or Google Drive content.
        </p>
      </section>

      <section>
        <h2>10. Intellectual Property</h2>
        <p>
          The Extension, including its name, branding, code, design, and documentation, is owned
          by us or our licensors and is protected by applicable intellectual property laws.
        </p>
        <p>
          We grant you a personal, limited, non-exclusive, non-transferable, revocable license to
          install and use the Extension for its intended purpose, subject to these Terms.
        </p>
        <p>
          You may not copy, modify, distribute, sell, lease, or create derivative works of the
          Extension except as permitted by law or with our prior written consent.
        </p>
      </section>

      <section>
        <h2>11. Privacy</h2>
        <p>
          Our collection and use of information is described in our{' '}
          <Link to="/privacy-policy/save-to-drive-chrome-extension">Privacy Policy</Link>.
          By using the Extension, you acknowledge that policy.
        </p>
      </section>

      <section>
        <h2>12. Availability and Changes</h2>
        <p>
          We may update, modify, suspend, or discontinue the Extension or any part of it at any
          time, with or without notice. We do not guarantee uninterrupted or error-free operation.
        </p>
        <p>
          The Extension may depend on Chrome, Google APIs, and third-party websites that can change
          without notice. Features may vary by browser version, platform, or Google account type.
        </p>
      </section>

      <section>
        <h2>13. Disclaimers</h2>
        <p>
          THE EXTENSION IS PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTIES OF ANY KIND,
          WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        </p>
        <p>
          WE DO NOT WARRANT THAT THE EXTENSION WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR THAT
          FILES WILL UPLOAD SUCCESSFULLY, BE PRESERVED IN GOOGLE DRIVE, OR REMAIN ACCESSIBLE.
        </p>
        <p>
          You use the Extension at your own risk. You are responsible for maintaining backups and
          verifying that uploads completed successfully.
        </p>
      </section>

      <section>
        <h2>14. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR AFFILIATES, OFFICERS, EMPLOYEES,
          AGENTS, AND LICENSORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL,
          OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO
          USE THE EXTENSION.
        </p>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF
          OR RELATING TO THE EXTENSION OR THESE TERMS WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT
          YOU PAID US FOR THE EXTENSION IN THE TWELVE (12) MONTHS BEFORE THE CLAIM, OR (B) USD $50.
        </p>
        <p>
          Some jurisdictions do not allow certain limitations of liability, so some of the above
          limitations may not apply to you.
        </p>
      </section>

      <section>
        <h2>15. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless us and our affiliates, officers,
          employees, and agents from and against any claims, damages, losses, liabilities, costs,
          and expenses (including reasonable legal fees) arising out of or related to:
        </p>
        <ul>
          <li>Your use of the Extension</li>
          <li>Files or content you save, upload, or store</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any law or third-party rights</li>
        </ul>
      </section>

      <section>
        <h2>16. Termination</h2>
        <p>
          You may stop using the Extension at any time by disconnecting your Google account,
          clearing Extension data, or uninstalling it from Chrome.
        </p>
        <p>
          We may terminate or suspend your access to the Extension if you violate these Terms or
          if we discontinue the Service.
        </p>
        <p>
          Sections that by their nature should survive termination will survive, including
          intellectual property, disclaimers, limitation of liability, indemnification, and
          governing law.
        </p>
      </section>

      <section>
        <h2>17. Changes to These Terms</h2>
        <p>
          We may revise these Terms from time to time. When we do, we will update the
          “Last updated” date above. Your continued use of the Extension after changes become
          effective constitutes acceptance of the revised Terms.
        </p>
        <p>
          If you do not agree to the updated Terms, you must stop using and uninstall the Extension.
        </p>
      </section>

      <section>
        <h2>18. Governing Law and Disputes</h2>
        <p>
          These Terms are governed by the laws of the United States, without regard to
          conflict-of-law principles, except where mandatory consumer protection laws in your
          jurisdiction provide otherwise.
        </p>
        <p>
          Any dispute arising out of or relating to these Terms or the Extension will be resolved
          in the courts located in the United States having jurisdiction over the dispute, unless
          applicable law requires a different forum.
        </p>
      </section>

      <section>
        <h2>19. General</h2>
        <ul>
          <li>
            <strong>Entire agreement:</strong> These Terms and the Privacy Policy constitute the
            entire agreement between you and us regarding the Extension.
          </li>
          <li>
            <strong>Severability:</strong> If any provision is found unenforceable, the remaining
            provisions remain in effect.
          </li>
          <li>
            <strong>No waiver:</strong> Failure to enforce a provision is not a waiver of that provision.
          </li>
          <li>
            <strong>Assignment:</strong> You may not assign these Terms without our consent. We may
            assign these Terms in connection with a merger, acquisition, or sale of assets.
          </li>
          <li>
            <strong>Free service:</strong> If the Extension is offered at no charge, liability
            limitations and disclaimers apply to the fullest extent permitted by law.
          </li>
        </ul>
      </section>

      <section>
        <h2>20. Contact Us</h2>
        <p>If you have questions about these Terms, contact us at:</p>
        <p>
          <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>
        </p>
      </section>

      <p className="CC__privacy__end">&copy; 2026 Coded Citadel. All rights reserved.</p>
    </>
  )
}
