# Product data contract, v0.1

Draft, 11 August 2026. For wireframe binding and as the object model input to the GEO schema work.

## Status and evidence base

Extracted from authored field lists for five live records: Disney's The Lion King (event), BridgeClimb Sydney and UnderBridge Walk (tour parent and child), Mother Chu's Taiwanese Gourmet (food and drink), InterContinental Sydney (accommodation).

The shared block held across all five with no new field shapes. Every difference between types was a null value or a rendering variation, never a structural one.

Two extension blocks, attraction and hire, are inferred from the page audit rather than from extracted records. They are marked as such and should be confirmed before build.

## How to read the markers

Every field carries a `_meta` marker:

| Marker | Meaning |
|---|---|
| `authored` | Operator enters it |
| `generated` | System produces it, operator can edit or remove (see provenance) |
| `derived` | Computed from other fields, no form control, still binds to the wireframe |
| `referenced` | Points at another object |
| `inherited` | Child products take the parent value unless overridden |

And a `_status` marker:

| Marker | Meaning |
|---|---|
| `live` | Exists today and renders |
| `gap` | In the audit, not in the current model |
| `unverified` | May exist in ATDW but is not rendered, needs checking before it is treated as either |

---

## 1. Shared product record

Every product type has all of these. Confirmed against all five records.

```json
{
  "id": "string",
  "type": "tour | food_and_drink | event | attraction | hire | accommodation",
  "title": "string",
  "overview": "string (rich text)",
  "highlights": {
    "items": ["string", "string", "string"],
    "provenance": "generated | edited | removed | approved",
    "generated_at": "date"
  },
  "gallery": [{ "url": "string", "alt": "string", "credit": "string" }],
  "address": {
    "line": "string",
    "suburb": "string",
    "state": "string",
    "postcode": "string",
    "country": "string",
    "geo": { "lat": "number", "lng": "number" }
  },
  "contact": {
    "phone": "string | null",
    "email": "string | null"
  },
  "socials": [{ "platform": "facebook | instagram | x | tiktok | youtube", "url": "string" }],
  "links": {
    "booking": "string | null",
    "website": "string | null"
  },
  "accessibility": { },
  "faqs": [{ "question": "string", "answer": "string" }],
  "place_ref": "string | null",
  "operator_ref": "string | null",
  "parent_ref": "string | null",
  "last_verified": "date"
}
```

### Field notes

**`type`** — `gap`. Absent from every page in the audit. Not because the model can't hold it but because nothing renders it. Drives the visible type label and the schema.org `@type`.

**`highlights`** — `generated`, `inherited`. Currently AI-generated with no operator control and no visible provenance. The proposal to make these editable and removable should carry a **state**, not just a value, so that a deliberate removal is distinguishable from a silent generation failure. UnderBridge Walk has no highlights and nothing in the record says whether that was a choice. Absent on events only.

**`socials`** — `authored`, `inherited`. Modelled as a repeater of typed platform plus URL rather than named fields per platform, because BridgeClimb carries X and the others do not. Maps to schema.org `sameAs`, which is a meaningful entity-disambiguation signal for AI surfaces and is worth confirming reaches the markup.

**`links.booking`** — `authored`, nullable. Confirmed optional: absent on Mother Chu's and on the hire page in the audit.

**`contact`** — `authored`, `inherited`. Should inherit to child products. Today it does not, so UnderBridge Walk has no phone number despite being the same business at the same address as its parent.

**`last_verified`** — `derived`, `gap`. From the ATDW sync timestamp. Nothing on any page tells a user or a crawler when the information was last checked.

---

## 2. Accessibility

Currently one authored free-text field driving both the wheelchair icon and the FAQ answer, with the icon suppressed on a negative value. Confirmed on Mother Chu's, which states it does not cater for access needs and shows no icon.

The problem is that a negative value and an unfilled field render identically. For the one audience where a wrong answer means a wasted trip, "no" and "not stated" are indistinguishable.

Proposed shape:

```json
"accessibility": {
  "status": "welcomes | partial | does_not_cater | not_stated",
  "features": ["wheelchair_access", "accessible_parking", "hearing_loop",
               "assistance_animals_welcome", "accessible_bathroom",
               "step_free_entry", "companion_card_accepted"],
  "detail": "string | null",
  "operator_access_url": "string | null"
}
```

