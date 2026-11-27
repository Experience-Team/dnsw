# Sandbox

A private copy of Version 1 (brought up to date on 27 Nov 2026) to experiment in. Open `index.html` (on Vercel: `/wireframes/sandbox/`).
Change anything in this folder; nothing here reaches the real prototypes, and nothing in them links here.

## How it stays apart

| Rule | How |
| --- | --- |
| Loads only its own files. | A full copy: `index.html` (Version 1's frame page), `shared.css`, `themes/`, `pv-device.js`, `no-focus-ring.css`, `concepts-*.js` and `third-half-list.js`, `v1/` (Version 1's own scripts and styles, including the forks that replace `concepts-teams.js`, `concepts-third-half.js`, `concepts-map.js`, `concepts-plan.js` and `concepts-flow-c.js`, which the page no longer loads), `drop-goal/`, `vendor/`, `flags/`, `data/`, and the images and fonts in `assets/`. Edit these copies, never the ones in `public/wireframes/`. |
| Its own storage. | The first script in `index.html`'s head files every key under `sb:` (the theme and annotations switches included, so they don't follow the real prototypes). Drop goal's frame files its two keys under `sb:` too (`drop-goal/js/teams.js`, `visit.js`). Reset prototype and `?reset` clear only `sb:` keys. |
| Its own flow value. | `data-flow="sb"` on `<html>`. The copies of `shared.css` and `v1/*.js` (`v1-flow-c.js`, `v1-teams.js`, `v1-flow-foot.js`, `v1-flow-motion.js`) and the page's own scripts test for `sb`, not `c`. |
| No links in or out. | The viewer tabs, Open Version 2 and Archived versions are removed from the copy; the phone Settings menu holds only Reset prototype. |

## Starting over

Replace this folder with a fresh copy of Version 1 (`prototype-pick-your-team-v1-frame.html` and what it loads), then
repeat the edits in the table. The prototype's saved state is in the browser, so Reset prototype also starts that over.

## Regression tests

None cover the sandbox, on purpose: it is a place to break things. The existing specs do not open it.

## Brought up to date with Version 1 (27 Nov 2026)

The sandbox now carries everything Version 1 gained on 26 and 27 Nov: the range calendar with its key, two markers and
hover or long-hold detail; matches outside the days hidden; Also on in NSW; fan zones and the fan zone map; the new plan
layout; the team hand; the questions without tickets (team, days, stay) with Remove on inferred matches; Show every NSW
match as no team; the later-round kick-offs in Sydney time; and where you're staying (quick answers that follow the
matches, a quiet Staying outside NSW link, a place always required with an optional second place, Moore Park as a place). See `v1/README.md` and
`docs/report-27-nov-session-updates.md`. Version 1's files were copied into `v1/` and the `sb` edits above re-applied. The Where are you staying rework of 27 Nov (a place always required, a second place with Remove, the same place names on buttons and in the plan, no Still deciding) is in too. The shared fixtures' kick-off fix of 27 Nov was not copied here: the sandbox keeps its own fixtures and `v1/v1-fixtures.js`.

## Differences from Version 1 (27 Nov 2026)

Made in this copy only; Version 1 and Version 2 are unchanged.

- The Plan tab's copy is distilled (repeated counts and restated headings cut).
- Every sheet has a close cross at the top right. It replaces a text Close on the map popups (a stop's card and a cluster's list) as well.
- No Save bar on a place, product or idea page: its button already reads Added.
- Version 1 now does these itself, so they are no longer differences: Find the fan zones (pin), no Not going group, Add and Added
  reading the same, the close cross on the plan sheet, and no ticket prompts (tickets are gone).

Not carried over: the sandbox's earlier "Add to your plan" / "Added to your plan" wording in sheets. Version 1 uses Add and Added everywhere.
