# Coded Citadel landing page — agent guide

**Read this file first** when working in this repo. It maps how the site is built and where content lives.

Live site: **https://codedcitadel.com** (GitHub Pages; `CNAME` in repo root).

---

## Stack

| Layer | Tech |
|--------|------|
| UI | React 18 + Vite; icons on `/guides` social row use **`@tabler/icons-react`** |
| Routing | `react-router-dom` (`src/App.jsx`) |
| Data | JSON under `src/data/` (generated + hand-edited) |
| Backend-ish | Node scripts in `back-end/` (build time, not a runtime server) |
| Admin | Static `admin/` (extension ops dashboards; separate from public SPA) |

Dev: `npm run dev` · Production build: `npm run build` (generators for apps/analytics/sitemap — **no** blog manifest regen). Blog pipeline scripts remain for manual use (`generate-blog-manifest`, `import-blog-screenshots`, `apply-blog-views`).

---

## Public routes (main app)

Defined in `src/App.jsx`:

| Path | Page | Notes |
|------|------|--------|
| `/` | Home | New layout: hero + extension showcase + tools (`src/pages/HomePage.jsx`, `src/components/home/`) |
| `/apps` | Apps grid | All Chrome extensions |
| `/apps/:slug` | Extension landing | Copy from `src/data/apps.json` |
| `/blog` | Blog index | Posts from `src/data/blog.json` |
| `/blog/:slug` | Blog post | Body HTML in `public/blog-content/{slug}.html` |
| `/live-stats` | Public stats | Portfolio / install analytics |
| `/profit` | Profit page | Build-in-public numbers |
| `/work` | Hire / portfolio | Client work |
| `/contact`, `/affiliate`, `/links`, `/guides`, `/image-search` | Marketing | See **Link-in-bio** and **Image search** below |
| `/thank-you`, `/uninstall`, `/success` | Extension flows | Query params for app feedback / Stripe |
| `/privacy-policies` | Legal index | List of extension privacy policies (`PrivacyPoliciesIndexPage`) |
| `/privacy-policy/:slug`, `/terms-of-service/:slug` | Legal | Per-app content in `src/content/` |
| `/davinci-resolve-plugins`, `/davinci-resolve-plugins/:slug` | DaVinci plugins | Separate product line |
| `/YFP`, `/yfp`, etc. | Short links | External URLs in `redirects.json` |

---

## Content you edit vs generated

| What | Source of truth | Generated into |
|------|-----------------|----------------|
| **Blog posts** | `blogs/*.md` (YAML frontmatter + Markdown) | `src/data/blog.json`, `public/blog-content/*.html` via **`npm run generate-blog-manifest`** (manual — not run on `dev` or `build`) |
| **Blog images** | Often imported from `blogs/` paths | `public/blog-images/` (`import-blog-screenshots`) |
| **Extension catalog** | Chrome Web Store scrape + overrides | `src/data/apps.json` (`extract-chrome-apps`, `sync-apps-custom-data`) |
| **Public extension API + homepage catalog** | `apps.json` + `apps-custom-data.json` + `blog.json` | `src/data/all-extensions.json` and `public/all-extensions.json` via **`npm run generate-all-extensions`** (runs on full `build`) |
| **Sitemap** | Routes + blog slugs + guide slugs | `public/sitemap.xml` (`generate-sitemap`); prerender list in `vite.config.js` |
| **YouTube embeds** | Channel fetch | `src/data/youtube-videos.json` |
| **Analytics snapshots** | GA / CWS scripts | `src/data/ga-db.json`, `website-analytics.json`, etc. |
| **Blog redirects** | `blog-redirects.json` | Merged in blog manifest |
| **Site short links** | `redirects.json` | External redirects in `src/App.jsx` via `StoreRedirectPage` |
| **Reel guides hub** | `src/data/guides.json` | `/guides` + `/guides/:slug` — see **Link-in-bio pages** below |
| **Homepage web tools** | `src/data/home-tools.json` | Tools block on `/` (`#tools`) — `path` is an in-app route (e.g. `/image-search`) |
| **Home “Most popular”** | `src/constants/featuredExtensionSlugs.js` | First **`HOME_MOST_POPULAR_LIMIT`** (3) curated slugs for `#ext`; full slug list kept for `/links` alignment |
| **Home extension filters** | `shared/home-extension-catalog.mjs` | Category pills, counts, `homeCategory`; mirrored in `homeExtensionFilters.js` |