`not_stated` becomes a visible state rather than silence. `features` becomes filterable and maps to schema.org `accessibilityFeature`. Freeing accessibility out of the FAQ repeater lets `faqs` hold actual questions, which is why the FAQ block on every page in the audit contains no FAQs.

---

## 3. References

### `place_ref`

`referenced`, `unverified`.

The Lion King carries venue name and venue address as flat strings on the event record. That means the Capitol Theatre exists as many disconnected copies, one per event, with no way to list what else is on there and no guarantee two events spell it the same.

```json
{
  "id": "string",
  "name": "string",
  "address": { },
  "contained_in": "string | null"
}
```

**Open, and it matters.** Nothing across the five records expresses containment. Bennelong inside the Opera House, and the InterContinental and Pier One restaurants, all sit as plain street addresses with no relationship to their host. If ATDW has no representation of containment, `place_ref` is a warehouse proposal rather than a contract decision. Confirm before building.

If containment is out of reach short term, a nullable `venue` object on the product handles the Lion King case without a full Place table. That is the smaller move.

### `operator_ref`

`referenced`, `gap`.

BridgeClimb Sydney has an address, a gallery and an overview but nothing bookable. Everything purchasable is a child. It is an operator landing page occupying a product record.

Splitting operator from product would let contact details, socials and accreditation live once and inherit, and would stop parent records competing with their own children in search.

### `parent_ref`

`referenced`, `live` for tours only.

Settled by the UnderBridge Walk page: children have their own URL, breadcrumb, gallery, overview, address, booking link and FAQs. They are full products with a parent reference, not variants of a parent record. No embedded variant array needed.

The Our Tours module is therefore `derived`, not authored. The parent lists seven children, the child lists six excluding itself, and the cards pull image, name and truncated description straight from the child records.

**Inheritance must be stated per field**, or "which fields does a child have" is answered by whatever the operator happened to fill in. Proposed defaults:

| Field | Rule |
|---|---|
| `contact`, `socials`, `operator_ref`, `accessibility` | inherited, overridable |
| `title`, `overview`, `gallery`, `links`, `availability` | child-only |
| `highlights` | child-only, generated per child |
| `address` | inherited, overridable |

**Also needs deciding:** room types are held in ATDW as child products using this same structure. Whether InterContinental actually has child room records that the site is not rendering, or has none at all, changes the owner of the fix. Template gap versus population gap. Verify directly.

---

## 4. Availability

`gap` on every type. The shared abstraction, typed by product.

Event, tour, food and drink and accommodation all populate this differently and all four leave it almost entirely empty. Modelling it as one named block rather than unrelated fields per type is what lets "is this on while I am in Sydney" be answered once.

```json
"availability": {
  "kind": "opening_hours | operating_days | event_dates | stay_dates",

  "opening_hours": [{ "day": "string", "opens": "time", "closes": "time" }],
  "special_hours": [{ "date": "date", "opens": "time | null", "closes": "time | null" }],

  "operating_days": ["mon", "tue"],
  "departure_times": ["time"],
  "duration_minutes": "number",
  "seasonal": { "from": "date", "to": "date" },

  "event_dates": { "start": "date", "end": "date" },
  "sessions": [{ "datetime": "datetime", "status": "available | sold_out" }],
  "recurrence": "structured RRULE, not a display string",

  "min_nights": "number",
  "checkin_time": "time",
  "checkout_time": "time",

  "advance_booking_required": "boolean",
  "typical_duration_minutes": "number"
}
```

The Lion King currently holds start date, end date and a display string reading "DAILY event". There is no performance time anywhere, so the record is browsable but not schedulable. `recurrence` must be structured or it cannot be reasoned about.

Consumers must read `availability` as a whole block, switched on `kind`, not field by field. `kind` says which of the sub-shapes above is populated for this record; the rest are present but hold their "not applicable" sentinel (`[]`, `""`, or `0`) rather than real data. Binding to one sub-field directly (e.g. `operating_days` alone) silently breaks for every `kind` that doesn't use it.

---

## 5. Pricing

`gap` on every type. Absent from all six pages in the audit.

```json
"pricing": {
  "from": "number | null",
  "to": "number | null",
  "currency": "AUD",
  "band": "derived: $ | $$ | $$$ | $$$$",
  "is_free": "boolean",
  "unit": "per_person | per_night | per_group | per_hour | per_ticket",
  "concessions": [{ "type": "child | senior | family | student", "from": "number" }],
  "inclusions": ["string"],
  "exclusions": ["string"],
  "cancellation_policy": "string | null"
}
```

