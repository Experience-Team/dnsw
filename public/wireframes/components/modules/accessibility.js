// Renders `product.accessibility` (contract §2) as the first accordion item
// inside the page's `.faq-list`. Mounted separately from faqs.js so the two
// concerns — a structured accessibility statement vs. free-text Q&A pairs —
// stay independently bindable, even though they render side by side.
//
// `not_stated` is rendered as a visible state, not silence — that's the
// whole point of the accessibility redesign in contract §2: a negative
// answer and an unfilled field must not look the same.
//
// modules.js mounts asynchronously, after the page's own inline <script>
// has already wired up any static `.faq-question` click handlers — so this
// module attaches its own listener to whatever it renders, rather than
// relying on that page-level wiring running again.

const STATUS_LABELS = {
  welcomes: 'Actively welcomes people with access needs',
  partial: 'Partially accessible',
  does_not_cater: 'Does not cater for people with access needs',
  not_stated: 'Not stated',
};

const FEATURE_LABELS = {
  wheelchair_access: 'Wheelchair access',
  accessible_parking: 'Accessible parking',
  hearing_loop: 'Hearing loop',
  assistance_animals_welcome: 'Assistance animals welcome',
  accessible_bathroom: 'Accessible bathroom',
  step_free_entry: 'Step-free entry',
  companion_card_accepted: 'Companion Card accepted',
};

function attachToggle(container) {
  container.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open'));
  });
}

export function mount(container, product) {
  const accessibility = product.accessibility;
  if (!accessibility || !accessibility.status) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  const statusLabel = STATUS_LABELS[accessibility.status] ?? accessibility.status;
  const features = (accessibility.features ?? [])
    .map((f) => FEATURE_LABELS[f] ?? f)
    .join(', ');

  const bodyParts = [
    `<span class="accessibility-status-badge">${statusLabel}</span>`,
    accessibility.detail ? `<p>${accessibility.detail}</p>` : '',
    features ? `<p>${features}</p>` : '',
    accessibility.operator_access_url
      ? `<p><a href="${accessibility.operator_access_url}" target="_blank" rel="noopener noreferrer">Access and Inclusion Statement ↗</a></p>`
      : '',
  ].join('');

  // The structured shape this module renders is still a proposal (contract
  // §2), but the underlying data is already in ATDW (confirmed on Mother
  // Chu's) — it just hasn't been checked for reliability across the wider
  // dataset. That's `unverified`, not `gap`: the yellow overlay, not pink.
  container.hidden = false;
  container.innerHTML = `
    <div class="faq-item provenance-unverified">
      <button class="faq-question">
        Accessibility
        <svg class="faq-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="faq-answer">${bodyParts}</div>
    </div>
  `;
  attachToggle(container);
}
