# Handover: Version 2 and Drop goal

24 November 2026 (Sydney). Repo `Experience-Team/dnsw`, main at `c8a2d2c` (the merge of #624). Everything below is
merged: #621, #622, #623 and #624. Pull main before starting (`git fetch origin main`) and compare against `origin/main`.
Branch used: `claude/optimistic-heisenberg-36g8fc`.

This covers Version 2 only. Options A to C have their own handover, `docs/session-handover.md`, from another session.

## Paused by the user (24 Nov): don't start these unless asked

1. **Screenshot baselines.** Main has no `tests/regression/__screenshots__/`, so on every PR the screenshot check
   fails with "No baseline yet" (about 120 rows: 100 for Options A to C, 20 for Version 2). The smoke tests are
   unaffected and pass. The fix is a PR with the `approve-baselines` label, merged only once the checks rerun green.
   It is the user's call. Until then, say once per PR that the red check is only missing baselines, and don't repeat it.
2. **Flow chart.** The brief asks for Play to show "saves into plan". `flow-chart.html` and `flow-chart-planner.html`
   belong to Options A to C, so under the version rule Version 2 would need its own. Ask before building.

## Still to do from the Drop goal brief

- **prototype-polish pass on the game screens** (the brief's "At the end of the whole build"). Done 24 Nov, in
  `game.css`, `game.js` and `result.js` only:
  - A tap on the pitch no longer leaves the keyboard's focus frame round the screen (`.is-keys`, set by a key press
    and cleared by a press).
  - Save and Saved are one width, and Share the table holds its width, so nothing beside them moves.
  - See the places always has a count line ("Nothing saved yet", then "1 saved to your plan"), so the first save
    doesn't push the list down. It slides away when closed, and a tap during that reaches what is under it.
  - Pressed and hover states on every button; the bookmark pops as it fills; GOAL lands with a small pop.
  - Spacing snapped to the 4px scale; motion and radius tokens in `game.css`.
  - Fixed: opened on its own in a window 700px or wider, the empty result card covered the game from the start.
- **Flow chart:** paused (above).
- Everything else in `docs/drop-goal-brief.md` is built.

## The January brief (24 Nov): team first, then what we show for that team

Decided by the user, don't reopen: a team is compulsory before playing (an agreed exception to experience principle 2,
recorded in CLAUDE.md); Every NSW match and the Third Half kit are gone from Version 2; a team with no NSW match gets
watch parties on the same card as a place; watch party data is invented sample data.

- **Team compulsory:** `v2/v2-onboard.js`. With no team, every route into the game (Play now, the menu, the picture,
  `?view=kick`) leads to the team screen; its button is off with "Pick a team to continue" until a card is picked. Skip
  skips the rules only. The game is not loaded until there is a team (`v2/v2-view.js`).
- **Every NSW match:** hidden in `v2/v2.css` wherever the copied scripts draw it, and dropped from saved state on load
  (`v2/v2-teams.js`). The copied planner code still contains it.
- **The kicker decides:** the first picked team. Plays in NSW: places near its stadium (as before) plus a MATCH row with
  its next NSW match, from the fixtures. No NSW match (nine teams): its watch parties, each once before a repeat.
- **Watch parties:** `v2/drop-goal/watch-parties.js`, 18 invented records, one in Sydney and one in Newcastle per team,
  public precincts and fan sites only. Contract §20 (new): `match` and `location` are the new fields; the rest mirror §19.
- **Home's animation** wears the picked team's kit, or Australia's before a pick.
- **Known gap for the team, not solved:** a watch party is tied to one match, so its card goes stale once that match has
  passed.
- **Out of scope for January:** other NSW matches around theirs, places between Sydney and Newcastle, community and food
  by nation, the planner, the flow chart, screenshot baselines.
- **Still in the code but unreachable from the page:** the game's no-team path (default kit, places from both cities),
  when `v2/drop-goal/index.html` is opened on its own without `?team=`.

## Home, the menu and the full-screen game (24 Nov, after #627)

- **Home** is brought in from Options A to C unchanged. Version 2 has its own copies of the scripts it needs
  (`v2/v2-teams.js`, `v2-third-half.js`, `v2-map.js`, `v2-plan.js`, `v2-home.js`; globals renamed `tp*` to `v2*`).
