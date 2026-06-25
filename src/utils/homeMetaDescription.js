function formatMetaCount(value) {
  if (value == null || Number.isNaN(Number(value))) return '0'
  return Number(value).toLocaleString('en-US')
}

/** Human-readable homepage meta description for search and social previews. */
export function buildHomeMetaDescription(stats) {
  if (!stats) {
    return 'Building in public toward $100K — Chrome extensions documented step by step on YouTube.'
  }

  const users = formatMetaCount(stats.totalActiveUsers)
  const installs = formatMetaCount(stats.totalInstalls)
  const apps = formatMetaCount(stats.built)
  const days = stats.daysIntoJourney

  let description =
    `Building in public toward $100K. Currently ${users} active users and ${installs} total installs ` +
    `across ${apps} Chrome extensions, each documented step by step on YouTube`

  if (days != null) {
    description += ` over the past ${formatMetaCount(days)} days`
  }

  description += '.'

  const growthNotes = []
  if (stats.activeUsersDelta7d != null && stats.activeUsersDelta7d > 0) {
    growthNotes.push(`+${formatMetaCount(stats.activeUsersDelta7d)} users this week`)
  }
  if (stats.installsDelta7d != null && stats.installsDelta7d > 0) {
    growthNotes.push(`+${formatMetaCount(stats.installsDelta7d)} installs this week`)
  }

  if (growthNotes.length) {
    description += ` (${growthNotes.join(', ')}).`
  }

  return description
}
