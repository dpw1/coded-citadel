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

Dev: `npm run dev` · Production build: `npm run build` (runs several generators before `vite build`).

---

## Public routes (main app)

Defined in `src/App.jsx`:

| Path | Page | Notes |
|------|------|--------|
| `/` | Home | Extensions showcase, meta from generated home SEO |
| `/apps` | Apps grid | All Chrome extensions |
| `/apps/:slug` | Extension landing | Copy from `src/data/apps.json` |
| `/blog` | Blog index | Posts from `src/data/blog.json` |
| `/blog/:slug` | Blog post | Body HTML in `public/blog-content/{slug}.html` |
| `/live-stats` | Public stats | Portfolio / install analytics |
| `/profit` | Profit page | Build-in-public numbers |
| `/work` | Hire / portfolio | Client work |
| `/contact`, `/affiliate`, `/links`, `/guides`, `/image-search` | Marketing | See **Link-in-bio** and **Image search** below |
| `/thank-you`, `/uninstall`, `/success` | Extension flows | Query params for app feedback / Stripe |
| `/privacy-policy/:slug`, `/terms-of-service/:slug` | Legal | Per-app content in `src/content/` |
| `/davinci-resolve-plugins`, `/davinci-resolve-plugins/:slug` | DaVinci plugins | Separate product line |
| `/YFP`, `/yfp`, etc. | Short links | External URLs in `redirects.json` |

---

## Content you edit vs generated

| What | Source of truth | Generated into |
|------|-----------------|----------------|
| **Blog posts** | `blogs/*.md` (YAML frontmatter + Markdown) | `src/data/blog.json`, `public/blog-content/*.html` via `npm run generate-blog-manifest` |
| **Blog images** | Often imported from `blogs/` paths | `public/blog-images/` (`import-blog-screenshots`) |
| **Extension catalog** | Chrome Web Store scrape + overrides | `src/data/apps.json` (`extract-chrome-apps`, `sync-apps-custom-data`) |
| **Sitemap** | Routes + blog slugs + guide slugs | `public/sitemap.xml` (`generate-sitemap`); prerender list in `vite.config.js` |
| **YouTube embeds** | Channel fetch | `src/data/youtube-videos.json` |
| **Analytics snapshots** | GA / CWS scripts | `src/data/ga-db.json`, `website-analytics.json`, etc. |
| **Blog redirects** | `blog-redirects.json` | Merged in blog manifest |
| **Site short links** | `redirects.json` | External redirects in `src/App.jsx` via `StoreRedirectPage` |
| **Reel guides hub** | `src/data/guides.json` | `/guides` + `/guides/:slug` — see **Link-in-bio pages** below |

After changing **`blogs/*.md`**, run **`npm run generate-blog-manifest`** (or full `build`).

After changing **`src/data/guides.json`**, run **`npm run generate-sitemap`** (or full `build`).

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
  components/          # Shared UI (header, blog grid, linksHub/, imageSearch/, …)
  content/             # Privacy / terms JSX per slug
  data/                # apps.json, blog.json, guides.json, analytics JSON
  utils/               # apps.js, blog.js, guides.js, …
  config/              # e.g. Supabase client
```

Static assets: **`public/`** (favicon, `blog-images/`, `guides-images/`, `image-search/`, downloads).

---

## `back-end/` layout (high level)

Node **build and sync scripts** only — not deployed as an API for the static site (Vite plugins may expose dev-only endpoints).

Important scripts:

- `generate-blog-manifest.mjs` — blog pipeline
- `generate-sitemap.mjs`
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
- [ ] Blog change → edit `blogs/*.md` → `npm run generate-blog-manifest`.
- [ ] Reel / guides hub → edit `src/data/guides.json` (+ images in `public/guides-images/`) → `npm run generate-sitemap`.
- [ ] Extension page copy → often `apps.json` or store scrape + `sync-apps-custom-data`.
- [ ] SEO / blog writing task → open **`back-end/seo-documentation.md`** and **`back-end/writing-style.md`**.
