# Wireframe Builder — Skill

Build low-fidelity, greyscale HTML/CSS wireframes that mimic the structure of the Destination NSW live sites (sydney.com and visitnsw.com). Output is rendered in-browser with no real imagery or colour beyond greyscale, plus themed accent colours per site.

---

## When to invoke

Use this skill when the user asks to:
- Build a new wireframe page
- Add or edit a component
- Switch between Sydney / NSW themes
- Add a page to the nav (active or disabled)

---

## File structure

```
public/wireframes/
  index.html            ← launch screen; lists all pages (disabled until built)
  shared.css            ← all wireframe styles and component CSS classes
  includes.js           ← fetches [data-include] partials; no build step needed
  components/
    nav.html            ← sticky nav: sydney.com | visitnsw.com | sections | AU, search, saved; hides on scroll down
    hero.html           ← full-width hero with text overlay bottom-left
    newsletter.html     ← "Discover Somewhere New" full-width banner
    footer.html         ← social icons + acknowledgement + 5-col links + bottom bar
  pages/
    home.html           ← homepage (Sydney/NSW switchable)
    [add more here]
  themes/
    sydney.css          ← --color-accent: #005EA2 (blue)
    nsw.css             ← --color-accent: #00563C (green)
```

**Rules:**
- `shared.css` defines all component CSS classes. Never add per-page `<style>` blocks for shared patterns — update `shared.css`.
- Include nav, hero, newsletter, footer via `<div data-include="..."></div>`. These are the same across all pages.
- Sections with variable content (carousels, grids, deals, text blocks) are written inline in each page file using the CSS classes from `shared.css`.
- Add new pages to `wireframes/pages/` and register them in `index.html`. Set `class="disabled"` until built.
- Scripts inside data-include partials execute normally after include.

---

## Component catalogue

### Included via data-include (same structure on every page)

| Component | File | Notes |
|-----------|------|-------|
| Nav | `nav.html` | Both sites left (black tab on the current one, from `data-site`), sections centred (current one bold; Destinations, Things to do and Events open `.nav-drop` dropdowns; Events leads with the "🏉 Rugby World Cup 2027" pill `.nav-menu-feature`), AU + search + saved right. Below 72rem: hamburger flyout with the same sites, pill, sections and region. Hides on scroll down, back on scroll up (`body.nav--hidden`); size and motion in `--nav-h` / `--nav-ease` |
| Hero | `hero.html` | Full-width checkerboard placeholder; headline + tagline overlay bottom-left |
| Newsletter | `newsletter.html` | Full-width banner; heading, body, outline-white CTA |
| Footer | `footer.html` | Social icons, acknowledgement, 5-col links, bottom bar with logo boxes |
| Randomiser | `randomiser.html` | "Feel new in Sydney": 3 cards start as a stack, tap to spread and reveal cryptic headings linking to articles; "Shuffle again" restacks. Sits at the bottom of a page, above the newsletter |

### CSS class components (inline in page HTML)

| Pattern | Classes | Notes |
|---------|---------|-------|
| Intro block | `.intro-block` | h1 + body + "Read more" link; full-width white bg |
| Section wrapper | `.section` | White bg; `.section-header` for title + view-all alignment |
| Tab bar | `.tab-bar` | Horizontal tabs; add `.active` to selected button |
| Card carousel | `.carousel` | Flex scroll row; wrap in `.carousel-wrap`; add `.carousel-nav` prev/next |
| Event card | `.event-card` | Image + badge + venue + title + date + price + bookmark |
| Content card (overlay) | `.content-card` | Square image with `.card-overlay` title + meta; use in `.grid-4` or `.grid-5` |
| Article card | `.article-card` + `.featured`/`.small` | Full-bleed image with overlay tag + title |
| News grid | `.news-grid` | 1 large left + 2 stacked right layout |
| Deals card | `.deals-card` | Horizontal: image left + text body right |
| Editorial / promo banner | `.promo-banner` | ~16rem tall; full-width image bg; white text + CTA overlay |
| Text block | `.text-block` | 2-col text with heading |
| Hero countdown | `.hero--countdown` + `.hero-countdown` (`data-countdown="ISO date"`) | Days, hours, mins, secs ticking in the hero, right of the headline (stacks on mobile). `role="timer"`; after the date it shows an ended state linking to the matches |
| Breadcrumb bar | `.page-switcher-bar` | Inner pages only: breadcrumb left + Share/Save right. Side padding lines up with `.container` content; wraps on narrow screens |
| Location tiles | `.loc-tiles` > `.loc-tile` = `.loc-map` (`data-map`) + `.loc-tile-body` (`.loc-facts`, `.loc-tbc`, `.loc-stay` + `.loc-stay-card`, `.loc-more`) | Landscape cards, one per row (stacked on mobile). Static schematic SVG map (`.m-*` classes): stadium, dashed likely fan zone, stations, product pins grouped by `.m-pins[data-cat]`. `.loc-chip` toggles (`aria-pressed`) show stay (on by default), food and drink, attractions, events. `data-reveal` rises the cards in once on scroll. Fan zone sits last under `.loc-group-head` > `.loc-group-title`; `.loc-tile--fan` + `.loc-confirmed` pill and `.m-fan--confirmed` (solid) for a confirmed zone |

