/** Extract blog post slug from a GA pagePath like /blog/my-post/ */
export function slugFromBlogPath(path) {
  const trimmed = String(path || '').replace(/\/+$/, '')
  const match = trimmed.match(/^\/blog\/([^/?#]+)$/i)
  return match ? decodeURIComponent(match[1]) : null
}

/** Aggregate GA page paths into canonical slug → total views (handles redirects). */
export function buildBlogViewsBySlug(blogPostViews, redirects = []) {
  const redirectTo = new Map((redirects ?? []).map((entry) => [entry.from, entry.to]))
  const bySlug = new Map()

  for (const row of blogPostViews ?? []) {
    const slug = slugFromBlogPath(row.path)
    if (!slug) continue

    const canonical = redirectTo.get(slug) ?? slug
    bySlug.set(canonical, (bySlug.get(canonical) ?? 0) + Number(row.views ?? 0))
  }

  return bySlug
}
