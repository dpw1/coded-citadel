import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import ContactForm from '../components/ContactForm'
import PageSEO from '../components/PageSEO'
import '../App.css'
import './PrivacyPolicyPage.css'

export function ContactSection({ idPrefix = 'contact' }) {
  return (
    <>
      <header>
        <p className="CC__section-eyebrow">Contact</p>
        <h1 className="CC__privacy-page__title">Get in touch</h1>
        <p className="CC__privacy-page__meta">
          Have a project in mind? Let's talk. 
        </p>
      </header>

      <div className="CC__privacy__body">
        <ContactForm idPrefix={idPrefix} />
      </div>
    </>
  )
}

export default function ContactPage() {
  return (
    <>
      <PageSEO
        title="Contact — Coded Citadel"
        description="Get in touch about freelance work, Chrome extension MVPs, or Shopify builds."
        canonicalPath="/contact"
      />
      <SiteHeader />
      <main className="CC__privacy-page">
        <div className="CC__container CC__privacy-page__inner">
          <ContactSection idPrefix="contact-page" />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