### RWC planner ("Plan your 3rd half") components

Greyscale-only, low-fidelity set for the Rugby World Cup trip planner. Rules in `planner-brief.md`; live examples on `planner-components.html`. Wrap every planner screen in `.pl-scope` (layout switches on its width via container queries, so desktop and mobile frames can sit side by side).

| Pattern | Classes | Notes |
|---------|---------|-------|
| Match block | `.pl-match` | Fixed item: heavy border, no controls. `.pl-match-list` + `.pl-match-list-more` for a fixture list with a "Show all" toggle (`data-expand-list`). `.pl-match-filters` (team `<select>` + stadium `.pl-filters` buttons) filter by `data-teams` / `data-venue` on each `li`; `.pl-match-empty` empty state with Clear filters |
| Gap header | `.pl-gap` | Dashed box: length of free time + where/when |
| Option card | `.pl-option` in `.pl-options` (row of 3) | `.is-locked` state; `.pl-option-empty` for empty states |
| Map placeholder | `.pl-map` + `.pl-ph` | Grey box with X + label; stop list with `.pl-map-stop` / `.pl-map-leg` |
| Set-up sentence | `.pl-setup` (+ `--pinned`) | Each `.pl-slot` wraps a `<select>` |
| Annotation | `.pl-annotated`, `.pl-marked` + `.pl-marker`, `.pl-notes` | `--gutter` / `--above` keep markers off text |
| Team picker | `.pl-team-picker` (`data-team-picker`) > `.pl-team-btn` (`role="combobox"`) + `.pl-team-pop` > `.pl-team-list` (`role="listbox"`, groups per pool) | Custom select-only combobox: arrows, Home/End, type-ahead, Enter, Escape. Team kit colours via `--c1`/`--c2` on swatches and bars only (`data-light` for white kits), the one exception to greyscale |
| Match picker | `.pl-match-picker` (`data-match-picker`) > `.pl-slot-btn` + `.pl-match-pop` > `.pl-match-set` (fieldset) > `.pl-match-opt` | Custom multi-select fed by `#rwc-fixtures` JSON and the team picker's `teamchange` event: the team's NSW pool matches (ticked) plus knockouts they could reach. Empty states: no team yet; team with no NSW pool matches |
| Multi-select slot | `.pl-multi` (`data-multi-picker`, `data-placeholder`) > `.pl-slot-btn` + `.pl-multi-pop` > `.pl-multi-grid` > `.pl-multi-opt` (checkbox + `data-emoji`/`data-label`) | Emoji option cards, pick any number. Slot shows up to two picks, then "+ N more"; placeholder when none. Done, Escape or outside click closes |
| Multi-choice slot + panel | `.pl-slot-btn` (`aria-expanded`), `.pl-panel`, `.pl-checklist` | Panel opens below the sentence, full width on mobile |
| Filled slot + category filters | `.pl-slot-text`, `.pl-filters` (`.pl-btn` with `aria-pressed`) | Dashed slot reflects the chosen filters |
| Entry modules | `.pl-entry`, `.pl-entry--compact` | RWC page (full sentence) and team pages (team pre-filled) |
| Plan layout | `.pl-plan` > `.pl-plan-timeline` + `.pl-plan-map` | Sticky day map on wide; hidden on narrow, where `.pl-toggle` shows per-day maps |
| Editing | `.pl-gap-tools` + `.pl-quick`, `.pl-swap` + `.pl-swap-head`, `.pl-row--notice`, `.pl-randomiser` > `.pl-deck` / `.pl-reveal` > `.pl-deck-card` | Randomiser = the site's existing component: 3 stacked cards that spread to reveal cryptic headings (on the site they link to "feel new" articles; in the planner, to listings) |
| Check my plan | `.pl-add` > `.pl-field` + `.pl-input`, `.pl-results`, `.pl-check-list` > `.pl-check` (`.is-problem`, `.is-unmatched`), `.pl-flag`, `.pl-tag--solid` | Problem cards come first; solid tag for "Change needed" only |
| Take it with you | `.pl-sheet-layout` > `.pl-sheet`, `.pl-export`, `.pl-pre`, `.pl-table`, `.pl-page` + `.pl-ticks`, `.pl-linkbox` | Panel beside the plan on wide, sheet from the bottom on narrow |
| States | `.pl-loading`, `.pl-empty`, `.is-tbc` (option, also on, match), `.pl-note` | No spinner graphics; TBC = dashed border plus a tag |
| Day, rows, chosen, also on | `.pl-day`, `.pl-day-head`, `.pl-row`, `.pl-option.is-chosen` + `.pl-option-status`, `.pl-also` | Unchosen options use a single "Add to plan" control |

