import SaveToDriveTermsContent from '../content/terms/save-to-drive-chrome-extension'

const TERMS_OF_SERVICE = {
  'save-to-drive-chrome-extension': {
    appName: 'Save Directly to Drive',
    lastUpdated: 'May 29, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: SaveToDriveTermsContent,
  },
}

export function getTermsOfServiceBySlug(slug) {
  return TERMS_OF_SERVICE[slug] ?? null
}

export function getAllTermsOfServiceSlugs() {
  return Object.keys(TERMS_OF_SERVICE)
}
