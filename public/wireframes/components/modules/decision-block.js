// Vanilla-JS port of contract/components/DecisionBlock.tsx. Bound to the
// shared product record's `pricing` and `availability` blocks (see
// docs/product-data-contract.md §5/§4), plus `links` for the primary
// action. Renders exactly four fields — price from, duration, an
// availability field derived from the whole `availability` block, and the
// primary action — and nothing beyond them. Every field is independently
// nullable: if none are present, mount() hides the container; if some are
// present, only those render.
//
// `availability` is consumed as a whole block, switched on `kind`, not
// read field-by-field — see availabilityField() below and
// docs/product-data-contract.md §4.
//
// `suitable_for` is deliberately not a field here — it exists only under
// `extension.attraction` in the contract, out of scope for a module bound
// to the shared record/pricing/availability.

const DAY_LABELS = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

function formatOperatingDays(days) {
  return days.map((d) => DAY_LABELS[d] ?? d).join(', ');
}

// getDay() is Sunday-indexed (0 = Sunday), but the contract's day keys are
// mon..sun — map explicitly rather than assuming Monday-first.
const DAY_KEYS_BY_GETDAY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function availabilityField(availability) {
  if (!availability || !availability.kind) return null;

  switch (availability.kind) {
    case 'opening_hours': {
      const todayKey = DAY_KEYS_BY_GETDAY[new Date().getDay()];
      const today = (availability.opening_hours ?? []).find((h) => h.day === todayKey);
      if (!today) return null;
      return { label: 'Open today', value: `${today.opens}–${today.closes}` };
    }
    case 'operating_days': {
      const days = availability.operating_days ?? [];
      if (days.length === 0) return null;
      return { label: 'Open', value: formatOperatingDays(days) };
    }
    case 'event_dates': {
      const start = availability.event_dates?.start;
      const end = availability.event_dates?.end;
      if (!start) return null;
      return { label: 'Dates', value: end ? `${start} – ${end}` : start };
    }
    case 'stay_dates': {
      // min_nights uses 0 as the "not applicable" sentinel (see
      // contract/types/product.ts — it's a plain number, not nullable).
      const minNights = availability.min_nights;
      if (!minNights) return null;
      return { label: 'Min stay', value: `${minNights} night${minNights === 1 ? '' : 's'}` };
    }
    default:
      return null;
  }
}

function getPrimaryAction(links) {
  if (links.booking) return { label: 'Book now', href: links.booking };
  if (links.website) return { label: 'Visit website', href: links.website };
  return null;
}

function fieldHtml(label, value, overlay = false) {
  return `<div class="decision-block-field${overlay ? ' provenance-gap' : ''}"><p class="decision-block-label">${label}</p><p class="decision-block-value">${value}</p></div>`;
}

export function mount(container, product) {
  const priceFrom = product.pricing?.from ?? null;
  // typical_duration_minutes uses 0 as the "not applicable" sentinel, same
  // as min_nights (see contract/types/product.ts — it's a plain number,
  // not nullable), so a falsy value is treated as absent, not zero minutes.
  const durationMinutes = product.availability?.typical_duration_minutes || null;
  const availability = availabilityField(product.availability);
  const primaryAction = getPrimaryAction(product.links);

  const hasAnyField = priceFrom !== null || durationMinutes !== null || availability !== null || primaryAction !== null;
  if (!hasAnyField) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.innerHTML = [
    // pricing (§5) and availability (§4) are both "gap on every type" —
    // not currently held — so their rendered values carry the overlay.
    // `links` (§1) is live, and the primary action is untouched.
    priceFrom !== null
      ? fieldHtml('From', `$${priceFrom}${product.pricing?.unit ? ` <span class="unit">${product.pricing.unit.replace('per_', '/ ')}</span>` : ''}`, true)
      : '',
    durationMinutes !== null ? fieldHtml('Duration', formatDuration(durationMinutes), true) : '',
    availability ? fieldHtml(availability.label, availability.value, true) : '',
    primaryAction
      ? `<a href="${primaryAction.href}" target="_blank" rel="noopener noreferrer" class="btn btn-primary decision-block-action">${primaryAction.label}</a>`
      : '',
  ].join('');
}
