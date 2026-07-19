const DEVICON = (path) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${path}`

/** Canonical tech catalog used for known icons. */
export const WORK_TECH_CATALOG = {
  react: {
    id: 'react',
    label: 'React',
    iconUrl: DEVICON('react/react-original.svg'),
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    iconUrl: DEVICON('typescript/typescript-original.svg'),
  },
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    iconUrl: DEVICON('javascript/javascript-original.svg'),
  },
  vite: {
    id: 'vite',
    label: 'Vite',
    iconUrl: DEVICON('vitejs/vitejs-original.svg'),
  },
  supabase: {
    id: 'supabase',
    label: 'Supabase',
    iconUrl: DEVICON('supabase/supabase-original.svg'),
  },
  'chrome-api': {
    id: 'chrome-api',
    label: 'Chrome API',
    iconUrl: DEVICON('chrome/chrome-original.svg'),
  },
  nodejs: {
    id: 'nodejs',
    label: 'Node.js',
    iconUrl: DEVICON('nodejs/nodejs-original.svg'),
  },
  python: {
    id: 'python',
    label: 'Python',
    iconUrl: DEVICON('python/python-original.svg'),
  },
  tailwindcss: {
    id: 'tailwindcss',
    label: 'Tailwind CSS',
    iconUrl: DEVICON('tailwindcss/tailwindcss-original.svg'),
  },
  zustand: {
    id: 'zustand',
    label: 'Zustand',
    iconUrl: null,
  },
  liquid: {
    id: 'liquid',
    label: 'Liquid',
    iconUrl: null,
  },
}

/** Preferred primary techs (kept for reference / future use). */
export const WORK_TECH_FILTER_IDS = [
  'react',
  'typescript',
  'javascript',
  'vite',
  'supabase',
  'nodejs',
]

function shouldOmitFromTechFilters(raw) {
  const value = raw.trim().toLowerCase()
  return value.includes('manifest v3') || value === 'chrome extension manifest v3'
}

function iconUrlForRaw(raw) {
  const value = raw.trim().toLowerCase()

  if (/^react(\s|$|\d)/.test(value) || value === 'react') return WORK_TECH_CATALOG.react.iconUrl
  if (value.includes('typescript')) return WORK_TECH_CATALOG.typescript.iconUrl
  if (value === 'javascript' || value === 'js') return WORK_TECH_CATALOG.javascript.iconUrl
  if (value === 'vite' || value.startsWith('vite ')) return WORK_TECH_CATALOG.vite.iconUrl
  if (value === 'supabase' || value.startsWith('supabase ')) return WORK_TECH_CATALOG.supabase.iconUrl
  if (value === 'crxjs') return WORK_TECH_CATALOG['chrome-api'].iconUrl
  if (value.includes('node')) return WORK_TECH_CATALOG.nodejs.iconUrl
  if (value.includes('python')) return WORK_TECH_CATALOG.python.iconUrl
  if (value.includes('tailwind')) return WORK_TECH_CATALOG.tailwindcss.iconUrl

  return null
}

function displayLabelForRaw(raw) {
  const trimmed = raw.trim()
  if (/^chrome\./i.test(trimmed)) return trimmed.replace(/^chrome\./i, '')
  if (/^react\s+\d/i.test(trimmed)) return 'React'
  return trimmed
}

/** Stable id for a display tech tag. */
export function techTagId(raw) {
  return displayLabelForRaw(raw).toLowerCase()
}

/**
 * Every techStack entry as its own tag (icon when known, text otherwise).
 */
export function resolveWorkTechs(rawStack = []) {
  const seen = new Set()
  const techs = []

  for (const raw of rawStack) {
    if (!raw || typeof raw !== 'string') continue
    if (shouldOmitFromTechFilters(raw)) continue
    const label = displayLabelForRaw(raw)
    const id = label.toLowerCase()
    if (seen.has(id)) continue
    seen.add(id)

    techs.push({
      id,
      label,
      iconUrl: iconUrlForRaw(raw),
    })
  }

  return techs
}

export function projectHasTech(rawStack, techId) {
  if (!techId) return true
  return resolveWorkTechs(rawStack).some((tech) => tech.id === techId)
}

export function getAppTechStack(app) {
  const stack = app?.buildStory?.techStack
  return Array.isArray(stack) ? stack : []
}

/**
 * All unique tech tags across items, with counts.
 * Ordered: icons first, then highest count → lowest.
 * Always prepends an "All" tag.
 */
export function buildTechFilterOptions(itemsWithStack, totalItems = 0, activeTechId = null) {
  const counts = new Map()
  const byId = new Map()

  for (const rawStack of itemsWithStack) {
    const seenInItem = new Set()
    for (const tech of resolveWorkTechs(rawStack)) {
      if (seenInItem.has(tech.id)) continue
      seenInItem.add(tech.id)
      byId.set(tech.id, tech)
      counts.set(tech.id, (counts.get(tech.id) || 0) + 1)
    }
  }

  if (activeTechId && activeTechId !== 'all' && !byId.has(activeTechId)) {
    byId.set(activeTechId, {
      id: activeTechId,
      label: activeTechId,
      iconUrl: null,
    })
    counts.set(activeTechId, counts.get(activeTechId) || 0)
  }

  const sorted = [...byId.keys()]
    .map((id) => ({
      ...byId.get(id),
      count: counts.get(id) || 0,
    }))
    .sort((a, b) => {
      const aHasIcon = a.iconUrl ? 1 : 0
      const bHasIcon = b.iconUrl ? 1 : 0
      if (aHasIcon !== bHasIcon) return bHasIcon - aHasIcon
      if (b.count !== a.count) return b.count - a.count
      return a.label.localeCompare(b.label)
    })

  return [
    {
      id: 'all',
      label: 'All',
      iconUrl: null,
      count: totalItems,
    },
    ...sorted,
  ]
}
