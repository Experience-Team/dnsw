# Wireframe / src architecture report

Read-only investigation. No files were modified, created, or deleted other than this report. Written 11 August 2026, from the `claude/dnsw-wireframe-work-123i8g` branch at commit `c93770d`.

**Read point 3 first if you're skimming.** It's the load-bearing finding: `public/wireframes/` has had continuous, weekly-or-tighter commit activity for six weeks under one directing human. `src/` was fully-formed in the repo's first commit and has had exactly one trivial change since — until this week, when four commits landed that are the DecisionBlock/fixtures work from this session, addressed to nobody yet.

---

## 1. Map the two codebases

### `public/wireframes/`
Static, hand-authored HTML/CSS/vanilla-JS wireframes of Destination NSW's live sites (sydney.com, visitnsw.com) — greyscale, low-fidelity, used for a design-consistency audit and to prototype new page templates (event/accommodation/food & drink/attraction/hire/tour detail pages) against a written data contract. No entry point in the SPA sense — `index.html` is a launcher page listing links to every wireframe page; each page under `pages/` is independently navigable. No build step: pages are served as literal files. Client-side "templating" is limited to `includes.js`, a ~30-line script that `fetch()`es `[data-include]` partials (nav, footer, hero, newsletter, utility bar) and splices them into the DOM at runtime — there is no server-side or build-time assembly.

### `src/`
A React 18 + TypeScript + Vite + Tailwind single-page app, named "DNSW Design and Research Hub" in its own UI copy. Entry point is `src/main.tsx` → `src/App.tsx`, routed with `react-router-dom` (`HashRouter`). Its actual content — user journey maps, a customer journey map, a user story map, adaptive-content and gaps dashboards, a sitemap view — is fetched at runtime from a published Google Sheet CSV (`src/services/sheets.ts`, hardcoded URL) via `src/hooks/useSheetData.ts`. Built with `tsc -b && vite build` into `dist/`.

### Do they share any code?
**No.** Grepping for cross-references in both directions found nothing — no wireframe page imports or requires anything from `src/`, and until this session nothing in `src/` referenced anything under `public/wireframes/`. The single connection is a hyperlink: `src/views/HomePage.tsx` has a "UX" hub card whose `href` is the literal external URL `https://dnsw-phi.vercel.app/wireframes/index.html` — a plain `<a>`-style navigation, not an import, not a shared type, not a shared component. They are two products that happen to live in one repo and deploy from one Vercel project.

### Vercel deployment
One `vercel.json` at the repo root governs both. `vite build` copies `public/` verbatim into `dist/` (Vite's default `publicDir` behavior), so `public/wireframes/*` lands at `dist/wireframes/*` alongside the built SPA (`dist/index.html`, `dist/assets/*`). The rewrite rule —
```json
{ "source": "/((?!wireframes/).*)", "destination": "/index.html" }
```
— sends every request *except* `/wireframes/*` to the SPA's `index.html` (client-side routing fallback), and lets `/wireframes/*` fall through to the static files Vite already copied there. So: one Vercel project, one build, two independently-served trees, zero shared runtime. (There's also `middleware.ts`, a Vercel Edge middleware requiring HTTP Basic auth on every path except `/assets/` and `favicon.ico` — this gates preview deployments generally, not something specific to either codebase.)

---

## 2. Wireframe site inventory

| Page | Product type (contract) | Lines |
|---|---|---|
| `pages/disneys-the-lion-king.html` | event | 254 |
| `pages/intercontinental-sydney.html` | accommodation | 275 |
| `pages/mother-chus-taiwanese-gourmet.html` | food_and_drink | 352 |
| `pages/royal-botanic-garden-and-the-domain.html` | attraction | 272 |
| `pages/sydney-harbour-kayaks-middle-harbour-mosman.html` | hire | 275 |
| `pages/bridgeclimb-sydney.html` | tour | 283 |
| `pages/home.html` | — (homepage) | 334 |
| `pages/home-nsw.html` | — (homepage, NSW theme) | 376 |
| `pages/events.html` | — (category/listing page) | 1814 |
| `pages/accommodation.html` | — (category/listing page) | 739 |
| `pages/western-sydney.html` | — (destination page) | 627 |
| `pages/western-sydney-v2.html` | — (destination page, variant) | 556 |
| `pages/western-sydney-v3.html` | — (destination page, variant) | 717 |
| `pages/western-sydney-airport.html` | — (destination page) | 319 |
| `components-library.html` | — (internal design-audit doc, not a site page) | not counted above |

