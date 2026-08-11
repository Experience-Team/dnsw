# contract/

Types, live/target fixtures, and the reference `DecisionBlock` component for the product data contract (`docs/product-data-contract.md`). This directory is deliberately outside `src/` — `src/` is the CJM/research tool app and its build (`tsconfig.app.json`'s `include: ["src"]`) never sees anything in here.

`contract/fixtures/` and `contract/types/` are consumed by the JSON-generation build step (`npm run fixtures:build`, see `contract/scripts/generate-fixtures.ts`), which serialises each fixture to `public/wireframes/data/{slug}.{live|target}.json` for the static wireframe pages to fetch. `contract/components/DecisionBlock.tsx` is a reference React implementation, kept for parity with the vanilla-JS port at `public/wireframes/components/modules/decision-block.js` — it is not built or imported by anything at runtime.

Nothing here is type-checked by `npm run build`'s `tsc -b` step. If you delete files in this directory, nothing will visibly break except `fixtures:build`, silently, at the next run.
