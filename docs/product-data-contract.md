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

In the wireframes, `gap` and `unverified` fields render with a coloured overlay so they read as provisional rather than as finished copy — `gap` in pink, `unverified` in yellow (`.provenance-gap` / `.provenance-unverified` in `shared.css`). `live` fields render with no overlay. `unverified` fields must not be built against until confirmed (see CLAUDE.md) — `accessibility` (§2) and `venue_facilities` (§1) are the two exceptions today, confirmed for build on 12 August 2026: the underlying data already exists in ATDW, it just hasn't been checked for reliability, so it's rendered with the yellow treatment rather than withheld.

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
  "venue_facilities": ["string"] | null,
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

**`venue_facilities`** — `unverified`, `source: atdw_existing`. ATDW already carries facility data for the record, but it hasn't been checked for accuracy, so it's rendered as its own "Venue facilities" FAQ item with the yellow `unverified` treatment rather than either the `live` or `gap` treatment — confirmed for build on 12 August 2026 (see "How to read the markers" above). Distinct from `practical.on_site_facilities` (§14, `atdw_proposed`) — that field is a genuinely new ask with nothing behind it yet; this one already has data, just unconfirmed data.

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

`unverified`, `source: atdw_existing`. The one free-text field is confirmed live (Mother Chu's, above); the structured breakdown proposed here is a reshaping of data ATDW already holds, not new data, but it hasn't been checked for reliability against the wider dataset — confirmed for build on 12 August 2026 with the yellow `unverified` treatment (see "How to read the markers"), not withheld as `gap`.

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
| `distance_to_venue` | geo, plus the geo of the venue the page is about |
| `price_band` | `pricing.from` |
| `open_now` | `availability.opening_hours` |
| `last_verified` | ATDW sync timestamp |
| `directions_url` | geo |
| `appears_in_itineraries` | Drupal itineraries |

**`distance_to_venue`** — `gap`, `source: derived`. How far a product is from a venue the page is about, such as a stadium or fan zone on an event page: "0.6 km from the stadium". Shown on accommodation cards near a venue, where location is usually the deciding factor. Unlike `distance_from_cbd` it depends on context: the same product has a different value on each venue's page, so it is computed at render time, not stored on the record. Straight-line distance from the two geos to start; a walking or transit time (see `getting_there`, §11) can replace it later. Shape:

```json
"distance_to_venue": { "venue_ref": "place_ref", "km": "number", "label": "string" }
```

`label` names the venue type in plain words ("the stadium", "the fan zone"). Added 29 October 2026 for the Rugby World Cup page.

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

**`event_day`** — `gap`, proposed 15 November 2026 for the Rugby World Cup planner (Pick your team prototype), not yet confirmed. Lives on a venue's record (a stadium), not on a product. How to get to and from the venue on an event day, as a route from a start point, for a one-line summary at the top of a match day and a sheet with a schematic route. Renders from placeholder fixtures only (`cnMatchTravel` in `public/wireframes/concepts-fixtures.js`). Empty state: no line and no button on the match day. Shape:

```json
"event_day": {
  "routes": [{
    "from": "string",
    "mode": "string",
    "minutes": "number | null",
    "legs": [{ "mode": "walk | train | bus | light_rail | ferry | event_service", "to": "string", "minutes": "number | null" }]
  }],
  "default_from": "string",
  "extra_services": "string | null",
  "return_note": "string | null",
  "last_service": "string | null",
  "ticket_includes_travel": "boolean | null",
  "accessibility": "string | null"
}
```

`routes[]` and `legs[]`: `source: third_party` (Transport for NSW trip planning) or `derived`. `from` is the start point, the place the person said they are staying, or `default_from` (such as Central) until they say. `extra_services`, `return_note`, `last_service` and `ticket_includes_travel`: `source: third_party`, from the event's transport plan. `accessibility`: `source: atdw_proposed` or the venue. Open questions: who supplies the event transport plan, and whether routes are stored per start point or computed at render time.

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

---

## 15. Deals

`live`, `source: atdw_existing`. Not in the original five-record audit (§ Status and evidence base) — added after that audit from a sixth live record, Ingenia Holidays Sydney Hills (accommodation), which was found to already carry a working "Deals" module (Drupal fields `field_deal_type`, `field_deal_description`, `field_deal_redeem_date`, `field_deal_comment`, `field_deal_terms`) rendering as a tabbed set of offers. Unlike every other field group in this contract, this one is not proposed — it is observed live, already in ATDW, already rendering, on at least one real record. The other five audited records (Lion King, BridgeClimb, Mother Chu's, InterContinental, Royal Botanic Garden) simply don't have any deals attached today — `deals: []` there, not `null`, since the module and the data model both exist for their type.

```json
"deals": [{
  "id": "string",
  "type": "string",
  "label": "string",
  "description": "string",
  "valid_from": "date | null",
  "valid_to": "date | null",
  "comment": "string | null",
  "terms": "string | null",
  "image": { "url": "string", "alt": "string" } | null,
  "link": "string | null"
}]
```

**`type`** — `live`, `source: atdw_existing`. A taxonomy term on the real record (e.g. "Discount") — modelled as a free string here rather than an enum until more deal types are observed across more records.

**`label`**, **`description`** — `live`, `source: atdw_existing`. The deal's headline ("Stay 4 Nights and Save 20%") and its body copy.

**`valid_from`**, **`valid_to`** — `live`, `source: atdw_existing`. A date range field on the real record.

**`comment`** — `live`, `source: atdw_existing`. A short badge/summary distinct from `description` (e.g. "Save 20%" vs. the full sentence) — used as the discount-corner badge on the deal image.

**`terms`** — `live`, `source: atdw_existing`. Full terms and conditions, rendered as a collapsed accordion on the real page, not shown by default.

**`image`** — `live`, `source: atdw_existing`. One image per deal, distinct from the product's own `gallery` (§1).

**`link`** — `live`, `source: atdw_existing`. "Book the deal" CTA — on the real record this routes through an ATDW redirect to the operator's own deals or booking page, not necessarily the same URL as `links.booking` (§1).

---

## 16. Host areas

**`highlights`** — `gap`, `source: authored`, proposed 19 November 2026 for the Rugby World Cup prototype (Home's host city sheets), not yet confirmed. Lives on a venue's record (a stadium), like `event_day` (§11), not on a product. Three or four things worth knowing about the area around the stadium, each a short name and one or two sentences, authored by Destination NSW. Renders from placeholder fixtures only (`cnHostHighlights` in `public/wireframes/concepts-fixtures.js`, copy supplied by the user on 19 Nov and summarised). Empty state: no Highlights heading and no list; the sheet starts at Match day. Shape:

```json
"highlights": [{ "title": "string", "text": "string" }]
```

---

## 17. Match fixtures

Added 20 November 2026 for the Rugby World Cup planner (Pick your team prototype), confirmed by the user as `gap`. A match is an event record of its own, not a product. The prototype renders every field here from placeholder fixtures only (`cnFixtures` and `cnVenueCity` in `public/wireframes/concepts-fixtures.js`). First use: the plan's day labels for matches on one day (two or more of the picked teams' matches at the same kick-off, or in two or more cities).

**`date`** — `gap`, `source: authored`. The day of the match. Empty state: the match is not shown.

**`kick_off`** — `gap`, `source: authored`. Local start time, held as Sydney time in the prototype. Empty state: "Time to be confirmed"; the same-kick-off part of the clash rule skips it.

**`venue`** — `gap`, `referenced`. The stadium. Empty state: the match is not shown.

**`city`** — `gap`, `source: derived`. The city the venue is in (Sydney, Newcastle, Melbourne and so on). Interstate fixtures name it; for NSW stadiums the prototype takes it from the venue (`cnVenueCity`). Empty state: the clash rule falls back to the venue's precinct.

Not held, and not invented: a match's length or end time, and travel times between cities. Without them the plan does not judge whether matches at different kick-offs overlap, or whether there is time to travel between cities on one day.

```json
"match": {
  "date": "date",
  "kick_off": "time",
  "venue": "place_ref",
  "city": "string"
}
```

---

## 18. Kick destinations

Added 21 November 2026 for the Rugby World Cup prototype's Drop goal tab (shown as Play on phones), confirmed by the user as `gap`. A kick destination is a stop on one of the game's routes: a town or area, not a product, referenced as a `place_ref` (§3) once real records exist. Every field renders from placeholder fixtures only (`ROUTES` in `public/wireframes/drop-goal/js/routes.js`: 8 routes of 10 stops, in approximate road-distance order from Sydney or Newcastle). Each route needs all 10 stops, because the landing zones are sized so every stop catches about 1 in 10 kicks (equal exposure).

**`name`** — `gap`, `source: authored`. The place the ball lands in, the card's heading. Empty state: a route with a stop missing its name is not offered, so exposure stays even across the other routes.

**`distance_km`** — `gap`, `source: derived`. Approximate road distance from the start point, shown as "approx. 85 km from Sydney". Empty state: the Distance row is left out.

**`route`** — `gap`, `source: authored`. The route the stop is on and its position, shown as "North coast, stop 4 of 10". Empty state: none, because a stop always belongs to a route; without a route there is no stop.

**`summary`** — `gap`, `source: authored`, from the destination's page on sydney.com or visitnsw.com: its direct answer, 40 to 60 words, written to stand alone (changed from one or two sentences on 22 November 2026, user's call). Empty state: the paragraph is left out. Since 22 November 2026 every stop has one, from sydney-towns-aeo.xlsx (the town pages read that day; `SUMMARIES` in `public/wireframes/drop-goal/js/summaries.js`). An editor's note in the source (Brooklyn's "Sydney.com has no dedicated Brooklyn page") is left out. As a government site names no business ahead of others, business names are trimmed from a summary (for example Brooklyn's tour operators, Watsons Bay's Doyle's, Pokolbin's wineries, Katoomba's Scenic World; 22 November 2026, user's call; landmarks such as the Big Banana, the stadium's name and public bodies such as Taronga Zoo stay), keeping what they offer; the edits are listed in `public/wireframes/tools/gen-destinations.py` (`TRIM`).

**`image`** — `gap`, `source: authored`, the destination page's hero image, with usage rights to check. Empty state: the drawn placeholder illustration the game shows today.

Not held: the card's tags (Day trip, Short trip, Road trip, Near the stadium) and its notes ("Over the bar!", "Short kick!", and since 22 Nov "Off the upright!", "Caught the breeze!" and "Exploring"). Nor is which stops someone has seen: that is per-visit state in the browser (sessionStorage), used to show a new stop each kick, not data. The re-routing evens exposure out across a visit and does not rank stops. The game works these out from the stop's position and the kick, so they are game copy, not data.

```json
"kick_destination": {
  "name": "string",
  "place": "place_ref",
  "distance_km": "number | null",
  "route": { "start": "sydney | newcastle", "label": "string", "position": "number" },
  "summary": "string | null",
  "image": "image | null"
}
```

---

## 19. Destinations

Added 22 November 2026 for the Rugby World Cup planner (Pick your team prototype), confirmed by the user as `gap`. A destination is a town, suburb, precinct or area with a page on sydney.com or visitnsw.com, not a product: the same kind of place as a kick destination (§18), and referenced as a `place_ref` (§3) once real records exist. The prototype's free-day ideas (half days and day trips) are destinations. Every field renders from fixtures only (`cnDestinations` in `public/wireframes/concepts-destinations.js`, generated from sydney-towns-aeo.xlsx, the town pages read on 22 November 2026). Venue names and notices on those pages change, so recheck them against the live pages before use.

**`name`** — `gap`, `source: authored`. The place, the card's and the details' heading. An idea can be named for what to do there (Manly ferry, Bondi to Coogee walk) and still take its fields from the place. Empty state: the idea is not offered.

**`summary`** — `gap`, `source: authored`. The page's direct answer, 40 to 60 words, as for §18. Business names are trimmed as for §18. Shown as the idea's description. Empty state: the bracketed description placeholder (shown with Annotations on only).

**`travel_time`** — `gap`, `source: authored`. How far it is from the idea's city, in the page's own words ("12 minutes by ferry from Circular Quay"). The pages give times from Sydney, so most Newcastle ideas have none. Empty state: "Getting there to be confirmed".

**`getting_there`** — `gap`, `source: authored`. The page's Getting there text, shown in the details under the travel time. Not used for a Newcastle idea when the page only says how to come from Sydney. Empty state: the line is left out.

**`official_url`** — `gap`, `source: authored`. The page it came from. Held, not shown yet.

Not held, and not invented: opening hours and price (a town has neither, so those rows are left out for a destination; an attraction idea such as Sydney Opera House keeps them as placeholders), and coordinates. The map places each idea at an approximate public town centre (`cnGeo.ideas` in `public/wireframes/concepts-geo.js`), prototype only. Who an idea suits (solo, couple, friends, family), used only to order ideas, is read from the page's Best for list where it names families, couples or groups; where it names none, the idea suits everyone.

Added 24 November 2026 for Version 2's Drop goal result card (`docs/drop-goal-brief.md`), confirmed by the user as `gap`. Drop goal's places are destinations too (precincts, areas and standalone attractions, never a business), held in `public/wireframes/v2/drop-goal/places.js` (fixtures only). The card also uses:

**`tags`** — `gap`, `source: authored`. Up to three short category labels (for example Food, Culture, Western Sydney), shown as chips on the card and in See the places. Empty state: the chips are left out.

**`host_city`** — `gap`, `source: derived` (the host city nearer the place: `sydney` or `newcastle`). Used to choose which places a person sees after a goal, from where their team plays. Empty state: the place is shown only in the mixed set (no team picked).

**`image`** — `gap`, `source: authored`, the destination page's hero image, with usage rights to check. Never a picture of a named business. Empty state: a drawn placeholder with the place's name.

**`travel_from_ground`** — `gap`, `source: derived`. An estimate of the time from the nearest host ground, always shown as an estimate ("About 10 min by car from Newcastle Stadium (estimate)"). Empty state: "Travel time to be confirmed".

Not held: the card's FITS line (which match day the place fits around). The game works it out from the match fixtures (§17) and the person's picked team, so it is game copy, not data. The short description is `summary`; where a place has none yet, the card shows a sample line marked as sample.

```json
"destination": {
  "name": "string",
  "place": "place_ref",
  "summary": "string | null",
  "travel_time": "string | null",
  "getting_there": "string | null",
  "official_url": "string | null",
  "tags": ["string"],
  "host_city": "sydney | newcastle | null",
  "image": "image | null",
  "travel_from_ground": "string | null"
}
```

---

## 20. Watch parties

Added 24 November 2026 for Version 2's Drop goal (the January brief), confirmed by the user as `gap`. A watch party is a public screening of one match at a precinct, public venue or fan site in NSW, never an individual business. For a team with no match in NSW, a goal in Drop goal lands on one of that team's watch parties, shown on the same card as a destination (§19). No real watch party data exists: the prototype renders every field here from invented fixtures only (`public/wireframes/v2/drop-goal/watch-parties.js`), all marked as sample.

The card's fields mirror a destination's, so the same card can show either:

**`name`** — `gap`, `source: authored`. The card's heading. Empty state: the watch party is not offered.

**`summary`** — `gap`, `source: authored`. One or two sentences on what it is. Empty state: the line is left out.

**`tags`** — `gap`, `source: authored`. Up to three short labels, as for §19. Empty state: the chips are left out.

**`image`** — `gap`, `source: authored`, with usage rights to check. Never a picture of a named business. Empty state: a drawn placeholder with the watch party's name.

**`host_city`** — `gap`, `source: derived` (`sydney` or `newcastle`, the host city it is in or nearer). Groups watch parties in a list. Empty state: listed without a city.

Two fields are new:

**`match`** — `gap`, `referenced`. The match being screened, a match fixture (§17). Shown on the card's FITS row as the fixture's date and teams ("Sat 16 Oct: England v Wales"). Empty state: the watch party is not offered, as it cannot be tied to a team.

**`location`** — `gap`, `source: authored`. Where it is, in plain words ("Darling Harbour, Sydney"). Shown on the card's TRAVEL row. Empty state: "Location to be confirmed".

Not held, and not invented: which team a watch party is for (worked out from the teams in its `match`), opening and closing times, capacity, entry price or booking, and accessibility. The line under the card that the later rounds are in NSW is game copy, not data.

Known gap, not solved: a watch party is tied to one match, so its card goes stale once that match has passed. A real build needs a rule for what a goal lands on after a team's last screened match (the next match's watch party, or a fallback).

```json
"watch_party": {
  "name": "string",
  "summary": "string | null",
  "tags": ["string"],
  "image": "image | null",
  "host_city": "sydney | newcastle | null",
  "match": "match_ref",
  "location": "string | null"
}
```
