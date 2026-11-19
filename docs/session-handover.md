# Session handover: Pick your team prototype, then the homepage

19 November 2026 (Sydney). Repo `Experience-Team/dnsw`, main at `3bad645`. **No PR is open.** #527 to #530 are merged; this handover rides in its own PR. Pull main before starting.

The user is moving on to **the homepage** in a new session. See "Starting on the homepage" below. This replaces the 18 November handover; its open questions are carried over, trimmed to what still stands.

## Ways of working

- **Branch:** use the branch your session is given. The last one was `claude/charming-carson-1bjb9u`.
  - Once a PR has merged, restart the branch from main with `git fetch origin main && git checkout -B <branch> origin/main`, then push with `--force-with-lease`.
  - If you push after the user has merged, your commit misses the merge: put it on a fresh branch from main and open a new PR.
  - One commit per task, a draft PR, subscribe to it, and a 50-minute `send_later` safety net (delete it once the PR merges). Several small asks in a row can share one open PR; update its description each time.
  - The Vercel bot posts several comment edits per push (two projects, building then ready). Only the mopo123 project's link is shareable; nothing in those comments needs action.
  - The user marks the PR ready and merges it, often within minutes.
- **Previews:** only share links from the Vercel project `mopo123-gmailcoms-projects`, in chat and in PR descriptions, pointing at the page that changed.
  - The URL is `https://dnsw-git-<branch-slug>-mopo123-gmailcoms-projects.vercel.app/wireframes/prototype-pick-your-team.html?tools` (add `&theme=hifi` for high fidelity). **Long branch names are shortened**: copy the slug from the Vercel bot's comment on the PR rather than building it. For `claude/charming-carson-1bjb9u` it was `claude-charming-cars-cf7f46`.
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

## Done this session (#528 to #530)

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
- **Date fields in headless Chromium** show mm/dd/yyyy (en-US); real phones in Australia show dd/mm/yyyy.
- **Test server:** a background `python3 -m http.server` is stopped by the session's background time limit; start it again when a test can't connect.
- **Two Vercel projects** deploy every push. The user hasn't decided whether to disconnect one.

## Open questions for the user

1. **From the Where to watch critique, not chosen:** the fair venue rotation picks Wollongong and Newcastle venues for a Sydney match (the nearest fan zone was "used" on the interstate cards). Should proximity win on the night of a fan's own city match?
2. **At 320 wide:** on the Every NSW match card the wider I have tickets button wraps long names (New Zealand) to two lines.
3. **From #527, still unanswered:** the open plan's heading repeats "Your plan" from the bar; the end-of-page summary says "added" while the bar says "saved"; a dated save made with no team stays in the box after a team is picked, until days are set.
4. **Seen at 320 wide, predating these changes:** "Your matches (6)" wraps in low fidelity (check 6).
5. **The itinerary prototype** (`prototype-itinerary.html`) has its own date fields, not matched to the new picker. Ask before changing it.
6. **Section gaps:** 64px (`--sec-gap`) against the principles' 48px between families.
7. **CLAUDE.md tidy-up:** "9. Look, don't only measure" sits under Build notes instead of the numbered checks.
8. **Carried over, not raised since:** trip stops aren't links; the annotations are stale for the sheet work in #512 to #516; venue match counts for Adelaide and Townsville; the dashed Every NSW match icon; "Pick your team" / "Your teams" / "Add team" wording; the bar's counts and Tab order.

## The homepage (built 19 November, second session)

- **Which:** the **Home** tab of the Pick your team prototype, from Figma 385:649, in the prototype's own styles. It is now the tab the page opens on; `?view=plan` opens the planner. Links shared before this that expected the planner now open on Home.
- **Where:** markup in `#tp-home` (`prototype-pick-your-team.html`), script `concepts-home.js`, styles under "Home" in `shared.css`, the host city sheet as `city:` ids in `openPm` (`pmCity`, `tp.hosts`, `tp.hostMatches` in concepts-third-half.js).
- **One hand:** the capsule script lends `#tp-picker` to `#tp-home-hand` while Home shows (a comment node marks its planner place). `window.tpView` (`get`, `go`, `reveal`, `lend`); `goTo` reveals a section's tab first.
- **Placeholders:** the hero video, the Drop goal picture (the Figma reference is a real video game screenshot), FAQ answers, tickets link, transport line, consent wording, the footer, Where to stay in the host city sheet.
- **Not done yet:** Drop goal itself; day trips in the host city sheet are listed, not linked (a trip sheet needs a free stretch to fit into).

## Recommended next steps

1. Pull main. Check whether this handover's PR has merged.
2. Read CLAUDE.md (checks 7, 11 and 12 especially), this file and `.claude/skills/wireframe/SKILL.md`.
3. Ask the user which homepage they mean and what the brief is, then open with the scope check and knock-on list before building.
4. Raise open question 1 (venue proximity) only if the homepage work touches Where to watch.
