const CELL_CLASS = 'CC__ext-cta CC__ext-cta--visible CC__links-list__item'

export default function LinksHubCell({
  as: Component = 'a',
  title,
  subtitle,
  imageUrl,
  imageAlt = '',
  fallbackIcon = '⚡',
  className,
  ...rest
}) {
  const mergedClass = className ? `${CELL_CLASS} ${className}` : CELL_CLASS

  return (
    <Component className={mergedClass} {...rest}>
      <span className="CC__links-list__icon CC__ext-icon">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
          />
        ) : (
          fallbackIcon
        )}
      </span>
      <span className="CC__links-list__text">
        <span className="CC__links-list__title">{title}</span>
        {subtitle ? <span className="CC__links-list__summary">{subtitle}</span> : null}
      </span>
    </Component>
  )
}
