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

  // Drop goal's kick screen (v2/drop-goal/), in the phone's frame
  const frameOf = (page) => page.frame({ url: /drop-goal/ });
  async function openGame(page, team) {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    if (team !== undefined) { await page.evaluate((t) => localStorage.setItem('dg-team', t), team); await page.reload(); }
    await expect(page.frameLocator('#v2-game').locator('#dg-head')).toHaveText(/tap to drop/i);
    return frameOf(page);
  }
  // Two key presses, the second at the given time after the first (seconds), timed inside the game
  const kickAt = (frame, sec) => frame.evaluate((ms) => {
    const k = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
    k(); setTimeout(k, ms);
  }, Math.round(sec * 1000));

  test('Drop goal: the kicker wears the picked team, and no team gives the default kit', async ({ page }) => {
    let f = await openGame(page);
    expect(await f.evaluate(() => window.__dg2.team())).toBe('');
    await expect(page.frameLocator('#v2-game').locator('#dg-rows .is-mine')).toHaveCount(0);
    f = await openGame(page, 'Wales');
    expect(await f.evaluate(() => window.__dg2.team())).toBe('Wales');
    await expect(page.frameLocator('#v2-game').locator('#dg-rows .is-mine')).toContainText('Wales');
  });

  for (const [what, sec, phases, line] of [
    ['on the bounce is a goal', 0.76, ['goal'], /3 points for Wales/],
    ['early goes wide', 0.5, ['miss', 'pass', 'hold'], /Wide, a touch early/],
    ['late falls short', 1.1, ['miss', 'pass', 'hold'], /Short, a touch late/],
  ]) {
    test(`Drop goal: a kick ${what}, and it is announced`, async ({ page }) => {
      const f = await openGame(page, 'Wales');
      await kickAt(f, sec);
      await expect(page.frameLocator('#v2-game').locator('#dg-say')).toHaveText(line, { timeout: 4000 });
      expect(phases).toContain(await f.evaluate(() => window.__dg2.phase()));
      expect(await f.evaluate(() => window.__dg2.goals())).toBe(what.includes('goal') ? 1 : 0);
    });
  }

  test('Drop goal: with reduced motion the result shows straight away', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const f = await openGame(page, 'Wales');
    await kickAt(f, 0.76);
    await expect(page.frameLocator('#v2-game').locator('#dg-say')).toHaveText(/Goal/, { timeout: 1500 });
  });

  test('Drop goal: the team choice is Version 2\'s own, and Reset clears it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${V2}?theme=hifi`);
    await page.selectOption('#v2-team', 'Japan');
    expect(await page.evaluate(() => Object.keys(localStorage))).toContain('v2:dg-team');
    await expect(page.locator('#v2-game')).toHaveAttribute('src', /team=Japan/);
    await Promise.all([page.waitForEvent('load'), page.locator('#tp-reset').click()]);
    await expect(page.locator('#v2-team')).toHaveValue('');
  });

  // Result screen, See the places and Save (docs/drop-goal-brief.md, Result screen and Places)
  const inGame = (page) => page.frameLocator('#v2-game');
  async function score(page, f) {
    await kickAt(f, 0.76);
    await f.waitForFunction(() => window.__dg2.phase() === 'result', null, { timeout: 5000 });
    // the card has arrived: it waits invisible for a moment before it rises, and a click then could land as it moves
    await f.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
  }

  test('Drop goal: a goal opens the result card with a place where the team plays', async ({ page }) => {
    const f = await openGame(page, 'Wales');                 // Wales play in Sydney only
    await score(page, f);
    const g = inGame(page);
    await expect(g.locator('#dg-result')).toBeVisible();
    await expect(g.locator('.dg-r-kicker')).toHaveText(/The ball landed in/);
    const id = await f.evaluate(() => window.__dg2.place());
    expect(await f.evaluate((i) => window.DG2Places.find((p) => p.id === i).host_city, id)).toBe('sydney');
    await expect(g.locator('#dg-r-fits')).toContainText('England v Wales');
    await expect(g.locator('#dg-r-travel')).toContainText('(estimate)');
    await expect(g.locator('#dg-r-name')).toBeFocused();
  });

  test('Drop goal: Save writes Version 2\'s own saved state, and pressing again removes it', async ({ page }) => {
    const f = await openGame(page, 'Wales');
    await score(page, f);
    const save = inGame(page).locator('#dg-r-save');
    await save.click();
    await expect(save).toHaveAttribute('aria-pressed', 'true');
    await expect(inGame(page).locator('#dg-say')).toHaveText(/saved to your plan/);
    const st = await page.evaluate(() => JSON.parse(Storage.prototype.getItem.call(localStorage, 'v2:tp-pick-v1') || 'null'));
    expect(st.added).toHaveLength(1);
    expect(st.added[0]).toMatchObject({ kind: 'kick', unplaced: true, day: '' });
    // Options A to C's saved state is untouched
    expect(await page.evaluate(() => Object.keys(localStorage))).not.toContain('tp-pick-v1');
    await save.click();
    await expect(save).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => JSON.parse(Storage.prototype.getItem.call(localStorage, 'v2:tp-pick-v1')).added)).toHaveLength(0);
  });

  test('Drop goal: Kick again goes back to the pitch, and Escape does the same', async ({ page }) => {
    const f = await openGame(page, 'Wales');
    await score(page, f);
    await inGame(page).locator('#dg-r-again').click();
    await f.waitForFunction(() => window.__dg2.phase() === 'hold', null, { timeout: 4000 });
    await expect(inGame(page).locator('#dg-result')).toBeHidden();
    await score(page, f);
    await page.keyboard.press('Escape');
    await expect(inGame(page).locator('#dg-result')).toBeHidden();
  });

  test('Drop goal: See the places opens without playing, the person\'s places first, then all', async ({ page }) => {
    await openGame(page, 'Japan');                         // Japan play in Newcastle only
    const g = inGame(page);
    await g.locator('#dg-see').click();
    await expect(g.locator('#dg-places')).toBeVisible();
    await expect(g.locator('#dg-pl-mine')).toContainText('Newcastle');
    await expect(g.locator('#dg-pl-body .dg-pl-row')).toHaveCount(5);
    await g.locator('#dg-pl-all').click();
    await expect(g.locator('#dg-pl-body .dg-pl-row')).toHaveCount(10);
    await page.keyboard.press('Escape');
    await expect(g.locator('#dg-places')).toBeHidden();
    await expect(g.locator('#dg-see')).toBeFocused();
  });

  test('Drop goal: no place repeats until every place in the set has been shown', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const f = await openGame(page, 'Japan');
    const seen = [];
    for (let i = 0; i < 5; i++) {
      await score(page, f);
      seen.push(await f.evaluate(() => window.__dg2.place()));
      await inGame(page).locator('#dg-r-again').click();
      await f.waitForFunction(() => window.__dg2.phase() === 'hold', null, { timeout: 4000 });
    }
    expect(new Set(seen).size).toBe(5);
  });

  // Places by where the picked teams play (docs/drop-goal-brief.md, Places): the four cases, ten goals each
  for (const [who, team, cities, fitsLine, listHead] of [
    ['a Newcastle team (Japan)', 'Japan', ['newcastle'], /Japan v Samoa/, /Japan’s matches in Newcastle/],
    ['a Sydney team (Wales)', 'Wales', ['sydney'], /England v Wales/, /Wales’s matches in Sydney/],
    ['a team in both cities (Portugal)', 'Portugal', ['sydney', 'newcastle'], /Portugal/, /Portugal’s matches in Sydney and Newcastle/],
    ['no team', '', ['sydney', 'newcastle'], /A free day around/, /Around Sydney and Newcastle/],
  ]) {
    test(`Drop goal places: ${who}`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const f = await openGame(page, team);
      const got = [];
      for (let i = 0; i < 10; i++) {
        await score(page, f);
        got.push(await f.evaluate(() => {
          const id = window.__dg2.place(), p = window.DG2Places.find((x) => x.id === id);
          return { id, city: p.host_city, fits: document.getElementById('dg-r-fits').textContent };
        }));
        await inGame(page).locator('#dg-r-again').click();
        await f.waitForFunction(() => window.__dg2.phase() === 'hold', null, { timeout: 4000 });
      }
      const inSet = await f.evaluate((c) => window.DG2Places.filter((p) => c.indexOf(p.host_city) > -1).length, cities);
      for (const g of got) { expect(cities).toContain(g.city); expect(g.fits).toMatch(fitsLine); }
      // every place in the set once before any repeat, and never the same place twice in a row
      expect(new Set(got.slice(0, inSet).map((g) => g.id)).size).toBe(Math.min(inSet, got.length));
      for (let i = 1; i < got.length; i++) expect(got[i].id).not.toBe(got[i - 1].id);
      if (cities.length === 2 && team) {
        // the next match's city (Sydney, Mon 4 Oct) comes two for every one at the start of a round
        expect(got.slice(0, 3).map((g) => g.city)).toEqual(['sydney', 'sydney', 'newcastle']);
      }
      await inGame(page).locator('#dg-see').click();
      await expect(inGame(page).locator('#dg-pl-mine')).toHaveText(listHead);
      await expect(inGame(page).locator('#dg-pl-body .dg-pl-row')).toHaveCount(inSet);
      await expect(inGame(page).locator('#dg-pl-all')).toHaveCount(inSet < 10 ? 1 : 0);
    });
  }

  // Accessibility (docs/drop-goal-brief.md): keys, what screen readers hear, the table and Share the table
  test('Drop goal accessibility: keyboard order, the label, and the table read as words', async ({ page }) => {
    const f = await openGame(page, 'Portugal');
    const g = inGame(page);
    await expect(g.locator('#dg')).toHaveAttribute('aria-label', /Space or Enter.*then again to kick it as it bounces/);
    await g.locator('#dg').focus();
    await page.keyboard.press('Tab'); await expect(g.locator('#dg-share')).toBeFocused();
    await page.keyboard.press('Tab'); await expect(g.locator('#dg-see')).toBeFocused();
    const mine = await f.evaluate(() => document.querySelector('#dg-rows .is-mine').textContent);
    expect(mine).toMatch(/Portugal \(your team\),41 points/);
    await kickAt(f, 0.76);
    await expect(g.locator('#dg-say')).toHaveText(/3 points for Portugal, 5th on the table/, { timeout: 4000 });
    await expect(g.locator('#dg-rows .is-mine')).toContainText('44');
  });

  test('Drop goal accessibility: Enter plays too', async ({ page }) => {
    const f = await openGame(page, 'Wales');
    await f.evaluate(() => {
      const k = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
      k(); setTimeout(k, 760);
    });
    await expect(inGame(page).locator('#dg-say')).toHaveText(/Goal/, { timeout: 4000 });
  });

  test('Drop goal: Share the table copies its line, or shows it selected when copying is blocked', async ({ page }) => {
    const f = await openGame(page, 'Wales');
    await f.evaluate(() => { window.__clip = false; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => (window.__clip ? Promise.resolve() : Promise.reject(new Error('blocked'))) } }); });
    await inGame(page).locator('#dg-share').click();
    await expect(inGame(page).locator('#dg-share')).toHaveText('Copy the line below');
    await expect(inGame(page).locator('#dg-share-line')).toHaveText(/Wales 5th of 5 on the Third Half drop goal table/);
    await expect(inGame(page).locator('#dg-say')).toHaveText(/Copying was blocked/);
    await f.evaluate(() => { window.__clip = true; });
    await inGame(page).locator('#dg-share').click();
    await expect(inGame(page).locator('#dg-share')).toHaveText('Line copied');
    await expect(inGame(page).locator('#dg-share-line')).toHaveCount(0);
  });

  // Real clicks at a person's pace: a tap that reacts to the bounce (about 0.2s after the ball lands) scores
  for (const gap of [760, 900, 980]) {
    test(`Drop goal: a real click ${gap}ms after the first, reacting to the bounce, scores`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${V2}?theme=hifi&reset`);
      const f = page.frame({ url: /drop-goal/ }) || (await (await page.waitForSelector('#v2-game')).contentFrame());
      await f.waitForFunction(() => window.__dg2 && window.__dg2.phase() === 'hold');
      const box = await page.locator('#v2-game').boundingBox();
      const x = box.x + box.width / 2, y = box.y + box.height * 0.45;
      await page.mouse.click(x, y);
      await page.waitForTimeout(gap);
      await page.mouse.click(x, y);
      await expect(inGame(page).locator('#dg-say')).toHaveText(/Goal/, { timeout: 4000 });
    });
  }

  // Teaching the two taps (24 Nov, from play-testing on a phone: one tap read as the whole game)
  test('Drop goal: the call to act follows the two taps, and one tap alone says what was missing', async ({ page }) => {
    const f = await openGame(page, 'Wales');
    const g = inGame(page);
    await expect(g.locator('#dg-head')).toHaveText('Tap to drop');
    await expect(g.locator('#dg-hint')).toHaveText('Then tap again as it bounces.');
    // one tap: the ball drops, Tap to kick, then Kick now while a kick would score
    const seen = await f.evaluate(() => new Promise((res) => {
      const out = new Set(), head = document.getElementById('dg-head');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
      const t0 = performance.now();
      (function look() { out.add(head.textContent); if (performance.now() - t0 < 1100) requestAnimationFrame(look); else res([...out]); })();
    }));
    expect(seen).toEqual(expect.arrayContaining(['Tap to kick', 'Kick now']));
    await expect(g.locator('#dg-say')).toHaveText('No kick. Tap once to drop, then again as it bounces.', { timeout: 4000 });
    await expect(g.locator('#dg-head')).toHaveText('Tap to drop');
  });

  // Polish pass (24 Nov): the things a person feels, checked with real presses
  test('Drop goal: a press on the pitch leaves no focus ring, and the keyboard brings it back', async ({ page }) => {
    const f = await openGame(page, 'Wales');
    const ring = () => f.evaluate(() => getComputedStyle(document.getElementById('dg')).boxShadow);
    const box = await page.locator('#v2-game').boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.55);
    expect(await ring()).toBe('none');
    await f.waitForFunction(() => window.__dg2.phase() === 'hold', null, { timeout: 5000 });
    await page.keyboard.press('Space');
    expect(await ring()).not.toBe('none');
  });

  test('Drop goal: Save and Saved are one width, and the first save moves nothing in See the places', async ({ page }) => {
    const f = await openGame(page, 'Wales');
    const g = inGame(page);
    await g.locator('#dg-see').click();
    await expect(g.locator('#dg-pl-count')).toHaveText('Nothing saved yet');
    // the layer has finished sliding up, so what is measured is at rest
    await f.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
    const save = g.locator('.dg-pl-row .dg-save').first(), row = g.locator('.dg-pl-row').first();
    const before = [await save.boundingBox(), await row.boundingBox()];
    await save.click();
    await expect(save).toHaveText('Saved');
    await expect(g.locator('#dg-pl-count')).toHaveText('1 saved to your plan');
    expect([await save.boundingBox(), await row.boundingBox()]).toEqual(before);
  });

  test('Drop goal: while See the places slides away, a press reaches what is under it', async ({ page }) => {
    await openGame(page, 'Wales');
    const g = inGame(page);
    await g.locator('#dg-see').click();
    await expect(g.locator('#dg-places')).toBeVisible();
    await g.locator('#dg-pl-close').click();
    // a person's quick second press, on the button the layer was covering: it opens again, whole
    await g.locator('#dg-see').click({ timeout: 2000 });
    await expect(g.locator('#dg-places')).toBeVisible();
    await expect(g.locator('#dg-places')).toHaveCSS('opacity', '1');
    await expect(g.locator('#dg-pl-title')).toBeFocused();
  });

  test('Drop goal: on a wide screen the result stays hidden until a goal', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/wireframes/v2/drop-goal/index.html?theme=hifi');
    await expect(page.locator('#dg-head')).toHaveText(/tap to drop/i);
    await expect(page.locator('#dg-result')).toBeHidden();
  });
});
