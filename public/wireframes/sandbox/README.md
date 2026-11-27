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
`docs/report-27-nov-session-updates.md`. Version 1's files were copied into `v1/` and the `sb` edits above re-applied. The Where are you staying rework of 27 Nov (a place always required, a second place with Remove, the same place names on buttons and in the plan, no Still deciding) is in too. `concepts-fixtures.js` here is checked against the official 52-match schedule (27 Nov): every date, venue and Sydney-time kick-off, with the interstate later-round matches added. The sandbox keeps its own copy; the shared fixtures are untouched.

## Walkthrough fixes (27 Nov 2026, sandbox only)

- The Your plan bar does not open the plan until all three questions are answered (`tlSetOpen` in `v1/v1-teams.js` checks `tpFlowC.step()`).
- Your days is required: no Skip, the pre-filled range (a day before the first NSW match to a day after the last) is the starting answer, and without one Next waits for a first and a last day. A saved answer with no days goes back to step 2. Remove my days and Reset are gone outside the step.
- Screenings (fan zones, pubs, clubs) only for a team's interstate matches inside the days and for removed matches (`watchMatches` in `v1/v1-third-half.js`); Where to watch hides when empty. A match the person is at shows the nearest fan zone (sample address, `v1-fanspots.js`) in Around your matches and the plan card.
- Later-round NSW days read "[stage] is on, teams to be decided" with Add (plan, Around your matches, Also on in NSW) and add their precinct to the stay answers.
- A team with no NSW match inside the days: an interstate watch block (fan zone, sample address, approximate route, Add) or one line pointing to Also on in NSW.
- One close cross on the plan sheet (the dead second one is gone).

## The narrative plan page (27 Nov 2026, sandbox only)

Once the three questions are answered, the Plan tab opens on two opening sentences (the dates and matches, then where they stay, each bracketed part a control), one fixed-height trip map under them, and the days in date order. New files: `v1/v1-narrative.js` (sentences, map, match-day block) and `v1/v1-narrative.css`; `v1/v1-third-half.js` renders every day open when the flow is done (`renderThird`), exports `tp.narKit` and `tp.render`; `v1/v1-flow-c.js` lands See your plan on `#v1-nar`. The Your matches card, Where to watch, Your plan so far and the Around the matches in NSW map are hidden, not deleted; Also on in NSW, the fan zones list, the pubs map and All matches stay below. Transport, route, address and place-to-stay details are sample data, marked Sample. Stage 2 (getting there and around, spare time, another match, Also on in NSW folded in) is not built.

## Watch zones among a day's ideas (27 Nov 2026, sandbox only)

Wherever a day offers ideas to add (free days, the arrival and last day, on the page, in the plan's Suggest ideas and on the full-screen map), up to two fan zones, pubs or clubs within 15 km of where they stay that show a match played that day between teams they are not following appear among the ideas, marked Sample. The fan village is left out. `watchIdeas`, `withWatch` and `watchCard` in `v1/v1-third-half.js`; they use the page's example venues (`cnWatchVenues`).

## Differences from Version 1 (27 Nov 2026)

Made in this copy only; Version 1 and Version 2 are unchanged.

- The Plan tab's copy is distilled (repeated counts and restated headings cut).
- Every sheet has a close cross at the top right. It replaces a text Close on the map popups (a stop's card and a cluster's list) as well.
- No Save bar on a place, product or idea page: its button already reads Added.
- Version 1 now does these itself, so they are no longer differences: Find the fan zones (pin), no Not going group, Add and Added
  reading the same, the close cross on the plan sheet, and no ticket prompts (tickets are gone).

Not carried over: the sandbox's earlier "Add to your plan" / "Added to your plan" wording in sheets. Version 1 uses Add and Added everywhere.

Design rationale (27 Nov 2026): the annotations carry six "Why:" entries (36 lines) beside the handover notes: Your team, Your dates, Where you're staying, Matches and what's on, Fan zones and where to watch, Your plan.

The open plan sheet (27 Nov 2026) shows one zoomable timeline instead of repeating every day (`v1/v1-plan.js`, `v1/v1-zoom.css`): the bar's strip grown across all 44 days, a wedge zoom slider with three levels, and the tapped day's summary underneath. Your days are a tinted band and the rest dimmed; List/Map and the sheet's day cards are gone, and Move and Remove are in an item's own sheet. The full-screen day-by-day map opens from the page's trip map.

Tidy (27 Nov 2026): the plan page keeps one rhythm (days 24px apart, families 48px apart, the empty picker shell takes no room, every day heading one size) in `v1/v1-narrative.css`; the open plan sheet keeps its parts 24px apart and shows a day as a heading and rows, not a card holding cards, in `v1/v1-zoom.css`.

Stage 2 of the narrative plan page (27 Nov 2026): a How do I get around NSW? FAQ on Home (`concepts-home.js`, six modes, sample tips, links to real public sites), a spare-days sentence above each run of free days that follows the whole stay, and the other NSW matches folded into the days they fall on, with a dashed route and stops on the trip map when the match is in the other city (`v1/v1-third-half.js`: `spareLine`, `alsoRows`, `tp.narRoutes`). Also on in NSW still shows on the dates step. Styles are in `v1/v1-narrative.css`.

Home (27 Nov 2026) takes the same treatment as the plan page, in `v1/v1-quiet.css`: sections 48px apart (they were 64), hairline underlines in the FAQs and at a glance, a smaller In NSW marker, soft tints for the follow buttons, the filters and the Your plan pill.

Desktop review (27 Nov 2026): a watch day lists its matches as one container and a quiet Interstate marker; teams with no NSW match share one watch block (one fan zone, one list, no repeats); product pictures keep a 4:3 frame (cards sit picture-left on desktop); the fan map keeps its chosen tab readable; the questions use soft tints, and the two calendar months sit side by side on desktop.

The trip map under the opening sentences (27 Nov 2026, `v1/v1-narrative.js`) frames only the person's own places (where they stay, each ground or fan zone they are going to). The other city, its stops and its dotted route show when they stay near it or ask for it with Show route on map, and tapping elsewhere returns the map. Zoom is limited to 0.3 to 0.5 (one image pixel per device pixel at 2x is the sharpest), labels are measured and placed so none overlaps another label or a pin, and everything stays 24px inside the map's edge.

Copy and logic slips on the narrative plan page (28 Nov 2026): a distance and a time read "14 km, about 36 min by train" ("on foot" for a walk); later rounds go in their own clause, not after "to see", until added (and the bar says "No matches added yet"); "Before and after the match" only within a 20 minute walk of the ground (two sample fan zones added, `v1/v1-fanspots.js`); the spare-time sentence names the first card under it.
