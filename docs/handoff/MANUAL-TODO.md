# Manual Designer steps

Everything the Webflow MCP can't do, for a person to do in the Designer.
Claude adds a row the moment it hits a limit, with *why* the API can't;
the person marks it done; Claude then reads the result back (or checks it on
the canvas when the API can't read it) and says so.

Common reasons, so they don't need re-explaining (see the skill's
`lessons/mcp.md`):
- a value mixing a variable with `calc()`, a gradient or a shadow;
- conditional visibility on a CMS field; a list sourced from a
  multi-reference or multi-image field; "exclude current item";
- a link to the current CMS item, in a list or a component prop;
- tag styles that have never been set; reserved class names;
- placeholders, slot names, variant props exposed from nested instances.

How to enter a value with variables: select the class, switch to the
breakpoint, type `calc(` in the field and insert variables with the
variable picker. Gradients: Backgrounds → gradient, pick each stop from the
variables.

Letters run A, B, C… then AA, AB… and are never reused, so a letter
mentioned in GOTCHAS or a commit stays unambiguous.

| ID | Where (page › element or class) | Breakpoint | Set | Why the API can't | Done |
| --- | --- | --- | --- | --- | --- |
| A | Variables › Colors | — | New variable **Focus/Ring** (Color) = alias **Colors/Neutral/White** (P1) | MCP not connected to this site | ☐ |
| B | Tag **All Links** › Focused (Keyboard) | Desktop | Outline 2px solid **Colors/Focus/Ring**, offset 2px; Box shadow 0 0 0 2px **Colors/Bg/Blue** (P2) | MCP not connected | ☐ |
| C | **Button Link** › Focused (Keyboard) | Desktop | Outline 2px solid **Colors/Focus/Ring**, offset 2px; Box shadow 0 0 0 2px **Colors/Bg/Blue** (P3) | MCP not connected | ☐ |
| D | **Button W** › Focused (Keyboard) | Desktop | Outline 2px solid **Colors/Focus/Ring**, offset 2px; Box shadow 0 0 0 2px **Colors/Bg/Blue** (P4) | MCP not connected | ☐ |
| E | **Form Button** › Focused (Keyboard) | Desktop | Opacity 100%, background Transparent, text colour Transparent, plus Outline 2px solid **Colors/Focus/Ring**, offset 2px; Box shadow 0 0 0 2px **Colors/Bg/Blue** (P5; the overlay is opacity 0 otherwise) | MCP not connected | ☐ |
| F | **G Nav Menu Drawer** › Focused (Keyboard) | Desktop | Outline 2px solid **Colors/Focus/Ring**, offset 2px; Box shadow 0 0 0 2px **Colors/Bg/Blue** (P6) | MCP not connected | ☐ |
| G | **Cherry Picked Modal Closer** › Focused (Keyboard) | Desktop | Outline 2px solid **Colors/Focus/Ring**, offset 2px; Box shadow 0 0 0 2px **Colors/Bg/Blue** (P7) | MCP not connected | ☐ |
| H | **Blog Card** › Focused (Keyboard) | Desktop | Move Y −0.5rem (same as Hover), plus Outline 2px solid **Colors/Focus/Ring**, offset 2px; Box shadow 0 0 0 2px **Colors/Bg/Blue** (P8) | MCP not connected | ☐ |
| I | **Form Input** › Focused (Keyboard) | Desktop | Outline 2px solid **Colors/Focus/Ring**, offset 2px; Box shadow 0 0 0 2px **Colors/Bg/Blue** (P9) | MCP not connected | ☐ |
| J | **Cherry Picked Form Input** › Focused (Keyboard) | Desktop | Outline 2px solid **Colors/Focus/Ring**, offset 2px; Box shadow 0 0 0 2px **Colors/Bg/Blue** (P10) | MCP not connected | ☐ |
| K | New class **U Sr Only** | Desktop | Position Absolute; W 1px; H 1px; margin −1px all sides; padding 0; Overflow Hidden; white-space nowrap (Typography › More › Breaking); border 0 | MCP not connected | ☐ |
| L | Cherry Picked form (on every page) › email input | — | Add a **Form Label** directly before the input, text "Email address", class **U Sr Only**, *For* = the input. Input settings: Type **Email**, add attribute `autocomplete=email`. **Keep the Name `field-2`**: the form posts to Mailchimp, and renaming the field could break the signup. | MCP not connected | ☐ |

Rows A–L come from the approved focus-state and form-label proposal (prototype `src/css/proposed.css` P1–P10, `new-classes.css` U Sr Only). Check them with `node scripts/check-focus.mjs` in the prototype. On live, Tab through Home, Contact and a blog post: every control shows the two-tone ring, and a mouse click shows nothing on buttons or links.

## Cutover from hamounbv/pomp@1.0.0

Live (www.pompandcircumstancepr.com) loads
`cdn.jsdelivr.net/gh/hamounbv/pomp@1.0.0/{css/pomp.min.css,js/pomp.min.js}`
and keeps doing so until these steps are done. Nothing in Webflow has been
changed by the migration. Steps 4 onward need the user's go-ahead.

