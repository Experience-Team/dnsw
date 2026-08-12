// Trust bar, bound to `product.trust` (contract §10) plus the base record's
// own `last_verified` — not `product.trust.last_verified`, which doesn't
// exist; the contract deliberately doesn't duplicate that field (see §10).

function fieldHtml(label, value, overlay = false) {
  return `<div class="trust-field${overlay ? ' provenance-gap' : ''}"><p class="trust-label">${label}</p><p class="trust-value">${value}</p></div>`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function mount(container, product) {
  const trust = product.trust;
  const lastVerified = product.last_verified;

  // aggregate_rating/review_count/review_excerpts are `source: third_party`
  // (contract §10) — not currently held.
  const ratingHtml = trust?.aggregate_rating
    ? fieldHtml('Rating', `${trust.aggregate_rating} / 5${trust.review_count ? ` <span class="unit">(${trust.review_count} reviews)</span>` : ''}`, true)
    : '';

  const excerptsHtml = (trust?.review_excerpts ?? [])
    .slice(0, 3)
    .map((r) => `<p class="trust-review-excerpt provenance-gap">"${r.text}" — ${r.author}, ${r.source}</p>`)
    .join('');

  // accreditations/aboriginal_owned are `source: atdw_existing` (already in
  // ATDW's schema, pending confirmation — see contract §8 item 6), so they
  // render normally. awards is `source: atdw_proposed` — no ATDW analogue
  // today — so it carries the overlay.
  const badges = [
    ...(trust?.accreditations ?? []).map((a) => `<span class="trust-badge">${a}</span>`),
    trust?.aboriginal_owned ? '<span class="trust-badge">Aboriginal owned</span>' : '',
    ...(trust?.awards ?? []).map((a) => `<span class="trust-badge provenance-gap">${a.name} ${a.year}</span>`),
  ].join('');

  // last_verified (contract §1) is itself marked `gap` — nothing on any
  // page in the audit currently shows it.
  const verifiedHtml = lastVerified ? fieldHtml('Last verified', formatDate(lastVerified), true) : '';

  const hasAnyContent = ratingHtml !== '' || excerptsHtml !== '' || badges !== '' || verifiedHtml !== '';
  if (!hasAnyContent) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.innerHTML = [
    ratingHtml,
    excerptsHtml ? `<div class="trust-field">${excerptsHtml}</div>` : '',
    badges ? `<div class="trust-field"><div class="trust-badge-list">${badges}</div></div>` : '',
    verifiedHtml,
  ].join('');
}
