# Gotchas

A running log of things that cost time on this project. Agents read it at
the start of every session and add to it when they hit something new (see
the Session protocol in `AGENTS.md`). Never delete an entry — update its
`Status` instead.

Lessons from earlier builds are in the skill, not here:
`.claude/skills/webflow-build/lessons/` (one file per area). Read the file
for the area you work in. Entries tagged `Scope: template-candidate` are
collected from client repos into those files.

## Entry format

```md
### YYYY-MM-DD · Short title
- Area: designer | css | loader | release | mcp | ci | js | perf
- Scope: project | template-candidate
- Symptom: what was observed
- Cause: why it happened
- Fix: what was done, or the workaround
- Status: open | fixed <sha> | upstreamed wf-template <sha>
- Found by: claude | codex | human
```

## This project

<!-- Add new entries here, newest first. -->

### 2026-10-09 · Finsweet still loaded by script tags in head (template deviation)
- Area: loader
- Scope: project
- Symptom: `loader.html` piece 1 carries the Finsweet CMS Load and Smart
  Lightbox `<script>` tags, which the template forbids (Finsweet goes
  through the webflow-build skill's `recipes/finsweet/`).
- Cause: kept as-is from live during the migration from hamounbv/pomp to
  keep the cutover small.
- Fix: TODO — port both attributes to the recipe, drop the tags.
- Status: open
- Found by: claude

### 2026-10-09 · Colour variables redefined with names from another project?
- Area: css
- Scope: project
- Symptom: `src/styles.css` §01 (pomp §02) redefines Webflow colour
  variables (`--_colors---black`, `jet-black`, `hsa-green`, `peach`,
  `vanilla`, `white`, `gradient--green-*`, `gradient--highlight-*`,
  `gradient--peach-*`) as OKLCH / Display-P3. Pomp's brand is the blue
  `#392AE3`; hsa-green / peach / vanilla / jet-black look like another
  client's palette.
- Cause: unknown; pre-existing in hamounbv/pomp v1.0.0 (live).
- Fix: none yet. Check every name against this site's Webflow variables.
  Names that don't exist are dead code; names that do exist are silently
  overridden by this block on P3/OKLCH browsers (i.e. nearly all), so the
  Designer value for them never shows. Tagged `override-webflow`.
- Status: open — pre-existing, needs approval/review. Do not delete
  without the user's approval.
- Found by: claude

### 2026-10-09 · :root font-size set by repo CSS (pomp's own scaling)
- Area: css
- Scope: project
- Symptom: `src/styles.css` §01 (pomp §01 Token Hub) sets `font-size` on
  `:root` via `--size-font` (fluid between per-breakpoint min/max frames),
  which AGENTS.md forbids without approval. Every rem in the Designer
  scales with it.
- Cause: pre-existing in hamounbv/pomp v1.0.0; the live site's layout
  depends on it, so the template's §01 body-only Osmo scaling was not
  adopted. Note the tablet/mobile frames (`--size-container-min` 480px at
  ≤767px, while ideal is 430) are as live has them.
- Fix: none — kept so live rendering does not move. Tagged
  `override-webflow`.
- Status: open — pre-existing, needs approval/review.
- Found by: claude

### 2026-10-09 · Other pre-existing override-webflow rules and Webflow variable references
- Area: css
- Scope: project
- Symptom: rules ported from hamounbv/pomp that override the Designer or
  read Webflow variable names (AGENTS.md CSS policy items 3–4):
  - §01 aliases `--_colors---accent`, `--_colors---bg--dark`,
    `--_colors---text-color--light`;
  - §06 `[data-theme='dark']` / `[data-theme='dark-transparent']` read
    `--_colors---bg--dark`, `--_colors---text--light` (note: `text--light`
    vs `text-color--light` in §01 — one of them is probably wrong);
  - §05 `.filter-radio-button.w--redirected-checked ~ …` reads
    `--_colors---fg--blue`;
  - §06 `[data-bottom-padding='0']` forces `padding-bottom: 0 !important`;
  - §05 hero ground: `background-color` on `.home-hero-default-bg` and its
    video/image (Designer could set it; kept as the failsafe);
  - §08 hides `.w-webflow-badge`, `.g-embed-code`, `.cms-filter` with
    `!important` (was the inline head `<style>`);
  - §02 base reset hides scrollbars globally and sets `body { width: 100vw }`.
- Cause: pre-existing; ported unchanged so the migration is rendering-neutral.
- Fix: review each with the user; move what the Designer can own into the
  Designer. A renamed Webflow variable silently breaks the `var()` reads.
- Status: open — pre-existing, needs approval/review.
- Found by: claude

### 2026-10-09 · Live loads the old stylesheet twice and colon-break twice
- Area: loader
- Scope: project
- Symptom: live pages request `hamounbv/pomp@1.0.0/css/pomp.min.css`
  twice (head code plus somewhere else, probably an Embed), and still load
  the registered script `colon_break-1.0.0.js` alongside `pomp.min.js` §4.
- Cause: cutover steps from hamounbv/pomp's README not fully done.
- Fix: covered by docs/handoff/MANUAL-TODO.md › Cutover. Not verifiable
  from the repo (no Webflow access in the migration session).
- Status: open
- Found by: human

<!-- Carried over from hamounbv/pomp GOTCHAS.md (commit shas refer to that repo). -->

### 2026-08-21 · Homepage went black when the hero video failed
- Area: css
- Scope: template-candidate
- Symptom: Full-viewport black hero while the video loads or if it fails to
  decode.
- Cause: The video, its wrapper and the section are transparent, so only a
  black gradient painted the area.
- Fix: `css/pomp.css` §09 (now `src/styles.css` §05, "pomp §09") paints `--brand-ground` behind the hero;
  `js/pomp.js` §5 (now `src/modules/hero-video-guard.ts`) retries a blocked autoplay once and marks the wrapper
  `data-hero-video="failed"` after 6 s. Hero videos ship with a `poster`.
- Status: fixed hamounbv/pomp 682fd0f
- Found by: human

### 2026-08-21 · Page loader had no exit except a Webflow interaction
- Area: css
- Scope: template-candidate
- Symptom: Risk of a permanent full-screen overlay.
- Cause: `.g-page-loader` is fixed at `z-index: 2147483647` and only the
  page-load interaction sets `display: none`.
- Fix: 4 s CSS fade-out backstop in §09, disabled on the canvas via
  `html.wf-design-mode` and skipped under reduced motion.
- Status: fixed hamounbv/pomp 682fd0f
- Found by: human

### 2026-08-21 · One failing inline script took out the rest of the footer
- Area: js
- Scope: project
- Symptom: A throw (e.g. Lenis init `ReferenceError` when GSAP was missing)
  stopped every later script in the same block.
- Cause: The old footer ran everything as two large inline blocks.
- Fix: `js/pomp.js` runs each module (now `run()` in `src/index.ts`) on `DOMContentLoaded` in its own
  `try/catch`, with `gsap`/`ScrollTrigger` guarded (README "What changed").
- Status: fixed hamounbv/pomp 682fd0f
- Found by: human

### 2026-08-21 · Colon-break logic shipped twice
- Area: js
- Scope: project
- Symptom: The registered script `colon_break-1.0.0.js` duplicated the
  inline colon-break code.
- Cause: Logic was added both as a registered script and inline.
- Fix: `js/pomp.js` §4 owns it (now `src/modules/colon-break.ts`); the registered script must be deleted in
  Site settings → Custom code (manual Webflow step; docs/handoff/MANUAL-TODO.md › Cutover).
  Not verifiable from the repo.
- Status: open
- Found by: human

### 2026-08-21 · Repo CSS is not visible on the Designer canvas
- Area: designer
- Scope: project
- Symptom: Designer canvas renders without the site's custom styles.
- Cause: The CSS `<link>` is in head custom code, which the canvas does not
  run.
- Fix: temporary Embed with an inline copy while designing, deleted before
  publish; it drifts unless refreshed (README "Known trade-off"). Prefer
  moving styles into the Designer.
- Status: fixed by the migration to brandvm/pomp once cut over — the
  template's Embed 2a links the staging stylesheet, which the canvas
  renders. Until cutover: documented.
- Found by: human