**Cutover rule (user, 2026-10-09):** the cutover happens in two phases.
1. **Parity first.** The new bundle must render the live site 1:1, with no
   visual, content or behaviour change. Before step 4, run a visual diff
   with the old assets swapped for `dist/` (block the hamounbv/pomp and
   Swiper/Lenis CDN requests and serve `dist/` in their place). Cover every
   template at 375, 800 and 1440 px and accept zero unexplained pixel
   difference.
2. **Improvements second.** Performance and accessibility changes ship in
   later releases, one at a time. Each must leave the visual design and
   content unchanged, and each is re-checked with the same diff.

- [ ] 1. GitHub Pages source = GitHub Actions on brandvm/pomp
      (Settings → Pages). The migration session enabled it via the API —
      confirm.
- [ ] 2. First push to `master` is green in the `staging` workflow and
      `https://brandvm.github.io/pomp/styles.css` and `index.js` load.
- [x] 3. Tag `0.0.1` on brandvm/pomp (3177fb1, CI green, `pnpm parity`
      0 differences on 10 pages × 3 widths; jsDelivr serves it
      byte-identical to dist/), then set `RELEASE = "0.0.1"` in
      `loader.html` piece 1 and commit. **Must happen before step 4**: the
      custom domain is already attached, and with `RELEASE = null` production
      would serve the staging bundle.
- [ ] 4. *(only when the user approves)* Paste `loader.html` piece 1 into
      Site settings → Custom code → Head code, replacing the old head block
      entirely (it drops the Swiper CDN stylesheet, the old pomp.min.css link
      and the inline `<style>`).
- [ ] 5. *(approved)* Create Embeds 2a (link only) and 2b (script only), in
      that order, in the global component that sits on every page
      (G | Components).
- [ ] 6. *(approved)* Paste piece 3 into Footer code, replacing the old
      footer entirely — this removes the Swiper and Lenis CDN `<script>`
      tags and the `pomp.min.js` tag.
- [ ] 7. *(approved)* Remove the second copy of the old head CSS link: live
      loads `hamounbv/pomp@1.0.0/css/pomp.min.css` **twice** (head code and
      somewhere else, probably an Embed — check `G | Embed Code` and
      page-level custom code). After cutover no request to `hamounbv/pomp`
      may remain.
- [ ] 8. *(approved)* Delete the registered script `colon_break-1.0.0.js`
      (Site settings → Custom code). It still loads on live and duplicates
      `src/modules/colon-break.ts`.
- [ ] 9. *(approved)* Confirm no Swiper or Lenis CDN tags remain anywhere
      (site head/footer, page custom code, Embeds).
- [ ] 10. Publish to **staging (pomp-c.webflow.io) first** and QA: service
      slider (autoplay, loop, prev/next), smooth scroll, nav shrink past
      5vh, colon line-breaks on `[data-colon-break]`, page loader dismisses,
      hero video plays and the hero is brand-coloured (not black) while it
      loads, GA4 + Ahrefs firing, Finsweet CMS Load and Smart Lightbox work,
      JSON-LD validates, Designer canvas shows `styles.css`, no 404s and no
      `hamounbv/pomp` requests in the Network tab, no `[wfc]` console errors.
- [ ] 11. *(approved)* Publish to production; re-run the QA on the live domain.
- [ ] 12. Afterwards: archive hamounbv/pomp (read-only); leave its tags —
      rollback until then is re-pasting its old snippets.

## Later: move Webflow interactions into the repo

Agreed with the user on 2026-10-09: after cutover, move the Webflow IX/IX2/IX3
interactions (the page loader, scroll and hover animations, the nav menu
drawer) into `src/modules/` as GSAP code. Work through it with the
wf-template workflow (webflow-build skill) until the site follows it fully.
Rules for each interaction:
- Inventory it first: trigger, targets, timeline, breakpoints.
- Port it to one module, then remove it in Webflow in the same release.
- Pass `pnpm parity`. Animation end states must match; capture motion with
  `wf:film` / `wf:transitions` before and after.
- One release per group, with no visual or content change.


## Waiting on the Webflow MCP (connector currently on another site)

- Replace every per-page HTML Embed on the site with the G | Components
  pattern (user, 2026-10-09). This includes removing `G | Embed Code`, which
  still loads `hamounbv/pomp@1.0.0/css/pomp.min.css` on staging.
- Remove `colon_break-1.0.0.js`. It was registered through the Data API,
  so it doesn't appear in Site settings → Custom code. Find it with
  `data_scripts_tool` (`get_site_scripts` / `get_page_scripts`), then
  `remove_site_script` (or `remove_page_script`), then `delete_registered_script`.
  `pnpm parity` shows the page renders the same with or without it.
- Pages other than Home have no G | Components Embeds yet; they get their CSS
  only from `G | Embed Code` (the old hamounbv stylesheet). **Don't remove that
  Embed from a page until the G | Components block is on it.** Only Home has
  the Swiper slider, so the other pages lose nothing in the meantime.
- Image compression: the plan is in `../audit/compress-plan.json`, the WebP
  files are in `../audit/image-webp/` and the originals are backed up in
  `../audit/image-originals/`.