- **Planner out, by the user's choice:** the plan bar, Plan around your matches, and Add to my plan and I have a ticket
  on a match sheet are hidden in `v2/v2.css`. The copied code still builds them, so bringing the planner in later is
  mostly a matter of showing them. The cards' caption still says a pick adds matches "to your plan": raised, not decided.
- **Menu** (the user: "we can refine this later") replaces the three tabs: Home, Plan your 3rd half (jumps to that
  section of Home), Play Drop Goal.
- **Play now** opens the game as a full-screen layer (`#v2-play`, `v2/v2-view.js`). Ways out: the cross top right,
  Escape, the phone's back button. Focus and the page's scroll come back as they were. `?view=kick` opens it directly.
- **How to play:** Home's Play section shows the game playing itself (`v2/drop-goal/index.html?demo`) in place of the
  still: a ring at each of the two taps, on a loop, only while on screen, with Pause; still under reduced motion.
- **Onboarding** (`v2/v2-onboard.js`): the first time the game is opened, one rule screen, Two taps to kick, with the
  game playing itself once and each press marked and named, and a team screen first when no team is picked
  (skippable). On a touch screen the words and marker say Tap; with a mouse, Click, with a pointer. Skip on every
  screen; first time only (`v2:v2ob-seen`), then the ? beside the game's cross. The user first chose two rule screens,
  then asked for Score to find a place to be folded into the first (24 Nov). The game's own words still say Tap on
  desktop: raised, not decided.
- **Team screen on the pitch:** the onboarding's team cards sit on the game's field (green and lines; greys in low
  fidelity), with small text on dark chips.
- **Result on phones:** the card slides up and pushes the field off the top in one movement; the top is Kick again
  alone, in a row clear of the page's ? and cross. From 700px wide it is unchanged (posts and place beside the card).
- **Teams:** Home's picks go to the game (`?team=`); the review-only Kicker's team list in the left panel is gone.
- **Saves:** the game and the team cards share `v2:tp-pick-v1`; the page merges the game's saves as they happen.

The sections below describe Version 2 before this; where they say the phone holds only Drop goal, or mention the
Kicker's team list or `v2:dg-team`, the above replaces them.

## What Version 2 is

`public/wireframes/prototype-pick-your-team-v2.html`: a fresh prototype, separate from Options A to C
(`prototype-pick-your-team.html`). It uses the same styles, components and data, and none of their behaviour.

- **Tabs:** Version 2, and a dashed Iterations placeholder that isn't a link. The phone-view Settings menu lists links
  only.
