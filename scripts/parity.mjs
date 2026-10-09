// Cutover parity check: renders live pages twice, once as published and once
// with the old custom code (hamounbv/pomp + Swiper/Lenis CDN + colon_break)
// swapped for this repo's dist/, then compares every element's computed style
// and box. Zero differences = the new bundle is a 1:1 drop-in.
//   node scripts/parity.mjs [--base https://www.pompandcircumstancepr.com] [--pages /,/contact]
// Read-only: requests are intercepted in the test browser, nothing is published.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const BASE = opt('base', 'https://www.pompandcircumstancepr.com');
const PAGES = opt('pages', '/,/the-services,/the-work,/the-story,/the-roster,/contact,/shop,/blog,/post/micro-influencers-canada,/work/nobu-toronto').split(',');
// --target <origin>: compare BASE (old code, as published) with the same path
// on another origin running the new code as installed (e.g. the staging site).
const TARGET = opt('target', null);
const WIDTHS = (opt('widths', '375,800,1440')).split(',').map(Number);

const distJS = fs.readFileSync(path.join(root, 'dist/index.js'));
const distCSS = fs.readFileSync(path.join(root, 'dist/styles.css'));

// What the cutover removes or replaces.
async function swapToNew(page) {
  await page.route(/hamounbv\/pomp@[^/]+\/css\/pomp(\.min)?\.css/, (r) => r.fulfill({ body: distCSS, contentType: 'text/css' }));
  await page.route(/hamounbv\/pomp@[^/]+\/js\/pomp(\.min)?\.js/, (r) => r.fulfill({ body: distJS, contentType: 'application/javascript' }));
  await page.route(/swiper@11\/swiper-bundle\.min\.css/, (r) => r.fulfill({ body: '', contentType: 'text/css' }));
  await page.route(/swiper@11\/swiper-bundle\.min\.js/, (r) => r.fulfill({ body: '', contentType: 'application/javascript' }));
  await page.route(/lenis@[^/]+\/dist\/lenis\.min\.js/, (r) => r.fulfill({ body: '', contentType: 'application/javascript' }));
  await page.route(/colon_break-1\.0\.0\.js/, (r) => r.fulfill({ body: '', contentType: 'application/javascript' }));
}

// Freeze everything time-dependent so the two renders are comparable.
const FREEZE = `
  (() => {
    const s = document.createElement('style');
    s.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
    document.head.appendChild(s);
    document.querySelectorAll('video').forEach((v) => { try { v.pause(); v.currentTime = 0; } catch (e) {} });
    document.querySelectorAll('.swiper').forEach((el) => { const sw = el.swiper; if (sw) { sw.autoplay && sw.autoplay.stop(); sw.slideToLoop ? sw.slideToLoop(0, 0) : sw.slideTo(0, 0); } });
    window.scrollTo(0, 0); if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
  })()`;

const SNAPSHOT = `
  (() => {
    const els = [...document.querySelectorAll('body *')].filter((e) => !e.closest('script,style,noscript,iframe,svg defs,#wfc-environment,.g-components'));
    return els.map((e) => {
      const cs = getComputedStyle(e); const st = {};
      for (const p of cs) st[p] = cs.getPropertyValue(p);
      for (const pseudo of ['::before', '::after']) { const ps = getComputedStyle(e, pseudo); if (ps.content && ps.content !== 'none') for (const p of ps) st[pseudo + p] = ps.getPropertyValue(p); }
      const r = e.getBoundingClientRect();
      const cls = typeof e.className === 'string' ? e.className : (e.className && e.className.baseVal) || '';
      return { tag: e.tagName.toLowerCase(), cls, box: [r.x, r.y, r.width, r.height].map((n) => Math.round(n * 10) / 10), st };
    });
  })()`;

async function render(browser, url, width, mode) /* url reassigned for --target */ {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  if (mode === 'new' && !TARGET) await swapToNew(page);
  if (mode === 'new' && TARGET) url = url.replace(BASE, TARGET);
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(6000); // page loader interaction + 4 s CSS failsafe
  await page.evaluate(FREEZE);
  await page.waitForTimeout(500);
  const snap = await page.evaluate(SNAPSHOT);
  const shot = await page.screenshot();
  await ctx.close();
  return { snap, errors, shot, requests };
}

// Properties that legitimately vary between two loads of the same page.
const NOISE = /^(will-change)$/;

const browser = await chromium.launch();
const report = [];
let total = 0;
const outDir = path.join(root, '.parity');
fs.mkdirSync(outDir, { recursive: true });
for (const p of PAGES) {
  for (const w of WIDTHS) {
    const url = BASE + p;
    const [a, b] = [await render(browser, url, w, 'live'), await render(browser, url, w, argv.includes('--control') ? 'live' : 'new')];
    const diffs = [];
    if (a.snap.length !== b.snap.length) diffs.push(`element count ${a.snap.length} → ${b.snap.length}`);
    const n = Math.min(a.snap.length, b.snap.length);
    for (let i = 0; i < n && diffs.length < 60; i++) {
      const x = a.snap[i], y = b.snap[i];
      const id = `${x.tag}.${x.cls.trim().split(/\s+/).join('.')}`;
      if (x.tag !== y.tag || x.cls !== y.cls) { diffs.push(`#${i} node ${id} → ${y.tag}.${y.cls}`); continue; }
      if (x.box.join() !== y.box.join()) diffs.push(`#${i} ${id} box ${x.box} → ${y.box}`);
      for (const k of new Set([...Object.keys(x.st), ...Object.keys(y.st)])) {
        if (NOISE.test(k)) continue;
        // Custom properties keep their source text, so minified `.48` vs `0.48` is not a rendering change.
        // Zero lengths: the old CDN minifier wrote `0%` as `0`, which computes to 0px; both are zero.
        const norm = (v) => { if (!v) return v; if (/(^|::(before|after))--/.test(k)) v = v.replace(/(^|[\s,(])0\.(\d)/g, '$1.$2'); return v === '0%' ? '0px' : v; };
        if (norm(x.st[k]) !== norm(y.st[k])) diffs.push(`#${i} ${id} ${k}: ${x.st[k]} → ${y.st[k]}`);
      }
    }
    const tag = `${p.replace(/\W+/g, '_') || 'home'}_${w}`;
    fs.writeFileSync(path.join(outDir, `${tag}_live.png`), a.shot);
    fs.writeFileSync(path.join(outDir, `${tag}_new.png`), b.shot);
    const oldCode = b.requests.filter((u) => /hamounbv\/pomp|colon_break|swiper@11\/swiper-bundle|lenis@1\.1\.5/.test(u));
    if (TARGET && oldCode.length) diffs.push(...oldCode.map((u) => `old code still requested: ${u}`));
    total += diffs.length;
    report.push({ page: p, width: w, elements: a.snap.length, diffs, liveErrors: a.errors, newErrors: b.errors, newRequests: b.requests.filter((u) => /brandvm|jsdelivr|github\.io/.test(u)) });
    console.log(`${diffs.length ? '✗' : '✓'} ${p} @${w}: ${diffs.length} differences (${a.snap.length} elements)${b.errors.length ? ` · new errors: ${b.errors.length}` : ''}`);
  }
}
await browser.close();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
console.log(total ? `\n${total} differences — see .parity/report.json` : '\nParity: no differences.');
process.exit(total ? 1 : 0);
