// Things built on 26 Nov 2026 that had no test (docs/handover-26-nov.md): Version 2's desktop Home (the 12-column grid,
// the hero picture and its h1, the one-row hand of cards, the map that answers a pick) and Version 1's motion (the
// push between questions, the cards dealing in, Back in the pinned bar).
import { test, expect, open, goPlan, pick, fcStep, settle, phone, SIZES, chooseStay } from './helpers.js';

const V2 = '/wireframes/prototype-pick-your-team-v2-frame.html';
const v2url = (extra = '') => `${V2}?${['phone', 'theme=hifi', extra].filter(Boolean).join('&')}`;
const WIDE = { width: 1440, height: 900 };
const rect = (page, sel) => page.locator(sel).first().evaluate((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; });
const home = (page) => page.locator('.tp-body');
// Brings a Home section's top to the top of the scroller, and waits for the hand to take its places
async function toSection(page, id) {
  await page.evaluate((id) => { const s = document.getElementById(id), b = document.querySelector('.tp-body'); b.scrollTo(0, b.scrollTop + s.getBoundingClientRect().top - b.getBoundingClientRect().top - 60); }, id);
  await page.waitForTimeout(700);
}
// A person taps the visible left strip of a card in the one-row hand (the middle of the card is under the next one)
async function tapStrip(page, name) {
  const c = page.locator(`#tp-home-plan .tp-card2[aria-label="${name}"]`);
  const b = await c.boundingBox();
  await page.mouse.move(b.x + 22, b.y + b.height * 0.45, { steps: 4 });
  await page.waitForTimeout(150);
  await page.mouse.down(); await page.mouse.up();
  await page.waitForTimeout(500);
}

