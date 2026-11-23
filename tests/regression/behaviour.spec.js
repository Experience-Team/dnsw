// Behaviour smoke tests: picking, clearing, saving and every address flag still doing its job, in each option.
// Every test also fails on a console error (helpers.js).
import {
  test, expect, open, goPlan, goTab, pick, picked, card, settle, fcStep, openSettings, url, phone, TEAMS,
} from './helpers.js';

const [ONE, TWO] = TEAMS;
const bar = (page) => page.locator('#tp-tl-toggle');
const clearAll = (page) => page.locator('#tp-clear');
const state = (page) => page.evaluate(() => window.tpPicker.state.picked.slice());

for (const option of ['A', 'B', 'C']) {
  test.describe(`Option ${option}`, () => {
    test.beforeEach(async ({ page }) => {
      await open(page, { option, theme: 'hifi', width: 390 });
      await goPlan(page);
    });

    test('pick and unpick a team', async ({ page }) => {
      await pick(page, ONE);
      await expect(card(page, ONE)).toHaveAttribute('aria-pressed', 'true');
      await expect(bar(page)).toContainText(ONE);
      await pick(page, ONE);
      await expect(card(page, ONE)).toHaveAttribute('aria-pressed', 'false');
      expect(await picked(page)).toEqual([]);
      await expect(bar(page)).toContainText('No matches yet');
    });

    test('Clear all shows only once something is picked, and clears every pick', async ({ page }) => {
      await expect(clearAll(page)).toBeHidden();
      await pick(page, ONE);
      await pick(page, TWO);
      expect((await picked(page)).sort()).toEqual([ONE, TWO].sort());
      await expect(clearAll(page)).toBeVisible();
      await clearAll(page).click();
      await settle(page);
      expect(await picked(page)).toEqual([]);
      await expect(clearAll(page)).toBeHidden();
    });

    // Every NSW match sits in a different place in each option: the Plan tab's All matches in A, Home's All matches in
    // B, the teams step in C; Home's I'm just here for the rugby does the same in all three
    const EVERY = { A: ['Plan your 3rd half', '#tp-all'], B: ['Home', '#tp-all'], C: ['Plan your 3rd half', '#tp-fc-rugby'] };
    for (const [where, tab, sel] of [['its own place', ...EVERY[option]], ['Home', 'Home', '#tp-home-rugby']]) {
      test(`Every NSW match (${where}) and a team replace each other`, async ({ page }) => {
        await goTab(page, tab);
        await page.locator(`${sel} .tp-rugby-link`).click();
        await settle(page);
        expect(await state(page)).toEqual(['Every NSW match']);
        await expect(bar(page)).toContainText('Every NSW match');
        await goPlan(page);
        expect(await picked(page)).toEqual([]);
        await pick(page, TWO);
        expect(await state(page)).toEqual([TWO]);
        await expect(bar(page)).not.toContainText('Every NSW match');
      });
    }

    test('a reload keeps the picks', async ({ page }) => {
      await pick(page, ONE);
      await pick(page, TWO);
      await page.reload();
      await settle(page);
      expect((await state(page)).sort()).toEqual([ONE, TWO].sort());
      await expect(bar(page)).toContainText(ONE);
    });

    test('Reset prototype in the Settings menu clears everything', async ({ page }) => {
      await pick(page, ONE);
      await openSettings(page);
      await page.getByText('Reset prototype', { exact: true }).click();
      await settle(page);
      expect(await state(page)).toEqual([]);
      await expect(bar(page)).toContainText('No matches yet');
      if (option === 'C') expect(await fcStep(page)).toBe('teams');
      await page.reload();
      await settle(page);
      expect(await state(page)).toEqual([]);
    });

    test('?reset clears the saved picks', async ({ page }) => {
      await pick(page, ONE);
      await page.goto(url(option, 'hifi', 'reset'));
      await settle(page);
      expect(await state(page)).toEqual([]);
      if (option === 'C') expect(await fcStep(page)).toBe('teams');
    });
  });
}

