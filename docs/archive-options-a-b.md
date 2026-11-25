# Options A and B: archived 25 Nov 2026

Option C is now **Version 1**. Options A and B are out of the live prototype but kept whole in git.

## Where they are

- Commit `c7f5ce3` on `main` ("Merge pull request #647"): the last commit with A, B and C working side by side, tests
  included. A tag could not be pushed from the cloud session, so to make it permanent run
  `git tag archive/options-a-b c7f5ce3 && git push origin archive/options-a-b` on a machine that can.
- A and B were never separate files. A was `prototype-pick-your-team.html` with no flag, and B was `?flow=a`.
  Their code is shared with Version 1 (`concepts-*.js`, `shared.css`, the page), so the commit, not a folder, is the archive.

## What changed

- Every address of `prototype-pick-your-team.html`, with no flag or `?flow=a`, opens Version 1. Since the viewer arrived
  (below) that address is the viewer, which drops `?flow=` and keeps `?phone`, `?theme`, `?reset` and any `#hash`. Version 1's
  own page, `prototype-pick-your-team-v1-frame.html`, still rewrites its address to `?flow=c`.
- The viewer's tabs are Version 1 and Version 2 (Flow chart paused). Saved picks were already under `flow-c:`, so they carry over.
- The Flow chart tab and its launcher link are paused (25 Nov). `flow-chart.html` and `flow-chart-planner.html` are kept;
  to bring it back, add `<a class="pv-tab" href="flow-chart.html">Flow chart</a>` after the Version 1 tab and the launcher `<li>` in `index.html`.
- Option B's annotation is gone. Its code is still in the shared scripts and styles (`data-flow="a"`), unreachable.
- The regression suites cover Version 1 only (`C-` screenshot names).

## Getting them back

Do this on a branch, with nothing else in it:

That puts back the pre-archive page at its old address, but the viewer now lives there. Instead restore Option A and B's
page as `prototype-pick-your-team-v1-frame.html` with
`git show c7f5ce3:public/wireframes/prototype-pick-your-team.html > public/wireframes/prototype-pick-your-team-v1-frame.html`,
then re-add the tabs and `?flow=a` handling and the tests from that commit. Then rename Version 1 where the tab and heading
say it, if wanted. To look without changing anything: `git worktree add ../dnsw-ab c7f5ce3`.

## The viewer (25 Nov 2026)

`prototype-pick-your-team.html` is now a viewer with Version 1 and Version 2 as tabs. Each version is still its own page,
shown in a frame: `prototype-pick-your-team-v1-frame.html` and `prototype-pick-your-team-v2-frame.html`. `?version=1`
(default) or `?version=2` picks the tab. The old `prototype-pick-your-team-v2.html` redirects to `?version=2`, keeping its
flags and `#hash`. Version 1 is labelled full functionality and Version 2 reduced functionality. The viewer's tests are
`tests/regression/shell.behaviour.spec.js`.
