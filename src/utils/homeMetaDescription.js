function formatMetaCount(value) {
  if (value == null || Number.isNaN(Number(value))) return '0'
  return Number(value).toLocaleString('en-US')
}

/** Short meta description for Google search snippets (~155 chars). */
export function buildHomeMetaDescriptionSearch(stats) {
  if (!stats) {
    return 'Free Chrome extensions built in public toward $100K — live stats, changelogs, and step-by-step build videos on YouTube.'
  }

  const apps = formatMetaCount(stats.built)
  return `Free Chrome extensions built in public toward $100K. Browse ${apps} tools with live install stats, changelogs, and YouTube build logs.`
}

/** Longer description for Open Graph, Twitter, and structured data. */
export function buildHomeMetaDescriptionSocial(stats) {
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

/** @deprecated Use buildHomeMetaDescriptionSocial for social or buildHomeMetaDescriptionSearch for SERPs. */
export function buildHomeMetaDescription(stats) {
  return buildHomeMetaDescriptionSocial(stats)
}
