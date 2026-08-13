// Renders `product.deals[]` (contract §15) as an interactive tab set,
// matching the real page's "Deal 1 / Deal 2 / Deal 3" switcher. Live where
// present (observed on Ingenia Holidays Sydney Hills) — not a proposal, so
// no provenance overlay.

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function mount(container, product) {
  const deals = product.deals ?? [];
  if (deals.length === 0) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  const tabs = deals
    .map(
      (deal, i) => `
    <button type="button" class="deals-tab${i === 0 ? ' active' : ''}" data-deal-index="${i}">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9 2H3a1 1 0 00-1 1v6a1 1 0 00.29.7l6 6a1 1 0 001.42 0l6-6a1 1 0 000-1.42l-6-6A1 1 0 009 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor"/></svg>
      Deal ${i + 1}
    </button>`
    )
    .join('');

  const panels = deals
    .map((deal, i) => {
      const valid = deal.valid_from || deal.valid_to
        ? `<p class="deals-panel-valid">Valid from ${formatDate(deal.valid_from)} to ${formatDate(deal.valid_to)}</p>`
        : '';
      const terms = deal.terms
        ? `<details class="deals-panel-terms"><summary>Terms &amp; Conditions</summary><p>${deal.terms}</p></details>`
        : '';
      const cta = deal.link ? `<a href="${deal.link}" class="btn btn-light btn-sm" target="_blank" rel="noopener">Book the deal ↗</a>` : '';
      return `
    <div class="deals-panel${i === 0 ? ' active' : ''}" data-deal-panel="${i}">
      <div class="deals-panel-image ph-img"></div>
      <div class="deals-panel-body">
        <p class="deals-panel-type">${deal.type}</p>
        <p class="deals-panel-label">${deal.label}</p>
        <p class="deals-panel-desc">${deal.description}</p>
        ${valid}
        ${terms}
        ${cta}
      </div>
    </div>`;
    })
    .join('');

  container.hidden = false;
  container.className = 'deals-module';
  container.innerHTML = `
    <p class="section-title">Deals</p>
    <div class="deals-tabs" role="tablist">${tabs}</div>
    <div class="deals-panels">${panels}</div>
  `;

  container.querySelectorAll('.deals-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-deal-index');
      container.querySelectorAll('.deals-tab').forEach((b) => b.classList.toggle('active', b === btn));
      container.querySelectorAll('.deals-panel').forEach((p) => p.classList.toggle('active', p.getAttribute('data-deal-panel') === idx));
    });
  });
}
