// Turns test-results/results.json (Playwright's JSON reporter) into Markdown for the job summary and the PR comment.
//   node tests/regression/summary.mjs <artifact-url> > summary.md
import { readFileSync } from 'node:fs';

const MARK = '<!-- prototype-regression -->';
const artifact = process.argv[2] || '';
let data;
try { data = JSON.parse(readFileSync('test-results/results.json', 'utf8')); } catch {
  console.log(`${MARK}\n### Prototype regression checks\n\nThe suite did not finish, so there are no results. See the run's log.`);
  process.exit(0);
}

const rows = { visual: [], behaviour: [] };
let passed = 0, failed = 0, flaky = 0, skipped = 0;
function walk(suite, path) {
  const here = suite.title && !suite.title.endsWith('.js') ? [...path, suite.title] : path;
  for (const s of suite.suites || []) walk(s, here);
  for (const spec of suite.specs || []) {
    for (const t of spec.tests || []) {
      if (t.status === 'skipped') { skipped++; continue; }
      if (t.status === 'flaky') { flaky++; continue; }
      if (t.status === 'expected') { passed++; continue; }
      failed++;
      const r = (t.results || []).at(-1) || {};
      const msg = (r.error?.message || r.errors?.[0]?.message || '').replace(/\u001b\[[0-9;]*m/g, '');
      const px = msg.match(/(\d+) pixels \(ratio [^)]*\) are different/)?.[1];
      const why = (px && `${px} pixel${px === '1' ? '' : 's'} differ${px === '1' ? 's' : ''}`)
        || (msg.includes("snapshot doesn't exist") ? 'No baseline yet' : '')
        || (msg.match(/Expected an image (\d+)px by (\d+)px, received (\d+)px by (\d+)px/) ? 'Size changed: ' + msg.match(/Expected an image (\d+px by \d+px), received (\d+px by \d+px)/).slice(1).join(' to ') : '')
        || msg.split('\n').find((l) => l.trim())?.trim().slice(0, 160) || 'Failed';
      (rows[t.projectName] || (rows[t.projectName] = [])).push([[...here, spec.title].join(' · '), why]);
    }
  }
}
for (const s of data.suites || []) walk(s, []);

const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const out = [MARK, '### Prototype regression checks', ''];
if (!failed) {
  out.push(`All ${passed} checks pass: every screenshot matches its baseline and every smoke test passes.`);
} else {
  out.push(`**${failed} failed**, ${passed} passed${flaky ? `, ${flaky} flaky` : ''}.`, '');
  if (rows.visual.length) {
    out.push(`#### Screenshots that differ from the baseline (${rows.visual.length})`, '', '| State | What changed |', '|---|---|');
    rows.visual.forEach(([s, w]) => out.push(`| ${esc(s)} | ${esc(w)} |`));
    out.push('');
  }
  if (rows.behaviour.length) {
    out.push(`#### Smoke tests that failed (${rows.behaviour.length})`, '', '| Test | Error |', '|---|---|');
    rows.behaviour.forEach(([s, w]) => out.push(`| ${esc(s)} | ${esc(w)} |`));
    out.push('');
  }
  out.push(
    artifact ? `Expected, actual and diff images for each one are in the [report](${artifact}) (download, unzip, open \`index.html\`).` : 'Expected, actual and diff images are in the run\'s report artifact.',
    '',
    rows.visual.length
      ? 'If every screenshot change is intended, add the **approve-baselines** label to this PR: the baselines are remade in CI and committed here, and the checks run again. Otherwise fix the change and push.'
      : '',
  );
}
console.log(out.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n'));
