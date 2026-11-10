---
name: prototype-polish
description: Polish pass for HTML/CSS prototypes: craft of motion, spacing, optical alignment and states, and makes every visible affordance (copy, handles, toggles, tabs) actually work. Use whenever building or editing a prototype screen, component or wireframe page, and whenever the user asks to "polish", "tighten up", "make it feel nicer", "add some life", "smooth the transitions", "fix the padding/alignment", "make it work", or says a prototype feels static, janky, fake or unfinished. Not about branding or colour choice.
---

# Prototype Polish

Goal: prototypes that feel alive and inspiring to click through, with nothing that looks accidental and nothing that looks clickable but does nothing. Branding and colour choice are out of scope. Craft and behaviour are in scope.

Apply it in two modes:

- **While building:** follow the rules below as defaults so new work ships polished and functional.
- **Polish pass** (user asks to polish an existing screen): run the audit procedure at the bottom, fix, then verify visually and by interaction.

## Guardrails (check before changing anything)

- Respect project rules in CLAUDE.md. In this repo: polish happens in `public/wireframes/`, never by adding product page code to `src/`; polish must not add, rename or invent content fields from `docs/product-data-contract.md`; every module keeps an explicit empty state.
- Put shared patterns in the shared stylesheet (`public/wireframes/shared.css`) as tokens and classes, and shared behaviour in one shared script (e.g. `public/wireframes/shared.js`) wired by data attributes. Do not scatter one-off `<style>` blocks, inline styles or per-page copies of the same script.
- Do not change layout structure or content hierarchy unless asked. Polish is refinement, not redesign. If a structural change would clearly help, propose it, do not just do it.
- Motion must never block a task. If an animation makes someone wait to read or click, it is too slow or should not exist.
- Wiring up an implied behaviour (section 6) is in scope by default and does not need asking. Adding a *new* control that was not in the design is not; propose it instead.

## 1. Spacing and alignment

Use a scale, not arbitrary values. Define once on `:root` and only use these:

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

- **Proximity:** space inside a group is smaller than space between groups. Heading-to-its-body gap < body-to-next-section gap. If two gaps look equal and the things are not equally related, fix it.
- **Section rhythm:** vertical gap between page sections is one consistent token (typically `--space-8` desktop, `--space-7` mobile). No section should feel cramped or orphaned relative to its neighbours.
- **Card internals:** one padding token for all cards of a type. Image-to-text, title-to-meta and meta-to-CTA gaps are each consistent across every card in a row.
- Use `gap` on flex/grid for sibling spacing instead of margins on children. Kills the "last item has extra margin" bug.
- **One left edge:** headings, body text, carousels and grids inside a section share the container's left edge. Check carousels especially, they often drift.
- **Baselines:** in a row of cards with varying title lengths, CTAs and meta line up along the bottom (`display:flex; flex-direction:column` with `margin-top:auto` on the footer).
- Equal heights for cards in a row unless the design is deliberately masonry.
- Touch targets at least 44×44px, even when the visual is smaller (pad the hit area or use a `::before` hit box).

## 2. Optical alignment

Geometric centring is often visually wrong. Correct for what the eye sees:

- **Icons beside text:** centre on the cap-height or x-height, not the line box. Size inline icons in `em` (`width:1em; height:1em`) so they track font size, and nudge with `vertical-align: -0.125em` (inline) or a small `translateY` (flex). Where supported, `text-box: trim-both cap alphabetic` on the label removes the extra space above caps so `align-items:center` actually centres; keep the nudge as a fallback.
- **Normalise icon boxes:** check each SVG's `viewBox` for uneven internal padding. Icons from mixed sets often sit off-centre because of their artboard, not your CSS. Fix the viewBox or wrap in a consistent box.
- **Asymmetric glyphs:** play triangles shift towards the point by roughly 1/12 of their width (centre of mass, not bounding box). Chevrons and arrows shift 1px against their direction. Plus/close icons usually need nothing.
- **Shape size compensation:** circles and triangles look smaller than squares at the same dimensions. Scale circular avatars or icons up ~5–10% when they sit alongside square ones.
- **Icon + label buttons:** padding on the icon side is slightly smaller (about `--space-1` less) than on the text side, so the button looks balanced.
- **Text inside pills and buttons:** check for the common "text sits low" problem caused by font metrics; correct with `text-box` trim or a 1px padding adjustment, not a different line-height everywhere.
- **Large headings:** first-letter side bearing makes big type look indented. Pull back with a small negative `margin-inline-start` (around -0.04em to -0.06em) so it aligns with body text below. Use `hanging-punctuation: first` where supported for opening quotes.
- **Numbers:** use `font-variant-numeric: tabular-nums` for prices, counts, timers and anything that updates, so digits do not wobble.
- **Verify by eye at 200–400% zoom** in a screenshot; trust the screenshot over the numbers.