All **six** product types named in `docs/product-data-contract.md` (event, accommodation, food_and_drink, attraction, hire, tour) have exactly one built wireframe page. The other eight pages are category/listing pages, homepages, or destination pages — none of them map to the contract's per-product schema; they're a different page archetype entirely (they list or introduce many products, rather than detailing one).

**Total: 21 HTML files** under `public/wireframes/` (14 in `pages/`, 5 in `components/`, `index.html`, `components-library.html`), plus `shared.css` (1,727 lines), `includes.js` (31 lines), and two 5-line theme stylesheets (`themes/sydney.css`, `themes/nsw.css`).

### Duplication vs. sharing
- **Shared, zero duplication:** nav, footer, hero, newsletter, utility-bar — each exists once as a file under `components/`, pulled into every page via `data-include`. All CSS lives in one file, `shared.css`; grepping every page file found **zero** `<style>` blocks — no page carries its own rules.
- **Duplicated, not shared:** everything else. There is no card/component partial system beyond those five includes. `.event-card` markup — image placeholder, bookmark button (a ~700-character inline SVG), venue line, title, description, footer — is hand-copied inline on every page that uses it: **109 occurrences of `.event-card` across 12 pages**, each a literal copy-paste, not a templated render. The six new product-detail pages are highly regular with each other (same `.detail-*` class vocabulary, same section order — see report point 5), but that regularity comes from careful hand-authoring against a shared convention, not from a shared template.

### Templating, build step, data layer
**None of the three exist.** Every page is a hand-authored, complete HTML document. `includes.js` is the only mechanism resembling templating, and it's a runtime `fetch`-and-splice for five static partials — it does not interpolate data, does not read the TypeScript fixtures in `src/fixtures/`, and has no concept of a "product record." There is no data layer: content is typed directly into each page's markup as literal text.

---

## 3. History and direction of travel

**Read this section first — it's what should drive the "is this a live deliverable or a snapshot" question.**

One caveat before the numbers: **this repository's git history appears to start mid-project**, not at a true beginning. The very first commit visible in `git log` (`dcfc664`, 29 June 2026, author `moniquep`) is itself a squash-merge that already contains a mature `public/wireframes/` (1,466-line `events.html`, `home.html`, `shared.css` at 1,111 lines) *and* a fully-formed `src/` (all 24 of its original files, 10,388 lines in one commit). Whatever came before that commit isn't in this repo's history — so "first added" below means "first visible in this repo's log," not necessarily "first ever written."

### `public/wireframes/`
- First visible: 29 June 2026 (already substantial at that point, per above).
- **75 commits** touch it, all 75 within the repo's visible history.
- Commits are essentially continuous: dense clusters on 29 Jun, 2–3 Jul, 10–12 Jul, 20–21 Jul, then a **~3-week gap** to 29 Jul (one commit, "Add home button to wireframes launcher"), then quiet until this week (10–11 Aug), which alone accounts for 30 of the 75 commits — the product-detail-page build and the design-consistency-audit fixes done in this session.
- Two commit authors by name: `Claude <noreply@anthropic.com>` (74 direct commits — AI-authored, under human direction) and `moniquep <mopo123@gmail.com>` (1 merge commit visible directly on this path, plus she is the merger of record on every PR into `main` throughout the session history I have direct knowledge of). Realistically **one directing human** (`moniquep`), executing through AI-assisted commits.

### `src/`
- First visible: 29 June 2026, same bootstrap commit as above — fully formed (24 files, includes every current component except `DecisionBlock.tsx`).
- **6 commits total** touch it, ever, in this repo's history:
  - 1 bootstrap commit (29 Jun)
  - 1 trivial commit on 10 Jul ("Update UX hub card link to new Vercel deployment domain" — a one-line URL change)
  - **4 commits, all today (11 Aug), all from this session**: adding `src/types/product.ts`, widening it to nullable, adding `src/fixtures/*`, and adding `src/components/DecisionBlock.tsx`.
- Same two authors by name (`Claude`, `moniquep`), but `moniquep`'s only direct touch is the bootstrap merge.

### Last three months, side by side
| | Commits (last 3 months) | Share of that window's total repo commits (159) |
|---|---|---|
| `public/wireframes/` | 75 | 47% |
| `src/` | 6 | 4%, and 4 of those 6 are today's session |

