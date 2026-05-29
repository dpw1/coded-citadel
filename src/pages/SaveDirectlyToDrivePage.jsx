import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import CyberCorners from '../components/CyberCorners'
import product from '../data/save-directly-to-drive.json'
import '../App.css'
import './ExtensionLandingPage.css'
import './SaveDirectlyToDrivePage.css'

const TRUST_BULLETS = [
  'Saves straight to your Google Drive',
  'You choose every file — nothing saves automatically',
  'Optional rename before upload',
  'Recent saves list in the extension popup',
  'Disconnect anytime',
  'Built for Chrome — lightweight popup, no clutter',
]

const WHAT_IT_DOES = [
  'Right-click a file link or image on almost any website and choose “Save to Google Drive”',
  'See a quick confirmation on the page while the file uploads',
  'Optionally rename the file before it’s saved (if you turn that on in Settings)',
  'Pick which folder in Google Drive receives your files (default name: Downloads)',
  'See your last saved files inside the extension’s “Recent” tab',
  'Open saved files in Google Drive with one click',
]

const SETUP_STEPS = [
  'Install Save Directly to Drive from the Chrome Web Store.',
  'Click the extension icon in your browser toolbar.',
  'Press “Connect Google Drive” and sign in with the Google account you want to use.',
  '(Optional) Open Settings and change the folder name or turn on “rename before save.”',
]

const SAVE_STEPS = [
  'Find a file on a page — for example a PDF report, a photo, or a downloadable document.',
  'Right-click the link or image.',
  'Choose “Save to Google Drive” from the menu.',
  'If you enabled rename-before-save, type the name you want and confirm.',
  'A small message appears on the page to let you know the upload is in progress, then when it’s finished.',
  'Click “View on Google Drive” in that message (or check the Recent tab in the extension) to open the file.',
]

const FEATURES = [
  {
    title: 'Right-click to save',
    body: 'Works on file links and images across the web. If you can right-click it, you can often save it to Drive.',
  },
  {
    title: 'Your folder, your choice',
    body: 'Files go into a Google Drive folder you name in Settings (for example “Downloads,” “Research,” or “Work PDFs”). The extension creates that folder in your Drive if it doesn’t exist yet.',
  },
  {
    title: 'Rename before upload',
    body: 'Turn on “Show rename box when saving files” in Settings if you want to choose the filename every time — handy for screenshots, generic names like “document.pdf,” or keeping projects organized.',
  },
  {
    title: 'Recent saves list',
    body: 'The extension remembers your last saves (up to 50) so you can quickly open them again from the popup without digging through Drive.',
  },
  {
    title: 'Clear status on the page',
    body: 'Small on-page messages tell you when a save started, succeeded, or failed — so you’re not left wondering whether it worked.',
  },
  {
    title: 'Sign in / sign out anytime',
    body: 'Connect with Google when you need the extension; disconnect from the popup when you want to remove access from this browser.',
  },
]

const FILE_TYPES = [
  'Documents: PDF, Word (.doc, .docx), plain text (.txt)',
  'Spreadsheets: Excel (.xls, .xlsx), CSV',
  'Images: JPG, PNG, GIF, and other common image formats',
  'Archives: ZIP',
]

const AUDIENCE = [
  'Students and researchers saving articles, PDFs, and handouts',
  'Office workers collecting invoices, forms, and shared documents',
  'Anyone who uses Google Drive as their main file home',
  'People tired of duplicate files in Downloads and Drive',
  'Chrome users who want a faster “save for later” workflow',
]

const FAQ = [
  {
    q: 'Is Save Directly to Drive free?',
    a: 'The extension itself is free to install. You need a Google account; Google Drive storage limits still apply to your account as usual.',
  },
  {
    q: 'Do I need to install Google Drive on my computer?',
    a: 'No. Files upload over the internet into your cloud Drive. You can use the Drive website or mobile app to access them.',
  },
  {
    q: 'Can it save any file on any website?',
    a: 'It works best when the site gives you a direct link to a file (or an image you can right-click). Some sites use special download flows that may not work with a simple right-click.',
  },
  {
    q: 'Will it fill up my Drive?',
    a: 'Only with files you choose to save. Manage space the same way you always do in Google Drive.',
  },
  {
    q: 'Can the extension see all my Drive files?',
    a: 'No. It can upload into the folder you set up and open links to files it helped you save. It does not scan or edit your entire Drive library.',
  },
  {
    q: 'Why does Google’s sign-in screen mention “see, edit, create, and delete”?',
    a: 'That’s standard wording Google shows for many apps. This extension uses a narrow permission that is meant for uploading files you save — not for managing everything in your Drive.',
  },
  {
    q: 'What if an upload fails?',
    a: 'You’ll see an error message on the page. Common causes: not signed in, the link expired, the site blocked the download, or a network issue. Try again or check your connection and sign-in status in the extension popup.',
  },
  {
    q: 'Does it work on mobile Chrome?',
    a: 'Chrome extensions are mainly for desktop Chrome. Check the store listing for supported platforms.',
  },
  {
    q: 'Can I use a work or school Google account?',
    a: 'Often yes, but some organizations restrict third-party apps. If sign-in fails, your admin may need to allow the extension.',
  },
]

