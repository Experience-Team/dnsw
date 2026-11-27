# Session report: what was changed, and in which prototype

Session 26 to 27 Nov 2026 (Sydney time). Branch `claude/youthful-carson-0v6wk2`, PRs #662 to #666. Every commit below carries this
session's id (19 commits, `a2b2d42` to `18275bf`). "Sandbox" is `public/wireframes/sandbox/`, a private copy of Version 1 that loads only its own files. "Version 1" is
`prototype-pick-your-team-v1-frame.html` and `public/wireframes/v1/`. Version 2 and the shared files (`shared.css`, `concepts-*.js`,
`themes/`) were not edited. Nothing was changed in an existing `archive/` snapshot.

## At a glance

| Prototype | Changes |
| --- | --- |
| **Sandbox** | Created as a copy of Version 1 (PR #662); linked from the wireframes index; Plan tab copy cut; fan zones button, Not going group removed, one Added look, close crosses (PR #663). **Nothing since.** |
| **Version 1** | Everything else below: dates calendar, plan layout, team hand, questions without tickets, defects, calendar key and markers, kick-off fix, tooltips, and the stay question. |
| **Archive** | Added one frozen snapshot, `archive/2026-11-26/v1-b`, taken before the questions change. Existing snapshots untouched. |
| **Tooling and tests** | `scripts/archive-snapshot.mjs`; regression specs and helpers updated; new `stay.behaviour.spec.js`. |
| **Version 2** | Not touched by this session. |

## Sandbox (copy of Version 1)

| Commit | PR | What |
| --- | --- | --- |
| `a2b2d42` | #662 | New `sandbox/`: full copy of Version 1 (page, styles, scripts, data, Drop goal, images). Loads only its own files, saves state under `sb:`, `data-flow="sb"`, linked from nothing. |
| `b63c862` | #662 | Linked from the wireframes index, first in the Rugby World Cup 2027 Prototypes group, opens in a new tab. |
| `86bf969` | #663 | Plan tab copy distilled: repeated counts and restated section names removed, "Where to watch in NSW" off each watch card, match name out of "Going to ...?", first sentence of three section notes cut. |
| `b75bb49` | #663 | "Find the fan zones" (pin icon) replaces "Watch in NSW"; the "Not going to the match?" group removed; no Save bar on place, product and idea pages; Add and Added read and look the same in rows, sheets and the Drop goal card; every sheet has a close cross top right; no ticket prompts once the tickets step is answered or skipped. |

The sandbox has none of the later Version 1 work (no ticket removal, no stay rework, no calendar changes, no fixture fix). If these
hygiene pieces should also reach the sandbox, they need to be copied across: the sandbox cannot share Version 1's files.

## Version 1

### Plan tab layout and dates (PR #663 and earlier commits)
- `bdb3802` Dates step: the slider and typed First day / Last day fields replaced by one range calendar (Your days step, Your days
  sheet, Your answers). Version 1 got its own copies of `concepts-third-half.js` and `concepts-flow-c.js` in `v1/`.
- `f6f26f9` The read-only tournament strip above the calendar removed (the calendar marks the same matches).
- `202fa35` Matches outside the days hidden below the team cards; Also on in NSW lists other NSW matches inside the days; fan zones
  and watch parties list and map (sample data, marked Sample); map sits above the match cards; new plan layout (vertical timeline,
  dotted empty days, free days with Suggest ideas, List/Map toggle, getting there / where / when on day cards).
- `9d6eacb` Hero photos removed from the Plan page; the plan starts at the slogan.

### Team hand (PR #664, #665)
- `73bae14` Six team cards to a row, text-only Find and Grid, "No team" line dropped. Fix: tapping Grid or Find scrolled the page and
  lost the tap.
- `34746a9` Hand centred; press and hold moves it along its arcs.
- `970d0fc` The hand stays where it is let go; Find and Grid keep their icons, without borders.

### Questions and defects, Parts 1 and 2 (PR #666, `433eb41`)
- Tickets step and every "I have tickets" control removed; steps are now your team, your days, where you're staying. Saved state
  migrates (`flow-c:` version 3).
- Matches inferred from team and dates, each with a quiet Remove (kept in `state.notGoing`, comes back from Also on in NSW).
- "Plays in NSW" switch removed; the NSW tag always shows.
- "Show every NSW match" means no team: nothing inferred, NSW matches inside the days listed with Add.
- "Watch in NSW" is now "Find the fan zones" everywhere; "Add" then "Added" everywhere; nothing outside the dates on team cards; counts
  and sheets agree; close cross on the Your plan sheet; "Share and export options" with a Share row; plan map pins only where a day's
  own things are; one ideas list shared by the plan list and the full-screen map.
- Archive snapshot taken first (`7fca3c8`, `a5ce6f9`, below).

### Calendar follow-ups (PR #666)
- `6d886de` Calendar key restored on the dates step; NSW matches tinted in Your matches.
- `c0a9196` Two markers only (own team's NSW match, later-round NSW match; every NSW match with no team); key between Your matches and
  the calendar; **kick-off fix**: Semi-final 1 now 8:00pm (was 9:00am, UTC) and Bronze Final 7:45pm (was 8:45am), via
  `v1/v1-fixtures.js`. The other 42 fixtures were range-checked only, not verified against an official schedule.
- `2a17a8d` Match dot and later-round diamond stay orange on a selected day.
- `af9325c` Marked days show their matches and places on hover, focus, or a long hold on touch.

### Where are you staying (PR #666, `18275bf`)
- Quick answers follow the person's matches: Sydney CBD, Around Olympic Park, Around Moore Park, Newcastle (Sydney CBD and Newcastle
  when there is no NSW match). Bondi and Outside NSW are no longer buttons; saved values still work.
- One builder for step 3, the Your days sheet's stay panel, and the Your answers card (the sheet used to be an older separate panel).
- Quiet "Staying outside NSW" link under the place search.
- "Still deciding where to stay" replaces "This is my best guess"; valid with no place; kept on reload.
- `v1/v1-places.js` adds Moore Park (coordinates from the Sydney Football Stadium). A stay in a stadium's own precinct gets a
  walk-only route (my addition).
- Annotations, `v1/README.md` and tests updated.

## Archive, tooling, tests
- `a5ce6f9` `scripts/archive-snapshot.mjs` (inverse of `archive:restore`); `7fca3c8` snapshot `archive/2026-11-26/v1-b`.
- Not from this session: the pinned-bar Back and card-deal motion, the handover and catch-up tests, the first Version 1 / Version 2 archive, and
  all Version 2 work. They came from other sessions' branches (PR #657 to #661) and are not described here.
- Tests: `chooseStay` helper; three specs switched to it; new `stay.behaviour.spec.js` (6 tests, passing). Full behaviour suite last
  run was still in progress at the time of writing (164 of 193 passed, one failure in my new spec, since fixed and re-run green).

## Still owed
- Parts 3 and 4 of the 26 Nov brief (knockout days with teams to be decided; teams with no NSW match; the travel-expert plan page)
  wait for your answers to the open points.
- Desktop pass on the stay panels; low fidelity, reduced motion and keyboard checks across today's changes.
- Visual baselines to re-approve in CI; dead ticket code to tidy.
- UTC kick-offs remain in the shared fixtures, Version 2, the sandbox and the RWC pages.