test.describe('Address flags', () => {
  const tabs = { A: 'Option A', B: 'Option B', C: 'Option C' };
  for (const option of ['A', 'B', 'C']) {
    test(`${option === 'A' ? 'no flow' : `?${option === 'B' ? 'flow=a' : 'flow=c'}`} opens Option ${option}, its tab marked current`, async ({ page }) => {
      await open(page, { option, width: 390 });
      const flow = { A: null, B: 'a', C: 'c' }[option];
      expect(await page.evaluate(() => document.documentElement.getAttribute('data-flow'))).toBe(flow);
      await expect(page.locator('.pv-tabs [aria-current="page"]')).toHaveText(tabs[option]);
    });
  }

  test('each option keeps its own saved picks', async ({ page }) => {
    await open(page, { option: 'A' });
    await goPlan(page); await pick(page, ONE);
    await open(page, { option: 'B' });
    await goPlan(page);
    expect(await state(page)).toEqual([]);
    await pick(page, TWO);
    await open(page, { option: 'C' });
    await goPlan(page);
    expect(await state(page)).toEqual([]);
    await open(page, { option: 'A' });
    expect(await state(page)).toEqual([ONE]);
    await open(page, { option: 'B' });
    expect(await state(page)).toEqual([TWO]);
  });

  // Where a pick leaves you: Option B takes you down to the team's match card; Option A keeps the hand in view, with
  // the match cards still below
  const after = async (page) => page.evaluate(() => {
    const top = (el) => (el ? el.getBoundingClientRect().top : null);
    const match = [...document.querySelectorAll('#tp-phone .tc-open')].find((e) => e.getBoundingClientRect().height);
    return { card: top(document.querySelector('#tp-phone .tp-card2[aria-pressed="true"]')), match: top(match), h: innerHeight };
  });

  test('?flow=a: a pick scrolls to its match card', async ({ page }) => {
    await open(page, { option: 'B' });
    await goPlan(page);
    await pick(page, ONE);
    const a = await after(page);
    expect(a.match).toBeGreaterThanOrEqual(0);
    expect(a.match).toBeLessThan(a.h);
    expect(a.card).toBeLessThan(0);
  });

  test('Option A: a pick keeps the hand in view, not the match cards', async ({ page }) => {
    await open(page, { option: 'A' });
    await goPlan(page);
    await pick(page, ONE);
    const a = await after(page);
    expect(a.card).toBeGreaterThanOrEqual(0);
    expect(a.card).toBeLessThan(a.h);
    expect(a.match).toBeGreaterThan(a.h);
  });

  test('?flow=c: the Plan tab asks step by step, and Next moves on', async ({ page }) => {
    await open(page, { option: 'C' });
    await goPlan(page);
    expect(await fcStep(page)).toBe('teams');
    await expect(page.locator('#tp-fc')).toContainText('Step 1 of 4');
    await pick(page, ONE);
    await page.locator('#tp-phone .tp-fc-next:visible').click();
    await settle(page);
    expect(await fcStep(page)).toBe('tickets');
    await page.reload();
    await settle(page);
    expect(await fcStep(page)).toBe('tickets');
  });

  test('?phone shows only the phone screen', async ({ page }) => {
    await open(page, { option: 'A', width: 390 });
    await expect(page.locator('html')).toHaveClass(/\bpv-device\b/);
    await expect(page.locator('.pv-side')).toBeHidden();
    await expect(phone(page)).toBeVisible();
  });

  test('without ?phone a desktop window shows the viewer and its side panel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/wireframes/prototype-pick-your-team.html?theme=hifi');
    await settle(page);
    await expect(page.locator('html')).not.toHaveClass(/\bpv-device\b/);
    await expect(page.locator('.pv-side')).toBeVisible();
    await expect(phone(page)).toBeVisible();
  });

  test('?theme sets the theme, the switch follows, and the choice is remembered', async ({ page }) => {
    const theme = () => page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/wireframes/prototype-pick-your-team.html?theme=wireframe');
    await settle(page);
    expect(await theme()).toBeNull();
    await expect(page.locator('#pv-theme-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.goto('/wireframes/prototype-pick-your-team.html');
    await settle(page);
    expect(await theme()).toBeNull();
    await page.goto('/wireframes/prototype-pick-your-team.html?theme=hifi');
    await settle(page);
    expect(await theme()).toBe('hifi');
    await expect(page.locator('#pv-theme-toggle')).toHaveAttribute('aria-checked', 'true');
    await page.goto('/wireframes/prototype-pick-your-team.html');
    await settle(page);
    expect(await theme()).toBe('hifi');
  });

  test('with no theme asked for or remembered, the page opens in high fidelity', async ({ page }) => {
    await open(page, { option: 'A', theme: '' });
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('hifi');
  });
});
