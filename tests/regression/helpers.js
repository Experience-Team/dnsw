// Shared steps for the regression suite. Everything finds the prototype's controls by their existing ids, classes and
// accessible names; nothing in the prototype exists only for these tests.
import { test as base, expect } from '@playwright/test';

export const PAGE = '/wireframes/prototype-pick-your-team-v1-frame.html'; // Version 1's own page, shown in the viewer (prototype-pick-your-team.html)
// Version 1 (was Option C) is ?flow=c. Options A and B were archived on 25 Nov (commit c7f5ce3, docs/archive-options-a-b.md)
export const OPTIONS = { C: 'flow=c' };
export const THEMES = ['hifi', 'wireframe'];
// Phone widths, each with a real phone's height (iPhone 12 to 15, and a first iPhone SE)
export const SIZES = { 390: 844, 320: 568 };
// The two teams the suite always picks: both play in NSW, in different cities
export const TEAMS = ['Japan', 'Wales'];
// The moment the page thinks it is (Sydney time), so the countdown and the map's daily order never change
export const NOW = '2026-11-23T10:00:00+11:00';

export function url(option, theme, extra = '') {
  const q = ['phone', OPTIONS[option], theme ? `theme=${theme}` : '', extra].filter(Boolean).join('&');
  return `${PAGE}?${q}`;
}

// Runs in the page (and its frames) before any of its scripts: the clock starts at NOW and runs on from there (as
// ?tp-now does), and Math.random is seeded, so every run draws the same numbers.
function initScript(now) {
  const offset = Date.parse(now) - Date.now();
  const Real = Date;
  function Fake(...a) { return a.length ? new Real(...a) : new Real(Real.now() + offset); }
  Fake.prototype = Real.prototype;
  Fake.now = () => Real.now() + offset;
  Fake.parse = Real.parse; Fake.UTC = Real.UTC;
  globalThis.Date = Fake;
  let s = 20271001;
  Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// Every test fails on a console error or an uncaught error in the page or its frames
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`uncaught: ${e.message}`));
    await page.addInitScript(initScript, NOW);
    await use(page);
    if (errors.length) {
      testInfo.annotations.push({ type: 'console errors', description: errors.join('\n') });
      expect(errors, 'The page logged errors').toEqual([]);
    }
  },
});
export { expect };

export const phone = (page) => page.locator('#tp-phone');
export const scroller = (page) => page.locator('#tp-phone .tp-body');
export const card = (page, name) => page.locator('#tp-phone .tp-card2', { hasText: name }).first();

// Waits until fonts have loaded, images in view have decoded and nothing is animating
export async function settle(page) {
  // The pointer stays where the last click landed; move it off the page so nothing shows a hover state
  await page.mouse.move(-10, -10);
  await page.evaluate(async () => {
    await document.fonts.ready;
    const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
    for (let i = 0; i < 120; i++) {
      const busy = document.getAnimations().some((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity);
      const imgs = [...document.images].filter((im) => im.loading !== 'lazy' && !im.complete);
      if (!busy && !imgs.length) break;
      await frame();
    }
    await frame(); await frame();
  });
  // Scripted motion (a card gliding, the map's camera moving its pins) sets inline styles on timers and animation
  // frames, not CSS animations: wait until no inline style or scroll position in the phone has changed for 400ms
  await page.waitForTimeout(300);
  await page.evaluate(async () => {
    const read = () => {
      const ph = document.getElementById('tp-phone'); if (!ph) return '';
      const els = ph.querySelectorAll('[style]');
      let s = '';
      for (const el of els) s += el.getAttribute('style') + '|';
      for (const el of ph.querySelectorAll('*')) if (el.scrollTop || el.scrollLeft) s += el.scrollTop + ',' + el.scrollLeft + '|';
      // Layout still moving (a line growing in, a panel opening) shows as a landmark changing place or size
      for (const el of ph.querySelectorAll('[id], section, h2, h3')) { const r = el.getBoundingClientRect(); s += r.top + ',' + r.height + '|'; }
      return s;
    };
    let last = read(), still = 0;
    for (let i = 0; i < 60 && still < 4; i++) {
      await new Promise((r) => setTimeout(r, 100));
      const now = read();
      still = now === last ? still + 1 : 0;
      last = now;
    }
  });
}

export async function open(page, { option = 'C', theme = 'hifi', width = 390, extra = '' } = {}) {
  await page.setViewportSize({ width, height: SIZES[width] });
  await page.goto(url(option, theme, extra));
  await expect(phone(page)).toBeVisible();
  await settle(page);
}

export async function goTab(page, name) {
  await page.locator('#tp-phone .tp-cap-i', { hasText: name }).first().click();
  await settle(page);
}
export const goPlan = (page) => goTab(page, 'Plan your 3rd half');
export const goHome = (page) => goTab(page, 'Home');

export async function pick(page, name) {
  await card(page, name).click();
  await settle(page);
}

export async function picked(page) {
  // the card's label adds ", plays in NSW" for a team with a match in NSW (always, since 26 Nov 2026): the name is what is asked
  return page.locator('#tp-phone .tp-card2[aria-pressed="true"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label').replace(/, plays in NSW$/, '')));
}

// Option C: the step showing, or '' once the flow is finished
export async function fcStep(page) {
  return page.evaluate(() => (window.tpFlowC ? window.tpFlowC.step() : null));
}
// Where you're staying (step 3, 26 Nov 2026): the quick answers follow the person's matches, so the first one is
// whatever is offered. It is a required answer: See your plan stays unavailable until one is chosen.
export async function chooseStay(page) {
  await page.locator('#tp-ask .tp-quick:first-of-type [data-base]').first().click();
  await settle(page);
}
export async function fcNext(page) {
  await page.locator('#tp-phone .tp-fc-next:visible').first().click();
  await settle(page);
}

// Opens the plan bar into the open plan
export async function openPlan(page) {
  await page.locator('#tp-tl-toggle').click();
  await settle(page);
}

// Opens the first of your matches in its match sheet
export async function openMatch(page) {
  await page.locator('#tp-phone .tc-open:visible').first().click();
  await settle(page);
}

export async function openSettings(page) {
  await page.locator('#tp-dev-set').click();
  await settle(page);
}

// Grows the window to the page's full height, so one screenshot holds the whole page. The phone's page scrolls inside
// .tp-body, so a plain full-page screenshot would show only the first screen. Anything pinned to the bottom of the
// screen (the plan bar) shows at the foot of the image.
export async function expandToContent(page, width) {
  let height = SIZES[width];
  for (let i = 0; i < 5; i++) {
    const h = await scroller(page).evaluate((el) => el.scrollHeight);
    if (h <= height) break;
    height = h;
    await page.setViewportSize({ width, height });
    await settle(page);
  }
}
