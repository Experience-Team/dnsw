// The archive (public/wireframes/archive/, 26 Nov 2026): frozen copies of each version, each in its own folder
// (archive/<date>/<version>/). Each copy loads nothing from outside its own folder, keeps its saved state under its own
// prefix, and is never edited after it is archived (CLAUDE.md). See archive/index.html.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative, resolve, sep, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect, pick, picked, settle } from './helpers.js';

const WIRE = resolve(dirname(fileURLToPath(import.meta.url)), '../../public/wireframes');
const ARCHIVE = join(WIRE, 'archive');
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
// Every archived copy: a folder two levels down that holds an archive.json
const COPIES = readdirSync(ARCHIVE).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
  .flatMap((d) => readdirSync(join(ARCHIVE, d)).map((v) => join(ARCHIVE, d, v)))
  .filter((dir) => { try { return statSync(join(dir, 'archive.json')).isFile(); } catch { return false; } });
const rel = (dir) => relative(ARCHIVE, dir).split(sep).join('/');
const manifest = (dir) => JSON.parse(readFileSync(join(dir, 'archive.json'), 'utf8'));

// Anything in a text file that could name a file: attribute values, url(), import and quoted strings with a path in them
function references(text) {
  const out = new Set();
  for (const m of text.matchAll(/(?:src|href|data-src|action|poster)\s*=\s*["']([^"']+)["']/gi)) out.add(m[1]);
  for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) out.add(m[1]);
  for (const m of text.matchAll(/(?:import|from)\s*\(?\s*["']([^"']+)["']/g)) out.add(m[1]);
  for (const m of text.matchAll(/["'`(]((?:\.\.?\/|\/)[^"'`()\s<>]*)/g)) out.add(m[1]);
  return [...out].map((r) => r.trim()).filter((r) => r && !/^(#|data:|blob:|mailto:|tel:|javascript:|about:|\$\{|'|\+)/i.test(r));
}

test.describe('Archive', () => {
  test('there is at least one archived copy, and the archive page lists and opens each one', async ({ page }) => {
    expect(COPIES.length).toBeGreaterThan(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/wireframes/archive/index.html');
    for (const dir of COPIES) {
      const link = page.locator(`a.open[href^="${rel(dir)}/"]`);
      await expect(link, `${rel(dir)} is listed`).toHaveCount(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  for (const dir of COPIES) {
    const name = rel(dir);
    test(`${name}: no file references a path outside its folder`, () => {
      const bad = [];
      for (const file of walk(dir).filter((f) => /\.(html?|css|m?js|json|svg)$/i.test(f))) {
        const here = relative(dir, dirname(file)).split(sep).join('/');
        for (const r of references(readFileSync(file, 'utf8'))) {
          if (/^[a-z][a-z0-9+.-]*:/i.test(r) && !/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(r)) continue; // another site, not a file of this repo
          if (/^https?:/i.test(r) || r.startsWith('//')) { bad.push(`${relative(dir, file)}: ${r}`); continue; }
          if (r.startsWith('/')) {
            // A path from the site root (a file with an extension, or one of the site's folders), not a regex or a divide
            if (/^\/(?:[\w.%-]+\/)*[\w.%-]+\.(?:html?|css|m?js|json|svg|png|jpe?g|webp|gif|avif|mp3|mp4|webm|woff2?|ttf|ico|txt|md|pdf)$/i.test(r.split(/[?#]/)[0]) || /^\/(wireframes|design-system|assets|src)(\/|$)/.test(r)) bad.push(`${relative(dir, file)}: ${r} (from the site root)`);
            continue;
          }
          // Read against the file's own folder. A script's paths are read against the page that runs it instead: the
          // real loads below catch any of those that leave the copy
          const to = posix.normalize(posix.join(here, r.split(/[?#]/)[0]));
          if (to === '..' || to.startsWith('../')) bad.push(`${relative(dir, file)}: ${r}`);
        }
      }
      expect(bad, 'references outside the archived copy').toEqual([]);
    });

    test(`${name}: every file is as it was archived, and archive.json lists them all`, () => {
      const m = manifest(dir);
      const onDisk = walk(dir).map((f) => relative(dir, f).split(sep).join('/')).filter((f) => f !== 'archive.json').sort();
      expect(onDisk, 'files in the folder that archive.json does not know').toEqual(Object.keys(m.sha256).sort());
      const edited = Object.entries(m.sha256).filter(([f, h]) => createHash('sha256').update(readFileSync(join(dir, f))).digest('hex') !== h).map(([f]) => f);
      expect(edited, 'archived files changed after archiving (archive folders are never edited)').toEqual([]);
      for (const f of m.files) expect(m.sha256[f], `${f} is in files but has no checksum`).toBeTruthy();
    });

    for (const view of ['desktop', 'phone']) {
      test(`${name}: opened in its viewer (${view}), every request stays inside its folder`, async ({ page }) => {
        const m = manifest(dir), root = `/wireframes/archive/${name}/`, outside = [];
        page.on('request', (r) => { const u = new URL(r.url()); if (u.host.startsWith('localhost') && !decodeURIComponent(u.pathname).startsWith(root)) outside.push(u.pathname); });
        page.on('response', (r) => { if (r.status() >= 400) outside.push(`${r.status()} ${r.url()}`); });
        await page.setViewportSize(view === 'phone' ? { width: 390, height: 844 } : { width: 1280, height: 900 });
        await page.goto(root + m.open + (view === 'phone' ? '&phone' : ''));
        const frame = page.frameLocator('iframe.sh-frame');
        await expect(frame.locator('#tp-phone')).toBeVisible();
        await expect(page.locator('.sh-tab')).toHaveCount(1);
        await expect(page.locator('#sh-note')).toContainText('Archived');
        // Scroll the whole page so lazy pictures and modules load
        for (const f of page.frames()) {
          await f.evaluate(async () => {
            const b = document.querySelector('.tp-body'); if (!b) return;
            for (let y = 0; y <= b.scrollHeight; y += 400) { b.scrollTop = y; await new Promise((r) => setTimeout(r, 25)); }
          }).catch(() => {});
        }
        await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {}); // a busy machine may never go quiet; what loaded so far is checked
        expect(outside).toEqual([]);
      });
    }
  }

  test('2026-11-26 Version 1 keeps its saved picks apart from the working Version 1', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // A pick in the working prototype
    await page.goto('/wireframes/prototype-pick-your-team-v1-frame.html?phone&flow=c&theme=hifi');
    await settle(page);
    await pick(page, 'Japan');
    const working = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, Storage.prototype.getItem.call(localStorage, k)])));
    expect(Object.keys(working).length).toBeGreaterThan(0);
    // The archived copy doesn't see it, and its own pick is filed under its prefix only
    await page.goto('/wireframes/archive/2026-11-26/v1/prototype-pick-your-team-v1-frame.html?phone&flow=c&theme=hifi');
    await settle(page);
    expect(await picked(page)).toEqual([]);
    await pick(page, 'Wales');
    const keys = await page.evaluate(() => Object.keys(localStorage)); // the browser's own keys, not what the page sees
    const added = keys.filter((k) => !(k in working));
    expect(added.length).toBeGreaterThan(0);
    expect(added.filter((k) => !k.startsWith('arc-2026-11-26-v1:')), 'keys written outside the prefix').toEqual([]);
    // The working prototype's keys are untouched
    await page.goto('/wireframes/prototype-pick-your-team-v1-frame.html?phone&flow=c&theme=hifi');
    await settle(page);
    const after = await page.evaluate((ks) => Object.fromEntries(ks.map((k) => [k, Storage.prototype.getItem.call(localStorage, k)])), Object.keys(working));
    expect(after).toEqual(working);
    expect((await picked(page)).join(' ')).toMatch(/Japan/);
    expect((await picked(page)).join(' ')).not.toMatch(/Wales/);
  });

  test('2026-11-26 Version 2 keeps its saved state apart, and its Reset clears only its own', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/wireframes/prototype-pick-your-team-v2-frame.html?phone');
    await page.evaluate(() => { localStorage.setItem('tp-pick-v1', JSON.stringify({ picked: ['Japan'] })); sessionStorage.setItem('scratch', 'working'); });
    const rawKeys = () => page.evaluate(() => [Object.keys(localStorage).sort(), Object.keys(sessionStorage).sort()]);
    const [workLocal] = await rawKeys();
    expect(workLocal).toContain('v2:tp-pick-v1');
    await page.goto('/wireframes/archive/2026-11-26/v2/prototype-pick-your-team-v2-frame.html?phone');
    await expect(page.locator('#tp-phone')).toBeVisible();
    // It sees none of the working prototype's keys, and writes through its own prefix and the version's v2:
    expect(await page.evaluate(() => [localStorage.getItem('tp-pick-v1'), sessionStorage.getItem('scratch'), localStorage.length])).toEqual([null, null, expect.any(Number)]);
    await page.evaluate(() => { localStorage.setItem('tp-pick-v1', JSON.stringify({ picked: ['Wales'] })); sessionStorage.setItem('scratch', 'archive'); });
    const [arcLocal, arcSession] = await rawKeys();
    expect(arcLocal).toEqual(expect.arrayContaining(['v2:tp-pick-v1', 'arc-2026-11-26-v2:v2:tp-pick-v1']));
    expect(arcSession).toEqual(expect.arrayContaining(['v2:scratch', 'arc-2026-11-26-v2:v2:scratch']));
    // Every key it can see is its own
    expect(await page.evaluate(() => { const o = []; for (let i = 0; i < localStorage.length; i++) o.push(localStorage.key(i)); return o; })).not.toContain('arc-2026-11-26-v2:v2:tp-pick-v1');
    // ?reset clears the archived copy's state only
    await page.goto('/wireframes/archive/2026-11-26/v2/prototype-pick-your-team-v2-frame.html?phone&reset');
    await expect(page.locator('#tp-phone')).toBeVisible();
    const [resetLocal, resetSession] = await rawKeys();
    expect(resetLocal.filter((k) => k.startsWith('arc-2026-11-26-v2:v2:'))).toEqual([]);
    expect(resetSession.filter((k) => k.startsWith('arc-2026-11-26-v2:v2:'))).toEqual([]);
    expect(resetLocal).toContain('v2:tp-pick-v1');
    expect(resetSession).toContain('v2:scratch');
    expect(await page.evaluate(() => localStorage['v2:tp-pick-v1'])).toBe(JSON.stringify({ picked: ['Japan'] })); // read by name: the browser's own key
  });

  test('the viewer\'s left panel has one quiet Archived versions link, under View on your phone, in each version', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    for (const n of [1, 2]) {
      await page.goto(`/wireframes/prototype-pick-your-team.html?version=${n}`);
      const f = page.frameLocator(`#sh-f${n}`);
      const link = f.locator('.pv-side a[href="archive/index.html"]');
      await expect(link).toHaveCount(1);
      await expect(link).toHaveText('Archived versions');
      await expect(link).toHaveAttribute('target', '_top');
      // Below View on your phone, and not in the tabs
      const [copy, a] = await Promise.all([f.locator('#pv-qr-copy').boundingBox(), link.boundingBox()]);
      expect(a.y).toBeGreaterThan(copy.y + copy.height);
      await expect(page.locator('.sh-tabs a[href*="archive"]')).toHaveCount(0);
    }
    // It opens the archive over the whole viewer
    await page.frameLocator('#sh-f2').locator('.pv-side a[href="archive/index.html"]').click();
    await expect(page).toHaveURL(/\/wireframes\/archive\/index\.html$/);
    await expect(page.locator('h1')).toHaveText('Archived prototypes');
  });

  test('the phone Settings menu has no archive link', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const p of ['prototype-pick-your-team-v1-frame.html?phone&flow=c', 'prototype-pick-your-team-v2-frame.html?phone']) {
      await page.goto(`/wireframes/${p}`);
      await page.locator('#tp-dev-set').click();
      await expect(page.locator('#tp-dev-menu a[href*="archive"]')).toHaveCount(0);
    }
  });
});
