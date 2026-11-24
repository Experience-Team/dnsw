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
    // Version 1 (Options A to C) only from the panel's Open Version 1, never from the tabs
    const back = page.locator('.pv-side a[href*="prototype-pick-your-team.html"]');
    await expect(back).toHaveCount(1);
    await expect(back).toHaveText('Open Version 1');
    expect(await page.locator('.pv-tabs a[href*="prototype-pick-your-team.html"]').count()).toBe(0);
    await back.click();
    await expect(page).toHaveURL(/prototype-pick-your-team\.html$/);
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

  // Options A to C link to Version 2 once, from the left panel above View on your phone, and not from their tabs
  test('Options A to C link to Version 2 only from the panel, one way', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    for (const q of ['', '?flow=a', '?flow=c']) {
      await page.goto(`${PAGE}${q}`);
      const links = page.locator('a[href*="prototype-pick-your-team-v2"]');
      await expect(links).toHaveCount(1);
      await expect(links.first()).toHaveText('Open Version 2');
      expect(await page.locator('.pv-tabs a[href*="prototype-pick-your-team-v2"]').count()).toBe(0);
    }
    await page.locator('.pv-v2link-go').click();
    await expect(page).toHaveURL(/prototype-pick-your-team-v2\.html$/);
  });

  // Drop goal (v2/drop-goal/), in a frame, opened over the whole screen from Home. The picked teams are Home's picks
  // (the team cards' saved state, filed under v2:); ?view=kick opens the game straight away
  const frameOf = (page) => page.frame({ url: /drop-goal\/index\.html(?!\?demo)/ });
  async function openGame(page, team) {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    await page.evaluate((t) => { if (t) localStorage.setItem('tp-pick-v1', JSON.stringify({ picked: t.split(',') })); else localStorage.removeItem('tp-pick-v1'); }, team || '');
    await page.evaluate(() => localStorage.setItem('v2ob-seen', '1'));   // past the first-time onboarding (tested on its own below)
    await page.goto(v2url('hifi', 'view=kick'));
    await expect(page.locator('#v2-play')).toBeVisible();
    await expect(page.frameLocator('#v2-game').locator('#dg-head')).toHaveText(/(tap|click) to drop/i);
    return frameOf(page);
  }
  // Two key presses, the second at the given time after the first (seconds), timed inside the game
  const kickAt = (frame, sec) => frame.evaluate((ms) => {
    const k = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
    k(); setTimeout(k, ms);
  }, Math.round(sec * 1000));

  test('Drop goal: the kicker wears the picked team, and with no team the game is not loaded', async ({ page }) => {
    // every kicker has a team (January brief): with none, the game waits behind the team screen
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi', 'view=kick'));
    await expect(page.locator('#v2-ob .v2-ob-h')).toHaveText('Who are you kicking for?');
    expect(await page.locator('#v2-game').getAttribute('src')).toBeNull();
    const f = await openGame(page, 'Wales');
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

  test('Drop goal: the kicker is the team picked on Home, kept as Version 2\'s own, and Reset clears it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    await page.locator('.tp-card2[aria-label="Japan"]').click();
    await expect(page.locator('.tp-card2[aria-label="Japan"]')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => Object.keys(localStorage))).toContain('v2:tp-pick-v1');
    expect(await page.evaluate(() => Object.keys(localStorage))).not.toContain('tp-pick-v1');
    await page.locator('#tp-home-kick button.tp-home-cta').click();
    await expect(page.locator('#v2-play')).toBeVisible();
    await expect.poll(() => frameOf(page).evaluate(() => window.__dg2 && window.__dg2.team())).toBe('Japan');
    await page.locator('#v2-play-close').click();
    await page.locator('#tp-dev-set').click();
    await Promise.all([page.waitForEvent('load'), page.locator('#tp-reset').click()]);
    await expect(page.locator('.tp-card2[aria-pressed="true"]')).toHaveCount(0);
    // no team again: Play now asks for one
    await page.locator('#tp-home-kick button.tp-home-cta').click();
    await expect(page.locator('#v2-ob .v2-ob-h')).toHaveText('Who are you kicking for?');
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

  // Places by where the picked teams play (docs/drop-goal-brief.md, Places): the three cases, ten goals each (the fourth,
  // no team, went with the January brief: every kicker has a team)
  for (const [who, team, cities, fitsLine, listHead] of [
    ['a Newcastle team (Japan)', 'Japan', ['newcastle'], /Japan v Samoa/, /Japan’s matches in Newcastle/],
    ['a Sydney team (Wales)', 'Wales', ['sydney'], /England v Wales/, /Wales’s matches in Sydney/],
    ['a team in both cities (Portugal)', 'Portugal', ['sydney', 'newcastle'], /Portugal/, /Portugal’s matches in Sydney and Newcastle/],
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
    await page.keyboard.press('Tab'); await expect(g.locator('#dg-change')).toBeFocused();   // Kicking for Wales · Change comes first
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
      await page.evaluate(() => { localStorage.setItem('v2ob-seen', '1'); localStorage.setItem('tp-pick-v1', JSON.stringify({ picked: ['Wales'] })); });
      await page.goto(`${V2}?theme=hifi&view=kick`);   // the game, opened over the whole screen
      await expect(page.locator('#v2-play')).toBeVisible();
      const f = page.frame({ url: /drop-goal\/index\.html(?!\?demo)/ }) || (await (await page.waitForSelector('#v2-game')).contentFrame());
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
  test('Drop goal: the call to act follows the two presses, and one alone says what was missing (Click with a mouse)', async ({ page }) => {
    const f = await openGame(page, 'Wales');
    const g = inGame(page);
    await expect(g.locator('#dg-head')).toHaveText('Click to drop');
    // at rest, the line above the bar says what a goal lands on
    await expect(g.locator('#dg-hint')).toHaveText('A goal lands on a place near where Wales play.');
    const seen = await f.evaluate(() => new Promise((res) => {
      const out = new Set(), head = document.getElementById('dg-head');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
      const t0 = performance.now();
      (function look() { out.add(head.textContent); if (performance.now() - t0 < 1100) requestAnimationFrame(look); else res([...out]); })();
    }));
    expect(seen).toEqual(expect.arrayContaining(['Click to kick', 'Kick now']));
    await expect(g.locator('#dg-say')).toHaveText('No kick. Click once to drop, then again as it bounces.', { timeout: 4000 });
    await expect(g.locator('#dg-head')).toHaveText('Click to drop');
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
    await expect(g.locator('#dg-pl-plan')).toHaveText('1 saved \u00b7 Your plan');   // in the page the count is the way to Your plan
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
    await expect(page.locator('#dg-head')).toHaveText(/(tap|click) to drop/i);
    await expect(page.locator('#dg-result')).toBeHidden();
  });

  // Home, the menu and the full-screen game (24 Nov)
  test('Home is brought in: its sections show, and the planner\'s parts stay out of reach', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    for (const id of ['tp-home-reads', 'tp-home-plan', 'tp-home-glance', 'tp-home-where', 'tp-home-kick', 'tp-home-faq', 'tp-home-news', 'tp-home-share']) await expect(page.locator('#' + id)).toBeVisible();
    await expect(page.locator('#tp-fan2 .tp-card2')).toHaveCount(24);
    await expect(page.locator('#v2-play')).toBeHidden();
    await page.locator('.tp-card2[aria-label="Wales"]').click();
    await expect(page.locator('#tp-fan-caption')).toContainText(/Wales added/);
    // no planner yet: the plan bar and the button to the planner never show
    await page.waitForTimeout(1500);
    await expect(page.locator('#tp-tl')).toBeHidden();
    await expect(page.locator('#tp-home-go')).toBeHidden();
    // a host city opens its sheet; a match in it offers the teams, not the plan
    await page.locator('#tp-home-cities li').first().locator('a, button').first().click();
    await expect(page.locator('#tp-pm')).toBeVisible();
    await page.locator('#tp-pm button', { hasText: 'Ireland v Portugal' }).first().click();
    await expect(page.locator('#tp-pm button', { hasText: 'Add Ireland to my teams' })).toBeVisible();
    await expect(page.locator('#tp-pm .tp-pm-add[data-pm-match]')).toBeHidden();
    await expect(page.locator('#tp-pm .tp-pm-ticket')).toBeHidden();
  });

  test('Menu: opens from its button, closes on Escape and a press outside, and each item goes where it says', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    const btn = page.locator('#v2-menu-btn'), menu = page.locator('#v2-menu');
    await btn.click();
    await expect(menu.locator('.v2-menu-i:visible')).toHaveText(['Home', 'Plan your 3rd half', 'Play Drop Goal']);   // Your plan joins them once something is saved
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden(); await expect(btn).toBeFocused();
    await btn.click(); await page.mouse.click(60, 600);
    await expect(menu).toBeHidden();
    await btn.click(); await menu.locator('[data-v2-go="plan"]').click();
    await expect(page.locator('#tp-home-plan-title')).toBeInViewport();
    await btn.click(); await menu.locator('[data-v2-go="play"]').click();
    await expect(page.locator('#v2-play')).toBeVisible();
    await page.locator('#v2-play-close').click();
    await expect(page.locator('#v2-play')).toBeHidden(); await expect(btn).toBeFocused();
    await btn.click(); await menu.locator('[data-v2-go="home"]').click();
    await expect.poll(() => page.evaluate(() => document.querySelector('#tp-phone .cn-body').scrollTop)).toBe(0);
  });

  test('Play now opens the game over the whole screen, and the cross, Escape and Back each close it where the person was', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    const play = page.locator('#tp-home-kick button.tp-home-cta'), layer = page.locator('#v2-play'), body = page.locator('#tp-phone .cn-body');
    await play.scrollIntoViewIfNeeded();
    const y = await body.evaluate((e) => e.scrollTop), at = (await play.boundingBox()).y;
    for (const leave of [() => page.locator('#v2-play-close').click(), () => page.keyboard.press('Escape'), () => page.goBack()]) {
      await play.click();
      await expect(layer).toBeVisible();
      // it covers the phone edge to edge, and the page behind steps back
      await page.evaluate(() => Promise.all(document.getElementById('v2-play').getAnimations().map((x) => x.finished.catch(() => {}))));
      expect(await layer.boundingBox()).toEqual(await page.locator('#tp-phone').boundingBox());
      expect(await body.evaluate((e) => e.inert)).toBe(true);
      // no team is picked, so it opens on the team screen, with Home's cards lent to it
      await expect(page.locator('#v2-ob .tp-card2')).toHaveCount(24);
      await leave();
      await expect(layer).toBeHidden();
      await expect(play).toBeFocused();
      expect(await body.evaluate((e) => e.inert)).toBe(false);
      // what the person was looking at has not moved, at once and once Home has settled
      expect(Math.abs((await play.boundingBox()).y - at)).toBeLessThan(1);
      await expect.poll(() => body.evaluate((e) => e.scrollTop)).toBe(y);
      expect(Math.abs((await play.boundingBox()).y - at)).toBeLessThan(1);
      expect(page.url()).toContain('prototype-pick-your-team-v2.html');
    }
  });

  test('In the game, See the places takes the cross\'s corner, and a save survives a pick made afterwards', async ({ page }) => {
    const f = await openGame(page, 'Japan');
    const g = inGame(page);
    await g.locator('#dg-see').click();
    await expect(page.locator('#v2-play-close')).toBeHidden();
    await g.locator('.dg-pl-row .dg-save').first().click();
    await g.locator('#dg-pl-close').click();
    await expect(page.locator('#v2-play-close')).toBeVisible();
    await page.locator('#v2-play-close').click();
    await expect(page.locator('#v2-play')).toBeHidden();
    await page.locator('.tp-card2[aria-label="Wales"]').click();
    await expect.poll(() => page.evaluate(() => { const r = JSON.parse(localStorage.getItem('tp-pick-v1')); return [r.picked.join(), r.added.filter((x) => x.kind === 'kick').length]; })).toEqual(['Japan,Wales', 1]);
    expect(f).toBeTruthy();
  });

  // How to play: the game playing itself in Home's Play section (24 Nov)
  const demoOf = (page) => page.frame({ url: /drop-goal\/index\.html\?demo&/ });   // Home's snippet (?demo&team=), not the onboarding's (?demo=taps)
  test('How to play: the snippet plays once each time it comes into view, and on a mouse moving onto it, and it changes nothing', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    await expect(page.locator('.v2-demo-how')).toHaveText('How to play: click to drop the ball, then click again as it bounces.');   // with a mouse; tap on a touch screen
    const d = demoOf(page);
    await expect(page.locator('#v2-demo-replay')).toHaveCount(0);   // no Replay button: after a game it read as replay the game
    // out of view: nothing has played
    await page.waitForTimeout(1500);
    expect(await d.evaluate(() => [window.__dg2.phase(), window.__dgDemo.playing()])).toEqual(['hold', false]);
    await page.locator('#v2-demo').scrollIntoViewIfNeeded();
    // nothing in it can be pressed or read out: the line under it says it in words
    await expect(page.locator('#v2-demo-frame')).toHaveAttribute('aria-hidden', 'true');
    for (const ph of ['drop', 'goal', 'hold']) await d.waitForFunction((x) => window.__dg2.phase() === x, ph, { timeout: 8000 });
    // once: it rests on Tap to drop and does not start again
    await page.waitForTimeout(3000);
    expect(await d.evaluate(() => [window.__dg2.phase(), document.getElementById('dg-head').textContent])).toEqual(['hold', 'Click to drop']);   // with a mouse
    // scrolling away and back plays it once more
    await page.locator('#tp-home-reads').scrollIntoViewIfNeeded(); await page.locator('#v2-demo').scrollIntoViewIfNeeded();
    for (const ph of ['goal', 'hold']) await d.waitForFunction((x) => window.__dg2.phase() === x, ph, { timeout: 8000 });
    // and so does moving the mouse onto it
    await page.mouse.move(5, 5); await page.locator('#v2-demo').hover();
    await d.waitForFunction(() => window.__dg2.phase() === 'goal', null, { timeout: 8000 });
    // no save, no place used up, nothing said
    expect(await d.evaluate(() => [window.__dg2.goals(), document.getElementById('dg-say').textContent, sessionStorage.getItem('v2:dg-rotation')])).toEqual([0, '', null]);
    // a press on the picture opens the game, and the snippet goes back to rest
    await page.locator('#v2-demo-hit').click();
    await expect(page.locator('#v2-play')).toBeVisible();
    await expect.poll(() => d.evaluate(() => window.__dg2.phase())).toBe('hold');
    await page.locator('#v2-play-close').click();
    await expect(page.locator('#tp-home-kick button.tp-home-cta')).toBeFocused();
  });

  test('How to play: with reduced motion the snippet stays still', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    await page.locator('#v2-demo').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    expect(await demoOf(page).evaluate(() => window.__dg2.phase())).toBe('hold');
  });

  // The team screen and the practice kick (24 Nov, the practice-kick brief). These run with a mouse, so the game says
  // Click; the touch test is below
  const playNow = (page) => page.locator('#tp-home-kick button.tp-home-cta');
  const game = (page) => frameOf(page);
  const state = (f) => f.evaluate(() => ({ phase: window.__dg2.phase(), practice: window.__dg2.practice(), head: document.getElementById('dg-head').textContent,
    hint: document.getElementById('dg-hint').textContent, goals: window.__dg2.goals(), place: window.__dg2.place(), rot: sessionStorage.getItem('v2:dg-rotation') }));
  const pitchClick = async (page) => { const b = await page.locator('#v2-game').boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height * 0.55); };

  test('No team: the team screen is one tap, then the pitch opens with a practice kick that waits and does not count', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    await playNow(page).click();
    const ob = page.locator('#v2-ob');
    await expect(ob.locator('.v2-ob-h')).toHaveText('Who are you kicking for?');
    await expect(ob.locator('.v2-ob-p')).toContainText('No team? Pick the one you’d like to follow.');
    await expect(ob).toHaveClass(/is-pitch/);
    // nothing to press but the cards: no Continue, no Skip
    await expect(ob.locator('.tp-card2')).toHaveCount(24);
    await expect(ob.locator('button:not(.tp-card2):visible')).toHaveCount(0);
    expect(await page.locator('#v2-game').getAttribute('src')).toBeNull();
    await ob.locator('.tp-card2[aria-label="Scotland"]').click();
    await expect(page.locator('#v2-ob-now')).toHaveText('Kicking for Scotland');
    await expect(ob).toBeHidden({ timeout: 3000 });
    // the cards are back on Home, and the pitch says who is kicking
    expect(await page.evaluate(() => [document.getElementById('tp-picker').parentNode.id, window.v2Picker.state.picked.join()])).toEqual(['tp-home-hand', 'Scotland']);
    const g = inGame(page);
    await expect(g.locator('#dg-who')).toContainText('Kicking for Scotland');
    await expect.poll(() => game(page).evaluate(() => window.__dg2 && window.__dg2.practice())).toBe('drop');
    const f = game(page);
    expect(await state(f)).toMatchObject({ head: 'Click to drop', hint: 'Practice kick. Click to drop the ball.' });
    await expect(g.locator('#dg-skip')).toBeVisible();
    await expect(g.locator('#dg-see')).toBeHidden();
    await expect(g.locator('#dg-say')).toContainText('Practice kick.');
    // the ball drops and waits at the bounce, in the KICK zone, for as long as it takes
    await pitchClick(page);
    await f.waitForFunction(() => window.__dg2.phase() === 'wait', null, { timeout: 4000 });
    await expect(g.locator('#dg-head')).toHaveText('Click now to kick');
    await expect(g.locator('#dg-say')).toContainText('Click now to kick.');
    const zone = await f.evaluate(() => { const z = document.getElementById('dg-zone').getBoundingClientRect(), m = document.getElementById('dg-mark').getBoundingClientRect(), c = m.left + m.width / 2; return c > z.left && c < z.right; });
    expect(zone).toBe(true);
    await page.waitForTimeout(2500);
    expect((await state(f)).phase).toBe('wait');
    // the kick is a goal, and it does not count
    await pitchClick(page);
    await f.waitForFunction(() => window.__dg2.phase() === 'goal', null, { timeout: 4000 });
    await expect(g.locator('#dg-hint')).toHaveText('You’ve got it. This time it won’t wait: click as it bounces.');
    await expect(g.locator('#dg-say')).toContainText('You’ve got it.');
    await f.waitForFunction(() => window.__dg2.phase() === 'hold', null, { timeout: 5000 });
    expect(await state(f)).toMatchObject({ practice: null, goals: 0, place: null, rot: null, head: 'Click to drop' });
    await expect(g.locator('#dg-result')).toBeHidden();
    await expect(g.locator('#dg-skip')).toBeHidden();
    await expect(g.locator('#dg-see')).toBeVisible();
    // the game carries on as normal: a real kick that misses gets the game's own line
    await pitchClick(page);
    await expect(g.locator('#dg-say')).toHaveText('No kick. Click once to drop, then again as it bounces.', { timeout: 5000 });
    // first time only
    await page.locator('#v2-play-close').click();
    await playNow(page).click();
    await expect(page.locator('#v2-play')).toBeVisible();
    await expect(ob).toBeHidden();
    await page.waitForTimeout(400);
    expect((await state(game(page))).practice).toBeNull();
  });

  test('A team picked on Home: no team screen, the practice kick can be skipped, and ? replays it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    await page.locator('.tp-card2[aria-label="Japan"]').click();
    await page.locator('.tp-card2[aria-label="Wales"]').click();
    await playNow(page).click();
    await expect(page.locator('#v2-play')).toBeVisible();
    await expect(page.locator('#v2-ob')).toBeHidden();
    const g = inGame(page);
    // the first team picked kicks
    await expect(g.locator('#dg-who')).toContainText('Kicking for Japan');
    await expect.poll(() => game(page).evaluate(() => window.__dg2 && window.__dg2.practice())).toBe('drop');
    await g.locator('#dg-skip').click();
    expect(await state(game(page))).toMatchObject({ practice: null, phase: 'hold', hint: 'A goal lands on a place near where Japan play.' });
    expect(await page.evaluate(() => localStorage.getItem('v2ob-seen'))).toBe('1');
    // ? beside the cross plays it again
    await page.locator('#v2-play-how').click();
    await expect.poll(() => game(page).evaluate(() => window.__dg2.practice())).toBe('drop');
    await g.locator('#dg-skip').click();
    // closing with the cross during the practice kick leaves it for next time
    await page.evaluate(() => localStorage.removeItem('v2ob-seen'));
    await page.locator('#v2-play-close').click();
    await playNow(page).click();
    await expect.poll(() => game(page).evaluate(() => window.__dg2.practice())).toBe('drop');
    await page.locator('#v2-play-close').click();
    await playNow(page).click();
    await expect.poll(() => game(page).evaluate(() => window.__dg2.practice())).toBe('drop');
  });

  test('Change on the pitch: a tap makes that team the kicker and keeps the others picked on Home', async ({ page }) => {
    const f0 = await openGame(page, 'Japan,Wales');
    expect(f0).toBeTruthy();
    const g = inGame(page), ob = page.locator('#v2-ob');
    await g.locator('#dg-change').click();
    await expect(ob.locator('.v2-ob-h')).toHaveText('Who are you kicking for?');
    await expect(page.locator('#v2-play-how')).toBeHidden();
    // a card already picked: it is chosen, never unpicked
    await ob.locator('.tp-card2[aria-label="Wales"]').click();
    await expect(page.locator('#v2-ob-now')).toHaveText('Kicking for Wales');
    await expect(ob).toBeHidden({ timeout: 3000 });
    expect(await page.evaluate(() => window.v2Picker.state.picked.join())).toBe('Wales,Japan');
    await expect(g.locator('#dg-who')).toContainText('Kicking for Wales');
    await expect.poll(() => game(page).evaluate(() => window.__dg2 && window.__dg2.team())).toBe('Wales');
    // a new team: it kicks, and the two from Home are kept
    await g.locator('#dg-change').click();
    await ob.locator('.tp-card2[aria-label="Scotland"]').click();
    await expect(ob).toBeHidden({ timeout: 3000 });
    expect(await page.evaluate(() => window.v2Picker.state.picked.join())).toBe('Scotland,Wales,Japan');
    await expect.poll(() => game(page).evaluate(() => window.__dg2 && window.__dg2.team())).toBe('Scotland');
    await expect(g.locator('#dg-hint')).toHaveText('A goal lands on a Scotland watch party in NSW.');
    // Home shows all three picked
    await page.locator('#v2-play-close').click();
    await expect(page.locator('#tp-home .tp-card2[aria-pressed="true"]')).toHaveCount(3);
  });

  test('On a touch phone the game and the practice kick say Tap', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: SIZES[390] }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto(v2url('hifi'));
    await page.evaluate(() => localStorage.setItem('tp-pick-v1', JSON.stringify({ picked: ['Wales'] })));
    await page.reload();
    await playNow(page).tap();
    await expect.poll(() => frameOf(page) && frameOf(page).evaluate(() => window.__dg2 && window.__dg2.practice())).toBe('drop');
    const g = inGame(page);
    await expect(g.locator('#dg-head')).toHaveText('Tap to drop');
    await expect(g.locator('#dg-hint')).toHaveText('Practice kick. Tap to drop the ball.');
    await page.touchscreen.tap(195, 460);
    await frameOf(page).waitForFunction(() => window.__dg2.phase() === 'wait', null, { timeout: 4000 });
    await expect(g.locator('#dg-head')).toHaveText('Tap now to kick');
    await ctx.close();
  });

  // A team is compulsory before playing (January brief, 24 Nov)
  test('A team is compulsory: every way into the game leads to the team screen, even once the practice kick is done', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    await page.evaluate(() => localStorage.setItem('v2ob-seen', '1'));
    const ob = page.locator('#v2-ob');
    const routes = {
      'Play now': () => playNow(page).click(),
      'the menu': async () => { await page.locator('#v2-menu-btn').click(); await page.locator('[data-v2-go="play"]').click(); },
      'the how-to-play picture': () => page.locator('#v2-demo-hit').click(),
      '?view=kick': () => page.goto(v2url('hifi', 'view=kick')),
    };
    for (const [name, go] of Object.entries(routes)) {
      await go();
      await expect(ob.locator('.v2-ob-h'), name).toHaveText('Who are you kicking for?');
      expect(await page.locator('#v2-game').getAttribute('src'), name).toBeNull();
      if (name !== '?view=kick') await page.locator('#v2-play-close').click();
    }
    // one tap, and straight into the game with no practice kick
    await ob.locator('.tp-card2[aria-label="Scotland"]').click();
    await expect(ob).toBeHidden({ timeout: 3000 });
    await expect.poll(() => frameOf(page) && frameOf(page).evaluate(() => window.__dg2 && window.__dg2.team())).toBe('Scotland');
    expect(await frameOf(page).evaluate(() => window.__dg2.practice())).toBeNull();
  });

  test('Every NSW match is not a choice: it is offered nowhere, and saved from before it counts as no team', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    for (const old of ['Every NSW match', 'Here for the rugby', 'All matches']) {
      await page.evaluate((n) => localStorage.setItem('tp-pick-v1', JSON.stringify({ picked: [n] })), old);
      await page.reload();
      expect(await page.evaluate(() => window.v2Picker.state.picked), old).toEqual([]);
    }
    await expect(page.locator('#tp-home [data-rugby]:visible, #tp-home .tp-rugby-line:visible')).toHaveCount(0);
    await expect(page.locator('#tp-fan2 .tp-card2')).toHaveCount(24);
    await playNow(page).click();
    await expect(page.locator('#v2-ob .v2-ob-h')).toHaveText('Who are you kicking for?');
    await expect(page.locator('#v2-ob [data-rugby]:visible')).toHaveCount(0);
  });

  // The result on phones (24 Nov): the card pushes the field up, and the top is Kick again alone
  test('Drop goal result on a phone: the field is pushed up by the card, and only Kick again is left at the top', async ({ page }) => {
    const f = await openGame(page, 'Wales');
    await kickAt(f, 0.76);
    await f.waitForFunction(() => window.__dg2.phase() === 'result', null, { timeout: 5000 });
    // on its way: the field is still there, moving up, as the card comes up from the bottom
    const mid = await f.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r({
      fieldShown: getComputedStyle(document.getElementById('dg-scene')).visibility === 'visible',
      fieldY: document.getElementById('dg').getBoundingClientRect().top, cardY: document.getElementById('dg-result').getBoundingClientRect().top, h: innerHeight })))));
    expect(mid.fieldShown).toBe(true);
    expect(mid.fieldY).toBeLessThan(0);
    expect(mid.cardY).toBeGreaterThan(0);
    expect(Math.abs(mid.cardY - mid.fieldY - mid.h)).toBeLessThan(2);   // one movement: the card sits right under the field
    await f.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
    const g = inGame(page);
    await expect(g.locator('#dg-r-again')).toBeVisible();
    await expect(g.locator('#dg-r-frame')).toBeHidden();
    const top = await g.locator('.dg-r-pitch').boundingBox(), again = await g.locator('#dg-r-again').boundingBox();
    expect(top.height).toBeLessThanOrEqual(72);
    // Kick again holds one line and stops short of How to play and the close cross, top right
    expect(again.x + again.width).toBeLessThan((await page.locator('#v2-play-how').boundingBox()).x - (await page.locator('#v2-game').boundingBox()).x);
    await g.locator('#dg-r-again').click();
    await f.waitForFunction(() => window.__dg2.phase() === 'hold', null, { timeout: 4000 });
    await expect(g.locator('#dg-result')).toBeHidden();
    await expect(g.locator('#dg-scene')).toBeVisible();
  });

  test('Drop goal result on a wide screen keeps the posts and the framed place beside the card', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/wireframes/v2/drop-goal/index.html?theme=hifi&team=Wales');
    await expect(page.locator('#dg-head')).toHaveText(/(tap|click) to drop/i);
    await page.evaluate(() => { const k = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })); k(); setTimeout(k, 760); });
    await page.waitForFunction(() => window.__dg2.phase() === 'result', null, { timeout: 5000 });
    await expect(page.locator('#dg-r-frame')).toBeVisible();
    await expect(page.locator('#dg-r-again')).toBeVisible();
  });

  // January brief, steps 2 to 4: what a goal lands on follows the kicker's team
  test('A team that plays in NSW: a goal lands on a place, with the team\'s next NSW match beside it', async ({ page }) => {
    const f = await openGame(page, 'Wales');
    await score(page, f);
    const g = inGame(page);
    await expect(g.locator('#dg-r-match')).toHaveText('England v Wales · Sat 16 Oct, 7:45pm · Stadium Australia');
    await expect(g.locator('#dg-r-fits')).toContainText('before or after England v Wales');
    await expect(g.locator('#dg-r-travel')).toContainText('(estimate)');
    await expect(g.locator('#dg-r-later')).toBeHidden();
    expect(await f.evaluate(() => !!window.DG2Places.find((p) => p.id === window.__dg2.place()))).toBe(true);
  });

  test('A team with no NSW match: a goal lands on its watch parties, each once before a repeat, on the same card', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const f = await openGame(page, 'Scotland');
    const g = inGame(page), got = [];
    for (let i = 0; i < 4; i++) {
      await score(page, f);
      got.push(await f.evaluate(() => ({ id: window.__dg2.place(), name: document.getElementById('dg-r-name').textContent, fits: document.getElementById('dg-r-fits').textContent,
        travel: document.getElementById('dg-r-travel').textContent, matchRow: !document.getElementById('dg-r-match-row').hidden, later: document.getElementById('dg-r-later').textContent })));
      if (i < 3) { await g.locator('#dg-r-again').click(); await f.waitForFunction(() => window.__dg2.phase() === 'hold', null, { timeout: 4000 }); }
    }
    // both of Scotland's watch parties in each pair of goals, never the same one twice running
    expect(new Set(got.slice(0, 2).map((x) => x.id)).size).toBe(2);
    expect(new Set(got.slice(2).map((x) => x.id)).size).toBe(2);
    for (let i = 1; i < 4; i++) expect(got[i].id).not.toBe(got[i - 1].id);
    for (const x of got) {
      expect(x.id).toMatch(/^wp-scotland-/);
      expect(x.fits).toMatch(/^(Sat 9 Oct: Ireland v Scotland|Sun 17 Oct: Scotland v Portugal)$/);   // the match being screened
      expect(x.travel).toMatch(/, (Sydney|Newcastle)$/);                                           // where it is
      expect(x.matchRow).toBe(false);
      expect(x.later).toBe('If Scotland get through, the later rounds are in NSW.');
    }
    // the same card: photo, The ball landed in, name, Save, tags, description
    await expect(g.locator('.dg-r-kicker')).toHaveText(/The ball landed in/);
    await expect(g.locator('#dg-r-photo [role="img"]')).toBeVisible();
    await expect(g.locator('#dg-r-tags li').first()).toHaveText('Watch party');
    await expect(g.locator('#dg-r-desc')).toContainText('Watch ');
    await g.locator('#dg-r-save').click();
    await expect(g.locator('#dg-r-save')).toHaveText('Saved');
    // See the places lists that team's watch parties, and nothing else
    await g.locator('#dg-r-see').click();
    await expect(g.locator('#dg-pl-mine')).toHaveText('Where to watch Scotland in NSW');
    await expect(g.locator('#dg-pl-body .dg-pl-row')).toHaveCount(2);
    await expect(g.locator('#dg-pl-all')).toHaveCount(0);
    await expect(g.locator('#dg-pl-body .dg-pl-meta').first()).toContainText('Scotland');
    await expect(g.locator('#dg-pl-body .dg-save[aria-pressed="true"]')).toHaveCount(1);
    await expect(g.locator('#dg-pl-plan')).toHaveText('1 saved \u00b7 Your plan');   // in the page the count is the way to Your plan
  });

  test('With several teams picked, the first one decides between places and watch parties', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    let f = await openGame(page, 'Scotland,Wales');
    await score(page, f);
    expect(await f.evaluate(() => window.__dg2.place())).toMatch(/^wp-scotland-/);
    f = await openGame(page, 'Wales,Scotland');
    await score(page, f);
    expect(await f.evaluate(() => !!window.DG2Places.find((p) => p.id === window.__dg2.place()))).toBe(true);
    await expect(inGame(page).locator('#dg-r-match')).toContainText('England v Wales');
  });

  test('Watch party data: every team with no NSW match has one in Sydney and one in Newcastle, tied to a real fixture, all sample', async ({ page }) => {
    await page.goto('/wireframes/v2/drop-goal/index.html?theme=hifi&team=Scotland');
    const got = await page.evaluate(() => {
      const F = window.cnFixtures, P = window.DG2Parties, teams = window.DG2Kit.TEAMS;
      const plays = (t, nsw) => F.some((f) => f.t && f.t.split(' v ').indexOf(t) > -1 && (nsw ? !f.a : true));
      const none = teams.filter((t) => !plays(t, true));
      return {
        none,
        cover: none.map((t) => ['sydney', 'newcastle'].map((c) => P.filter((p) => p.team === t && p.host_city === c).length)),
        forNswTeams: P.filter((p) => none.indexOf(p.team) < 0).length,
        badMatch: P.filter((p) => !F.some((f) => f.d === p.match.d && f.t === p.match.t && f.t.split(' v ').indexOf(p.team) > -1)).map((p) => p.id),
        notSample: P.filter((p) => !p.sample).length,
        ids: new Set(P.map((p) => p.id)).size === P.length,
      };
    });
    expect(got.none).toEqual(['Argentina', 'Canada', 'Chile', 'Hong Kong China', 'Scotland', 'South Africa', 'Tonga', 'USA', 'Zimbabwe']);
    for (const c of got.cover) { expect(c[0]).toBeGreaterThanOrEqual(1); expect(c[1]).toBeGreaterThanOrEqual(1); }
    expect([got.forNswTeams, got.badMatch, got.notSample, got.ids]).toEqual([0, [], 0, true]);
    // with Annotations on, the watch party's own fields show as sample
    await page.evaluate(() => { document.documentElement.classList.add('has-notes'); const k = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })); k(); setTimeout(k, 760); });
    await page.waitForFunction(() => window.__dg2.phase() === 'result', null, { timeout: 5000 });
    expect(await page.evaluate(() => ['dg-r-name', 'dg-r-desc', 'dg-r-fits', 'dg-r-travel'].map((id) => document.getElementById(id).classList.contains('dg-sample')))).toEqual([true, true, true, true]);
  });

  test('Home\'s how-to-play animation wears a team: the picked one, or Australia before anyone has picked', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.goto(v2url('hifi'));
    await expect(page.locator('#v2-demo-frame')).toHaveAttribute('src', /\?demo&team=Australia$/);
    await page.evaluate(() => localStorage.setItem('tp-pick-v1', JSON.stringify({ picked: ['Japan', 'Wales'] })));
    await page.reload();
    await expect(page.locator('#v2-demo-frame')).toHaveAttribute('src', /\?demo&team=Japan$/);
  });
});
