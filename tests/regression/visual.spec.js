// Visual baseline: a fixed list of states, each compared pixel for pixel with its saved screenshot in __screenshots__/.
// Named <option>-<theme>-<width>-<state>.png. Page states are captured at their full height; sheets, menus and the
// open plan at the phone's own screen size.
import {
  test, expect, open, goPlan, pick, fcNext, fcStep, openPlan, openMatch, openSettings, expandToContent, settle, TEAMS,
} from './helpers.js';

const [ONE, TWO] = TEAMS;

// Option C: from two teams picked, through each step (teams, tickets, your days) to Your answers
async function finishC(page) {
  for (let i = 0; i < 3 && (await fcStep(page)); i++) await fcNext(page);
  expect(await fcStep(page)).toBe('');
}

const STATES = {
  home: { full: true, run: async () => {} },
  'plan-empty': { full: true, run: async (page) => { await goPlan(page); } },
  'one-card': { full: true, run: async (page) => { await goPlan(page); await pick(page, ONE); } },
  'two-cards': { full: true, run: async (page) => { await goPlan(page); await pick(page, ONE); await pick(page, TWO); } },
  'c-tickets': { only: 'C', full: true, run: async (page) => {
    await goPlan(page); await pick(page, ONE); await pick(page, TWO); await fcNext(page);
    expect(await fcStep(page)).toBe('tickets');
  } },
  'c-days': { only: 'C', full: true, run: async (page) => {
    await goPlan(page); await pick(page, ONE); await pick(page, TWO); await fcNext(page); await fcNext(page);
    expect(await fcStep(page)).toBe('days');
  } },
  // The page once the questions are done; Your answers is a card in the open plan (plan-open)
  'c-done': { only: 'C', full: true, run: async (page) => {
    await goPlan(page); await pick(page, ONE); await pick(page, TWO); await finishC(page);
  } },
  // Change on the Your answers card drills down inside the open plan to every answer's controls
  'c-answers': { only: 'C', full: false, run: async (page) => {
    await goPlan(page); await pick(page, ONE); await pick(page, TWO); await finishC(page); await openPlan(page);
    await page.locator('#tp-phone [data-fc-card="open"]:visible').first().click();
    await settle(page);
    await expect(page.locator('#tp-fc-lh')).toBeVisible();
  } },
  'plan-open': { full: false, run: async (page, option) => {
    await goPlan(page); await pick(page, ONE); await pick(page, TWO);
    if (option === 'C') await finishC(page);
    await openPlan(page);
  } },
  'match-sheet': { full: false, run: async (page, option) => {
    await goPlan(page); await pick(page, ONE); await pick(page, TWO);
    if (option === 'C') await finishC(page);
    await openMatch(page);
  } },
  settings: { full: false, run: async (page) => { await openSettings(page); } },
};

for (const option of ['A', 'B', 'C']) {
  for (const theme of ['hifi', 'wireframe']) {
    for (const width of [390, 320]) {
      test.describe(`Option ${option} · ${theme} · ${width}`, () => {
        for (const [state, def] of Object.entries(STATES)) {
          if (def.only && def.only !== option) continue;
          test(state, async ({ page }) => {
            await open(page, { option, theme, width });
            await def.run(page, option);
            if (def.full) await expandToContent(page, width);
            await settle(page);
            await expect(page).toHaveScreenshot(`${option}-${theme}-${width}-${state}.png`);
          });
        }
      });
    }
  }
}
