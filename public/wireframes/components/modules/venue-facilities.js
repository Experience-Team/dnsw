// Renders `product.venue_facilities` (contract §1) as an accordion item
// inside the page's `.faq-list`, between accessibility.js's item and the
// free-text `faqs[]` list. ATDW already carries this data (source:
// atdw_existing) but it hasn't been checked for reliability, so it's
// `unverified` — the yellow overlay, not the pink `gap` one — rather than
// withheld entirely.
//
// modules.js mounts asynchronously, after the page's own inline <script>
// has already wired up any static `.faq-question` click handlers — so this
// module attaches its own listener to whatever it renders.

function attachToggle(container) {
  container.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open'));
  });
}

export function mount(container, product) {
  const facilities = product.venue_facilities ?? [];
  if (facilities.length === 0) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.innerHTML = `
    <div class="faq-item provenance-unverified">
      <button class="faq-question">
        Venue facilities
        <svg class="faq-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="faq-answer"><p>${facilities.join(', ')}</p></div>
    </div>
  `;
  attachToggle(container);
}
