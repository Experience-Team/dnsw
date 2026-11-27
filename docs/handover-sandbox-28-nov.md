# Handover: sandbox, the three questions on desktop and the narrative plan page

27 to 28 November 2026 (Sydney). Repo `Experience-Team/dnsw`. Branch `claude/youthful-carson-0v6wk2`. Merged this session:
#675 (map replacement), #676 (trip map sharpness, framing, labels) and #677 (everything else below, through `4497a86`).
All the work is in `public/wireframes/sandbox/` only. Version 1, Version 2, shared files outside the sandbox and `archive/`
were not touched. Pull main before starting (`git fetch origin main`).

Previews: share links only from the Vercel project the user can open, `mopo123-gmailcoms-projects`. The other bot row,
`moniquepompe-2020s-projects`, asks for sign-in. The desktop view needs `?phone`: without it the frame stays 358px wide.
Link form: `.../wireframes/sandbox/index.html?phone&theme=hifi`.

## Start here

Nothing is half-built. Open items, most likely first:

1. **The user said they saw "a few" regressions on Home.** One was found and fixed (`4497a86`): Home carries `data-fc`
   like the question steps, so the new desktop rules in `v1/v1-flow-desk.css` reached it and gave it a plan rail it does not
   have. After the fix Home matches the commit before the change box for box at 1400, 1280 and 390. The user was not asked
   which others they saw. Ask for the exact spots, and check them against `git show 091f5b3^1` before changing anything.
2. **1024 to 1279 wide is not centred on the screen.** The questions stay one column, centred in the space beside the
   300px rail (about 166px left of the screen centre at 1024). Centring on the screen would run under the rail. Decide:
   shrink the rail further, or move it below the answer at that width.
3. **Not asked, not done:** the plan page's own centring and the open plan were not looked at in this pass.
4. Version 1 and Version 2 do not have any of this. The sandbox is where it was tried; nothing says it moves across.

## What was done (sandbox only)

- **The three questions on a wide desktop (1280px and up), `v1/v1-flow-desk.css`.** The step count, bar, title, note and
  Find and Grid sit in a left column; the answer (card fan, calendar, stay choices) sits in a 520px column on the screen's
  centre, the same centre as the section tabs and the Back, Skip and Next buttons. The plan rail on those steps is 300px
  (it was 360px). The grid runs under the rail with equal empty space either side. Also on in NSW (dates step only) is
  centred on the same line. The rules are scoped `:not(.is-home):not(.is-kick)`: Home also has `data-fc`.
- `--sbw` (the scrollbar width) is set on `#tp-phone` by `v1/v1-flow-c.js` so the foot bar's edges match the column.
- Questions: dates summary ("8 to 17 Oct · 10 days, 2 of your NSW matches") above the calendar; title "When will you be in
  NSW?"; stay buttons "Around Moore Park", "Around Olympic Park", "Around Newcastle" (Sydney CBD unchanged); the first
  On while you're here removed from the team step; the stay step distilled (no other-matches block, shorter note).
- Calendar: later-round (knockout) marks are grey; each calendar is one tab stop with arrow, Home, End, Page Up and Page
  Down keys; `no-focus-ring.css` deleted so focus rings are back; the search field is named.
- Plan page: sticky day headings under the nav; a stretch of free days is one block; the plan sheet's answers card is an
  Edit button beside the Your plan heading; "Add another place" removed under the sentences; Sample tags only with
  Annotations on; the last day differs from the arrival day.
- Timeline: fits your days on open, spare days open their ideas, full-width modal on desktop.
- Home: hero picture directly under the header (the tabs pill overlays it on phones); an H1 and subheading above Read before
  you go; Who's coming question removed from the planner.
- Maps: one map picture everywhere; the trip map is sharper and 1.5x taller on desktop.

## Catch-up done for this handover

1. **Full behaviour suite:** 198 passed, 1 skipped, 1 failed. The failure is `polish.behaviour.spec.js` "Version 2: the page ends on the footer" (1px of page colour under the footer at 1440 wide). Version 2 does not load any sandbox file and nothing outside the sandbox changed, so it is not from this session's work; it was not investigated. Check it against `main` before touching Version 2.
2. **Tests for what was built:** none added, on purpose. `public/wireframes/sandbox/README.md` records that no spec covers
   the sandbox ("it is a place to break things"), and the standing brief defers tests. If the sandbox work is promoted to
   Version 1, write the specs then (desktop centre line at 1400 and 1280; Home unchanged; calendar one tab stop).
3. **Low fidelity and reduced motion:** done once at 1400 (low fidelity; high fidelity with reduced motion) and 390 (low fidelity): the card fan, calendar, stay choices and Also on in NSW all centre on the section tabs (692.5 and 195), Home does not scroll sideways, no console errors. Looked at the low fidelity dates step by eye. The Sat 16 Oct row in Your matches bleeds 8px past the calendar by design.
4. **Annotations and README:** the `#tp-fc` annotation in `index.html` and the README's desktop-questions paragraph now say
   the answer sits on the screen's centre, the rail is 300px and Home is left out.
5. **Unused code:** a duplicate `data-fc="days"` grid rule in `v1/v1-flow-desk.css` removed.

## Still owed

- Screenshot baselines are not made (Docker only, see `tests/regression/README.md`), and none cover the sandbox anyway.
- Keyboard-only walk of the desktop questions after the centring change.
- A real-phone check of the question steps and Home at a person's pace.
