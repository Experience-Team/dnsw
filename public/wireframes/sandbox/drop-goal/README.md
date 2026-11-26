# The Third Half: kick to NSW (prototype)

> **In this repository** (`public/wireframes/drop-goal/`, 21 Nov 2026): this game is the Drop goal tab (shown as Play on phones; `?view=kick`) of `public/wireframes/prototype-pick-your-team.html`, shown there in an iframe. Stage 2 wired Add to your plan to the plan, and Stage 3 brought in the page's theme and picked team (see Messages). Stage 3 also gave the result card a close cross, made the pitch stay in view on phones and put the controls beside it on desktops, in both the prototype and on its own. Stage 1 brought it in unchanged except: the colour configuration tools are folded into a closed "Colour settings (temporary)" disclosure, to be removed later; a closed destination card no longer stays in the Tab order; and `tools/kit-lab.html` was not copied. Its destination fields are §18 of `docs/product-data-contract.md` (`gap`, placeholder fixtures only).

A Gorillas-style kicking game for the DNSW Rugby World Cup "Plan your 3rd half" campaign. The player picks a start city and a route, sets angle and power, allows for wind, and kicks. Wherever the ball lands is a real place in Sydney or NSW, and a destination card slides in with a "Add to your plan" action.

Status: working prototype. Every stop has a real summary from its town page (`js/summaries.js`, 22 Nov 2026); distances and images are placeholders.

## Messages (inside the prototype)

In the prototype's Drop goal tab the game runs in an iframe and its scripts never load in the page. Add to your plan
saves the place to the plan's "Saved, not placed yet" group (Stage 2, 21 Nov 2026). The game and the page talk only
through `postMessage`, same origin only, and each side checks the sender (the parent window here; the game's frame
there). `js/plan-link.js` is the game's side; the page's is "Drop goal: the kick game's link to the plan" in
`../concepts-teams.js`.

| Message | Direction | Carries | When |
|---|---|---|---|
| `thk:ready` | game to page | nothing | the game has loaded; the page answers with `thk:saved` |
| `thk:save` | game to page | `name`, `distance_km` (or `null`), `route: { start, label, position }` | Add to your plan pressed |
| `thk:unsave` | game to page | `name` | Added to your plan pressed again |
| `thk:saved` | page to game | `names`: every place from the game in the plan | after `thk:ready` and after any change to the plan |
| `thk:theme` | page to game | `theme` (`hifi` or `wireframe`), `tokens`: the page's colour and font values | after `thk:ready`, and when the theme switch changes (Stage 3) |
| `thk:teams` | page to game | `picked`: the planner's picked team names | after `thk:ready` and after any change to the plan or picks (Stage 3) |
| `thk:card` | game to page | `open`: true or false | when the result card opens or closes; the page head dims while it is open |
| `thk:open-plan` | game to page | nothing | See your plan on the card's line: the page closes the card, goes to the planner and opens the plan at Saved, not placed yet |
| `thk:reset` | page to game | nothing | Reset prototype: a new visit. The seen lists and the random start are cleared and a new start is picked (22 Nov) |
| `thk:close` | page to game | nothing | a press on the page outside the game, or leaving the tab; the card closes and focus stays where it was |

- Only the data contract's §18 fields cross (name, distance_km, route). The summary shows on the card only; image is not held yet.
- One save per place name: Byron Bay kicked from Sydney or from Newcastle is the same save, and the plan keeps the route
  and distance it was first saved from.
- The plan never slots a kick destination onto a day: it stays in Saved, not placed yet.
- Opened on its own, nothing answers, and saves stay in the page's memory until it is reloaded.
- Theme (Stage 3): `css/embed.css` applies only when the game runs in a frame (`html.embedded`). It maps the controls
  and the result card onto the page's values (`--e-*`, set from `thk:theme`) and loads high fidelity's IBM Plex
  stand-ins from `../assets/fonts/`. The pitch, posts, player and route bar keep their colours. The page shows its own
  "Drop goal" title (Play on phones), so the game's heading, the mark on the pitch and the two notes are hidden there.
- Teams (Stage 3): picked teams come first in the team row and the first is the kicker, until someone chooses a team
  in the game; that choice stays in the game and never changes the planner's picks.

## Run it

No build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

The only external requests are Google Fonts (Space Mono, Archivo).

`tools/kit-lab.html` is the earlier standalone page for curating player kits. It has the pose sheet and "Copy current pose as SVG". Its colour settings can be copied and imported into the game with "Import settings".

