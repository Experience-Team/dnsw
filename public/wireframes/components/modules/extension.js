// Type-specific extension block detail, bound to `product.extension`
// (contract §6). One file dispatching internally on `product.type`, same
// precedent as decision-block.js's internal `switch (availability.kind)` —
// every page mounts the same `data-module="extension"` regardless of which
// of the six types it is.

function fieldHtml(label, value) {
  return `<div class="detail-block-field"><p class="detail-block-label">${label}</p><p class="detail-block-value">${value}</p></div>`;
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

function renderTour(ext) {
  const itinerary = (ext.itinerary ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((i) => `<li><strong>${i.title}</strong> (${formatDuration(i.duration_minutes)}) — ${i.description}</li>`)
    .join('');
  return [
    itinerary ? `<div class="detail-block-field detail-block-field-wide"><p class="detail-block-label">Itinerary</p><ol>${itinerary}</ol></div>` : '',
    ext.meeting_point?.description ? fieldHtml('Meeting point', ext.meeting_point.description) : '',
    ext.group_size ? fieldHtml('Group size', `${ext.group_size.min}–${ext.group_size.max}`) : '',
    (ext.languages ?? []).length > 0 ? fieldHtml('Languages', ext.languages.join(', ')) : '',
    ext.fitness_level ? fieldHtml('Fitness level', ext.fitness_level.charAt(0).toUpperCase() + ext.fitness_level.slice(1)) : '',
    ext.min_age ? fieldHtml('Minimum age', ext.min_age) : '',
    (ext.what_to_bring ?? []).length > 0 ? fieldHtml('What to bring', ext.what_to_bring.join(', ')) : '',
  ].join('');
}

function renderFoodAndDrink(ext) {
  return [
    (ext.cuisine ?? []).length > 0 ? fieldHtml('Cuisine', ext.cuisine.join(', ')) : '',
    (ext.meal_services ?? []).length > 0 ? fieldHtml('Meal services', ext.meal_services.join(', ')) : '',
    (ext.dietary ?? []).length > 0 ? fieldHtml('Dietary options', ext.dietary.join(', ')) : '',
    ext.menu_url ? fieldHtml('Menu', `<a href="${ext.menu_url}" target="_blank" rel="noopener noreferrer">View menu ↗</a>`) : '',
    ext.dress_code ? fieldHtml('Dress code', ext.dress_code) : '',
    fieldHtml('Bookings required', ext.bookings_required ? 'Yes' : 'No'),
    fieldHtml('Licensed', ext.licensed ? 'Yes' : 'No'),
  ].join('');
}

function renderEvent(ext) {
  const tickets = (ext.ticket_types ?? [])
    .map((t) => `<li>${t.name} — from $${t.from}${t.description ? ` (${t.description})` : ''}</li>`)
    .join('');
  return [
    tickets ? `<div class="detail-block-field detail-block-field-wide"><p class="detail-block-label">Ticket types</p><ul>${tickets}</ul></div>` : '',
    ext.seating ? fieldHtml('Seating', ext.seating.replace('_', ' ')) : '',
    ext.runtime_minutes ? fieldHtml('Runtime', formatDuration(ext.runtime_minutes)) : '',
    ext.interval !== undefined ? fieldHtml('Interval', ext.interval ? 'Yes' : 'No') : '',
    ext.age_guidance ? fieldHtml('Age guidance', ext.age_guidance) : '',
    (ext.performer ?? []).length > 0 ? fieldHtml('Performers', ext.performer.join(', ')) : '',
    ext.producer ? fieldHtml('Producer', ext.producer) : '',
  ].join('');
}

function renderAttraction(ext) {
  return [
    (ext.facilities ?? []).length > 0 ? fieldHtml('Facilities', ext.facilities.join(', ')) : '',
    ext.typical_visit_minutes ? fieldHtml('Typical visit', formatDuration(ext.typical_visit_minutes)) : '',
    (ext.suitable_for ?? []).length > 0 ? fieldHtml('Suitable for', ext.suitable_for.join(', ')) : '',
    ext.indoor_outdoor ? fieldHtml('Indoor / outdoor', ext.indoor_outdoor) : '',
    fieldHtml('Free entry', ext.free_entry ? 'Yes' : 'No'),
  ].join('');
}

function renderHire(ext) {
  const items = (ext.items ?? [])
    .map((i) => `<li>${i.name} — from $${i.from} ${i.unit.replace('per_', '/ ')}</li>`)
    .join('');
  return [
    items ? `<div class="detail-block-field detail-block-field-wide"><p class="detail-block-label">Items</p><ul>${items}</ul></div>` : '',
    (ext.hire_periods ?? []).length > 0 ? fieldHtml('Hire periods', ext.hire_periods.join(', ')) : '',
    (ext.requirements ?? []).length > 0 ? fieldHtml('Requirements', ext.requirements.join(', ')) : '',
    ext.min_age ? fieldHtml('Minimum age', ext.min_age) : '',
    ext.min_height_cm ? fieldHtml('Minimum height', `${ext.min_height_cm}cm`) : '',
    fieldHtml('Deposit required', ext.deposit_required ? 'Yes' : 'No'),
    (ext.equipment_included ?? []).length > 0 ? fieldHtml('Equipment included', ext.equipment_included.join(', ')) : '',
  ].join('');
}

function renderAccommodation(ext) {
  return [
    ext.category ? fieldHtml('Category', ext.category.replace('_', ' ')) : '',
    ext.star_rating ? fieldHtml('Star rating', `${ext.star_rating.value} star <span class="unit">(${ext.star_rating.source === 'accredited' ? 'accredited' : 'self-declared'})</span>`) : '',
    ext.total_capacity?.rooms ? fieldHtml('Rooms', ext.total_capacity.rooms) : '',
    (ext.facilities ?? []).length > 0 ? fieldHtml('Facilities', ext.facilities.join(', ')) : '',
    (ext.in_room_amenities ?? []).length > 0 ? fieldHtml('In-room amenities', ext.in_room_amenities.join(', ')) : '',
    ext.bathroom ? fieldHtml('Bathroom', ext.bathroom) : '',
    ext.parking?.available !== undefined ? fieldHtml('Parking', ext.parking.available ? `${ext.parking.type ?? 'Available'}${ext.parking.cost ? ` — ${ext.parking.cost}` : ''}` : 'Not available') : '',
    fieldHtml('Pets allowed', ext.pets_allowed ? 'Yes' : 'No'),
    (ext.meals_included ?? []).length > 0 ? fieldHtml('Meals included', ext.meals_included.join(', ')) : '',
    ext.brand ? fieldHtml('Brand', ext.brand) : '',
  ].join('');
}

const RENDERERS = {
  tour: renderTour,
  food_and_drink: renderFoodAndDrink,
  event: renderEvent,
  attraction: renderAttraction,
  hire: renderHire,
  accommodation: renderAccommodation,
};

export function mount(container, product) {
  const ext = product.extension;
  const renderer = RENDERERS[product.type];
  if (!ext || !renderer) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  const fields = renderer(ext);
  if (!fields || fields.trim() === '') {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.className = 'extension-module detail-block';
  container.innerHTML = `
    <p class="section-title">About this experience</p>
    <div class="detail-block-grid">${fields}</div>
  `;
}
