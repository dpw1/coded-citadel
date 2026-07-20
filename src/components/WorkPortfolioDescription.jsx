/** Renders portfolio description blocks (strings, headings, lists, images). */
export function WorkPortfolioDescription({ description }) {
  if (!Array.isArray(description) || !description.length) return null

  return description.map((block, index) => {
    if (typeof block === 'string') {
      return <p key={`p-${index}`}>{block}</p>
    }

    if (block?.heading) {
      return (
        <h4 key={`h-${index}`} className="CC__work-portfolio-modal__heading">
          {block.heading}
        </h4>
      )
    }

    if (Array.isArray(block?.list)) {
      return (
        <ul key={`ul-${index}`} className="CC__work-portfolio-modal__list">
          {block.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    }

    if (block?.image) {
      return (
        <figure key={`img-${index}`} className="CC__work-portfolio-modal__figure">
          <img
            src={block.image}
            alt={block.alt ?? ''}
            className="CC__work-portfolio-modal__inline-image"
            loading="lazy"
            decoding="async"
          />
        </figure>
      )
    }

    return null
  })
}
