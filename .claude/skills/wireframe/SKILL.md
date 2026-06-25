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
    nav.html            ← sticky nav: hamburger | logo+toggle | search | wishlist
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
| Nav | `nav.html` | Hamburger flyout with sub-menus; site toggle (sydney↔nsw) |
| Hero | `hero.html` | Full-width checkerboard placeholder; headline + tagline overlay bottom-left |
| Newsletter | `newsletter.html` | Full-width banner; heading, body, outline-white CTA |
| Footer | `footer.html` | Social icons, acknowledgement, 5-col links, bottom bar with logo boxes |

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
| Breadcrumb bar | `.page-switcher-bar` | Inner pages only: breadcrumb left + Share/Save right |

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
