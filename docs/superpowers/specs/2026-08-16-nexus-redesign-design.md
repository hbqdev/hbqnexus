# Nexus redesign — design spec

**Date:** 2026-08-16
**Branch:** `features-design` (staging) → merges to `dev` (production)
**Direction:** Concept B, variation V1 — full-bleed painting hero

---

## Goal

Replace the current generic light theme with a design built around the two things
that actually make this site personal: the owner's digital paintings and the
hand-made service icons. Split the single scrolling experience into distinct
views. Keep every CLI authoring workflow working.

## Non-goals

- No change to how content is authored, beyond one optional new field.
- No migration to a static site generator. It stays a Vue SPA.
- No live service status. Deferred; it needs data that does not exist.
- No change to the API server beyond what the security phase already landed.

---

## What must not break

The site is a CLI-driven content system. These keep working unchanged:

| Command | Writes | Notes |
|---|---|---|
| `npm run add-service` | `services.json`, generates SVG icon | Gains one optional prompt (see below) |
| `npm run post` | `registry.json`, `src/posts/<slug>/` | create/edit/publish/delete/list/preview |
| `npm run gallery` | `gallery.json`, thumbnails | Gains a hero-size derivative |
| `npm run update-icons` | `services.json` | Unchanged |

Rendering stays generic over JSON. A category invented at the CLI must appear
with no code edit. A service must render from its four fields alone.

---

## Route structure

Today `/` carries the service grid while `/blog` and `/gallery` exist but are
buried under a banner and a quote that render on every route.

| Route | Now | After |
|---|---|---|
| `/` | Banner + quote + all 17 services, 3163px tall | Painting hero + featured subset of each area |
| `/services` | — | **New.** All 17, grouped by category, with filter |
| `/blog` | Banner + quote + off-centre list | Own view. No banner, no quote |
| `/blog/:slug` | ~110ch measure, quote above title | Own view, 65–75ch measure, serif |
| `/gallery` | Banner + quote + grid | Own view, full-bleed, grid-size control kept |
| `*` | Renders blank chrome | **New.** 404 view |

**The announcement banner and `RandomQuote` move out of `router-view`.** They
currently sit inside it in `App.vue`, which is why they appear on every page.
The quote moves into the hero. The banner is **kept** (the owner likes it) but
restyled and scoped to `/`:

- Three stacked centre-aligned lines in a grey box (~145px) become **one inline
  row** (~40px) with separators, on the dark surface. Same three messages, same
  emoji, same Discord handle.
- Dismissible via an `×`, persisted in `localStorage` under a **banner version
  key** — changing the message brings it back for people who dismissed the old
  one, which a plain boolean would not do.
- Wraps to multiple lines on narrow screens; separators hide below 720px.

---

## Home composition

1. **Hero** — full-bleed painting, gradient veil toward the bottom, rotating
   quote in serif, painting credit chip, stat row (services / films / essays /
   paintings). Slow 26s scale drift, disabled under reduced motion.
   *Known cost of V1: the veil darkens the painting's upper tonal range. Keep
   the veil as light as legibility allows — target 4.5:1 on the quote text and
   no more veil than that requires.*
2. **Services** — featured subset (6–8) + category pills + `All 17 services →`
3. **Writing** — latest 2 posts + `All writing →`
4. **Gallery** — 4 paintings + `All paintings →`
5. **Footer** — access instructions, Discord handle

Featuring serves visitors; `⌘K` search and `/services` serve the owner's daily
use. Both audiences are handled rather than traded off.

---

## Content model change

One new **optional** field:

```json
{ "name": "TinFlix Stream", "url": "...", "icon": "...", "description": "...", "featured": true }
```

- `addService.js` gains one prompt: *"Feature on the home page? (y/N)"*
- Absent or `false` behaves exactly as today. Existing entries need no edit.
- If **no** service is marked featured, home falls back to the first two of each
  category, so the page is never empty.

This is the only schema change in the redesign.

---

## Quote animation system

Nine entrance animations, chosen at random per quote:

- **Whole-line:** `rise`, `blur`, `scale`, `slide`, `tilt`, `wipe`
- **Per-word staggered:** `words` (38ms), `cascade` (30ms), `focus` (26ms)

Rules:
- Never the same animation twice in a row; never the same quote twice in a row.
  Unconstrained randomness clusters, and repeats read as a bug.
- Per-word variants split text into `<span class="w" style="--i:N">`; the
  stagger is `calc(var(--i) * Nms)` in CSS. JS only assigns the index.
- Replay requires remove class → force reflow (`void el.offsetWidth`) → re-add.
  Re-adding alone does nothing; the browser sees no change.
- `prefers-reduced-motion: reduce` collapses all nine to a 300ms fade via one
  override.

The quote still fetches from `/api/random-quote`, keeping the Couchbase path.
The 5 hardcoded fallbacks stay for when the API is unreachable.

---

## Image pipeline

Gallery originals are **3600×3300, up to 9.4MB**. Unusable as a hero.

`gallery-manager.js` gains a third derivative alongside the existing thumbnail:

| Derivative | Size | Purpose |
|---|---|---|
| `thumbnails/<id>_thumb.jpg` | existing | grid |
| `heroes/<id>_hero.webp` | 1920px wide, q78 | home hero |
| `images/<id>.jpg` | untouched | lightbox |

A backfill script generates heroes for the 5 existing paintings. Hero markup
uses `<picture>` with a webp source and jpg fallback, `fetchpriority="high"`.

**Hero selection: random per visit**, from paintings only. Different first
impression each time, at no authoring cost.

---

## Theme

Dark-first. The service icons carry baked-in brand colours drawn for dark
surfaces; they glow on navy and flatten on near-white. Light mode remains
available via the existing toggle but dark is the default and the designed case.

Theme is applied by an inline script in `index.html` before first paint — the
current `useTheme` applies it in `onMounted`, so dark-mode users get a white
flash on every load. **That inline script needs a CSP hash added to
`vite.config.js`**, since `script-src` is `'self'` with no `'unsafe-inline'`.

`useTheme` also becomes a module-level singleton. It currently creates fresh
refs per call, so a second component using it would silently desync.

---

## Known issues folded in

Fixed as part of this work because the redesign touches the same code:

- Ragged grid — News (1 service) leaves two-thirds of a row empty
- Post measure ~110 characters per line
- Blog list container is visually off-centre
- No 404 route
- Nav does not collapse on mobile (6 items at 640px)
- Quote refresh control is a `<div>` with `@click` — not keyboard reachable
- Modals have no Esc handler or focus trap
- 1.1MB JS bundle: `highlight.js` eagerly imports every language grammar

## Deferred

- Per-service live status (Concept A) — needs data that does not exist
- Curator rewrite — agreed, tracked separately
- Express 4→5 and `couchbase` bump for the remaining 22 CVEs
- Per-post meta / Open Graph / RSS / sitemap — real work, its own phase

---

## Open decisions

1. **Featured flag** — confirm the `addService.js` prompt is acceptable.

Resolved: the banner stays, restyled as a slim single row on `/` only.
