// Version 2 (public/wireframes/prototype-pick-your-team-v2.html): screenshots compared pixel for pixel with their
// baselines, so a change to a shared file (shared.css, themes/hifi.css, pv-device.js, the data) that moves Version 2 is
// caught as well as one to Version 2 itself. Named v2-<theme>-<width>-<state>.png. Add a state here for each part built.
import { test, expect, SIZES, settle } from './helpers.js';

const V2 = '/wireframes/prototype-pick-your-team-v2.html';

// The Drop goal kick screen is in a frame: wait for it to load, its fonts and its first drawing
async function game(page) {
  const frame = page.frameLocator('#v2-game');
  await expect(frame.locator('#dg-head')).toHaveText(/tap to drop/i);
  await page.frame({ url: /drop-goal/ }).evaluate(async () => { await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
}
const STATES = {
  kick: async (page) => { await game(page); },
  // A picked team: its kit and ball, and its row on the nation table
  'kick-team': async (page) => {
    await page.evaluate(() => localStorage.setItem('dg-team', 'Wales'));
    await page.reload(); await game(page);
  },
  settings: async (page) => { await game(page); await page.locator('#tp-dev-set').click(); await settle(page); },
  // A goal for Wales, the result card settled (reduced motion, so it opens at once)
  result: async (page) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => localStorage.setItem('dg-team', 'Wales'));
    await page.reload(); await game(page);
    const f = page.frame({ url: /drop-goal/ });
    await f.evaluate(() => { const k = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })); k(); setTimeout(k, 760); });
    await f.waitForFunction(() => window.__dg2.phase() === 'result');
    await settle(page);
  },
  places: async (page) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await game(page); await page.frameLocator('#v2-game').locator('#dg-see').click(); await settle(page);
  },
};

for (const theme of ['hifi', 'wireframe']) {
  for (const width of [390, 320]) {
    test.describe(`Version 2 · ${theme} · ${width}`, () => {
      for (const [state, run] of Object.entries(STATES)) {
        test(state, async ({ page }) => {
          await page.setViewportSize({ width, height: SIZES[width] });
          await page.goto(`${V2}?phone&theme=${theme}`);
          await expect(page.locator('#tp-phone')).toBeVisible();
          await settle(page);
          await run(page);
          await expect(page).toHaveScreenshot(`v2-${theme}-${width}-${state}.png`);
        });
      }
    });
  }
}