After changing **`blogs/*.md`**, run **`npm run generate-blog-manifest`** (and **`npm run apply-blog-views`** if you refresh GA view counts). These steps are **not** hooked to `npm run dev` or `npm run build`.

After changing **`src/data/guides.json`**, run **`npm run generate-sitemap`** (or full `build`).

**Extension catalog note:** `extract-chrome-apps` may pull **pt-BR** taglines into `apps.json`. Public UI must stay **English** — use `appTagline()` / `appCardSummary()` and `appFilterLabel()` from `src/utils/apps.js` (see **Homepage** below), not raw `app.tagline` in React.

---

## Homepage (`/`)

Wrapped in **`.CC__home`** (`src/pages/HomePage.css`). Design tokens and primitives: **`src/styles/ui-kit.css`** (reference: **`ui-kit.html`**).

| Section | Component | Anchor | Notes |
|---------|-----------|--------|--------|
| Hero | `src/components/home/HomeHeroSection.jsx` | — | Top spacing on `.CC__home-hero` (inner uses `.CC__container`; avoid putting vertical padding on the same node as `.CC__container` — shorthand `padding: 0 …` resets `padding-top`) |
| Most popular | `HomeExtensionsSection.jsx` | `#ext` | Three curated cards from `all-extensions.json` via `publicExtensions.js` |
| All extensions | same | — | Same catalog JSON; filter pills (`HOME_CATALOG_FILTERS`), pagination |
| Tools | `HomeWebToolsSection.jsx` | `#tools` | Driven by `home-tools.json` |
| Instagram reels | `HomeInstagramReelsSection.jsx` | `#reels` | `src/data/home-instagram-reels.json` + `public/home-instagram-reels/` — refresh with **`npm run sync-home-instagram-reels`** (no Meta API; build-time og scrape) |
| About | inline in `HomePage.jsx` | `#about` | Legacy **`AppsGridSection`** (`#apps`) is commented out — use extension sections above instead |

**Shared section spacing:** add **`CC__home-section`** to homepage blocks; use **`CC__home-section--follow`** when a section sits directly under another (e.g. All extensions after Most popular). Tokens on **`.CC__home`**: `--CC__home-section-gap-top`, `--CC__home-section-pad-bottom`.

**Shared extension UI:** `src/components/home/HomeExtensionShowcaseCard.jsx`, **`HomeExtensionShowcase.css`**, grid class **`CC__home-extensions__grid`** (3 columns desktop). Thumbnail links to Chrome Web Store; video modal is disabled for now (commented in section).

**English copy on cards and `/apps/:slug`:** `src/utils/appDisplayText.js` + **`appTagline()`** / **`appFilterLabel()`** in `apps.js`. Prefer English `description.short` when store `tagline` is non-English; optional overrides in `apps-custom-data.json` (`tagline` on matching slug/id).

**Home extension data:** Marketing sections read **`src/data/all-extensions.json`** (not raw `apps.json`). Use **`src/utils/publicExtensions.js`** (`getHomeCatalogExtensionViews`, `getPublicExtensionAsAppBySlug`, etc.). Extension landing pages, charts, and `/apps` grid still use **`apps.json`**.

---

## Public extension catalog (`all-extensions.json`)

Cross-site feed and **source of truth for homepage extension UI** (safe, public fields only).

| Output | Purpose |
|--------|---------|
| **`src/data/all-extensions.json`** | Imported by the React app at build time |
| **`https://codedcitadel.com/all-extensions.json`** | Same JSON copied to `public/` for third-party `fetch` |

**Generator:** `npm run generate-all-extensions` · **Logic:** `back-end/lib/public-extensions-feed.mjs` · **Home categories:** `shared/home-extension-catalog.mjs` (shared with `homeExtensionFilters.js`).

