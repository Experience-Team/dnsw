// Things changed on 25 Nov 2026 that had no test (docs/handover-25-nov.md): the one-line toast, the Where to watch
// ticket lines, the saved-on-this-device line that was removed, Home's pictures, the hidden focus rings and the end of
// Version 2's page. Version 1 is the page Option C became; Version 2 is its own page.
import { test, expect, open, goPlan, pick, fcNext, fcStep, settle, phone, SIZES } from './helpers.js';

const V2 = '/wireframes/prototype-pick-your-team-v2-frame.html';
const v2url = (extra = '') => `${V2}?${['phone', 'theme=hifi', extra].filter(Boolean).join('&')}`;
const toast = (page) => page.locator('#tp-phone .tp-toast');

// Version 1 with Japan picked and the three steps answered (teams, days, where you're staying), so the page shows Your
// matches. Days wide enough for several NSW matches, so Also on in NSW has matches to add (26 Nov 2026: no tickets)
async function planned(page, width = 390) {
  await open(page, { option: 'C', width, extra: 'reset' });
  await goPlan(page);
  await pick(page, 'Japan');
  for (let i = 0; i < 4 && (await fcStep(page)); i++) {
    if ((await fcStep(page)) === 'stay') await page.locator('#tp-ask [data-base="Sydney CBD"]').click();
    await fcNext(page);
  }
  expect(await fcStep(page)).toBe('');
  await page.evaluate(() => window.tpPicker.setTrip({ from: '2027-10-01', to: '2027-10-20', base: 'Sydney CBD' }));
  await settle(page);
}
// Add on the first match under Also on in NSW: a change that lands out of view, so it gets a toast
const addAlso = (page) => page.locator('#v1-also .tp-add').first();

test.describe('25 Nov changes', () => {
  test('A toast is one sentence with at most one link, and goes after about 4 seconds', async ({ page }) => {
    await planned(page);
    await addAlso(page).scrollIntoViewIfNeeded();
    await addAlso(page).click();
    await expect(toast(page)).toBeVisible();
    await expect(toast(page).locator('.tp-toast-txt')).toHaveText(/^[\w ]+ v [\w ]+ added to your plan, [\w ]+\.$/);
    expect(await toast(page).locator('.tp-toast-t, .tp-toast-d, .tp-toast-x').count()).toBe(0);   // no title, no second line, no cross
    expect(await toast(page).locator('button:visible').count()).toBeLessThanOrEqual(1);
    expect((await toast(page).boundingBox()).height).toBeLessThanOrEqual(60);
    await page.mouse.move(5, 5);   // off the toast: hovering holds it
    await page.waitForTimeout(3000);
    await expect(toast(page)).toBeVisible();
    await expect(toast(page)).toBeHidden({ timeout: 2500 });
  });

  test('A toast on the page goes when a sheet opens over it', async ({ page }) => {
    await planned(page);
    await addAlso(page).scrollIntoViewIfNeeded();
    await addAlso(page).click();
    await expect(toast(page)).toBeVisible();
    await page.locator('#tp-phone .tc-open:visible').first().click();
    await expect(page.locator('#tp-phone [role="dialog"]:visible').first()).toBeVisible();
    await expect(toast(page)).toBeHidden({ timeout: 1500 });
  });

  test('There are no tickets anywhere: no step, no I have tickets button, no ticket box in a match sheet', async ({ page }) => {
    await planned(page);
    expect(await page.locator('#tp-phone [data-ticket], #tp-phone .tc-tix, #tp-phone [data-pm-ticket], #tp-phone [data-fc-tix]').count()).toBe(0);
    await page.locator('#tp-phone .tc-open:visible').first().click();
    await settle(page);
    await expect(page.locator('#tp-pm')).not.toContainText('I have a ticket');
  });

  test('Save & share no longer says Saved on this device only, in either version', async ({ page }) => {
    await planned(page);
    expect(await page.locator('#tp-ss-note').textContent()).toBe('');
    await expect(page.locator('#tp-ss .cn-note')).toBeHidden();
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url());
    await page.evaluate(() => {
      const a = window.TP_ARTICLES[0];
      localStorage.setItem('tp-pick-v1', JSON.stringify({ picked: [], added: [{ id: 'v2art:' + a.slug, kind: 'v2art', title: a.title, day: '', unplaced: true, art: a.slug }] }));
    });
    await page.reload();
    await page.locator('.v2-pb:not(.v2-pb--top)').click();
    await expect(page.locator('#v2-sv')).toBeVisible();
    await expect(page.locator('#v2-sv')).not.toContainText('Saved on this device only');
    await page.locator('#v2-sv-share').click();
    await expect(page.locator('#v2-sv')).toContainText('Copy plan');
    await expect(page.locator('#v2-sv')).not.toContainText('Saved on this device only');
  });

  for (const [name, go] of [['Version 1', (page) => open(page, { option: 'C', extra: 'reset' })], ['Version 2', async (page) => { await page.setViewportSize({ width: 390, height: SIZES[390] }); await page.goto(v2url('reset')); await expect(phone(page)).toBeVisible(); }]]) {
    test(`${name} Home: At a glance and the article cards each show a different picture`, async ({ page }) => {
      await go(page);
      await expect.poll(() => page.locator('#tp-home-reads [data-img]').first().evaluate((e) => e.style.backgroundImage)).toContain('url(');
      const pics = await page.evaluate(() => [...document.querySelectorAll('#tp-home-glance [data-img], #tp-home-reads [data-img]')]
        .map((e) => [e.getAttribute('data-img'), (/images\/([^"]+)"/.exec(e.style.backgroundImage) || [])[1]]));
      expect(pics.length).toBeGreaterThanOrEqual(8);
      const byFile = {};
      for (const [n, f] of pics) { expect(f, `${n} has a picture`).toBeTruthy(); (byFile[f] = byFile[f] || new Set()).add(n); }
      const shared = Object.entries(byFile).filter(([, s]) => s.size > 1).map(([f, s]) => `${f}: ${[...s].join(', ')}`);
      expect(shared, 'pictures used by more than one card on Home').toEqual([]);
    });
  }

  test('Focus rings are hidden for now: tabbing through Version 1 shows none (no-focus-ring.css, to be removed before production)', async ({ page }) => {
    await open(page, { option: 'C', extra: 'reset' });
    expect(await page.locator('link[href*="no-focus-ring"]').count()).toBe(1);
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const ring = await page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const c = getComputedStyle(a); return c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0 ? a.className || a.tagName : null; });
      expect(ring, 'a focused control shows an outline').toBeNull();
    }
  });

  test('Version 2: the page ends on the footer, whose text lines up with the content on a wide screen', async ({ page }) => {
    for (const size of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(size);
      await page.goto(v2url('reset'));
      await expect(phone(page)).toBeVisible();
      const m = await page.evaluate(() => {
        const b = document.querySelector('#tp-phone .tp-body'); b.scrollTo(0, b.scrollHeight);
        const f = document.querySelector('.tp-home-foot').getBoundingClientRect(), br = b.getBoundingClientRect();
        return { gap: Math.round(br.bottom - f.bottom), text: Math.round(document.querySelector('.tp-home-foot p').getBoundingClientRect().left), content: Math.round(document.querySelector('#tp-home-reads').getBoundingClientRect().left) }; // a full-width section: on a wide screen Going with friends sits beside the FAQ (26 Nov 2026)
      });
      expect(m.gap, `no page colour under the footer at ${size.width}`).toBeLessThanOrEqual(0);
      expect(m.text).toBe(m.content);
    }
  });
});