RWC team choice: the RWC page has a "Who are you supporting?" chooser in a prominent sticky band straight under the breadcrumb (`.rwc-team-bar`; sticks under the nav, or at the top while the nav is hidden) (a second `data-team-picker`). One team drives every team control (selector, planner sentence, match filter) through `window.rwcSelectTeam`, which also fires `teamchange`, shows Clear team in the chooser, retargets the countdown, moves Matches in NSW above the planner, shows the Find your people placeholder and puts the team's stadiums first (cards never collapse). Kept in `sessionStorage` (`rwc-team`); `?team=Japan` / `?team=none` preview a state without saving. Find your people (`#rwc-find-people`, rendered by `renderPeople`): one line before a team is chosen; with a team, up to four parts (country house, where fans watch, team moments, supporters' club), each shown only when the team has content, in `.grid-2.rwc-people-grid`. Teams with no NSW pool matches see it first, a "doesn't play in NSW" matches state and "no matches yet" in the planner. Clear team (next to the selector) resets the page to the default and removes the saved team. With a team, Matches in NSW becomes "[Team]'s matches" (`#rwc-team-view`): every pool match in Sydney time, rows outside NSW with "Watch in NSW" links to `#rwc-fan-zone` and `#rwc-people-watch`; a possible path to NSW (`#rwc-path`, teams with no NSW matches) and a live match line (`#rwc-live`); "Show all 17 matches in NSW" switches back to `#rwc-nsw-view`. Fixtures in `#rwc-fixtures`: the 17 NSW matches, then 27 placeholder matches outside NSW (`away: true`), in the same order as the results page's `plan-fixtures`. Dropdown options carry `.pl-team-where` (Plays in Sydney / Newcastle / Sydney and Newcastle / Watch in NSW). The planner sentence starts "I'm [going to / watching] [Team] matches [on dates]" (`#rwc-plan-mode`, `data-key="mode"`); watching lists all pool matches and the results page turns match blocks into watch blocks. Teams with no NSW matches: matches, find your people, plan (watching), then the fan zone first, with the stadium cards (still open) under a "Stadiums in NSW" heading (`#rwc-stadiums-head`). Before, South Africa, Japan and Japan watching states, annotated: `rugby-world-cup-team.html`.

Planner results prototype: removed on 2026-11-03 (`pages/rugby-world-cup-plan.html` deleted; the `.plan-*` rules in shared.css stay because the planner screens use them).

Planner review pages (`planner-components.html`, `planner-screen-N.html`) use `body.cp-page` and the `.cp-*` chrome in shared.css: annotated desktop frames plus 375px mobile frames (`.cp-frame--screen` clips to one 375 × 667 screen).

### Grids
- `.grid-5` — 5 equal columns (Discover the best / Places sections)
- `.grid-4` — 4 equal columns (Season sections)
- `.grid-3` — 3 equal columns
- `.grid-2` — 2 equal columns

---

## Theme system

Two themes, applied as a class on `<body>`:

| Class | Site | Accent colour |
|-------|------|--------------|
| `theme-sydney` | sydney.com | `#005EA2` (blue) |
| `theme-nsw` | visitnsw.com | `#00563C` (forest green) |

The nav toggle switches both the body class and `#theme-sheet` href. Nav, buttons, tabs, links, and active states all use `var(--color-accent)` so they flip automatically. No HTML changes needed between themes.

---

## Wireframe style rules

- Greyscale only: `#111`, `#444`, `#888`, `#bbb`, `#ccc`, `#f0f0f0`, `#f9f9f9`, `#fff`
- Image placeholders: `.ph-img` — `background: var(--color-placeholder)` with "Image" label
- Text placeholders: lorem-style dummy text at the appropriate scale
- No shadows, gradients, or icon fonts — flat boxes only
- Font: `system-ui` — no web font imports
- Accent colour (`var(--color-accent)`) used only for: CTAs, active tabs, links, nav toggle active state

---

## How to add a new page