**Pipeline (full `build`):** After `apps.json` is synced and stats computed → `generate-all-extensions` writes both JSON files → Vite bundles `src/data/all-extensions.json` into the SPA and copies `public/all-extensions.json` to `dist/`.

**Top-level fields:**

- `schemaVersion`, `generatedAt`, `catalogUpdatedAt`, `siteUrl`, `count`
- **`homeCatalogFilters`** — chip counts for All / Instagram / YouTube / Claude / Gmail / Discord (homepage-visible extensions only; respects hidden slugs)
- **`extensions[]`** — one object per listed (or discontinued) extension

**Per extension (high level):** `slug`, `title`, **`shortDescription`** (Chrome **`tagline`**: `apps-custom-data.json` → `taglineEn` → `apps.json` `tagline`; not `description.short`), `description` (full store/listing body), `image`, `heroImage`, `screenshots`, `users`, `totalInstalls`, `homeCategory`, store `category`, `tags`, `urls` (landing, Chrome Web Store, blog, GitHub, YouTube, privacy), `build`, `quickStartHtml`, etc.

**Omitted (not public):** Revenue, analytics time series, regional breakdowns, internal hashes.

**CORS:** GitHub Pages does not add `Access-Control-Allow-Origin` by default. Server-side consumers can read the URL as-is; browser `fetch` from other origins may need a CDN header rule (e.g. Cloudflare) on `/all-extensions.json`.

After changing category rules, hidden slugs, or feed shape → edit **`shared/home-extension-catalog.mjs`** and/or **`public-extensions-feed.mjs`**, then **`npm run generate-all-extensions`** (or full build). Commit **`src/data/all-extensions.json`** and **`public/all-extensions.json`** together.

---

## Link-in-bio pages (`/links`, `/guides`)

Minimal layouts (no site header/footer). Shared UI lives in **`src/components/linksHub/`**:

| File | Role |
|------|------|
| `linksHub.css` | Shared cell/list styles (`CC__links-*`). List cells use a subtler hover than global `CC__ext-cta`. |
| `LinksHubCell.jsx` | Icon + title + optional subtitle; render as `<a>` or `<button>`. |
| `LinksHubHero.jsx` | Avatar + title + tagline. |
| `LinksHubSocial.jsx` | “Follow me on social media” + brand icons via **`@tabler/icons-react`**. **`/guides` only**. |

| Route | Page | Content |
|-------|------|---------|
| `/links` | `src/pages/LinksPage.jsx` | Extension links hard-coded in the page |
| `/guides` | `src/pages/GuidesPage.jsx` | `src/data/guides.json` + `src/utils/guides.js` |

**`/guides` behavior**

- Hero, tutorial cells, social footer (footer sits below the list/detail slider).
- **`url`**: slug → share **`/guides/{url}`** in reels.
- **`redirectUrl`**: opens in the **same tab** (list tap or direct URL). No slide panel.
- **`content`**: trusted HTML for inline guides; horizontal slide to detail; client-side routing (no full page reload).
- Thumbnails: **`public/guides-images/`** (or any path under `public/`).
- **`App.jsx`**: `routeTransitionKey()` treats `/guides` and `/guides/:slug` as one mount so transitions work.

**`guides.json` fields** (array under `"guides"`):

| Field | Required | Purpose |
|-------|----------|---------|
| `url` | yes | URL slug |
| `image` | yes | Cell thumbnail (public path) |
| `title` | yes | Cell title |
| `subtitle` | no | Second line on the cell |
| `redirectUrl` | no* | External tool link (same tab) |
| `content` | no* | HTML body for inline guide |

\*Use **`redirectUrl`** or **`content`** per entry, not both.

---

## Image search (`/image-search`)

Reverse-image upload/URL tool: `src/pages/ImageSearchPage.jsx`, `src/components/imageSearch/`. **`/reverse-image-search`** redirects here.

Setup and env (Supabase Storage primary; optional Cloudflare Worker + R2): **`supabase/README-image-search.md`**, **`workers/image-search-api/README.md`**.

---

## `src/` layout (high level)

