// Fetches [data-include] partials and injects them inline.
// Also handles site-switcher theme toggle and page-switcher navigation.
(async function () {
  // ── Include partials ──────────────────────────────────────────────
  const includes = document.querySelectorAll('[data-include]');
  await Promise.all([...includes].map(async el => {
    const src = el.getAttribute('data-include');
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(res.status);
      el.outerHTML = await res.text();
    } catch (e) {
      el.outerHTML = `<div style="border:1px dashed #bbb;padding:.5rem;color:#bbb;font-size:.75rem">Missing: ${src}</div>`;
    }
  }));

  // ── Theme switcher ─────────────────────────────────────────────────
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-theme]');
    if (!btn) return;
    const theme = btn.dataset.theme;
    document.body.className = `theme-${theme}`;
    document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
    const sheet = document.getElementById('theme-sheet');
    if (sheet) sheet.href = sheet.href.replace(/themes\/\w+\.css/, `themes/${theme}.css`);
  });

  // ── Page switcher ──────────────────────────────────────────────────
  document.addEventListener('change', e => {
    const sel = e.target.closest('[data-page-switcher]');
    if (!sel || !sel.value) return;
    window.location.href = sel.value;
  });
})();
