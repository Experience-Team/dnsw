// Types derived from docs/product-data-contract.md (v0.1, 11 August 2026).
// Do not add fields here that are not in the contract — if a field is needed
// that the contract doesn't describe, the contract needs updating first.
//
// A `| null` on a field does not carry one fixed meaning — it can mean the
// field is a gap (no record has real data for it yet, e.g. `pricing`), that
// it's genuinely optional (e.g. `links.booking`, confirmed absent on some
// live records), or that it doesn't apply to this record's type at all
// (e.g. `parent_ref` on a non-tour). The type system doesn't encode which —
// check docs/product-data-contract.md for the field in question rather than
// assuming from the type alone.

// ── Shared sub-shapes ─────────────────────────────────────────────────────────

export type HighlightsProvenance = 'generated' | 'edited' | 'removed' | 'approved';

export interface Highlights {
  items: string[];
  provenance: HighlightsProvenance;
  generated_at: string | null; // date; unknown for every record extracted so far
}

export interface GalleryImage {
  url: string;
  alt: string;
  credit: string;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface Address {
  line: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  geo: GeoCoordinates | null; // no records extracted so far carry real coordinates
}

export interface Contact {
  phone: string | null;
  email: string | null;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'x' | 'tiktok' | 'youtube';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface ProductLinks {
  booking: string | null;
  website: string | null;
}

export interface Faq {
  question: string;
  answer: string;
}

// ── Accessibility (contract §2, proposed shape) ───────────────────────────────
// `not_stated` is a distinct value from `does_not_cater` — a negative answer
// and an unfilled field must not render identically.

export type AccessibilityStatus = 'welcomes' | 'partial' | 'does_not_cater' | 'not_stated';

export type AccessibilityFeature =
  | 'wheelchair_access'
  | 'accessible_parking'
  | 'hearing_loop'
  | 'assistance_animals_welcome'
  | 'accessible_bathroom'
  | 'step_free_entry'
  | 'companion_card_accepted';

export interface Accessibility {
  status: AccessibilityStatus;
  features: AccessibilityFeature[];
  detail: string | null;
  operator_access_url: string | null;
}

// ── Availability (contract §4) — gap on every type ────────────────────────────

export type AvailabilityKind = 'opening_hours' | 'operating_days' | 'event_dates' | 'stay_dates';

export interface OpeningHoursEntry {
  day: string;
  opens: string; // time
  closes: string; // time
}

export interface SpecialHoursEntry {
  date: string; // date
  opens: string | null; // time
  closes: string | null; // time
}

export interface SeasonalRange {
  from: string; // date
  to: string; // date
}

export interface EventDateRange {
  start: string; // date
  end: string; // date
}

export type SessionStatus = 'available' | 'sold_out';

export interface Session {
  datetime: string; // datetime
  status: SessionStatus;
}

export interface Availability {
  kind: AvailabilityKind;

  opening_hours: OpeningHoursEntry[];
  special_hours: SpecialHoursEntry[];

  operating_days: string[];
  departure_times: string[]; // time
  duration_minutes: number;
  seasonal: SeasonalRange;

  event_dates: EventDateRange;
  sessions: Session[];
  recurrence: string; // structured RRULE, not a display string

  min_nights: number;
  checkin_time: string; // time
  checkout_time: string; // time

