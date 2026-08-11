// Live booking-engine availability, bound to `product.live_availability`
// (contract §12). Distinct from availability.js/decision-block.js, which
// bind to `product.availability` (§4) — the static schedule shape, not a
// real-time sessions-and-capacity feed. Mounts in the sidebar info card.

const STATUS_LABELS = { available: 'Available', few_left: 'Few left', sold_out: 'Sold out' };

function fieldHtml(label, value) {
  return `<div class="detail-info-fact"><div class="detail-info-fact-body"><p class="detail-block-label">${label}</p><p>${value}</p></div></div>`;
}

function formatSession(session) {
  const dt = new Date(session.datetime).toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  return `${dt} — ${STATUS_LABELS[session.status] ?? session.status}`;
}

export function mount(container, product) {
  const la = product.live_availability;
  if (!la) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  const sessions = (la.next_sessions ?? []).slice(0, 3).map(formatSession).join('<br>');

  const fields = [
    sessions ? fieldHtml('Next sessions', sessions) : '',
    la.remaining_capacity !== null ? fieldHtml('Remaining capacity', la.remaining_capacity) : '',
    la.sold_out ? fieldHtml('Status', '<span class="trust-badge">Sold out</span>') : '',
    la.booking_partner ? fieldHtml('Booking partner', la.booking_partner) : '',
  ].join('');

  if (fields.trim() === '') {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.innerHTML = `<p class="detail-info-social-title">Available now</p>${fields}`;
}