test.describe('26 Nov: Version 2 on a desktop', () => {
  test('Home sits on 12 columns: the hero is edge to edge, the FAQ and the sign-ups share a row, and the rhythm is 48px with 96px after the hero', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(v2url());
    await expect(phone(page)).toBeVisible();
    await page.waitForTimeout(1500);
    const body = await rect(page, '.tp-body');
    const hero = await rect(page, '.tp-home-video');
    expect(hero.x).toBeLessThanOrEqual(1);                                 // edge to edge, the only element that is
    expect(Math.abs(hero.r - (body.x + (await home(page).evaluate((e) => e.clientWidth))))).toBeLessThanOrEqual(1);
    const reads = await rect(page, '#tp-home-reads'), plan = await rect(page, '#tp-home-plan'), glance = await rect(page, '#tp-home-glance');
    expect(reads.x).toBeGreaterThan(40);                                   // everything else is on the column
    expect(Math.abs(plan.x - reads.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(glance.x - reads.x)).toBeLessThanOrEqual(1);
    const faq = await rect(page, '#tp-home-faq'), news = await rect(page, '#tp-home-news'), share = await rect(page, '#tp-home-share');
    expect(faq.r).toBeLessThan(news.x);                                    // the FAQ in columns 1 to 7, the sign-ups beside it
    expect(Math.abs(news.y - faq.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(share.x - news.x)).toBeLessThanOrEqual(1);
    expect(share.y).toBeGreaterThan(news.b);
    // 96px after the hero, 48px between the sections that follow
    const gap = (a, b) => page.evaluate(([a, b]) => document.querySelector(b).getBoundingClientRect().top - document.querySelector(a).getBoundingClientRect().bottom, [a, b]);
    expect(Math.round(await gap('.tp-home-hero', '#tp-home-reads'))).toBe(96);
    expect(Math.round(await gap('#tp-home-reads', '#tp-home-plan'))).toBe(48);
    expect(Math.round(await gap('#tp-home-kick', '#tp-home-glance'))).toBe(48);
    expect(await page.evaluate(() => { const b = document.querySelector('.tp-body'); return b.scrollWidth <= b.clientWidth; })).toBe(true);
  });

  test('The page has one h1, the hero’s, and its sections are h2', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(v2url());
    await expect(phone(page)).toBeVisible();
    const h1 = phone(page).getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Rugby World Cup 2027 in NSW');
    for (const id of ['tp-home-reads-title', 'tp-home-plan-title', 'tp-home-where-title', 'tp-home-kick-title', 'tp-home-glance-title', 'v2-soc-title', 'tp-home-faq-title']) {
      expect(await page.locator('#' + id).evaluate((e) => e.tagName)).toBe('H2');
    }
  });

  test('The hand is one overlapping row of 24 on a desktop and five to a row on a phone', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(v2url());
    await expect(phone(page)).toBeVisible();
    await toSection(page, 'tp-home-plan');
    await page.waitForTimeout(1200);                                       // the cards deal in
    const row = await page.locator('#tp-fan2 .tp-card2').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y }; }));
    expect(row).toHaveLength(24);
    expect(Math.max(...row.map((r) => r.y)) - Math.min(...row.map((r) => r.y))).toBeLessThan(110);   // one row, on a gentle arc
    for (let i = 1; i < row.length; i++) expect(row[i].x).toBeGreaterThan(row[i - 1].x);              // in order, left to right
    await page.setViewportSize({ width: 390, height: SIZES[390] });
    await page.reload();
    await expect(phone(page)).toBeVisible();
    await toSection(page, 'tp-home-plan');
    await page.waitForTimeout(1200);
    const tops = await page.locator('#tp-fan2 .tp-card2').evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().top / 60)))]);
    expect(tops.length).toBeGreaterThanOrEqual(5);                          // rows, as before
  });

  test('Picking a team lights the stadiums where it plays and greys the others; a team with no NSW match leaves the map alone', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(v2url());
    await expect(phone(page)).toBeVisible();
    await toSection(page, 'tp-home-plan');
    await page.waitForTimeout(1200);
    const pins = () => page.locator('#tp-home-map .tp-home-pin').evaluateAll((els) => Object.fromEntries(els.map((e) => [e.dataset.open.slice(5), e.className.replace('tp-home-pin', '').trim().split(/\s+/).filter((c) => /^is-(lit|grey)$/.test(c)).join('')])));
    const cards = () => page.locator('#tp-home-cities > li').evaluateAll((els) => els.map((e) => [e.classList.contains('is-lit'), (e.querySelector('.v2-city-yours') || {}).textContent || '']));
    expect(Object.values(await pins())).toEqual(['', '', '']);
    await tapStrip(page, 'Japan');                                          // Japan v Samoa, Newcastle
    expect(await pins()).toEqual({ 'Sydney Football Stadium': 'is-grey', 'Stadium Australia': 'is-grey', 'Newcastle Stadium': 'is-lit' });
    expect(await cards()).toEqual([[false, ''], [false, ''], [true, 'Japan: 1 match']]);
    await tapStrip(page, 'Italy');                                          // Italy v Romania, Moore Park; Italy v Georgia, Newcastle
    expect((await pins())['Sydney Football Stadium']).toBe('is-lit');
    expect((await cards())[2][1]).toBe('Japan and Italy: 2 matches');
    await tapStrip(page, 'Japan'); await tapStrip(page, 'Italy');           // both off: the map as it was
    expect(Object.values(await pins())).toEqual(['', '', '']);
    await tapStrip(page, 'Argentina');                                      // no NSW match: nothing is greyed
    expect(Object.values(await pins())).toEqual(['', '', '']);
  });

  test('A hovered or focused card shows its name above it without covering the next card, and a picked card rises', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(v2url());
    await expect(phone(page)).toBeVisible();
    await toSection(page, 'tp-home-plan');
    await page.waitForTimeout(1200);
    const c = page.locator('#tp-home-plan .tp-card2[aria-label="Japan"]');
    const b = await c.boundingBox();
    const name = c.locator('.tp-card2-name');
    expect(await name.evaluate((e) => getComputedStyle(e).opacity)).toBe('0');
    await page.mouse.move(b.x + 22, b.y + b.height * 0.45, { steps: 4 });
    await expect.poll(() => name.evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    // the card next to it is still the one under the pointer a little to the right (nothing was raised over it)
    const next = page.locator('#tp-home-plan .tp-card2[aria-label="New Zealand"]');
    const nb = await next.boundingBox();
    await page.mouse.move(nb.x + 22, nb.y + nb.height * 0.45, { steps: 4 });
    await expect.poll(() => next.locator('.tp-card2-name').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    await tapStrip(page, 'Japan');
    const before = b.y;
    await page.mouse.move(700, 800);
    await expect.poll(async () => (await c.boundingBox()).y).toBeLessThan(before - 10);
  });
});