## File map

| File | What it holds |
|---|---|
| `index.html` | Markup: stage SVG, destination card, controls, colour configuration panel |
| `css/styles.css` | All styles, including the card's sticky action bar and mobile bottom sheet |
| `js/teams.js` | 24 teams and their kit colours, skin-colour rule, kit/skin/field curation state (saved to localStorage) |
| `js/rig.js` | The rigged SVG player: skeleton, 10 poses, forward kinematics, part drawings, ball |
| `js/config.js` | World constants (posts, zone start, gravity, camera start) |
| `js/routes.js` | Start points (Sydney, Newcastle) and 8 routes of 10 stops each. **Distances are placeholders** |
| `js/summaries.js` | `SUMMARIES`: the card summary for every stop name, the direct answer from its sydney.com or visitnsw.com page (§18 `summary`). Generated from sydney-towns-aeo.xlsx; a stop with none leaves the paragraph out |
| `js/zones.js` | Landing-zone sizing for equal exposure, the player model, Blue Mountains terrain |
| `js/game.js` | State, rendering, physics, kick sequence, camera, destination card, colour pickers |
| `js/visit.js` | One visit (22 Nov): the random start, never the same stop twice (re-routing a kick by a gust or off the upright), Explore all stops, previous and next on the card, and the visit simulation for `checkDistribution()`. Loads before `main.js`, which calls `visitBoot()` |
| `js/main.js` | Event wiring, start-up, and the `checkDistribution()` dev helper |
| `css/embed.css` | Inside the prototype only: the page's theme on the controls and card, and what steps aside (Stage 3) |
| `js/card-sheet.js` | Phones only (the bottom sheet): the result card's two heights. It opens full; drag the grabber or head down for a short card that shows the landing, further or a flick to close; a tap on the grabber switches heights |
| `js/plan-link.js` | Inside the prototype only: the messages to and from the plan (see Messages). Loads last |

Scripts are classic (non-module) and share globals. Load order in `index.html` matters.

## How it works

### The player rig
- One SVG character built from separate parts (head, torso, upper and lower arms, thighs, shins, boots), each a `<g>` rotating about its joint.
- A pose is a set of joint angles (`P` in `rig.js`). Animation interpolates the angles, so the character never changes shape.
- `groundOffset()` keeps the lowest foot or knee on the ground in every pose.
- The rig is drawn side-on, facing right. Positive angles are clockwise (backwards for limbs, forwards for the torso).

### Physics and camera
- Projectile motion with gravity and a horizontal wind acceleration (`simulate()` in `game.js`). World units are roughly metres; y is up.
- Power maps to speed as `77 * sqrt(power)`, so distance grows roughly linearly with the slider.
- Clearing the crossbar at the posts (`POST_X`, `BAR_H`) shows "Over the bar!". Every kick still lands somewhere.
- The camera pulls back to fit the whole flight (as in Gorillas), then zooms in on the landing stop.
- The estimate under Power ("No wind: ≈ 353 km, Parkes") runs the same simulation with no wind.

### Routes
- **Sydney:** Local, North coast, South coast, West.
- **Newcastle:** Local, North coast, Central Coast to Sydney, Hunter Valley.
- Local covers roughly the first 30 km. The other routes start beyond that, so no stop appears on two routes from the same city.
- The world is distance-ordered but not to scale. km figures on the card are interpolated from each stop's listed distance.

### Neutrality: equal exposure
DNSW can't favour destinations, so each stop should be landed on about equally often.
- `computeBounds()` simulates 4,000 kicks using a **player model** (`PLAYER_MODEL`: angle 20°–70°, power 3–100%, random wind). It then sets zone boundaries at the 10% quantiles, so each stop catches about 1 in 10 kicks. That's why zones have uneven widths.
- Current result: 8–11% per stop on all 8 routes. Run `checkDistribution()` in the browser console to recheck after any change.
- **One visit (22 Nov).** Each visit opens on a random route from Sydney, aimed (no wind) at a stop picked at random, so the first kick favours no stop; the angle stays between 30° and 60° and the power in the top half of what reaches that stop. Moving a control replaces it for the visit (sessionStorage).
- **Never twice.** A stop counts as seen once its card has shown (landed, explored or via previous and next). A kick that would land on a seen stop is sent to the nearest unseen one, a tie going the way the ball was travelling: one stop on with the wind (or none) is a late gust; back, or against the wind, is off the upright; two or more stops is off the upright, then the gust. Off the upright always clears the crossbar: a ball that never reached the posts, or went under the bar, can only be carried by a gust. The path is the physics up to the posts (upright) or late in the flight (gust), then bent smoothly to the new stop's pin; the physics, zones, routes, terrain and `PLAYER_MODEL` are untouched. Once all ten are seen the kick lands where the physics says, the card says so, and the route's list starts again.
- `checkDistribution()` now prints a second table: whole visits (random start, then up to 7 more kicks from `PLAYER_MODEL`, most visits short, through the seen list and the re-routing), each stop's share of the cards shown. 22 Nov: 8.7 to 10.6% on every route. The first stop is lowest because re-routing only reaches it from one side.
- The guarantee only holds if real players behave like the model. With wider play (angles 10°–80°) it drifts to roughly 7–17%. Recommended: log real kicks after launch, refit `PLAYER_MODEL` (or the boundaries directly) from that data, and keep the logs as evidence of even exposure.

