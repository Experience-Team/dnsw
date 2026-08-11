// Fetches [data-module] fixture data and mounts the matching JS module,
// mirroring includes.js's declarative-attribute-scan style. Loaded as
// <script type="module"> so it can use dynamic import().
//
// URL param ?fixture=live|target picks which fixture variant loads
// (default live). Each element needs data-module (the module filename
// under components/modules/, without .js) and data-slug (the fixture id,
// matching public/wireframes/data/{slug}.{variant}.json).
(function () {
  const params = new URLSearchParams(window.location.search);
  const variant = params.get('fixture') === 'target' ? 'target' : 'live';

  document.querySelectorAll('[data-module]').forEach(async (container) => {
    const moduleName = container.getAttribute('data-module');
    const slug = container.getAttribute('data-slug');
    if (!moduleName || !slug) return;

    try {
      // import() resolves relative to this script's own URL (import.meta.url),
      // not the including page's — correct regardless of page depth.
      const modulePromise = import(new URL(`./components/modules/${moduleName}.js`, import.meta.url));

      // fetch() resolves relative URLs against the *including page's*
      // location, not this script's — so this must also be built from
      // import.meta.url explicitly, or it 404s once a page other than one
      // sitting at the same depth as this file includes it.
      const dataUrl = new URL(`./data/${slug}.${variant}.json`, import.meta.url);
      const dataPromise = fetch(dataUrl).then((res) => {
        if (!res.ok) throw new Error(`${res.status} fetching ${dataUrl}`);
        return res.json();
      });

      const [mod, product] = await Promise.all([modulePromise, dataPromise]);
      if (mod && typeof mod.mount === 'function') {
        mod.mount(container, product);
      }
    } catch (e) {
      container.hidden = false;
      container.style.cssText = 'border:1px dashed #bbb;padding:.5rem;color:#bbb;font-size:.75rem';
      container.textContent = 'Module failed to load: ' + moduleName + ' (' + e.message + ')';
    }
  });
})();
