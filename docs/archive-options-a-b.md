# Options A and B: archived 25 Nov 2026

Option C is now **Version 1**. Options A and B are out of the live prototype but kept whole in git.

## Where they are

- Git tag `archive/options-a-b`: the last commit with A, B and C working side by side, tests included.
- A and B were never separate files. A was `prototype-pick-your-team.html` with no flag, and B was `?flow=a`.
  Their code is shared with Version 1 (`concepts-*.js`, `shared.css`, the page), so the tag, not a folder, is the archive.

## What changed

- Every address of `prototype-pick-your-team.html`, with no flag or `?flow=a`, now opens Version 1 at `?flow=c`. The
  page rewrites its own address before anything else runs and keeps `?phone`, `?theme`, `?reset` and any `#hash`.
- The viewer's tabs are Version 1 and Flow chart. Saved picks were already under `flow-c:`, so they carry over.
- The Flow chart tab and its launcher link are paused (25 Nov). `flow-chart.html` and `flow-chart-planner.html` are kept;
  to bring it back, add `<a class="pv-tab" href="flow-chart.html">Flow chart</a>` after the Version 1 tab and the launcher `<li>` in `index.html`.
- Option B's annotation is gone. Its code is still in the shared scripts and styles (`data-flow="a"`), unreachable.
- The regression suites cover Version 1 only (`C-` screenshot names).

## Getting them back

Do this on a branch, with nothing else in it:

```bash
git checkout archive/options-a-b -- public/wireframes/prototype-pick-your-team.html public/wireframes/flow-chart.html public/wireframes/index.html tests/regression
```

That puts back the page, tabs, address handling and tests as they were. Then rename Version 1 where the tab and heading
say it, if wanted. To look without changing anything: `git worktree add ../dnsw-ab archive/options-a-b`.
