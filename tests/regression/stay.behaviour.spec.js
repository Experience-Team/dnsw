// Where are you staying (26 Nov 2026): the quick answers follow the person's matches, outside NSW is a quiet link,
// and "Still deciding where to stay" is a valid answer with or without a place.
import { test, expect, open, goPlan, pick, fcStep, settle, phone } from './helpers.js';

const next = (page) => page.locator('#tp-phone .tp-fc-next:visible').first();
const buttons = (page) => page.locator('#tp-ask [data-base]').evaluateAll((els) => els.map((e) => e.textContent.trim()));

async function toStay(page, team) {
  await open(page, { option: 'C', extra: 'reset' });
  await goPlan(page);
  await pick(page, team);
  for (let i = 0; i < 2; i++) { await next(page).click(); await settle(page); }
  expect(await fcStep(page)).toBe('stay');
}

test.describe('Where are you staying', () => {
  for (const [team, want] of [
    ['Japan', ['Newcastle']],
    ['Australia', ['Sydney CBD', 'Around Olympic Park']],
    ['Ireland', ['Sydney CBD', 'Around Moore Park']],
    ['Zimbabwe', ['Sydney CBD', 'Newcastle']],
  ]) {
    test(`${team}: the quick answers follow its matches`, async ({ page }) => {
      await toStay(page, team);
      expect(await buttons(page)).toEqual(want);
      await expect(page.locator('#tp-ask [data-base="Bondi"], #tp-ask [data-base="outside"]')).toHaveCount(0);
    });
  }

  test('It is required, but Still deciding counts, with or without a place, and reload keeps it', async ({ page }) => {
    await toStay(page, 'Japan');
    await expect(next(page)).toHaveAttribute('aria-disabled', 'true');
    await page.locator('#tp-ask [data-guess]').click(); await settle(page);
    await expect(next(page)).not.toHaveAttribute('aria-disabled', 'true');
    expect(await page.evaluate(() => { const t = tpPicker.state.trip; return [t.guess, t.base || '']; })).toEqual([true, '']);
    await page.goto(page.url().replace('&reset', '')); await settle(page);   // ?reset would clear it again
    expect(await page.evaluate(() => { const t = tpPicker.state.trip; return [t.guess, t.base || '']; })).toEqual([true, '']);
  });

  test('Outside NSW is a quiet link, and choosing a place afterwards replaces it', async ({ page }) => {
    await toStay(page, 'Japan');
    await page.locator('#tp-ask [data-out]').click(); await settle(page);
    expect(await page.evaluate(() => tpPicker.state.trip.base)).toBe('outside');
    await expect(page.locator('#tp-ask [data-guess]')).toBeHidden();
    await page.locator('#tp-ask [data-base]').first().click(); await settle(page);
    expect(await page.evaluate(() => tpPicker.state.trip.base)).toBe('Newcastle');
  });
});
