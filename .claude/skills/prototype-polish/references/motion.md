# Motion tokens and snippets

Add tokens to `:root` in the shared stylesheet once, then reference them.

```css
:root {
  /* durations */
  --dur-micro: 150ms;   /* hover, press, toggle */
  --dur-small: 220ms;   /* dropdown, tooltip, accordion */
  --dur-large: 320ms;   /* sheet, modal, view change */
  --dur-exit-factor: .7;

  /* easing */
  --ease-out:    cubic-bezier(.2, .8, .2, 1);      /* entering */
  --ease-in:     cubic-bezier(.4, 0, 1, 1);        /* exiting */
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);     /* moving on screen */
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1);  /* playful overshoot, use sparingly */

  --stagger: 40ms;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Card hover lift (pointer devices only)

```css
.card { transition: transform var(--dur-micro) var(--ease-out), box-shadow var(--dur-micro) var(--ease-out); }
@media (hover: hover) {
  .card:hover { transform: translateY(-2px); box-shadow: var(--shadow-2); }
}
.card:active { transform: scale(.98); }
```

## Focus ring

```css
:where(a, button, [tabindex], input, select, textarea):focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

## Dropdown / popover from trigger

```css
.popover {
  transform-origin: top left;
  opacity: 0; transform: scale(.96) translateY(-4px);
  pointer-events: none;
  transition: opacity calc(var(--dur-small) * var(--dur-exit-factor)) var(--ease-in),
              transform calc(var(--dur-small) * var(--dur-exit-factor)) var(--ease-in);
}
.popover.is-open {
  opacity: 1; transform: none; pointer-events: auto;
  transition: opacity var(--dur-small) var(--ease-out), transform var(--dur-small) var(--ease-out);
}
```

## Accordion without animating height

```css
.acc-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--dur-small) var(--ease-in-out); }
.acc-panel > div { overflow: hidden; }
.acc.is-open .acc-panel { grid-template-rows: 1fr; }
.acc-chevron { transition: transform var(--dur-small) var(--ease-in-out); }
.acc.is-open .acc-chevron { transform: rotate(180deg); }
```

## Bottom sheet / modal

```css
.sheet { transform: translateY(100%); transition: transform calc(var(--dur-large) * var(--dur-exit-factor)) var(--ease-in); }
.sheet.is-open { transform: none; transition: transform var(--dur-large) var(--ease-out); }

.modal { opacity: 0; transform: scale(.96); transition: opacity var(--dur-small) var(--ease-in), transform var(--dur-small) var(--ease-in); }
.modal.is-open { opacity: 1; transform: none; transition: opacity var(--dur-large) var(--ease-out), transform var(--dur-large) var(--ease-out); }

.scrim { opacity: 0; transition: opacity var(--dur-small) linear; }
.scrim.is-open { opacity: 1; }
```

## Staggered entrance

```css
@media (prefers-reduced-motion: no-preference) {
  .stagger > * { opacity: 0; transform: translateY(12px); }
  .stagger.is-in > * {
    opacity: 1; transform: none;
    transition: opacity var(--dur-large) var(--ease-out), transform var(--dur-large) var(--ease-out);
    transition-delay: calc(min(var(--i, 0), 7) * var(--stagger));
  }
}
```
Set `style="--i:0"`, `--i:1`... on children (or in JS). Capping at 7 keeps total stagger under ~300ms.

## Scroll reveal (once, near viewport)

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.reveal, .stagger').forEach((el) => io.observe(el));
```
Never apply to above-the-fold content.

## Save / heart pop

```css
@keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.2); } 100% { transform: scale(1); } }
.save-btn[aria-pressed="true"] svg { animation: pop var(--dur-small) var(--ease-spring); }
```

## Tab indicator that slides

```css
.tabs { position: relative; }
.tabs-indicator {
  position: absolute; bottom: 0; height: 2px; left: 0; width: var(--w, 0);
  transform: translateX(var(--x, 0));
  transition: transform var(--dur-small) var(--ease-in-out), width var(--dur-small) var(--ease-in-out);
}
```
In JS, set `--x` and `--w` from the active tab's `offsetLeft` / `offsetWidth`.

## View swap with View Transitions API

```js
function swapView(update) {
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return update();
  document.startViewTransition(update);
}
```
Give the shared element the same `view-transition-name` in both states (e.g. card image to detail hero) for a continuous morph.

## Carousel with snap and peek

```css
.rail { display: grid; grid-auto-flow: column; grid-auto-columns: min(80%, 20rem); gap: var(--space-4);
        overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: var(--space-6);
        padding-inline: var(--space-6); overscroll-behavior-x: contain; scrollbar-width: none; }
.rail > * { scroll-snap-align: start; }
```
`scroll-padding-inline` matching the container padding keeps snapped cards on the section's left edge.

## Skeleton shimmer

```css
.skeleton { background: linear-gradient(90deg, #e6e6e6 0%, #f2f2f2 50%, #e6e6e6 100%); background-size: 200% 100%;
            animation: shimmer 1.2s linear infinite; border-radius: var(--radius-sm); }
@keyframes shimmer { to { background-position: -200% 0; } }
```
Skeletons must match the final content's dimensions so nothing shifts when it loads.