function InstallButton({ className = 'CC__btn CC__btn--primary' }) {
  const storeUrl = product.chromeStoreUrl

  if (storeUrl) {
    return (
      <a
        href={storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        Add to Chrome — It&apos;s free
      </a>
    )
  }

  return (
    <a href="#how-it-works" className={className}>
      Get Save Directly to Drive
    </a>
  )
}

export default function SaveDirectlyToDrivePage() {
  useEffect(() => {
    const title = `${product.name} — Save files from the web to Google Drive | Coded Citadel`
    const description =
      'Save PDFs, images, and documents from any webpage directly into the Google Drive folder you choose. Free Chrome extension — right-click, save, done.'

    const previousTitle = document.title
    document.title = title

    const meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content') ?? null
    if (meta) meta.setAttribute('content', description)

    return () => {
      document.title = previousTitle
      if (meta && previousDescription != null) {
        meta.setAttribute('content', previousDescription)
      }
    }
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="CC__stdlp">
        <section className="CC__stdlp-hero CC__container">
          <div className="CC__stdlp-hero__grid">
            <div>
              <p className="CC__section-eyebrow">Chrome Extension</p>
              <h1 className="CC__stdlp-hero__title">
                Save files from the web
                <span> straight to Google Drive</span>
              </h1>
              <p className="CC__stdlp-hero__sub">
                {product.name} is a free Chrome extension that uploads files from websites into your
                own Google Drive folder. No extra apps, no hunting through your Downloads folder —
                just right-click, save, and open it in Drive when you&apos;re done.
              </p>
              <div className="CC__stdlp-hero__cta">
                <InstallButton />
                <a href="#how-it-works" className="CC__btn CC__btn--outline">
                  How it works
                </a>
              </div>
              <p className="CC__stdlp-hero__sub" style={{ marginBottom: 0, fontSize: '0.95rem' }}>
                When you find a file on a website — like a PDF, spreadsheet, image, or ZIP — you can
                save it directly into Google Drive instead of downloading it to your computer first.
              </p>
            </div>

            <div className="CC__stdlp-trust-card CC__cyber-accent">
              <CyberCorners />
              <ul className="CC__stdlp-trust">
                {TRUST_BULLETS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="CC__stdlp-section CC__container">
          <p className="CC__section-eyebrow">The problem</p>
          <h2 className="CC__section-title">Stop downloading files twice</h2>
          <p className="CC__stdlp-section__intro">
            Usually, saving something from the web means clicking the link, waiting for a download,
            opening Google Drive in another tab, uploading manually, and hoping you remember to delete
            the copy from Downloads. Save Directly to Drive cuts out the middle step — the file goes
            from the website into your Google Drive account in one smooth action.
          </p>
          <ol className="CC__stdlp-list">
            <li>Click the file link</li>
            <li>Wait for it to download to your computer</li>
            <li>Open Google Drive in another tab</li>
            <li>Upload the file manually</li>
            <li>Delete the copy from your Downloads folder (if you remember)</li>
          </ol>
        </section>

        <section className="CC__stdlp-section CC__container">
          <p className="CC__section-eyebrow">What it does</p>
          <h2 className="CC__section-title">Your files, your Google account</h2>
          <p className="CC__stdlp-section__intro">
            {product.name} connects your Chrome browser to your Google Drive account. Once you&apos;re
            signed in, you can save files you choose — the extension is a helper that moves files into
            Drive; it does not replace Google Drive or store your files on someone else&apos;s servers.
          </p>
          <ul className="CC__stdlp-list">
            {WHAT_IT_DOES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="how-it-works" className="CC__stdlp-section CC__container">
          <p className="CC__section-eyebrow">How it works</p>
          <h2 className="CC__section-title">Set up once, save in one click</h2>
          <div className="CC__stdlp-short-flow" style={{ marginBottom: '2rem' }}>
            <span>Install</span>
            <span className="CC__stdlp-short-flow__arrow">→</span>
            <span>Connect Google Drive</span>
            <span className="CC__stdlp-short-flow__arrow">→</span>
            <span>Right-click a file</span>
            <span className="CC__stdlp-short-flow__arrow">→</span>
            <span>Done</span>
          </div>

          <h3 className="CC__section-eyebrow" style={{ marginBottom: '1rem' }}>First-time setup</h3>
          <ol className="CC__stdlp-steps" style={{ marginBottom: '2rem' }}>
            {SETUP_STEPS.map((step, index) => (
              <li key={step}>
                <span className="CC__stdlp-steps__num">{index + 1}</span>
                <div className="CC__stdlp-steps__body">
                  <p>{step}</p>
                </div>
              </li>
            ))}
          </ol>

          <h3 className="CC__section-eyebrow" style={{ marginBottom: '1rem' }}>Saving a file from a website</h3>
          <ol className="CC__stdlp-steps">
            {SAVE_STEPS.map((step, index) => (
              <li key={step}>
                <span className="CC__stdlp-steps__num">{index + 1}</span>
                <div className="CC__stdlp-steps__body">
                  <p>{step}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="CC__stdlp-section CC__container">
          <p className="CC__section-eyebrow">Features</p>
          <h2 className="CC__section-title">Built for simplicity</h2>
          <p className="CC__stdlp-section__intro">
            One main job: get files from the web into Google Drive. No complicated dashboards or extra accounts.
          </p>
          <div className="CC__stdlp-features">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="CC__stdlp-feature CC__cyber-accent">
                <CyberCorners />
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="CC__stdlp-section CC__container">
          <p className="CC__section-eyebrow">File types</p>
          <h2 className="CC__section-title">What can you save?</h2>
          <p className="CC__stdlp-section__intro">
            The extension is designed for common file types people download from the web. If a site offers
            a direct link, you can usually save it with a right-click.
          </p>
          <div className="CC__stdlp-pill-row">
            {FILE_TYPES.map((type) => (
              <span key={type} className="CC__stdlp-pill">{type}</span>
            ))}
          </div>
        </section>

        <section className="CC__stdlp-section CC__container">
          <p className="CC__section-eyebrow">Who it&apos;s for</p>
          <h2 className="CC__section-title">Anyone who lives in Google Drive</h2>
          <ul className="CC__stdlp-list">
            {AUDIENCE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="CC__stdlp-section__intro" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
            You need Google Chrome (or a Chromium-based browser), a Google account with Google Drive,
            and permission to sign the extension into that account.
          </p>
        </section>

        <section className="CC__stdlp-section CC__container">
          <p className="CC__section-eyebrow">Privacy</p>
          <h2 className="CC__section-title">Simple, transparent, in your control</h2>
          <ul className="CC__stdlp-list">
            <li><strong>Your files belong to you</strong> — uploads go to your own Google Drive. No ads or trackers.</li>
            <li><strong>Limited Google access</strong> — narrow Drive permission; cannot browse or delete your existing files.</li>
            <li><strong>You stay in control</strong> — disconnect anytime or uninstall from Chrome.</li>
            <li><strong>Only acts when you ask</strong> — nothing saves automatically in the background.</li>
            <li><strong>Responsibility for content</strong> — only save files you&apos;re allowed to download or store.</li>
          </ul>
          <p className="CC__stdlp-section__intro" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
            Read the full{' '}
            <Link to="/privacy-policy/save-to-drive-chrome-extension">Privacy Policy</Link>
            {' '}and{' '}
            <Link to="/terms-of-service/save-to-drive-chrome-extension">Terms of Service</Link>.
          </p>
        </section>

        <section className="CC__stdlp-section CC__container">
          <p className="CC__section-eyebrow">Settings</p>
          <h2 className="CC__section-title">Customize your workflow</h2>
          <div className="CC__stdlp-features">
            <article className="CC__stdlp-feature CC__cyber-accent">
              <CyberCorners />
              <h3>Google Drive folder</h3>
              <p>Type the folder name where new saves should go. All uploads land in that folder inside your Drive.</p>
            </article>
            <article className="CC__stdlp-feature CC__cyber-accent">
              <CyberCorners />
              <h3>Rename before save</h3>
              <p>When on, every right-click save opens a small window so you can edit the filename before upload.</p>
            </article>
            <article className="CC__stdlp-feature CC__cyber-accent">
              <CyberCorners />
              <h3>Recent tab &amp; disconnect</h3>
              <p>Browse recent saves in the popup, or sign out of Google on this browser anytime.</p>
            </article>
          </div>
        </section>

        <section className="CC__stdlp-section CC__container">
          <p className="CC__section-eyebrow">FAQ</p>
          <h2 className="CC__section-title">Common questions</h2>
          <div className="CC__stdlp-faq">
            {FAQ.map((item) => (
              <article key={item.q} className="CC__stdlp-faq__item">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="CC__stdlp-section CC__container">
          <div className="CC__stdlp-cta-band CC__cyber-accent">
            <CyberCorners />
            <h2>Start saving to Drive in one click</h2>
            <p>
              Install the extension and connect your Google account in under a minute.
              <br />
              <em style={{ color: 'var(--CC__color-text-sub)', fontStyle: 'normal' }}>
                {product.tagline}
              </em>
            </p>
            <InstallButton className="CC__btn CC__btn--primary CC__btn--full" />
          </div>

          <p className="CC__stdlp-legal">
            {product.name} is an independent Chrome extension. Google Drive and Google Chrome are
            trademarks of Google LLC. This product is not affiliated with or endorsed by Google.
            For full details, see the{' '}
            <Link to="/privacy-policy/save-to-drive-chrome-extension">Privacy Policy</Link>
            {' '}and{' '}
            <Link to="/terms-of-service/save-to-drive-chrome-extension">Terms of Service</Link>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
