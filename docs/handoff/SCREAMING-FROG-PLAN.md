# Screaming Frog: zero issues, warnings and opportunities

Goal: a Screaming Frog crawl of www.pompandcircumstancepr.com with nothing
in Issues, Warnings or Opportunities.

Baseline: crawl of 2026-11-03 11:25 (SEO Spider 25.0, text-only, mobile
UA, default thresholds), saved as
`../https-www-pompandcircumstancepr-com-.dbseospider` in the workspace.
78 internal URLs (75 HTML pages), 39 findings: **2 Issues, 19 Warnings,
18 Opportunities**. The crawl predates the 2026-11-03 head-code release
(published ~12:19); nothing in that release touches these findings.

Measured how: the SEO Spider CLI exported its own Issues Overview and every
issue list from the crawl file (`--load-crawl … --bulk-export "Issues:All"`),
and fixes marked *tested* were checked by crawling local copies of a live
page with the same tool.

Each batch below goes through the webflow-audit batch steps: prepare,
apply, publish to staging, verify (re-crawl staging with SF), the person
checks nothing else is pending, the person types **publish**, re-crawl live.

## Findings, with cause and fix

| # | Finding (type, priority, URLs) | Cause | Fix | Batch |
| --- | --- | --- | --- | --- |
| 1 | Validation: Missing `<body>` Tag (Issue, High, 75) | The site head code has a comment containing the literal text `<style>` ("and the inline `<style>` (Lenis …)"). SF's validator treats it as a tag. *Tested:* that one word changed → issue gone; nothing else in the page triggers it. | Reword the comment in head code and `loader.html` piece 1 ("style block"). | 1 |
| 2 | Images: Missing Alt Text (Issue, Low, 200 images) | Logo strip on Home (52), team photos on /the-story (18), blog card thumbnails (12 per blog page), images in posts (60) and work items (45), /the-services (12), /shop, /contact. | Static images: alt in the Designer (asset alt). CMS images: bind alt to a field (name / post title); rich-text images: alt per image in the CMS. Decorative images: mark decorative (empty alt is still flagged by SF, so give them alt or remove them from HTML). | 3, 4 |
| 3 | Canonicals: Canonicalised (Warning, High, 1) | Webflow pagination: page 2's "Previous" links to `/blog?7e029070_page=1`, which canonicalises to `/blog`. | Remove pagination from the /blog list: show all 49 posts (limit ≤ 100) on one page. Finsweet CMS Load is already on the site if a "load more" is wanted (it must not output `?_page=` links). | 2 |
| 4 | Directives: Noindex (Warning, High, 1) | `/llms.txt` is served by Webflow with `X-Robots-Tag: noindex`; the footer links to it on every page ("Hey AI, learn more about us."). | Remove the footer link (AI crawlers read /llms.txt at the root without it). | 2 |
| 5–8 | Security: Missing Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Secure Referrer-Policy headers (Warning, Low, 75–76 each) | Webflow hosting sends none of them; only `strict-transport-security`. *Tested:* the `<meta>` equivalents do **not** clear these in SF — it reads HTTP headers only. | **Decision needed.** Custom response headers are a Webflow Enterprise feature; a self-managed proxy in front of Webflow hosting is not supported. Options: Enterprise, or accept these four and record why. | — |
| 9 | Security: Unsafe Cross-Origin Links (Warning, Low, 75 pages, 311 links) | `target="_blank"` without `rel="noopener"`: footer links to thisisbonustrack.com (×2), Google Maps, brandvm.com on every page; ~10 links inside posts. *Tested:* `rel="noopener"` clears it. | Footer links: custom attribute `rel = noopener` in the Designer. Rich-text links: switch off "open in new tab" (rich text can't take a rel). | 2, 4 |
| 10 | Social: Incomplete OG Tags (Warning, Low, 74) | Every page lacks `og:url` (the only missing OG tag). | Static pages: `<meta property="og:url">` in each page's head code. CMS templates (post, work): the same with the slug field inserted. *Tested:* og:url + twitter:site clears both social findings. | 2 |
| 11 | Social: Incomplete X Cards (Warning, Low, 74) | `twitter:site` (and `twitter:creator`) missing. *Tested:* `twitter:site` alone is enough. | Site head code: `<meta name="twitter:site" content="@…">`. **Needs the brand's X handle.** | 1 |
| 12–15 | Social: Duplicate OG Title / OG Description / X Card Title / X Card Description (Warning, Low, 5 each) | The 5 blog pagination URLs share the blog's tags. | Fixed by #3 (no pagination URLs). | 2 |
| 16 | Response Codes: Internal Redirection 3xx (Warning, Low, 2) | Two links in posts: `https://pompandcircumstancepr.com/` (apex → www) in *experiential-marketing-companies-toronto*, and `/the-pitch` (→ /the-story) in *how-to-improve-brand-communication*. | Point them at `https://www.pompandcircumstancepr.com/` and `/the-story`. | 4 |
| 17 | Response Codes: External Client Error 4xx (Warning, Low, 16) | 16 links in 13 posts: Forbes (8), Medium (5), Fashionista, Indeed, Restaurant Dive. All 403 — these sites block crawlers; most open fine in a browser. | Replace each with a source that answers crawlers, or remove the link. (Alternative: exclude those domains in SF's config, which hides rather than fixes.) | 4 |
| 18 | Response Codes: External Server Error 5xx (Warning, Low, 2) | Two cision.com articles answer 530. | Re-check; replace or remove. | 4 |
| 19 | URL: Parameters (Warning, Low, 5) | Blog pagination `?7e029070_page=N`. | Fixed by #3. | 2 |
| 20 | H2: Missing (Warning, Low, 59) | 39 posts and 12 work items have no H2 (rich text starts at H3 or has none); also /blog (+4 pages), /sitemap, /the-roster, /contact. | Posts/work: first section heading in rich text becomes H2. Static pages: add an H2 section heading in the Designer. | 3, 4 |
| 21 | H2: Multiple (Warning, Low, 14) | Home (13), /the-work (12), /the-services (12), /the-story (3) and 10 posts with 2–7 H2s. | **Conflicts with #20** and with normal heading structure: SF clears both only if every page has exactly one H2. Decision needed (see below). | — |
| 22 | Links: Pages With High External Outlinks (Warning, Low, 10) | Posts with > 10 external links; 5 of them are the sitewide footer (Bonus Track twice, Maps, Brand Vision, Instagram, LinkedIn). | Drop the duplicate Bonus Track link from the footer; trim body links on the posts still over 10 (micro-influencers-canada 13, integrating-influencer-collaborations 16, craft-of-storytelling 12). | 2, 4 |
| 23 | Content: Low Content Pages (Opportunity, Medium, 12) | Under 200 words: /the-roster (9), /the-services (29), /contact (57), /shop (124), / (136), /the-work (164), /blog (189), /work/dermalogica (152), blog pages 2–5. | Copy: add an intro / supporting paragraph per page (client approval). /blog fixed by #3 (all cards on one page). | 5 |
| 24 | Page Titles: Duplicate (Opportunity, Medium, 5) | Blog pagination. | Fixed by #3. | 2 |
| 25 | Images: Over 100 kB (Opportunity, Medium, 82) | Mostly work-item galleries (67 references) and post images. | Compress to WebP: the plan is in `../audit/compress-plan.json`, files in `../audit/image-webp/`. | 6 |
| 26 | Images: Missing Image Title (Opportunity, Low, 259) | No `title` attribute on images. | Designer images: custom attribute `title`; CMS images: bind it to a field. Rich-text images can't take one. **Decision** (low value; see below). | — |
| 27 | Images: Missing Size Attributes (Opportunity, Low, 259) | No `width`/`height` on `<img>`: parallax hero images (62), blog card thumbnails (61), post figures, /the-roster logo grid (71). | Designer/CMS images: set width and height attributes on the Image element. Rich-text images: no control (decision). | 3 |
| 28 | Links: Internal Outlinks With No Anchor Text (Opportunity, Low, 75) | The logo links to `/` in the nav and footer (SVG only), one work card. *Tested:* `aria-label` does **not** clear it; visually hidden text does. | Add a text span "Pomp & Circumstance home" with class **U Sr Only** (MANUAL-TODO row K) inside each logo link. | 2 |
| 29 | Page Titles: Same as H1 (Opportunity, Low, 8) | 8 posts whose SEO title equals the post name. | Write distinct SEO titles in the CMS (post SEO title field). | 4 |
| 30 | H1: Duplicate (Opportunity, Low, 5) | Blog pagination. | Fixed by #3. | 2 |
| 31 | H1: Over 70 Characters (Opportunity, Low, 1) | *the-art-of-gifting…* (89). | Shorten the post name/H1. | 4 |
| 32 | H2: Duplicate (Opportunity, Low, 2) | Home and /the-services repeat service names as H2s. | Resolved with the #20/#21 decision. | — |
| 33 | Meta Description: Duplicate (Opportunity, Low, 5) | Blog pagination. | Fixed by #3. | 2 |
| 34 | Meta Description: Over 155 Characters (Opportunity, Low, 1) | /the-services (156). | Trim by a few words. | 4 |
| 35 | Meta Description: Over 985 Pixels (Opportunity, Low, 2) | / (986 px), /work/scuderia-ferrari-x-peroni (990 px). | Trim by a word. | 4 |
| 36 | URL: Underscores (Opportunity, Low, 5) | Blog pagination. | Fixed by #3. | 2 |
| 37 | URL: Over 115 Characters (Opportunity, Low, 1) | `/post/the-art-of-gifting-how-luxury-brands-capitalize-on-high-end-corporate-and-personal-gifts` (131). | Shorter slug + a 301 from the old URL; update internal links to it so no 3xx appears. | 4 |
| 38 | Content: Readability Difficult (Opportunity, Low, 8) | Long sentences (Flesch < 50) on 4 work items, 3 posts, /sitemap. | Copy edit (client approval). /sitemap is a link list: decision. | 5 |
| 39 | Content: Readability Very Difficult (Opportunity, Low, 3) | /the-services (29 words), /the-work, /work/tiffany-yorkdale-flagship. | Copy edit; /the-services improves with #23. | 5 |

## Batches, lowest risk first

1. **Head code** (code; one staging publish): reword the comment (#1); add
   `twitter:site` (#11, needs the handle). Clears 1 Issue and 1 Warning on
   every page.
2. **Site-wide Designer changes** (components and templates): blog without
   pagination (#3, #12–15, #19, #24, #30, #33, #36; part of #23); footer:
   remove the llms.txt link (#4), `rel=noopener` on external links (#9),
   drop the duplicate Bonus Track link (#22); hidden text in the logo links
   (#28; needs MANUAL-TODO row K's **U Sr Only** class); `og:url` per page
   and per template (#10).
3. **Static-page images and headings**: alt text (#2), width/height (#27),
   an H2 where a page has none (#20).
4. **CMS content pass** (49 posts, 12 work items): the 2 redirecting and 18
   broken external links (#16–18), rich-text new-tab links (#9), rich-text
   alt text (#2), H2 in rich text (#20), SEO titles (#29), H1 length (#31),
   meta descriptions (#34–35), the long slug with its 301 (#37), external
   link counts (#22). CMS item edits can go live per item; the 301 and any
   template change wait for "publish".
5. **Copy** (client approval): low-content pages (#23), readability (#38–39).
6. **Images over 100 kB** (#25): the existing compression plan.

After each batch: re-crawl staging (pomp-c.webflow.io) with the same SF
config and compare counts; after "publish", re-crawl live.

## Progress

| Date | Batch | Live crawl (SF 25.0, same settings) |
| --- | --- | --- |
| 2026-11-03 | baseline | 39 findings: 2 Issues, 19 Warnings, 18 Opportunities |
| 2026-11-03 | 1 (head comment) and 2 (site-wide Designer) live | 24 findings |
| 2026-11-04 | 3 (static-page images and headings) live | 26 findings |
| 2026-11-05 | 4b and the work template (4a part) live | 21 findings |
| 2026-11-06 | 6 (image compression: 9 site assets, 53 work-item image fields) live | 20 findings |

Batch 2 as built: blog list pagination off (49 posts on /blog, no
`?_page=` URLs); hidden U Sr Only text in the nav and footer logo links
(home and Bonus Track); `rel="noopener"` as a custom attribute on the
nav/footer Bonus Track, footer Maps and Brand Vision links, the /contact
Maps link and the C | Button component (the /shop buttons); the footer
llms.txt link removed (footer 46 px shorter); `og:url` in the head code
of Home, /the-work, /the-services, /the-roster, /the-story, /contact,
/blog, /shop, /sitemap and the post and work templates.

Results: cleared #3, #4, #10, #11, #12–15, #19, #24, #30, #33, #36;
#1 (batch 1); #18 (cision.com answers again). #9 down to 7 (rich-text
links in posts), #28 down to 2 (/the-work cards, one empty link in a
post), #20 down to 55, #23 down to 7. #11 cleared without `twitter:site`:
no X handle is needed. #17 is now 17 (one more source answers 403).
Not changed: #22 (the Bonus Track links are nav + footer logos, not a
duplicate; removing one is a design decision).

Batch 3 as built: alt text in the asset library on the 35 site images the
static pages use (service, shop, team, award, contact icons; five assets
sit under legacy IDs, found through the elements that use them); alt
"<Client> logo" on all 73 Clients items (bulk CMS updates fail at random
with "Missing fields"; groups of up to 9 or single items go through); the
/blog card image alt bound to the post title; H2s with no visual change
(computed styles compared in the browser first): /blog card titles H5 to
H2, /the-roster section headers h3 to h2 (C | Section Header Title Tag
prop), /contact and /sitemap labels rebuilt as H2 with the same class;
hidden U Sr Only text in the /the-work card links bound to Project Name.
Parity live vs staging: only the tag changes.

Results: #2 down to 102 (all inside posts and work items, batch 4);
#20 down to 51; #28 down to 1 (an empty link in a post); #23 down to 6.
New: H2 Over 70 Characters on /blog (the 89-character "The Art of
Gifting" post title, fixed with #31) and one external link timing out
(batch 4). #21 up to 17 (/blog has 49 H2s now, /the-roster 2).
Not done: #27 width/height. The API only sets fixed attributes, and most
of these images are one element repeated with different aspect ratios.
Decision needed (Designer per fixed-ratio image, or accept).

Batch 4 so far. Work template: "The Ask / The Approach / The Results" H3
to H2 (same computed style), and the C | Parallax Image Alt Text prop on
Image 1-4 bound to Project Name (the cover already was). 4b (approved
drafts): SEO titles on the 8 posts whose title equalled the H1; Home,
/the-services and the Scuderia meta descriptions trimmed; the Art of
Gifting post name shortened to "The Art of Gifting: Luxury Brands and
High-End Corporate Gifts" (H1, /blog card, /sitemap). Four of the new
titles were 562-608 px wide (SF limit 561 px, not just 60 characters);
shortened versions measure 466-550 px and are live.

Results: #2 down to 60 (the post-body images); #29, #31, #34, #35 and
H2 Over 70 cleared; #20 down to 39. New and accepted: H2 Duplicate (14)
from the work template's shared section headings (decision 2026-11-05:
keep them).

Waiting: the 71 post-body edits (60 image alts reviewed, 8 rel=noopener,
2 redirecting links, 1 empty link) need a Webflow API token in
~/.config/pomp/webflow-token; sending ~290k characters of post HTML back
by hand through the MCP was judged too risky. The Art of Gifting slug
change waits for its 301 (MANUAL-TODO row T). Decisions still open: the
16 external 403 links and H2s in post bodies (an H2 renders larger than
an H3 there, 20.8 px vs 17.9 px).

Batch 6 (decision 2026-11-05: 2000 px max, WebP q75, swap only where it
saves over 30%). The parallax/service-card and work-template images had
no srcset, so every visitor loaded the full originals (up to 5760 px,
1 MB). Site assets: 9 replaced (Home and /the-services about 4.4 MB
lighter each; the Creative LCP preload, the Open Graph image on 16 pages
and Home's JSON-LD image follow). Work items: 53 image fields across 11
items now point at 41 recompressed files (about 18 MB to 7.6 MB across
the work pages). Originals in the workspace `audit/image-originals/` and
`audit/cms-originals/`; old assets kept in the library. Parity: no
layout change. #25 down to 69: many photos stay at 110-260 kB at q75;
the 4 blog thumbnails (about 1080 px) and 8 small site images gained
nothing and were left; the 17 post-body images wait for the API token.

## Decisions needed

- **Security headers (#5–8).** Not fixable on Webflow's standard hosting.
  Webflow Enterprise, or accept and record. Recommendation: accept unless
  Enterprise is on the table.
- **X handle (#11).** Which `@handle` for `twitter:site`? Without one the
  warning stays.
- **H2 Missing vs H2 Multiple (#20, #21, #32).** Zero on both means exactly
  one H2 per page, which flattens Home, /the-services, /the-work and the
  list-style posts. Recommendation: fix *Missing* and *Duplicate*, accept
  *Multiple* where a page has real sections.
- **Image title attributes (#26) and size attributes on rich-text images
  (#27).** Title attributes add almost nothing for search or users; rich
  text gives no control over either. Recommendation: accept for rich text,
  fix Designer/CMS-bound images.
- **External 403s (#17).** Replace the sources, or exclude the domains in
  the SF config (hides them; the links still work for people).