- **The way back:** Version 2 links to Version 1 (Options A to C) once, from its left panel above View on your phone
  ("Open Version 1", 24 Nov, at the user's ask), styled in `v2/v2.css`. Not in its tabs or phone Settings menu.
- **The way in:** Options A to C link to Version 2 once, from their left panel above View on your phone ("Open
  Version 2", added on 24 Nov at the user's ask). Not in their tabs or their phone Settings menu. Its styles sit in
  that page's `<head>`, so `shared.css` is unchanged.
- **Rules:** `public/wireframes/v2/README.md`, and since #624 a standing rule in CLAUDE.md. Work on one version never
  edits another's files or a shared one (`shared.css`, `themes/hifi.css`, `pv-device.js`, `concepts-*.js`). Copy into
  `v2/` and change the copy. Classes and globals start `v2`. Shared data files are read only.
- **Saved state:** a `<head>` script files every key under `v2:`. Reset and `?reset` clear only `v2:` keys. Inside
  the game's frame (which isn't shimmed) keys are written with the `v2:` prefix by hand.
- **Iterations:** a saved iteration is a frozen copy with its own file, folder, storage prefix (`v2-i<n>:`) and
  screenshots. The steps are in the v2 README. None saved yet.
- **The phone** keeps the id `tp-phone`, so copied components keep their shared styles. It holds only Drop goal, in a
  frame (`#v2-game`) that fills it.
- **Left panel, review only:** a Kicker's team list (no team, Every NSW match, or one of 24 teams), kept under
  `v2:dg-team`. It stands in for a team picker, which Version 2 doesn't have yet. Not shown in phone view.

## Drop goal (`public/wireframes/v2/drop-goal/`)

Brief: `docs/drop-goal-brief.md`. Style reference: `docs/drop-goal-style.png` (left: result, right: kick screen).
Mechanic: concept lab card 10 (`dnsw-discovery-gallery.vercel.app/concept-lab/cards/5c-dropgoal.html`; the fetch
tool strips its script, so download the raw HTML to read it).

| File | Holds |
| --- | --- |
| `index.html` | The kick screen, result screen and See the places markup. Loads the shared `../../concepts-fixtures.js`. |
| `game.js` | Timing, judging, drawing, kicker poses, the nation table, Share the table, input, and the theme and annotations sync from the page. |
| `result.js` | Which place a goal lands in, the result card, See the places, Save. |
| `places.js` | The 10 places (§19 destinations, fixtures only). Edit freely. |
| `kit.js`, `kicker.js` | Trimmed copies of Options A to C's `drop-goal/js/teams.js` and `rig.js`. |
| `game.css` | All styles, both themes, as tokens. |

**Address:** `?team=Wales,Japan` (a comma list of picked teams; the first kicks, all choose the places and FITS).
`Every NSW match` or no team gives the default green and gold kit and places from both cities. Opened on its own,
`?theme=hifi|wireframe`. In the frame it follows the page's theme and Annotations.

### How it plays
- **Two taps:** tap (or Space, Enter) to drop the ball, then tap again as it bounces. The big line follows the taps:
  TAP TO DROP, then TAP TO KICK while it falls, then KICK NOW (on yellow) while a kick would score, in step with the
  bar's yellow KICK zone. One tap alone says "No kick. Tap once to drop, then again as it bounces."
- **Timing** (`T` in `game.js`, seconds from the first tap): release 0.12, fall 0.6, so the bounce is at 0.72. A goal
  is 0.15 after the bounce, give or take 0.15 (0.72 to 1.02). Card 10 used 0.04 and 0.1, which closed before most
  people could react to the bounce; the user couldn't score until this was widened. Early is wide, late is short. The
  boot swings on its own at 1.14.
- **Goal:** +3 on the nation table (sample scores) for the first picked team, the place framed between the posts,
  then the result screen 1.2s later. A tap during that skips straight to the result.
- **Miss:** a friendly line, the next ball comes by a pass, and a tap takes it at once.

### Result screen and See the places
- **Result:** pitch with the framed place and Kick again on top, then the card in violet, orange and green borders:
  photo, "The ball landed in ...", name, Save (bookmark), tags, description, FITS, TRAVEL (estimate), See the places.
  Stacked on phones, side by side from 700px. Escape or Kick again goes back.
- **See the places:** a full-screen layer, open from the kick screen and the result without playing. The picked
  teams' places come first, then "See all 10 places", with Save on every row. Close cross top right, Escape closes it,
  and focus goes back to the button that opened it. The page's Settings icon hides while it's open, as it sits where
  the cross goes.

### Places
- **10 places, five per host city.** Sydney: Cabramatta, Blue Mountains lookout, Bondi to Coogee walk, Parramatta,
  The Rocks. Newcastle: Newcastle Ocean Baths, Hunter Valley, Nobbys Beach, Port Stephens, Lake Macquarie.
- **Which set:** the cities the picked teams play in, from the fixtures. With both cities, each round starts two from
  the next match's city for every one from the other. That changes the order, never how often a place is shown.
- **Rotation:** every place in the set once before any repeat, never the same place twice in a row. Kept per visit in
  sessionStorage `v2:dg-rotation`.
- **FITS:** "Sat 16 Oct: before or after England v Wales" from the picked teams' fixtures in the place's city, else
  "A free day around Sydney" (or Newcastle).
- **Data:** six descriptions come from the destination pages (`concepts-destinations.js`). Cabramatta, Newcastle Ocean
  Baths and Hunter Valley use card 10's lines, marked `sample`. Tags and travel times are sample. Only Newcastle Ocean
  Baths has its own photo; Bondi and Port Stephens use stand-ins (marked); the rest show a drawn placeholder. The repo's
  Hunter pictures are of named wineries, which the no-businesses rule excludes.
- **Known trade-off:** a one-city fan only sees that city's five places after a goal. The rest are behind "See all",
  so exposure across all 10 depends on which teams people pick. Raised with the user; not decided.

### Save
Writes Version 2's own copy of the planner's saved state, `v2:tp-pick-v1`, in the same shape as Options A to C's
`tp-pick-v1`: `{ added: [{ id: 'kick:<place>', kind: 'kick', title, day: '', unplaced: true, kick: { place, host_city } }] }`.
Version 2 has no Your plan yet, so nothing shows it except the Saved button and the count in See the places. The user
chose this over writing into Options A to C's state.

### Data contract
§19 (destinations) gained `tags`, `host_city`, `image` and `travel_from_ground`, all `gap` with empty states. FITS is
worked out from the fixtures, not held. Approved by the user on 24 Nov.

### Accessibility (WCAG 2.2 AA)
- **Keyboard:** Space or Enter plays. Tab goes from the pitch to Share the table, then See the places.
- **Screen readers:** the pitch's label explains the two taps. A polite live region (`#dg-say`) announces each goal
  (the place, points and table position), each miss, each save and Share the table. Table rows read "5, Portugal
  (your team), 41 points".
- **Contrast:** the pitch is `#55944a`, a shade darker than the reference's `#64a355`, so the large cream type, posts
  and bar reach 3:1. Small text on the pitch sits on dark chips. The bar's inside is dark so the yellow zone shows.
  GOAL is cream with a yellow underline.
- **Reduced motion:** the drop stays (the timing needs it). There's no flight, frame fade, +3 pop or card transition,
  and the result opens straight away.
- **Share the table:** copies a line. If copying is blocked, it shows the line selected under the button and says so.

## Tests

`tests/regression/v2.behaviour.spec.js` (55 tests) and `v2.visual.spec.js` (kick, kick with a team, Settings, result,
places; both themes at 390 and 320). Run `npx playwright test --project=behaviour tests/regression/v2.behaviour.spec.js`.

- **Human pace:** three tests use real mouse clicks at 0.76, 0.9 and 0.98s and must score. Since #624, CLAUDE.md
  check 4 says to test at a person's pace: the earlier tests pressed at the perfect moment and passed while nobody
  could score.
- **Result-card clicks** wait for the card's entry animation to finish (`score()` in the spec). During its 80ms delay
  it holds still but invisible, and a click under load could land as it moves.
- **Screenshots** are stable run to run locally, but baselines only count from the CI Docker image, so never commit
  local ones.

## Decisions the user made (don't reopen)

- Version 2 is separate from Options A to C; build Drop goal there, in its own folder, shown in a frame.
- Port card 10's mechanic. The one departure is the wider kick window, after the user couldn't score.
- The kick screen opens on TAP TO DROP, not the brief's TAP TO KICK, after the user tried one tap and couldn't score.
- Save writes Version 2's own copy of the state, not Options A to C's.
- Phone result is stacked and scrolls.
- The 10 places above, five per city.
- §19 contract fields as above.
- Nation table under the logo on phones (the reference has it bottom right on a wide screen). "TAP TO KICK" and
  "KICK AGAIN" in IBM Plex Mono, matching the reference rather than the brief's "condensed".
- Skin follows the existing game's rule: only a blue or green from the team's palette, slate where there's neither.

## Ways of working with this user

- **They test on a phone only.** The desktop viewer shows little. Share the phone address:
  `https://dnsw-git-claude-optimistic-he-5dec6a-mopo123-gmailcoms-projects.vercel.app/wireframes/prototype-pick-your-team-v2.html?phone`.
  On a new branch, copy the slug from the mopo123 Vercel bot comment; never share the moniquepompe project's links.
  If a change doesn't show, a reload clears the old copy.
- **Merging:** they mark PRs ready and merge within minutes, often before the checks finish.
- **CLAUDE.md:** propose wording for a new rule and wait for approval before editing. Rules for the phone are in the
  twelve prototype interaction checks; read them first.
- **Stop and show:** when a brief or your reply asks questions, don't commit until they're answered. A stop hook will
  ask you to commit; explain why you won't.
- **Write in UK English** and keep em dashes to a minimum.
