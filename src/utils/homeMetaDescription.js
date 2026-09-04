function formatMetaCount(value) {
  if (value == null || Number.isNaN(Number(value))) return '0'
  return Number(value).toLocaleString('en-US')
}

/** Short meta description for Google search snippets (~155 chars). */
export function buildHomeMetaDescriptionSearch(stats) {
  if (!stats) {
    return 'Free Chrome extensions from Coding in Public Until I Make $100k USD — live stats, changelogs, and YouTube build logs.'
  }

  const apps = formatMetaCount(stats.built)
  return `Free Chrome extensions from Coding in Public Until I Make $100k USD. Browse ${apps} tools with live install stats, changelogs, and YouTube build logs.`
}

/** Longer description for Open Graph, Twitter, and structured data. */
export function buildHomeMetaDescriptionSocial(stats) {
  if (!stats) {
    return 'Coding in Public Until I Make $100k USD — Chrome extensions documented step by step on YouTube.'
  }

  const users = formatMetaCount(stats.totalActiveUsers)
  const profit =
    stats.totalProfit != null
      ? `$${Number(stats.totalProfit).toLocaleString('en-US', {
          minimumFractionDigits: Math.round(Number(stats.totalProfit) * 100) % 100 ? 2 : 0,
          maximumFractionDigits: 2,
        })}`
      : '$0'
  const apps = formatMetaCount(stats.built)
  const days = stats.daysIntoJourney

  let description =
    `Coding in Public Until I Make $100k USD. Currently ${users} active users and ${profit} total made ` +
    `across ${apps} Chrome extensions, each documented step by step on YouTube`

  if (days != null) {
    description += ` over the past ${formatMetaCount(days)} days`
  }

  description += '.'

  const growthNotes = []
  if (stats.activeUsersDelta7d != null && stats.activeUsersDelta7d > 0) {
    growthNotes.push(`+${formatMetaCount(stats.activeUsersDelta7d)} users this week`)
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
