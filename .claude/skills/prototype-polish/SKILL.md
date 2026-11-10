---
name: prototype-polish
description: Polish pass for HTML/CSS prototypes and wireframes. Raises the craft of interactions, motion and transitions, and tightens spacing, alignment and visual consistency so prototypes feel engaging and considered rather than flat. Use whenever building or editing a prototype screen, component or wireframe page, and whenever the user asks to "polish", "tighten up", "make it feel nicer", "add some life", "smooth the transitions", "fix the padding/alignment", or says a prototype feels static, janky or unfinished. Not about branding or colour choice.
---

# Prototype Polish

Goal: prototypes that feel alive and inspiring to click through, with nothing that looks accidental. Branding is out of scope. Craft is in scope.

Apply this skill in two modes:

- **While building**: follow the rules below as defaults so new work ships polished.
- **Polish pass** (user asks to polish an existing screen): run the audit procedure at the bottom, fix, then verify visually.

## Guardrails (check before changing anything)

- Respect project rules in `CLAUDE.md`. In this repo: polish happens in `public/wireframes/`, never by adding product page code to `src/`; polish must not add, rename or invent content fields from `docs/product-data-contract.md`; every module keeps an explicit empty state.
- Put shared patterns in the shared stylesheet (`public/wireframes/shared.css`) as tokens and classes. Do not scatter one-off `<style>` blocks or inline styles.
- Do not change layout structure or content hierarchy unless asked. Polish is refinement, not redesign. If a structural change would clearly help, propose it, do not just do it.
- Motion must never block a task. If an animation makes someone wait to read or click, it is too slow or should not exist.

---

## 1. Spacing and alignment

**Use a scale, not arbitrary values.** Define once on `:root` and only use these:

```css
--space-1: .25rem;  /* 4  */
--space-2: .5rem;   /* 8  */
--space-3: .75rem;  /* 12 */
--space-4: 1rem;    /* 16 */
--space-5: 1.5rem;  /* 24 */
--space-6: 2rem;    /* 32 */
--space-7: 3rem;    /* 48 */
--space-8: 4rem;    /* 64 */
--space-9: 6rem;    /* 96 */
```

Rules:
- **Proximity**: space inside a group is smaller than space between groups. Heading-to-its-body gap < body-to-next-section gap. If two gaps look equal and the things are not equally related, fix it.
- **Section rhythm**: vertical gap between page sections is one consistent token (typically `--space-8` desktop, `--space-7` mobile). No section should feel cramped or orphaned relative to its neighbours.
- **Card internals**: one padding token for all cards of a type. Image-to-text gap, title-to-meta gap and meta-to-CTA gap are each consistent across every card in a row.
- **Use `gap`** on flex/grid for sibling spacing instead of margins on children. Kills the "last item has extra margin" bug.
- **One left edge**: headings, body text, carousels and grids inside a section share the container's left edge. Check carousels especially, they often drift.
- **Optical alignment**: icons next to text are vertically centred on the text's cap-height, not the line box (`align-items: center` plus nudging if needed). Play/arrow icons in circles need a 1–2px optical shift.
- **Baselines**: in a row of cards with varying title lengths, CTAs and meta line up along the bottom (`display:flex; flex-direction:column` with `margin-top:auto` on the footer).
- **Equal heights** for cards in a row unless the design is deliberately masonry.
- **Touch targets** at least 44×44px, even when the visual is smaller (pad the hit area).

## 2. Visual consistency

Pick one value per role and reuse it everywhere:
- **Radii**: a small set, e.g. `--radius-sm: 4px` (inputs, chips), `--radius-md: 8px` (cards), `--radius-lg: 16px` (sheets/modals), `--radius-pill: 999px`. Nested radius = outer radius minus padding.
- **Shadows / elevation**: 3 levels max (`--shadow-1` resting card, `--shadow-2` hover/raised, `--shadow-3` overlays). Shadows get stronger as things lift, never randomly.
- **Borders**: one width (1px) and one border colour token, unless signalling state.
- **Type scale**: a fixed set of sizes and line-heights. Headings get tighter line-height (1.1–1.25) and slightly negative letter-spacing at large sizes; body 1.5–1.6. Max line length around 65ch for body copy.
- **Icon sizes**: one per context (16 inline, 20 buttons, 24 nav) and one stroke weight.
- **Aspect ratios** for images by component (`aspect-ratio: 4/3`, `16/9`, etc.), never stretched.
- **z-index** from a named scale (`--z-nav`, `--z-dropdown`, `--z-overlay`, `--z-toast`), not magic numbers.

## 3. Interaction states

Every interactive element gets **all** of these, designed rather than left to browser defaults:

| State | Guidance |
|---|---|
| Hover | Subtle and fast: lift (`translateY(-2px)` + shadow step), underline grow, or tint. Only on `@media (hover: hover)` so touch devices do not get sticky hover. |
| Focus-visible | Clear ring with offset (`outline: 2px solid; outline-offset: 2px`). Never remove focus without replacing it. |
| Active / pressed | Tiny press (`scale(.98)`) so taps feel physical. |
| Selected / current | Distinct from hover; persists. |
| Disabled | Reduced contrast plus `cursor: not-allowed`; explain why if not obvious. |
| Loading | Skeleton or inline spinner in place, keeping layout size so nothing jumps. |
| Empty | Designed: short message, why it is empty, a next action. Never a blank box. |
| Error | Inline, next to the cause, with recovery. |
| Success | Brief confirmation (toast, tick morph, button label change "Saved ✓"). |

