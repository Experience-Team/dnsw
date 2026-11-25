# Handover: 25 November 2026, Figma export, toasts, pictures and polish

25 November 2026 (Sydney). Repo `Experience-Team/dnsw`. Branch used: `claude/nice-hypatia-0g0sku`. Merged this session:
#643 to #647, plus this handover's own PR. Pull main before starting (`git fetch origin main`) and compare against
`origin/main`.

**Another session was working at the same time** (`claude/happy-cori-ydy1fg`, #648 to #654). It archived Options A and B,
made the old Option C into Version 1, and put Version 1 and Version 2 in one viewer as tabs
(`prototype-pick-your-team.html?version=1` and `?version=2`, each its own page in a frame:
`prototype-pick-your-team-v1-frame.html` and `prototype-pick-your-team-v2-frame.html`). This handover uses those names.
Where the notes below say "Option C", read Version 1. That session's own notes are the place for the viewer, the
archive and the social work; this file covers only what this session did.

## Start here

Nothing is half-built. Things waiting on the user, in the order they are likely to come up:

1. **Before production: bring focus rings back.** They are hidden for a video. Delete `public/wireframes/no-focus-ring.css`
   and its `<link>` in the four pages that load it (each is marked TEMPORARY): the two frame pages,
   `drop-goal/index.html` and `v2/drop-goal/index.html`. Then delete the test "Focus rings are hidden for now" in
   `tests/regression/polish.behaviour.spec.js`, and the two lines in `v2.behaviour.spec.js` that take the sheet out
   before the pitch's ring is checked.
2. **More pictures.** About 113 places have a thumbnail and about 52 pictures suit them. Most wanted: the eight named
   stadiums, pub and club exteriors, beaches, a museum interior, fans on a train or walking to a ground. When files
   arrive, see "Pictures" below for the two steps.
3. **Licence to confirm:** `rugby-2.jpeg` and `rugby-match-1.jpeg` look like Rugby World Cup 2023 press photos.
4. **Version 2's game, the user's call:** The Rocks and Hunter Valley have real pictures in the folder but still show
   their posters (`image: null` in `v2/drop-goal/places.js`). A test uses The Rocks as its poster example, so change
   that test with it.
5. **Version 1 has not had the polish pass** Version 2 got. Offered, not asked for.
6. **The open plan's line** "Your plan is currently saved to this device only…" was left in Version 1. Offered for
   removal, not asked for.

## What was done

### Figma export (no repo change)
- Nine key screens of Option C, low fidelity, 390 × 844, as editable layers on Page 6 of the Rugby World Cup file
  (section "Option C · low fidelity · mobile 390", node `468:2`).
- Made with Figma's HTML import: each screen was captured from the running prototype as a static, self-contained page
  (styles inlined, phone-width media queries baked in, hidden layers emptied, scroll positions kept) and posted to the
  import. Layer names come from the markup; nothing is a component.
- The dnsw cloud environment's allowed hosts gained `mcp.figma.com` for this (approved by the user). It stays allowed.
- Two glitches fixed by hand in Figma: the "In NSW" pills (wrong font and size) and Home's article cards (one column
  instead of two).

### Phone links keep the option (#643)
`pv-device.js`: the QR code, Copy link and Open in desktop keep whichever `flow=` the viewer shows. The other session
has since reworked these addresses for the tabbed viewer; its tests cover them now.

### Toasts (#643, CLAUDE.md check 11 rewritten in #647)
- One sentence of body text with at most one link, a small pill that hugs its text. 4 seconds (was 6). A tap closes it;
  the cross is gone. 90% opaque. A sheet or layer that opens after a toast showed puts it away.
- Code: `toast(text, action, key)` in `concepts-teams.js` and `v2/v2-teams.js` (the signature lost its title and detail
  arguments). `toastOver()` lists the sheets and layers open now; a toast remembers them when it shows.
- `changeToast(title, verb, none)` in the third-half scripts still takes `verb` and `none` from its callers but no
  longer shows them. Left, to keep the callers untouched.