```
src/
  App.jsx              # Routes
  pages/               # One file per route
  components/          # Shared UI (header, blog grid, linksHub/, imageSearch/, home/, …)
  constants/           # e.g. featuredExtensionSlugs.js
  content/             # Privacy / terms JSX per slug
  data/                # apps.json, blog.json, guides.json, analytics JSON
  utils/               # apps.js, appDisplayText.js, blog.js, guides.js, …
  config/              # e.g. Supabase client
```

Static assets: **`public/`** (favicon, `blog-images/`, `guides-images/`, `image-search/`, downloads).

---

## `back-end/` layout (high level)

Node **build and sync scripts** only — not deployed as an API for the static site (Vite plugins may expose dev-only endpoints).

Important scripts:

- `generate-blog-manifest.mjs` — blog pipeline
- `generate-sitemap.mjs`
- `generate-all-extensions.mjs` — public catalog in `src/data/all-extensions.json` (app source of truth for marketing UI) and `public/all-extensions.json` (URL feed)
- `extract-chrome-apps.mjs` / `sync-apps-custom-data.mjs`
- `fetch-website-analytics.mjs`, `fetch-youtube-videos.mjs`, …

See `package.json` `"scripts"` for the full chain.

---

## `admin/`

Internal dashboards (HTML/JS) for extension accounts, quotas, churn, etc. Linked from extension ops docs in sibling repos; not part of the React app routes.

---

## Blog writing, SEO, and voice

**If the user asks about blog posts, SEO, content briefs, keywords, schema, or how-tos for the site:**

1. **`back-end/seo-documentation.md`** — SEO workflow, links into vendored `back-end/claude-seo/`, blog checklist, manifest/sitemap commands.
2. **`back-end/writing-style.md`** — Coded Citadel blog voice (derived from existing `blogs/*.md`), frontmatter rules, structure.

Also useful:

- **`samples/seo-google-guide.md`** — Google Search fundamentals (local reference).
- **`blog-redirects.json`** — old slug → new slug when renaming posts.
- **`redirects.json`** — path → external URL for marketing short links (CWS, partner tools, etc.).

Do **not** invent blog voice from generic SEO templates alone; follow **`writing-style.md`** and **`seo-documentation.md`** together.

---

## Deploy

Site is static output from Vite (`dist/`). `publish-to-github.bat` / CI pushes to GitHub Pages. Environment secrets for analytics live in `.env` (not committed); see `back-end/lib/load-env.mjs`.

---

## Quick agent checklist

- [ ] Read this file for scope (SPA vs `blogs/` vs `back-end/`).
- [ ] Blog change → edit `blogs/*.md` → **`npm run generate-blog-manifest`** manually (optional **`npm run apply-blog-views`**).
- [ ] Reel / guides hub → edit `src/data/guides.json` (+ images in `public/guides-images/`) → `npm run generate-sitemap`.
- [ ] Homepage hero / sections / spacing → `HomePage.css`, `CC__home-section`, `src/components/home/*`.
- [ ] Homepage tools row → edit `src/data/home-tools.json`.
- [ ] Homepage Instagram reels → edit `src/data/home-instagram-reels.json` or run **`npm run sync-home-instagram-reels`**.
- [ ] Homepage “Most popular” → `src/constants/featuredExtensionSlugs.js` (`HOME_MOST_POPULAR_LIMIT`).
- [ ] Homepage extension pills / hidden apps / `homeCategory` → **`shared/home-extension-catalog.mjs`** (re-exported in `homeExtensionFilters.js`).
- [ ] Public extension feed or homepage catalog data → **`back-end/lib/public-extensions-feed.mjs`** → **`npm run generate-all-extensions`** → commit `src/data/all-extensions.json` + `public/all-extensions.json`.
- [ ] Extension card or landing tagline/title → **`appTagline()`** / **`appFilterLabel()`**; fix English in `apps.json` or `apps-custom-data.json` after scrape if needed.
- [ ] Extension page copy (long body) → often `apps.json` or store scrape + `sync-apps-custom-data`.
- [ ] SEO / blog writing task → open **`back-end/seo-documentation.md`** and **`back-end/writing-style.md`**.
