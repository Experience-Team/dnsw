# Proposal: curated trips (for "Around your matches")

Status: **proposal, not a build-against.** Nothing here is in `docs/product-data-contract.md` yet. The prototype (`public/wireframes/prototype-pick-your-team.html`) renders curated trips from fixture-only data (`window.cnTrips` in `public/wireframes/concepts-fixtures.js`) with the pink gap marker, so it can be judged before anyone builds against it.

## Why

"Around your matches" organises a fan's days in NSW into match days and free stretches. Free days need things that fill a day or a few nights: a Blue Mountains day out, a Hunter Valley weekend. These are not single products. They are curated by the DNSW team from ATDW products plus the team's own custom products, so they need a record of their own.

## Markers used below

These follow the contract's markers:

- **gap:** in the contract's model but not in live data.
- **proposed:** not in the contract at all; a new ask.
- **derived:** worked out from other fields, never written by hand.
- **fixture-only:** exists only in the prototype's placeholder data.

Everything in this document is also fixture-only in the prototype today.

## 1. Curated trip record (proposed)

```json
{
  "id": "string",
  "kind": "day_trip | longer_trip",
  "nights": "number (longer trips only; 0 for a day trip)",
  "title": "string",
  "summary": "string (one line)",
  "region": "string",
  "image": { "url": "string", "alt": "string", "credit": "string" },
  "base_place_refs": ["place_ref"],
  "on_the_way": "boolean",
  "travel_times": [{ "from_place_ref": "place_ref", "mode": "train | car | coach | ferry", "minutes": "number" }],
  "stops": [
    { "source": "atdw", "product_ref": "string" },
    { "source": "custom", "custom_product_ref": "string" }
  ],
  "curated_by": "Destination NSW",
  "last_verified": "date"
}
```

| Field | Marker | Notes |
|---|---|---|
| `id`, `title`, `summary`, `region`, `image` | proposed | Written by the DNSW team. |
| `kind`, `nights` | proposed | Decide where a trip can go: one or two free days get day trips; three or more get longer trips first. A longer trip needs `nights` + 2 free days, so it never ends next to a match day. |
| `base_place_refs` | proposed | The host city or cities it starts from (Sydney, Newcastle). Uses `place_ref` (§3), which is itself unverified. |
| `on_the_way` | proposed | Suits a free stretch between a Newcastle match and a Sydney match, for example the Hunter Valley. |
| `travel_times[]` | proposed | See §3 below. |
| `stops[]` | proposed | Ordered references only, so the trip reads its stops' live data instead of copying it. |
| `curated_by` | proposed | Shown on the card as "Curated by Destination NSW". |
| `last_verified` | proposed (pattern of §1 `last_verified`) | When the team last checked the trip. |

## 2. Worked out from the stops (derived, never written by hand)

| Value | From | Marker |
|---|---|---|
| Days the trip runs | The days every stop is open: `availability.opening_hours` or `operating_days` (§4) of each stop, intersected | derived from gap fields |
| Price band | The dearest stop's `pricing.from` (§5), as a band (`$`, `$$`, `$$$`, or free) | derived from gap fields |
| "Fits Sun 10 Oct" / "Fits 2 nights of your 4" | The trip's run days and `nights`, against the fan's free stretch | derived at render time, not stored |
| Stop order on the trip page | Travel time from the start, then name (neutral) | derived |

The prototype computes the first two from the fixture stops (`tripDays`, `tripBand` in `concepts-third-half.js`).

## 3. Travel times from more than one origin (proposed)

The contract has `getting_there.travel_time_from_cbd_minutes` (§11, gap, derived), which assumes one origin, the Sydney CBD. Fans in this tournament are based in Sydney or Newcastle, and how they travel matters to people without a car. The proposal is to generalise it:

```json
"getting_there": {
  "travel_times": [{ "from_place_ref": "place_ref", "mode": "train | car | coach | ferry", "minutes": "number" }]
}
```

- **Marker:** proposed. The values are derived from a routing API, as `travel_time_from_cbd_minutes` already is.
- **Migration:** `travel_time_from_cbd_minutes` becomes one entry, with the Sydney CBD as the origin. Keep it as a read of that entry until pages move over.
- **Scope:** used on both curated trips and their stops.
- **In the prototype:** fixture-only figures, `travel: { sydney: { mode, minutes }, newcastle: { … } }`.

## 4. What a custom product needs (proposed)

A custom product is a stop the DNSW team adds that is not an ATDW listing, for example a lookout, a coastal walk or a picnic spot. To sit beside ATDW stops and look the same apart from a small source label, it should use the shared product record (§1) with:

| Field | Marker | Notes |
|---|---|---|
| `id`, `type`, `title`, `overview`, `gallery`, `address` (with `geo`) | proposed (same shape as §1) | Same fields as an ATDW product, so cards and pages render it the same way. |
| `source: "custom"` | proposed | Drives the "Custom: Destination NSW" label. ATDW stops read "ATDW listing". |
| `availability` | gap (§4) | Many custom stops are open all the time; `kind: opening_hours` with every day still lets "runs on" be worked out. |
| `pricing` | gap (§5) | Usually `is_free: true`. |
| `getting_there.travel_times` | proposed (§3 above) | |
| `accessibility` | unverified (§2) | Same treatment as ATDW records. |
| `links.website` | gap | May be a DNSW page rather than an operator's. |
| `last_verified` | proposed | Needed because no ATDW sync stands behind it. |

Custom products should not carry `operator_ref` or `links.booking`, as there is no operator to favour and nothing to book.

## 5. Showing a trip on the plan (prototype behaviour, local only)

- **A day trip:** one item on its day, with a square marker and a route icon.
- **A longer trip:** a solid span across its nights, with its title. It is placed at the start of its free stretch, and Move offers the other valid starts.
- **A clash** with a match or a ticket is hatched on the timeline and named in the detail. Nothing moves automatically.
- **Copy plan:** "Tue 12 to Thu 14 Oct: Hunter Valley (2 nights)".
- **Storage:** these are added items on the device (`tp-pick-v1`), not contract fields.

## Neutrality

- Trips and stops are sorted by a neutral key: travel time, then name.
- Nothing is booked on the site, and links go out only.
- A curated trip should not mix operators in a way that favours one. The team's curation needs a stated rule, for example at least two stops from different operators, or only free custom stops alongside one ATDW listing. This is an open question.

## Open questions

1. Who owns curated trips and custom products: the Drupal content team, or a new ATDW-adjacent store?
2. What is the curation rule that keeps trips neutral when they include paid operator products?
3. Should `nights` drive accommodation suggestions, or stay a fact on the card? The site does not book, and today it stays a fact.
4. Should `base_place_refs` wait for `place_ref` (§3, unverified), or use a plain list of host cities for now?
