/* Live examples for the component pages. Each is markup copied from the prototypes' own render code (named beside it),
   drawn in frame.html with the same CSS, so a change to the component's CSS shows here at once. {{icon}} is replaced with
   that icon from the prototypes' icon set. If the render code changes its markup, update the example to match. */
window.DS_EXAMPLES = {
  /* concepts-third-half.js: the plan sheet's add pill (tp-pill tp-pm-add) and the plain pill */
  'pill': {
    html: '<div class="ds-row">' +
      '<div class="ds-cell"><button type="button" class="tp-pill">Pick your teams</button><span class="ds-lab">Default</span></div>' +
      '<div class="ds-cell"><button type="button" class="tp-pill tp-pm-add" aria-pressed="false" data-toggle="Add to your plan|Added to your plan"><span class="tp-pm-add-l">{{add}}<span class="tp-add-t">Add to your plan</span></span></button><span class="ds-lab">As a toggle, off</span></div>' +
      '<div class="ds-cell"><button type="button" class="tp-pill tp-pm-add" aria-pressed="true" data-toggle="Add to your plan|Added to your plan"><span class="tp-pm-add-l">{{added}}<span class="tp-add-t">Added to your plan</span></span></button><span class="ds-lab">As a toggle, on</span></div>' +
      '</div>'
  },
  /* concepts-third-half.js addBtn (the product card's Add) */
  'add': {
    html: '<div class="ds-row">' +
      '<div class="ds-cell"><button type="button" class="tp-add" aria-pressed="false" data-toggle="Add|Added"><span aria-hidden="true">{{add}}<span class="tp-add-t">Add</span></span><span class="visually-hidden">Add Bondi to Coogee walk to your plan</span></button><span class="ds-lab">Off</span></div>' +
      '<div class="ds-cell"><button type="button" class="tp-add" aria-pressed="true" data-toggle="Add|Added"><span aria-hidden="true">{{added}}<span class="tp-add-t">Added</span></span><span class="visually-hidden">Added: Bondi to Coogee walk. Press to remove</span></button><span class="ds-lab">On</span></div>' +
      '</div>'
  },
  /* prototype-pick-your-team.html #tp-tl-share (the plan sheet's foot) */
  'brand': {
    html: '<div class="ds-row"><div class="ds-cell"><button type="button" class="tp-tl-share" id="tp-tl-share">Save &amp; share</button><span class="ds-lab">Save &amp; share at the foot of the plan</span></div></div>'
  },
  /* concepts-third-half.js day chips: single choice */
  'chips-single': {
    html: '<div class="ds-row" role="group" aria-label="Day" data-single>' +
      '<button type="button" class="tp-chip" aria-pressed="true">Sat 9 Oct</button>' +
      '<button type="button" class="tp-chip" aria-pressed="false">Sun 10 Oct</button>' +
      '<button type="button" class="tp-chip" aria-pressed="false">Mon 11 Oct</button>' +
      '</div><p class="ds-lab ds-lab--b">Single choice: picking one replaces the last.</p>'
  },
  /* Multi-select with Clear all (CLAUDE.md interaction checks 2 and 3) */
  'chips-multi': {
    html: '<div class="ds-row" role="group" aria-label="Interests" data-multi>' +
      '<button type="button" class="tp-chip" aria-pressed="false" data-all>Anything</button>' +
      '<button type="button" class="tp-chip" aria-pressed="true">Beaches</button>' +
      '<button type="button" class="tp-chip" aria-pressed="true">Food and drink</button>' +
      '<button type="button" class="tp-chip" aria-pressed="false">Walks</button>' +
      '<button type="button" class="ds-clear">Clear all</button>' +
      '</div><p class="ds-lab ds-lab--b" data-sum aria-live="polite"></p>'
  },
  /* concepts-third-half.js: In NSW and interstate tags */
  'tags': {
    html: '<div class="ds-row"><div class="ds-cell"><span class="tp-tag">In NSW</span><span class="ds-lab">Solid: the main state</span></div>' +
      '<div class="ds-cell"><span class="tp-tag tp-tag--away">Perth</span><span class="ds-lab">Outline: interstate</span></div></div>'
  },
  /* concepts-teams.js toast() with the ticket toast's wording from concepts-third-half.js: title, one line, one link, close */
  'toast': {
    html: '<div class="ds-stack">' +
      '<div class="tp-toast" role="status"><div class="tp-toast-txt"><p class="tp-toast-t">Ticket marked: Team A v Team B</p><p class="tp-toast-d">Your plan, Where to watch and Around your matches are updated.</p></div><button type="button" class="tp-toast-act">See Where to watch</button><button type="button" class="tp-toast-x" aria-label="Close message"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg></button></div>' +
      '<span class="ds-lab">Title, what changed, one link</span>' +
      '<div class="tp-toast"><div class="tp-toast-txt"><p class="tp-toast-t">Your days are now 8 to 14 Oct</p></div><button type="button" class="tp-toast-x" aria-label="Close message"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg></button></div>' +
      '<span class="ds-lab">Repeating change: title only, updated in place</span></div>'
  }
};
