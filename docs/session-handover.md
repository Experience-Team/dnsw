# Session handover: Pick your team prototype, Home tab and planner

22 November 2026 (Sydney), evening, updated after #591. Repo `Experience-Team/dnsw`, main at `cd143a9` (the merge of #590, after #591). **No PR is open** apart from this update's own. #579 to #591 are merged. Pull main before starting: `git fetch origin main`. A local `main` can be days behind `origin/main`, so always compare against `origin/main`.

**The next session creates more prototype options.** Read "Prototype options: how they work" below first: each option is its own tab in the viewer, the same page with a flag (Option B is `?flow=a`, #593; the main prototype is Option A). Compare options (#587) was removed on 23 Nov at the user's request, so each tab shows one phone.

This replaces the 22 November morning handover (#578). Since then, two sessions worked in parallel:
- **This session** (`claude/gallant-cori-aajo32`): real destination data from the user's spreadsheet for Drop goal and the free-day ideas (#582), business names trimmed from every summary (#583), article pages for Read before you go with a Quick answers block for SEO and AEO (#583), the Leave the car at home card's line and link (#585, #588), and pictures between paragraphs in the articles (#589).
- **The other session** (`claude/adoring-allen-rxwblh`): a Reset icon in the header (#579), a reload stays on its tab (#580), Skip the map on phones only (#581), a new slogan and Save & share ordered by device (#584), the In NSW pill on every NSW match (#586), marker tooltips plus **Compare options** in the tools viewer (#587), and Save & share rebuilt as a list (#591, which replaces #584's device ordering).

See "Done on 22 November, afternoon" below. The earlier sections are kept for reference.

## Ways of working

- **Branch:** use the branch your session is given. On 20 and 21 Nov two sessions worked in parallel, on `claude/loving-hamilton-hbh1fu` (planner, round 3 brief) and `claude/eloquent-cray-olixyv` (the kick game, Drop goal; sheet rules). Expect the same: pull main before each task, as the other session may have merged since. On 21 Nov the user (or GitHub's Update branch) merged main into an open PR's branch; fetch before pushing.
  - Once a PR has merged, restart the branch from main with `git fetch origin main && git checkout -B <branch> origin/main`, then push with `--force-with-lease`.
  - If you push after the user has merged, your commit misses the merge: put it on a fresh branch from main and open a new PR.
  - One commit per task, a draft PR, subscribe to it, and a 50-minute `send_later` safety net (delete it once the PR merges). Several small asks in a row can share one open PR; update its description each time.
  - The Vercel bot posts several comment edits per push (two projects, building then ready). Only the mopo123 project's link is shareable; nothing in those comments needs action.
  - The user marks the PR ready and merges it, often within minutes.
- **Previews:** only share links from the Vercel project `mopo123-gmailcoms-projects`, in chat and in PR descriptions, pointing at the page that changed.
  - The URL is `https://dnsw-git-<branch-slug>-mopo123-gmailcoms-projects.vercel.app/wireframes/prototype-pick-your-team.html`. It opens **Home** in high fidelity with every side control (since 23 Nov there is no separate low fidelity address; `?tools` is still accepted but changes nothing, and `?theme=wireframe` gives low fidelity). Add `?view=plan` for the planner or `?view=kick` for Play (once Drop goal), and point each link at the tab that changed. **Long branch names are shortened**: copy the slug from the Vercel bot's comment on the PR rather than building it. For `claude/charming-carson-1bjb9u` it was `claude-charming-cars-cf7f46`.
  - The second project, `moniquepompe-2020s-projects`, also deploys every push; its bot comments arrive as PR notifications. Its previews ask for sign-in, so never share them.
- **Stop hook:** a hook asks to commit and push whenever the tree has changes. During a stop and show, don't: say why (CLAUDE.md, "A stop means stop") and wait for the user's answers.
- **"As you choose":** the user often answers open questions this way. Take it as approval of your stated recommendations, including any CLAUDE.md wording you showed, and say back what you took it to cover.
- **CLAUDE.md:** read it first. It has **twelve** prototype interaction checks. On 20 and 21 Nov check 10 gained "Changes say they're kept" (a Save bar in sheets where several changes build up) and "A tap outside closes it" (four exceptions), and check 6 a faint top rule on anything pinned to the bottom. Earlier, check 11 (toasts) grew:
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

## Prototype options: how they work (for the next session)

- **Where options live.** The prototype is one page, `prototype-pick-your-team.html`. An option is a flag that changes part of it, so every option stays the real, working prototype rather than a copy.
- **Flags in the address.** A script in the page's `<head>` reads the address before anything draws and sets an attribute on `<html>`. For example `?slogan=b` sets `data-slogan="b"` (line 35), and `?flow=a` sets `data-flow` (Option B). CSS and scripts then show one version or the other, for example `:root:not([data-slogan="b"]) .tp-slogan--b { display: none; }` in `shared.css`. Theme works the same way (`?theme=hifi`, only with `?tools`).
- **Switches in the tools panel.** Test switches sit in the viewer's left panel, in their own group (none at the moment: the stacked hand became the only hand of cards on 23 Nov). Each changes the same attribute as its address flag. Label a test switch "(test)".
- **Options are tabs (23 Nov).** Compare options (#587, framed phones beside the main one) and the empty dashed spare frame were removed at the user's request, so each tab shows one phone. The page's `<head>` clears what Compare options saved in a browser (`pv-compare`, `opt-a:` to `opt-c:`).
- **To add an option:**
  1. Agree the scope first (CLAUDE.md checks 7 and 12): which part of the page the option changes, and everywhere that part appears.
  2. Pick a short flag name and values, for example `hero=a|b`. Read it in the `<head>` script beside `slogan`, and set `data-hero` on `<html>`.
  3. Build the alternative beside the current one, switched by the attribute. Keep the default as it is today, so existing links don't change (CLAUDE.md "Previews": say which links behave differently, if any).
  4. Give it a tab: add it to `.pv-tabs` with `data-flow-tab` (as Option B), and to the `<head>` storage script if it should keep its own saved state. If it needs a switch too, add one to the tools panel like the existing tests.
  5. Add an annotation for the option ("TEST: …"), a build log row, and say in the PR how to see each version (for example `?hero=b`).
  6. Check every option in both themes at 390 and 320.
- **Option B (23 Nov, `?flow=a`, #593; first named Option A):** its own tab in the viewer (the user's call). Same page; `data-flow="a"` on `<html>`; its own saved state under `flow-a:` (the `<head>` storage script), viewer settings (theme, Annotations) shared. In the planner a pick from the hand glides to Your matches with the new card (`flowScroll`), and `#tp-more` (Add more teams, which opens `#tp-at`, then `#tp-ask`) sits under the cards. The main prototype's tab is named Option A (renamed from Pick your team on 23 Nov, user's call); the address stays `?tools`, and Option B stays `?flow=a`. A later Option C would follow the same pattern: a new `flow=` value and a tab.
- **Option B, no tabs (23 Nov):** All matches (`#tp-all`) moves to Home after Where the matches are (`tp-home-sec is-home`, done in concepts-teams.js once `allSec` is found), the planner's tabs stay hidden and Your matches is an h3 heading (`#tp-yours-title`, the counts in the line under it), and the map follows `#tp-pick` (concepts-map.js). With no team, the planner shows the hand, then Your days on its own with a no-team line (`setDaysWhyNoTeam`; `renderAsk` shows it in Option B whatever `tp.own()` says), then the map; Add more teams appears only after a pick (user's calls).
- **Tab names:** the viewer's tabs read Option A (the main prototype) and Option B (`?flow=a`). The panel heading reads Pick your team: Option A or Option B.
- **Other prototypes.** The viewer's top tabs (`.pv-tabs`) list the prototypes: Option A (the main prototype), Option B (`?flow=a`) and Flow chart (`flow-chart.html`, 23 Nov; it replaced the "[next] prototype" placeholder). Flow chart is its own page with the same title and tabs along the top and no left panel; it shows `flow-chart-planner.html` in a frame filling `#pv-chart`, with Open on its own. That chart (23 Nov) maps the planner and the parts of Home that touch it, Option A and Option B, made with the flowchart skill (`.claude/skills/flowchart`) from the code. Its "Every rule" node holds the full rule list per stage, and "Loose ends" lists what looked unfinished. It is a snapshot: after a change to the planner, regenerate it from the skill rather than editing the HTML by hand. The skill's linter needs `scripts/package.json` (CommonJS) because this repo's `package.json` is an ES module. The skill's template has three local changes (listed in its `SOURCE.md`) so groups can link step to step and a loop can be drawn. Reviewed on 23 Nov: decisions name their answers in the boxes they lead to, optional steps branch and rejoin, the redraw loop runs Saved state → Redraw everything → Home & Play, and no arrow says something the text does not. A new prototype gets a tab of its own in both pages' `.pv-tabs`.
- **Ask the user first** whether "more prototype options" means flags on this page (above), new screens or flows, or another prototype tab.

## Running and testing

- **Serve:** `cd public && python3 -m http.server 8123`, then open `/wireframes/prototype-pick-your-team.html?phone` (high fidelity; add `&theme=wireframe` for low fidelity).
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
  - each date picker: the page (`#tp-ask`) and the days sheet (the open plan has no slider since 22 Nov, E3: its days line opens the sheet): slider first (activated handle with a 12/10 tooltip while dragged), your dates under it as the button that opens the fields, Undo and Reset centred; no toast from the page's picker;
  - tickets: Wales picked, I have tickets on its Sat 16 Oct row (`[data-ticket]`), the toast and its link, Where to watch's line above the carousel ("You're at [match]", the match name opens the match sheet, where I have a ticket undoes it), See your match day, then an interstate ticket from a match sheet and its Watching in NSW instead?. Not going after all? was removed on 21 Nov;
  - placeholders: with Annotations off (`localStorage['tp-annotations'] = 'off'`) no placeholder, dead link or bracketed stand-in text may show anywhere; a scan of every screen's text for `Placeholder`, `Not linked yet`, `[`, `to come`, `to be confirmed`, `pool`, `knockout`, `Drop goal` is the quickest check;
  - the full-screen map card, and the day-by-day card;
  - Getting there and back, then Add where you're staying, then Done.
- **Figma:** file `LwBKfIftpu8erI6WGOi4W1` (Rugby World Cup). Call `create_session` first.

## Where things are

- **`public/wireframes/prototype-pick-your-team.html`:** the page.
  - It holds the phone markup and the stacked sheets over the open plan: `#tp-ss` Save & share (a list since #591, see below), `#tp-ts` Your teams (a list), `#tp-at` Add team (lends the page picker), `#tp-cc` Clear your plan?
  - It also holds the annotations array.
  - Page order in the picker section: Find row, the hand, its caption (Clear all now ends the caption's sentence, `capClear()` in teams), then Your days in NSW (`#tp-ask`, since 18 Nov), then the tabs (Your matches, All matches) and the chosen tab's content; the map (`#tp-ov`) follows All matches.
- **`concepts-words.js` (new, 21 Nov):** every visitor-facing string added or changed by the round 3 brief, in one block (`window.TP_WORDS`), so the user can approve or change them in one place. Each entry is a placeholder until approved. It also swaps the fixtures' Pool A to F to Group A to F in what the phone shows (a MutationObserver on `#tp-phone`, text and aria-labels only, never data or ids). Loaded before concepts-teams.js. Add any new round 3 string here.
- **`concepts-destinations.js` (22 Nov):** `window.cnDestinations`, 35 real towns for the free-day ideas (data contract §19, gap), generated from the user's spreadsheet `sydney-towns-aeo.xlsx` by `tools/gen-destinations.py`. Each has summary, travel line, getting there, official URL and who it suits. Loaded before `concepts-fixtures.js`, which builds `cnFreeIdeas` from it (Sydney Opera House is the one idea with no row and keeps its placeholders).
- **`tools/gen-destinations.py` (22 Nov):** regenerates `concepts-destinations.js` and `drop-goal/js/summaries.js` from the spreadsheet (`python3 public/wireframes/tools/gen-destinations.py path/to/sydney-towns-aeo.xlsx`, needs openpyxl). The spreadsheet itself is not in the repo. Its `TRIM` list removes business names from summaries (user's call); keep edits there, not in the generated files.
- **`concepts-articles.js` (22 Nov):** `window.TP_ARTICLES`, the six Read before you go articles: tile (category, picture, shape), dek, body (`h` heading, `p` paragraph, `i` picture as `[i, key, what it shows]`), then the Quick answers data (`q`, `answer`, `facts`, `faqs`, `places`). Read times are worked out from the page. Dummy editorial content; no business named; not in the data contract.
- **`concepts-home.js`, articles (22 Nov):** renders the tiles and the article view (`#tp-article`, `.tp-home.is-reading`), routes `?a=<slug>` with history, sets the meta description and JSON-LD while an article shows, and returns focus to whatever opened it (`backEl`). `window.tpArticle` (`open`, `close`, `get`).
- **`pv-compare.js`:** removed on 23 Nov with Compare options (see "Prototype options").
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
  - `renderAsk` (the page date picker) and `pmDays` (the days sheet) lead with the slider; `renderDaysLine` (the open plan's) is one line since 22 Nov (E3): Your days in NSW: not set. with Set your days, or Your days: [range] · Change, both opening the days sheet. The two sliders (matches dotted) and share `rangeEnds` (your dates between 29 Sep and 15 Nov, a button, kept live by `outSet`), `tipSet` (the handle tooltip) and `typeFields`: the dates button shows 36px First and Last day fields, open or closed per picker in `typeOpen` (the sheet starts closed). `flexChips` and the ± days chips were removed on 18 Nov.
  - `thirdName()`: Around your matches, or Around the NSW matches with no team.
  - The ideas list (`tlIdeas`) is lent to the sheet while it's open (`tlIdeasReturn` takes it back). An idea and Next free day are drill levels.
- **`concepts-map.js`:** the overview map, "Around the matches in NSW".
  - It holds the route cards, the pins and full screen (`.tp-ov-map.is-full`).
  - It also holds Follow day by day, full screen (`.tp-mapfs`), with its own card panel and grabber.
- **`concepts-plan.js`:** the day cards in the open plan, stacked. `tpPlan.same(el)` finds an opener again after a redraw.
- **`pv-device.js`:** paints library images in high fidelity, from `data-img` keys (`imgKey(title)` in third-half).
- **`shared.css`:** everything for this page is under `.tp-*`. Page section spacing comes from `--sec-gap` (64px). Your days now sits inside the picker, 24px under Clear all, with no box. The desktop layout is under `@media (min-width:1024px)`, scoped to `.pv-device #tp-phone`.

## Round 3 brief: done (stages A to D merged, Final list given 21 Nov)

The user's brief of 21 Nov, "Change the current build. Do not rebuild anything", runs in four stages, in order. **After each stage, stop and show, and don't start the next until the user says go.** Its rules for every stage:
- Don't invent content. Placeholder wording goes in `concepts-words.js`; list every string added.
- A government site: nothing favours one business, so use the fair rotation for any list of places.
- Update the annotations and CLAUDE.md checks a stage touches, and list each edit.
- Check at 390 and 320, with Annotations on and off.
- Keep the plan bar, sheets, day cards and strip, match sheet, I have tickets, the hand of cards, the map, Where to watch, and the date slider's place under the team picker. Leave anything not named untouched.

**Stage A (merged, #558):**
- The plan bar's pill reads Your plan or Your plan (3), with an arrow.
- With Annotations off, every placeholder, dead link and bracketed line is hidden (CSS on `#tp-stage:not(.has-notes)`, the `.tp-placeholder` class and others at the end of `shared.css`).
- Wording swaps: Check the official timetable; group matches; the later rounds; 9 group + 8 later-round matches; Group A to F; Image of … for stand-in photos.
- The kick game is called Drop goal, shown as Play on phones (22 Nov, user's call; on 21 Nov it had been renamed Play everywhere). On phones the capsule and the two headings (the tab's h2 and Home's section) say Play; on the desktop website the capsule says Play Drop Goal and the headings Drop Goal. The section, frame and Home's still are named Drop goal for screen readers; the plan's and the shared plan's lines say Drop goal. `?view=kick` is the route.
- No tickets marked yet and Not going after all? are removed.

**Stage B (merged, #561):**
- One line above the dates on the page, in the plan and in the days sheet: "Set your days to see ideas for the rest of your trip."
- With no days set, a dashed card under the last match day: "Staying after your last match?" with Set your days, which opens the days sheet.
- The user first said keep the plan's own slider (B1 had asked to remove it); round 5 E3 (22 Nov) then removed it, so the B2 line now shows on the page and in the days sheet only. The days sheet keeps Use these dates.

**Stage C (merged, #566):** built as below: a Not going to the match? group, tagged Evening, on every NSW match day (only places with opening hours, open after 5pm). The brief as given: Match night for someone not going (F-029). For the second round running, a tester whose partner was at the match found the match-day block was all about getting there and had nothing for her evening. This is the one finding still rated Blocks.
- C1. In the match-day block (the day card's "Before the match", "After the final whistle" and "Near the stadium" labels), add a third label for people who are not going. Placeholder label: "Not going to the match?".
  - It shows evening ideas in the city of the match, using the fair rotation rule, and only ideas open after 5pm on that day.
  - If the data has no opening hours for an idea, don't show it under this label.
- C2. Use the ideas the build already has (dummy content, marked as such). Don't invent new places. If fewer than three are open in the evening, show what exists and list the real content needed (fields: type, opening hours, area, price).
- C3. No new question up front. Don't change "Who's coming?".
- C4. Show the label on every NSW match day, ticket or not. Not for a match played interstate.
- Stage C check:
  - Ireland alone, Mon 4 Oct (5:15pm evening match): the label shows with only evening-open ideas.
  - New Zealand, Sat 9 Oct: the same.
  - A day card with no suitable ideas: the label is hidden, not empty.
  - Screen reader order: before, the match, after, then this label.
- Then stop and show.
- **Expect:** the idea fixtures are thin on opening hours (idea sheets show "[Opening hours to come]", hidden with Annotations off), so few or no ideas may qualify. Check the data first and report what exists before building.

**Stage D (merged, #568):** built as below, plus one count for your days across the bar, the Your teams sheet, Your matches and Your plan so far. Round 5 (#573) then fixed the open plan, E1 to E6 (E4 not reproduced). The brief as given: Away days on the plan (F-048). A tester following four teams couldn't see which days he was in NSW and which he was away; the strip only marks match days.
- D1. Days not set: keep the strip and cards as they are (nothing is guessed). On any day whose matches are all outside NSW, add a plain-text line to the card: "Away from NSW: [city]", using the city already on the match row. No ideas, no buttons, no greyed row that does nothing.
- D2. Days set: show every day in the range in the strip and the cards. A day with no match and no suggestions can collapse into one card, as the notes already describe. A day whose matches are all interstate shows the same line and no ideas.
- D3. The bar's count adds the number of teams. Placeholder wording: "4 teams · 11 group matches · 3 in NSW".
- Keep the strip's interstate marker (`is-away`) and its screen reader label, which now also says "away from NSW".
- Stage D check:
  - Ireland, Scotland, France and New Zealand: Sat 2 Oct (three interstate matches) shows the away line; Mon 4 Oct does not.
  - With days 1 to 17 Oct set, every day appears.
  - The strip's labels are read in order.
- Then stop and show.

**Final (given in chat on 21 Nov; the same lists are in the report linked at the top):** one list of:
- every string added (the `concepts-words.js` block, for approval);
- every note and check edited;
- everything hidden for lack of real content (Stage A hid the FAQs, the At a glance transport line, the consent box, Buy tickets, View full page, Learn more on Practical info, Placeholder tags, and idea hours and prices);
- the real content still needed.

**Answers already given (21 Nov):**
- Yes to Group A to F, later-round matches, Play in the kick-game lines, and Image of for screen readers.
- The plan bar's line duplicating Your plan with no team is fine.
- The plan keeps its slider (reversed 22 Nov by round 5 E3: no slider in the plan).
- The days sheet keeps Use these dates.

## Round 5: open plan fixes E1 to E6 (merged, #573 and #574)

From round 5 testing. The user's rules: don't touch Not going to the match? or the away lines beyond E5 and E6, and keep the 5pm evening rule. All six checks pass in cards and swipe, at 390 and 320, with Annotations on and off, in both themes.
- **E1, reopening:** the first open of a visit keeps the 20 Nov rule (`openDay` in concepts-plan.js). Reopened in the same visit, the plan returns to the day last added to since it was last opened, else to the day last open when it closed (`lastOpen`, `addedSince`, `noteAdds()`; memory only, so a reload starts again). Check: England, 14 to 24 Oct, add on Sat 16 Oct, close, reopen: Sat 16 Oct.
- **E2, arrival and last days:** they are half days on purpose (no flight times). They now keep their own cards (never folded into a run of free days) with Add ideas, offering only the city's half-day ideas (`FREEINFO` entries with `half`, built after the free days in `renderThird`; left out of `tpFreeApi`). No time is guessed; two fill the day.
- **E3, one slider:** the plan's slider is gone (`renderDaysLine`). The plan shows one line and both forms open the days sheet; it is the same whether the team was picked on the page or in the Add team sheet.
- **E4, last button under the footer:** not reproduced (640 to 844px tall, toast open or closed); unchanged.
- **E5:** Matches in N cities is not shown beside an Away from NSW line (card and strip label); the red same-time line still is.
- **E6:** the strip's away label lists cities with commas and a final and (`awaySay` in concepts-words.js).
- **Words added:** `planDaysUnset`, `arrivalDay`, `lastDay`. Notes edited: Plan bar (opening rule), Your days in the plan (rewritten), One card a day, the strip.
- **Learnt:** the user can merge within minutes of a push. #573 merged before the E1 and E2 follow-up landed, which then needed #574. Push everything before saying a PR is ready.

## Done on 22 November, afternoon (#579 to #591)

- **#582, real destination data:** from the user's spreadsheet (89 places, the town pages on sydney.com and visitnsw.com, read 22 Nov; confidentiality low, public data).
  - Drop goal: every one of the 80 stops shows its page's direct answer on the card (`drop-goal/js/summaries.js`). §18 `summary` is now "the direct answer, 40 to 60 words" (user's call). Distances and images are still placeholders.
  - Planner: the free-day ideas are 35 real towns (17 Sydney and 8 Newcastle half days, 6 Sydney and 4 Newcastle day trips) in place of invented names. New contract §19 Destinations (gap). Travel lines in the pages' words ("Getting there to be confirmed" where not stated, as for most Newcastle ideas, `TP_WORDS.gettingTbc`). Towns have no hours or price rows. Approximate town centres in `cnGeo.ideas`. La Perouse left out (Bare Island closed until late 2027).
- **#583, business names trimmed:** a government site names no business ahead of others (user's call). 17 summaries keep what each place offers without the name (Doyle's, Zimmermann, Pokolbin's wineries, Scenic World, SEA LIFE and others). Landmarks (Big Banana, Big UGG Boots), the stadium's name and public bodies stay. Theatres (Enmore, Belvoir St) were kept; the user wasn't asked again.
- **#583, article pages:** the six Read before you go cards open their articles inside Home, with `?a=<slug>`. Under the prose, Quick answers for reading, SEO and AEO: a 40 to 60 word answer, key facts, questions people ask (answers of 50 words or fewer, shown, not folded), places named; plus a meta description and JSON-LD (Article, FAQPage, BreadcrumbList) while it shows. Back (the link, the browser, the Home tab) returns to the card at the same scroll with focus on it; one article at a time in the history.
- **#585, #588, Leave the car at home:** the At a glance card's line is written from the town data, and its link is Read the match day guide (the FAQ link stayed hidden while the FAQ answers are unwritten).
- **#589:** two or three pictures between paragraphs in each article, stand-ins from the library, none of a named business.
- **Other session:** #579 Reset icon top left; #580 a reload stays on its tab; #581 Skip the map on phones only; #584 new slogan (`?slogan=b` tests the alternative) and Save & share ordered by device; #586 In NSW pill on every NSW match; #587 marker tooltips on the desktop and Compare options.
- **#591, Save & share as a list** (replaces the tiles and #584's device ordering; `concepts-third-half.js` Save & share section, `.tp-ss-*` in `shared.css`):
  - Full-width rows, one button each (icon, name, caption), a 1px `--c-line-soft` rule between rows, and a chevron on rows that open in place. The same order on every device (`ssOrder` removed).
  - **Keep a copy:** Email ("Your plan comes as a PDF attachment."; the field, Send my plan, legal line and opt-in open under the row as a panel and keep what was typed; nothing is sent) and Copy plan (a peek with Detailed = `planText`, Compact = `compactText`, For AI assistant = `aiText`; the choice is kept while the sheet is open, back to Detailed when it reopens).
  - **Open in your apps:** Add to calendar (per-event Google Calendar and Outlook links, no .ics: user's call), Add to maps (`placeItems`: Google Maps and Apple Maps per place, the whole route from `mapsUrl()` on top; interstate venues left out), Download table (.csv) and Copy for a spreadsheet as two rows (user's call: the brief's "each row is one button" won over keeping them on one row).
  - Removed: Group chat, Download text, Print or save as PDF and `printPlan`.
  - One peek element is moved under whichever row opened it (an `li.tp-ss-peek-li`); one thing open at a time, the email panel included. The Email row's id is `tp-ss-mailrow`, because `tp-ss-email` is the field.
  - At 320 the brief's two captions wrap to two lines (not cut), and the For AI assistant chip wraps to a second row.
- **Share/edit itinerary removed (user's call, 22 Nov):** `prototype-itinerary.html` and the scripts only it loaded (`concepts-itinerary.js`, `concepts-copy.js`, `concepts-products.js`) are deleted, with its viewer tab and its link on `index.html`. `concepts.html` forwards every old link to Pick your team, and `vercel.json` redirects the old address there. Some `.cn-*` rules in `shared.css` were written for it and may now be unused; they were left, as Pick your team's sheets share that family.
- **Learnt:** the user merges within minutes, so a follow-up commit pushed after a merge needs its own PR (it happened with #583 then #585). Check the PR's state before pushing more to it.

## Done on 21 and 22 November (#563 to #577)

- **#576:** Drop goal, one visit (`drop-goal/js/visit.js`): random start, never twice, Explore all stops, previous and next, estimate only with `?tools`, Reset prototype sends `thk:reset`; `checkDistribution()` simulates visits. CLAUDE.md check 10: two-height sheets and sideways steps.
- **#575:** Drop goal named Drop goal, shown as Play on phones (desktop headings Drop Goal); the result card's two heights on phones (`js/card-sheet.js`); Kick again became Line up next kick.
- **#577:** the 22 Nov handover (other session); this update follows it.
- **#574, #573 (other session):** open plan fixes E1 to E6 (round 5, above).
- **#572:** the capsule says Play Drop Goal on the desktop website; every tab's top heading is an h2.
- **#571, #570, #569, #567, #565, #564:** Drop goal after the phone critique: the game starts about 150px down, landscape and short phones, the result card and the page (dimming, tap outside), See your plan on the card's line, one name, polish.
- **#568, #566 (other session):** round 3 stages D and C.
- **#563:** the previous version of this handover.

## Done on 20 and 21 November (#546 to #562)

- **#561, #558:** round 3 stages B and A (above).
- **#562, #560 (other session):** sheet rules (tap outside, Save only where changes build up, a soft rule on pinned bars) and the bars and days sheet brought in line; the days sheet keeps unconfirmed days as a draft.
- **#559 (other session):** the DNSW design system at `/design-system`.
- **#552, #554, #556, #557 (other session):** Drop goal stages 2 and 3 (see the Drop goal section).
- **#555:** full country names on the stacked hand (arcs of five, fewer to an arc where the names need it); room at the end of the plan so the last day's card can come to the top.
- **#553:** after a button audit: Follow day by day's venue and ticked pins open their details; focus fixes.
- **#551:** a Save bar in every sheet where a change applies at once (check 10, "Changes say they're kept"), and the toast rule addition to check 11.
- **#550:** half-day ideas as stops in the map's card row; See your match day (F-028) opens the plan on the match day.
- **#549:** the map's cards open on the first NSW match; "Played in X. Watch it in NSW." on interstate stops; the days filter.
- **#548:** a rule for matches on one day. Every match of the picked teams counts: the same kick-off gives a red line "N matches at the same time" and a ring on the strip; otherwise two or more cities give a quieter "Matches in N cities" with no ring. Tickets don't change it.
- **#547:** the plan opens on the rule's day: the first of your days, else the earliest dated save, else the first NSW match, else the plan's first day.
- **#546:** the previous version of this handover.

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
- **Option B and Drop goal:** Option B keeps its own saved state by prefixing keys (`flow-a:`) in the page's `<head>`, but the Drop goal game in its own iframe still shares its saved stops with the main prototype.
- **Marker tooltips (#587):** desktop only (`(hover: hover) and (pointer: fine)`), one `.tp-hovertip` on `body`. The Your days slider's start and end ticks sit under its handles until days are set, so they only show a label once the handles move.
- **Shell safety check:** a Bash heredoc that writes a test script containing `rm` (even as a variable name) can be stopped as a possible deletion. Write test scripts with the Write tool into the scratchpad instead.
- **Two Vercel projects** deploy every push. The user hasn't decided whether to disconnect one.

## Where the build stands (checked 19 Nov evening)

- **Plan layout:** stacked day cards only. The one-day-at-a-time test (`?plan=swipe` and its tools switch) was removed on 23 Nov; old `?plan=swipe` links now open the stacked cards.
- **Team cards:** the country name (with its flag) sits under the three-letter code, in the grid and, since 21 Nov, in the stacked hand too (arcs of five, 14 to 12px, fewer to an arc where the names need it).
- **Kick-offs in Sydney time:** not on the event line. It was dropped on 16 Nov to match the Figma reference; kick-off times elsewhere still say "Sydney time".
- **Pick your teams button on the first screen:** removed (planner hero, 16 Nov), and Home's hero has no button either (19 Nov). The hand of cards under "Plan your 3rd half" is the way in.
- **Kick-off of the opener:** 8:45pm Sydney time (was 9:00pm), also changed on `pages/rugby-world-cup.html` and `experiments.html`.

## Open questions for the user

1. **New, data contract:** #534 added `highlights` (§16 of `docs/product-data-contract.md`, a proposed `gap` field on venue records) without a recorded go-ahead. CLAUDE.md says to stop and ask before using a field outside the contract. Confirm, change or remove it.
2. **New, CLAUDE.md edits:** checks 7, 10, 11 and 12 were amended or added between 17 and 19 Nov (commits `e0977cb`, `3f073db`, `dd18721`, `26b51da` and `a185d3b`). If any wording went in without being shown first, the user may want to review it.
3. **Home:** the article pages are built (#583, inside Home, not `pages/rwc-article.html`). Drop goal (shown as Play on phones) has stages 1 to 3, the critique fixes and the visit (#576) built; whether the original stages 4 and 5 are still wanted, or were replaced by the 22 Nov briefs, is for the user to say.
4. **From the Where to watch critique, not chosen:** the fair venue rotation picks Wollongong and Newcastle venues for a Sydney match (the nearest fan zone was "used" on the interstate cards). Should proximity win on the night of a fan's own city match?
5. **At 320 wide:** on the Every NSW match card the wider I have tickets button wraps long names (New Zealand) to two lines.
6. **From #527, still unanswered:** the open plan's heading repeats "Your plan" from the bar; the end-of-page summary says "added" while the bar says "saved"; a dated save made with no team stays in the box after a team is picked, until days are set.
7. **Seen at 320 wide, predating these changes:** "Your matches (6)" wraps in low fidelity (check 6).
8. **The full-screen Follow day by day map card** has no I have tickets button. Ask before changing it. (The itinerary prototype this question also covered was removed on 22 Nov.)
9. **Section gaps:** 64px (`--sec-gap`) against the principles' 48px between families.
10. **CLAUDE.md tidy-up:** "9. Look, don't only measure" sits under Build notes instead of the numbered checks (still true after the #545 build note).
11. **Carried over, not raised since:** trip stops aren't links; the annotations are stale for the sheet work in #512 to #516; venue match counts for Adelaide and Townsville; the dashed Every NSW match icon; "Pick your team" / "Your teams" / "Add team" wording; the bar's counts and Tab order.

12. **New, articles:** dummy content. The Pacific fans article makes cultural statements written without a source (team colours, greetings, crowds falling quiet during the challenge) and needs review by someone from those communities. Match details come from the placeholder fixtures. Articles show no pink marks with Annotations on; only the annotation says they are dummy. Articles are not in the data contract; offer a section if wanted.
13. **New, destination data:** most Newcastle ideas have no travel time from Newcastle (the pages give times from Sydney). The spreadsheet's Current notices column is not shown anywhere (for example the Great Western Highway closure for Lithgow and Bathurst). Venue names change: recheck against the live pages before launch.
14. **Answered, Home FAQs:** the user supplied the six answers (22 Nov); they show with Annotations off again, and the site footer is built from the user's sydney.com copy.
15. **Answered:** the itinerary prototype's Save & share no longer matters: the whole Share/edit itinerary prototype was removed (22 Nov).
16. **New, pictures:** the library has 13 photos that show no named business, so pictures repeat across articles and ideas. Real pictures still needed.

## The homepage (built 19 November, second session)

- **Which:** the **Home** tab of the Pick your team prototype, from Figma 385:649, in the prototype's own styles. It is now the tab the page opens on; `?view=plan` opens the planner. Links shared before this that expected the planner now open on Home.
- **Where:** markup in `#tp-home` (`prototype-pick-your-team.html`), script `concepts-home.js`, styles under "Home" in `shared.css`, the host city sheet as `city:` ids in `openPm` (`pmCity`, `tp.hosts`, `tp.hostMatches` in concepts-third-half.js).
- **One hand:** the capsule script lends `#tp-picker` to `#tp-home-hand` while Home shows (a comment node marks its planner place). `window.tpView` (`get`, `go`, `reveal`, `lend`); `goTo` reveals a section's tab first.
- **Placeholders:** the hero video, the Drop goal picture on Home (the Figma reference is a real video game screenshot), FAQ answers, tickets link, transport line, consent wording, the footer, Where to stay in the host city sheet, and the At a glance cards' stand-in photos and bracketed copy.
- **Since the first build:** Read before you go (`#tp-home-reads`, dummy articles), At a glance as three cards, the stadium cards as a carousel on phones linked to the pins (`concepts-home.js`), highlights at the top of each host city sheet (`cnHostHighlights` in `concepts-fixtures.js`), and the desktop layout (full width, no rail, tabs in the header bar, the plan bar floating at the foot once a team is picked).
- **Not done yet:** Play beyond the stages and critique fixes below; the article page; day trips in the host city sheet are listed, not linked (a trip sheet needs a free stretch to fit into).

## Drop goal (shown as Play on phones): the kick game (Stage 1, 21 November)

- **Which:** the Drop goal tab (shown as Play on phones; `?view=kick`) shows the Third Half kick game in place of the being-built page, which is gone. Links ending `?view=kick`, and Home's Play now, now open the game.
- **Where:** the game is its own folder, `public/wireframes/drop-goal/` (`index.html`, `css/`, `js/`), copied from the package and still runnable on its own, with the package's README.md and CLAUDE.md beside it. Its rules still apply inside it: the blue-or-green skin rule, equal exposure (run `checkDistribution()` in the game's console after any change to physics, wind, routes, terrain or `PLAYER_MODEL`; every stop within about 8 to 12%), placeholder data, no logos, a single rigged SVG, no build step and the script load order.
- **How it is shown:** an iframe (`#tp-kick-frame` in `#tp-kick`), so none of the game's scripts load in the page. The capsule script sizes it to fill the screen under the capsule (`fitKick`); the page does not scroll on this tab and the game scrolls inside the frame. The plan bar steps aside, as before (`#tp-phone.is-kick`). On the desktop website it runs full width with no rail.
- **Changed in the game:** only the colour tools (Kit, Skin, Field, Import, Copy curated settings, Reset this team), folded into a closed Colour settings (temporary) disclosure under the team picker, to be removed later. Also one fix: the closed destination card's buttons stayed in the Tab order off screen (`.card`'s `display: flex` overrode `[hidden]`); it is now hidden once it has slid out.
- **Data:** the destination fields are §18 of the data contract, `gap`, from the game's `ROUTES` fixtures.
- **Stage 2 (21 Nov): Add to your plan.** The card's button (was + to plan) saves the place to Saved, not placed yet as kind `kick`, one save per place name, holding only §18 fields (name as the title, distance_km, route). Kick saves are never slotted onto a day (`tp.waiting()` is the saves that are; `tp.kicks()` the kick ones) and get their own line, Places from Drop goal stay here; plan a day there yourself. Confirmed on the card only: the action bar's first line names the latest change (no Save button since 21 Nov: the cross, Escape or a tap outside closes the card); no page toast (`addItem(it, true)`). The page and the game talk through `thk:ready`, `thk:save`, `thk:unsave` and `thk:saved` (drop-goal/README.md, Messages); every `save()` sends `thk:saved`, so Remove, Clear plan, Undo and Reset update the game's button.
- **Stage 3 (21 Nov): theme, team and layout.** `drop-goal/css/embed.css` (only in a frame) maps the game's controls and card onto the page's tokens, sent by `kickTheme()` in concepts-teams.js as `thk:theme` on load and when the High fidelity switch changes; the pitch and player stay in colour. `thk:teams` sends `state.picked`: picked teams first in the game's row, the first one kicks until a team is chosen in the game. The tab has the page's own title (Drop Goal on the desktop website, Play on phones) and intro; the game's heading, pitch mark and notes are hidden there (the notes are in the annotation). The card has the close cross top right, closes on a tap outside it, and has no Save (user's call, 21 Nov). Kick is pinned to the foot of the frame below 1024px, with a faint rule above. Phone: the pitch is sticky at the top of the frame; desktop: controls beside the pitch.
- **Still to come:** Stages 4 and 5 as briefed; a sheet for a kick destination; an Open your plan link on the card; removing the temporary Colour settings. Open: the skin fallback for the 7 teams with no blue or green.

## Drop goal on phones (21 Nov, after the critique)

- `/impeccable critique` of the tab (snapshot in `.impeccable/critique/`) scored 20/40; worst on phones. Fixed so far: the P0. On phones the tab opens docked (`kickDock()` in the capsule script: logo row scrolled away, capsule at the top, 24px to the title), the intro is one line (`.tp-kick-more` holds the rest for the desktop website), and `fitKick` sizes the frame for the docked state. The game's card leads with the name and Add, then the picture capped at about 30%.
- Landscape and short phones (P1) done: under 620px tall the page hides the title and intro (`is-short` on `#tp-phone`, set in `fitKick`) and the frame has no minimum height; the game's short-wide layout (`@media (min-width: 600px) and (max-width: 1023px) and (max-height: 560px)` in drop-goal/css/styles.css) puts the pitch in a sticky left column capped to the frame, the controls beside it and Kick at their foot.
- The card and the page (P1) done: the game reports its card (`thk:card`), the page dims its head (`is-kick-card` on `#tp-phone`) and closes the card on a press outside the frame or on leaving the tab (`thk:close`, `window.tpKickClose`).
- See your plan (P1) done: the card's line ends with See your plan after an add (`cardStatus(msg, seePlan)` in game.js; only in the prototype); `thk:open-plan` makes the page close the card, go to the planner, open the plan at Saved, not placed yet and focus its heading.
- One name (P2) done, then changed 22 Nov (see the naming bullet above): it was Play everywhere it shows, the tab's heading an h2, the browser page title per tab (set in the capsule script's `showView` from the capsule labels, so it follows `TP_WORDS.play`).
- Polish (#571) done. Since: the capsule label is Play on phones and Play Drop Goal on the desktop website (`.tp-cap-phone` / `.tp-cap-desk`, `TP_WORDS.playDesktop`), and every tab's top heading is an h2 (the planner's slogan was an h3).
- 22 Nov, after the re-critique (25/40): the result card on phones opens at full height; dragging its grabber or head down shrinks it to a short card (the place, Add to your plan, the action bar) so the landing shows on the pitch, and dragging further or a flick closes it; a tap on the grabber switches the heights (user's call; `drop-goal/js/card-sheet.js`). The card's Kick again is now Line up next kick. Names as above.
- 22 Nov, the visit (`drop-goal/js/visit.js`): a random start per visit (a random route from Sydney, aimed at a stop picked at random); never the same stop twice per visit, by a late gust or off the upright on top of the physics (lines: Off the upright!, Caught the breeze!, Off the upright and caught the breeze!, Off the upright and over!, Over the bar and caught the breeze!); every stop seen adds "You've seen every stop on this route. Try another route?" and starts the list again; Explore all stops (pan the pitch, identical markers with a tick when seen, a hidden list of stop buttons for the keyboard, Back to kicking on the Kick bar); previous and next on the card (the content slides inside the card, the marker and camera follow, Add applies to the stop showing, "Taree, stop 4 of 10"); the estimate under Power only with `?tools`; Reset prototype starts a new visit (`thk:reset`). `checkDistribution()` simulates whole visits: 8.7 to 10.6% per stop on every route.
- Still to do: the critique's remaining items (focus and tab order, the page-head dimming), which the user is working through separately; check 10 now covers a sheet with two heights and previous and next as a sideways step (22 Nov). Swipe-down chaining off the Kick bar was fixed on 23 Nov.

## Drop goal: where it stands (22 Nov)

- **Name:** Drop goal; Play is only the phone label (the capsule and Home's section heading; since 23 Nov the Play tab's own heading reads Play Drop Goal on phones, `playTitle`). Words in `concepts-words.js` (`play`, `playDesktop`, `dropGoal`, `dropGoalTitle`).
- **The visit:** `drop-goal/js/visit.js` loads before `main.js`, which calls `visitBoot()`. sessionStorage key `thk-visit-1` holds the start and the seen lists per route. Re-routing never touches `simulate()`, the zones, routes, terrain or `PLAYER_MODEL`; it bends the drawn path after the posts (upright, only for a kick that clears the bar) or late in the flight (gust). `checkDistribution()` prints single kicks and whole visits; on 22 Nov visits ran 8.7 to 10.6% per stop.
- **Messages:** `thk:ready`, `thk:save`, `thk:unsave`, `thk:saved`, `thk:theme`, `thk:teams`, `thk:card`, `thk:open-plan`, `thk:close`, `thk:reset` (drop-goal/README.md).
- **Testing it:** in the console, set `visit.seen[routeKey]` and `wind` before a kick to force each re-route case; `?tools` shows the estimate. The test scripts used this session were in the scratchpad, not the repo.
- **Still to do:**
  - the critique's remaining items: focus and tab order (focus lost on close in places, tabbing out of the frame, 28 team chip stops); the page head dims while the card is open (the user is working through these separately);
  - remove the temporary Colour settings; the skin fallback for the 7 teams with no blue or green;
  - a sheet for a kick destination, if still wanted (see open question 3).

## Rules in line (21 Nov)

- CLAUDE.md gained three rules (#560): a tap outside closes a sheet, with four exceptions (check 10); Save only where several changes build up (check 10); a faint soft top rule on everything pinned to the bottom (check 6).
- Brought in line: the plan bar, the days sheet's bar and the sheet Save bar now use `--c-line-soft`. The days sheet keeps unconfirmed days as a draft (`dDraft` in concepts-third-half.js) and says Not saved yet when reopened. Every other sheet already met the tap-outside rule: backdrops act on a click, so a drag that ends on them does not close the sheet; Clear plan's backdrop is Cancel; the desktop rail and full-screen layers have no backdrop.

## Recommended next steps

1. Pull main (`origin/main`). Check whether this handover's PR has merged, and whether the other session has merged anything since.
2. Read CLAUDE.md (checks 7, 10, 11 and 12 especially), this file and `.claude/skills/wireframe/SKILL.md`.
3. **Prototype options (the next session's work):** read "Prototype options: how they work" above. Ask the user what kind of options they mean (flags on this page compared side by side, new screens or flows, or a new prototype tab), which part of the page each covers, and how many versions. Then do the scope check (checks 7 and 12) before building, and stop and show where the brief says so.
4. Open questions 1 (the `highlights` field), 12 (article review) and 14 (FAQ answers) are the ones most likely to come up; raise them when the work touches those parts.