## 3. Visual consistency

Pick one value per role and reuse it everywhere:

- **Radii:** a small set, e.g. `--radius-sm: 4px` (inputs, chips), `--radius-md: 8px` (cards), `--radius-lg: 16px` (sheets/modals), `--radius-pill: 999px`. Nested radius = outer radius minus padding.
- **Shadows / elevation:** 3 levels max (`--shadow-1` resting card, `--shadow-2` hover/raised, `--shadow-3` overlays). Shadows get stronger as things lift, never randomly.
- **Borders:** one width (1px) and one border colour token, unless signalling state.
- **Type scale:** a fixed set of sizes and line-heights. Headings get tighter line-height (1.1–1.25) and slightly negative letter-spacing at large sizes; body 1.5–1.6. Max line length around 65ch for body copy. Use `text-wrap: balance` on headings and `text-wrap: pretty` on short paragraphs to avoid orphans.
- **Icon sizes:** one per context (16 inline, 20 buttons, 24 nav) and one stroke weight.
- **Aspect ratios** for images by component (`aspect-ratio: 4/3`, `16/9`, etc.), with `object-fit: cover`, never stretched.
- **z-index** from a named scale (`--z-nav`, `--z-dropdown`, `--z-overlay`, `--z-toast`), not magic numbers.
- **Cursors:** `pointer` on clickables, `grab`/`grabbing` on draggables, `not-allowed` on disabled, `text` on editable.

## 4. Interaction states

Every interactive element gets all of these, designed rather than left to browser defaults:

| State | Guidance |
|---|---|
| Hover | Subtle and fast: lift (`translateY(-2px)` + shadow step), underline grow, or tint. Only inside `@media (hover: hover)` so touch devices do not get sticky hover. |
| Focus-visible | Clear ring with offset (`outline: 2px solid; outline-offset: 2px`). Never remove focus without replacing it. |
| Active / pressed | Tiny press (`scale(.98)`) so taps feel physical. |
| Selected / current | Distinct from hover; persists. Reflect in ARIA (`aria-pressed`, `aria-selected`, `aria-current`). |
| Disabled | Reduced contrast plus `cursor: not-allowed`; explain why if not obvious. |
| Loading | Skeleton or inline spinner in place, keeping layout size so nothing jumps. Button labels change ("Saving…"). |
| Empty | Designed: short message, why it is empty, a next action. Never a blank box. |
| Error | Inline, next to the cause, with recovery. |
| Success | Brief confirmation (toast, tick morph, label change). |

Feedback within 100ms of any action. If the real result takes longer, show something immediately (optimistic UI, pressed state, skeleton).

### Labels reflect state

When an action completes, the control's label (and icon) says so, then reverts if the action is repeatable. Do this by default without being asked:

| Control | Idle → in progress → done | Reverts? |
|---|---|---|
| Copy (text, link, code, coupon) | "Copy link" → "Copied ✓" | After ~2s |
| Save / heart / bookmark | "Save" → "Saved" (filled icon, `aria-pressed="true"`) | No, it is a toggle |
| Add to trip / cart | "Add to trip" → "Adding…" → "Added ✓" then "View trip" | Becomes a new action |
| Follow / subscribe | "Follow" → "Following" (hover: "Unfollow") | Toggle |
| Submit form | "Send enquiry" → "Sending…" → "Sent ✓" | Show success state |
| Download | "Download PDF" → "Downloading…" → "Downloaded" | After ~2s |
| Share | Native share sheet if available, else copy link and "Link copied ✓" | After ~2s |
| Show more | "Show more" ↔ "Show less" (`aria-expanded`) | Toggle |

