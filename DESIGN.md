---
name: DNSW wireframes
description: Low-fidelity greyscale wireframes and clickable prototypes for sydney.com and visitnsw.com.
colors:
  sydney-harbour-blue: "#005EA2"
  nsw-bush-green: "#00563C"
  ink: "#111111"
  prototype-ink: "#1A1A1A"
  charcoal-fill: "#1F1F1F"
  slate: "#444444"
  muted-text: "#737373"
  quiet-text: "#888888"
  rule-grey: "#DDDDDD"
  field-grey: "#D1D1D1"
  placeholder-grey: "#CCCCCC"
  page-grey: "#F5F5F5"
  paper: "#FFFFFF"
  state-blue: "#2666D9"
  error-red: "#B42318"
typography:
  display:
    fontFamily: "system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0.05em"
  headline:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  pill: "999px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.5rem"
  "6": "2rem"
  "7": "3rem"
  "8": "4rem"
  "9": "6rem"
components:
  button-primary:
    backgroundColor: "{colors.sydney-harbour-blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.25rem"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.25rem"
  button-outline-dark:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.25rem"
  prototype-pill:
    backgroundColor: "{colors.charcoal-fill}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "48px"
  prototype-pill-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.prototype-ink}"
    rounded: "{rounded.pill}"
    height: "38px"
  event-card:
    backgroundColor: "{colors.paper}"
    rounded: "6px"
    width: "13rem"
  prototype-tile:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.prototype-ink}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "64px"
  text-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.prototype-ink}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "48px"
  image-placeholder:
    backgroundColor: "{colors.placeholder-grey}"
    textColor: "#AAAAAA"
---

# Design System: DNSW wireframes

## Overview

**Creative North Star: "The Annotated Plan"**

Every screen in this repo is a working proposal, not a finished design. It shows structure, content order and behaviour plainly enough that DNSW stakeholders can click through it and a separate UI designer can design on top of it without unpicking anyone's taste. Numbered annotations sit beside the prototypes and say what each complex part does and what to inspect. Clarity and real behaviour come before styling.

The palette is greyscale, the type is the device's own system font, and images and maps are grey boxes labelled "Image". The only colour that is part of the system is the site accent: Sydney blue on sydney.com pages, bush green on visitnsw.com pages. A focus and state blue appears in prototypes to show selection, ranges and keyboard focus.

Static pages stay flat and plain. Prototypes (the Concepts phone screens and the trip planner) are plain too, but alive: sheets slide, toasts fade, handles drag, and every control has press, hover and focus feedback, so the behaviour reads as real when someone tries it.

**Key Characteristics:**
- Greyscale first, one site accent, nothing decorative.
- System font, a short type scale, weight does the work.
- Grey placeholder boxes for every image and map.
- Numbered annotations explain behaviour beside the screen.
- Flat at rest; motion and shadow only where a prototype needs to show behaviour.

## Colors

Greyscale with a single site accent; colour is a signal, never decoration.

### Primary
- **Sydney Harbour Blue** (sydney-harbour-blue): the sydney.com accent. Primary buttons, "View all" links, active accents. It is the default value of the accent token.
- **NSW Bush Green** (nsw-bush-green): the visitnsw.com accent. It replaces Sydney Harbour Blue wholesale when a page carries the NSW theme; the two never appear together.

### Secondary
- **State Blue** (state-blue): prototype state only. Selected tiles, the date range band and handles on the timeline, the "Saved" confirmation. Never used on static page templates.

### Neutral
- **Ink** (ink): text, dark buttons, outline-button borders on site pages.
- **Prototype Ink** (prototype-ink) and **Charcoal Fill** (charcoal-fill): text and filled pills inside the phone prototypes; a fraction softer than Ink.
- **Slate** (slate): the fixed wireframe utility bar and hero image placeholders.
- **Muted Text** (muted-text) and **Quiet Text** (quiet-text): secondary copy, meta lines, hints.
- **Rule Grey** (rule-grey) and **Field Grey** (field-grey): borders and dividers on pages and in prototypes.
- **Placeholder Grey** (placeholder-grey): image and map placeholders.
- **Page Grey** (page-grey): the page ground and quiet panels; **Paper** (paper) for cards, sheets and nav.
- **Error Red** (error-red): inline form errors only.

### Named Rules
**The One Accent Rule.** A page carries exactly one site accent, Sydney blue or NSW green, set by the theme. Everything else is grey.

**The Muted Team Colour Rule.** Team colours may be used to identify a fan's team, but only muted (low saturation, never at full strength), only as a small identifier such as a chip or marker edge, and never as a page or section background. No team colour tokens exist yet; define them before use rather than inventing values in place.

## Typography

**Display Font:** system-ui (with sans-serif)
**Body Font:** system-ui (with sans-serif)
**Label/Mono Font:** ui-monospace, SFMono-Regular, Menlo, Consolas, monospace, only for previews of copied text.

**Character:** The device's own font, so nothing in the wireframe pretends to be the final brand type. Hierarchy comes from size and weight, not from typefaces.

