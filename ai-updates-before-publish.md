# AI pre-publish review checklist

Use this before the user pushes to GitHub / deploys. Goal: catch stale generated data, broken thank-you flows, and missing manual entries.

---

## 1. Run a full build

```bash
npm run build
```

`npm run build` is not optional. It chains extraction, data sync, quick-start generation, stats, YouTube, live analytics, sitemap, Vite, and (postbuild) dev.to sync.

If the build fails, fix it before publishing. Do not push with a broken build.

---

## 2. Extension descriptions → `quickStart` (thank-you page)

**The “description thingy.”** On every build:

1. [`back-end/generate-quick-start.mjs`](back-end/generate-quick-start.mjs) reads `description.full` from [`src/data/apps.json`](src/data/apps.json).
2. It writes `quickStart` + `quickStartHash` into [`src/data/apps-custom-data.json`](src/data/apps-custom-data.json).
3. A second `sync-apps-custom-data` merges those fields back into `apps.json`.

**AI must verify:**

- [ ] Store descriptions with a **HOW IT WORKS** or **HOW DOES IT WORK** section use **verbatim numbered/bullet steps** in `quickStart` (not paraphrased summaries).
- [ ] Steps that mention opening the popup/extension include `/images/extension-toolbar-hint.jpg`.
- [ ] After a description edit, `quickStartHash` changed for that extension (proves regeneration ran).
- [ ] Spot-check thank-you pages:
  - `/thank-you?source=hide-reposts-for-bluesky` — YouTube hero when `youtubeHowToUse` is set.
  - `/thank-you?source=ai-bookmark` — no video hero; centered copy; steps match store description.
  - Unknown `?source=` — fallback steps still render.

**If quick-start looks wrong:** inspect the source description in `apps.json`. Fix the Chrome listing text or improve the parser in `generate-quick-start.mjs` (bump `GENERATOR_VERSION` to force regen).

---

## 3. Chrome Web Store HTML export (`apps.json`)

When fresh HTML exists in `chrome-extension-html/html/`:

- `maybe-extract-chrome-apps` runs `extract-chrome-apps.mjs` and refreshes [`src/data/apps.json`](src/data/apps.json) (descriptions, analytics, screenshots, versions, etc.).
- When `html/` is empty (CI), it only syncs custom data into existing `apps.json`.

**AI must verify:**

- [ ] New or updated extensions appear in `apps.json` with correct `slug`, `chromeExtensionId`, and `description.full`.
- [ ] [`src/data/apps-custom-data.json`](src/data/apps-custom-data.json) has a matching entry (`id` + `slug`) for every extension. New apps without a custom entry get a placeholder slug until fixed.
- [ ] Manual custom fields are still present after sync: `github`, `youtube`, `youtubeHowToUse`, `tags`, `related`, `category`, `prompts`, `estimatedTime`, `status`, `download`, etc.

---

## 4. `apps-custom-data.json` manual fields

Generated fields (`quickStart`, `quickStartHash`) are build-owned. Everything else is human/AI curated.

**Before publish, confirm per extension (especially new ones):**

| Field | Used for |
|--------|----------|
| `slug` | Routes, thank-you `?source=`, blog links |
| `status: "live"` | Apps grid, cross-promo on thank-you |
| `youtube` | Build-story video on app page |
| `youtubeHowToUse` | Thank-you hero embed (only extension with this today: Bluesky) |
| `github` | App page + changelog fetch |
| `tags`, `related`, `category` | Filters, related apps, thank-you “more tools” |
| `download` | Direct Chrome Web Store link when needed |

---

## 5. Blog posts

**Build steps:** `import-blog-screenshots` → `generate-blog-manifest` → writes [`src/data/blog.json`](src/data/blog.json) + HTML under `public/blog-content/`.

**AI must verify:**

