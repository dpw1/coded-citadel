# Image search — Supabase Storage setup

File uploads on `/image-search` use **Supabase Storage** when URL + publishable key are set at **build time**. URL-only search needs no Supabase.

## What you already did

| Variable | Used? |
|----------|--------|
| `SUPABASE_URL` | Yes — mapped to the app as `VITE_SUPABASE_URL` at build (see below) |
| `SUPABASE_PUBLISHABLE_KEY` | Yes — anon/publishable key for Storage from the browser |
| `SUPABASE_DB_PASSWORD` | **No** — Postgres only; never expose to Vite or GitHub Actions |

## 1. Create the bucket

1. Supabase Dashboard → **Storage** → **New bucket**
2. Name: **`image-search-uploads`**
3. **Private** (not public — engines use **signed URLs**, 15 minutes)

## 2. Storage policies

Open **SQL Editor** and run:

[`supabase/image-search-storage.sql`](../supabase/image-search-storage.sql)

That allows anonymous insert/select/delete only in that bucket (under `u/` for uploads).

## 3. 15-minute deletion (server backup)

1. **Database → Extensions** → enable **`pg_cron`**
2. **SQL Editor** → run [`supabase/image-search-retention.sql`](../supabase/image-search-retention.sql)

This schedules a job every **5 minutes** that deletes files in `image-search-uploads` older than **15 minutes**.

The app **also** deletes on its own when:

- the **15-minute timer** expires (signed URL TTL matches),
- the user clicks **Use a different image**, or
- the tab closes (`pagehide`, best-effort).

## 4. Environment variables

Vite only bundles variables prefixed with **`VITE_`**, or values injected in `vite.config.js`.

**Local `.env`** (either style works):

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJ...

# Or explicit VITE_ names (required for GitHub Actions secrets):
# VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

Optional fallback (Cloudflare instead of Supabase):

```env
VITE_IMAGE_SEARCH_API_URL=https://image-search-api.xxx.workers.dev
```

**Production (GitHub Pages):** add repository secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

(or keep `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` if your CI passes them into `vite build` the same way as local `.env`)

Do **not** add `SUPABASE_DB_PASSWORD` to CI or any `VITE_` variable.

## 5. Verify

1. `npm run dev` → open `/image-search`
2. Upload a small PNG — you should see engine links
3. Storage → `image-search-uploads` → file under `u/`
4. After reset or ~15 minutes, the object should disappear from Storage

## Alternative backend

See [`workers/image-search-api/README.md`](../workers/image-search-api/README.md) for Cloudflare R2 + Worker (used only if Supabase env is not set).
