#!/usr/bin/env node
// Archives Version 1 as a frozen copy: public/wireframes/archive/<date>/<name>/. The inverse of restore-archive.mjs.
//
//   npm run archive:snapshot -- 2026-11-26/v1-b             take it
//   npm run archive:snapshot -- 2026-11-26/v1-b --dry-run   say what would be copied, change nothing
//
// The snapshot is the committed state of public/wireframes at HEAD (the working files must be clean, so the sourceCommit
// in archive.json is true). It holds every file Version 1's page loads (found by following the page's scripts and styles
// and the files they name), the viewer cut down to Version 1 alone (archive only), and archive.json with a checksum per
// file. The page gets a block in its <head> that files its saved state under its own prefix, so it never reads or
// changes the working prototype's picks. restore-archive.mjs takes that block out again.
// After a snapshot, public/wireframes/archive/index.html gets one more entry (the only archive file that ever changes).
// Hidden test options: --root <dir> reads the wireframes from another folder (for example a git archive of an older
// commit), --out <dir> writes there, --commit <sha> names the source commit, --no-index leaves archive/index.html alone.
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : undefined; };
const dry = flag('--dry-run');
const which = args.find((a, i) => !a.startsWith('--') && !['--root', '--out', '--commit'].includes(args[i - 1]));
const fail = (m) => { console.error(m); process.exit(1); };
if (!which || !/^\d{4}-\d{2}-\d{2}\/[\w-]+$/.test(which)) fail('Say what to call it, for example: npm run archive:snapshot -- 2026-11-26/v1-b');
const [DATE, NAME] = which.split('/');
const WIRE = resolve(opt('--root') || join(REPO, 'public', 'wireframes'));
const OUTWIRE = resolve(opt('--out') || join(REPO, 'public', 'wireframes'));
const SNAP = join(OUTWIRE, 'archive', DATE, NAME);
if (existsSync(SNAP)) fail(`public/wireframes/archive/${which} already exists. A snapshot is never overwritten: pick another name.`);
const git = (c) => execSync(`git ${c}`, { cwd: REPO, encoding: 'utf8' }).trim();
const commit = opt('--commit') || git('rev-parse --short HEAD');
if (!opt('--root') && git("status --porcelain -- public/wireframes ':(exclude)public/wireframes/archive'")) fail('public/wireframes has uncommitted changes. Commit them first, so the snapshot is the commit it says it is from.');

const FRAME = 'prototype-pick-your-team-v1-frame.html', VIEWER = 'prototype-pick-your-team.html';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const [Y, M, D] = DATE.split('-').map(Number), HUMAN = `${D} ${MONTHS[M - 1]} ${Y}`;
const PREFIX = `arc-${DATE}-${NAME}:`;

