// Sydney on social (25 Nov 2026): the module on both homepages (Version 1's tp-soc, Version 2's v2-soc) and its viewer, over
// the whole phone. Opens each version's own page at 390 wide. Fixtures: public/wireframes/concepts-social.js (gap fields,
// docs/product-data-contract.md section 21).
import { test, expect } from './helpers.js';

const VERSIONS = [
  { name: 'Version 1', page: '/wireframes/prototype-pick-your-team-v1-frame.html', pf: 'tp' },
  { name: 'Version 2', page: '/wireframes/prototype-pick-your-team-v2-frame.html', pf: 'v2' },
];

for (const V of VERSIONS) {
  const sel = (s) => `.${V.pf}-soc-${s}`;
  const sec = '#' + V.pf + '-soc';
  const go = async (page, extra = '') => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${V.page}?phone&theme=hifi${extra}`);
    await expect(page.locator('#tp-phone')).toBeVisible();
  };
  const layer = (page) => page.locator(`#${V.pf}-soc-layer`);
  const bars = (page) => page.locator(`${sel('bars')} li`);

  test.describe(`${V.name}: Sydney on social`, () => {
    test('sits just above the FAQs with a ring and a Visit button for each account, and a row of posts', async ({ page }) => {
      await go(page);
      await expect(page.locator(sec)).toBeVisible();
      expect(await page.locator(sec).evaluate((e) => e.nextElementSibling.id)).toBe('tp-home-faq');
      await expect(page.locator(`${sec} h3`)).toHaveText('Sydney on social');
      await expect(page.locator(`${sec} ${sel('ring')}`)).toHaveCount(2);
      await expect(page.locator(`${sec} ${sel('post')}`)).toHaveCount(6);
      await expect(page.locator(`${sec} ${sel('visit')} a`)).toHaveText([/Visit Instagram/, /Visit TikTok/]);
      await expect(page.locator(`${sec} ${sel('ring')}`).first()).toHaveAttribute('aria-label', /Instagram stories from Sydney, 4 stories, not seen yet/);
    });

    test('a ring plays the stories over the whole phone: Next, Previous, arrow keys, then on to the next account, then it closes', async ({ page }) => {
      await go(page);
      const ring = page.locator(`${sec} ${sel('ring')}`).first();
      await ring.click();
      await expect(layer(page)).toBeVisible();
      await expect(layer(page)).toHaveAttribute('role', 'dialog');
      await expect(bars(page)).toHaveCount(4);
      await expect(page.locator(sel('capt'))).toContainText('Ocean pools');
      // The page behind is inert, and the close cross is top right, 16px from the edge
      expect(await page.evaluate(() => [...document.getElementById('tp-phone').children].filter((e) => !e.id.endsWith('-soc-layer')).every((e) => e.inert || e.hidden || !e.offsetParent))).toBe(true);
      const box = await page.locator(`#${V.pf}-soc-x`).boundingBox(), ph = await page.locator('#tp-phone').boundingBox();
      expect(Math.round(ph.x + ph.width - (box.x + box.width))).toBe(16);
      expect(Math.round(box.y - ph.y)).toBe(16);
      await page.locator(sel('next')).click();
      await expect(page.locator(sel('capt'))).toContainText('ferry');
      await expect(bars(page).first()).toHaveClass(/is-done/);
      await page.locator(sel('prev')).click();
      await expect(page.locator(sel('capt'))).toContainText('Ocean pools');
      await layer(page).focus();
      await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
      await expect(page.locator(sel('capt'))).toContainText('pies');
      // The last Instagram story marks the ring seen; the next press plays TikTok's
      await page.keyboard.press('ArrowRight');
      await expect(page.locator(sel('capt'))).toContainText('Rooftop');
      await expect(page.locator(sel('head') + ' small')).toContainText('TikTok');
      await page.keyboard.press('ArrowRight');
      await expect(page.locator(sel('capt'))).toContainText('cold one');
      await page.keyboard.press('ArrowRight'); // the end: the viewer closes
      await expect(layer(page)).toBeHidden();
      await expect(ring).toHaveClass(/is-seen/);
      await expect(ring).toHaveAttribute('aria-label', /, seen$/);
      await expect(page.locator(`${sec} ${sel('ring')}`).nth(1)).toHaveClass(/is-seen/);
    });

    test('Escape closes the viewer and focus goes back to the ring; the cross does too', async ({ page }) => {
      await go(page);
      const ring = page.locator(`${sec} ${sel('ring')}`).first();
      const inertNow = () => page.evaluate(() => [...document.getElementById('tp-phone').children].filter((e) => !e.id.endsWith('-soc-layer')).map((e) => e.inert));
      const before = await inertNow();
      await ring.click();
      expect((await inertNow()).every(Boolean)).toBe(true);
      await page.keyboard.press('Escape');
      await expect(layer(page)).toBeHidden();
      await expect(ring).toBeFocused();
      await ring.click();
      await page.locator(`#${V.pf}-soc-x`).click();
      await expect(layer(page)).toBeHidden();
      await expect(ring).toBeFocused();
      // Everything behind is as it was before the viewer opened
      expect(await inertNow()).toEqual(before);
    });

    test('a story moves on by itself after five seconds, and Pause holds it', async ({ page }) => {
      await go(page);
      await page.locator(`${sec} ${sel('ring')}`).first().click();
      await expect(page.locator(sel('capt'))).toContainText('Ocean pools');
      await page.locator(`#${V.pf}-soc-pause`).click();
      await expect(page.locator(`#${V.pf}-soc-pause`)).toHaveAttribute('aria-label', 'Play');
      await page.waitForTimeout(5800);
      await expect(page.locator(sel('capt'))).toContainText('Ocean pools');
      await page.locator(`#${V.pf}-soc-pause`).click();
      await expect(page.locator(sel('capt'))).toContainText('ferry', { timeout: 7000 });
    });

    test('with reduced motion a story never moves on by itself and there is no Pause', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await go(page);
      await page.locator(`${sec} ${sel('ring')}`).first().click();
      await expect(page.locator(`#${V.pf}-soc-pause`)).toBeHidden();
      await page.waitForTimeout(5800);
      await expect(page.locator(sel('capt'))).toContainText('Ocean pools');
      await page.keyboard.press('ArrowRight');
      await expect(page.locator(sel('capt'))).toContainText('ferry');
    });

    test('a post opens with its caption and date, its links are placeholders that go nowhere, and Escape goes back', async ({ page }) => {
      await go(page);
      const post = page.locator(`${sec} ${sel('post')}`).first();
      await post.click();
      await expect(layer(page)).toBeVisible();
      await expect(page.locator(sel('capt'))).toContainText('Newcastle');
      await expect(page.locator(sel('when'))).toHaveText('21 Nov · 1 of 6');
      const url = page.url();
      await page.getByRole('link', { name: /View on Instagram/ }).click();
      await expect(page.locator('#' + V.pf + '-soc-lsay')).toContainText('Placeholder link');
      expect(page.url()).toBe(url);
      await page.keyboard.press('Escape');
      await expect(layer(page)).toBeHidden();
      await expect(post).toBeFocused();
    });

    test('the Visit buttons on the page say they are placeholders and go nowhere', async ({ page }) => {
      await go(page);
      const url = page.url();
      await page.locator(`${sec} ${sel('visit')} a`).first().click();
      await expect(page.locator(`#${V.pf}-soc-say`)).toContainText('Placeholder link');
      expect(page.url()).toBe(url);
    });

    test('no accounts hides the section; accounts with no stories or posts are plain buttons with no row', async ({ page }) => {
      await page.route('**/concepts-social.js', (r) => r.fulfill({ contentType: 'application/javascript', body: 'window.cnSocial={accounts:[],stories:[],posts:[]};' }));
      await go(page);
      await expect(page.locator(sec)).toBeHidden();
      await page.unroute('**/concepts-social.js');
      await page.route('**/concepts-social.js', (r) => r.fulfill({ contentType: 'application/javascript', body: "window.cnSocial={accounts:[{id:'ig',platform:'instagram',name:'Sydney',handle:'@sydney',url:null}],stories:[],posts:[]};" }));
      await go(page);
      await expect(page.locator(sec)).toBeVisible();
      await expect(page.locator(`${sec} ${sel('ring')}`)).toHaveClass(/is-plain/);
      await expect(page.locator(`${sec} ${sel('ring')}`)).not.toHaveAttribute('data-soc-story', /.*/);
      await expect(page.locator(`${sec} ${sel('posts')}`)).toBeHidden();
    });

    test('the rows that scroll sideways run to the screen edges on a phone, with the first item lined up with the margin', async ({ page }) => {
      await go(page);
      await page.locator(sec).scrollIntoViewIfNeeded();
      const m = await page.evaluate(({ sec, pf }) => {
        const body = document.querySelector('.tp-body').getBoundingClientRect(), s = document.querySelector(sec).getBoundingClientRect();
        const row = document.getElementById(pf + '-soc-posts'), r = row.getBoundingClientRect(), c = row.querySelector('li').getBoundingClientRect();
        return { left: Math.round(r.left - body.left), right: Math.round(body.right - r.right), firstItem: Math.round(c.left - s.left), canScroll: row.scrollWidth > row.clientWidth };
      }, { sec, pf: V.pf });
      expect(m.canScroll).toBe(true);
      expect(m.left).toBe(0);      // not stopped by the margin
      expect(m.right).toBe(0);
      expect(m.firstItem).toBe(0); // the first card starts at the page's margin
    });

    test('swiping goes to the next and previous post, and Previous and Next do too, with the position and the ends respected', async ({ page }) => {
      await go(page);
      await page.locator(`${sec} ${sel('post')}`).first().click();
      await expect(page.locator(sel('when'))).toHaveText('21 Nov · 1 of 6');
      await expect(page.locator(`#${V.pf}-soc-pprev`)).toBeHidden(); // the first: nothing before it
      await expect(page.locator(`#${V.pf}-soc-pnext`)).toBeVisible();
      const swipe = async (dx, steps = 8) => {
        const b = await layer(page).boundingBox(), y = b.y + b.height * 0.4, x0 = b.x + b.width / 2 + (dx < 0 ? 100 : -100);
        await page.mouse.move(x0, y); await page.mouse.down();
        for (let i = 1; i <= steps; i++) { await page.mouse.move(x0 + (dx * i) / steps, y); await page.waitForTimeout(16); }
        await page.mouse.up(); await page.waitForTimeout(500);
      };
      await swipe(-220); // a swipe left: the next post
      await expect(page.locator(sel('when'))).toHaveText('19 Nov · 2 of 6');
      await expect(page.locator(sel('capt'))).toContainText('Where Sydney eats');
      await swipe(220); // right: back
      await expect(page.locator(sel('when'))).toHaveText('21 Nov · 1 of 6');
      await swipe(220); // right at the first: it springs back and stays
      await expect(page.locator(sel('when'))).toHaveText('21 Nov · 1 of 6');
      await swipe(-30); // a short drag does not count: it springs back
      await expect(page.locator(sel('when'))).toHaveText('21 Nov · 1 of 6');
      await page.locator(`#${V.pf}-soc-pnext`).click();
      await expect(page.locator(sel('when'))).toHaveText('19 Nov · 2 of 6', { timeout: 3000 });
      await page.waitForTimeout(500); // the slide in finishes
      await layer(page).focus();
      await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450);
      await expect(page.locator(sel('when'))).toHaveText('17 Nov · 3 of 6');
      // To the last: Next goes
      for (let i = 0; i < 3; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450); }
      await expect(page.locator(sel('when'))).toHaveText('9 Nov · 6 of 6');
      await expect(page.locator(`#${V.pf}-soc-pnext`)).toBeHidden();
      await expect(page.locator(`#${V.pf}-soc-live`)).toContainText('post 6 of 6');
      // Closing from the sixth puts the row and the focus on the sixth post
      await page.keyboard.press('Escape');
      await expect(layer(page)).toBeHidden();
      await expect(page.locator(`${sec} ${sel('post')}`).nth(5)).toBeFocused();
    });

    test('swiping between stories goes on to the next story and over to the next account', async ({ page }) => {
      await go(page);
      await page.locator(`${sec} ${sel('ring')}`).first().click();
      await expect(page.locator(sel('capt'))).toContainText('Ocean pools');
      const swipe = async (dx) => {
        const b = await layer(page).boundingBox(), y = b.y + b.height * 0.4, x0 = b.x + b.width / 2 + (dx < 0 ? 100 : -100);
        await page.mouse.move(x0, y); await page.mouse.down();
        for (let i = 1; i <= 8; i++) { await page.mouse.move(x0 + (dx * i) / 8, y); await page.waitForTimeout(16); }
        await page.mouse.up(); await page.waitForTimeout(500);
      };
      await swipe(-220);
      await expect(page.locator(sel('capt'))).toContainText('ferry');
      await swipe(-220); await swipe(-220); await swipe(-220); // to the last Instagram story and over to TikTok's
      await expect(page.locator(sel('capt'))).toContainText('Rooftop');
      await swipe(220);                                          // back to Instagram's
      await expect(page.locator(sel('capt'))).toContainText('Ocean pools');
      await swipe(220);                                          // before the first of all: springs back
      await expect(page.locator(sel('capt'))).toContainText('Ocean pools');
      await expect(layer(page)).toBeVisible();
    });

    test('nothing scrolls sideways on a phone, apart from the rows meant to', async ({ page }) => {
      await go(page);
      await page.locator(sec).scrollIntoViewIfNeeded();
      const m = await page.evaluate(() => { const b = document.querySelector('.tp-body'); return b.scrollWidth - b.clientWidth; });
      expect(m).toBeLessThanOrEqual(0);
      await page.locator(`${sec} ${sel('ring')}`).first().click();
      const l = await layer(page).evaluate((e) => e.scrollWidth - e.clientWidth);
      expect(l).toBeLessThanOrEqual(0);
    });
  });

  // In the desktop viewer the version is a phone-sized screen inside a wide window: the viewer must stay inside that
  // phone, with nothing cut off or pushed out (a rule for wide windows once centred a 480px column in a 390px phone)
  test.describe(`${V.name}: in the desktop viewer`, () => {
    for (const [w, h] of [[1518, 832], [1280, 800]]) {
      test(`stories and a post stay inside the phone at ${w} wide`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(`/wireframes/prototype-pick-your-team.html?theme=hifi&version=${V.name.slice(-1)}`);
        const fr = page.frameLocator(`#sh-f${V.name.slice(-1)}`);
        await expect(fr.locator('#tp-phone')).toBeVisible();
        const inside = async (what) => {
          const m = await page.frame({ url: new RegExp(`v${V.name.slice(-1)}-frame`) }).evaluate((pf) => {
            const ph = document.getElementById('tp-phone').getBoundingClientRect();
            return ['head', 'cap', 'x'].map((k) => document.querySelector(`.${pf}-soc-${k}, #${pf}-soc-${k}`)).filter(Boolean).map((e) => { const r = e.getBoundingClientRect(); return { l: r.left - ph.left, r: ph.right - r.right, t: r.top - ph.top, b: ph.bottom - r.bottom }; });
          }, V.pf);
          expect(m.length, what).toBeGreaterThan(1);
          for (const r of m) { expect(r.l, what).toBeGreaterThanOrEqual(0); expect(r.r, what).toBeGreaterThanOrEqual(0); expect(r.t, what).toBeGreaterThanOrEqual(0); expect(r.b, what).toBeGreaterThanOrEqual(0); }
        };
        await fr.locator(`#${V.pf}-soc`).scrollIntoViewIfNeeded();
        await fr.locator(sel('ring')).first().click();
        await expect(fr.locator(`#${V.pf}-soc-layer`)).toBeVisible();
        await inside('story');
        await page.keyboard.press('Escape');
        await fr.locator(sel('post')).first().click();
        await expect(fr.locator(`#${V.pf}-soc-layer`)).toBeVisible();
        await inside('post');
      });
    }
  });
}
