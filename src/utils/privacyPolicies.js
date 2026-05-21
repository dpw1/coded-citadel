import ClaudeDeepSearchPrivacyContent from '../content/privacy/claude-deep-search'

const PRIVACY_POLICIES = {
  'claude-deep-search': {
    appName: 'Claude Deep Search',
    lastUpdated: 'May 21, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: ClaudeDeepSearchPrivacyContent,
  },
}

export function getPrivacyPolicyBySlug(slug) {
  return PRIVACY_POLICIES[slug] ?? null
}

export function getAllPrivacyPolicySlugs() {
  return Object.keys(PRIVACY_POLICIES)
}
