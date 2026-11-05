import { Link } from 'react-router-dom'
import { getHomeTools } from '../../utils/homeTools'
import './HomeExtensionShowcase.css'

export default function HomeWebToolsSection() {
  const tools = getHomeTools()

  return (
    <section id="tools" className="CC__home-tools CC__home-section CC__container" aria-label="Tools">
      <h2 className="CC__home-featured__subsection-title">Tools</h2>
      <div className="CC__home-featured__grid" role="list">
        {tools.map((tool) => {
          if (tool.comingSoon) {
            return (
              <article
                key={tool.title}
                className="CC__home-featured__card CC__home-featured__card--featured CC__home-tools__card--soon"
                role="listitem"
                aria-hidden="true"
              >
                <div className="CC__home-featured__card-media">
                  {tool.badge ? (
                    <span className="CC__badge CC__home-featured__card-badge">{tool.badge}</span>
                  ) : null}
                  <span className="CC__home-featured__card-thumb CC__home-featured__card-thumb--placeholder" />
                </div>
                <div className="CC__home-featured__card-body">
                  <h3 className="CC__home-featured__card-title">{tool.title}</h3>
                  <p className="CC__home-featured__card-summary">{tool.description}</p>
                </div>
              </article>
            )
          }

          const imageSrc = tool.image
            ? tool.image.startsWith('/')
              ? `${import.meta.env.BASE_URL}${tool.image.replace(/^\//, '')}`
              : tool.image
            : null

          return (
            <article
              key={tool.path}
              className="CC__home-featured__card CC__home-featured__card--featured"
              role="listitem"
            >
              <div className="CC__home-featured__card-media">
                {tool.badge ? (
                  <span className="CC__badge CC__home-featured__card-badge">{tool.badge}</span>
                ) : null}
                {imageSrc ? (
                  <img
                    className="CC__home-featured__card-thumb"
                    src={imageSrc}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="CC__home-featured__card-thumb CC__home-featured__card-thumb--placeholder" />
                )}
              </div>
              <div className="CC__home-featured__card-body">
                <h3 className="CC__home-featured__card-title">{tool.title}</h3>
                {tool.description ? (
                  <p className="CC__home-featured__card-summary">{tool.description}</p>
                ) : null}
                <div className="CC__home-featured__card-foot">
                  <div className="CC__home-featured__card-ctas">
                    <Link to={tool.path} className="CC__btn CC__btn--primary CC__home-featured__download">
                      Open tool
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
