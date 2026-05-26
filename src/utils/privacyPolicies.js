import ClaudeDeepSearchPrivacyContent from '../content/privacy/claude-deep-search'
import InstagramDmExporterPrivacyContent from '../content/privacy/instagram-dm-exporter'

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
}

export function getPrivacyPolicyBySlug(slug) {
  return PRIVACY_POLICIES[slug] ?? null
}

export function getAllPrivacyPolicySlugs() {
  return Object.keys(PRIVACY_POLICIES)
}
