# The Third Half: kick to NSW (prototype)

> **In this repository** (`public/wireframes/drop-goal/`, 21 Nov 2026): this game is the Drop goal tab of `public/wireframes/prototype-pick-your-team.html`, shown there in an iframe. Stage 2 wired Add to your plan to the plan (see Messages). Stage 1 brought it in unchanged except: the colour configuration tools are folded into a closed "Colour settings (temporary)" disclosure, to be removed later; a closed destination card no longer stays in the Tab order; and `tools/kit-lab.html` was not copied. Its destination fields are §18 of `docs/product-data-contract.md` (`gap`, placeholder fixtures only).

A Gorillas-style kicking game for the DNSW Rugby World Cup "Plan your 3rd half" campaign. The player picks a start city and a route, sets angle and power, allows for wind, and kicks. Wherever the ball lands is a real place in Sydney or NSW, and a destination card slides in with a "Add to your plan" action.

Status: working prototype. All destinations, distances, summaries and images are placeholders.

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

- Only the data contract's §18 fields cross (name, distance_km, route). Summary and image are not held yet.
- One save per place name: Byron Bay kicked from Sydney or from Newcastle is the same save, and the plan keeps the route
  and distance it was first saved from.
- The plan never slots a kick destination onto a day: it stays in Saved, not placed yet.
- Opened on its own, nothing answers, and saves stay in the page's memory until it is reloaded.

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
| `js/routes.js` | Start points (Sydney, Newcastle) and 8 routes of 10 stops each. **Placeholder data** |
| `js/zones.js` | Landing-zone sizing for equal exposure, the player model, Blue Mountains terrain |
| `js/game.js` | State, rendering, physics, kick sequence, camera, destination card, colour pickers |
| `js/main.js` | Event wiring, start-up, and the `checkDistribution()` dev helper |
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
1. **Destination content:** verify every stop and distance, especially Newcastle Local, where close stops may be in the wrong order. Pull real summaries, hero images and links from the sydney.com and visitnsw.com destination pages. Check image usage rights.
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
