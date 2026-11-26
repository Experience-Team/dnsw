#!/usr/bin/env node
// Restores an archived prototype (public/wireframes/archive/<date>/<version>/) over the working files, on a branch.
//
//   npm run archive:restore -- 2026-11-26/v1            copy it back
//   npm run archive:restore -- 2026-11-26/v1 --dry-run  say what would change, change nothing
//
// It copies every file in the snapshot's archive.json "files" list back to public/wireframes/ at the same path, and
// takes out the block each archived page was given (<!-- archive:start --> to <!-- archive:end -->, which files its
// saved state under its own prefix). The archive's own cut-down viewer and archive.json are not copied back.
// Shared files (shared.css, themes/hifi.css, pv-device.js, concepts-*.js, the data and images) come back too, so the
// other version can change as well: check it before opening a PR. Files added since the snapshot are left alone.
// The archive itself is never changed.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WIRE = join(REPO, 'public', 'wireframes');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const which = args.find((a) => !a.startsWith('--'));
const fail = (m) => { console.error(m); process.exit(1); };

if (!which || !/^\d{4}-\d{2}-\d{2}\/[\w-]+$/.test(which)) fail('Say which snapshot, for example: npm run archive:restore -- 2026-11-26/v1');
const SNAP = join(WIRE, 'archive', which);
if (!existsSync(join(SNAP, 'archive.json'))) fail(`No snapshot at public/wireframes/archive/${which}`);
const m = JSON.parse(readFileSync(join(SNAP, 'archive.json'), 'utf8'));
const git = (c) => execSync(`git ${c}`, { cwd: REPO, encoding: 'utf8' }).trim();

// The snapshot must be as it was archived
const changed = Object.entries(m.sha256).filter(([f, h]) => !existsSync(join(SNAP, f)) || createHash('sha256').update(readFileSync(join(SNAP, f))).digest('hex') !== h);
if (changed.length) fail(`The snapshot has been changed since it was archived, so it is not restored:\n  ${changed.map(([f]) => f).join('\n  ')}`);

if (!dry) {
  const branch = git('rev-parse --abbrev-ref HEAD');
  if (['main', 'master', 'HEAD'].includes(branch)) fail(`You are on ${branch}. Start a branch first, for example: git switch -c restore-${which.replace('/', '-')}`);
  if (git("status --porcelain -- public/wireframes ':(exclude)public/wireframes/archive'")) fail('public/wireframes has uncommitted changes. Commit or put them aside first, so the restore is the only change in its commit.');
}

const strip = (s) => s.replace(/<!-- archive:start[\s\S]*?<!-- archive:end -->\n/g, '');
let same = 0, differ = 0, added = 0, asTaken = 0;
for (const f of m.files) {
  let body = readFileSync(join(SNAP, f));
  if (f.endsWith('.html')) body = Buffer.from(strip(body.toString('utf8')));
  const dst = join(WIRE, f);
  const now = existsSync(dst) ? readFileSync(dst) : null;
  if (!now) added++; else if (now.equals(body)) same++; else differ++;
  // Self-check: the restored file is byte for byte the one the snapshot was taken from
  try { if (execSync(`git show ${m.sourceCommit}:"public/wireframes/${f}"`, { cwd: REPO, maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] }).equals(body)) asTaken++; } catch {}
  if (!dry) { mkdirSync(dirname(dst), { recursive: true }); writeFileSync(dst, body); }
}
console.log(`${m.version}, archived ${m.date} (from commit ${m.sourceCommit}): ${m.files.length} files.`);
console.log(`  ${differ} ${dry ? 'would change' : 'changed'}, ${added} ${dry ? 'would be added' : 'added'}, ${same} already the same.`);
console.log(`  ${asTaken} of ${m.files.length} match commit ${m.sourceCommit} exactly${asTaken === m.files.length ? '' : ' (that commit is not in this clone, or a file differs: check the diff)'}.`);
if (!dry) console.log('Next: git diff --stat, check both versions in the viewer (shared files came back too), then commit and open a PR.');
