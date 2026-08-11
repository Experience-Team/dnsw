// Getting-there logistics, bound to `product.getting_there` (contract §11).
// Mounts in the sidebar info card, reusing its existing heading style
// rather than introducing a new one.

function fieldHtml(label, value) {
  return `<div class="detail-info-fact"><div class="detail-info-fact-body"><p class="detail-block-label">${label}</p><p>${value}</p></div></div>`;
}

export function mount(container, product) {
  const gt = product.getting_there;
  if (!gt) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  const transport = (gt.nearest_transport ?? [])
    .map((t) => `${t.name}${t.walking_minutes ? ` (${t.walking_minutes} min walk)` : ''}`)
    .join(', ');

  const parking = gt.parking?.available
    ? `Available${gt.parking.cost ? ` — ${gt.parking.cost}` : ''}${gt.parking.distance_minutes !== null ? ` (${gt.parking.distance_minutes} min walk)` : ''}`
    : gt.parking && gt.parking.available === false
      ? 'Not available'
      : '';

  const fields = [
    transport ? fieldHtml('Nearest transport', transport) : '',
    parking ? fieldHtml('Parking', parking) : '',
    gt.travel_time_from_cbd_minutes ? fieldHtml('From the CBD', `${gt.travel_time_from_cbd_minutes} min`) : '',
    gt.pickup_point ? fieldHtml('Pick-up point', gt.pickup_point) : '',
  ].join('');

  if (fields.trim() === '') {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.innerHTML = `<p class="detail-info-social-title">Getting there</p>${fields}`;
}
