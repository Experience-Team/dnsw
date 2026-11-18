# Session handover: Pick your team prototype

18 November 2026 (Sydney). Repo `Experience-Team/dnsw`, main at `2a26145`. **One PR is open: [#527](https://github.com/Experience-Team/dnsw/pull/527)** (save to Your plan without a team, Add team sheet, timeline renamed plan), a draft waiting for the user to review; this handover rides in it. #519 to #526 are merged. Pull main (or the PR branch, if #527 has not merged) before starting.

This replaces the 17 November handover. Its open questions are carried over below; none was raised again, so check with the user before reopening them.

## Ways of working

- **Branch:** use the branch your session is given. The last one was `claude/keen-meitner-a1dvtl`.
  - Once a PR has merged, restart the branch from main with `git fetch origin main && git checkout -B <branch> origin/main`, then push with `--force-with-lease`.
  - If you push after the user has merged, your commit misses the merge: put it on a fresh branch from main and open a new PR.
  - One commit per task, a draft PR, subscribe to it, and a 50-minute `send_later` safety net (delete it once the PR merges). Several small asks in a row can share one open PR; update its description each time.
  - The user marks the PR ready and merges it, often within minutes.
- **Previews:** only share links from the Vercel project `mopo123-gmailcoms-projects`, in chat and in PR descriptions, pointing at the page that changed.
  - The URL is `https://dnsw-git-<branch-slug>-mopo123-gmailcoms-projects.vercel.app/wireframes/prototype-pick-your-team.html?tools` (add `&theme=hifi` for high fidelity). For the last branch the slug was `claude-keen-meitner-a1dvtl`.
  - The second project, `moniquepompe-2020s-projects`, also deploys every push; its bot comments arrive as PR notifications. Its previews ask for sign-in, so never share them.
- **CLAUDE.md:** read it first. It now has **twelve** prototype interaction checks. New or changed this session:
  - **Check 7, amended:** before changing one instance of something that appears in several places, list every place and ask which to update; then do them all in one pass.
  - **Check 11, new:** a change that lands out of view is confirmed with one toast (content, behaviour, position rules).
  - **Check 12, new:** before building, say what else on the site (docs included) the change will touch, break or contradict, and add more at hand-over.
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
  - each date picker: the page (`#tp-ask`), the days sheet and the open plan's days line, slider first (activated handle with a 12/10 tooltip while dragged), your dates under it as the button that opens the fields (the ± chips went on 18 Nov);
  - the full-screen map card, and the day-by-day card;
  - Getting there and back, then Add where you're staying, then Done.
- **Figma:** file `LwBKfIftpu8erI6WGOi4W1` (Rugby World Cup). Call `create_session` first.

## Where things are

- **`public/wireframes/prototype-pick-your-team.html`:** the page.
  - It holds the phone markup and the stacked sheets over the open plan: `#tp-ss` Save & share, `#tp-ts` Your teams (a list), `#tp-at` Add team (lends the page picker), `#tp-cc` Clear your plan?
  - It also holds the annotations array.
  - Page order in the picker section: Find row, the hand, its caption and Clear all, then Your days in NSW (`#tp-ask`, since 18 Nov), then the tabs (Your matches, All matches) and the chosen tab's content; the map (`#tp-ov`) follows All matches.
- **`concepts-teams.js`:**
  - the fan and picks;
  - the plan bar and open plan (code names `tp-tl*`; the bar drags, and a tap toggles it). With no team the bar reads No matches yet or N saved, with Add team (`#tp-tl-addteam`);
  - `addItem`: with no team and no days a dated save is held (`fixed` keeps its date, `unplaced: true`); the first save while the bar is out of sight gets a toast;
  - `atOpen`: the Add team sheet, which moves `#tp-util` and `#tp-picker` into `#tp-at` and back on close;
  - toasts: `toast`, `toastPlace` (16px from the bottom, 24px on desktop, 12px above anything pinned);
  - the desktop layout (`wide()`, `railFollow()`);
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

## Done this session (#519 to #527)

- **#519:** the 17 November handover.
- **#520:** the viewer: Open the phone view in a new tab beside Copy link; a tidier desktop layout of the viewer.
- **#521:** Pick your team as a desktop website (1024px and wider: header to results, a Your plan rail, sheets as centred modals, two-up Where to watch); critique fixes; build-only items on `?tools` only; annotation badges and notes that find each other; 36px tabs and a 48px stage gap.
- **#522:** Reset prototype and Open in desktop as buttons beside the phone (the panel buttons went).
- **#523:** toasts that say what a change did elsewhere on the page (days set or cleared, base, plan adds and removes, ticket changes), each with at most one link.
- **#524:** a temporary swipe pill on the day by day map.
- **#525:** toast positioning (from the bottom of the screen, above whatever is pinned), CLAUDE.md check 11, and the opening match kick-off at 8:45pm Sydney time (Australia v Hong Kong China, Perth Stadium, Fri 1 Oct 2027).
- **#526:**
  - Reset and Open in desktop moved to the left of the phone (on the stacked page they stay on its right);
  - "Around the NSW matches" with no team, "Around your matches" once there are matches;
  - the Event details tab renamed Home;
  - Your days in NSW moved under the team picker (Figma 372:3060): heading "Your days in NSW (optional)", one note line, 36px date fields, no box;
  - every date picker (the page, the days sheet, the open plan's days line) matches it, the days sheet gained First and Last day fields, and all three have the ± 1, 2, 3, 7 and 14 days chips once there are matches.
- **#527 (open, draft):** saving to Your plan without a team.
  - With no team and no days, every save waits in the open plan's dashed Saved, not placed yet box (dated ones show their date), which asks for a team (Add team) and days (Set your days). Setting days places them, team or not; picking a team alone moves nothing.
  - The plan bar with no team: Your plan, No matches yet or N saved, with Add team.
  - Add team opens `#tp-at`, which lends the page's own picker (Find, Grid / Fan, Plays in NSW, the hand) and gives it back.
  - The first save while the bar is out of sight gets "Saved to your plan" with Open your plan; existing add toasts are kept.
  - Every user-facing "timeline" is now "plan", CLAUDE.md included. Check 7 amended and check 12 added.
  - Decisions the user's "yes" covered: no route cards with no team (no route to follow); dated saves wait in the box too; the same box with a team but no days asks only for days; existing toasts kept; the one-day first look kept in Where to watch and Around.

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

1. **From #527, flagged at hand-over (check 12):**
   - the open plan's heading now reads "Your plan", the same as the bar right above it; a different heading would avoid the repeat;
   - the end-of-page summary (Your plan so far) still says "1 thing added" while the bar says "saved";
   - a dated save made with no team stays in the box after a team is picked, until days are set, while one made after picking a team goes straight onto its date.
2. **Seen at 320 wide, not fixed (they predate this session's changes):**
   - the date fields' placeholder runs under the calendar icon;
   - "Your matches (6)" wraps onto two lines in low fidelity, against check 6.
3. **The itinerary prototype** (`prototype-itinerary.html`) has its own First and Last day fields, not matched to the new date picker. It's a separate page; ask before changing it.
4. **Section gaps:** every main section still uses 64px (`--sec-gap`); the experience principles say 48px between families. Move them all to 48px?
5. **Trip stops** in a trip sheet aren't links (no details beyond name, type and suburb). A short stop level anyway?
6. **CLAUDE.md tidy-up:** "9. Look, don't only measure" sits under Build notes instead of the numbered checks. (The repeated line in check 7 was fixed in #527.)
7. **The annotations array** is still stale for the sheet work in #512 to #516.
8. **Carried over from 14 November, not raised since:** venue match counts for Adelaide and Townsville (the fixtures and `cnVenues` disagree); the dashed Every NSW match icon; wording consistency ("Pick your team", "Your teams", "Add or change teams", now also "Add team"); the bar counts, where Save & share sits, and the bar's Tab order.

## Recommended next steps

1. Check whether #527 has merged. If not, wait for the user's review; if it has, restart the branch from main.
2. Read CLAUDE.md, checks 7, 11 and 12 especially, and this file.
3. Ask about open question 1 first: it's the follow-up the user is most likely to want.
4. For any new brief, open with the scope check and knock-on list (checks 7 and 12) before building.
