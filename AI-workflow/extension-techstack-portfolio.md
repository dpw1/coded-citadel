# Chrome extension tech stack → apps.json

Use this when filling or refreshing `buildStory.techStack` and `buildStory.technicalHighlights` in [`src/data/apps.json`](../src/data/apps.json) from a local extension repo.

Each app should already have a `folder` field pointing at the local project (e.g. `D:\Web Dev\ChromeExtension\gmail-exporter`).

---

## Output shape (write into apps.json)

Under `buildStory`:

```json
{
  "techStack": ["JavaScript", "React 19", "Vite"],
  "technicalHighlights": "Two or three sentences. Proud developer voice. No bullets."
}
```

Also present the same content in chat using this exact structure:

### [Extension display name]

**Tech Stack**  
[comma separated list of the key technologies used]

**Technical Highlights**  
[2-3 sentences, confident and clear…]

---

## Rules

1. **Derive everything from the actual code.** Read `package.json`, `manifest.json`, build config, and the real source/imports. Do not guess or invent libraries.
2. **Verify imports, not only package.json.** Omit deps that are listed but unused (or only present in samples / dead code).
3. **Portfolio-meaningful tech only.** Include libraries and platform APIs a developer would care about on a resume (React, Zustand, Supabase, html2canvas, MAIN-world fetch patching, IndexedDB, Discord API, etc.).
4. **Skip build pipeline helpers.** Do not put these in tech stack: `build-and-zip.bat`, `generate-icons.mjs`, `strip-manifest-key.mjs`, zip/package scripts, Sharp-only icon generation, and similar internal tooling.
5. **Skip generic boilerplate** unless it plays an unusual role: ESLint, Prettier, dotenv, cross-env, etc.
6. **Prioritize interesting, non-obvious decisions** over obvious stack mentions. Prefer “what was hard / clever” over listing every framework.
7. **No backticks** in the written Tech Stack / Technical Highlights prose.
8. **No camelCase keys** in the prose (do not dump internal identifiers like storage key names).
9. **Keep it scannable.** A developer should understand what was technically interesting in under 10 seconds.
10. **Technical Highlights:** exactly **2–3 sentences**, no bullet points, written like a developer who is proud of the work — not like a README or internal docs.
11. **One extension at a time** unless the user explicitly asks to do several or all in one pass.
12. **Confirm `folder` first** if missing: map `slug` → local directory under the Chrome extensions root, then write `folder` on the app before analyzing.

---

## Suggested analysis pass

For each extension folder:

1. Open `package.json` (dependencies + scripts).
2. Open `manifest.json` (MV3, permissions, content scripts, side panel, OAuth, etc.).
3. Grep/skim for real imports of interesting libs and techniques: storage, IndexedDB, OAuth, fetch patching, MAIN-world scripts, MutationObserver, API clients, exporters (pdf-lib, jsPDF, SheetJS, JSZip, fflate), state (Zustand), auth (Supabase), etc.
4. Draft Tech Stack (short, comma-separated meaning in chat; JSON array in `apps.json`).
5. Draft Technical Highlights (2–3 sentences).
6. Write both into `apps.json` → `buildStory.techStack` and `buildStory.technicalHighlights`.
7. Remove obsolete fields like `technicalDescription` if present.

---

## Field names in apps.json

| Field | Purpose |
|-------|---------|
| `folder` | Absolute path to the local extension repo |
| `buildStory.techStack` | Array of key technologies |
| `buildStory.technicalHighlights` | Single string, 2–3 sentences |

Do not use camelCase names in the **user-facing markdown headings** — use **Tech Stack** and **Technical Highlights**.