`unit` is what makes one price field work across a hotel night, a tour seat and a bike hour.

---

## 6. Extension blocks

Empty for every type today. This is where the audit gaps land, and they are additive rather than a redesign.

```json
"extension": {

  "tour": {
    "itinerary": [{ "order": "number", "title": "string", "description": "string",
                    "duration_minutes": "number" }],
    "meeting_point": { "description": "string", "geo": { } },
    "group_size": { "min": "number", "max": "number" },
    "languages": ["string"],
    "fitness_level": "easy | moderate | challenging",
    "min_age": "number",
    "what_to_bring": ["string"]
  },

  "food_and_drink": {
    "cuisine": ["string"],
    "meal_services": ["breakfast", "lunch", "dinner"],
    "dietary": ["vegetarian", "vegan", "gluten_free", "halal", "kosher"],
    "menu_url": "string | null",
    "dress_code": "string | null",
    "bookings_required": "boolean",
    "licensed": "boolean"
  },

  "event": {
    "ticket_types": [{ "name": "string", "from": "number", "description": "string" }],
    "seating": "reserved | general_admission | standing",
    "runtime_minutes": "number",
    "interval": "boolean",
    "age_guidance": "string",
    "performer": ["string"],
    "producer": "string"
  },

  "attraction": {
    "_confirmed": false,
    "facilities": ["string"],
    "typical_visit_minutes": "number",
    "suitable_for": ["families", "couples", "solo", "groups", "school_groups"],
    "indoor_outdoor": "indoor | outdoor | both",
    "free_entry": "boolean"
  },

  "hire": {
    "_confirmed": false,
    "items": [{ "name": "string", "from": "number", "unit": "per_hour | per_day" }],
    "hire_periods": ["string"],
    "requirements": ["string"],
    "min_age": "number",
    "min_height_cm": "number",
    "deposit_required": "boolean",
    "equipment_included": ["string"]
  },

  "accommodation": {
    "category": "hotel | motel | bnb | hostel | holiday_park | apartment | caravan_camping | farmstay",
    "star_rating": { "value": "number", "source": "accredited | self_declared" },
    "total_capacity": { "rooms": "number", "sites": "number", "beds": "number" },
    "room_types_ref": ["child product ids"],
    "facilities": ["string"],
    "in_room_amenities": ["string"],
    "self_catering": ["kitchen", "kitchenette", "laundry", "bbq"],
    "bathroom": "private | shared | both",
    "sites": { "powered": "number", "unpowered": "number" },
    "parking": { "available": "boolean", "cost": "string | null", "type": "string" },
    "pets_allowed": "boolean",
    "smoking_allowed": "boolean",
    "children": { "cots": "boolean", "extra_beds": "boolean", "free_under_age": "number" },
    "meals_included": ["breakfast"],
    "brand": "string | null"
  }
}
```

`star_rating.source` matters. Pier One calls itself a five-star lifestyle hotel inside body prose. Self-declaration presented as fact. ATDW carries an accredited rating field that would let the site distinguish the two.

---

## 7. Derived fields

No form control. Still bind to the wireframe, so leaving them out means the design silently depends on data the contract does not describe.

| Field | From |
|---|---|
| `nearby` | geo proximity |
| `more_like_this` | type plus geo |
| `our_tours` | `parent_ref` |
| `distance_from_cbd` | geo |
| `price_band` | `pricing.from` |
| `open_now` | `availability.opening_hours` |
| `last_verified` | ATDW sync timestamp |
| `directions_url` | geo |
| `appears_in_itineraries` | Drupal itineraries |

**Naming problem to fix.** The tour sub-nav says "Nearby" but the module it jumps to is Our Tours, which is operator siblings, not proximity. Nearby, More Like This and Our Tours are three different promises and currently two of them share a label. Pick distinct headings that match the logic, or change the logic.

**Coverage problem.** Tour pages have no proximity recommender at all. Our Tours displaces it rather than supplementing it, so a user on a tour page can only move sideways within one operator, never outward.

---

## 8. Open questions

Ranked by how much they block the build.