- Styles are in `shared.css` (`.tp-toast`), shared by both versions.

### Pictures (#644)
- `IMG_ALIAS` in `pv-device.js` was rebuilt: every thumbnail name is listed under the list it shows in. A picture
  belongs to one place; the same place keeps its picture everywhere; places of a kind share only when pictures run out.
- Home in both versions shows no picture twice among At a glance and the article cards (tested).
- The six articles' pictures and the pictures inside them are named in `concepts-articles.js`.
- Version 2's game: three places that used a picture seen elsewhere got their own. Places with no picture keep their
  poster.
- **When new pictures arrive:** add each file to `IMG_FILES` in `pv-device.js` (name and file type), then point the
  thumbnail names at it in `IMG_ALIAS`. `assets/images/README.md` says which still share and which files are unused.

### Smaller changes
- **"Saved on this device only. Keep a copy so you do not lose it." removed (#645)** from Version 1's Save & share
  sheet and from Version 2's Your plan sheet and its Save & share. In Version 1 the note box is hidden while empty and
  shows again for the "Sent to…" line.
- **Focus rings hidden (#646)**, see "Start here".
- **Version 2 polish (#647)**, all in `v2/v2.css` and `v2/drop-goal/game.css`: the page ends on the dark footer (the
  strip of page colour under it is gone), the footer's text lines up with the content on a wide screen, the places
  list is one centred column on a wide screen, and the viewer panel's Version 1 block sits in the gutter. The other
  session's viewer now hides that block inside the tabs.
- **Where to watch (#647, `shared.css`)**: the ticket lines sit level with their icons. The match name is a link inside
  the sentence and had kept a button's 36px height.
- **CLAUDE.md (#647)**: check 11 describes the toast as built, and check 9 under Build notes gained the paragraph on
  checking rows in the states where they have content.

## Catch-up done for this handover

1. Full behaviour suite: 150 passed before the changes below, and again after with the new file.
2. Tests added, `tests/regression/polish.behaviour.spec.js` (8): the toast's one line and 4 seconds, a toast going
   when a sheet opens, the Where to watch line and icon, the removed line in both versions, Home's pictures in both
   versions, the hidden focus rings, and Version 2's page end on a phone and a wide screen.
3. Low fidelity and reduced motion, looked at once: the toast (it wraps to two lines at 390 in low fidelity and only
   fades with reduced motion), the Where to watch line and Version 2's page end.
4. Annotations: the two that described the old toast in `prototype-pick-your-team-v1-frame.html`. README: the stale
   placeholder table in `assets/images/README.md` replaced with where the list of record is and what is still shared.
5. Removed: the unused second line of the ticket toast in both third-half scripts, and `.v2-sv-note` in `v2/v2.css`.

## Not done

- The Figma frames show Option C as it was on the morning of 25 Nov; nothing since is in them.
- No screenshots baselines were made (the visual suite still has none, as the Version 2 handover says).
- Version 1's Save & share on desktop was never looked at after the line was removed (the capture script could not
  find the button). The behaviour is tested on a phone.
- The thumbnails were looked at on Home and the plan page at 390 wide only, not on desktop or inside sheets.
- `v2/README.md` was not updated for the polish; the other session edited it the same day.
- The first FAQ question on Home wraps earlier than the others. Fixing it means touching the text, so it was left.
- Version 2's floating menu and Your plan buttons pass over text and Add buttons as the page scrolls. Left as how a
  floating control behaves; raised with the user, no answer yet.

## Decisions the user made this session

- Toasts: shorter, body text only, 90% background, gone when a sheet opens. The wording in CLAUDE.md check 11 was
  approved with "approved". The cross's removal and keeping the link were Claude's calls, reported and not objected to.
- Pictures: replace repeats, and say when they run out. Two batches were uploaded (30, then 7).
- Focus rings: hidden for a video, to come back for production.
- Polish: alignment and spacing only; no text, style or behaviour changes.