### Hierarchy
- **Display** (800, 3rem, 1.05, uppercase, 0.05em tracking): hero headlines only, set over a dark placeholder with a light text shadow.
- **Headline** (700, 1.375rem): section titles on site pages.
- **Title** (600, 1.125rem): sheet and modal titles in prototypes; product titles go to 1.25rem at 700.
- **Body** (400, 1rem, 1.5): running text. Section intros cap at 36rem.
- **Body small** (400, 0.875rem): card copy, meta lines, prototype list text.
- **Label** (600, 0.75rem to 0.8125rem): buttons, chips, tags, legends, hints.

### Named Rules
**The Two or Three Sizes Rule.** Any one screen uses two or three type sizes. Add weight before adding a size.

## Layout

Site pages sit in a centred container (80rem max, 2rem side padding) under a sticky nav (4rem) and a fixed wireframe utility bar (2rem). Rows of cards scroll sideways rather than wrapping on small screens. The main breakpoint is 48rem, with a small-phone step at 30rem and a wide step at 72rem.

The prototypes are fixed phone frames (390 x 844) on a white canvas, with the annotation column to the right. Inside the phone, spacing follows the 4px-based scale (space-1 to space-9: 0.25rem to 6rem); 16px side gutters are standard. Every tappable control has a target of at least 44 x 44px, using an invisible hit area where the visible control is smaller.

## Elevation & Depth

Flat by default. Site pages use hairline borders and the grey ground, not shadows, to separate surfaces; the hero text shadow is the only exception. In prototypes, shadow means "this sits above the page": a light lift for tiles and lifted items, a soft drop for overlays such as the team list, and an upward shadow for bottom sheets.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 1px 2px rgba(0,0,0,.08)`): switch thumbs, a place lifted in edit mode, annotation badges.
- **Overlay** (`box-shadow: 0 4px 12px rgba(0,0,0,.12)`): dropdown panels over a chart or list.
- **Sheet** (`box-shadow: 0 -8px 24px rgba(0,0,0,.16)`): bottom sheets rising from the phone's lower edge.

### Named Rules
**The Flat-At-Rest Rule.** Nothing on a static page casts a shadow. Shadow appears only when a prototype layer sits above another.

## Shapes

Small, quiet radii. Site buttons are barely rounded (4px) and cards 6px. Prototypes use 8px for tiles, fields and panels, 16px for the top corners of sheets, and full pills for primary actions, segmented toggles and chips. Borders are 1px for structure and 1.5px to 2px for controls that need to read as tappable. Circles are reserved for icon buttons (the 36px close cross) and markers.

## Components

### Buttons
- **Shape:** gently squared on site pages (4px); full pill in prototypes.
- **Primary:** site accent fill, white text, 600 weight, 0.6rem by 1.25rem padding.
- **Dark / Outline dark:** Ink fill with white text, or a 2px Ink outline on white. The default pair for wireframe chrome.
- **Prototype pill:** Charcoal Fill, 48px tall, full width in sheets; the outline version is 38px with a 1.5px border.
- **Hover / Focus / Press:** a 2px blue focus ring offset 2px on every control; press scales to 0.98 over 150ms. Hover darkens borders slightly where a pointer is present.

### Chips
- **Style:** pill, white, 1.5px border, 0.75rem semibold text, at least 32px tall with a 44px hit area.
- **State:** selected chips fill dark; removal is a single, explicit control, never two.

### Cards / Containers
- **Corner Style:** 6px on site cards, 8px in prototypes.
- **Background:** Paper on the Page Grey ground.
- **Shadow Strategy:** none at rest (see Elevation).
- **Border:** 1px light grey.
- **Internal Padding:** 0.75rem to 1rem; event cards put a 4:3 grey image placeholder on top.

### Inputs / Fields
- **Style:** 1px Field Grey stroke, white, 8px radius, 48px tall (44px in compact overlays).
- **Focus:** the same 2px blue ring as buttons.
- **Error:** Error Red border and a short inline message under the field.

### Navigation
- **Style:** sticky white bar with a 1px bottom rule, 0.9375rem links; hover underlines, the current page goes bold. On scroll down it slides away and returns on scroll up.

### Annotation layer
The signature of the system. A switch turns on numbered yellow badges pinned to the parts of a prototype with complex behaviour, matched to a numbered list in a side column. Standard controls are never annotated.

### Image placeholder
A grey box labelled "Image", in the aspect ratio of the real slot (4:3 cards, 16:9 heroes and modals). Never a stock photo.

## Do's and Don'ts

### Do:
- **Do** keep every page greyscale plus its one site accent: Sydney Harbour Blue on sydney.com, NSW Bush Green on visitnsw.com.
- **Do** use grey placeholder boxes for every image and map, in the real slot's aspect ratio.
- **Do** give every prototype control a 44 x 44px target, a visible 2px focus ring and press feedback.
- **Do** use the prototype motion tokens (150ms, 220ms, 320ms; exits at 0.7x) and honour reduced motion.
- **Do** annotate complex prototype behaviour with numbered notes, not on-screen explanation.
- **Do** keep team colours muted and small if a team needs identifying.

### Don't:
- **Don't** use the Rugby World Cup visual style anywhere: no teal, coral or sand palette, no Fraunces or Work Sans, no rounded soft-shadow cards from `themes/rwc-2027.css`.
- **Don't** add brand fonts, gradients, illustrations or decorative icons; visual design belongs to the UI designer.
- **Don't** put shadows on static page elements.
- **Don't** use team colours at full strength or as backgrounds.
- **Don't** use State Blue on static page templates; it marks prototype state only.
