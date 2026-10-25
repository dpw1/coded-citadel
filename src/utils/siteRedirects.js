import redirects from '../../redirects.json'

/** External short-link redirects (see redirects.json at repo root). */
export function getSiteRedirects() {
  return redirects ?? []
}
