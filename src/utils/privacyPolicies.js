import ClaudeDeepSearchPrivacyContent from '../content/privacy/claude-deep-search'
import InstagramDmExporterPrivacyContent from '../content/privacy/instagram-dm-exporter'
import SaveToDrivePrivacyContent from '../content/privacy/save-to-drive-chrome-extension'

const PRIVACY_POLICIES = {
  'claude-deep-search': {
    appName: 'Claude Deep Search',
    lastUpdated: 'May 21, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: ClaudeDeepSearchPrivacyContent,
  },
  'instagram-dm-exporter': {
    appName: 'Instagram DM Exporter',
    lastUpdated: 'May 26, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: InstagramDmExporterPrivacyContent,
  },
  'save-to-drive-chrome-extension': {
    appName: 'Save Directly to Drive',
    lastUpdated: 'May 29, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: SaveToDrivePrivacyContent,
  },
}

export function getPrivacyPolicyBySlug(slug) {
  return PRIVACY_POLICIES[slug] ?? null
}

export function getAllPrivacyPolicySlugs() {
  return Object.keys(PRIVACY_POLICIES)
}
