# Standing rules

- `docs/product-data-contract.md` is the source of truth for all product page fields. Do not invent fields. If a field is needed that is not in the contract, stop and ask.
- Fields marked `gap` in the contract do not exist in live data. They render from fixtures only, and every module must define its empty state explicitly.
- Fields marked `unverified` must not be built against until confirmed.
- `public/wireframes/` and `src/` are separate deliverables. `src/` is the CJM and research tool. Do not add product page code to `src/`.
- When a brief ends with stop-and-show, do not commit, open a PR, or merge until the person has answered any questions raised. A stop means stop.
