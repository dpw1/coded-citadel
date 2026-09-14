function formatMetaCount(value) {
  if (value == null || Number.isNaN(Number(value))) return '0'
  return Number(value).toLocaleString('en-US')
}

/** Short meta description for Google search snippets (~155 chars). */
export function buildHomeMetaDescriptionSearch(stats) {
  if (!stats) {
    return 'Free Chrome extensions for social media and ecommerce, built in public with live install stats and YouTube build logs.'
  }

  const apps = formatMetaCount(stats.built)
  return `${apps} free Chrome extensions for social media and ecommerce, built in public with live install stats, changelogs, and YouTube build logs.`
}

/** Longer description for Open Graph, Twitter, and structured data. */
export function buildHomeMetaDescriptionSocial(stats) {
  if (!stats) {
    return 'Coded Citadel — building social media and ecommerce tools in public. Free Chrome extensions with live stats and YouTube build logs.'
  }

  const users = formatMetaCount(stats.totalActiveUsers)
  const installs = formatMetaCount(stats.totalInstalls)
  const apps = formatMetaCount(stats.built)

  let description =
    `Coded Citadel — building social media and ecommerce tools in public. ` +
    `${apps} free Chrome extensions with ${users} active users and ${installs} installs, ` +
    `each documented step by step on YouTube`

  if (stats.daysIntoJourney != null) {
    description += ` over the past ${formatMetaCount(stats.daysIntoJourney)} days`
  }

  description += '.'

  if (stats.activeUsersDelta7d != null && stats.activeUsersDelta7d > 0) {
    description += ` (+${formatMetaCount(stats.activeUsersDelta7d)} users this week).`
  }

  return description
}

/** @deprecated Use buildHomeMetaDescriptionSocial for social or buildHomeMetaDescriptionSearch for SERPs. */
export function buildHomeMetaDescription(stats) {
  return buildHomeMetaDescriptionSocial(stats)
}
