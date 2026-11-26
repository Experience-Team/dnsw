// Stacking (25 Nov 2026): the team cards (the hand, each card with its own z-index of up to 43) must never paint over what is
// meant to sit above the page as it scrolls under it: the capsule nav (Version 1) and the menu (Version 2), both sticky
// at the top of the screen. Opens each version's own page as a phone view at 390 wide and scrolls through the hand.
import { test, expect } from './helpers.js';

const VERSIONS = [
  { name: 'Version 1', page: '/wireframes/prototype-pick-your-team-v1-frame.html' },
  { name: 'Version 2', page: '/wireframes/prototype-pick-your-team-v2-frame.html' },
];

for (const V of VERSIONS) {
  test.describe(`${V.name}: stacking`, () => {
    // Scrolls the hand through the top of the screen and lists the positions where a card is under a part of the sticky nav (each
    // capsule item in Version 1, the Menu button in Version 2) and that part is not what a tap there would reach
    async function covered(page) {
      const m = await page.evaluate(() => {
        const body = document.querySelector('.tp-body'), w = document.querySelector('#tp-fan2-wrap');
        return { top: Math.round(w.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop), h: Math.round(w.getBoundingClientRect().height) };
      });
      const bad = [];
      for (let y = m.top - 120; y <= m.top + m.h + 80; y += 20) {
        const hit = await page.evaluate((y) => {
          document.querySelector('.tp-body').scrollTop = y;
          const parts = [...document.querySelectorAll('.tp-cap-wrap :is(button, a, .tp-cap-i)')].filter((e) => e.offsetParent);
          const cards = [...document.querySelectorAll('.tp-card2')].map((c) => c.getBoundingClientRect());
          let overCovered = false, nUnder = 0;
          for (const e of parts) {
            const r = e.getBoundingClientRect();
            if (!cards.some((b) => b.bottom > r.top && b.top < r.bottom && b.right > r.left && b.left < r.right)) continue;
            nUnder++;
            const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            if (!(t && e.contains(t) || t && t.closest('.tp-cap-wrap'))) overCovered = true;
          }
          return { nUnder, overCovered };
        }, y);
        if (hit.overCovered) bad.push(y);
        if (hit.nUnder) bad.nUnder = (bad.nUnder || 0) + 1;
      }
      return { bad: [...bad], nUnder: bad.nUnder || 0 };
    }

    test('the sticky nav stays above the team cards all the way through the hand', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${V.page}?phone&theme=hifi`);
      await expect(page.locator('#tp-phone')).toBeVisible();
      const r = await covered(page);
      expect(r.nUnder, 'the hand does pass under the nav in this test').toBeGreaterThan(0);
      expect(r.bad, 'scroll positions where a card paints over the sticky nav').toEqual([]);
    });

    // Version 1's capsule shares the cards' stacking level (z-index 40), so it is the one that was covered; Version 2's menu has its own,
    // higher level and was never covered, so there is nothing for the control to show there
    test('control: without the hand keeping its z-indexes to itself, the cards do paint over the nav', async ({ page }) => {
      test.skip(V.name === 'Version 2', "Version 2's menu sits above the cards on its own");
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${V.page}?phone&theme=hifi`);
      await expect(page.locator('#tp-phone')).toBeVisible();
      // Version 1's hand has six to a row since 26 Nov 2026, so its cards now top out at z-index 35: the control gives them the old height
      await page.addStyleTag({ content: '.tp-fan2-wrap { isolation: auto !important; } .tp-card2 { z-index: 43 !important; }' });
      expect((await covered(page)).bad.length).toBeGreaterThan(0);
    });

    test('a card still sits above the cards beside it when picked, and the hand does not leave its place', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${V.page}?phone&theme=hifi`);
      await expect(page.locator('#tp-phone')).toBeVisible();
      // The cards stack among themselves: each card's z-index is only compared with the other cards, inside the hand
      const m = await page.evaluate(() => {
        const wrap = document.querySelector('#tp-fan2-wrap'), c = getComputedStyle(wrap);
        return { isolated: c.isolation, z: [...document.querySelectorAll('.tp-card2')].map((e) => Number(getComputedStyle(e).zIndex) || 0) };
      });
      expect(m.isolated).toBe('isolate');
      expect(Math.max(...m.z)).toBeGreaterThan(V.name === 'Version 1' ? 30 : 40); // the fan still stacks its cards, bottom row on top (Version 1: four rows of six, up to 35)
    });
  });
}
