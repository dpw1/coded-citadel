import AiBookmarkPrivacyContent from '../content/privacy/ai-bookmark'
import ClaudeDeepSearchPrivacyContent from '../content/privacy/claude-deep-search'
import ClaudeLimitMonitorPrivacyContent from '../content/privacy/claude-limit-monitor'
import InstagramCommentExporterPrivacyContent from '../content/privacy/instagram-comment-exporter'
import InstagramDmExporterPrivacyContent from '../content/privacy/instagram-dm-exporter'
import SaveToDrivePrivacyContent from '../content/privacy/save-to-drive-chrome-extension'
import GmailToPdfPrivacyContent from '../content/privacy/gmail-to-pdf-extension'
import YoutubeKeywordPrivacyContent from '../content/privacy/youtube-keyword'
import DexPrivacyContent from '../content/privacy/dex'

const PRIVACY_POLICIES = {
  'ai-bookmark': {
    appName: 'AI Bookmark',
    lastUpdated: 'June 6, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: AiBookmarkPrivacyContent,
  },
  'claude-deep-search': {
    appName: 'Claude Deep Search',
    lastUpdated: 'May 21, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: ClaudeDeepSearchPrivacyContent,
  },
  'claude-limit-monitor': {
    appName: 'Claude Limit Monitor',
    lastUpdated: 'June 2, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: ClaudeLimitMonitorPrivacyContent,
  },
  'instagram-comment-exporter': {
    appName: 'Instagram Comments Exporter',
    lastUpdated: 'June 18, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: InstagramCommentExporterPrivacyContent,
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
  'gmail-to-pdf-extension': {
    appName: 'Gmail to PDF: Save Emails as PDF, HTML, TXT',
    lastUpdated: 'June 13, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: GmailToPdfPrivacyContent,
  },
  'youtube-keyword': {
    appName: 'YouTube Keyword Alert',
    lastUpdated: 'March 21, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: YoutubeKeywordPrivacyContent,
  },
  dex: {
    appName: 'DEX: Discord Export Extension',
    lastUpdated: 'June 27, 2026',
    contact: 'CodedCitadel@gmail.com',
    Content: DexPrivacyContent,
  },
}

export function getPrivacyPolicyBySlug(slug) {
  return PRIVACY_POLICIES[slug] ?? null
}

export function getAllPrivacyPolicySlugs() {
  return Object.keys(PRIVACY_POLICIES)
}
