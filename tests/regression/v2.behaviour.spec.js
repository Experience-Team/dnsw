// Version 2 (public/wireframes/prototype-pick-your-team-v2.html): smoke tests that keep it apart from Options A to C.
// Every test also fails on a console error (helpers.js).
import { test, expect, SIZES, PAGE } from './helpers.js';

const V2 = '/wireframes/prototype-pick-your-team-v2.html';
const v2url = (theme, extra = '') => `${V2}?${['phone', theme && `theme=${theme}`, extra].filter(Boolean).join('&')}`;

test.describe('Version 2', () => {
  for (const theme of ['hifi', 'wireframe']) {
    for (const width of [390, 320]) {
      test(`opens in phone view · ${theme} · ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: SIZES[width] });
        await page.goto(v2url(theme));
        await expect(page.locator('#tp-phone')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe(theme === 'hifi' ? 'hifi' : null);
      });
    }
  }

  test('its tabs show only Version 2 and the Iterations placeholder', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(V2);
    const tabs = page.locator('.pv-side .pv-tabs .pv-tab');
    await expect(tabs).toHaveText(['Version 2', 'Iterations, none saved yet']);
    await expect(page.locator('.pv-side .pv-tabs a.pv-tab')).toHaveCount(1);
    await expect(page.locator('.pv-tabs .v2-tab-soon')).toHaveAttribute('aria-disabled', 'true');
    // Nothing in the side panel links to Options A to C
    expect(await page.locator('.pv-side a[href*="prototype-pick-your-team.html"]').count()).toBe(0);
  });

  test('the Settings menu lists only Version 2', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    await page.locator('#tp-dev-set').click();
    await expect(page.locator('#tp-dev-menu a.tp-dev-item')).toHaveText(['Version 2']);
    await expect(page.locator('#tp-dev-menu #tp-reset')).toBeVisible();
  });

  test('loads the shared data and none of the Options A to C behaviour scripts', async ({ page }) => {
    await page.goto(V2);
    const got = await page.evaluate(() => ({
      data: [!!window.cnFixtures, !!window.cnDestinations, !!window.cnGeo, !!window.TP_WORDS, !!window.TP_ARTICLES],
      scripts: [...document.scripts].map((s) => s.getAttribute('src')).filter(Boolean),
      picker: typeof window.tpPicker, flowC: typeof window.tpFlowC,
    }));
    expect(got.data).toEqual([true, true, true, true, true]);
    expect(got.picker).toBe('undefined');
    expect(got.flowC).toBe('undefined');
    for (const s of ['concepts-teams.js', 'concepts-third-half.js', 'concepts-map.js', 'concepts-plan.js', 'concepts-home.js', 'concepts-flow-c.js']) {
      expect(got.scripts, `Version 2 must not load ${s}`).not.toContain(s);
    }
  });

  test('its saved state is its own, and Reset clears only that', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    // Something Option A saved under the same name
    await page.goto(`${PAGE}?theme=hifi`);
    await page.evaluate(() => { localStorage.setItem('tp-pick-v1', 'option-a'); });
    await page.goto(`${V2}?theme=hifi`);
    // Version 2 sees none of it, and writes under v2:
    expect(await page.evaluate(() => localStorage.getItem('tp-pick-v1'))).toBeNull();
    await page.evaluate(() => { localStorage.setItem('tp-pick-v1', 'v2'); sessionStorage.setItem('scratch', 'v2'); });
    const raw = await page.evaluate(() => [null, Object.keys(localStorage).sort(), Object.keys(sessionStorage)]);
    expect(raw[1]).toEqual(expect.arrayContaining(['tp-pick-v1', 'v2:tp-pick-v1']));
    expect(raw[2]).toContain('v2:scratch');
    // Reset clears Version 2's keys and leaves Option A's and the viewer's
    await Promise.all([page.waitForEvent('load'), page.locator('#tp-reset').click()]);
    const after = await page.evaluate(() => Object.keys(localStorage).sort());
    expect(after).not.toContain('v2:tp-pick-v1');
    expect(after).toContain('tp-pick-v1');
    expect(after).toContain('pv-theme');
    expect(await page.evaluate(() => Object.keys(sessionStorage))).not.toContain('v2:scratch');
  });

  test('?reset clears only its own keys and drops itself from the address', async ({ page }) => {
    await page.goto(`${V2}?theme=hifi`);
    await page.evaluate(() => { localStorage.setItem('x', '1'); });
    await page.goto(`${V2}?theme=hifi&reset`);
    expect(await page.evaluate(() => localStorage.getItem('x'))).toBeNull();
    expect(new URL(page.url()).search).toBe('?theme=hifi');
  });

  test('Options A to C do not link to Version 2', async ({ page }) => {
    for (const q of ['', '?flow=a', '?flow=c']) {
      await page.goto(`${PAGE}${q}`);
      expect(await page.locator('a[href*="prototype-pick-your-team-v2"]').count()).toBe(0);
    }
  });
});