// 1. Every file the page loads: its scripts and styles, and the files they name (images, fonts, flags, data)
const ASSET = 'js|mjs|css|webp|jpe?g|png|svg|gif|woff2?|mp3|mp4|json|ico|txt';
const QUOTED = new RegExp('["\'`]([^"\'`\\n<>]{1,200}\\.(?:' + ASSET + '))(?:[?#][^"\'`\\n]*)?["\'`]', 'gi');
const CSSURL = /url\(\s*['"]?([^)'"]+?)['"]?\s*\)/gi;
const inside = (p) => { const r = relative(WIRE, p); return r && !r.startsWith('..') && !r.split(sep).includes('archive'); };
const wanted = new Set([FRAME]), queue = [FRAME];
function resolveRef(token, from) {
  if (/^(https?:|data:|\/\/|#)/.test(token)) return null;
  let t; try { t = decodeURIComponent(token); } catch { t = token; }
  for (const base of [dirname(join(WIRE, from)), WIRE]) {
    const p = resolve(base, t.replace(/^\.?\//, ''));
    if (inside(p) && existsSync(p) && statSync(p).isFile() && !/\.(md|html)$/i.test(p)) return relative(WIRE, p).split(sep).join('/');
  }
  return null;
}
while (queue.length) {
  const f = queue.shift();
  if (!/\.(html|css|js|mjs)$/i.test(f)) continue;
  const text = readFileSync(join(WIRE, f), 'utf8');
  const found = [];
  for (const re of [QUOTED, CSSURL]) { re.lastIndex = 0; let m; while ((m = re.exec(text))) found.push(m[1]); }
  for (const tok of found) { const r = resolveRef(tok, f); if (r && !wanted.has(r)) { wanted.add(r); queue.push(r); } }
}
// Pictures and flags are often named without a folder or extension (data-img="Newcastle baths", a flag by its code),
// and the page adds assets/images/ and .webp or .jpg itself: any picture in those folders whose name appears as a quoted
// string in a file the page loads comes too
const loaded = [...wanted].filter((f) => /\.(html|css|js|mjs)$/i.test(f)).map((f) => readFileSync(join(WIRE, f), 'utf8')).join('\n');
function walk(dir) { const out = []; for (const n of readdirSync(join(WIRE, dir))) { const rel = `${dir}/${n}`, st = statSync(join(WIRE, rel)); if (st.isDirectory()) out.push(...walk(rel)); else out.push(rel); } return out; }
for (const dir of ['assets/images', 'flags']) {
  if (!existsSync(join(WIRE, dir))) continue;
  for (const f of walk(dir)) {
    if (wanted.has(f) || !/\.(webp|jpe?g|png|svg|gif)$/i.test(f)) continue;
    const base = f.split('/').pop().replace(/\.[^.]+$/, '');
    if (['"', "'", '`'].some((q) => loaded.includes(q + base + q) || loaded.includes(q + f + q))) wanted.add(f);
  }
}
// The Drop goal game sits in an iframe (drop-goal/index.html): its whole folder comes, without the notes
if (existsSync(join(WIRE, 'drop-goal'))) for (const f of walk('drop-goal')) if (!/\.md$/i.test(f)) wanted.add(f);
const files = [...wanted].sort();

// 2. The page, with its saved state filed under its own prefix
const BLOCK = `<!-- archive:start: added when this copy was archived (${HUMAN}); scripts/restore-archive.mjs takes it out again -->
<script>/* Archived copy of Version 1, ${HUMAN}. Every key this page reads or writes in this browser's storage (local and
   session) is filed under ${PREFIX}, and it sees no other keys, so it never reads or changes the working prototype's saved
   state, nor another archived copy's. Storage events from other pages are passed on only for its own keys. */
(function () {
  var P = '${PREFIX}', S = Storage.prototype, get = S.getItem, set = S.setItem, del = S.removeItem, key = S.key, len = Object.getOwnPropertyDescriptor(S, 'length').get;
  function own(st) { var out = []; for (var i = 0, n = len.call(st); i < n; i++) { var k = key.call(st, i); if (k !== null && k.indexOf(P) === 0) out.push(k); } return out; }
  S.getItem = function (k) { return get.call(this, P + k); };
  S.setItem = function (k, v) { return set.call(this, P + k, v); };
  S.removeItem = function (k) { return del.call(this, P + k); };
  S.key = function (i) { var k = own(this)[i]; return k === undefined ? null : k.slice(P.length); };
  S.clear = function () { var st = this; own(st).forEach(function (k) { del.call(st, k); }); };
  Object.defineProperty(S, 'length', { configurable: true, enumerable: true, get: function () { return own(this).length; } });
  var add = window.addEventListener, rem = window.removeEventListener, wrapped = new WeakMap();
  function wrap(fn) {
    if (!wrapped.has(fn)) wrapped.set(fn, function (e) {
      if (e.key === null || e.key.indexOf(P) !== 0) return;
      var ev = new StorageEvent('storage', { key: e.key.slice(P.length), oldValue: e.oldValue, newValue: e.newValue, url: e.url, storageArea: e.storageArea });
      return typeof fn === 'function' ? fn.call(this, ev) : fn.handleEvent(ev);
    });
    return wrapped.get(fn);
  }
  window.addEventListener = function (t, fn, o) { return add.call(this, t, t === 'storage' && fn ? wrap(fn) : fn, o); };
  window.removeEventListener = function (t, fn, o) { return rem.call(this, t, t === 'storage' && fn ? wrap(fn) : fn, o); };
})();</script>
<!-- archive:end -->
`;
const CHARSET = /<meta charset="[^"]*"\s*\/?>\n/i;
function withBlock(f, src) {
  const m = src.match(CHARSET);
  if (!m || src.split(m[0]).length !== 2) fail(`${f}: expected exactly one <meta charset> line to put the archive block after`);
  return src.replace(m[0], m[0] + BLOCK);
}

// 3. The viewer, cut down to Version 1 alone (archive only: restore-archive.mjs never copies it back)
function viewerPage(src) {
  const once = (a, b, n = 1) => { const c = src.split(a).length - 1; if (c !== n) fail(`${VIEWER}: expected ${n} of ${JSON.stringify(a.slice(0, 70))}, found ${c}. The viewer has changed: update scripts/archive-snapshot.mjs.`); src = src.split(a).join(b); };
  once('<title>Pick your team · RWC prototypes</title>', `<title>Version 1, archived ${HUMAN} · RWC prototypes</title>`);
  once('<!-- The prototype viewer (25 Nov 2026): Version 1 and Version 2 as tabs of one page. Each version is still its own',
    `<!-- ARCHIVED COPY (${DATE}, from commit ${commit}). Never edit this folder; see ../../index.html and CLAUDE.md.\n     This is the prototype viewer cut down to Version 1 alone: the other tab and its frame are taken out, and the\n     line under the tab says it is archived. Archive only: scripts/restore-archive.mjs never copies it back.\n     The prototype viewer (25 Nov 2026): Version 1 and Version 2 as tabs of one page. Each version is still its own`);
  once('    <a class="sh-tab" href="?version=2" data-version="2">Version 2<span class="sh-tag sh-tag--reduced">Reduced functionality</span></a>\n', '');
  once('  <iframe class="sh-frame" id="sh-f2" title="Version 2: Pick your team, reduced functionality" data-src="prototype-pick-your-team-v2-frame.html"></iframe>\n', '');
  once("var NOTE = { 1: 'Planner, tickets, days, map and your plan.', 2: 'Home, Drop goal and a saved list. No planner yet.' };", `var NOTE = { 1: "Archived ${HUMAN}. A frozen copy." };`);
  once("var frames = { 1: document.getElementById('sh-f1'), 2: document.getElementById('sh-f2') };\n  var first = /(^|&)version=2(&|$)/.test(location.search.slice(1)) ? 2 : 1, hash = location.hash;",
    "var frames = { 1: document.getElementById('sh-f1') }, NS = [1];\n  var first = 1, hash = location.hash;");
  once('[1, 2].forEach(', 'NS.forEach(', 3);
  once('frames[1].contentWindow === win ? 1 : frames[2].contentWindow === win ? 2 : 0', 'frames[1].contentWindow === win ? 1 : 0');
  return src;
}

// 4. Write it
const out = new Map();
for (const f of files) out.set(f, /\.html$/i.test(f) ? Buffer.from(withBlock(f, readFileSync(join(WIRE, f), 'utf8'))) : readFileSync(join(WIRE, f)));
out.set(VIEWER, Buffer.from(viewerPage(readFileSync(join(WIRE, VIEWER), 'utf8'))));
const sha256 = {}; for (const [f, b] of [...out].sort(([a], [b]) => (a < b ? -1 : 1))) sha256[f] = createHash('sha256').update(b).digest('hex');
const manifest = {
  date: DATE, version: 'Version 1', folder: which, sourceCommit: commit, storagePrefix: PREFIX, open: `${VIEWER}?version=1`,
  archiveOnly: [VIEWER, 'archive.json'], restoreStrips: 'the <!-- archive:start --> to <!-- archive:end --> block in each .html file',
  files, sha256,
};
const bytes = [...out.values()].reduce((n, b) => n + b.length, 0);
console.log(`Version 1 at ${commit}: ${files.length} files + the viewer, ${(bytes / 1048576).toFixed(1)} MB, prefix ${PREFIX}`);
if (dry) { console.log(files.join('\n')); process.exit(0); }
for (const [f, b] of out) { const dst = join(SNAP, f); mkdirSync(dirname(dst), { recursive: true }); writeFileSync(dst, b); }
writeFileSync(join(SNAP, 'archive.json'), JSON.stringify(manifest, null, 2) + '\n');

// 5. The list on the archive page
if (!flag('--no-index')) {
  const idx = join(OUTWIRE, 'archive', 'index.html'), html = readFileSync(idx, 'utf8');
  const at = html.indexOf('    <li class="snap">');
  if (at < 0) fail('archive/index.html: no <li class="snap"> to put the new entry before');
  const li = `    <li class="snap">
      <div>
        <p class="snap-name">Version 1, ${NAME}<span class="tag tag--full">Full functionality</span></p>
        <p class="snap-meta">The planner as built on ${HUMAN}, with its own scripts. Archived ${HUMAN}, from commit ${commit}.</p>
      </div>
      <a class="open" href="${which}/${VIEWER}?version=1">Open</a>
    </li>
`;
  writeFileSync(idx, html.slice(0, at) + li + html.slice(at));
}
console.log(`Written to public/wireframes/archive/${which}. Next: check it opens (the archive page, desktop and phone), then commit and open a PR.`);