  advance_booking_required: boolean;
  typical_duration_minutes: number;
}

// ── Pricing (contract §5) — gap on every type ─────────────────────────────────

export type PricingUnit = 'per_person' | 'per_night' | 'per_group' | 'per_hour' | 'per_ticket';

export type PriceBand = '$' | '$$' | '$$$' | '$$$$';

export type ConcessionType = 'child' | 'senior' | 'family' | 'student';

export interface Concession {
  type: ConcessionType;
  from: number;
}

export interface Pricing {
  from: number | null;
  to: number | null;
  currency: 'AUD';
  band: PriceBand; // derived from `from`
  is_free: boolean;
  unit: PricingUnit;
  concessions: Concession[];
  inclusions: string[];
  exclusions: string[];
  cancellation_policy: string | null;
}

// ── Extension blocks (contract §6) ────────────────────────────────────────────
// Empty for every type today. Attraction and hire are inferred from the page
// audit rather than extracted records — `_confirmed: false` marks that.

export interface ItineraryItem {
  order: number;
  title: string;
  description: string;
  duration_minutes: number;
}

export interface MeetingPoint {
  description: string;
  geo: GeoCoordinates;
}

export type FitnessLevel = 'easy' | 'moderate' | 'challenging';

export interface TourExtension {
  itinerary: ItineraryItem[];
  meeting_point: MeetingPoint;
  group_size: { min: number; max: number };
  languages: string[];
  fitness_level: FitnessLevel;
  min_age: number;
  what_to_bring: string[];
}

export type MealService = 'breakfast' | 'lunch' | 'dinner';
export type DietaryOption = 'vegetarian' | 'vegan' | 'gluten_free' | 'halal' | 'kosher';

export interface FoodAndDrinkExtension {
  cuisine: string[];
  meal_services: MealService[];
  dietary: DietaryOption[];
  menu_url: string | null;
  dress_code: string | null;
  bookings_required: boolean;
  licensed: boolean;
}

export interface TicketType {
  name: string;
  from: number;
  description: string;
}

export type EventSeating = 'reserved' | 'general_admission' | 'standing';

export interface EventExtension {
  ticket_types: TicketType[];
  seating: EventSeating;
  runtime_minutes: number;
  interval: boolean;
  age_guidance: string;
  performer: string[];
  producer: string;
}

export type AttractionSuitability = 'families' | 'couples' | 'solo' | 'groups' | 'school_groups';
export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both';

/** Inferred from the page audit, not extracted records. Confirm against real field lists before treating as settled — contract §8, item 3. */
export interface AttractionExtension {
  _confirmed: false;
  facilities: string[];
  typical_visit_minutes: number;
  suitable_for: AttractionSuitability[];
  indoor_outdoor: IndoorOutdoor;
  free_entry: boolean;
}

export interface HireItem {
  name: string;
  from: number;
  unit: 'per_hour' | 'per_day';
}

/** Inferred from the page audit, not extracted records. Confirm against real field lists before treating as settled — contract §8, item 3. */
export interface HireExtension {
  _confirmed: false;
  items: HireItem[];
  hire_periods: string[];
  requirements: string[];
  min_age: number;
  min_height_cm: number;
  deposit_required: boolean;
  equipment_included: string[];
}

export type AccommodationCategory =
  | 'hotel'
  | 'motel'
  | 'bnb'
  | 'hostel'
  | 'holiday_park'
  | 'apartment'
  | 'caravan_camping'
  | 'farmstay';

export type StarRatingSource = 'accredited' | 'self_declared';
export type SelfCateringFeature = 'kitchen' | 'kitchenette' | 'laundry' | 'bbq';
export type BathroomType = 'private' | 'shared' | 'both';

export interface AccommodationExtension {
  category: AccommodationCategory;
  star_rating: { value: number; source: StarRatingSource };
  total_capacity: { rooms: number; sites: number; beds: number };
  room_types_ref: string[]; // child product ids
  facilities: string[];
  in_room_amenities: string[];
  self_catering: SelfCateringFeature[];
  bathroom: BathroomType;
  sites: { powered: number; unpowered: number };
  parking: { available: boolean; cost: string | null; type: string };
  pets_allowed: boolean;
  smoking_allowed: boolean;
  children: { cots: boolean; extra_beds: boolean; free_under_age: number };
  meals_included: string[]; // e.g. 'breakfast'
  brand: string | null;
}

// ── Trust (contract §10) — gap on every type ──────────────────────────────────
// `last_verified` is deliberately not a field here — the Trust module reads
// the base record's `last_verified` (contract §1/§7) directly rather than
// duplicating it.

export interface ReviewExcerpt {
  author: string;
  text: string;
  source: string; // e.g. 'Google', 'TripAdvisor'
  date: string | null; // date
}

export interface Award {
  name: string;
  year: number;
  awarding_body: string;
}

export interface Trust {
  aggregate_rating: number | null; // out of 5
  review_count: number | null;
  review_excerpts: ReviewExcerpt[];
  review_source: string | null;
  review_licence: string | null;
  accreditations: string[];
  aboriginal_owned: boolean | null;
  awards: Award[];
}

// ── Getting there (contract §11) — gap on every type ──────────────────────────
// `distance_from_cbd_km` is deliberately not a field here — see the existing
// `distance_from_cbd` row in the Derived fields table (contract §7).

export interface NearestTransport {
  mode: string;
  name: string;
  walking_minutes: number | null;
}

export interface GettingThereParking {
  available: boolean;
  cost: string | null;
  distance_minutes: number | null;
}

export interface GettingThere {
  nearest_transport: NearestTransport[];
  parking: GettingThereParking | null;
  travel_time_from_cbd_minutes: number | null;
  pickup_point: string | null;
}

// ── Live availability (contract §12) — gap on every type ──────────────────────
// Distinct from `availability` (contract §4): that's the static schedule
// shape, this is a real-time booking-engine feed layered on top.

export type LiveSessionStatus = 'available' | 'few_left' | 'sold_out';

export interface LiveSession {
  datetime: string; // datetime
  status: LiveSessionStatus;
}

export interface LiveAvailability {
  next_sessions: LiveSession[];
  remaining_capacity: number | null;
  sold_out: boolean | null;
  booking_partner: string | null;
}

// ── Suitability (contract §13) — gap on every type ────────────────────────────
// Overlaps deliberately with several extension-block fields (§6) — a shared
// cross-type summary, not a duplicate. See §13.

export interface Suitability {
  suitable_for: string[];
  age_guidance: string | null;
  dietary_options: string[];
  languages_offered: string[];
  fitness_level: FitnessLevel | null; // reuses FitnessLevel from §6
  pet_policy: string | null;
  group_size: { min: number; max: number } | null;
  weather_dependency: 'indoor' | 'outdoor_weather_dependent' | 'all_weather' | null;
}

// ── Practical (contract §14) — gap on every type ──────────────────────────────
// `advance_booking_required` is deliberately not a field here — read
// `availability.advance_booking_required` (contract §4) directly.

export interface Practical {
  what_to_bring: string[];
  on_site_facilities: string[];
  best_time_to_visit: string | null;
}

// ── Shared product record (contract §1) ───────────────────────────────────────

export type ProductType =
  | 'tour'
  | 'food_and_drink'
  | 'event'
  | 'attraction'
  | 'hire'
  | 'accommodation';

interface ProductRecordBase {
  id: string;
  title: string;
  overview: string; // rich text
  highlights: Highlights | null; // absent on events; gap in practice for any record not yet generated
  gallery: GalleryImage[];
  address: Address;
  contact: Contact;
  socials: SocialLink[];
  links: ProductLinks;
  accessibility: Accessibility;
  venue_facilities: string[] | null; // unverified — atdw_existing data, not yet checked for reliability, contract §1
  availability: Availability | null; // gap on every type — contract §4
  pricing: Pricing | null; // gap on every type — contract §5
  trust: Trust | null; // gap on every type — contract §10
  getting_there: GettingThere | null; // gap on every type — contract §11
  live_availability: LiveAvailability | null; // gap on every type — contract §12, distinct from `availability` (§4)
  suitability: Suitability | null; // gap on every type — contract §13
  practical: Practical | null; // gap on every type — contract §14
  faqs: Faq[];
  place_ref: string | null;
  operator_ref: string | null;
  parent_ref: string | null;
  last_verified: string | null; // date; gap — no ATDW sync timestamp surfaces today
}

export interface TourProduct extends ProductRecordBase {
  type: 'tour';
  extension: TourExtension | null; // empty for every type today — contract §6
}

export interface FoodAndDrinkProduct extends ProductRecordBase {
  type: 'food_and_drink';
  extension: FoodAndDrinkExtension | null;
}

export interface EventProduct extends ProductRecordBase {
  type: 'event';
  extension: EventExtension | null;
}

export interface AttractionProduct extends ProductRecordBase {
  type: 'attraction';
  extension: AttractionExtension | null;
}

export interface HireProduct extends ProductRecordBase {
  type: 'hire';
  extension: HireExtension | null;
}

export interface AccommodationProduct extends ProductRecordBase {
  type: 'accommodation';
  extension: AccommodationExtension | null;
}

/**
 * Discriminated union on `type` — narrowing on `product.type` also narrows
 * `product.extension` to the matching extension block.
 */
export type ProductRecord =
  | TourProduct
  | FoodAndDrinkProduct
  | EventProduct
  | AttractionProduct
  | HireProduct
  | AccommodationProduct;
