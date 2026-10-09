import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// The /the-work filter as Webflow publishes it: radios in a Collection List
// that all carry the Designer id "radio".
const js = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
const radio = (label, checked = '') => `<div class="w-dyn-item"><label class="filter-radio-button-field w-radio">
  <div class="w-form-formradioinput filter-radio-button w-radio-input"></div>
  <input type="radio" name="Category" id="radio" value="Radio" ${checked}>
  <span class="filter-radio-button-label w-form-label" for="radio">${label}</span></label></div>`;

test('duplicate CMS radio ids become unique and labels follow', async ({ page }) => {
  await page.setContent(`<form>${radio('All', 'checked')}${radio('Experiential')}${radio('Media Relations')}${radio('All')}</form>
    <input id="solo" type="text"><label for="solo">Solo</label>`);
  await page.addScriptTag({ content: js });
  const ids = await page.$$eval('input[type=radio]', (els) => els.map((e) => e.id));
  expect(ids).toEqual(['radio-all', 'radio-experiential', 'radio-media-relations', 'radio-all-2']);
  const fors = await page.$$eval('.w-form-label', (els) => els.map((e) => e.getAttribute('for')));
  expect(fors).toEqual(ids);
  // Unique ids are left alone.
  await expect(page.locator('#solo')).toHaveCount(1);
  expect(await page.$eval('input[type=radio]', (e) => e.checked)).toBe(true);
});
