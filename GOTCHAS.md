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

### 2026-10-09 · Webflow snapshot rebuilt from published CSS (no MCP): what it can't know
- Area: mcp
- Scope: template-candidate
- Symptom: the style guide prototype needs `webflow-snapshot/variables.json`
  and `styles.json`, normally read through the Webflow MCP, but the
  connector was attached to another site and no MCP/API call was allowed.
- Cause: —
- Fix: `prototype/scripts/snapshot-from-css.mjs` rebuilds both from the
  live `*.webflow.shared.*.css`: collections from `--_<collection>---…`,
  aliases from `var(--x)` values, Body breakpoint modes from the `body`
  re-declarations at 991/767/479, `var:` bindings, states, breakpoints.
  It cannot recover: Designer names of classes, variables, groups and
  collections (slug → Title Case guesses; the unprefixed collection is
  called "Base collection"); mode names ("Tablet", "Mobile Landscape",
  "Mobile" assumed); breakpoint auto-modes vs Body tag-style modes (they
  publish the same; written as Body `variableModes`); which class in a chain
  is the base and which the combo; component-variant names (published as
  `:where(.w-variant-<uuid>)`); classes with no properties; element-level
  styles (`#w-node-…`, skipped); type of ambiguous variables (`140%` Size or
  Percentage; font stacks keep the first family); values as minified
  (`#fff`, `.5em`). Fonts are not part of either snapshot: the site's
  custom fonts (ABC Maxi Round Variable, Avenir Next; Integral CF for
  legacy classes) load in the prototype head from `src/css/fonts.css`,
  generated from the published @font-face rules (Webflow CDN URLs).
  Replace the snapshot with an MCP one when the connector is free and diff
  the two.
- Status: open — stand-in in use (prototype only)
- Found by: claude

### 2026-10-09 · Prototype generators lose large breakpoints and .w-- states; sg-grid collapses
- Area: css
- Scope: template-candidate
- Symptom: in the prototype starter, (1) `gen-webflow-css.mjs` only emits
  main/medium/small/tiny, so styles at Webflow's `large`/`xl`/`xxl`
  (min-width 1280/1440/1920; this site has 38 rules there) are silently
  dropped, and it turns every state into `:<state>`, so Current
  (`.w--current`) and the custom radio Checked/Focus
  (`.w--redirected-checked`/`-focus`) come out as invalid pseudo-classes;
  (2) `gen-style-guide.mjs` swatch and specimen grids render one column wide,
  because S Wrapper is a flex column with `align-items: flex-start` and
  `.sg-grid` hugs its content; (3) `nameOf` crashes on a class slug with
  `---` (`max-width---480px`); (4) a Spacing variable like
  `Radius/Full = 624.938em` becomes a bar wider than the page, and library
  tiles for full-viewport classes (Section combos) are 100vh tall each.
- Cause: the starter assumes the starter site's snapshot (four breakpoints,
  no class states, a Radius collection, small values).
- Fix: patched in this project's `prototype/scripts/` (not in the skill):
  min-width blocks and `.w--` states in `gen-webflow-css.mjs`;
  `.sg-grid { align-self: stretch }`, `.sg-tile { max-height: 18em }`,
  `.sg-bar { max-width: 100% }`, radii in a `Radius/` group get the Radius
  section, `filter(Boolean)` in `nameOf`. Worth upstreaming.
- Status: open — fixed in the prototype copy only
- Found by: claude

### 2026-10-09 · Starter prototype.css overrides an existing site's tag styles
- Area: css
- Scope: template-candidate
- Symptom: with a snapshot of an existing site, headings lost their
  weight, links their colour and images their sizing in the prototype.
- Cause: `prototype.css` (loaded last) carries stand-ins for the starter
  site's tag styles (`h1…p { margin: 0; font-weight: inherit }`,
  `a { color: inherit }`, `img {…}`) and a focus ring; this site's real tag
  styles are in the generated `webflow.css` and lose the tie.
- Fix: stand-ins removed from the prototype copy; Webflow's own base comes
  from `src/css/webflow-base.css` (generated from the published CSS).
- Status: fixed in the prototype copy
- Found by: claude

### 2026-10-09 · Styles still read deleted and Archived variables
- Area: css
- Scope: project
- Symptom: published CSS declares five deleted variables
  (`--outlines<deleted|variable-a17455e3>`, `link…9fec7aeb`,
  `dark-grey…132174cf`, `black…fc8d69fe`, `grey-30…31da4ab7`) and these
  styles read them: `.btn` background, `.nav-link-invert:hover` colour,
  `.utility-page-form`, `.pitch-video`, `.youtube-video-wrapper`
  backgrounds, `.tooltip_hover-trigger.about/.editorial/.commercial`
  colour. Fourteen styles read the **Archived** collection, including
  `body` (text colour = Archived/Text Color/Light), `.button`,
  `.normal-button`, the Cherry Picked modal, `.form-success/.form-error`.
- Cause: variables deleted or archived in the Designer while still bound.
- Fix: none yet. Rebind each style to a live Colors variable in the
  Designer (with approval), then delete the Archived collection. The style
  guide shows all of them (colour swatches and class tiles) meanwhile.
- Status: open
- Found by: claude

### 2026-10-09 · No button has focus, pressed or disabled states
- Area: designer
- Scope: project
- Symptom: Button W (+ Is Ghost, + the nav CTA variant), Normal Button
  (+ Cherry Picked), Button, Btn and Blog Card have a Hover state only;
  no Focus (keyboard), Pressed or Disabled (conventions.md §8). Form Input
  and Cherry Picked Form Input have Placeholder only (no Focus Visible), so
  keyboard focus relies on browser defaults. The Cherry Picked e-mail input has no label, and
  `/the-work`'s filter radios all share `id="radio"`.
- Cause: pre-existing design.
- Fix: approved 2026-10-09. The prototype has Focused (Keyboard) states for every
  control (two-tone ring, proposed.css P1–P10) and a U Sr Only label on the
  Cherry Picked email field. Designer steps are MANUAL-TODO rows A–L. Pressed and
  disabled states, and the duplicate radio ids, are still to do.
- Status: open — focus states and label in the prototype, Webflow build pending
- Found by: claude

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
