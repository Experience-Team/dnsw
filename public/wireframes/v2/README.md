# Version 2

> **Where it lives (25 Nov 2026).** Version 2 is a tab of the prototype viewer, `../prototype-pick-your-team.html?version=2`.
> Its own page is `../prototype-pick-your-team-v2-frame.html`, which the viewer shows in a frame; `../prototype-pick-your-team-v2.html`
> redirects to the viewer. Inside the viewer the page hides its own tabs, title and the Open Version 1 block (`.pv-framed`).
> Version 1 is labelled full functionality and Version 2 reduced. Everything below still applies to the frame page.

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
| `v2-saved.js` | Your plan, the simple saved list (24 Nov 2026): the button (bottom right on phones, in the header on desktop), the sheet with Remove, Undo and Clear all, Save & share as a level inside the sheet, and Add on articles. It reads the game's `places.js`, `watch-parties.js` and `kit.js` for its rows. `window.v2Saved` (`open`, `close`, `count`, `layer`). Everything is kept in `v2:tp-pick-v1` (`added`, kinds `kick` and `v2art`). |
| `v2-onboard.js` | Drop goal's team screen (24 Nov 2026), over the game when no team is picked and from Change on the pitch: Home's cards, lent by id, on the pitch. One tap picks the kicker, shows "Kicking for [team]" for half a second and opens the pitch. The rules screen that followed it is gone; the game has a practice kick instead (`drop-goal/game.js`, started by `v2-view.js` the first time and from the ?). Seen is kept as `v2:v2ob-seen`. |
| `v2-teams.js`, `v2-third-half.js`, `v2-map.js`, `v2-plan.js`, `v2-home.js` | Version 2's own copies of Options A to C's `concepts-*.js` of the same names, brought in with Home on 24 Nov 2026. Globals are renamed `tp*` to `v2*` (`window.v2Picker`, `v2View`, `v2Plan`, `v2Icons`, `v2Article`); ids and classes keep their `tp-` names so the shared styles apply. The planner they also build is in the page but out of reach (`v2.css` hides the plan bar, Plan around your matches, and Add to my plan and I have a ticket on a match sheet) until Version 2 has one. `concepts-flow-c.js` is not copied. |
| `drop-goal/` | Drop goal's kick screen (24 Nov 2026, `docs/drop-goal-brief.md`, Kick screen), shown in the phone in a frame. `kit.js` and `kicker.js` are copies of Options A to C's `drop-goal/js/teams.js` and `rig.js`, trimmed; `game.js` ports concept lab card 10's two-tap timing unchanged. `places.js` holds the places (§19 destinations, fixtures only) and `watch-parties.js` the watch parties (§20, invented sample data) for teams with no NSW match; `result.js` picks the place, and draws the result card and See the places. Save writes Version 2's own copy of the planner's saved state (`v2:tp-pick-v1`). `?demo` is Home's how-to-play snippet: the game plays itself once when the page asks, takes no input, and says and saves nothing. The practice kick (`window.__dgPractice`) is one untimed kick that does not count. With a mouse the game says Click where it says Tap. `?team=<names>` dresses the kicker; the page sets it from the teams picked on Home (`v2-view.js`). |

Since the table above was written (all 24 Nov 2026, see `docs/handover-version-2.md`):

- `v2-view.js` also opens the places on their own (`v2Play.places`, Home's Or see all the places), puts a result card
  away when the layer closes, hides Back while a phone result card is up (`v2Play.back`), and takes `view=kick` off the
  address after opening the game.
- The game layer has **Back** at the top left, not a close cross; How to play stays top right.
- In the page, the game adds `html.in-page`: it makes room for Back, and See the places is not offered there.
- `drop-goal/` buttons say Add and Added. A place with no picture shows a team-colour poster. The practice kick hides
  the table, the kicker's line and How to play, and says Too soon or Too late. The caption above the bar types itself.

## Iterations

The Iterations tab is a placeholder until the first iteration is saved. To save one:

1. Copy the page to `v2/iteration-<n>.html` and the files it uses from this folder to `v2/iteration-<n>/`, and point the
   copy's links at them (shared files stay shared, with `../` paths).
2. Give the copy its own storage prefix (`v2-i<n>:` in place of `v2:`), and set its `data-flow` to `v2-i<n>`.
3. Replace the Iterations placeholder with a tab per saved iteration, in every Version 2 page's tab row.
4. Add the iteration to `tests/regression/v2.visual.spec.js` and `v2.behaviour.spec.js`, and approve its baselines.

A saved iteration is frozen: later work goes into Version 2, never into a saved iteration.

## Sydney on social (25 Nov 2026)

`v2-social.js` and `v2-social.css` are Version 2's own copy of the Sydney on social module (Home, above the FAQs, and its
full-screen viewer): classes, ids and globals start `v2-soc` / `v2Social`, and seen rings are kept in `v2:v2-soc-v1`.
Version 1 has its own copy in `../v1/`. The fixtures, `../concepts-social.js`, are a shared data file, read only here.
Fields are in `docs/product-data-contract.md` section 21.

## The desktop Home (26 Nov 2026)

The real desktop page is the frame page opened on its own with `?phone&theme=hifi`
(`prototype-pick-your-team-v2-frame.html?phone&theme=hifi`, the viewer's "Open in desktop" link). The viewer's default
view is only a 390px phone beside a notes panel. All of this is in `v2.css`, inside `@media (min-width: 1024px)`, and
overrides rules in `shared.css`; Options A to C and Version 1 do not move.

- **12 columns.** `#tp-home` is a 12-column grid with 24px gutters across the page's one content width (1,265px at most).
  The hero picture is the only edge-to-edge element. Drop Goal's words are columns 1 to 4 and its picture 5 to 12 (16:10),
  the map and stadium cards 6 and 6, At a glance 7 and 5, the FAQ 1 to 7 with the newsletter and sharing in 9 to 12, the
  article columns three of 4 (the masonry stays, on 24px gaps both ways), and the footer's two sign-ups 6 and 6.
- **Rhythm.** 48px between sections, 96px after the hero (Experience principles 4).
- **One block for the team picker and the map.** See where your team plays and Where the matches are share a block: the
  hand on one row across all 12 columns, the map and stadium cards under it (the second heading and line stay for screen
  readers). The three stadium cards share the map's height.
- **The hand on one row** (`oneRowGeo` in `v2-teams.js`). Where the hand is 944px wide or more (`avail >= 900`), the 24
  cards sit on one gentle arc, each over the one before, showing its code and flag. A hovered or focused card rises 24px
  and shows its name in a pill above it; hovering never changes the stacking, so the pointer is never trapped under a
  raised card (keyboard focus brings the card to the front). A picked card rises 18px. From 700px (`avail >= 700`) the
  hand seats six to a row instead of five (the Drop goal team screen on a desktop); phones keep five.
- **The map answers the pick** (`v2-home.js`, "Your team on the map"). The stadiums where a picked team plays group matches
  are lit and the other pins greyed, and the matching cards say how many matches. From `cnFixtures`, group matches only
  (knockouts are not drawn); a team with no NSW match leaves the map alone.
- **Hero.** The picture is `village.jpg` (a stand-in, 1,024px wide: a fan-zone crowd) until a wide, sharp rugby picture is
  supplied; it sits straight under the header's rule; the event line is 20px. The hero's hidden heading is the page's
  `h1`, the Home sections are `h2` and the At a glance cards and the footer's headings `h3`.
- **Tests:** `tests/regression/catchup-26-nov.behaviour.spec.js`.
