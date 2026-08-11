// Full availability detail, bound to the whole `product.availability` block
// (contract §4). decision-block.js already derives one compact line from
// this same block for the summary bar at the top of the page — this module
// is the fuller detail lower on the page, not a replacement.
//
// Consumed as a whole block, switched on `kind`, same discipline as
// decision-block.js: the rest of the shape holds "not applicable" sentinels
// (`[]`, `""`, `0`) for whichever kind isn't in play, never read directly.

const DAY_LABELS = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

function fieldHtml(label, value) {
  return `<div class="detail-block-field"><p class="detail-block-label">${label}</p><p class="detail-block-value">${value}</p></div>`;
}

function renderOpeningHours(availability) {
  const rows = (availability.opening_hours ?? [])
    .slice()
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
    .map((h) => `<tr><td>${DAY_LABELS[h.day] ?? h.day}</td><td>${h.opens}–${h.closes}</td></tr>`)
    .join('');
  if (!rows) return '';
  const special = (availability.special_hours ?? [])
    .map((s) => `<li>${s.date}: ${s.opens && s.closes ? `${s.opens}–${s.closes}` : 'Closed'}</li>`)
    .join('');
  return `
    <div class="detail-block-field detail-block-field-wide">
      <p class="detail-block-label">Opening hours</p>
      <table class="availability-hours-table">${rows}</table>
      ${special ? `<p class="detail-block-label" style="margin-top:.75rem;">Special hours</p><ul class="availability-special-hours">${special}</ul>` : ''}
    </div>`;
}

function renderOperatingDays(availability) {
  const days = availability.operating_days ?? [];
  if (days.length === 0) return '';
  const dayList = days.map((d) => DAY_LABELS[d] ?? d).join(', ');
  const departures = (availability.departure_times ?? []).join(', ');
  const seasonal = availability.seasonal?.from
    ? fieldHtml('Season', `${availability.seasonal.from} – ${availability.seasonal.to}`)
    : '';
  return [
    fieldHtml('Operating days', dayList),
    departures ? fieldHtml('Departure times', departures) : '',
    availability.duration_minutes ? fieldHtml('Duration', formatDuration(availability.duration_minutes)) : '',
    seasonal,
  ].join('');
}

function renderEventDates(availability) {
  const start = availability.event_dates?.start;
  if (!start) return '';
  const end = availability.event_dates?.end;
  const sessions = (availability.sessions ?? [])
    .map((s) => `<li>${new Date(s.datetime).toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} — ${s.status === 'sold_out' ? 'Sold out' : 'Available'}</li>`)
    .join('');
  return [
    fieldHtml('Dates', end ? `${start} – ${end}` : start),
    sessions ? `<div class="detail-block-field detail-block-field-wide"><p class="detail-block-label">Sessions</p><ul class="availability-sessions">${sessions}</ul></div>` : '',
  ].join('');
}

function renderStayDates(availability) {
  const minNights = availability.min_nights;
  if (!minNights) return '';
  return [
    fieldHtml('Minimum stay', `${minNights} night${minNights === 1 ? '' : 's'}`),
    availability.checkin_time ? fieldHtml('Check-in', availability.checkin_time) : '',
    availability.checkout_time ? fieldHtml('Check-out', availability.checkout_time) : '',
  ].join('');
}

export function mount(container, product) {
  const availability = product.availability;
  if (!availability || !availability.kind) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  let kindHtml = '';
  switch (availability.kind) {
    case 'opening_hours': kindHtml = renderOpeningHours(availability); break;
    case 'operating_days': kindHtml = renderOperatingDays(availability); break;
    case 'event_dates': kindHtml = renderEventDates(availability); break;
    case 'stay_dates': kindHtml = renderStayDates(availability); break;
    default: kindHtml = '';
  }

  const extras = [
    availability.typical_duration_minutes
      ? fieldHtml('Typical duration', formatDuration(availability.typical_duration_minutes))
      : '',
    fieldHtml('Advance booking required', availability.advance_booking_required ? 'Yes' : 'No'),
  ].join('');

  const hasAnyContent = kindHtml !== '' || extras.trim() !== '';
  if (!hasAnyContent) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.className = 'availability-module detail-block';
  container.innerHTML = `
    <p class="section-title">Availability</p>
    <div class="detail-block-grid">${kindHtml}${extras}</div>
  `;
}