1. Create `wireframes/pages/<page-name>.html` — copy the template below.
2. Add to `index.html` pages list with `class="disabled"` until ready.
3. Compose with `data-include` for nav/hero/newsletter/footer.
4. Write sections inline using CSS classes from `shared.css`.
5. If a new section pattern is needed, add its CSS to `shared.css` and document it in the component catalogue above.

### Page template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Wireframe — [Page Name]</title>
  <link rel="stylesheet" href="../shared.css" />
  <link rel="stylesheet" href="../themes/sydney.css" id="theme-sheet" />
</head>
<body class="theme-sydney">

  <div data-include="../components/nav.html"></div>
  <div data-include="../components/hero.html"></div>

  <!-- Page sections go here -->
  <div class="intro-block">
    <div class="container">
      <h1>Page title</h1>
      <p>Intro text.</p>
    </div>
  </div>

  <div data-include="../components/newsletter.html"></div>
  <div data-include="../components/footer.html"></div>
  <script src="../includes.js"></script>
</body>
</html>
```

---

## Build log

| Date | What was added |
|------|---------------|
| 2026-06-25 | Skill scaffolded from Figma audit of Page 64 (sydney.com category page) |
| 2026-06-25 | Homepage built (Sydney/NSW switchable); all component CSS in shared.css |
| 2026-10-28 | RWC planner brief + reusable planner components (`planner-components.html`, `.pl-*` in shared.css) |
| 2026-10-28 | Planner screen 1: entry points and set-up (`planner-screen-1.html`); entry section added to the RWC page |
| 2026-10-28 | Planner screen 2: plan view and maps (`planner-screen-2.html`) |
| 2026-10-28 | Planner screen 3: editing and Surprise me (`planner-screen-3.html`) |
| 2026-10-28 | Planner screen 4: Check my plan (`planner-screen-4.html`) |
| 2026-10-28 | Planner screens 5 (Take it with you) and 6 (states and fidelity review); `gap` wash is grey on planner pages |
| 2026-10-28 | Randomiser site component (`components/randomiser.html`), added to the bottom of the RWC page |
| 2026-10-28 | Real RWC fixtures on the RWC page ("Matches in NSW", `.pl-match-list`, first 5 shown, "Show all" toggle); replaces the placeholder match carousel |
| 2026-10-28 | RWC Host venues: real venue data (location, matches, capacity) using `.img-card-meta` lines; Newcastle Stadium labelled Broadmeadow |
| 2026-10-28 | RWC "Stadiums and fan zones": location tiles replace Host venues (`.loc-*`, reveal on scroll); fan zone FAQ rewritten |
| 2026-10-28 | RWC planner entry: custom team picker with all 24 teams grouped by pool, in team colours |
| 2026-10-28 | RWC hero: countdown to the first NSW match (Japan v Samoa, 3 Oct 2027) |
| 2026-10-28 | RWC planner entry: custom match picker with the chosen team's real NSW fixtures |
| 2026-10-28 | RWC Stadiums and fan zones: landscape cards with static vector maps, pins and category toggles |
| 2026-10-28 | Nav: featured Rugby World Cup button in the hamburger menu |
| 2026-10-28 | RWC planner entry: interests slot is a multi-select with emojis |
| 2026-10-28 | RWC Stadiums and fan zones: fan zone moved to the bottom under its own heading, shown as confirmed (Tumbalong Park) |
| 2026-10-28 | RWC Matches in NSW: filter by team and stadium |
| 2026-10-28 | RWC planner results prototype (`pages/rugby-world-cup-plan.html`); Start planning opens it in a new tab |
| 2026-10-28 | Planner results: added ideas appear in the Your trip panel by day, each opening a simple modal |
| 2026-10-28 | RWC page: choose your team once (selector, sticky Supporting bar, page reorder); review page `rugby-world-cup-team.html` |
| 2026-10-29 | RWC page: Find your people section, and the no-NSW-matches team state |
| 2026-10-29 | RWC page: Clear team (selector and Supporting bar) resets the page to its default and forgets the choice |
| 2026-10-29 | RWC pages: `.page-switcher-bar--contained` lines the breadcrumb and Share/Save up with the content on wide screens |
| 2026-10-29 | RWC page: [Team]'s matches for every team (outside-NSW rows, Watch in NSW), dropdown labels, possible path, live match line, going to / watching in the planner, watch blocks on the results page |
| 2026-10-29 | Breadcrumb bar aligned with the content on every inner page (modifier removed, now the default) and wraps on phones; RWC stadium and fan zone cards never collapse; planner reads "[Team] matches"; `distance_to_venue` added to the contract (§7) and shown on RWC hotel cards |
| 2026-10-30 | RWC hero: typical weather at kick-off under the countdown (`#rwc-countdown-weather`, climate averages, emoji, "not a forecast"); countdown hero grows with its content on phones |
| 2026-10-30 | RWC team dropdowns: "Show teams playing in other states" checkbox (`.pl-team-toggle`, off by default) hides the 9 teams with no NSW pool matches (`data-outside`); a chosen team always stays listed |
| 2026-11-01 | `experiments.html`: a page for trying component ideas away from the page (cp-page shell, one `cp-section` per experiment). First experiment: a working copy of the Plan your 3rd half planner. Linked from the index |
| 2026-11-02 | Site nav restyled (components/nav.html): both sites left with a black tab on the current one, sections centred (current bold, dropdowns for Destinations / Things to do / Events), AU + search + saved right; hamburger below 72rem. Hides on scroll down, slides back on scroll up (`body.nav--hidden`, `--nav-h`, `--nav-ease`); sticky bars under it follow |
| 2026-11-02 | `pages/rugby-world-cup-v1.html`: frozen copy of the RWC page as of this date (title says V1, listed in the index). Keep editing `rugby-world-cup.html`; leave V1 as the snapshot |
| 2026-11-02 | Utility bar (`components/utility-bar.html`) cut to the grid (wireframe index) and the saved RWC landing page versions, currently just "Rugby World Cup V1"; add a link there for each new version. The open version shows white |
| 2026-11-02 | Utility bar: "Latest" (always `rugby-world-cup.html`) before the saved versions. RWC page (latest): intro removed; team chooser is a prominent sticky band under the breadcrumb (`.rwc-team-bar`), annotation removed; it replaces the Supporting bar. `rugby-world-cup-team.html` now documents V1 |
| 2026-11-02 | RWC page (latest): planner sentence form and Start planning removed (no links to the plan page). Fixed order: hero, team chooser, matches, Getting there and around (was Stadiums and fan zones), Find your people, Plan your 3rd half (`#plan`, empty shell for a list), Get Rugby World Cup ready, FAQs, randomiser/newsletter/footer. Team changes fill sections in place; they no longer move |
| 2026-11-02 | RWC page (latest): team chooser moved into the hero below the subheading (`.rwc-hero-team#team`, `.hero--team` lets the dropdown overlay); all 24 teams always listed, NSW teams first in each pool, interstate label "Plays interstate · watch in NSW" (checkbox removed here; experiments.html keeps its copy). The grey sticky band is now the Supporting bar (`#rwc-supporting`: Supporting [Team] · Change · Clear team), shown once a team is chosen. Countdown: the team's next NSW match; no NSW matches keeps the first NSW match and adds "[Team] play interstate. Here's where to watch in NSW." |
| 2026-11-02 | `third-half-list.js` (loaded on the RWC page only): Plan your 3rd half list data layer. `window.thirdHalfList` = addItem, removeItem, toggleItem, hasItem, getItems, clearItems, count, getTeam; event `thirdhalf:change` on document (detail: action, item, items, count, team). localStorage key `rwc-3rd-half` = { team, items }, falls back to memory. Item fields: id, name, type, area, address, distanceToStadium, url, section. The RWC page's team is now saved here (was sessionStorage `rwc-team`); teamchange detail.save=false (previews) isn't saved |
| 2026-11-02 | RWC page: "Add to my 3rd half" toggle (`btn btn-outline-dark btn-sm`, `data-th-add`, aria-pressed, "Added ✓") on Find your people venues and Stay nearby hotels. The card carries the item as `data-th-id/name/type/area/address/distance/url/section` (placeholders); hotels are wrapped in `.loc-stay-item` so the button sits outside the card link. One script toggles via `thirdHalfList.toggleItem` and re-syncs on `thirdhalf:change` (`window.rwcSyncThirdHalf(root)` after re-rendering) |
| 2026-11-02 | RWC page: Supporting bar (`.rwc-team-bar#rwc-supporting`) shows from page load. Left: "Choose your team" (`#rwc-supporting-choose`, opens the hero chooser like Change) until a team is chosen, then "Supporting [team] · Change · Clear team". Right: "Your 3rd half (n)" (`#rwc-th-open`, `btn btn-outline-dark btn-sm`, count in `#rwc-th-count`) following `thirdhalf:change`; an add briefly fills the count (`.is-bumped`, no fade with reduced motion); click logs the list for now. Sticky under the nav from 768px; fixed to the bottom of the screen below 768px (body gets bottom padding) |
| 2026-11-02 | RWC page: `window.buildAiSummary()` (Markdown for an AI assistant: title, planning request, My details with team, matches, getting to the stadium from the stadium cards, fan zone; saved places table; official info; source) and `window.buildPlainList()` (title, short match lines, "Name, Area: link"). No team: no team or match lines, all three stadiums' transport. Empty list: "No places added yet." No NSW matches: interstate matches plus "Watching in NSW at the fan zone". Uses the team the page shows (`window.rwcGetTeam()`, added to the controller). Both logged on page load; no UI yet |
| 2026-11-02 | RWC page: "Your 3rd half" panel (`.rwc-th-overlay#rwc-th-panel` > `.rwc-th-backdrop` + `.rwc-th-panel` role=dialog), opened by the bar button. Slides in from the right (30rem); below 768px a 90dvh bottom sheet. Heading, intro line, added places (name, area, Remove), empty state "Add places from this page to include them.", read-only monospace preview of `buildAiSummary()` (`#rwc-th-preview`), actions (`data-th-action` = copy-ai / copy-list / share, not wired yet) with helper text, "Clear list" (hidden when empty). Re-renders on `thirdhalf:change`. Close button, Escape or backdrop close it; focus goes to the heading on open, is kept inside while open and returns to the bar button. New `.btn-dark` (filled greyscale primary) next to `.btn-outline-dark` |
| 2026-11-02 | RWC page, 3rd half panel actions: "Copy for your AI assistant" / "Copy as a plain list" copy `buildAiSummary()` / `buildPlainList()`; "Share link" builds `?team=<slug>&items=<id,id>` and uses `navigator.share` on touch screens, else copies it. Inline `.rwc-th-status` (aria-live polite) next to each button: "Copied n places" / "Copied your team details" / "Link copied", cleared after 4s. No Clipboard API: the text goes in the preview box, selected, with "Press Ctrl+C or Cmd+C to copy" (kept). Shared links restore on load (`items` param present): empty list = team saved and items added; own list = panel opens with `#rwc-th-shared` (Replace my list / Add to my list / Keep my list as it is), closing leaves it pending; params removed once settled. Items are rebuilt by id (`window.rwcThItemById`: page card, or any team's venue via `window.rwcVenueItem`). Team lookup accepts slugs (`window.rwcFindTeam`, `?team=new-zealand`) |
| 2026-11-02 | RWC page, Plan your 3rd half (`#plan`): context line (`#rwc-picks-context`: "Around [first NSW match], [date], [stadium]"; no NSW matches: first match "watching at the Tumbalong Park fan zone"; no team: the fan zone), "Why these?" `<details>`, then four groups rendered by the team controller (`renderPicks`) from `#rwc-picks-data`: Before kick-off and After the match near that stadium (or the fan zone), The day after around Sydney or Newcastle, Make a day of it in regional NSW (travel time from Sydney). Cards reuse `.loc-stay-item` / `.loc-stay-card` with "Add to my 3rd half"; type uses the contract's product types; type, distance to venue and travel time carry `.provenance-gap`. Empty group: "No picks here yet." Pick ids `pick-<venue>-before|after-n`, `pick-day-<city>-n`, `pick-region-n`, rebuilt for shared links by `window.rwcPickItem`. "See your 3rd half (n)" (`#rwc-picks-open`, `btn btn-dark`) opens the panel; focus returns to whichever button opened it. `.rwc-plan-space` removed |
| 2026-11-02 | RWC page, scenario pass (no team, Wales, South Africa, reload, team change, clear, shared link in a fresh and an existing browser, 375px and keyboard only). Fixes: `buildAiSummary()` / `buildPlainList()` now list all the team's pool matches by date, marking matches outside NSW "(interstate: watching in NSW at the fan zone)" / "(watching at the fan zone)" when the team also plays in NSW (teams with no NSW matches keep the single "Watching in NSW at the fan zone" line). `shared.css`: `html:has(.rwc-team-bar)` scroll padding so keyboard focus isn't hidden under the nav, utility bar or Supporting bar (top from 768px; top and bottom below 768px) |
| 2026-11-02 | RWC page: "Your 3rd half on the map" in Plan your 3rd half (`#rwc-map`, after the picks) and a smaller copy in the summary panel above the preview, both `[data-th-map]` drawn by one script. Stadium cards' map style (`loc-map-svg`, `m-*`), schematic not a map service: true direction from the Sydney CBD with distance on a log scale; Newcastle and Hunter Valley in an inset. Shows the team's NSW stadiums (all three with no team, none for teams with no NSW matches), the Tumbalong Park fan zone and a numbered black pin per list item (`.m-pin--list`; blue category pins stay on the stadium cards), nudged apart when they overlap. Legend reuses `loc-map-key` plus new `.loc-key-pin`. Clicking a pin shows `.rwc-map-pop` with name, area, Remove and close (Escape or an outside click closes it first). Text version beside the map (`#rwc-map-text`): stadiums, fan zone, numbered places with Remove, "(not on the map)" for unknown areas, empty state "None yet. Places you add show here and on the map." Panel list items are numbered to match. Pins are placed by area from a placeholder lookup (`GEO`) until list items carry the contract's `geo`. Redrawn on `thirdhalf:change` and `teamchange`. Smaller maps (panel, phones) drop labels and enlarge pins |
| 2026-11-02 | RWC page: `buildAiSummary()` adds "How to ask me questions: …" after the planning request, so assistants ask clarifying questions one at a time with short options before planning, instead of scattering them through the plan. Panel: `.rwc-th-body > * { flex-shrink: 0 }` so the scrolling panel body stops squeezing its parts (the preview had shrunk to a line once the panel map went in); preview `min-height: 10rem`, `max-height: 16rem` |
| 2026-11-02 | RWC page: the AI prompt's "How to ask me questions" line now caps questions at two, asked one at a time with options; anything else the assistant assumes and states, then it gives the whole plan, and the fan refines it after |
| 2026-11-03 | RWC page (latest only): visual style from the "Rugby World Cup 2027: NSW Visitor Page" design. New `themes/rwc-2027.css`, loaded only by `pages/rugby-world-cup.html` with Fraunces and Work Sans from Google Fonts, every rule scoped to `body.theme-rwc` (added to the page's body); `shared.css`, shared components and other pages unchanged. Deep teal, coral and sand tokens mapped onto the wireframe's `--color-*`; teal gradient hero with pill team chooser and rounded countdown; white Supporting bar with serif line and teal pill button; rounded card matches with coral dates and a coral call-out for "Want to see a match live?"; teal-tinted Getting there and Plan sections; stadium and fan zone cards and maps recoloured (sand land, pale teal water, coral stadiums, teal fan zones, grey-green list pins); picks as cards with a picture on top; map card; teal promo, serif FAQs, teal randomiser cover, gradient newsletter, teal footer. Behaviour and markup unchanged. Coral buttons use dark text (white on coral fails contrast); faint grey darkened to #6B7A73 for the same reason |
| 2026-11-03 | Deleted `pages/rugby-world-cup-plan.html` (the separate plan page is replaced by the Plan your 3rd half list). Links removed from `index.html`, `components/nav.html` (SECTION map), `rugby-world-cup-team.html` ("Open their plan") and `pages/rugby-world-cup-v1.html` (the Start planning button, its hint and click script went with the link; V1 is otherwise unchanged). `experiments.html` untouched, so its Start planning link now 404s. `shared.css` `.plan-*` rules left in place (still used by the planner screens) |
| 2026-11-03 | `pages/rugby-world-cup-v2.html`: frozen copy of the RWC page (latest) as of this date, including the RWC 2027 restyle and the 3rd half list; title says V2. Added to the utility bar and the index; `rugby-world-cup-v2` added to the nav SECTION map. Keep editing `rugby-world-cup.html`; leave V2 as the snapshot |
| 2026-11-09 | `concepts.html`: a page for component prototypes at phone size only (cp-page shell like `experiments.html`, one `cp-section` per concept, each in a 390 x 844 `.cn-phone` frame). Linked from the index next to Experiments. First concept: Itinerary list view, built from Figma node 42:41 ("M1 - Itinerary list view"): close and title bar, Timeline / List toggle (List active), date range and item count, day groups of item cards (placeholder thumbnail, name, meta, drag handle), "Not yet planned", footer with "Saved on this device only" and Save and share. Styles are `.cn-*` in `shared.css` (greyscale, system-ui). Static for now: Timeline, close, reorder and Save and share do nothing |
| 2026-11-09 | `concepts.html`: Itinerary concept is now five screens in the one phone window (`#cn-phone`, `data-screen` m1 to m5), built from Figma M1 42:41, M2 42:98, M3 43:40, M4 43:141, M5 43:242. Save and share (`#cn-open-share`) opens the bottom sheet (`.cn-sheet`, backdrop, grabber, dialog with the page behind `inert`, Escape or backdrop closes, focus moves in and returns); Spreadsheet tile goes to M3 (blue selected tile with tick, `.cn-toast` status); Send itinerary to M4 (`.is-sent`: blue status dot and text, Sent. Check your inbox, Send again returns to M2); Open in maps to M5 (back chevron returns to M2, day cards with Google Maps / Apple Maps, notes, Download a file). Only the controls linked in Figma are wired; AI assistant, Group chat, Calendar, Copy link, the map buttons, Download a file, Timeline, reorder and the list's close do nothing. A row of jump buttons above the frame (`.cn-screens`) shows any screen; jumping to M4 fills the email and ticks the news checkbox as in the design. States use the Figma blue `#2666d9`, everything else greyscale. Styles `.cn-sheet`, `.cn-view`, `.cn-note`, `.cn-field`, `.cn-check`, `.cn-pill`, `.cn-tile`, `.cn-toast`, `.cn-day-card` in `shared.css` |
| 2026-11-10 | RWC page (latest only), 3rd half panel: "Copy for your AI assistant" now copies the supplied prompt template (`buildAiSummary()` rewritten: trip details, matches, saved places by day and part of the day, Good to know, Source with today's date in Sydney time, What I'd like from you). Places are placed by id (before kick-off, venues, after the match on match day; the day after +1; regional +2; hotels and anything else under "Not yet placed"). One Google Maps directions link per day from `window.rwcGeo` (area, stadium and fan zone coordinates, now exposed by the map script), the stadium between before and after on match days, `travelmode=driving` when `rwcTripSetup.car` is true, a new link every 9 waypoints. Over 8,000 characters it drops When it fits / hours / cost, then Good to know, then (added) Info links, addresses, and finally the last places. No team or matches: "No match selected yet" and the assistant is asked which match. Placeholders, prototype only and not in the data contract: `window.rwcTripSetup` (group, car, budget) and made-up opening hours and typical cost by place type (`DETAIL`); arrival and departure are the day before the first and after the last match. Panel: button disabled with "Save a few places first, then copy your plan." when the list is empty; confirmation "Copied. Paste it into ChatGPT, Claude, Copilot, Gemini or any AI assistant." (alphabetical, `rwcAssistantNames`, shown 10 seconds, aria-live); "Preview what you'll copy" is now a `<details class="rwc-picks-why">` around the read-only preview; copy falls back from the Clipboard API to a hidden textarea and `execCommand`, then to opening the preview with the text selected and "Press Ctrl+C or Cmd+C to copy" (all copy buttons). `copy_for_ai` pushed to `window.dataLayer` and logged ({ event, saved_count, has_match }) on a successful copy. Summary logging on page load moved to the load event |
| 2026-11-10 | `concepts.html`: the AI assistant tile on the Save and share sheet (`#cn-tile-ai`) now works. It copies the itinerary from screen M1 as the same prompt template as the RWC page (`buildPrompt`, `window.cnBuildAiText()`): trip details, the match read from the list item with " v ", places by day then time, "Not yet placed", one Google Maps link per day, Good to know, Source with today's date, What I'd like from you; under 8,000 characters (drops details, Good to know, addresses, then last places). Success shows the M3 state on the AI tile with the toast "Copied. Paste it into ChatGPT, Claude, Copilot, Gemini or any AI assistant." (alphabetical); the Spreadsheet tile keeps its own M3. "Preview what you'll copy" (`<details class="cn-peek">`, read-only `.cn-preview`) sits under the tiles. Copy falls back to a hidden textarea and `execCommand`, then opens the preview with the text selected and "Press Ctrl+C or Cmd+C to copy". `copy_for_ai` goes to `window.dataLayer` and the console. Placeholders, prototype only: `window.cnTripSetup` (team, group, car, budget, arrive, leave) and made-up type, suburb, coordinates, hours and cost per item (`FIX`). No empty state: the prototype list is fixed. The builder is a copy of the RWC page's, not shared |
| 2026-11-10 | Temporary: `middleware.ts` (browser login `preview` / `preview` on every page) removed so the site opens without a password. To put it back, revert the commit that removed it |
| 2026-11-10 | Prototype polish pass on `concepts.html` (skill: `.claude/skills/prototype-polish`). `shared.css` `:root` gains the polish tokens (space, radius, shadow, z-index, durations, easings); the `.cn-*` rules use them where Figma's value is on the scale (odd Figma values such as 9, 10, 11, 14 and 18px stay). Sheet slides in 320ms ease-out and out 30% faster ease-in, backdrop fades, sheet gets elevation; toast rises in; view swaps (form to maps) and the sent state fade; the tile tick pops. States: hover (pointer devices only), pressed scale, disabled Timeline, and an inline error for an invalid email (an empty field is still auto-filled so the prototype can be clicked through). Hit areas grown to 44px on close, back, Send again and the preview link. Tab is kept inside the open sheet. Reduced motion collapses all `.cn-phone` motion. Layout unchanged except the preview link, 4px lower |
| 2026-11-10 | `concepts.html` fix: opening Save and share focused the sheet while it was still off the bottom of the phone, so the browser scrolled the phone (`overflow: hidden` can still be scrolled by `focus()`), which made the sheet appear instantly and shifted the list behind it. The sheet is now focused with `preventScroll`, and `.cn-phone` uses `overflow: clip` so nothing can scroll it. The slide-up (320ms) and slide-down now play, and the list stays still |