### Terrain (Sydney West only)
- The Blue Mountains are solid. A low, flat kick hits the front face and bounces back into the foothills (Penrith, Glenbrook).
- Kicks that land on top stop at Katoomba or Lithgow. Kicks that come down on the far slope roll on towards Bathurst.
- The geometry (`mountains` in `routes.js`) was found by searching for a size and position that split kicks 20% foothills, 20% plateau, 60% beyond. If you change it, re-run that search or recheck with `checkDistribution()`.

### Colours
- Kit colours come from the "Requested country flags" set in Figma.
- **Skin rule:** skin is only ever a blue or green from the team's own palette, never red, yellow, orange, white, brown or black. Those read as real skin colours or map to racial slurs.
  - Lime greens are nudged towards true green so dark shades don't look olive or brown.
  - Teams with no blue or green (Canada, England, Georgia, Hong Kong China, Japan, Spain, Tonga) use a neutral slate placeholder, marked `*`. **Open decision.**
- **Kit shade:** 5 steps per team. Whites stay white.
- **Skin shade:** 4 steps per team. Green skins skip the middle lightness so they don't vanish into the pitch.
- **Field colour:** presets plus a custom picker, one colour for all teams or set per team. It affects the stadium turf and the post pads.
- "Copy curated settings" exports JSON with final hex values for every team.

## Figma references
File: Rugby-World-Cup (`LwBKfIftpu8erI6WGOi4W1`)
- Team cards (first colour source): node `393:6895`
- Requested country flags, 24 teams (current colour source): node `395:531`
- Destination card mock-up ("The ball landed in…"): node `394:7961`

## Open items
1. **Destination content:** summaries are in (22 Nov 2026). Still to do: verify every distance, especially Newcastle Local, where close stops may be in the wrong order; hero images and links from the destination pages, with usage rights checked.
2. **Skin fallback** for the 7 teams with no blue or green: one shared neutral, or an agreed non-human accent colour such as teal.
3. **Add to your plan** (was "+ to plan"): connected to the prototype's plan in Stage 2 (see Messages). On its own the game still keeps saves in memory only.
4. **Exposure logging:** log the route, stop, angle, power and wind for each kick, to tune zones and to evidence neutrality.
5. **More terrain:** for example the Liverpool Range on the Hunter Valley route, or the harbour or skyline on Local routes.
6. **Destination images:** the card shows a drawn placeholder; replace it with real hero images.
7. **Accessibility pass:**
   - The card is a dialog that receives focus and closes with Escape; the controls are native inputs.
   - Reduced motion skips the animations.
   - Still to do: an announced result for screen readers, a full keyboard-only playthrough test, and colour-contrast checks on curated colours.
8. **Kit similarity:** some teams look alike because their flag colours overlap (Canada and Tonga, Australia and Chile).

## Tuning knobs
| Constant | File | Effect |
|---|---|---|
| `WIND_MAX` | `routes.js` | Wind strength (currently 0.7) |
| `speedFromPower` | `game.js` | Power to speed curve; max range |
| `PLAYER_MODEL` | `zones.js` | Assumed play behaviour used to size zones |
| `mountains` | `routes.js` (`sydney-west`) | Blue Mountains geometry |
| `KIT_STEPS`, `SHADES`, `FIELDS` | `teams.js` | Colour curation options |
| `POST_X`, `BAR_H`, `ZONE_START`, `NZ` | `config.js` | Posts, first zone, stops per route |