- [ ] New/changed files in [`blogs/`](blogs/) are reflected in `blog.json` after build.
- [ ] Frontmatter is valid: `title`, `slug`, `date`, `tags`, `download` (store URL), `thumbnail` / cover when used.
- [ ] Screenshot imports: build log should not report missing `D:/GoogleChromeDownloads/...` sources if the post expects a cover.
- [ ] **postbuild** `maybe-sync-devto` runs when `blogs/` changed — confirm dev.to sync succeeded if the user cares about dev.to.

---

## 6. Portfolio & live stats

Generated/updated during build:

- [`src/data/portfolio-analytics.json`](src/data/portfolio-analytics.json) — prebuild
- [`src/data/portfolio-analytics.json`](src/data/portfolio-analytics.json) + [`src/data/website-analytics.json`](src/data/website-analytics.json) + [`src/data/extension-changelogs.json`](src/data/extension-changelogs.json) — `fetch-live-stats`
- Homepage meta in [`index.html`](index.html) via `generate-home-meta`
- [`public/sitemap.xml`](public/sitemap.xml)

**AI must verify:**

- [ ] `/live-stats` Extensions tab: KPIs, charts, **Top 10 Extensions** (active users), **Page Views by Source** side by side.
- [ ] App cards show **“Published X days ago”** (from publish date, not category).
- [ ] Changelog **“New”** badge uses a **7-day** window (`extensionChangelogs.js`).

---

## 7. YouTube channel data

- `fetch-youtube` refreshes [`src/data/youtube-videos.json`](src/data/youtube-videos.json).
- Blog covers and app `buildStory.youtubeUrl` may depend on this.

**Verify:** no broken YouTube embeds on app pages or blog posts that reference channel videos.

---

## 8. UI / routing smoke checks

| URL | What to check |
|-----|----------------|
| `/apps` | Grid, random link goes to `/apps/{slug}` not Chrome Store |
| `/apps/{slug}` | Hero, changelog pagination, gallery |
| `/thank-you?source={slug}` | Hero, quick-start steps, more-tools cards |
| `/live-stats` | Extensions / Website / Changelog tabs |
| `/blog` + new post slug | Renders, download link, images |

---

## 9. Assets & secrets

- [ ] Do **not** commit `.env`, API keys, or `chrome-extension-html/html/` exports unless the user explicitly wants them.
- [ ] `public/images/extension-toolbar-hint.jpg` exists if thank-you quick-start references it.
- [ ] New static assets live under `public/` with correct `BASE_URL` paths.

---

## 10. Git / deploy

Only commit when the user asks. When they do:

- [ ] `git status` — expect changes in generated JSON, `apps-custom-data.json`, `dist/` is gitignored.
- [ ] Meaningful commit message (why, not just “update files”).
- [ ] Push triggers GitHub Pages deploy — if deploy fails with a transient Pages error, re-run the workflow.
- [ ] After deploy, re-run dev.to sync if blog covers pointed at the live site and 404’d on first try.

---

## 11. New extension checklist (end-to-end)

1. Export Chrome Web Store HTML → `chrome-extension-html/html/`
2. Add entry to `apps-custom-data.json` (`id`, `slug`, metadata)
3. Run `npm run build`
4. Confirm `quickStart` steps match the listing’s HOW IT WORKS section
5. Add blog post in `blogs/` if shipping a launch post
6. Test `/apps/{slug}` and `/thank-you?source={slug}`
7. Commit + push when user requests

---

## Quick command reference

```bash
npm run build                          # full pipeline
npm run maybe-generate-quick-start     # quickStart only
npm run sync-apps-custom-data          # merge custom data → apps.json
npm run extract-chrome-apps            # force HTML scrape (when html/ has exports)
npm run sync:devto                     # force dev.to publish
npm run fetch-extension-changelogs:force
npm run fetch-website-analytics:force
```

---

*Last aligned with repo state: quick-start from descriptions, thank-you hero/steps, Top 10 Extensions chart, 7-day changelog “New” badge.*