Rules for label changes:

- Keep the button width stable: reserve width for the longest label (e.g. a hidden sizer span or `min-width` in `ch`) so the layout does not jump.
- Crossfade or morph the icon (copy icon → tick) over 150–200ms; do not just swap text abruptly.
- Announce the change with an `aria-live="polite"` region so screen readers hear "Copied".
- Debounce repeat clicks while in progress.

Copy snippet (clipboard needs a secure context such as localhost; include the fallback for `file://`):

```js
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  }
}
document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-copy]');
  if (!btn || btn.dataset.state === 'done') return;
  const label = btn.querySelector('[data-label]');
  const idle = label.textContent;
  if (await copyText(btn.dataset.copy || location.href)) {
    btn.dataset.state = 'done'; label.textContent = btn.dataset.doneLabel || 'Copied';
    setTimeout(() => { btn.dataset.state = ''; label.textContent = idle; }, 2000);
  }
});
```

## 5. Motion and transitions

See `references/motion.md` for tokens and ready-to-use snippets. Core rules:

- **Purpose first:** motion should explain (where did this come from, where did it go, what changed) or give feedback. Decoration-only motion is rare and reserved for moments of delight.
- **Durations:** micro (hover, press, toggles) 120–180ms; small UI (dropdowns, tooltips, accordions) 200–260ms; large (sheets, modals, page/view changes) 280–400ms. Nothing routine over 500ms.
- **Easing:** entering = ease-out (decelerate in), exiting = ease-in and ~30% faster than entering, moving on screen = ease-in-out. Never linear except for spinners and progress.
- **Animate only transform and opacity** where possible (plus clip-path, filter sparingly). Animating height, top, width or margin causes jank; for accordions use `grid-template-rows: 0fr → 1fr`.
- **Origin-aware:** dropdowns scale/fade from their trigger (`transform-origin`), sheets slide from the edge they live on, modals scale from ~.96 and fade.
- **Choreography:** when a group appears, stagger children by 30–60ms, cap the total stagger around 300ms. Parent before children. Exit together, faster, without stagger.
- **Continuity:** when an element changes state or moves (card to detail, list reorder, tab indicator), animate the same element rather than cutting. Use the View Transitions API (`document.startViewTransition`) for same-page view swaps where supported, with a plain fallback. Use FLIP for reorders.
- **Interruptible:** use CSS transitions (which reverse mid-flight) over keyframe animations for anything a user can toggle quickly. Drag-driven motion follows the pointer 1:1 with no transition, then hands off to a transition on release.
- **Scroll reveals:** subtle (12–24px rise + fade), once only, triggered by IntersectionObserver near the viewport. Never hide above-the-fold content behind a reveal. Never on every single element.
- **No layout shift:** reserve space for images, async content and late-loading UI.
- **Reduced motion is mandatory:** wrap non-essential motion in `@media (prefers-reduced-motion: no-preference)` or neutralise it under `reduce`, replacing movement with a simple fade. Drag still works under reduced motion; only the snap animation shortens.

## 6. Affordances must work (implied behaviour)

**Principle: if it looks like it does something, it does it.** A visible affordance is a promise. Wire it up by default, without the user having to ask. A prototype with dead handles and fake buttons tests nothing and makes stakeholders lose trust in the rest.

During every build and polish pass, inventory each affordance on the page and make it behave. Use existing fixture data only; simulate, do not invent new fields.

