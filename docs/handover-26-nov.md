# Handover: 26 November 2026, Version 2 on a desktop, Version 1's motion, and a header test that was undone

26 November 2026 (Sydney). Repo `Experience-Team/dnsw`. Branch used: `claude/intelligent-noether-cj9kv2`. Merged this
session: #658 (all the work below except the header test). Opened and closed without merging: #659 (the header test, undone
at the user's word; its commit `84f405b` and the revert `3f026b3` are in the branch history). This handover's own PR is the
one that adds this file, the new tests and the README and annotation updates. Pull main before starting
(`git fetch origin main`).

Previews: share links only from the Vercel project the user can open, `mopo123-gmailcoms-projects` (CLAUDE.md). The bot's
other table row, `moniquepompe-2020s-projects`, is the project that asks for sign-in. The real desktop page is the frame
page opened on its own: `.../wireframes/prototype-pick-your-team-v2-frame.html?phone&theme=hifi` (the viewer's "Open in
desktop" link). The viewer's default view is only a 390px phone beside a notes panel, and the desktop critique first
judged that by mistake.

## Start here

Nothing is half-built. Waiting on the user, in the order they are likely to come up:

1. **The header.** The user asked to test "a full header at rest, then a slim header that comes back on scroll up and holds
   the hamburger and Your plan, with the pill removed", then said "That's not what I was expecting. undo that". It was
   built from two answers (both floating pills removed; a second row in the full header holding the hamburger and Your
   plan) and is reverted. **What they expected is unknown**: the next session should ask for a description or a sketch of
   the header at rest, scrolling down and scrolling up, before building. `git show 84f405b` has the whole attempt (a bar
   over the page, `v2/v2-header.js`, driven pixel for pixel by the scroll); the idea can be reused.
2. **A wide, sharp hero picture.** Version 2's hero shows `village.jpg` (a fan-zone crowd, 1,024px wide), a stand-in. The
   repo's two good rugby photos are 4:3 and lose heads and legs in a wide banner. A licensed, wide (about 2.5:1) picture of
   at least 2,000px swaps in with one attribute (`data-img` on `.tp-home-video` in the Version 2 page). See
   `assets/images/README.md`.
3. **Try Version 1's motion on a real phone.** The push (480ms, even ease) and the deal (640ms, 17ms apart) were checked
   in a headless browser, frame by frame, not at a person's pace on a phone. Speeds are one number each in
   `v1/v1-flow-motion.js` (`PUSH`, and the `deal()` animation).
4. **Screenshot baselines need regenerating** in the Playwright Docker image (see `tests/regression/README.md`), which
   this container cannot do:
   - `v2.visual.spec.js`: every desktop capture of Home (the whole layout changed).
   - `visual.spec.js`: Version 1's Tickets and Your days steps (Back is now in the bar, not at the top), hifi and wireframe,
     390 and 320.
5. **Still standing from `docs/handover-25-nov.md`, "Start here" 1 to 6:** bring focus rings back before production, more
   pictures, the licence on `rugby-2.jpeg` and `rugby-match-1.jpeg`, Version 2's game posters, Version 1's polish pass,
   and the open plan's "saved to this device only" line.

## What was done

### The desktop critique (Impeccable `critique`, then `layout`, `polish`)
- Dual-agent critique of Version 2 on a desktop. Both sub-agents reviewed the framed viewer, not the real desktop page; the
  corrected pass is in the saved snapshot `.impeccable/critique/2026-11-26T08-20-08Z__es-prototype-pick-your-team-v2-frame-html-8068ca55.md`
  (16/24, Acceptable; two P1s, two P2s, one P3). The P3 (three identical At a glance rows) was not touched, so the
  snapshot is not closed.
- The user dropped one P1: the article grid is **masonry on purpose** (the stagger stays) and sits above the team picker at
  the higher-ups' request.

### Version 2 on a desktop (#658)
Full description in `public/wireframes/v2/README.md`, "The desktop Home". In short:
- A 12-column grid with 24px gutters; the hero picture is the only edge-to-edge element. Drop Goal's words 4 columns and
  picture 8, the map and cards 6 and 6, At a glance 7 and 5, the FAQ 7 with the sign-ups in the last 4, the footer's
  sign-ups 6 and 6. Rhythm 48px, 96px after the hero.
- See where your team plays and Where the matches are are one block. The hand is **one overlapping row** of 24
  (`oneRowGeo` in `v2/v2-teams.js`, where the hand is 944px or wider); the name shows in a pill above a hovered or
  focused card; hovering never changes the stacking, so the pointer is never trapped. A picked card rises 18px.
- **Picking a team lights the stadiums where it plays group matches** and greys the other pins; the cards say how many
  (`v2/v2-home.js`, from `cnFixtures`; knockouts are not drawn; a team with no NSW match leaves the map alone).
- The Drop goal team screen on a desktop seats six to a row (4 even rows); phones keep five.
- Hero: flush under the header's rule, the event line 20px, the hero's hidden heading is the page's `h1`, the Home
  sections `h2` and the At a glance cards and footer headings `h3`. `social.behaviour.spec.js` now accepts `h2` or `h3`.

### Version 1's motion (#658)
New files only: `v1/v1-flow-motion.js`, `v1/v1-flow-foot.js` and their CSS (`v1/README.md`). **No shared file was
touched**: `concepts-teams.js` is also loaded by `flow-chart-planner.html` and the design-system pages, and `shared.css`
by Version 2.
- The cards deal in each time the Plan tab opens on step 1.
- Next, Skip and Show every NSW match **push**: the question you leave goes out to the left as the next one comes in from
  the right (Back the other way), as one rail, framed by the stage `#tp-pick`.
- Back is the first button in the pinned bar from step 2 (a 36px square beside Skip and Next); the one at the top is hidden.

### The header test (#659, undone)
See "Start here" 1. Closed, not merged; `main` never had it.

## Catch-up done for this handover

1. **Full behaviour suite:** 172 passed, 1 skipped, 1 failed, and the failure was a stale selector, fixed:
   `polish.behaviour.spec.js` "Version 2: the page ends on the footer" compared the footer's text with Going with
   friends, which now sits beside the FAQ; it compares with Read before you go. (The first run, in this container's full
   Chrome, failed 142 tests on a favicon 404; the Docker image's headless shell does not ask for one. See "Running the
   suite here".)
2. **Tests added**, `tests/regression/catchup-26-nov.behaviour.spec.js` (10): the 12 columns and rhythm, the `h1`/`h2`
   outline, the one-row hand and five to a row on a phone, the map answering a pick (one team, two, none, and a team with
   no NSW match), the name pill and picked lift, the push out to the left, Back in the bar and the push the other way
   (and no deal on Back), keyboard Back and finishing without a push, the deal, and reduced motion.
3. **Low fidelity and reduced motion, looked at once:** Version 2's desktop and phone in the wireframe theme (grey hero, the
   hand, the lit stadium card, the paired FAQ and sign-ups; the event line holds one line each at 390 and 1440) and
   Version 1's push and bar in the wireframe theme. Reduced motion is in the new tests (no push, no deal).
4. **Annotations and README:** the Version 2 Home annotation (desktop layout, the stand-in picture) and Version 1's
   "questions up front" annotation (Back in the bar, the motion); `v2/README.md` (new section), the new `v1/README.md`,
   and `assets/images/README.md` (the hero picture).
5. **Removed:** nothing was left unused in the files added this session (checked by reading them); the earlier 4fr/8fr
   split-row rules were replaced in place by the grid, and the temporary local Playwright config was deleted.

### Running the suite here
The container has no Docker, but the suite runs: `npm ci`, then a temporary config next to `playwright.config.js` that
spreads the repo's and sets `launchOptions.executablePath` to the **headless shell**
(`/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`) with `--no-sandbox`;
`npx playwright test -c <that file> --project=behaviour --trace off`. About 3 minutes for 174 tests. The visual project
cannot be used: its baselines are made in the Docker image. Do not commit the temporary config.

## Not done

- No visual baselines (see "Start here" 4).
- Version 1's motion was looked at on a desktop width once (mid-push, the bar); Version 1's wide layout was not polished.
- Version 2's pick animation sends small black dots toward the plan button, which Version 2 hides; they fly to the top left
  corner. Existing behaviour, not caused by this session, seen in several screenshots, left.
- The At a glance rows (three identical image-left cards, about 1,200px of scroll) were not varied.
- Version 2's phone Home was not re-checked beyond 390 after the hero and heading changes (check 6 asks for 390 and desktop).
- The saved critique snapshot is not closed (its P3 stands).

## Decisions the user made this session

- The article grid stays masonry and stays above the team picker (the higher-ups' request).
- Version 2 "desktop" means the real page at the Open in desktop address, not the viewer.
- Split rows: the text takes a third and the picture two thirds, text centred; applied to the fan and Drop Goal rows.
- The card fan on a desktop is **one overlapping row**; picking a team **highlights its stadiums** on the map.
- The hero picture should be different (a stand-in was chosen from what the repo has).
- The Version 1 animation sequence: the cards animate in, and the next question comes in from the right and pushes the cards
  out to the left. Back belongs with Skip and Next in the bar.
- The header test was **undone**.

## Things learned (for whoever builds next)

- **Shared files are shared by more than the other version.** `concepts-teams.js` has three consumers; `shared.css` is
  Version 2's too. Version 1 work goes in `v1/`, hooking the DOM and events the flow draws.
- **Overlapping cards and hover:** raising the hovered card covers its neighbours' strips and traps the pointer. Keep the
  stacking fixed, lift with `transform`, name the card in a pill, and raise only on keyboard focus. Playwright clicks a
  card's middle, which is under the next card: tap the left strip (`position`) in tests.
- **`#tp-phone.is-home .tp-body > :not(.tp-top):not(.tp-cap-wrap):not(.tp-home) { display: none !important }`** hides any new
  child of the scroller. Put new parts inside the header or Home, or restyle them past it (this hid the header test's slot
  until it moved into the header).
- **Home borrows `#tp-picker` from the planner** (the whole element), so a resize watcher never sees the hand arrive on the
  Plan tab: watch `#tp-pick`'s children and the phone's `data-fc`.
- **View Transitions are the wrong tool** for a pane inside a phone frame: the transition layer paints above the bars and
  ignores ancestor clipping. A ghost (a copy of the old step, kept in the stage and clipped by it) works.
- **Scroll-linked bars:** the rule is CLAUDE.md check 1. The working shape was `y = max(slot, -offset)` with `offset`
  counted only while the slot is above the top; it is in `git show 84f405b:public/wireframes/v2/v2-header.js`.
