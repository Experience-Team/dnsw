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
  // On a phone (or ?phone) the bar moves with the scrolling: it rises by as much as the page does and comes back as soon
  // as the page goes down again, with no timed slide. When scrolling stops part way it settles to the nearer end
  const barState = (page) => page.evaluate(() => {
    const f = document.querySelector('.sh-frame:not([inert])'), bar = document.querySelector('.sh-bar');
    return { barTop: Math.round(bar.getBoundingClientRect().top), barH: bar.offsetHeight, frameTop: Math.round(f.getBoundingClientRect().top),
      y: Math.round(f.contentDocument.querySelector('.tp-body').scrollTop), inert: bar.inert };
  });
  const scrollBy = async (page, dy, version = 1) => {
    await page.frame({ url: new RegExp(`v${version}-frame`) }).evaluate((d) => { document.querySelector('.tp-body').scrollTop += d; }, dy);
    await page.waitForTimeout(30);
  };

  test('the bar rises exactly as the page rises and comes back as soon as it goes down again', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${VIEWER}?theme=hifi&phone`);
    await expect(frame(page, 1).locator('#tp-phone')).toBeVisible();
    const h = (await barState(page)).barH;
    expect(await barState(page)).toMatchObject({ barTop: 0, frameTop: h, inert: false });
    // Down in small steps, as a thumb moves (one a frame, no pause): at each scroll the bar has gone up by what the page has
    const steps = await page.frame({ url: /frame\.html/ }).evaluate(async () => {
      const out = [], body = document.querySelector('.tp-body'), frame = parent.document.querySelector('.sh-frame:not([inert])'), bar = parent.document.querySelector('.sh-bar');
      // Registered after the viewer's own listener, so it sees the bar as that has just set it
      document.addEventListener('scroll', (e) => { if (e.target === body) out.push({ y: Math.round(body.scrollTop), barTop: Math.round(bar.getBoundingClientRect().top), frameTop: Math.round(frame.getBoundingClientRect().top) }); }, true);
      for (let i = 0; i < 5; i++) { body.scrollTop += 20; await new Promise((r) => requestAnimationFrame(r)); }
      await new Promise((r) => setTimeout(r, 40));
      return out;
    });
    expect(steps.length).toBe(5);
    steps.forEach((s, i) => {
      const total = (i + 1) * 20;
      expect(s.y).toBe(total);
      expect(s.barTop).toBe(-total);
      expect(s.frameTop).toBe(h - total); // the frame follows the bar up
    });
    // On to the end of the bar, and further: fully out, and out of reach
    await page.frame({ url: /frame\.html/ }).evaluate(async () => { const b = document.querySelector('.tp-body'); for (let i = 0; i < 12; i++) { b.scrollTop += 20; await new Promise((r) => requestAnimationFrame(r)); } });
    expect(await barState(page)).toMatchObject({ barTop: -h, frameTop: 0, inert: true });
    // The first step back up brings it back, one to one
    const up = await page.frame({ url: /frame\.html/ }).evaluate(async () => {
      const out = [], body = document.querySelector('.tp-body'), frame = parent.document.querySelector('.sh-frame:not([inert])'), bar = parent.document.querySelector('.sh-bar');
      document.addEventListener('scroll', (e) => { if (e.target === body) out.push({ barTop: Math.round(bar.getBoundingClientRect().top), frameTop: Math.round(frame.getBoundingClientRect().top), inert: parent.document.querySelector('.sh-bar').inert }); }, true);
      for (let i = 0; i < 3; i++) { body.scrollTop -= 15; await new Promise((r) => requestAnimationFrame(r)); }
      await new Promise((r) => setTimeout(r, 40));
      return out;
    });
    expect(up.length).toBe(3);
    up.forEach((s, i) => { expect(s.barTop).toBe(-h + 15 * (i + 1)); expect(s.frameTop).toBe(15 * (i + 1)); expect(s.inert).toBe(false); });
  });

  test('when scrolling stops part way the bar settles to the nearer end, and the end of the page does not bring it back', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${VIEWER}?theme=hifi&phone`);
    await expect(frame(page, 1).locator('#tp-phone')).toBeVisible();
    const h = (await barState(page)).barH;
    await scrollBy(page, 30); // less than half the bar: back to shown
    await expect.poll(async () => (await barState(page)).barTop, { timeout: 2000 }).toBe(0);
    await scrollBy(page, 70); // more than half the bar: away
    await expect.poll(async () => (await barState(page)).barTop, { timeout: 2000 }).toBe(-h);
    expect((await barState(page)).frameTop).toBe(0);
    // Right to the foot of the page it stays away: the frame growing must not read as a scroll up
    await page.frame({ url: /frame\.html/ }).evaluate(() => { const b = document.querySelector('.tp-body'); b.scrollTop = b.scrollHeight; });
    await page.waitForTimeout(500);
    expect((await barState(page)).barTop).toBe(-h);
    // Back to the top: shown
    await page.frame({ url: /frame\.html/ }).evaluate(() => { document.querySelector('.tp-body').scrollTop = 0; });
    await expect.poll(async () => (await barState(page)).barTop, { timeout: 2000 }).toBe(0);
  });

  test('switching tab brings the bar back, and the other version starts with it shown', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${VIEWER}?theme=hifi&phone`);
    await expect(frame(page, 1).locator('#tp-phone')).toBeVisible();
    const h = (await barState(page)).barH;
    await scrollBy(page, 300);
    await expect.poll(async () => (await barState(page)).barTop, { timeout: 2000 }).toBe(-h);
    await scrollBy(page, -80); // back up by more than half the bar: it settles shown, in reach
    await tab(page, 2).click();
    await expect(frame(page, 2).locator('#tp-phone')).toBeVisible();
    await expect.poll(async () => (await barState(page)).barTop, { timeout: 2000 }).toBe(0);
    await scrollBy(page, 300, 2);
    await expect.poll(async () => (await barState(page)).barTop, { timeout: 2000 }).toBe(-h);
  });

  test('the bar stays put when the version is not filling the screen (a desktop window)', async ({ page }) => {
    await page.goto(`${VIEWER}?theme=hifi`);
    await expect(frame(page, 1).locator('#tp-phone')).toBeVisible();
    await page.frame({ url: /v1-frame/ }).evaluate(() => { document.querySelector('.tp-body').scrollTop = 800; });
    await page.waitForTimeout(600);
    expect((await page.evaluate(() => document.body.style.getPropertyValue('--sh-off'))) || '0px').toBe('0px');
  });
  // The bar must never take height from the phone window: over the top of the version's left panel in a window that
  // shows the viewer, one short row above a phone view that fills its window
  test('in a window that shows the viewer the bar sits over the left panel and the phone gets the whole height', async ({ page }) => {
    for (const [w, h, panel] of [[1518, 832, 460], [1280, 800, 460], [940, 700, 360]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(`${VIEWER}?theme=hifi`);
      await expect(frame(page, 1).locator('#tp-phone')).toBeVisible();
      const m = await page.evaluate(() => {
        const fr = document.getElementById('sh-f1'), f = fr.contentDocument, bar = document.querySelector('.sh-bar').getBoundingClientRect();
        const ph = f.getElementById('tp-phone').getBoundingClientRect(), c = f.querySelector('.pv-concept').getBoundingClientRect();
        return { frameTop: fr.getBoundingClientRect().top, frameH: fr.getBoundingClientRect().height, barW: bar.width, barBottom: bar.bottom, conceptTop: c.top, phoneBottomGap: fr.getBoundingClientRect().height - ph.bottom };
      });
      expect(m.frameTop).toBe(0);
      expect(m.frameH).toBe(h);
      expect(m.barW).toBe(panel);
      expect(m.conceptTop).toBeGreaterThanOrEqual(m.barBottom - 1); // the panel's text starts below the bar
      expect(m.phoneBottomGap).toBeLessThanOrEqual(40);              // the phone runs to the foot of the window
    }
  });

  test('a phone view that fills a wide window has one short row above it', async ({ page }) => {
    await page.goto(`${VIEWER}?theme=hifi&phone`);
    await expect(frame(page, 1).locator('#tp-phone')).toBeVisible();
    const m = await page.evaluate(() => ({ h: document.querySelector('.sh-bar').offsetHeight, w: document.querySelector('.sh-bar').offsetWidth, top: document.getElementById('sh-f1').getBoundingClientRect().top }));
    expect(m.h).toBeLessThan(70);
    expect(m.w).toBe(1280);
    expect(m.top).toBe(m.h);
  });
});
