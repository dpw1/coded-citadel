import { CODED_CITADEL_INSTAGRAM_URL } from '../../constants/socialUrls'

export default function HomeHeroSection() {
  return (
    <section
      className="CC__home-hero"
      aria-label="Free Chrome extensions for Instagram, YouTube, and more"
    >
      <div className="CC__home-hero__inner CC__container">
        <div className="CC__hero__tag">
          <span className="CC__hero__tag-dot" aria-hidden="true" />
          <span className="CC__hero__tag-text">Privacy friendly, no AI-slop.</span>
        </div>
        <h1 className="CC__home-hero__title">
          I build Chrome extensions that make your life easier.
        </h1>
        <p className="CC__home-hero__lede">
          If you&apos;re on social media - whether professionally or just for fun - I have tools that
          will improve your experience. Check them out!
        </p>
        <div className="CC__home-hero__actions">
          <a href="#ext" className="CC__btn CC__btn--primary CC__home-hero__btn">
            Browse extensions
          </a>
          <a
            href={CODED_CITADEL_INSTAGRAM_URL}
            className="CC__btn CC__btn--outline CC__btn--instagram CC__home-hero__btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
