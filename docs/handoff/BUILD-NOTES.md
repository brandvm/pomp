# Build notes

What the build handoff needs (see the skill's `checklists.md` › Build
handoff). Kept current during the build, not written at the end. No
credentials here: name the vault entry instead.

## Migration from hamounbv/pomp (2026-10-09)

This repo replaces `hamounbv/pomp`, the hand-maintained repo that live
still loads (`cdn.jsdelivr.net/gh/hamounbv/pomp@1.0.0/{css/pomp.min.css,js/pomp.min.js}`).
That repo is frozen: do not push to it or tag it. Live keeps working on it
until the cutover in `MANUAL-TODO.md` is done.

### Where everything went

| hamounbv/pomp | brandvm/wf-pomp |
| --- | --- |
| `js/pomp.js` §1 Service slider (Swiper) | `src/modules/service-slider.ts` — Swiper 11 bundled (core + Navigation + Autoplay) |
| `js/pomp.js` §2 Lenis | `src/modules/lenis.ts` — lenis@1.1.5 bundled; `window.lenis` kept; skipped in the Editor |
| `js/pomp.js` §3 NavShrink | `src/modules/nav-shrink.ts` |
| `js/pomp.js` §4 ColonBreak | `src/modules/colon-break.ts` |
| `js/pomp.js` §5 HeroVideoGuard | `src/modules/hero-video-guard.ts` |
| `js/pomp.js` INIT (per-module try/catch) | `run()` in `src/index.ts`, same order |
| `css/pomp.css` §01–§09 | `src/styles.css`, original rule order (section map in its header) |
| head `<style>` (Lenis, dev-support hiding) | `src/styles.css` §04 and §08 |
| head Swiper CDN stylesheet | `src/styles.css` §00 (`@import 'swiper/css'` + navigation) |
| footer Swiper / Lenis CDN scripts | bundled into `dist/index.js` |
| head GA4, Ahrefs, theme-color, Finsweet, JSON-LD | `loader.html` piece 1 (JSON-LD `sameAs` now filled with the footer's Instagram and LinkedIn links) |
| `webflow/_footer.html` | `loader.html` piece 3 |
| `GOTCHAS.md` entries | `GOTCHAS.md` (carried, shas refer to hamounbv/pomp) |

Behaviour is meant to be identical. Differences in the port:

- Swiper and Lenis come from the bundle, not globals: `window.Swiper` and
  `window.Lenis` no longer exist. Nothing in the old code read them
  outside pomp.js; if a page Embed does, it breaks — check at cutover QA.
- Only Swiper core + Navigation (+ Autoplay, which has no CSS) CSS ships.
  swiper-bundle.min.css also had pagination, scrollbar and effect styles;
  nothing initialises those modules, but a Designer style relying on a
  `.swiper-pagination*` class from that sheet would lose it.
- Module init now runs when the dynamically appended bundle executes
  (after `DOMContentLoaded`, usually), rather than on `DOMContentLoaded`
  from a deferred tag.
- The template's `html.is-loading` pre-paint scroll lock is in use
  (loader piece 1 + `src/styles.css` §04); `src/index.ts` releases it before
  Lenis initialises.
- Lenis options are passed verbatim; `direction`, `gestureDirection`,
  `smooth`, `mouseMultiplier`, `smoothTouch` are pre-1.0 names that 1.1.5
  ignores (same as live). Swiper's top-level `addSlidesBefore/After` are
  ignored the same way.

### Deviations from wf-template left in place

- `src/styles.css`: template §01 Osmo body scaling, §02 resets, §03 `.w-*`
  internals, §05/§06 template utilities, §07 focus rings and §08 editor
  helpers are not adopted; pomp's own scaling (`font-size` on `:root`)
  and reset are kept. Reason: rendering-neutral migration. Section order
  is pomp's, so §06 UTILITIES sits before §05 (see the note in the file).
- Finsweet CMS Load and Smart Lightbox stay as script tags in head code
  instead of `recipes/finsweet/` (TODO in `loader.html`, `GOTCHAS.md`).
- Pre-existing `override-webflow` rules and Webflow variable references
  are kept, each listed in `GOTCHAS.md` as needing approval/review.

### Cutover history (from hamounbv/pomp README)

hamounbv/pomp v1.0.0 consolidated, on 2026-08-21:

- the 14 KB inline stylesheet from the `G | Embed Code` body component
  into `css/pomp.css`, plus a new §09 of failsafes;
- the four inline footer scripts (Swiper init, Lenis init, NavShrink,
  colon-break) plus a new hero video guard into `js/pomp.js`.

Its one-time cutover was: replace head/footer custom code with its
snippets; delete the `G | Embed Code` component; make sure none of the old
inline footer survived; delete the registered script
`colon_break-1.0.0.js`; per-page schema, canonicals and CMS template SEO
bindings were Webflow UI work in a separate fix kit. As of this migration
live still loads the stylesheet twice and still loads
`colon_break-1.0.0.js`, so that cutover was not finished.

### What v1.0.0 changed vs the original inline code

Every difference was deliberate; all carry over into this repo.

| Change | Why |
| --- | --- |
| Swiper init rewritten from jQuery `$(...).each()` to `querySelectorAll` | Same behaviour, no jQuery load-order dependency; skips an already-mounted slider. |
| Lenis instance exposed as `window.lenis` | Future modules can scroll through Lenis instead of fighting it. |
| Lenis guards `ScrollTrigger` / `gsap`, plain rAF fallback | The old code threw a `ReferenceError` without GSAP and killed the rest of the block. |
| Every module in its own `try/catch` | One failing module no longer stops the others. |
| Swiper/Lenis loaded with `defer` | Were parser-blocking. (Now bundled.) |
| **New:** page-loader backstop (pomp §09) | `.g-page-loader` is fixed at `z-index: 2147483647` and only the Webflow page-load interaction hides it; a 4 s CSS fade-out now does regardless. |
| **New:** hero ground + hero video guard | The black-homepage fix: `--brand-ground` behind the transparent hero; autoplay retried once; wrapper marked `data-hero-video="failed"` after 6 s. |
| Removed `.pre-loader { display: flex; }` | No element on the site carries that class (checked on ten pages). |
| Removed the duplicate viewport meta with `maximum-scale=1` | It disabled pinch-zoom (Lighthouse a11y fail). Keep form inputs ≥ 16px to stop iOS focus zoom. |
| Added Ahrefs Analytics and the global JSON-LD | Both were missing; the site had no structured data on any of its 71 pages. |

### House rules (carried)

- Never edit CSS/JS inline in Webflow — style or behaviour goes in this repo
  (or the Designer, per the CSS policy in `AGENTS.md`).
- Any full-screen overlay gets a failsafe (see the page-loader backstop
  and its `html.wf-design-mode` exception).
- Media belongs on the Webflow CDN, not raw S3, and every hero video ships
  with a `poster`.
- Optional cleanups: self-host the three Google font families as WOFF2 and
  drop the `webfont.js` hop; lazy-load the duplicated partner-logo strip;
  confirm whether `recaptcha/api.js` (synchronous, render-blocking, in the
  head) is still needed by a live form.
- NavShrink toggles `.is-shrunk` on `.g-navigation-w`, `.s-g-navigation`
  and `.sw-g-nav`, but repo CSS only styles `.s-g-navigation.is-shrunk`;
  the others are presumably Designer combo classes — check before removing.

## CMS notes

How to edit what: each collection and its fields, which sections are
conditional on which field, and each component's props.

| Collection / component | How to edit | Notes |
| --- | --- | --- |
| | | |

## Integrations

| Service | What it does | Where it's configured | Vault entry |
| --- | --- | --- | --- |
| | | | |

## Changes log

Changes made during the build that differ from the approved design, and
who approved them.

- <Date> · <change> · <approved by>

## Redirect map

Every old URL → its closest new page, from the crawl saved in discovery.

| Old URL | New URL | Status |
| --- | --- | --- |
| | | 301 |

## Known issues

### Fix before launch

- Cutover from hamounbv/pomp@1.0.0 — `MANUAL-TODO.md` › Cutover · developer
- Review the pre-existing `override-webflow` rules and the foreign-looking
  `--_colors---*` names (`GOTCHAS.md`) · developer + user

### Fix after launch

- Move Finsweet to `recipes/finsweet/` and drop its head tags · developer
