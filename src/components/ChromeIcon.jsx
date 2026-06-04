import chromeSvg from '../assets/chrome.svg'

/** Google Chrome logo from src/assets/chrome.svg */
export default function ChromeIcon({ size = 16, className, title = 'Chrome' }) {
  return (
    <img
      src={chromeSvg}
      width={size}
      height={size}
      className={className}
      alt={title || ''}
      aria-hidden={title ? undefined : true}
      decoding="async"
    />
  )
}