**Reading:** `public/wireframes/` is the actively-developed, continuously-touched deliverable — a real cadence with a real gap (three weeks in late July/early August) but no sign of abandonment, and a heavy return to it this week. `src/` was a complete, working tool the moment this repo's history begins, and then sat almost entirely untouched for six weeks — one URL fix aside — until this session bolted a product-data type system onto it that nothing else in `src/` references. On the numbers alone, `src/` reads as a separate, settled deliverable (the research/journey-map tool) that this session has started using as a landing spot for new, unrelated work — not as an active area of its own development.

---

## 4. Where DecisionBlock landed, and why

- **Exact path:** `src/components/DecisionBlock.tsx`.
- **Directory contents** (`src/components/`): `AppShell.tsx`, `DecisionBlock.tsx`, `ErrorState.tsx`, `InfoButton.tsx`, `LoadingState.tsx`, `PersonaCard.tsx`, `PillSelect.tsx`. Every file except `DecisionBlock.tsx` was present in the 29 June bootstrap commit and serves the journey-map/persona tool (`PersonaCard` renders a `Persona` from the Google Sheet; `AppShell` is that app's header/nav chrome; `PillSelect`/`InfoButton`/`LoadingState`/`ErrorState` are generic UI chrome for the same tool).
- **Who imports it:** only `src/views/DecisionBlockPreview.tsx` — the temporary preview harness created in this same session, wired into `App.tsx` at the route `/preview/decision-block`. Nothing else in `src/` imports `DecisionBlock`, `src/types/product.ts`, or anything under `src/fixtures/`.
- **Does `src/` have any other component that renders product data?** No. `DecisionBlock` is the first and only component in `src/` that touches the shared product record, `pricing`, or `availability` blocks from `docs/product-data-contract.md`. Every other component renders persona/journey-map/CJM data from the Google Sheet.
- **Convention or one-off?** A one-off. There was no existing "product page" pattern in `src/` to follow — no router route, no page component, no prop shape for a product — so placing `DecisionBlock` in `src/components/` followed the directory-naming convention (components live in `src/components/`) but not any functional convention, because no prior component did this kind of work. The actual instruction to bind `DecisionBlock` to a live page (rather than the preview harness) hit exactly this gap: asked to import it into "the food and drink product page component," none existed, because Mother Chu's only exists as static HTML under `public/wireframes/`. That request was resolved by porting the component's logic into the static page directly (`public/wireframes/pages/mother-chus-taiwanese-gourmet.html`, currently uncommitted) rather than by building a new React page — which is itself evidence for the same conclusion: the two codebases don't currently have a path between them.

---

## 5. Feasibility of a build step (assessment only — nothing built)

### What already exists that could do this
- **Vite + React + `react-dom/server`** are already dependencies. `renderToStaticMarkup` could turn a React component tree into an HTML string; wiring that into a small Node script (invoked via `tsx` or `vite-node`, neither currently a dependency, or compiled with the existing `tsc`) is the path of least new tooling.
- **No templating/SSG library is present** — no Handlebars, EJS, Nunjucks, Eleventy, Astro, Next.js. `package-lock.json` has zero hits for any of these. A build step would either be hand-rolled (template literals over the fixture data) or would need a new dependency.
- `schema_audit.py` (repo root) is an unrelated Python tool for auditing Schema.org markup via the Anthropic API against live URLs — not a template engine, not reusable for this.

### How regular is the existing HTML?
Very, for the six product-detail pages specifically. All six share an identical class vocabulary and section order: `.detail-meta-row` → `.detail-gallery` → `.detail-tabs` → `.detail-overview-row` (with `.detail-highlights`, `.detail-info-card`, optional `.detail-info-contact`) → the "Nearby"/"More Like This"/"Our Tours" grid → `.detail-location-*` → optional FAQ block. Per-record variation is narrow and enumerable: presence/absence of a Booking-details action, presence/absence of `.detail-highlights`, presence/absence of the FAQs tab and section, count of social icons, and the "Nearby" section's heading text and card contents. This is the *product-detail* page type only — the category/listing pages (`events.html` at 1,814 lines, `accommodation.html`) and the destination pages (`western-sydney*`) are bespoke, one-off layouts with far less cross-page regularity, built before any per-type contract existed, and would need separate, harder templatisation work (or none at all, if they stay hand-authored).

### What would break / what's genuinely hard
- **Content that isn't in the contract yet.** The FAQ accordion, the sidebar "Get in touch" reveal, the sticky-tabs scrollspy, the floating newsletter popup, and the read-more/read-less Overview toggle are all interactive JS behaviors authored directly in each page's `<script>` block. A generator would need to either (a) emit the same inline script on every generated page (fine, it's already near-identical per page) or (b) factor it into a shared script file loaded by all generated pages (a real improvement, but a scope increase beyond "generate from fixtures").
- **The fixture set doesn't cover the whole page.** `docs/product-data-contract.md` and `src/types/product.ts` model the product record — they say nothing about breadcrumbs, the photo-gallery hero's specific image count/labels, the tab bar's icons, or the newsletter popup copy. A generator would need a second data source (or hardcoded template chrome) for everything outside the contract's fields, which today is authored by hand per page.
- **Category/listing/destination pages don't fit this model at all** and would need their own approach or would stay hand-authored indefinitely.
- **No asset pipeline exists.** Every "photo" in the wireframes is a grey `.ph-img` placeholder — consistent with the fixtures (which also carry no real image URLs, per `src/fixtures/*.ts`), so this isn't a new problem, but a generator wouldn't change it either.

### Rough effort estimate
- A minimal script generating the six existing product-detail pages from `src/fixtures/*.ts` (Node/TS script, template literals, no new runtime dependency, output written into `public/wireframes/pages/`): **roughly 8–14 hours** — mostly in factoring the current hand-authored HTML into a template that reproduces every current conditional (booking action, highlights box, FAQ tab, social count, contact reveal) exactly, plus verification against each of the six live pages to confirm no visual regression.
- Extending that to also emit the shared JS behaviors from one file instead of six copies: **+3–5 hours**.
- Bringing the category/listing/destination pages into the same system: **not estimated** — they don't share the product-record shape at all, so this would be closer to designing a second contract and generator than reusing the first.

This is an estimate from reading the code, not a spike; treat it as order-of-magnitude, not a quote.

---

## 6. Documentation

- **`.claude/skills/wireframe/SKILL.md`** (153 lines) is the only substantive documentation of what the wireframes are for. It states the wireframes exist to "build low-fidelity, greyscale HTML/CSS wireframes that mimic the structure of the Destination NSW live sites (sydney.com and visitnsw.com)," documents the file structure, the component catalogue, the theme system, and a short build log ("Skill scaffolded from Figma audit of Page 64 (sydney.com category page)," 25 June 2026). **It does not name an audience or consumer** — no mention of stakeholder review, developer handoff, client demos, or any downstream user of the pages.
- **`components-library.html`** (part of the wireframes deliverable itself, authored during this session) states its own purpose in its header copy: "Every UI component used across the wireframe pages, gathered in one place for a design-consistency audit." This is self-documentation within the artifact, not an independent statement of who it's for.
- **No `README.md` or `CLAUDE.md` exists anywhere in the repository** (checked repo root and all subdirectories).
- **`SHEET_TEMPLATE.md`** (repo root, 82 lines) documents the Google Sheet schema that feeds `src/` — it has zero mentions of "wireframe" and is unrelated to `public/wireframes/`.
- **Commit messages and (from this session's direct knowledge) PR descriptions** contain no language about audience, stakeholders, handoff, review cadence, or consumers — they describe *what* changed, not *who it's for*. I did not have API access to systematically re-pull every historical PR body in this pass (I relied on git log, which doesn't carry PR description text for merge commits beyond the title); if there's PR-description context predating this session's own PRs, I did not verify it and am flagging that gap rather than assuming it's silent too.

**This point coming back this thin is itself the finding:** nothing in the repository states who looks at these pages or what happens after they're built. The only two audience signals that exist at all are indirect — the SKILL.md's description of *what* they're modeled on (the live DNSW sites), and this session's own design-consistency-audit framing inside `components-library.html`, which is a stated purpose for one page, not the whole deliverable.

---

## Things I was unable to determine

- **True origin date of either codebase.** This repo's history is squashed/starts mid-project at `dcfc664` (29 June 2026); anything before that — including whether `public/wireframes/` or `src/` existed earlier under a different repo, or how long each was actually in development pre-history — is not recoverable from `git log`.
- **Whether PR descriptions (as opposed to commit messages) discuss audience/consumers**, beyond this session's own PRs, which I know directly and which also don't. I did not have a reliable way to bulk-fetch historical PR bodies read-only in this pass and did not want to infer from title text alone.
- **Whether `moniquep` is the sole human stakeholder** or one of several people who direct this work by other means (e.g., a design review channel, a Figma comment thread) not reflected in git. I can only confirm she's the sole human name in the commit and merge history for both paths.