test.describe('26 Nov: Version 1’s motion', () => {
  const ghost = (page) => page.locator('.v1-fc-ghost');
  // Scrubs the push's animations to a moment, to read where the two steps are
  async function atMoment(page, t) {
    return page.evaluate((t) => {
      const as = document.getAnimations().filter((a) => a.effect && a.effect.target && (a.effect.target.closest('.v1-fc-ghost') || a.effect.target.parentElement === document.getElementById('tp-pick')));
      as.forEach((a) => { a.pause(); a.currentTime = t; });
      window.__push = as;
      return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => {
        const g = document.querySelector('.v1-fc-ghost > #tp-fc, .v1-fc-ghost > [class*="tp-fc"]'), n = document.getElementById('tp-fc');
        r({ ghostX: g ? g.getBoundingClientRect().left : null, newX: n.getBoundingClientRect().left, n: as.length });
      })));
    }, t);
  }
  const finish = (page) => page.evaluate(() => (window.__push || []).forEach((a) => a.play()));

  test('Next pushes: the question you leave goes out to the left as the next one comes in from the right, and nothing is left behind', async ({ page }) => {
    await open(page, { option: 'C', extra: 'reset' });
    await goPlan(page);
    await pick(page, 'Japan');
    await page.locator('#tp-phone .tp-fc-next:visible').first().click();
    await expect(ghost(page)).toHaveCount(1);
    const m = await atMoment(page, 240);
    expect(m.n).toBeGreaterThan(2);
    expect(m.ghostX).toBeLessThan(0);          // the cards’ question, on its way out to the left
    expect(m.newX).toBeGreaterThan(100);       // the next one, on its way in from the right
    expect(m.newX - m.ghostX).toBeGreaterThan(300);   // one rail: a phone width apart
    await finish(page);
    await expect(ghost(page)).toHaveCount(0);
    expect(await fcStep(page)).toBe('days');
    expect(await page.evaluate(() => [document.getElementById('tp-pick').style.minHeight, document.getElementById('tp-pick').className, document.querySelectorAll('[id="tp-pick"]').length])).toEqual(['', 'tp-pick', 1]);
    expect(await page.evaluate(() => { const b = document.querySelector('.tp-body'); return b.scrollWidth <= b.clientWidth; })).toBe(true);
  });

  test('Back is the first button in the pinned bar from step 2, beside Skip and Next, and pushes the other way', async ({ page }) => {
    await open(page, { option: 'C', extra: 'reset' });
    await goPlan(page);
    expect(await page.locator('.tp-fc-foot-back').count()).toBe(0);         // step 1 has no Back
    await pick(page, 'Japan');
    await page.locator('#tp-phone .tp-fc-next:visible').first().click();
    await settle(page);
    const bar = page.locator('.tp-fc-foot .tp-fc-nav > *');
    expect(await bar.evaluateAll((els) => els.map((e) => e.dataset.fcGo || (e.dataset.fcSkip !== undefined && 'skip') || '?'))).toEqual(['-1', 'skip', '1']);
    const back = page.locator('.tp-fc-foot-back');
    await expect(back).toHaveAccessibleName('Back to your teams');
    const bb = await back.boundingBox();
    expect([Math.round(bb.width), Math.round(bb.height)]).toEqual([36, 36]);
    expect(await page.locator('.tp-fc-top .tp-fc-backbtn').evaluateAll((els) => els.filter((e) => e.getClientRects().length).length)).toBe(0);   // not at the top as well
    await back.click();
    await expect(ghost(page)).toHaveCount(1);
    const m = await atMoment(page, 240);
    expect(m.ghostX).toBeGreaterThan(100);     // the question you leave goes out to the right
    expect(m.newX).toBeLessThan(0);            // the cards come back in from the left
    await finish(page);
    await expect(ghost(page)).toHaveCount(0);
    expect(await fcStep(page)).toBe('teams');
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.id === 'v1-deal').length)).toBe(0);   // Back does not also deal the cards
    // and on the third step, Back names the step before
    await settle(page);
    await page.locator('#tp-phone .tp-fc-next:visible').first().click(); await settle(page);
    await page.locator('#tp-phone .tp-fc-next:visible').first().click(); await settle(page);
    await expect(page.locator('.tp-fc-foot-back')).toHaveAccessibleName('Back to your days');
  });

  test('Back from the pinned bar works from the keyboard, and finishing the questions does not push', async ({ page }) => {
    await open(page, { option: 'C', extra: 'reset' });
    await goPlan(page);
    await pick(page, 'Japan');
    await page.locator('#tp-phone .tp-fc-next:visible').first().click(); await settle(page);
    await page.locator('.tp-fc-foot-back').focus();
    await page.keyboard.press('Enter');
    await settle(page);
    expect(await fcStep(page)).toBe('teams');
    for (let i = 0; i < 2; i++) { await page.locator('#tp-phone .tp-fc-next:visible').first().click(); await settle(page); }
    await chooseStay(page);   // where you're staying is required (26 Nov 2026)
    await page.locator('#tp-phone .tp-fc-next:visible').first().click();     // See your plan
    expect(await ghost(page).count()).toBe(0);
    await settle(page);
    expect(await fcStep(page)).toBe('');
  });

  test('The cards deal in when the Plan tab opens, and not when it is opened again from the plan', async ({ page }) => {
    await open(page, { option: 'C', extra: 'reset' });
    await page.locator('#tp-phone .tp-cap-i', { hasText: 'Plan your 3rd half' }).first().click();
    await expect.poll(() => page.evaluate(() => document.getAnimations().filter((a) => a.id === 'v1-deal').length)).toBe(24);
    await settle(page);
    // the cards are where they belong afterwards
    const xs = await page.locator('#tp-fan2 .tp-card2').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(-16);   // six to a row: the outer cards of the hand may reach a few pixels past the screen's sides (26 Nov 2026)
    expect(Math.max(...xs)).toBeLessThan(406);
  });

  test('With reduced motion nothing pushes and the cards do not deal', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, { option: 'C', extra: 'reset' });
    await goPlan(page);
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.id === 'v1-deal').length)).toBe(0);
    await pick(page, 'Japan');
    await page.locator('#tp-phone .tp-fc-next:visible').first().click();
    await page.waitForTimeout(80);
    expect(await ghost(page).count()).toBe(0);
    expect(await fcStep(page)).toBe('days');
  });
});
