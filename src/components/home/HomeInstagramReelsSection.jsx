import { HOME_INSTAGRAM_REELS } from '../../constants/homeInstagramReels'

export default function HomeInstagramReelsSection() {
  return (
    <section
      id="instagram"
      className="CC__home-instagram CC__container"
      aria-label="Tips seen on Instagram"
    >
      <h2 className="CC__section-title">Saw it on Instagram?</h2>
      <div className="CC__home-reels" role="list">
        {HOME_INSTAGRAM_REELS.map((reel) => (
          <a
            key={reel.hook}
            href={reel.href}
            className="CC__home-reels__item"
            role="listitem"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="CC__home-reels__label">Reel</span>
            {reel.hook}
          </a>
        ))}
      </div>
    </section>
  )
}
