/* The design system's map: every page, in menu order. The rail shows the sections, the drawer shows a section's
   pages, and a page with `children` is an expanding group in the drawer. `lede` is the line under each page title and
   on its card; `keywords` help search. A page's body lives in pages/<path>.html (a section's in pages/<id>/index.html). */
window.DS_NAV = [
  {
    id: '', title: 'Home', icon: 'home', lede: 'One system for every DNSW site and campaign: the tokens, components and rules the wireframes and prototypes are built from.'
  },
  {
    id: 'get-started', title: 'Get started', icon: 'start', art: 'start',
    lede: 'What the system is, who it is for, and how to use it, whether you design in Figma or build in code.',
    pages: [
      { id: 'designers', title: 'For designers', lede: 'Where values come from, how to read the token tables and how to work with a brand.', keywords: 'figma variables' },
      { id: 'developers', title: 'For developers', lede: 'Files, naming, theming and how to use a token or component in a page.', keywords: 'css code files' },
      { id: 'how-it-works', title: 'How it works', lede: 'The three layers of tokens and the three tiers of components, and why they keep brands apart.', keywords: 'architecture layers tiers scalable' },
      { id: 'contributing', title: 'Contributing', lede: 'How to add or change a token, document a component, or move a project module into the core.', keywords: 'governance promote' },
      { id: 'changelog', title: 'Changelog', lede: 'What changed in the system, newest first.', keywords: 'versions release' }
    ]
  },
  {
    id: 'foundations', title: 'Foundations', icon: 'book', art: 'foundations',
    lede: 'The rules every page is built on, from accessibility to the way the page moves when someone taps.',
    pages: [
      { id: 'principles', title: 'Experience principles', lede: 'Four principles that apply to every flow, and how to tell when a brief breaks one.', keywords: 'reward early defaults' },
      { id: 'accessibility', title: 'Accessibility', lede: 'WCAG 2.2 AA is the target: target sizes, contrast, focus and reduced motion.', keywords: 'wcag aa contrast focus target size' },
      { id: 'layout', title: 'Layout', lede: 'Widths, the phone frame and the spacing rhythm that groups what belongs together.', keywords: 'grid spacing white space breakpoints' },
      {
        id: 'interaction', title: 'Interaction', lede: 'How things respond to a tap, a drag or a key, so people can predict what happens next.',
        children: [
          { id: 'movement', title: 'Movement', lede: 'Motion people can follow, and making the change that matters obvious.', keywords: 'animation glide' },
          { id: 'page-movement', title: 'Page movement and focus', lede: 'The page only moves when people expect it to, and focus always comes back.', keywords: 'scroll focus return' },
          { id: 'states', title: 'States', lede: 'Hover, focus, pressed, selected, disabled and loading, and how each one looks.', keywords: 'hover pressed disabled' }
        ]
      },
      { id: 'content', title: 'Content design', lede: 'UK English, plain words, Sydney time, AUD, and how to write labels and toasts.', keywords: 'copy writing voice tone dates currency' },
      { id: 'data', title: 'Data and empty states', lede: 'Building against the product data contract, and what a module shows when a field is missing.', keywords: 'contract gap unverified fixtures empty' }
    ]
  },
  {
    id: 'styles', title: 'Styles', icon: 'palette', art: 'styles',
    lede: 'Colour, type, space, shape, elevation and motion, read live from the code so these pages can never drift.',
    pages: [
      { id: 'colour', title: 'Colour', lede: 'Colour roles, what each is for, and its contrast in every brand.', keywords: 'color palette contrast' },
      { id: 'typography', title: 'Typography', lede: 'Typefaces, the type scale and weights.', keywords: 'type font size weight' },
      { id: 'spacing', title: 'Spacing', lede: 'The 4px scale and the rhythm that groups content.', keywords: 'space gap padding' },
      { id: 'shape', title: 'Shape and borders', lede: 'Corner radius and border widths.', keywords: 'radius corner border' },
      { id: 'elevation', title: 'Elevation and layers', lede: 'Shadows and the order things stack in.', keywords: 'shadow z-index' },
      { id: 'motion', title: 'Motion', lede: 'Durations and easing curves.', keywords: 'duration easing animation' },
      { id: 'icons', title: 'Icons', lede: 'The icon set and how to use it.', keywords: 'icon svg' }
    ]
  },
  {
    id: 'components', title: 'Components', icon: 'components', art: 'components',
    lede: 'The building blocks, with live examples drawn from the same CSS the prototypes use.',
    pages: [
      {
        id: 'buttons', title: 'Buttons', lede: 'Buttons let people act. There are three kinds, each with one job.',
        children: [
          { id: 'pill', title: 'Pill button', lede: 'The strong button: one main action in a place.', keywords: 'primary cta' },
          { id: 'add', title: 'Add button', lede: 'A toggle that adds something to the plan and shows it has been added.', keywords: 'toggle pressed added' },
          { id: 'brand', title: 'Brand button', lede: 'The one colourway moment on a screen.', keywords: 'colourway accent' }
        ]
      },
      { id: 'chips', title: 'Chips', lede: 'Single or multiple choice from a short set, such as days or filters.', keywords: 'pill filter choice select' },
      { id: 'tags', title: 'Tags', lede: 'A short caps label that says what something is.', keywords: 'badge label' },
      { id: 'toast', title: 'Toast', lede: 'Confirms a change that landed out of view.', keywords: 'snackbar notification confirm' },
      {
        id: 'sheets', title: 'Sheets', lede: 'More detail or input, opened where the person is.',
        children: [
          { id: 'drill-down', title: 'Drilling down', lede: 'More detail inside a sheet slides across, with a back arrow.', keywords: 'back navigation' },
          { id: 'stacked', title: 'Stacked sheets', lede: 'A sheet over a full-screen layer, never more than two levels.', keywords: 'layer modal' }
        ]
      },
      { id: 'inventory', title: 'Inventory', lede: 'Every component in the code today, its tier and whether it is documented yet.', keywords: 'list all audit status' }
    ]
  },
  {
    id: 'patterns', title: 'Patterns', icon: 'patterns', art: 'patterns',
    lede: 'Components working together to solve a job that comes up again and again.',
    pages: [
      { id: 'selection', title: 'Choosing several things', lede: 'Multi-select with Clear all, and options such as All that replace the specific picks.', keywords: 'multi-select clear all any none' },
      { id: 'confirming', title: 'Confirming a change', lede: 'When a change needs a toast, and when it already shows itself.', keywords: 'toast feedback undo' },
      { id: 'saving', title: 'Saving without an account', lede: 'Keep and share a plan with no sign-in, and take it off the site easily.', keywords: 'save share export account' }
    ]
  },
  {
    id: 'brands', title: 'Brands', icon: 'brands', art: 'brands',
    lede: 'Each brand is a set of values on top of the same roles, so every component works in every brand.',
    pages: [
      { id: 'third-half', title: 'The Third Half', lede: 'DNSW’s own brand for the 3rd half planner. Draft v0.1.', keywords: 'tth hifi orange volt chalk' },
      { id: 'sydney', title: 'Sydney.com', lede: 'Harbour blue on the wireframe base.', keywords: 'sydney blue' },
      { id: 'visitnsw', title: 'Visit NSW', lede: 'Bush green on the wireframe base.', keywords: 'nsw green' },
      { id: 'wireframe', title: 'Wireframe', lede: 'The greyscale base every brand builds on.', keywords: 'greyscale low fidelity base' },
      { id: 'rwc-2027', title: 'RWC 2027 page style', lede: 'The concept style for the Rugby World Cup visitor page.', keywords: 'rugby teal coral sand' }
    ]
  }
];
