// The prototype viewer (public/wireframes/prototype-pick-your-team.html, 25 Nov 2026): Version 1 and Version 2 as tabs of
// one page, each version still its own page shown in a frame. Smoke tests: the tabs, the full and reduced banner, the old
// addresses redirecting, and each version keeping its place when you tab away and back.
import { test, expect } from './helpers.js';

const VIEWER = '/wireframes/prototype-pick-your-team.html';
const tab = (page, n) => page.locator(`.sh-tab[data-version="${n}"]`);
const frame = (page, n) => page.frameLocator(`#sh-f${n}`);

test.describe('Prototype viewer', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1280, height: 900 }); });

  test('opens on Version 1, with both tabs saying what each has', async ({ page }) => {
    await page.goto(VIEWER);
    await expect(page).toHaveURL(/prototype-pick-your-team\.html\?version=1$/);
    await expect(tab(page, 1)).toHaveAttribute('aria-current', 'page');
    await expect(tab(page, 1)).toContainText('Full functionality');
    await expect(tab(page, 2)).toContainText('Reduced functionality');
    await expect(tab(page, 2)).not.toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#sh-note')).toHaveText(/Planner, tickets, days, map and your plan/);
    await expect(frame(page, 1).locator('#tp-phone')).toBeVisible();
    // Version 2 is not loaded until its tab is opened
    expect(await page.locator('#sh-f2').getAttribute('src')).toBeNull();
  });

  test('?version=2 opens Version 2 and leaves Version 1 unloaded', async ({ page }) => {
    await page.goto(`${VIEWER}?version=2`);
    await expect(tab(page, 2)).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#sh-note')).toHaveText(/Home, Drop goal and a saved list/);
    await expect(frame(page, 2).locator('#tp-phone')).toBeVisible();
    expect(await page.locator('#sh-f1').getAttribute('src')).toBeNull();
  });

  // Old addresses: every flag and the #hash carry on; ?flow= is dropped (Version 1 is what was Option C)
  for (const [from, to] of [
    [`${VIEWER}`, '?version=1'],
    [`${VIEWER}?flow=a`, '?version=1'],
    [`${VIEWER}?flow=c&phone&theme=hifi`, '?version=1&phone&theme=hifi'],
    [`${VIEWER}?theme=hifi&flow=a&reset`, '?version=1&theme=hifi&reset'],
    ['/wireframes/prototype-pick-your-team-v2.html', '?version=2'],
    ['/wireframes/prototype-pick-your-team-v2.html?phone&theme=hifi', '?version=2&phone&theme=hifi'],
    ['/wireframes/prototype-pick-your-team-v2.html?view=kick&team=Japan', '?version=2&view=kick&team=Japan'],
  ]) {
    test(`${from} lands on ${to}`, async ({ page }) => {
      await page.goto(`${from}#tp-ov`);
      await expect(page).toHaveURL(new RegExp(`prototype-pick-your-team\\.html${to.replace(/[?&]/g, (c) => '\\' + c)}#tp-ov$`));
      const n = to.includes('version=2') ? 2 : 1;
      await expect(tab(page, n)).toHaveAttribute('aria-current', 'page');
    });
  }

  test('tabbing keeps each version where it was, and the URL follows the tab', async ({ page }) => {
    await page.goto(`${VIEWER}?theme=hifi`);
    await expect(frame(page, 1).locator('#tp-phone')).toBeVisible();
    await page.frame({ url: /v1-frame/ }).evaluate(() => { window.__mark = 'v1'; });
    await tab(page, 2).click();
    await expect(page).toHaveURL(/\?version=2&theme=hifi$/);
    await expect(tab(page, 2)).toHaveAttribute('aria-current', 'page');
    await expect(frame(page, 2).locator('#tp-phone')).toBeVisible();
    await expect(page.locator('#sh-f1')).toHaveJSProperty('inert', true);
    await expect(page.locator('#sh-f2')).toHaveJSProperty('inert', false);
    await page.frame({ url: /v2-frame/ }).evaluate(() => { window.__mark = 'v2'; });
    await tab(page, 1).click();
    await expect(page).toHaveURL(/\?version=1&theme=hifi$/);
    expect(await page.frame({ url: /v1-frame/ }).evaluate(() => window.__mark)).toBe('v1');
    expect(await page.frame({ url: /v2-frame/ }).evaluate(() => window.__mark)).toBe('v2');
    await expect(page.locator('#sh-note')).toHaveText(/Planner, tickets/);
  });

  test('inside the viewer each version drops its own tabs and cross links', async ({ page }) => {
    await page.goto(VIEWER);
    await tab(page, 2).click();
    await expect(frame(page, 2).locator('#tp-phone')).toBeVisible();
    await expect(frame(page, 1).locator('.pv-tabs')).toBeHidden();
    await expect(frame(page, 1).locator('.pv-v2link')).toBeHidden();
    await expect(frame(page, 2).locator('.pv-tabs')).toBeHidden();
    await expect(frame(page, 2).locator('.v2-v1link')).toBeHidden();
  });

  test('Open in desktop opens the viewer on the same tab, not the bare page', async ({ page }) => {
    await page.goto(`${VIEWER}?theme=hifi`);
    await expect(frame(page, 1).locator('#tp-phone')).toBeVisible();
    await expect(frame(page, 1).locator('#pv-desktop')).toHaveAttribute('href', /prototype-pick-your-team\.html\?version=1&phone&theme=hifi/);
    await tab(page, 2).click();
    await expect(frame(page, 2).locator('#tp-phone')).toBeVisible();
    await expect(frame(page, 2).locator('#pv-desktop')).toHaveAttribute('href', /prototype-pick-your-team\.html\?version=2&phone&theme=hifi/);
  });

  test('on a phone the tabs, tags and line fit on 390 wide, with nothing scrolling sideways', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${VIEWER}?theme=hifi`);
    for (const n of [1, 2]) {
      await tab(page, n).click();
      const m = await page.evaluate(() => {
        const note = document.getElementById('sh-note');
        return { page: document.documentElement.scrollWidth - innerWidth, note: note.scrollWidth - note.clientWidth,
          tags: [...document.querySelectorAll('.sh-tag')].map((t) => t.getBoundingClientRect().right <= t.closest('.sh-tab').getBoundingClientRect().right) };
      });
      expect(m.page).toBeLessThanOrEqual(0);
      expect(m.note).toBeLessThanOrEqual(0);
      expect(m.tags.every(Boolean)).toBe(true);
    }
  });
});
