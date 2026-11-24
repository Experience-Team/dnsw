# Version 2

`../prototype-pick-your-team-v2.html` is a fresh Pick your team prototype, kept separate from Options A, B and C
(`../prototype-pick-your-team.html`). It uses the same styles, components and data, and none of their behaviour.

## Keeping versions from breaking each other

| Rule | Why |
| --- | --- |
| Version 2's own styles and scripts live in this folder (`v2/`), and their classes, ids and globals start `v2-` (`v2` for globals, e.g. `window.v2Notes`). | Nothing here can change Options A to C. |
| Never edit a shared file for Version 2: `shared.css`, `themes/hifi.css`, `pv-device.js`, `concepts-*.js`, `third-half-list.js`. To change a shared component, copy its markup, styles or script into this folder, rename to `v2-`, and change the copy. | A change to a shared file changes every version at once. |
| Shared data files (`concepts-fixtures.js`, `concepts-destinations.js`, `concepts-geo.js`, `concepts-words.js`, `concepts-articles.js`) are read only here. If Version 2 needs a field they don't have, check `docs/product-data-contract.md` first and ask (CLAUDE.md). | Both versions read the same data. |
| A behaviour script from Options A to C (`concepts-teams.js`, `concepts-third-half.js`, `concepts-map.js`, `concepts-plan.js`, `concepts-home.js`, `concepts-flow-c.js`) is never loaded by Version 2. Copy it here as `v2-*.js` if needed. | Those scripts change with Options A to C. |
| Saved state is filed under `v2:` in this browser's storage (the first script in the page's head does it), and Reset clears only `v2:` keys. | Testing one version never changes another's picks. |
| The phone keeps the id `tp-phone`, so components copied across keep their shared styles. Version 2 sets `data-flow="v2"` on `<html>` for anything that must differ. | Copied components look right without restyling. |
| Version 2's tabs show only Version 2 and its iterations. The two versions link to each other once each, from the left panel above View on your phone (Open Version 2 there, Open Version 1 here; 24 Nov, the user's ask), and nowhere else: not in either's tabs or phone Settings menu. | The two are reviewed separately, and Version 2 stays a fresh start. |

The regression suite checks both directions on every PR: `tests/regression/v2.behaviour.spec.js` and
`tests/regression/v2.visual.spec.js` cover Version 2, and the existing specs cover Options A to C. A change meant for
one version that moves the other's screenshots or fails its smoke tests is a regression.

## What's in this folder

| File | What it holds |
| --- | --- |
| `v2.css` | Version 2's own page styles. |
| `v2-view.js` | What shows on the phone (24 Nov 2026): Home is the page, the menu takes the place of the three tabs, and Play now opens Drop goal over the whole screen (cross top right, Escape, the phone's back button; `?view=kick` opens it). It sends Home's picked teams to the game and merges the game's saves back into the page's saved state. |
| `v2-onboard.js` | Drop goal's onboarding (24 Nov 2026), over the game the first time it is opened and from How to play (the ? beside the close cross): a team screen when no team is picked (Home's cards, lent by id, on the pitch), then one rule screen, Two taps to kick, with the game playing itself once (`drop-goal/index.html?demo=taps`) and each press named. Tap on touch screens, Click with a mouse. Seen is kept as `v2:v2ob-seen`. |
| `v2-teams.js`, `v2-third-half.js`, `v2-map.js`, `v2-plan.js`, `v2-home.js` | Version 2's own copies of Options A to C's `concepts-*.js` of the same names, brought in with Home on 24 Nov 2026. Globals are renamed `tp*` to `v2*` (`window.v2Picker`, `v2View`, `v2Plan`, `v2Icons`, `v2Article`); ids and classes keep their `tp-` names so the shared styles apply. The planner they also build is in the page but out of reach (`v2.css` hides the plan bar, Plan around your matches, and Add to my plan and I have a ticket on a match sheet) until Version 2 has one. `concepts-flow-c.js` is not copied. |
| `drop-goal/` | Drop goal's kick screen (24 Nov 2026, `docs/drop-goal-brief.md`, Kick screen), shown in the phone in a frame. `kit.js` and `kicker.js` are copies of Options A to C's `drop-goal/js/teams.js` and `rig.js`, trimmed; `game.js` ports concept lab card 10's two-tap timing unchanged. `places.js` holds the places (§19 destinations, fixtures only) and `watch-parties.js` the watch parties (§20, invented sample data) for teams with no NSW match; `result.js` picks the place, and draws the result card and See the places. Save writes Version 2's own copy of the planner's saved state (`v2:tp-pick-v1`). `?demo` is Home's how-to-play snippet, and `?demo=taps` the onboarding's picture (the whole screen); each press is marked Tap 1, Tap 2, or Click 1, Click 2 with a mouse: the game plays itself once when the page asks (`window.__dgDemo.play`, when the section comes into view), takes no input, and says and saves nothing. `?team=<names>` dresses the kicker; the page sets it from the teams picked on Home (`v2-view.js`). |

## Iterations

The Iterations tab is a placeholder until the first iteration is saved. To save one:

1. Copy the page to `v2/iteration-<n>.html` and the files it uses from this folder to `v2/iteration-<n>/`, and point the
   copy's links at them (shared files stay shared, with `../` paths).
2. Give the copy its own storage prefix (`v2-i<n>:` in place of `v2:`), and set its `data-flow` to `v2-i<n>`.
3. Replace the Iterations placeholder with a tab per saved iteration, in every Version 2 page's tab row.
4. Add the iteration to `tests/regression/v2.visual.spec.js` and `v2.behaviour.spec.js`, and approve its baselines.

A saved iteration is frozen: later work goes into Version 2, never into a saved iteration.
