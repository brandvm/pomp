import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Piece 2b must never leave the page without the repo stylesheet: the sheet
// sets the root font size, so a gap is a full-page layout shift.
const loader = readFileSync(new URL('../loader.html', import.meta.url), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const script2b = [...loader.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes('C.setCSS = function'));

test('2b swaps the stylesheet without an unstyled gap', async ({ page }) => {
  let release;
  const released = new Promise((r) => (release = r));
  await page.route('https://stage.test/styles.css*', (r) => r.fulfill({ contentType: 'text/css', body: ':root{--sheet:stage}' }));
  await page.route('https://cdn.test/pomp@9.9.9/dist/styles.css', async (r) => { await released; r.fulfill({ contentType: 'text/css', body: ':root{--sheet:release}' }); });
  await page.route('https://site.test/', (r) => r.fulfill({ contentType: 'text/html', body: `<html><head><script>
    window.WFC = { staging: false, dev: false, devBase: 'http://localhost:3000/', stag: 'https://stage.test/', release: '9.9.9', prod: 'https://cdn.test/pomp@9.9.9/dist/' };
    </script></head><body><link id="wfc-css" rel="stylesheet" href="https://stage.test/styles.css?v=1"><script>${script2b}</script></body></html>` }));
  await page.goto('https://site.test/', { waitUntil: 'domcontentloaded' });
  const sheet = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sheet').trim());
  // Release sheet still loading: the staging sheet must still apply.
  expect(await sheet()).toBe('stage');
  await expect(page.locator('#wfc-css')).toHaveAttribute('href', 'https://cdn.test/pomp@9.9.9/dist/styles.css');
  await expect(page.locator('link[rel=stylesheet]')).toHaveCount(2);
  release();
  await expect.poll(sheet).toBe('release');
  await expect(page.locator('link[rel=stylesheet]')).toHaveCount(1);
  // Setting the same URL again (piece 3 does) is a no-op.
  await page.evaluate(() => window.WFC.setCSS('https://cdn.test/pomp@9.9.9/dist/styles.css'));
  await expect(page.locator('link[rel=stylesheet]')).toHaveCount(1);
});