1. **Room types.** Does InterContinental have child room product records in ATDW that the site is not rendering, or none at all? Template gap versus population gap, different owner either way.
2. **Containment.** Can ATDW express one product sitting inside another? If not, `place_ref` is a warehouse proposal, and Bennelong and the in-hotel restaurants have no representation at all.
3. **Attraction and hire extensions.** Inferred from the audit, not from extracted records. Confirm against real field lists.
4. **Operator as an object.** Worth splitting from product, or handled as an inherited field group?
5. **Breadcrumb truncation.** Renders as an ellipsis on some pages and in full on the tour child page. Depth-driven or width-driven? Affects the IA signal, not the contract.
6. **Accreditation and Aboriginal-owned attributes.** Marked `source: atdw_existing` in §10 on the assumption ATDW's schema already carries these — confirm they exist as structured fields before treating them as anything other than `atdw_proposed`.

## 9. Proposals to ATDW arising

- Highlights editable and removable by the operator, with a provenance state rather than just a value.
- Structured accessibility attributes, with `not_stated` as a distinct value from `does_not_cater`.
- Containment relationship between products and places.
- Structured recurrence for events, replacing the display string.

---

## 10. Trust

`gap` on every type. Sourced from a mix of third-party review platforms, ATDW's own accreditation and ownership attributes, and one field already defined elsewhere in this contract — see the per-field `source` marker below.

```json
"trust": {
  "aggregate_rating": "number | null (out of 5)",
  "review_count": "number | null",
  "review_excerpts": [{ "author": "string", "text": "string", "source": "string", "date": "date | null" }],
  "review_source": "string | null",
  "review_licence": "string | null",
  "accreditations": ["string"],
  "aboriginal_owned": "boolean | null",
  "awards": [{ "name": "string", "year": "number", "awarding_body": "string" }]
}
```

**`aggregate_rating`** — `gap`, `source: third_party`. Comes from a review aggregator (Google, TripAdvisor), not ATDW.

**`review_count`** — `gap`, `source: third_party`. Same feed as `aggregate_rating`.

**`review_excerpts`** — `gap`, `source: third_party`. Same feed; licensing terms constrain reuse, which is what the next two fields are for.

**`review_source`**, **`review_licence`** — `gap`, `source: third_party`. Metadata about the third-party feed itself: which platform, under what display terms.

**`accreditations`** — `gap`, `source: atdw_existing`. ATDW carries accreditation/quality-framework attributes on the listing already — flag for confirmation, see §8 item 6.

**`aboriginal_owned`** — `gap`, `source: atdw_existing`. ATDW's schema carries an Indigenous-owned/operated business attribute — flag for confirmation, see §8 item 6.

**`awards`** — `gap`, `source: atdw_proposed`. No structured awards field exists in ATDW today; this would be a new ask.

**`last_verified` is not a new field.** The Trust module renders the base record's `last_verified` (§1, already `derived` from the ATDW sync timestamp per §7) directly — it does not get its own property here.

---

## 11. Getting there

`gap` on every type. Logistics for actually reaching the product, not the product's own address.

```json
"getting_there": {
  "nearest_transport": [{ "mode": "string", "name": "string", "walking_minutes": "number | null" }],
  "parking": { "available": "boolean", "cost": "string | null", "distance_minutes": "number | null" },
  "travel_time_from_cbd_minutes": "number | null",
  "pickup_point": "string | null"
}
```

**`nearest_transport[].mode`**, **`.name`** — `gap`, `source: third_party`. Transport for NSW / GTFS open data, not ATDW.

**`nearest_transport[].walking_minutes`** — `gap`, `source: derived`. Computed from the record's geo plus the transport stop's geo via a routing calculation.

**`parking.available`**, **`.cost`**, **`.distance_minutes`** — `gap`, `source: atdw_proposed`. `parking` here is deliberately broader than `extension.accommodation.parking` (§6) — that field is a hotel's own on-site parking; this one is "how does a visitor get here at all," relevant to every type. New ask.

**`travel_time_from_cbd_minutes`** — `gap`, `source: derived`. Computed via a mapping/directions API on top of geo; the underlying routing data is third-party but the field itself is a computation, matching how `distance_from_cbd` is already classified `derived` in §7.

**`pickup_point`** — `gap`, `source: atdw_proposed`. Mirrors `extension.tour.meeting_point` (§6) for tour products specifically — for a tour record, populate one and treat the other as a read of it rather than authoring both independently; for every other type, `pickup_point` is the only place this information lives.

