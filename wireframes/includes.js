// Fetches [data-include] partials and injects them inline.
(async function () {
  async function processIncludes(root) {
    const includes = root.querySelectorAll('[data-include]');
    for (const el of includes) {
      const src = el.getAttribute('data-include');
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(res.status);
        const html = await res.text();
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        el.replaceWith(...wrapper.childNodes);
      } catch (e) {
        const err = document.createElement('div');
        err.style.cssText = 'border:1px dashed #bbb;padding:.5rem;color:#bbb;font-size:.75rem';
        err.textContent = 'Missing: ' + src;
        el.replaceWith(err);
      }
    }
  }

  await processIncludes(document);

  // Re-run scripts inserted via include (e.g. nav toggle logic)
  document.querySelectorAll('script[data-included]').forEach(s => {
    const ns = document.createElement('script');
    ns.textContent = s.textContent;
    s.replaceWith(ns);
  });
})();
