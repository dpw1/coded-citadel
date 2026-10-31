# Image Search API (Cloudflare Worker + R2)

Presigned upload + 15-minute link TTL and object purge for [codedcitadel.com/image-search](https://codedcitadel.com/image-search).

## Prerequisites

1. Cloudflare account (free tier is enough).
2. `wrangler login`
3. Create **R2 bucket**: `codedcitadel-image-search-uploads` (or change names in `wrangler.toml`).
4. Create **KV namespace** → paste id into `wrangler.toml` (`YOUR_KV_NAMESPACE_ID`).
5. Set **`account_id`** in `wrangler.toml` (`YOUR_ACCOUNT_ID`).
6. R2 → **Manage R2 API Tokens** → Object Read & Write on the bucket.

## Secrets

From this directory:

```bash
npm install
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put R2_ACCOUNT_ID
```

(`R2_ACCOUNT_ID` is the same as your Cloudflare account id.)

## R2 CORS (browser PUT upload)

In the bucket **Settings → CORS**, allow:

- **Origins**: `https://codedcitadel.com`, `http://localhost:5173`
- **Methods**: `PUT`, `GET`, `HEAD`
- **Headers**: `Content-Type`

## Deploy

```bash
npm run deploy
```

Note the `*.workers.dev` URL, e.g. `https://image-search-api.<subdomain>.workers.dev`.

## Landing page build

Set GitHub Actions secret or local `.env`:

```env
VITE_IMAGE_SEARCH_API_URL=https://image-search-api.<subdomain>.workers.dev
```

Rebuild the Vite site so uploads work in production. URL-only search works without this variable.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/uploads` | `{ "content_type" }` → presigned PUT + `get_url` (900s) |
| `DELETE` | `/v1/uploads` | `{ "key" }` → delete object (client timer / best-effort) |
| `OPTIONS` | `/v1/uploads` | CORS |
| `GET` | `/health` | `{ "ok": true }` |

## 15-minute deletion

- Presigned **GET** URLs expire in **900 seconds** (`LINK_TTL_SECONDS`).
- KV records `deleteAfter` per object; **cron every 5 minutes** deletes R2 objects when due.
- R2 list pass removes orphans older than **900 seconds** (`PURGE_AGE_SECONDS`).

## Local dev

```bash
npm run dev
```

Point the React app at the local or deployed worker via `VITE_IMAGE_SEARCH_API_URL`.