| If the design shows… | It must… |
|---|---|
| **Sheet with a grab handle** | Drag with the pointer (Pointer Events + `setPointerCapture`, `touch-action: none` on the handle). Follow the finger 1:1, rubber-band past limits (~0.3 resistance), snap to defined points (e.g. peek / half / full) on release, choosing by position *and* velocity (a flick over ~0.5px/ms goes to the next point). Backdrop opacity tracks progress. Handle is also a `<button>`: Enter/Space toggles, arrow keys step between snap points, Escape closes. Inner content scrolls only when the sheet is fully open. |
| **Reorder / drag handles (⋮⋮)** | Reorder for real using pointer events (native HTML drag does not work on touch). Lifted item gets `--shadow-3`, slight scale and `grabbing` cursor; siblings slide out of the way with FLIP. Keyboard: focus handle, Space to lift, arrows to move, Space to drop, Escape to cancel. Announce "Moved to position 3 of 5" via `aria-live`. Update any numbering or order-dependent text. |
| **Copy, share, save, follow, add buttons** | Perform the action and change label per section 4. |
| **Tabs / segmented controls** | Switch panels, slide the active indicator, support arrow keys, use proper `role="tablist"` semantics. |
| **Accordions / "Show more"** | Expand and collapse with `grid-template-rows`, flip `aria-expanded`, rotate the chevron. |
| **Carousel arrows, dots, peeking cards** | Scroll with scroll-snap and momentum; arrows disable at the ends; dots reflect and set position; swipe works on touch; arrow keys when focused. |
| **Filter chips, toggles, sort menus** | Filter or sort the fixture data live with a soft crossfade and an updated count ("24 places"). Include a no-results empty state and a "Clear filters" action. |
| **Search field** | Filter as you type (debounced ~150ms), highlight matches, show a clear (×) button once there is text, Escape clears, and design the no-results state. |
| **Dropdowns, menus, popovers, tooltips** | Open from the trigger, close on outside click and Escape, return focus to the trigger. Prefer the native `popover` attribute or `<dialog>` where they fit. |
| **Modals and drawers** | Open and close with origin-aware motion, trap focus, close on Escape and backdrop click, lock background scroll. |
| **Close (×) and dismiss on banners or cards** | Actually dismiss, collapsing the space smoothly. Offer "Undo" in a toast for anything destructive. |
| **Steppers (− 1 +), sliders, star ratings** | Change the value, respect min/max (disable the button at the limit), update dependent totals. |
| **Forms** | Inline validation on blur, not on every keystroke; error messages next to fields; submit goes loading → success; character counters where there is a limit; show/hide toggle on password fields. |
| **Upload / drop zones** | Accept a dropped or chosen file, show its name and a removable chip. No real upload needed. |
| **Video or audio play buttons** | Toggle to a playing state (pause icon, progress bar moving) even if there is no media. |
| **Map pins, hotspots** | Open the matching card or popover; selected pin is visually distinct. |
| **Sticky headers, back-to-top, anchor nav** | Shrink or gain a shadow on scroll, back-to-top appears after a scroll threshold, anchor links smooth-scroll with offset and the active item follows scroll. |
| **Links to pages that are not built** | Never a dead `href="#"` that jumps to top. Either link to the nearest real prototype page or show a small toast ("Not part of this prototype") so the click still gets feedback. |

Supporting rules:

- **Simulate latency** for actions that would hit a server (300–800ms, randomised) so loading states are seen and tested. Keep it short enough not to annoy.
- **Persist light state** for the session (saved items, dismissed banners, sheet position) in `sessionStorage`, wrapped in try/catch, so clicking around and back does not reset everything.
- **Deep-linkable states:** support URL parameters or hash (e.g. `?state=empty`, `?state=error`, `#sheet=open`) so any state can be shared or opened straight away in a review.
- **Demo controls:** optionally add a small, collapsible review panel (hidden by default, toggled by a key such as `Shift+D`) to switch modules between loaded, loading, empty and error, and to reset session state. Keep it visually separate from the design so it is never mistaken for UI.
- **Behaviour lives in one shared script**, attached through data attributes (`data-copy`, `data-sheet`, `data-reorder`, `data-filter`) so every page gets it for free.
- If an affordance genuinely cannot work without a missing data field or backend, do the closest honest simulation and list it in the report.

## 7. Engagement and delight

Use these where they genuinely serve the moment, one or two per screen, not everywhere:

