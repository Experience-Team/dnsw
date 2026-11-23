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
| Version 2's tabs show only Version 2 and its iterations; Options A to C don't link to it. | The two are reviewed separately. |

The regression suite checks both directions on every PR: `tests/regression/v2.behaviour.spec.js` and
`tests/regression/v2.visual.spec.js` cover Version 2, and the existing specs cover Options A to C. A change meant for
one version that moves the other's screenshots or fails its smoke tests is a regression.

## Iterations

The Iterations tab is a placeholder until the first iteration is saved. To save one:

1. Copy the page to `v2/iteration-<n>.html` and the files it uses from this folder to `v2/iteration-<n>/`, and point the
   copy's links at them (shared files stay shared, with `../` paths).
2. Give the copy its own storage prefix (`v2-i<n>:` in place of `v2:`), and set its `data-flow` to `v2-i<n>`.
3. Replace the Iterations placeholder with a tab per saved iteration, in every Version 2 page's tab row.
4. Add the iteration to `tests/regression/v2.visual.spec.js` and `v2.behaviour.spec.js`, and approve its baselines.

A saved iteration is frozen: later work goes into Version 2, never into a saved iteration.
