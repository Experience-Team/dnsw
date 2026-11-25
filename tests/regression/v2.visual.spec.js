// Version 2 (public/wireframes/prototype-pick-your-team-v2.html): screenshots compared pixel for pixel with their
// baselines, so a change to a shared file (shared.css, themes/hifi.css, pv-device.js, the data) that moves Version 2 is
// caught as well as one to Version 2 itself. Named v2-<theme>-<width>-<state>.png. Add a state here for each part built.
import { test, expect, SIZES, settle } from './helpers.js';

const V2 = '/wireframes/prototype-pick-your-team-v2-frame.html';

// The Drop goal kick screen is in a frame: wait for it to load, its fonts and its first drawing
async function game(page) {
  const frame = page.frameLocator('#v2-game');
  await expect(frame.locator('#dg-head')).toHaveText(/(tap|click) to drop/i);
  await page.frame({ url: /drop-goal\/index\.html(?!\?demo)/ }).evaluate(async () => { await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
}
// The game opens over the whole screen from Home (?view=kick opens it straight away); the picked team is Home's pick
const play = async (page, team) => {
  if (team) await page.evaluate((t) => localStorage.setItem('tp-pick-v1', JSON.stringify({ picked: [t] })), team);
  await page.evaluate(() => localStorage.setItem('v2ob-seen', '1'));   // past the first-time onboarding
  await page.goto(page.url() + '&view=kick'); await game(page); await settle(page);
};
const STATES = {
  home: async () => {},
  menu: async (page) => { await page.locator('#v2-menu-btn').click(); await settle(page); },
  'home-play': async (page) => { await page.locator('#tp-home-kick').scrollIntoViewIfNeeded(); await settle(page); },
  // The team screen, on the pitch (no team is picked on a first visit)
  'team-screen': async (page) => { await page.emulateMedia({ reducedMotion: 'reduce' }); await page.locator('#tp-home-kick button.tp-home-cta').click(); await settle(page); },
  kick: async (page) => { await play(page); },
  // A picked team: its kit and ball, and its row on the nation table
  'kick-team': async (page) => { await play(page, 'Wales'); },
  settings: async (page) => { await page.locator('#tp-dev-set').click(); await settle(page); },
  // A goal for Wales, the result card settled (reduced motion, so it opens at once)
  result: async (page) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await play(page, 'Wales');
    const f = page.frame({ url: /drop-goal\/index\.html(?!\?demo)/ });
    await f.evaluate(() => { const k = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })); k(); setTimeout(k, 760); });
    await f.waitForFunction(() => window.__dg2.phase() === 'result');
    await settle(page);
  },
  places: async (page) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await play(page); await page.frameLocator('#v2-game').locator('#dg-see').click(); await settle(page);
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
