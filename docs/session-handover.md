# Session handover: Pick your team prototype

17 November 2026 (Sydney). Repo `Experience-Team/dnsw`, main at `ac7327e`. No PR from this work stream is open; the last ones, #506 to #516, are all merged. Another session (branch `claude/zen-bell-nn183f`) has been working on the wireframes index (`public/wireframes/index.html`): #515, #517 and #518. Pull main before starting.

This replaces the 14 November handover. Its open questions are carried over below, but none was raised again here, so check with the user before reopening any of them.

## Ways of working

- **Branch:** use the branch your session is given. The previous one was `claude/magical-turing-x6u021`.
  - Once a PR has merged, restart the branch from main with `git fetch origin main && git checkout -B <branch> origin/main`, then push with `--force-with-lease`. That's safe, because the branch only holds history that's already merged.
  - If you push after the user has already merged, your commit misses the merge: put it on a fresh branch from main and open a new PR (this happened with #512 and #513).
  - Make one commit per task, open a draft PR and subscribe to it.
  - Set a 50-minute `send_later` safety net, and delete it once the PR merges.
  - The user marks the PR ready and merges it, often within minutes.
- **Previews:** only share links from the Vercel project `mopo123-gmailcoms-projects`, in chat and in PR descriptions, pointing at the page that changed.
  - The URL is `https://dnsw-git-<branch-slug>-mopo123-gmailcoms-projects.vercel.app/wireframes/prototype-pick-your-team.html?tools&theme=hifi`. For the last branch the slug was `claude-magical-turin-aeb152`.
  - High fidelity needs `?tools&theme=hifi`; without `?tools` the theme switch is ignored.
  - A second project, `moniquepompe-2020s-projects`, also deploys every push, and its bot comments arrive as PR notifications. Its previews ask for sign-in, so never share them.
- **CLAUDE.md:** read it first. It now has **ten** prototype interaction checks. The newest is check 10, one rule for more detail inside a sheet:
  - inside a sheet, always drill down;
  - stack only over a full-screen layer;
  - the controls and motion that go with both;
  - grabbers that work by tap and drag;
  - a sheet that holds its height while drilling down.
- **Standing flags:** when the user says "you missed X" or gives a rule, work out the general principle and fit it into an existing check. **Show the proposed wording, and where it goes, before editing CLAUDE.md.** The fix itself doesn't have to wait.
- **Stop and show:** when a brief ends with stop and show, don't commit until the user has answered every question raised.
- **Before handing over** (check 9): go through the brief line by line and say what's done, what isn't and why, and what's next.
- **Build log:** add one row per change to the table at the end of `.claude/skills/wireframe/SKILL.md`.
- **Annotations:** the annotations array in `prototype-pick-your-team.html` should be updated with every behaviour change. It wasn't updated for the sheet work in #512 to #516, so it's stale there (see Open questions).
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
  - Reset prototype in the panel, or `?reset`, clears it.
- **Useful handles:**
  - `window.tpPicker` (`tp`): `openTimeline()`, `openSheet(id, opener)` (a stacked sheet over the timeline), `match(key)`, `state`.
  - The status line is `#tp-live`.
  - The sheet is `#tp-pm`: its back arrow is `[data-pm-back]` and its cross is `[data-pm-close]`.
- **Test scripts:** the last session's scripts lived in its scratchpad and are gone. These are the patterns worth rebuilding:
  - a walk of every sheet: Where to watch, then a venue, then Escape, the back arrow, a short and a long drag, the cross and the dark area;
  - a match sheet, then a venue;
  - the timeline, then Add ideas, then an idea;
  - the full-screen map card, and the day-by-day card;
  - Getting there and back, then Add where you're staying, then Done.
- **Figma:** file `LwBKfIftpu8erI6WGOi4W1` (Rugby World Cup). Call `create_session` first.

## Where things are

- **`public/wireframes/prototype-pick-your-team.html`:** the page.
  - It holds the phone markup and the stacked sheets over the timeline: `#tp-ss` Save & share, `#tp-ts` Your teams, `#tp-cc` Clear your timeline?
  - It also holds the annotations array.
  - Page order under the picker: the tabs (Your matches, All matches), then the chosen tab's content, then Your days in NSW (`#tp-ask`), then the map (`#tp-ov`).
- **`concepts-teams.js`:**
  - the fan and picks;
  - the timeline bar and sheet (the bar drags, and a tap toggles it);
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
  - The ideas list (`tlIdeas`) is lent to the sheet while it's open (`tlIdeasReturn` takes it back). An idea and Next free day are drill levels.
- **`concepts-map.js`:** the overview map, "Around the matches in NSW".
  - It holds the route cards, the pins and full screen (`.tp-ov-map.is-full`).
  - It also holds Follow day by day, full screen (`.tp-mapfs`), with its own card panel and grabber.
- **`concepts-plan.js`:** the day cards in the timeline (`?plan=cards`, the default, or `?plan=swipe`). `tpPlan.same(el)` finds an opener again after a redraw.
- **`pv-device.js`:** paints library images in high fidelity, from `data-img` keys (`imgKey(title)` in third-half).
- **`shared.css`:** everything for this page is under `.tp-*`. Page section spacing comes from `--sec-gap` (64px). Your days overrides it to 48px.

## Done this session (#506 to #516)

- **#506:** an RWC section on the wireframes index.
- **#507:** day cards replace the timeline strip.
- **#508:** a shorter timeline top, and "Kick goal" renamed "Drop goal".
- **#509:** the hero's closing line became the team picker heading.
- **#510:** route cards over the map, Skip the map, and Your days placed above the map.
- **#511:** the full-screen map and its cards stay in sync.
- **#512 and #513:** links inside sheets work. These first used a second stacked sheet, which #514 replaced.
- **#514:** one rule for more detail, now CLAUDE.md check 10.
  - **Drill-down everywhere inside sheets:**
    - venues in Where to watch and in match sheets;
    - knockout matches;
    - ideas and Next free day;
    - Also on your plan;
    - Add where you're staying.
  - **Stacking only over the timeline and the full-screen maps**, where the map steps back.
  - **Venue rows** have thumbnails: 48px in sheets, 40px on the page's narrow cards.
  - **Map cards for interstate stops** open the venue.
  - **Every grabber** works by tap and drag.
  - **The sheet holds its height** while drilling down.
  - **The All matches list** sits right under its tab.
- **#516:** 48px from either match tab to Your days, and 48px from All matches (with no team picked) to the map's rule. Check 10 gained the grabber and sheet-height rules.

## Known quirks

- **Reduced motion:** the global `.cn-phone *` rule gives every element a 1ms transition, so a field in a sheet that's just opened is still `visibility: hidden` for that frame. Focus it after a short delay.
- **Redraws inside the sheet:** a drill replaces the sheet's body, so by the time a page-level click handler runs, the tapped element is no longer in the page. Page handlers must check `el.isConnected` and `!pm.contains(el)`, or they reopen the sheet from scratch. This has happened twice.
- **Focus after a redraw:** when the element that opened something has been redrawn, find its replacement:
  - `tpPlan.same()` for day cards;
  - the `pmOpenerEl` fallbacks in `closePm`.
  - A day filled from its ideas sheet loses Add ideas, so focus goes to the day's heading.
- **Two Vercel projects** deploy every push. The user hasn't decided whether to disconnect one.

## Open questions for the user

1. **Section gaps:** every main section except Your days still uses 64px (`--sec-gap`), for example Your days to the map. The experience principles say 48px between families. Should they all move to 48px?
2. **Trip stops** in a trip sheet aren't links. They have no details beyond name, type and suburb, so a drill level would be thin. Does the user want a short stop level anyway?
3. **CLAUDE.md tidy-ups**, offered but not answered:
   - check 7 repeats the line "dates, not only the prompts";
   - "9. Look, don't only measure" sits under Build notes instead of the numbered checks.
4. **The annotations array** is stale for the sheet work (#512 to #516). Update it, or ask whether it's still wanted.
5. **Carried over from 14 November, not raised since:**
   - venue match counts for Adelaide and Townsville (the fixtures and `cnVenues` disagree);
   - the dashed Every NSW match icon;
   - wording consistency ("Pick your team", "Your teams", "Add or change teams");
   - the bar counts, where Save & share sits, and the bar's Tab order.

## Recommended next steps

1. Pull main, read CLAUDE.md (check 10 especially) and this file.
2. Ask the user about open questions 1 and 4. Both are small, and they decide the rhythm and the docs.
3. Rebuild a sheet walk-through script before touching `concepts-third-half.js`. The drill-down, focus return and height lock are easy to break.
