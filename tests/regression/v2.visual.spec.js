// Version 2 (public/wireframes/prototype-pick-your-team-v2.html): screenshots compared pixel for pixel with their
// baselines, so a change to a shared file (shared.css, themes/hifi.css, pv-device.js, the data) that moves Version 2 is
// caught as well as one to Version 2 itself. Named v2-<theme>-<width>-<state>.png. Add a state here for each part built.
import { test, expect, SIZES, settle } from './helpers.js';

const V2 = '/wireframes/prototype-pick-your-team-v2.html';

const STATES = {
  empty: async () => {},
  settings: async (page) => { await page.locator('#tp-dev-set').click(); await settle(page); },
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
