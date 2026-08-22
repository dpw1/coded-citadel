import SaveToDriveTermsContent from '../content/terms/save-to-drive-chrome-extension'
import YoutubeFilterProTermsContent from '../content/terms/youtube-filter-pro'

const TERMS_OF_SERVICE = {
  'save-to-drive-chrome-extension': {
    appName: 'Save Directly to Drive',
    lastUpdated: 'May 29, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: SaveToDriveTermsContent,
  },
  'youtube-filter-pro': {
    appName: 'YouTube Filter Pro',
    lastUpdated: 'August 22, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: YoutubeFilterProTermsContent,
  },
}

export function getTermsOfServiceBySlug(slug) {
  return TERMS_OF_SERVICE[slug] ?? null
}

export function getAllTermsOfServiceSlugs() {
  return Object.keys(TERMS_OF_SERVICE)
}
