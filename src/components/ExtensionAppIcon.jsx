export default function ExtensionAppIcon({ src, size = 20, className = '' }) {
  if (!src) return null

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`ext-app-icon${className ? ` ${className}` : ''}`}
      loading="lazy"
      decoding="async"
    />
  )
}
