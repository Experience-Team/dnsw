# Sandbox

A private copy of Version 1 (26 Nov 2026) to experiment in. Open `index.html` (on Vercel: `/wireframes/sandbox/`).
Change anything in this folder; nothing here reaches the real prototypes, and nothing in them links here.

## How it stays apart

| Rule | How |
| --- | --- |
| Loads only its own files. | A full copy: `index.html` (Version 1's frame page), `shared.css`, `themes/`, `pv-device.js`, `no-focus-ring.css`, `concepts-*.js` and `third-half-list.js`, `v1/`, `drop-goal/`, `vendor/`, `flags/`, `data/`, and the images and fonts in `assets/`. Edit these copies, never the ones in `public/wireframes/`. |
| Its own storage. | The first script in `index.html`'s head files every key under `sb:` (the theme and annotations switches included, so they don't follow the real prototypes). Drop goal's frame files its two keys under `sb:` too (`drop-goal/js/teams.js`, `visit.js`). Reset prototype and `?reset` clear only `sb:` keys. |
| Its own flow value. | `data-flow="sb"` on `<html>`. The copies of `shared.css`, `concepts-flow-c.js`, `concepts-teams.js` and `v1/*.js` test for `sb`, not `c`. |
| No links in or out. | The viewer tabs, Open Version 2 and Archived versions are removed from the copy; the phone Settings menu holds only Reset prototype. |

## Starting over

Replace this folder with a fresh copy of Version 1 (`prototype-pick-your-team-v1-frame.html` and what it loads), then
repeat the edits in the table. The prototype's saved state is in the browser, so Reset prototype also starts that over.

## Regression tests

None cover the sandbox, on purpose: it is a place to break things. The existing specs do not open it.

## Differences from Version 1 (26 Nov 2026)

Made in this copy only; Version 1 and Version 2 are unchanged.

- The Plan tab's copy is distilled (repeated counts and restated headings cut).
- **Find the fan zones** (a map pin) replaces Watch in NSW and its TV icon on interstate match rows.
- The **Not going to the match?** group is gone, from Around your matches and the plan's day cards.
- No Save bar on a place, product or idea page: its button already reads Added to your plan.
- Add and Added look and read the same everywhere: outlined to add, filled with a tick once added; "Add" and "Added" in rows, "Add to your plan" and "Added to your plan" in sheets and on the Drop goal card.
- Every sheet has a close cross at the top right. It replaces a text Close on the map popups, the days list and the overview popup, and it is new on the plan sheet.
- Once the tickets step has been answered or skipped (`tix` in `tp-fc-v1`), nothing asks for tickets again: no "Going? Mark your ticket" line. The ticket controls on match rows and in the match sheet stay.
