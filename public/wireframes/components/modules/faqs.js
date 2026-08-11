// Renders `product.faqs[]` (contract §1) as accordion items inside the
// page's `.faq-list`, after accessibility.js's item. Bound to real Q&A
// pairs — every audited page's static FAQ block held only the accessibility
// statement, never actual questions, which is what accessibility.js now
// owns separately.
//
// modules.js mounts asynchronously, after the page's own inline <script>
// has already wired up any static `.faq-question` click handlers — so this
// module attaches its own listener to whatever it renders.

function attachToggle(container) {
  container.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open'));
  });
}

export function mount(container, product) {
  const faqs = product.faqs ?? [];
  if (faqs.length === 0) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.innerHTML = faqs
    .map(
      (faq) => `
    <div class="faq-item">
      <button class="faq-question">
        ${faq.question}
        <svg class="faq-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="faq-answer">${faq.answer}</div>
    </div>`
    )
    .join('');
  attachToggle(container);
}
