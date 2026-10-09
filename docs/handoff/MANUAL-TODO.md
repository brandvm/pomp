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
| A | | Desktop | | | ☐ |

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
- [ ] 3. Tag `1.0.0` on brandvm/pomp (a commit whose CI passed;
      `git tag v1.0.0 && git push --tags`), then set `RELEASE = "1.0.0"` in
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
