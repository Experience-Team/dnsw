# Session handover: RWC wireframe prototypes

13 November 2026 (Sydney). Repo `Experience-Team/dnsw`, main at `d71fe7a` (PR #440 merged). Nothing open, nothing uncommitted.

## Ways of working

- **Branch:** start each task with `git fetch origin main && git checkout -B <session branch> origin/main`. Make one commit per task, push without force (force-push is blocked), open a draft PR, and subscribe to it. Set a 50-minute `send_later` safety net and delete it when the PR merges. The user marks the PR ready and merges it themselves.
- **Build log:** add one row per change to the table at the end of `.claude/skills/wireframe/SKILL.md`.
- **CLAUDE.md:** read it first. It holds the standing rules and **six prototype interaction checks**. Check every prototype change against all six before committing.
- **New rule in CLAUDE.md, "Adding standing flags":** when the user says "you missed X" or corrects something, work out the general principle and fit it into the existing checks. **Show the proposed wording and wait for approval before editing CLAUDE.md.** The fix itself doesn't have to wait.
- **Close every reply with a recommended next step.**
- **Writing style:** UK English, AUD, Sydney time, few em dashes. Rate how confidential and how safe to upload any work document that's shared.

## Running and testing

- **Serve:** `cd public && python3 -m http.server 8123`, then open `/wireframes/prototype-pick-your-team.html` or `/wireframes/prototype-itinerary.html`.
- **Test:** Playwright via `NODE_PATH=$(npm root -g) node script.js`. Check at 1512 x 831 (the Figma laptop frame) and 1440 x 790.
- **Stop the server:** `pkill -f "http.server 8123"`.
- **Figma:** file `LwBKfIftpu8erI6WGOi4W1` (Rugby World Cup). Call `create_session` first, and use `enableBase64Response: true` for screenshots, because asset downloads are blocked.
- **Previews:** Vercel posts a preview link on every PR.

## Where things are

- `public/wireframes/prototype-pick-your-team.html` and `prototype-itinerary.html` are the two prototype pages. Both follow Figma node 204:12914.
  - Each is one fixed screen: a 460px left panel and a stage holding the 390 x up-to-844 phone, plus a dashed spare frame reserved for a future prototype.
  - Only the annotations and the phone scroll.
  - The left panel holds the title, the pill tabs (including a dashed `[next] prototype` placeholder) and the concept with a Reset prototype control.
  - The itinerary panel also has the jump text links, the Annotations switch and the annotations.
  - Short or narrow windows fall back to an ordinary page.
- `concepts.html` only redirects to the two pages.
- `concepts-teams.js` runs the Pick your team fan:
  - geometry: STEP 6.5, PIVOT 460, LIFT 26, GAP 5;
  - the pull-out animation on a pick;
  - the ALL card and Clear all;
  - the flip to the match cards;
  - `#tp-reset`.
- `concepts-itinerary.js` runs the itinerary prototype.
- `shared.css`: the `.pv-*` rules are the page shell, `.tp-*` the team picker and `.cn-*` the itinerary.
- `docs/jtbd-itinerary.md` is the jobs to be done doc. The `jtbd-check` skill checks changes against it.

## Done this session (all merged)

- PRs #420 to #437:
  - Save and share sheet clarified;
  - reorder drag fixed;
  - Pick your team section with hero and countdown;
  - JTBD doc;
  - fanned card picker with flip;
  - Clear all, the ALL card and centring animation;
  - spacing pass;
  - Reset prototype;
  - split into two pages;
  - jump links.
- #438: both pages rebuilt to the Figma layout:
  - annotations placeholder removed;
  - jump buttons turned into text links;
  - phone header removed on Pick your team, with Reset moved into the panel;
  - annotation badge 5 fixed.
- #440: the fan box is sized from measured card geometry, now 278px tall with the card baseline 60px up.
  - With a pick, there's about 17px clear above and 18px below.
  - Only the sides clip.
  - Check 6 added to CLAUDE.md.

## Open questions for the user

1. **Uneven space with no team picked.** The spacing above and below the fan is even only once a team is picked. With nothing picked there's about 44px above and 18px below. Evening both out would mean moving the whole fan when someone picks. Is the current balance OK?
2. **Clear all and ticket marks.** Should Clear all keep the ticket marks, or clear them as it does now?
3. **Countdown target.** Should the countdown run to the Perth opener (1 Oct) or the first NSW match (3 Oct)?
4. **Summary line.** Should the "Every NSW match: 9 matches, 9 in NSW" summary be shortened?
5. **Itinerary phone bar.** The itinerary phone keeps its own "Your itinerary" bar. Should it go, like the Pick your team header did?

## Recommended next steps

1. **Write annotations for Pick your team (recommended first).** Its panel would then match the itinerary page, and reviewers would see the reasoning behind the fan, the ALL card and the flip.
2. **Re-run the critique (`/impeccable critique`).** The last score was 26/40, before the spacing and layout work.
3. **Carry picks into the itinerary.** The teams picked in the first prototype would show up in the itinerary.
4. **Fix the Save and share sheet.** It's still on the list from earlier.
