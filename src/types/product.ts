// Types derived from docs/product-data-contract.md (v0.1, 11 August 2026).
// Do not add fields here that are not in the contract — if a field is needed
// that the contract doesn't describe, the contract needs updating first.

// ── Shared sub-shapes ─────────────────────────────────────────────────────────

export type HighlightsProvenance = 'generated' | 'edited' | 'removed' | 'approved';

export interface Highlights {
  items: string[];
  provenance: HighlightsProvenance;
  generated_at: string; // date
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
  geo: GeoCoordinates;
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
  highlights: Highlights;
  gallery: GalleryImage[];
  address: Address;
  contact: Contact;
  socials: SocialLink[];
  links: ProductLinks;
  accessibility: Accessibility;
  availability: Availability;
  pricing: Pricing;
  faqs: Faq[];
  place_ref: string | null;
  operator_ref: string | null;
  parent_ref: string | null;
  last_verified: string; // date
}

export interface TourProduct extends ProductRecordBase {
  type: 'tour';
  extension: TourExtension;
}

export interface FoodAndDrinkProduct extends ProductRecordBase {
  type: 'food_and_drink';
  extension: FoodAndDrinkExtension;
}

export interface EventProduct extends ProductRecordBase {
  type: 'event';
  extension: EventExtension;
}

export interface AttractionProduct extends ProductRecordBase {
  type: 'attraction';
  extension: AttractionExtension;
}

export interface HireProduct extends ProductRecordBase {
  type: 'hire';
  extension: HireExtension;
}

export interface AccommodationProduct extends ProductRecordBase {
  type: 'accommodation';
  extension: AccommodationExtension;
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
