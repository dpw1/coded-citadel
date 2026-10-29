import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
} from '@tabler/icons-react'

const SOCIAL_ITEMS = [
  {
    id: 'youtube',
    label: 'YouTube @CodedCitadel',
    href: 'https://www.youtube.com/@CodedCitadel',
    Icon: IconBrandYoutube,
  },
  {
    id: 'instagram',
    label: 'Instagram @codedcitadel',
    href: 'https://www.instagram.com/codedcitadel',
    Icon: IconBrandInstagram,
  },
  {
    id: 'tiktok',
    label: 'TikTok @codedcitadeldev',
    href: 'https://www.tiktok.com/@codedcitadeldev',
    Icon: IconBrandTiktok,
  },
  {
    id: 'x',
    label: 'X @codedCitadel2',
    href: 'https://x.com/codedCitadel2',
    Icon: IconBrandX,
  },
]

export default function LinksHubSocial() {
  return (
    <footer className="CC__links-hub-social" aria-label="Social media">
      <p className="CC__links-hub-social__heading">Follow me on social media</p>
      <div className="CC__links-hub-social__icons">
        {SOCIAL_ITEMS.map(({ id, label, href, Icon }) => (
          <a
            key={id}
            className="CC__links-hub-social__icon-link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
          >
            <Icon size={22} stroke={1.75} aria-hidden="true" />
          </a>
        ))}
      </div>
    </footer>
  )
}