**Feedback within 100ms** of any action. If the real result takes longer, show something immediately (optimistic UI, pressed state, skeleton).

## 4. Motion and transitions

See `references/motion.md` for tokens and ready-to-use snippets. Core rules:

- **Purpose first**: motion should explain (where did this come from, where did it go, what changed) or give feedback. Decoration-only motion is rare and reserved for moments of delight.
- **Durations**: micro (hover, press, toggles) 120–180ms; small UI (dropdowns, tooltips, accordions) 200–260ms; large (sheets, modals, page/view changes) 280–400ms. Nothing routine over 500ms.
- **Easing**: entering = ease-out (decelerate in), exiting = ease-in and ~30% faster than entering, moving on screen = ease-in-out. Never `linear` except for spinners and progress.
- **Animate only `transform` and `opacity`** where possible (plus `clip-path`, `filter` sparingly). Animating `height`, `top`, `width` or `margin` causes jank; for accordions use `grid-template-rows: 0fr → 1fr`.
- **Origin-aware**: dropdowns scale/fade from their trigger (`transform-origin`), sheets slide from the edge they live on, modals scale from ~.96 and fade.
- **Choreography**: when a group appears, stagger children by 30–60ms, cap the total stagger around 300ms. Parent before children. Exit together, faster, without stagger.
- **Continuity**: when an element changes state or moves (card to detail, list reorder, tab indicator), animate the same element rather than cutting. Use the View Transitions API (`document.startViewTransition`) for same-page view swaps where supported, with a plain fallback.
- **Interruptible**: use CSS transitions (which reverse mid-flight) over keyframe animations for anything a user can toggle quickly.
- **Scroll reveals**: subtle (12–24px rise + fade), once only, triggered by IntersectionObserver near the viewport. Never hide above-the-fold content behind a reveal. Never on every single element.
- **No layout shift**: reserve space for images, async content and late-loading UI.
- **Reduced motion is mandatory**: wrap non-essential motion in `@media (prefers-reduced-motion: no-preference)` or neutralise it under `reduce`, replacing movement with a simple fade.

## 5. Engagement and delight (the "anything else")

Use these where they genuinely serve the moment, one or two per screen, not everywhere:

- **Direct manipulation**: swipeable carousels with momentum and scroll-snap, drag-to-reorder, pull handles on sheets. Show a peek of the next card so swiping is discoverable.
- **Progressive disclosure**: reveal detail on demand (expand, hover preview, "show more") rather than dumping everything.
- **Responsive feedback**: save/heart toggles that pop (`scale 1 → 1.2 → 1` with a spring-ish curve), counters that tick, buttons that morph into their result.
- **Live previews**: filters and toggles update results instantly with a soft crossfade, plus a count ("24 places").
- **Wayfinding**: sticky section nav or progress indicators on long pages, active state following scroll, smooth anchor scrolling with offset for sticky headers.
- **Realistic content**: plausible copy and data lengths (including long titles and missing values) so the prototype tests the real layout. Use existing fixtures; do not invent fields.
- **Considered empty and first-run states**: these are often the most inspiring screens to show stakeholders.
- **Microcopy**: buttons say what they do ("Save to trip", not "Submit"). Confirmations are human.
- **Keyboard and accessibility** as craft, not compliance: logical tab order, Escape closes overlays, focus moves into opened dialogs and returns to the trigger on close, arrow keys in tab lists and carousels.
- **Responsive polish**: check 375, 768, 1280 and 1440px. Spacing tokens step down on mobile, tap targets grow, hover-only affordances get a visible alternative.

---

## Audit procedure (polish pass)

1. **Read** the target page(s), the shared stylesheet and theme files. Note existing tokens before adding new ones; extend rather than duplicate.
2. **Inventory inconsistencies** with quick greps, e.g. distinct padding/margin/gap values, radii, shadows, durations, z-indexes, font sizes:
   ```bash
   grep -ohE "(padding|margin|gap)[^;]*;" public/wireframes/shared.css | sort | uniq -c | sort -rn
   grep -ohE "border-radius:[^;]*;" public/wireframes/shared.css | sort | uniq -c
   grep -ohE "transition[^;]*;" public/wireframes/shared.css | sort | uniq -c
   ```
   Many near-duplicates (e.g. `.9rem`, `1rem`, `1.1rem`) signal values to snap to the scale.
3. **Screenshot before** at mobile and desktop with Playwright (preinstalled; `require('playwright')`), saving to the scratchpad.
4. **Fix in priority order**: (a) broken alignment and spacing rhythm, (b) missing interaction states, (c) motion and transitions, (d) delight extras.
5. **Screenshot after** at the same sizes and compare. For motion, also exercise the interactions in Playwright (hover, click, open/close, keyboard Tab) and check for console errors and layout shift.
6. **Report** to the user: a short list of what changed grouped by the sections above, anything proposed but not done (structural changes, missing data), and before/after screenshots if useful.

## Quality bar (check before calling it done)

- [ ] Every spacing, radius, shadow, duration and z-index value comes from a token
- [ ] Sections, cards and carousels share consistent left edges and internal rhythm
- [ ] Every interactive element has hover, focus-visible, active and (where relevant) disabled, loading, empty and error states
- [ ] Transitions use transform/opacity, correct easing direction, and sensible durations
- [ ] Nothing jumps on load or on state change
- [ ] `prefers-reduced-motion: reduce` gives a calm, fully usable experience
- [ ] Works at 375px and 1440px with no horizontal scroll
- [ ] Keyboard-only run-through works: Tab, Enter/Space, Escape
- [ ] No console errors
