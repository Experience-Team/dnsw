// Behaviour smoke tests: picking, clearing, saving and every address flag still doing its job, in Version 1.
// Every test also fails on a console error (helpers.js).
import {
  test, expect, open, goPlan, goTab, pick, picked, card, settle, fcStep, openSettings, url, phone, TEAMS,
} from './helpers.js';

const [ONE, TWO] = TEAMS;
const bar = (page) => page.locator('#tp-tl-toggle');
const clearAll = (page) => page.locator('#tp-clear');
const state = (page) => page.evaluate(() => window.tpPicker.state.picked.slice());

for (const option of ['C']) {
  test.describe(`Version 1`, () => {
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

    // Home's I'm just here for the rugby picks every NSW match; the teams step has its own button (below)
    const places = [['Home', 'Home', '#tp-home-rugby .tp-rugby-link']];
    for (const [where, tab, sel] of places) {
      test(`Every NSW match (${where}) and a team replace each other`, async ({ page }) => {
        await goTab(page, tab);
        await page.locator(sel).click();
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
  test('?flow=c opens Version 1, its tab marked current', async ({ page }) => {
    await open(page, { option: 'C', width: 390 });
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-flow'))).toBe('c');
    await expect(page.locator('.pv-tabs [aria-current="page"]')).toHaveText('Version 1');
    await expect(page.locator('.pv-tabs .pv-tab', { hasText: /Option [AB]/ })).toHaveCount(0);
  });

  // Options A and B were archived on 25 Nov: their addresses open Version 1, other flags and the #hash kept
  for (const [from, to] of [
    ['', '?flow=c'],
    ['?flow=a', '?flow=c'],
    ['?flow=a&phone&theme=hifi', '?flow=c&phone&theme=hifi'],
    ['?theme=hifi&flow=a&reset', '?flow=c&theme=hifi&reset'],
    ['?flow=c&phone', '?flow=c&phone'],
  ]) {
    test(`${from || 'no flow'} opens Version 1 at ${to}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/wireframes/prototype-pick-your-team.html${from}#tp-ov`);
      await settle(page);
      const u = new URL(page.url());
      expect(u.search).toBe(to);
      expect(u.hash).toBe('#tp-ov');
      expect(await page.evaluate(() => document.documentElement.getAttribute('data-flow'))).toBe('c');
      await expect(page.locator('.pv-tabs [aria-current="page"]')).toHaveText('Version 1');
    });
  }

  test('an old address and ?flow=c share Version 1\'s saved picks', async ({ page }) => {
    await open(page, { option: 'C' });
    await goPlan(page); await pick(page, ONE);
    await page.goto('/wireframes/prototype-pick-your-team.html?phone&theme=hifi&flow=a');
    await settle(page);
    expect(await state(page)).toEqual([ONE]);
  });

  test('?flow=c: the Plan tab asks step by step, Next waits for a team, and Next moves on', async ({ page }) => {
    await open(page, { option: 'C' });
    await goPlan(page);
    expect(await fcStep(page)).toBe('teams');
    await expect(page.locator('#tp-fc')).toContainText('Step 1 of 3');
    const next = page.locator('#tp-phone .tp-fc-next:visible');
    // Step 1 is the one required answer: Next stays in place, unavailable, with a line saying why, until a team is picked
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('#tp-fc-why')).toBeVisible();
    await pick(page, ONE);
    await expect(next).not.toHaveAttribute('aria-disabled', 'true');
    await next.click();
    await settle(page);
    expect(await fcStep(page)).toBe('tickets');
    await page.reload();
    await settle(page);
    expect(await fcStep(page)).toBe('tickets');
  });

  test('?flow=c: Show every NSW match answers step 1 and moves on', async ({ page }) => {
    await open(page, { option: 'C' });
    await goPlan(page);
    await page.locator('#tp-phone [data-fc-all]').click();
    await settle(page);
    expect(await state(page)).toEqual(['Every NSW match']);
    await expect(bar(page)).toContainText('Every NSW match');
    expect(await fcStep(page)).not.toBe('teams');
  });

  test('?phone shows only the phone screen', async ({ page }) => {
    await open(page, { width: 390 });
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
    await open(page, { theme: '' });
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('hifi');
  });
});
