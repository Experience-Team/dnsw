// Full pricing detail, bound to the whole `product.pricing` block
// (contract §5). decision-block.js already shows a compact "From $X" line
// for the summary bar — this module is the fuller detail lower on the page.

function fieldHtml(label, value) {
  return `<div class="detail-block-field"><p class="detail-block-label">${label}</p><p class="detail-block-value">${value}</p></div>`;
}

function formatUnit(unit) {
  return unit ? unit.replace('per_', '/ ') : '';
}

export function mount(container, product) {
  const pricing = product.pricing;
  if (!pricing) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  const priceRange = pricing.is_free
    ? 'Free'
    : pricing.from !== null
      ? `$${pricing.from}${pricing.to !== null && pricing.to !== pricing.from ? ` – $${pricing.to}` : ''} ${formatUnit(pricing.unit)}`
      : '';

  const concessions = (pricing.concessions ?? [])
    .map((c) => `<li>${c.type.charAt(0).toUpperCase() + c.type.slice(1)}: from $${c.from}</li>`)
    .join('');

  const inclusions = (pricing.inclusions ?? []).map((i) => `<li>${i}</li>`).join('');
  const exclusions = (pricing.exclusions ?? []).map((e) => `<li>${e}</li>`).join('');

  const fields = [
    priceRange ? fieldHtml('Price', priceRange) : '',
    pricing.band ? fieldHtml('Price band', pricing.band) : '',
    concessions ? `<div class="detail-block-field"><p class="detail-block-label">Concessions</p><ul>${concessions}</ul></div>` : '',
    pricing.cancellation_policy ? fieldHtml('Cancellation policy', pricing.cancellation_policy) : '',
  ].join('');

  const inclusionsBlock = inclusions || exclusions
    ? `<div class="detail-block-grid" style="margin-top:1rem;">
        ${inclusions ? `<div class="detail-block-field"><p class="detail-block-label">Inclusions</p><ul>${inclusions}</ul></div>` : ''}
        ${exclusions ? `<div class="detail-block-field"><p class="detail-block-label">Exclusions</p><ul>${exclusions}</ul></div>` : ''}
      </div>`
    : '';

  const hasAnyContent = fields.trim() !== '' || inclusionsBlock !== '';
  if (!hasAnyContent) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.className = 'pricing-module detail-block';
  container.innerHTML = `
    <p class="section-title">Pricing</p>
    <div class="detail-block-grid">${fields}</div>
    ${inclusionsBlock}
  `;
}
