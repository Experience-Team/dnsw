# Session handover: Pick your team prototype

14 November 2026 (Sydney). Repo `Experience-Team/dnsw`, main at `a5f36b9` (PR #476 merged). One PR is open: #477, the Your teams list editor. It's in draft, waiting for the user to merge.

This replaces the 13 November handover. Its open questions about fan spacing, Clear all and ticket marks, the countdown target, the summary line and the itinerary bar weren't raised again this session. Check them with the user before reopening any of them.

## Ways of working

- **Branch:** work on `claude/serene-brown-f2rykl`.
  - Once a PR has merged, restart the branch from main with `git fetch origin main && git checkout -B claude/serene-brown-f2rykl origin/main`, then push with `--force-with-lease`. That's safe, because the branch only holds history that's already merged.
  - Make one commit per task, open a draft PR and subscribe to it.
  - Set a 50-minute `send_later` safety net, and delete it once the PR merges.
  - The user marks the PR ready and merges it.
- **Previews:** only share links from the Vercel project `mopo123-gmailcoms-projects`, in chat and in PR descriptions. The URL pattern is `https://dnsw-git-claude-serene-brown-f2rykl-mopo123-gmailcoms-projects.vercel.app/wireframes/<page>.html`.
  - A second project, `moniquepompe-2020s-projects`, also deploys every push. Its previews ask the user to request access.
  - This rule is in CLAUDE.md.
- **CLAUDE.md:** read it first. It holds:
  - the standing rules;
  - **seven** prototype interaction checks (7: patterns go everywhere they apply);
  - the experience principles, including the WCAG 2.2 AA sizing: 36px buttons, at least 24px targets, nothing padded to 44px;
  - the Previews rule.
- **Standing flags:** when the user says "you missed X", work out the general principle. **Show the proposed wording before editing CLAUDE.md.** The fix itself doesn't have to wait.
- **Stop and show:** when a brief ends with stop and show, or asks for a plan first, don't build or commit until the user answers.
- **Build log:** add one row per change to the table at the end of `.claude/skills/wireframe/SKILL.md`.
- **Annotations:** the annotations array in `prototype-pick-your-team.html` needs updating with every behaviour change.
- **Writing style:** UK English, AUD, Sydney time, few em dashes. Rate how confidential and how safe to upload any work document that's shared.

## Running and testing

- **Serve:** `cd public && python3 -m http.server 8123`, then open `/wireframes/prototype-pick-your-team.html`.
- **Test:** Playwright via `NODE_PATH=$(npm root -g) node script.js` at 390 x 844 (the phone), with and without `reducedMotion: 'reduce'`. Walk every combination (check 4), and take frame strips for any motion (checks 1 and 5).
- **State:** saved in `localStorage['tp-pick-v1']` as `{picked, tickets, tab, added, trip, allFilter}`. Seed it before reloading. Reset prototype in the panel, or `?reset`, clears it.
- **Figma:** file `LwBKfIftpu8erI6WGOi4W1` (Rugby World Cup).
  - Call `create_session` first.
  - Asset downloads now work: `download_assets` returns a short-lived URL, then fetch it with curl.
  - Exports carry a page-frame rectangle. Strip it, as was done for `public/wireframes/flags/`.
  - `www.figma.com` stays in the environment allowlist, as the user asked.

## Where things are

- **`public/wireframes/prototype-pick-your-team.html`:** the page. It contains the phone markup, the stacked sheets (`#tp-ss` Save & share, `#tp-ts` Your teams, `#tp-cc` Clear your timeline?) and the annotations array.
- **`concepts-teams.js`:**
  - the fan and picks (`toggle`, `setRugby`, Clear all with Undo);
  - the team search;
  - the timeline bar and sheet (`tlUpdate`, markers with flag pairs, clashes);
  - the stacked-sheet pattern (`stackOpen`, `stackClose`, `stackRegister`);
  - hold-to-drag for places;
  - Clear timeline, with its confirm step;
  - the **Your teams** list editor (`tsOpen`, `tsBuild`, `tsSync`, `tsNote`, `teamMatch`);
  - `window.tpPicker`, the API used by third-half.
- **`concepts-third-half.js`:**
  - the match and item sheet `#tp-pm`, also used stacked over the timeline;
  - Move and `moveItem`;
  - the trip question, with the two-handle date slider (29 Sep to 15 Nov, tournament marks at 1 Oct and 13 Nov);
  - Where to watch and Suits your 3rd half.
- **`concepts-fixtures.js`:** fixtures (`cnFixtures`), venues (`cnVenues`), products and trips.
- **`public/wireframes/flags/`:** 24 team flag SVGs from the Figma Flag Pack (node 170:129). The `FLAG` map in `concepts-teams.js` points to them.
- **`shared.css`:** everything for this page is under `.tp-*`.

## Done this session

- **#474, timeline sheet:**
  - every marker opens its details stacked over the timeline;
  - Move and Remove for places, plus press-and-hold drag along the axis;
  - Clear timeline, with a "Clear your timeline?" confirm step and Undo;
  - flag pairs on match markers;
  - a two-handle date slider with tournament marks;
  - the Figma card-fan and calendar icons, with the calendar on every date button;
  - Figma team flags everywhere;
  - CLAUDE.md check 7.
- **#475:**
  - smaller timeline flags, so the ticket ring clears the next day;
  - 36px tabs;
  - interstate venue names in the fixtures matched to `cnVenues` (Docklands Stadium, North Queensland Stadium).
- **#476:**
  - a Pick your teams sheet over the timeline;
  - "Add or change teams";
  - the CLAUDE.md Previews rule;
  - a fix for a console error on the trip line.
- **#477 (open):** after `/impeccable critique` scored "Or pick from a list" 22/40, each place got one picker:
  - **Page:** the fan, its caption, Clear all and the search icon. The list is gone.
  - **Sheet over the timeline:** **Your teams**, a list editor with no fan.
    - Pinned picks as removable chips, plus the match count, Clear all, the last change with Undo, and Find a team.
    - Only the list scrolls, and Done is pinned.
    - The order is Every NSW match, then your picks, then NSW teams, then interstate teams. It's set when the sheet opens and when the search clears, never on a tap.
  - The critique snapshot is in `.impeccable/critique/`. That folder is gitignored, so it only exists locally.

## Known quirks

- **Reduced motion:** the global `.cn-phone *` rule gives every element a 1ms transition, so a field in a sheet that's just opened is still `visibility: hidden` for that frame. Focus it after a short delay; Your teams uses 30ms.
- **Duplicate Vercel projects:** two projects deploy every push. The user hasn't decided whether to disconnect one or turn off preview protection.

## Open questions for the user

1. **Venue match counts.** The fixtures and `cnVenues` disagree for Adelaide (7 in the fixtures, 6 in `cnVenues`) and Townsville (3 in the fixtures, 4 in `cnVenues`). Which is the source of truth?
2. **Critique P2s the user scoped out:**
   - the dashed "Every NSW match" icon reads as empty;
   - the wording varies: "Pick your team", "Your teams", "Add or change teams".
3. **From an earlier critique, still open:**
   - the bar counts;
   - where Save & share sits;
   - the bar's Tab order;
   - renaming the "Here for the rugby" card heading.

## Recommended next steps

1. **Get #477 reviewed and merged.** Ask about the venue counts while you're there.
2. **Re-run `/impeccable critique` on the Your teams sheet**, to confirm the P0 and P1s are fixed and the score has improved.
3. **Pick up the P2s**, if the user wants them: a clearer Every NSW match icon and consistent wording.