- **Direct manipulation:** swipeable carousels with momentum and scroll-snap, drag-to-reorder, pull handles on sheets. Show a peek of the next card so swiping is discoverable.
- **Progressive disclosure:** reveal detail on demand (expand, hover preview, "show more") rather than dumping everything.
- **Responsive feedback:** save/heart toggles that pop (scale 1 → 1.2 → 1 with a spring-ish curve), counters that tick, buttons that morph into their result.
- **Live previews:** filters and toggles update results instantly with a soft crossfade, plus a count.
- **Wayfinding:** sticky section nav or progress indicators on long pages, active state following scroll, smooth anchor scrolling with offset for sticky headers.
- **Undo over confirm:** for reversible destructive actions, act immediately and offer Undo in a toast rather than an "Are you sure?" dialog.
- **Realistic content:** plausible copy and data lengths (including long titles and missing values) so the prototype tests the real layout. Use existing fixtures; do not invent fields.
- **Considered empty and first-run states:** these are often the most inspiring screens to show stakeholders.
- **Microcopy:** buttons say what they do ("Save to trip", not "Submit"). Confirmations are human.
- **Keyboard and accessibility as craft, not compliance:** logical tab order, Escape closes overlays, focus moves into opened dialogs and returns to the trigger on close, arrow keys in tab lists, carousels and reorderable lists, a skip link on long pages.
- **Responsive polish:** check 375, 768, 1280 and 1440px. Spacing tokens step down on mobile, tap targets grow, hover-only affordances get a visible alternative.

## Audit procedure (polish pass)

1. **Read** the target page(s), the shared stylesheet, the shared script and theme files. Note existing tokens and behaviours before adding new ones; extend rather than duplicate.
2. **Inventory inconsistencies** with quick greps, e.g. distinct padding/margin/gap values, radii, shadows, durations, z-indexes, font sizes:
   ```sh
   grep -ohE "(padding|margin|gap)[^;]*;" public/wireframes/shared.css | sort | uniq -c | sort -rn
   grep -ohE "border-radius:[^;]*;" public/wireframes/shared.css | sort | uniq -c
   grep -ohE "transition[^;]*;" public/wireframes/shared.css | sort | uniq -c
   ```
   Many near-duplicates (e.g. `.9rem`, `1rem`, `1.1rem`) signal values to snap to the scale.
3. **Inventory affordances:** list every handle, button, chip, icon button, link, tab, toggle and input on the page. For each, note whether it currently does what it implies (section 6) and whether its label reflects state (section 4). Dead affordances are a priority fix.
4. **Screenshot before** at mobile and desktop with Playwright (preinstalled; `require('playwright')`), saving to the scratchpad. Zoom in on icon/label pairs for optical checks.
5. **Fix in priority order:** (a) broken alignment and spacing rhythm, (b) dead or fake affordances, (c) missing interaction states and label changes, (d) optical alignment, (e) motion and transitions, (f) delight extras.
6. **Verify:** screenshot after at the same sizes and compare. Exercise every interaction in Playwright: hover, click, drag the sheet handle, reorder an item, copy (check the label change and revert), open/close overlays, keyboard Tab/Enter/Space/Escape/arrows. Check for console errors and layout shift.
7. **Report** to the user: a short list of what changed grouped by the sections above, which implied behaviours were wired up, anything proposed but not done (structural changes, new controls, missing data), and before/after screenshots if useful.

## Quality bar (check before calling it done)

- [ ] Every spacing, radius, shadow, duration and z-index value comes from a token
- [ ] Sections, cards and carousels share consistent left edges and internal rhythm
- [ ] Icons are optically centred with their labels; asymmetric glyphs are nudged
- [ ] Every visible affordance does what it implies; no dead handles, buttons or `#` links
- [ ] Action labels reflect state (Copied, Saved, Added) without the button changing width
- [ ] Every interactive element has hover, focus-visible, active and (where relevant) disabled, loading, empty and error states
- [ ] Drag interactions work by pointer, touch and keyboard
- [ ] Transitions use transform/opacity, correct easing direction, and sensible durations
- [ ] Nothing jumps on load or on state change
- [ ] `prefers-reduced-motion: reduce` gives a calm, fully usable experience
- [ ] Works at 375px and 1440px with no horizontal scroll
- [ ] Keyboard-only run-through works: Tab, Enter/Space, Escape, arrows
- [ ] State changes are announced to screen readers where they would otherwise be silent
- [ ] No console errors
