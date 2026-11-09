/**
 * Public extension catalog — same payload as /all-extensions.json (generated at build).
 * Homepage and other marketing surfaces should prefer this over raw apps.json.
 */

import catalogData from '../data/all-extensions.json'

function usersAnalyticsSnapshot(users) {
  if (users == null) return undefined
  const now = new Date()
  const d = String(now.getDate()).padStart(2, '0')
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const y = now.getFullYear()
  const date = `${d}-${m}-${y}`
  return {
    weeklyUsers: [{ date, total: users }],
    enabledVsDisabled: { enabled: users, date },
  }
}

export function getPublicExtensionsCatalog() {
  return catalogData
}

export function getPublicExtensionsCatalogUpdatedAt() {
  return catalogData.catalogUpdatedAt ?? null
}

export function getPublicExtensions() {
  return catalogData.extensions ?? []
}

export function getHomeCatalogFilters() {
  return catalogData.homeCatalogFilters ?? []
}

export function getPublicExtensionBySlug(slug) {
  if (!slug) return null
  return getPublicExtensions().find((ext) => ext.slug === slug) ?? null
}

/** Map a catalog row to the app shape expected by homepage helpers in apps.js. */
export function publicExtensionAsAppView(ext) {
  if (!ext) return null

  const users = ext.users
  const totalInstalls = ext.totalInstalls
  const storeUrl = ext.urls?.chromeWebStore

  return {
    slug: ext.slug,
    chromeExtensionId: ext.chromeExtensionId,
    name: ext.title,
    tagline: ext.shortDescription,
    taglineEn: ext.shortDescription,
    description: {
      short: ext.shortDescription,
      full: ext.description ?? ext.shortDescription,
    },
    chromeExtensionIcon: ext.image,
    screenshots: ext.screenshots ?? [],
    chromeStoreUrl: storeUrl ?? '#',
    status: ext.status,
    listed: ext.listed,
    tags: ext.tags ?? [],
    buildStory: ext.build?.youtubeUrl ? { youtubeUrl: ext.build.youtubeUrl } : undefined,
    youtube: ext.urls?.youtubeBuild ?? undefined,
    analytics:
      users != null || totalInstalls != null
        ? {
            totalInstalls: totalInstalls ?? 0,
            ...usersAnalyticsSnapshot(users),
          }
        : undefined,
    users,
  }
}

export function getPublicExtensionAsAppBySlug(slug) {
  return publicExtensionAsAppView(getPublicExtensionBySlug(slug))
}

/** Extensions shown on the home catalog (listed storefront + discontinued pin). */
export function getHomeCatalogExtensionViews() {
  return getPublicExtensions()
    .filter(
      (ext) => (ext.listed || ext.discontinued) && ext.urls?.chromeWebStore,
    )
    .map(publicExtensionAsAppView)
}

export function sortExtensionViewsByUsers(apps) {
  return [...(apps ?? [])].sort(
    (a, b) => (b.analytics?.weeklyUsers?.[0]?.total ?? 0) - (a.analytics?.weeklyUsers?.[0]?.total ?? 0),
  )
}