**`distance_from_cbd_km` is not a new field.** See the existing `distance_from_cbd` row in the Derived fields table (§7).

---

## 12. Live availability

`gap` on every type. `source: third_party` for every field — a real-time booking-engine feed (Rezdy/FareHarbor/TXGB-style), not ATDW's static listing data.

```json
"live_availability": {
  "next_sessions": [{ "datetime": "datetime", "status": "available | few_left | sold_out" }],
  "remaining_capacity": "number | null",
  "sold_out": "boolean | null",
  "booking_partner": "string | null"
}
```

**`next_sessions`**, **`remaining_capacity`**, **`sold_out`** — `gap`, `source: third_party`. Same live feed.

**`booking_partner`** — `gap`, `source: third_party`. Identifies which external booking system the feed above came from.

This is not `availability` (§4) restated. `availability` is the static shape of a schedule — which days it opens, what kind of dates it runs. `live_availability` is a real-time booking-engine feed layered on top — specific sessions with seats left right now. The Lion King's `availability.event_dates` (the one live exception in §4) tells you the season is on; `live_availability.next_sessions` would tell you Tuesday's 7pm show has 12 seats left. Both can be populated on the same record without conflict.

---

## 13. Suitability

`gap` on every type.

```json
"suitability": {
  "suitable_for": ["string"],
  "age_guidance": "string | null",
  "dietary_options": ["string"],
  "languages_offered": ["string"],
  "fitness_level": "easy | moderate | challenging | null",
  "pet_policy": "string | null",
  "group_size": { "min": "number", "max": "number" },
  "weather_dependency": "indoor | outdoor_weather_dependent | all_weather | null"
}
```

**`suitable_for`** — `gap`, `source: atdw_proposed`. Generalises `extension.attraction.suitable_for` (§6) — see the overlap note below.

**`age_guidance`** — `gap`, `source: atdw_proposed`. Generalises `extension.event.age_guidance`.

**`dietary_options`** — `gap`, `source: atdw_proposed`. Generalises `extension.food_and_drink.dietary`.

**`languages_offered`** — `gap`, `source: atdw_proposed`. Generalises `extension.tour.languages`.

**`fitness_level`** — `gap`, `source: atdw_proposed`. Generalises `extension.tour.fitness_level`.

**`pet_policy`** — `gap`, `source: atdw_proposed`. Richer than `extension.accommodation.pets_allowed` — a policy string, not a boolean.

**`group_size`** — `gap`, `source: atdw_proposed`. Generalises `extension.tour.group_size`.

**`weather_dependency`** — `gap`, `source: atdw_proposed`. Genuinely new, no existing analogue.

**Overlap with §6, and why it stays.** Six of these eight fields already have a type-specific analogue somewhere in §6's extension blocks — `suitable_for`/attraction, `age_guidance`/event, `dietary_options`/food_and_drink, `languages_offered`/`fitness_level`/`group_size`/tour. That is not an oversight to resolve by deleting one side. A real product page needs a shared "who is this for" summary that reads the same way across all six types — for cross-type recommendation modules, filtering, and schema.org markup — separately from a type-specific detail block that only a tour page renders (the itinerary card, the meeting point). Suitability is the shared summary; the extension block is the type-specific detail it's summarising. Where both exist for a record, `suitability` should be treated as derived from (or kept in sync with) the extension field, not authored twice independently — but the two fields are not the same field wearing two names, and collapsing them into one would break either the shared cross-type view or the tour-specific itinerary UI.

---

## 14. Practical

`gap` on every type.

```json
"practical": {
  "what_to_bring": ["string"],
  "on_site_facilities": ["string"],
  "best_time_to_visit": "string | null"
}
```

**`what_to_bring`** — `gap`, `source: atdw_proposed`. Generalises `extension.tour.what_to_bring` — same overlap logic as §13.

**`on_site_facilities`** — `gap`, `source: atdw_proposed`. Generalises `extension.attraction.facilities` and `extension.accommodation.facilities` (a three-way overlap, same resolution as §13).

**`best_time_to_visit`** — `gap`, `source: atdw_proposed`. Genuinely new — editorial/operator judgement, no ATDW analogue.

**`advance_booking_required` is not a new field.** The Practical module reads `availability.advance_booking_required` (§4) directly.
