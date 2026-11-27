// Where are you staying, or thinking of staying (27 Nov 2026): the quick answers follow the person's matches (named as the plan
// names them), outside NSW is a quiet link, a place is always required, and one more place can be added, each with Remove.
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
    ['Australia', ['Sydney CBD', 'Sydney Olympic Park']],
    ['Ireland', ['Sydney CBD', 'Moore Park']],
    ['Zimbabwe', ['Sydney CBD', 'Newcastle']],
  ]) {
    test(`${team}: the quick answers follow its matches`, async ({ page }) => {
      await toStay(page, team);
      expect(await buttons(page)).toEqual(want);
      await expect(page.locator('#tp-ask [data-base="Bondi"], #tp-ask [data-base="outside"]')).toHaveCount(0);
    });
  }

  test('A place is always required: there is no Still deciding, and the heading asks for a place or one being thought of', async ({ page }) => {
    await toStay(page, 'Japan');
    await expect(page.locator('#tp-fc-h')).toHaveText('Where are you staying, or thinking of staying?');
    await expect(page.locator('#tp-ask [data-guess]')).toHaveCount(0);
    await expect(next(page)).toHaveAttribute('aria-disabled', 'true');
    await page.locator('#tp-ask [data-base]').first().click(); await settle(page);
    await expect(next(page)).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('+ Add another place allows one more, each with Remove, and the plan reads both', async ({ page }) => {
    await toStay(page, 'Italy');
    await page.locator('#tp-ask [data-base="Sydney CBD"]').click(); await settle(page);
    await expect(page.locator('#tp-ask [data-rm]')).toHaveCount(0);        // one place: nothing to remove, it is required
    await page.locator('#tp-ask [data-add]').click(); await settle(page);
    await expect(page.locator('#tp-ask [data-base="Sydney CBD"]')).toHaveCount(0); // not the same place twice
    await page.locator('#tp-ask [data-cancel]').click(); await settle(page);
    expect(await page.evaluate(() => window.tpPicker.state.trip.base2)).toBeUndefined();
    await page.locator('#tp-ask [data-add]').click(); await settle(page);
    await page.locator('#tp-ask [data-base="Newcastle"]').click(); await settle(page);
    await expect(page.locator('#tp-ask [data-rm]')).toHaveCount(2);
    await expect(page.locator('#tp-ask [data-add]')).toHaveCount(0);       // two in total
    expect(await page.evaluate(() => window.tpPicker.stayLine(window.tpPicker.state.trip))).toBe('Staying in Sydney CBD and Newcastle');
    await page.locator('#tp-ask [data-rm="1"]').click(); await settle(page); // the second becomes the first
    expect(await page.evaluate(() => { const t = window.tpPicker.state.trip; return [t.base, t.base2 || '']; })).toEqual(['Newcastle', '']);
  });

  test('Outside NSW is a quiet link with no second place, and choosing a place afterwards replaces it', async ({ page }) => {
    await toStay(page, 'Japan');
    await page.locator('#tp-ask [data-out]').click(); await settle(page);
    expect(await page.evaluate(() => window.tpPicker.state.trip.base)).toBe('outside');
    await expect(page.locator('#tp-ask [data-add]')).toHaveCount(0);
    await page.locator('#tp-ask [data-base]').first().click(); await settle(page);
    expect(await page.evaluate(() => window.tpPicker.state.trip.base)).toBe('Newcastle');
  });

  test('Two places and a saved answer with no place: the first is kept on reload, the second too, and none goes back to step 3', async ({ page }) => {
    await toStay(page, 'Italy');
    await page.locator('#tp-ask [data-base="Sydney CBD"]').click(); await settle(page);
    await page.locator('#tp-ask [data-add]').click(); await settle(page);
    await page.locator('#tp-ask [data-base="Newcastle"]').click(); await settle(page);
    await page.goto(page.url().replace('&reset', '')); await settle(page);   // ?reset would clear it again
    expect(await page.evaluate(() => { const t = window.tpPicker.state.trip; return [t.base, t.base2]; })).toEqual(['Sydney CBD', 'Newcastle']);
    // an old Still deciding answer (a guess, no place) on a finished flow goes back to step 3
    await page.evaluate(() => { const k = Object.keys(localStorage).find((x) => /tp-pick-v1$/.test(x)); const s = JSON.parse(localStorage[k]); s.trip = { from: '2027-10-11', to: '2027-10-17', guess: true }; localStorage[k] = JSON.stringify(s); });
    await page.reload(); await settle(page);
    expect(await fcStep(page)).toBe('stay');
  });
});
