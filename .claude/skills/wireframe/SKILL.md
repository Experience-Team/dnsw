# Wireframe Builder — Skill

Build low-fidelity, greyscale HTML/CSS wireframes that mimic the structure of the Destination NSW live sites (sydney.com and visitnsw.com). Output is rendered in-browser with no real imagery or colour beyond greyscale.

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
wireframes/
  index.html          ← entry point; loads the shell + page switcher
  shell.html          ← utility bar + nav + footer (included by all pages)
  shared.css          ← base wireframe styles, layout grid, typography scale
  components/
    nav.html          ← main navigation (site-wide)
    utility-bar.html  ← top bar: site switcher + page switcher dropdown
    hero.html         ← hero/banner component
    card.html         ← generic content card
    footer.html       ← site footer
    [add more here]
  pages/
    home.html         ← homepage wireframe
    [add more here]
  themes/
    sydney.css        ← CSS variable overrides for Sydney theme
    nsw.css           ← CSS variable overrides for NSW theme
```

**Rules:**
- Every page imports `shared.css` and the active theme CSS.
- Every page imports components via `<div data-include="...">` or equivalent include pattern — never copy-paste component HTML into a page file.
- Add new pages to `wireframes/pages/`. Register them in the `PAGES` array in `index.html` (set `active: false` until the page is built).
- Add new components to `wireframes/components/` and document them below.

---

## Component catalogue

| File | Description | Status |
|------|-------------|--------|
| `utility-bar.html` | Top bar with site switcher and page dropdown | — |
| `nav.html` | Primary navigation | — |
| `hero.html` | Full-width hero/banner with headline placeholder | — |
| `card.html` | Content card (image box + title + body placeholder) | — |
| `footer.html` | Site footer with link columns | — |

> Update this table whenever a component is added or changed.

---

## Theme system

Themes are CSS variable overrides applied by adding a class to `<body>`:
- `class="theme-sydney"` → loads `themes/sydney.css`
- `class="theme-nsw"` → loads `themes/nsw.css`

The site switcher in the utility bar toggles between these two classes. No structural HTML changes — only the variable values change.

**Core variables** (defined in `shared.css`):
```css
--color-primary       /* nav/header background */
--color-accent        /* active states, CTAs */
--color-logo-text     /* logo wordmark colour */
```

---

## Wireframe style rules

- Greyscale only: `#111`, `#444`, `#888`, `#bbb`, `#ddd`, `#f5f5f5`, `white`
- Image placeholders: `background: #ddd` box with centred "Image" label
- Text placeholders: lorem-style dummy text at appropriate size
- No shadows, gradients, or icon fonts — flat boxes only
- Font: system-ui (no web font imports)
- All measurements in `rem`

---

## How to add a new page

1. Create `wireframes/pages/<page-name>.html` — copy the page template below.
2. Add the page to the `PAGES` array in `index.html` with `active: true`.
3. Compose the page using existing components; create new component files if needed and add them to the catalogue above.

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
  <!-- Utility bar -->
  <div data-include="../components/utility-bar.html"></div>
  <!-- Nav -->
  <div data-include="../components/nav.html"></div>

  <main>
    <!-- Page content here, using component includes -->
  </main>

  <!-- Footer -->
  <div data-include="../components/footer.html"></div>
  <script src="../includes.js"></script>
</body>
</html>
```

---

## Build log

| Date | What was added |
|------|---------------|
| — | Skill scaffolded; awaiting Figma audit |

> Append a row each session.
