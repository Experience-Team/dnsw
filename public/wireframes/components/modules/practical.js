// Practical prep, bound to `product.practical` (contract §14) plus
// `product.availability.advance_booking_required` — not a `practical`
// field, read directly from the availability block per the contract's own
// note (§14) rather than duplicated.

function fieldHtml(label, value) {
  return `<div class="detail-block-field"><p class="detail-block-label">${label}</p><p class="detail-block-value">${value}</p></div>`;
}

export function mount(container, product) {
  const p = product.practical;
  const advanceBooking = product.availability?.advance_booking_required;

  const fields = [
    p && (p.what_to_bring ?? []).length > 0 ? fieldHtml('What to bring', p.what_to_bring.join(', ')) : '',
    p && (p.on_site_facilities ?? []).length > 0 ? fieldHtml('On-site facilities', p.on_site_facilities.join(', ')) : '',
    p && p.best_time_to_visit ? fieldHtml('Best time to visit', p.best_time_to_visit) : '',
    advanceBooking !== undefined && advanceBooking !== null
      ? fieldHtml('Advance booking required', advanceBooking ? 'Yes' : 'No')
      : '',
  ].join('');

  if (fields.trim() === '') {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.className = 'practical-module detail-block';
  container.innerHTML = `
    <p class="section-title">Good to know</p>
    <div class="detail-block-grid">${fields}</div>
  `;
}
