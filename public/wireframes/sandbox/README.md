# Sandbox

A private copy of Version 1 (brought up to date on 27 Nov 2026) to experiment in. Open `index.html` (on Vercel: `/wireframes/sandbox/`).
Change anything in this folder; nothing here reaches the real prototypes, and nothing in them links here.

## How it stays apart

| Rule | How |
| --- | --- |
| Loads only its own files. | A full copy: `index.html` (Version 1's frame page), `shared.css`, `themes/`, `pv-device.js`, `concepts-*.js` and `third-half-list.js`, `v1/` (Version 1's own scripts and styles, including the forks that replace `concepts-teams.js`, `concepts-third-half.js`, `concepts-map.js`, `concepts-plan.js` and `concepts-flow-c.js`, which the page no longer loads), `drop-goal/`, `vendor/`, `flags/`, `data/`, and the images and fonts in `assets/`. Edit these copies, never the ones in `public/wireframes/`. |
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

Sample tags inside the narrative sentences show only with Annotations on (28 Nov 2026); cards keep theirs. The last day offers places other than the arrival day's three where others are open.

Layout (28 Nov 2026): each day's heading sticks under the floating nav on one line; a stretch of free days is one block (one list of up to three ideas, More ideas in place, two compact other matches, See day by day), which cuts the England plan from 8.2 to 4.6 screens.

The three questions on a wide desktop (28 Nov 2026, `v1/v1-flow-desk.css`): the lead (step count, bar, title, note, Find and Grid) in a left column and the answer in a right column on every step. The answer column (520px) sits on the screen's centre, the same centre as the section tabs and the Back and Next buttons, so the plan rail on those steps is 300px; the Also on in NSW block under the dates step is centred on it too. Home and the kick-off layer are left out of these rules. Below 1280px they stay stacked, centred in the space beside the rail.

Where you're staying (28 Nov 2026) asks one thing: the other-matches block and the Newcastle suggestion no longer show under it (they stay on the dates step and the plan), and its note is one sentence shorter.

Focus (28 Nov 2026): the temporary no-focus-ring.css is gone (and its links), so keyboard focus rings are back; each calendar (the step's and the Your days sheet's) is one tab stop with the arrow keys, Home, End, Page Up and Page Down moving between days.

Calendars and fan zone cards (29 Nov 2026): the two months always stack, in the dates question, the plan panel and the Your days sheet (side by side they were too narrow). Fan zone and village cards no longer carry a Sample tag; their made-up fields (getting there, open, what is there) show the annotation wash with Annotations on. Sample tags remain on the plan page's place cards and the place page's About this place.

## One simple, interactive trip map (27 Nov 2026, sandbox only)

The trip map under the opening sentences is now the only map of the trip (`v1/v1-narrative.js`, styles in `v1/v1-narrative.css`).

- **One map, closed or expanded.** Expanding makes it bigger and swaps the expand icon for a close cross; the pins, switches' effect and controls are the same. It grows from where it sits and shrinks back into it.
- **Named pins only.** Every pin shown has its name beside it. A pin whose name has no clear place (it would touch another name or pin) waits for a closer zoom, and a "Zoom in for more" button shows while any are waiting. No numbers, legend or clusters.
- **A pin's card.** The place, its day, Add or Remove (in place: the card stays so a Remove can be undone), and Go to this day, which scrolls the page to that day (closing the expanded map first).
- **Interactive where it sits.** Drag to pan, pinch to zoom, plus and minus, arrow keys. A plain mouse wheel scrolls the page; Ctrl or a trackpad pinch zooms. A one-finger drag on the map pans it, so on a phone the page scrolls from outside the map.
- **Highlights.** The underlined match in the sentences and Show on map (or Show route on map) on a day ring that pin. Show on map goes up to the map and leaves a "Back to [day]" link on it.
- **Three switches above it.** My plan (on), Ideas (what the days below offer, from `tp.mapStops`), Fan zones and pubs (`v1/v1-fanspots.js`, sample). Where they stay always shows.
- **A drawn base map** (`v1/v1-basemap.js`), sharp at every zoom: the open coast is Natural Earth 1:10m (public domain); Sydney Harbour, the coast from Dee Why to Cape Banks, Newcastle harbour, Lake Macquarie and Brisbane Water are drawn by hand and approximate. The stretched picture (`assets/images/map/nsw-map.webp`, a map screenshot) is no longer used by this map.
- **Framing.** It fits their own places with nothing closer than 24px to an edge or under the controls; zoom is limited (0.3 to 32, and never closer than 10 when it frames itself).
- **Removed from the page.** The full-screen "Your days, day by day" map no longer opens from anywhere on the plan page (its script, `v1/v1-map.js`, still loads because sheets use `tp.poiItem` from it), and the separate "Pubs and fan zones on the map" section is not inserted (`v1/v1-fanzones.js`); the fan zones list stays.
- **Home's map** (Where the matches are, `concepts-home.js`, styles in `v1/v1-quiet.css`) uses the same drawn base map, colours, pins and name chips. It keeps its own behaviour: fixed framing, a pin opens its host city sheet, and the stadium card in view marks its pin. It does not pan or zoom.

Catch-up still owed for this change: annotations in `index.html` that describe the old maps (`#v1-fm`, Explore freely), low fidelity and reduced motion checks, unused styles (`.v1-fm-*`, `.tp-map*`) and tests.

## Links (27 Nov 2026, sandbox only)

- **Visit Instagram / Visit TikTok** on Home open the footer's addresses in a new tab (`concepts-social.js`, `v1/v1-social.js`). "View on Instagram" on a single sample post is still a placeholder.
- **The underlined match in the opening sentences** opens its match sheet. For a match they are going to, the sheet has Show on map (closes the sheet, goes to the map, rings the ground) and Remove (the sheet then offers Add, so it can be undone).
- **More places / More ideas** read Show fewer once everything is showing, and collapse.
- **Plan around your matches** on Home lands at the top of the plan page with the Your plan sheet closed, once the three questions are answered.
- **A fan zone sheet** says "more of your matches" only when the match it is about and the others are all matches of teams they follow; otherwise "[n] more matches".
- **Place sheets** have "See more on sydney.com" (visitnsw.com outside Sydney) and "Get directions", both in a new tab. Real pages: every idea's own `url` (`concepts-destinations.js`) and three listings in `REAL_PAGE` (`v1/v1-third-half.js`); anything else goes to the site's front page and is marked Sample. Directions are a Google Maps directions link from where they stay.
- **Match sheets for a match they are not going to** have "Tickets on the official site" (rugbyworldcup.com/2027/en/tickets, new tab).
- **Getting there and back** has "Plan this trip on Transport NSW" (transportnsw.info/trip, new tab) and real stops in place of the made-up junctions and halts (`concepts-fixtures.js`): Lidcombe and Olympic Park stations for Stadium Australia, the Moore Park light rail stop for Sydney Football Stadium, Broadmeadow station for Newcastle Stadium. Times are still sample. Someone staying in the ground's own precinct gets a walk.

## Home on desktop: the team cards as one fanned row (28 Nov 2026, sandbox only)

On a desktop-wide screen (1024px and up) Home's Pick a team section stacks: heading and line, the 24 cards as one row on a single arc, then the button. Each card overlaps the one before, like a hand of playing cards, and shows its code, flag, NSW mark and the country's name reading down its left edge (`oneRow` and `handGeo` in `v1/v1-teams.js`, styles in `v1/v1-quiet.css`). Phones and the first question on the Plan tab keep the rows of six.
