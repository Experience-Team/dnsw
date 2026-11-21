# Session handover: Pick your team prototype, Home tab and planner

20 November 2026, afternoon (Sydney). Repo `Experience-Team/dnsw`, main at `726c621` (Fri 20 Nov, 1:27pm, the merge of #545). **No PR is open** apart from this handover's own. #527 to #545 are merged. Pull main before starting: `git fetch origin main`. A local `main` can be days behind `origin/main`, so always compare against `origin/main`.

This replaces the 19 November evening handover (#543). Since then: a Low fidelity prototype tab on the desktop (#544), and the open plan no longer scrolls sideways (#545). The Home tab is built and is the tab the page opens on. Open questions are carried over, trimmed to what still stands, with new ones from the 16 to 19 Nov audit added.

## Ways of working

- **Branch:** use the branch your session is given. On 19 Nov two sessions worked in parallel, on `claude/charming-carson-1bjb9u` (planner, tickets, Reset fix) and `claude/ecstatic-volta-ooalrr` (Home). Expect the same: pull main before each task, as the other session may have merged since.
  - Once a PR has merged, restart the branch from main with `git fetch origin main && git checkout -B <branch> origin/main`, then push with `--force-with-lease`.
  - If you push after the user has merged, your commit misses the merge: put it on a fresh branch from main and open a new PR.
  - One commit per task, a draft PR, subscribe to it, and a 50-minute `send_later` safety net (delete it once the PR merges). Several small asks in a row can share one open PR; update its description each time.
  - The Vercel bot posts several comment edits per push (two projects, building then ready). Only the mopo123 project's link is shareable; nothing in those comments needs action.
  - The user marks the PR ready and merges it, often within minutes.
- **Previews:** only share links from the Vercel project `mopo123-gmailcoms-projects`, in chat and in PR descriptions, pointing at the page that changed.
  - The URL is `https://dnsw-git-<branch-slug>-mopo123-gmailcoms-projects.vercel.app/wireframes/prototype-pick-your-team.html?tools` (add `&theme=hifi` for high fidelity). The plain address opens **Home**; add `view=plan` for the planner (`?view=plan&tools&theme=hifi`) or `view=kick` for Drop goal, and point each link at the tab that changed. **Long branch names are shortened**: copy the slug from the Vercel bot's comment on the PR rather than building it. For `claude/charming-carson-1bjb9u` it was `claude-charming-cars-cf7f46`.
  - The second project, `moniquepompe-2020s-projects`, also deploys every push; its bot comments arrive as PR notifications. Its previews ask for sign-in, so never share them.
- **CLAUDE.md:** read it first. It has **twelve** prototype interaction checks. Check 11 (toasts) grew this session:
  - run it on **every new or moved control**, not only on toasts already there (missed when I have tickets went on the match rows);
  - **never a toast over the control someone is still using** (the page's date slider has none for that reason);
  - a toast that repeats as someone adjusts something is title only and **updates in place**;
  - toast backgrounds are 90% opaque.
  - Checks 7 (list every place, ask, then do them all) and 12 (say what else a change touches, before building) still lead every brief.
- **What the user asked for, in practice (checks 7 and 12):** start a brief with a scope check and a knock-on list, ask, then build. The user said a bare "yes" to approve rules and suggested answers together; say back what you took it to cover.
- **Standing flags:** when the user says "you missed X" or gives a rule, work out the principle, fit it into an existing check where one covers it, and **show the wording and where it goes before editing CLAUDE.md**. The fix itself doesn't have to wait.
- **Stop and show:** when a brief ends with stop and show, don't commit until every question is answered.
- **Before handing over** (check 9): go through the brief line by line: done, not done and why, what's next.
- **Build log:** one row per change in the table at the end of `.claude/skills/wireframe/SKILL.md`.
- **Annotations:** update the annotations array in `prototype-pick-your-team.html` with every behaviour change. This session kept them up to date for its own changes.
- **Language:** the person's plan is "Your plan" or "the plan" everywhere a person can see it ("the open plan" for the full-screen layer). Don't write "timeline" in anything user-facing; code names (`tp-tl*`, `tlOpen`, `openTimeline`) are unchanged.
- **Writing style:** UK English, AUD, Sydney time, few em dashes. Rate how confidential and how safe to upload any work document that's shared.

## Running and testing

- **Serve:** `cd public && python3 -m http.server 8123`, then open `/wireframes/prototype-pick-your-team.html?phone&tools&theme=hifi` (or `theme=wireframe`).
  - Without `?phone`, the phone frame stays 358px wide at any window size.
- **Test:** Playwright via `NODE_PATH=$(npm root -g) node script.js`.
  - Check by eye from screenshots in both themes at 390 and 320 wide (CLAUDE.md "Look, don't only measure").
  - Run with and without `reducedMotion: 'reduce'`, and keyboard only.
  - Take frame strips for any motion (checks 1 and 5).
  - Walk every combination (check 4).
- **State:** saved in `localStorage['tp-pick-v1']` as `{picked, tickets, tab, added, trip, allFilter}`. Seed it, then reload.
  - Example: `{ picked: ['Zimbabwe', 'Australia'], trip: { from: '2027-10-08', to: '2027-10-14', mode: 'visiting' }, added: [] }`. Zimbabwe gives interstate matches, so Where to watch has venues.
  - Day indices count from 1 Oct 2027 = 0, so `data-dc-ideas="9"` is Sun 10 Oct.
  - Reset prototype (the refresh button left of the phone in the viewer), or `?reset`, clears it.
- **Useful handles:**
  - `window.tpPicker` (`tp`): `openPlan()`, `openTimeline()`, `openSheet(id, opener)` (a stacked sheet over the open plan), `toast(title, detail, {label, fn})`, `openDays(opener)`, `pickTeam(name)`, `match(key)`, `state`.
  - The status line is `#tp-live`.
  - The sheet is `#tp-pm`: its back arrow is `[data-pm-back]` and its cross is `[data-pm-close]`.
- **Test scripts:** each session's scripts live in its scratchpad and are gone afterwards. These are the patterns worth rebuilding:
  - a walk of every sheet: Where to watch, then a venue, then Escape, the back arrow, a short and a long drag, the cross and the dark area;
  - a match sheet, then a venue;
  - the open plan, then Add ideas, then an idea;
  - saving with no team: Around the NSW matches and a map pin, then the plan bar (N saved), the open plan's dashed box, Add team, a pick in the sheet, Escape;
  - each date picker: the page (`#tp-ask`), the days sheet and the open plan's days line: slider first (activated handle with a 12/10 tooltip while dragged), your dates under it as the button that opens the fields, Undo and Reset centred; no toast from the page's picker;
  - tickets: Wales picked, I have tickets on its Sat 16 Oct row (`[data-ticket]`), the toast and its link, Where to watch's line above the carousel, See your match day, Not going after all?, then an interstate ticket from a match sheet and its Watching in NSW instead?;
  - the full-screen map card, and the day-by-day card;
  - Getting there and back, then Add where you're staying, then Done.
- **Figma:** file `LwBKfIftpu8erI6WGOi4W1` (Rugby World Cup). Call `create_session` first.

## Where things are

- **`public/wireframes/prototype-pick-your-team.html`:** the page.
  - It holds the phone markup and the stacked sheets over the open plan: `#tp-ss` Save & share, `#tp-ts` Your teams (a list), `#tp-at` Add team (lends the page picker), `#tp-cc` Clear your plan?
  - It also holds the annotations array.
  - Page order in the picker section: Find row, the hand, its caption (Clear all now ends the caption's sentence, `capClear()` in teams), then Your days in NSW (`#tp-ask`, since 18 Nov), then the tabs (Your matches, All matches) and the chosen tab's content; the map (`#tp-ov`) follows All matches.
- **`concepts-teams.js`:**
  - the fan and picks;
  - the plan bar and open plan (code names `tp-tl*`; the bar drags, and a tap toggles it). With no team the bar reads No matches yet or N saved, with Add team (`#tp-tl-addteam`);
  - `addItem`: with no team and no days a dated save is held (`fixed` keeps its date, `unplaced: true`); the first save while the bar is out of sight gets a toast;
  - `atOpen`: the Add team sheet, which moves `#tp-util` and `#tp-picker` into `#tp-at` and back on close;
  - toasts: `toast`, `toastPlace` (16px from the bottom, 24px on desktop, 12px above anything pinned);
  - the desktop layout (`wide()`, `railFollow()`);
  - match card rows (`row()`): an NSW match with known teams has I have tickets (`.tc-tix`, orange ring 1px outside) in place of the old In NSW flag; interstate rows keep Watch in NSW;
  - `toast(title, detail, action, key)`: a toast with the same `key` as the one showing updates in place (used by the days toast);
  - the stacked-sheet pattern (`stackOpen`, `stackClose`, `stackRegister`, with drag and tap on the grabber). It fires the cancellable `tp:stackdismiss`, so a sheet with drill levels can go back one level instead of closing;
  - `tpFreeApi`, the free days;
  - `window.tpPicker`.
- **`concepts-third-half.js`:** the one sheet element, `pm` (`#tp-pm`).
  - `openPm(id, opener, stacked, swap)` handles these ids: `match:`, `item:`, `poi:`, `idea:`, `ideas:`, `ko:`, `wt:`, `days` / `days:stay`, and the `MODAL` ids (`w:` venues, `p:` products, trips, `go:` routes).
  - **Drill-down:** `pmPush`, `pmPop` and `pmHistory`. Shared helpers are `pmSnap` (a still picture of the level being left), `pmMove` (the slide) and `pmBackSync` (the back arrow).
    - Any `[data-open]` inside the sheet body drills down.
    - The page sheet's height is fixed on the first drill and released on close.
  - `pmLayerBack`: steps a full-screen map back behind a sheet.
  - `venueRow(id, name, meta, addHtml)`: the one venue row (thumbnail, name link, Add), used in Where to watch and the match sheet.
  - Where to watch (`renderWatch`): a ticketed match is a line above the carousel (`atLine`), not a card; `watchShow(key)` lands a toast link on the change. `ticketToggle(m, on, apply, fromSec)` is the one path for marking a ticket (row, match sheet, days sheet, Not going after all) and its toast.
  - `rangeDots()`: every picked team's match on the date sliders, NSW solid, interstate hollow. `onPagePicker()` silences the days toast from the page's picker.
  - `tp.mapStops`: the overview map's cards. An interstate stop uses `spotItem`, so it opens the venue.
  - `tp.slotSaved`: places saved items when days are set (team or not); a held dated item goes on its own date.
  - `renderAsk` (the page date picker), `renderDaysLine` (the open plan's), `pmDays` (the days sheet). All three lead with the slider (matches dotted) and share `rangeEnds` (your dates between 29 Sep and 15 Nov, a button, kept live by `outSet`), `tipSet` (the handle tooltip) and `typeFields`: the dates button shows 36px First and Last day fields, open or closed per picker in `typeOpen` (the sheet starts closed). `flexChips` and the ± days chips were removed on 18 Nov.
  - `thirdName()`: Around your matches, or Around the NSW matches with no team.
  - The ideas list (`tlIdeas`) is lent to the sheet while it's open (`tlIdeasReturn` takes it back). An idea and Next free day are drill levels.
- **`concepts-map.js`:** the overview map, "Around the matches in NSW".
  - It holds the route cards, the pins and full screen (`.tp-ov-map.is-full`).
  - It also holds Follow day by day, full screen (`.tp-mapfs`), with its own card panel and grabber.
- **`concepts-plan.js`:** the day cards in the open plan (`?plan=cards`, the default, or `?plan=swipe`). `tpPlan.same(el)` finds an opener again after a redraw.
- **`pv-device.js`:** paints library images in high fidelity, from `data-img` keys (`imgKey(title)` in third-half).
- **`shared.css`:** everything for this page is under `.tp-*`. Page section spacing comes from `--sec-gap` (64px). Your days now sits inside the picker, 24px under Clear all, with no box. The desktop layout is under `@media (min-width:1024px)`, scoped to `.pv-device #tp-phone`.

## Done on 19 and 20 November (#528 to #545)

- **#545:** the open plan (swipe by day) no longer scrolls sideways. The visually-hidden labels on the I have tickets buttons (#535) were absolutely positioned against the panel, stretching it to 3,306px. The day track and both carousels are now `position: relative`, and the plan panel is `overflow-x: hidden`; only the cards and the day line scroll. Also a new CLAUDE.md build note (approved by the user): find an element that can be lent elsewhere by its id, never by the section it usually sits in.
- **#544:** desktop only: a Low fidelity prototype tab in the window's top left corner.
- **#543:** the previous version of this handover.

- **#542:** Home: the day-trip photos and nudge line under the stadium cards removed; desktop polish (one content edge, two columns where the phone stacks).
- **#541:** desktop website: the capsule tabs sit in the header bar between the two logos; scrolled, they stick on their own bar.
- **#540:** Home full width on the desktop with no rail; the plan bar shows on Home only once a team (or every NSW match) is picked, floating centred at the foot of the window.
- **#539:** Reset prototype and Find threw on Home, because Home lends the picker out of the planner. They now find it by id.
- **#538:** At a glance as three cards with big pictures (Figma 388:6855), stacked on phones, picture left and text right on the desktop.
- **#537:** Home's stadium cards are a carousel on phones, linked to the map pins (the card in view marks its pin; a pin brings its card into view). Also removed four test screenshots committed by mistake in #528.
- **#536:** Read before you go, a masonry grid of dummy articles linking to `pages/rwc-article.html?a=<slug>`, which is not built; a tap says so on the card.
- **#535:** I have tickets on the open plan's match cards (both layouts share one card), with the ticket toast, left out when it would cover the button.
- **#534:** host city sheets lead with highlights of each area (copy supplied by the user, summarised); the sheet's lists run full width. Added a proposed `gap` field, `highlights`, to the data contract (§16). **Not yet confirmed by the user**: see open question 1.
- **#533:** Home's hero Plan your 3rd half button removed.
- **#532:** Home tab built from Figma 385:649 (see "The homepage" below).
- **#531:** the earlier version of this handover.

- **#528:** every date picker leads with the slider; the ± days chips removed; a Material-style activated handle with a 12/10 tooltip; your dates replace "Tournament 1 Oct to 13 Nov" under the slider and open the date fields; compact days toast ("Your days are now …", updates in place); every toast 90% opaque; no what-changed line under Undo and Reset; Clear all ends the picker caption's sentence; every picked team's matches dotted (interstate hollow); no days toast from the page's picker.
- **#529:** CLAUDE.md check 11 (no toast over the control in use); Undo and Reset centred; I have tickets on NSW match rows in place of the In NSW flag.
- **#530:** a toast when a ticket is marked or removed (row, match sheet, days sheet); an orange ring around I have tickets; check 11 extended to every new control; Where to watch for ticket-holders after an `/impeccable critique` (25/40): the ticketed match as one line above the carousel with See your match day, toast links that land on the change, Mark your ticket opening the sheet at the toggle, an interstate ticket's sheet leading with "You're in [city] for this one", focus after Not going after all, dead code removed. The critique is saved in `.impeccable/critique/`.

## Known quirks

- **Reduced motion:** the global `.cn-phone *` rule gives every element a 1ms transition, so a field in a sheet that's just opened is still `visibility: hidden` for that frame. Focus it after a short delay.
- **Redraws inside the sheet:** a drill replaces the sheet's body, so by the time a page-level click handler runs, the tapped element is no longer in the page. Page handlers must check `el.isConnected` and `!pm.contains(el)`, or they reopen the sheet from scratch. This has happened twice.
- **Focus after a redraw:** when the element that opened something has been redrawn, find its replacement:
  - `tpPlan.same()` for day cards;
  - the `pmOpenerEl` fallbacks in `closePm`.
  - A day filled from its ideas sheet loses Add ideas, so focus goes to the day's heading.
- **The lent picker:** while `#tp-at` is open, `#tp-util` and `#tp-picker` live in the sheet and a `.tp-at-hold` placeholder keeps their height on the page. Anything that looks the picker up by its place in the page (for example `.tp-pick > #tp-picker` in the desktop CSS) won't match while it's lent.
- **Hidden labels inside scrollers:** a visually-hidden span is absolutely positioned, so it is placed against the nearest positioned ancestor. Inside a horizontal scroller that isn't positioned, it can stretch a far-off panel and make the whole sheet scroll sideways (#545). Give any new scroller `position: relative`.
- **Tests start on Home:** Home is the default tab, so click the Plan tab (or open `?view=plan`) before testing the planner.
- **Date fields in headless Chromium** show mm/dd/yyyy (en-US); real phones in Australia show dd/mm/yyyy.
- **Test server:** a background `python3 -m http.server` is stopped by the session's background time limit; start it again when a test can't connect.
- **Two Vercel projects** deploy every push. The user hasn't decided whether to disconnect one.

## Where the build stands (checked 19 Nov evening)

- **Plan layouts:** both are in. `?plan=cards` (vertical day cards) is the default; `?plan=swipe` shows one card at a time; the tools panel switches between them.
- **Team cards:** the country name (with its flag) sits under the three-letter code, in the grid and, since 21 Nov, in the stacked hand too (arcs of five, 14 to 12px, fewer to an arc where the names need it).
- **Kick-offs in Sydney time:** not on the event line. It was dropped on 16 Nov to match the Figma reference; kick-off times elsewhere still say "Sydney time".
- **Pick your teams button on the first screen:** removed (planner hero, 16 Nov), and Home's hero has no button either (19 Nov). The hand of cards under "Plan your 3rd half" is the way in.
- **Kick-off of the opener:** 8:45pm Sydney time (was 9:00pm), also changed on `pages/rugby-world-cup.html` and `experiments.html`.

## Open questions for the user

1. **New, data contract:** #534 added `highlights` (§16 of `docs/product-data-contract.md`, a proposed `gap` field on venue records) without a recorded go-ahead. CLAUDE.md says to stop and ask before using a field outside the contract. Confirm, change or remove it.
2. **New, CLAUDE.md edits:** checks 7, 10, 11 and 12 were amended or added between 17 and 19 Nov (commits `e0977cb`, `3f073db`, `dd18721`, `26b51da` and `a185d3b`). If any wording went in without being shown first, the user may want to review it.
3. **New, Home:** the article page (`pages/rwc-article.html`) is not built. Drop goal shows the kick game (Stage 1, 21 Nov); Stages 2 to 5 are still to come.
4. **From the Where to watch critique, not chosen:** the fair venue rotation picks Wollongong and Newcastle venues for a Sydney match (the nearest fan zone was "used" on the interstate cards). Should proximity win on the night of a fan's own city match?
5. **At 320 wide:** on the Every NSW match card the wider I have tickets button wraps long names (New Zealand) to two lines.
6. **From #527, still unanswered:** the open plan's heading repeats "Your plan" from the bar; the end-of-page summary says "added" while the bar says "saved"; a dated save made with no team stays in the box after a team is picked, until days are set.
7. **Seen at 320 wide, predating these changes:** "Your matches (6)" wraps in low fidelity (check 6).
8. **The itinerary prototype** (`prototype-itinerary.html`) has its own date fields, not matched to the new picker, and no I have tickets button. The full-screen Follow day by day map card has no ticket button either. Ask before changing them.
9. **Section gaps:** 64px (`--sec-gap`) against the principles' 48px between families.
10. **CLAUDE.md tidy-up:** "9. Look, don't only measure" sits under Build notes instead of the numbered checks (still true after the #545 build note).
11. **Carried over, not raised since:** trip stops aren't links; the annotations are stale for the sheet work in #512 to #516; venue match counts for Adelaide and Townsville; the dashed Every NSW match icon; "Pick your team" / "Your teams" / "Add team" wording; the bar's counts and Tab order.

## The homepage (built 19 November, second session)

- **Which:** the **Home** tab of the Pick your team prototype, from Figma 385:649, in the prototype's own styles. It is now the tab the page opens on; `?view=plan` opens the planner. Links shared before this that expected the planner now open on Home.
- **Where:** markup in `#tp-home` (`prototype-pick-your-team.html`), script `concepts-home.js`, styles under "Home" in `shared.css`, the host city sheet as `city:` ids in `openPm` (`pmCity`, `tp.hosts`, `tp.hostMatches` in concepts-third-half.js).
- **One hand:** the capsule script lends `#tp-picker` to `#tp-home-hand` while Home shows (a comment node marks its planner place). `window.tpView` (`get`, `go`, `reveal`, `lend`); `goTo` reveals a section's tab first.
- **Placeholders:** the hero video, the Drop goal picture (the Figma reference is a real video game screenshot), FAQ answers, tickets link, transport line, consent wording, the footer, Where to stay in the host city sheet, and the At a glance cards' stand-in photos and bracketed copy.
- **Since the first build:** Read before you go (`#tp-home-reads`, dummy articles), At a glance as three cards, the stadium cards as a carousel on phones linked to the pins (`concepts-home.js`), highlights at the top of each host city sheet (`cnHostHighlights` in `concepts-fixtures.js`), and the desktop layout (full width, no rail, tabs in the header bar, the plan bar floating at the foot once a team is picked).
- **Not done yet:** Drop goal beyond Stage 1 (see below); the article page; day trips in the host city sheet are listed, not linked (a trip sheet needs a free stretch to fit into).

## Drop goal: the kick game (Stage 1, 21 November)

- **Which:** the Drop goal tab (`?view=kick`) shows the Third Half kick game in place of the being-built page, which is gone. Links ending `?view=kick`, and Home's Play now, now open the game.
- **Where:** the game is its own folder, `public/wireframes/drop-goal/` (`index.html`, `css/`, `js/`), copied from the package and still runnable on its own, with the package's README.md and CLAUDE.md beside it. Its rules still apply inside it: the blue-or-green skin rule, equal exposure (run `checkDistribution()` in the game's console after any change to physics, wind, routes, terrain or `PLAYER_MODEL`; every stop within about 8 to 12%), placeholder data, no logos, a single rigged SVG, no build step and the script load order.
- **How it is shown:** an iframe (`#tp-kick-frame` in `#tp-kick`), so none of the game's scripts load in the page. The capsule script sizes it to fill the screen under the capsule (`fitKick`); the page does not scroll on this tab and the game scrolls inside the frame. The plan bar steps aside, as before (`#tp-phone.is-kick`). On the desktop website it runs full width with no rail.
- **Changed in the game:** only the colour tools (Kit, Skin, Field, Import, Copy curated settings, Reset this team), folded into a closed Colour settings (temporary) disclosure under the team picker, to be removed later. Also one fix: the closed destination card's buttons stayed in the Tab order off screen (`.card`'s `display: flex` overrode `[hidden]`); it is now hidden once it has slid out.
- **Data:** the destination fields are §18 of the data contract, `gap`, from the game's `ROUTES` fixtures.
- **Stage 2 (21 Nov): Add to your plan.** The card's button (was + to plan) saves the place to Saved, not placed yet as kind `kick`, one save per place name, holding only §18 fields (name as the title, distance_km, route). Kick saves are never slotted onto a day (`tp.waiting()` is the saves that are; `tp.kicks()` the kick ones) and get their own line, Places from Drop goal stay here; plan a day there yourself. Confirmed on the card only: the action bar's first line names the latest change and Close becomes Save; no page toast (`addItem(it, true)`). The page and the game talk through `thk:ready`, `thk:save`, `thk:unsave` and `thk:saved` (drop-goal/README.md, Messages); every `save()` sends `thk:saved`, so Remove, Clear plan, Undo and Reset update the game's button.
- **Still to come:** Stage 3, the page's themes and the team already picked; Stages 4 and 5 as briefed. Open: the tab is called Drop goal but the game is a kick off a tee; the skin fallback for the 7 teams with no blue or green.

## Recommended next steps

1. Pull main (`origin/main`). Check whether this handover's PR has merged, and whether a parallel session has merged anything since.
2. Read CLAUDE.md (checks 7, 11 and 12 especially), this file and `.claude/skills/wireframe/SKILL.md`.
3. Raise open question 1 (the `highlights` field) before any more work on the host city sheets.
4. Ask the user what is next (Home, Drop goal Stage 2, the article page or the planner), then open with the scope check and knock-on list before building.
5. Raise open question 4 (venue proximity) only if the work touches Where to watch.
