// ⚠ ILLUSTRATIVE VALUES ONLY — NOT A PROPOSAL, NOT SOURCED DATA ⚠
// Every price, date, duration, URL, phone number and id below is made up
// to show the shape filled in. None of it is a recommendation for what the
// real number should be — if one of these values ends up quoted in a deck
// or a ticket, that's this comment failing, not the number being right.
//
// Target fixture — Sydney Harbour Kayaks - Middle Harbour (Mosman) (hire).
//
// Parallels hire.ts. Every field that was null there because it's marked
// `gap` in docs/product-data-contract.md is filled here with a realistic
// value, including `extension` — populated with illustrative HireExtension
// values, marked `source: atdw_proposed` in the contract doc (§6).
// `_confirmed: false` stays unchanged in contract/types/product.ts: that
// flag records whether a real field extraction validated the block, which
// it did not, and that stays accurate regardless of this fixture. The
// `source` marker is what prevents misrepresentation here, not `_confirmed`.
// `pricing.from` below is an illustrative figure, not the real rate — do
// not treat it as sourced, even though the real page happens to advertise
// an hourly rate elsewhere; this fixture was built from the confirmed
// field list only, which had no pricing on it.

import type { HireProduct } from '../types/product';

export const sydneyHarbourKayaksTarget: HireProduct = {
  id: 'sydney-harbour-kayaks-middle-harbour-mosman',
  type: 'hire',
  title: 'Sydney Harbour Kayaks - Middle Harbour (Mosman)',
  overview:
    'Discover Sydney Harbour at your own pace with Sydney Harbour Kayaks, proudly inducted into the NSW Tourism Hall of Fame.\n\n' +
    "Located at The Spit Bridge in Mosman, their rental centre provides direct access to the spectacular waterways of Middle Harbour, one of Sydney's most beautiful paddling destinations. Explore secluded beaches, sandstone cliffs, tranquil bays and pristine bushland, all just minutes from the city.\n\n" +
    "Choose from one of Australia's largest fleets of premium single and double sea kayaks and surf skis, featuring leading brands including Mirage Sea Kayaks, Fenn and Carbonology. Whether you're looking for a short paddle, a full-day adventure or a take-away rental for a race, holiday or expedition, they have the perfect craft for your next adventure.\n\n" +
    'Paddling is always better with friends, and their range of stable double sea kayaks makes it easy to share the experience. Explore together, discover hidden corners of the harbour and create lasting memories on the water.\n\n' +
    'Rentals are available from one hour through to full-day hire, with stable beginner-friendly kayaks through to high-performance surf skis for experienced paddlers.\n\n' +
    'For those new to the sport, they also offer free introductory kayaking and safety courses, helping you build confidence and develop the skills needed to enjoy the water safely.\n\n' +
    "Get out on the water, explore more and discover why Middle Harbour is Sydney's ultimate paddling playground.",

  highlights: {
    items: [
      'Wide range of premium kayaks and surf skis from top brands',
      'Flexible hire options, including off-the-beach and take-away rentals',
      'Free kayaking courses to boost confidence and safety on the water',
    ],
    provenance: 'approved',
    generated_at: '2026-07-15',
  },

  gallery: [
    { url: 'https://images.sydney.com/products/sydney-harbour-kayaks-middle-harbour-mosman/spit-bridge.jpg', alt: 'Kayaks lined up on the beach near The Spit Bridge', credit: 'Sydney Harbour Kayaks' },
    { url: 'https://images.sydney.com/products/sydney-harbour-kayaks-middle-harbour-mosman/double-kayak.jpg', alt: 'Two paddlers in a double sea kayak on Middle Harbour', credit: 'Sydney Harbour Kayaks' },
    { url: 'https://images.sydney.com/products/sydney-harbour-kayaks-middle-harbour-mosman/bushland.jpg', alt: 'Kayaker passing sandstone cliffs and bushland', credit: 'Sydney Harbour Kayaks' },
  ],

  address: {
    line: '81 Parriwi Road, Smiths Boat Shed',
    suburb: 'Mosman',
    state: 'NSW',
    postcode: '2088',
    country: 'Australia',
    geo: { lat: -33.8062, lng: 151.2481 },
  },

  contact: { phone: '0408 997 704', email: 'info@sydneyharbourkayaks.com.au' },

  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/seakayaking/' },
    { platform: 'x', url: 'https://x.com/Syd_Harb_Kayaks' },
    { platform: 'instagram', url: 'https://www.instagram.com/kayaksydney' },
  ],

  links: {
    booking: 'https://www.sydneyharbourkayaks.com.au/rentals',
    website: 'http://www.sydneyharbourkayaks.com.au/',
  },

  accessibility: {
    status: 'welcomes',
    detail:
      'Actively welcomes people with access needs. Caters for people who are blind or have vision loss. Caters for people who are deaf or have hearing loss. Offers multiple options for booking - web, email, phone.',
    features: [],
    operator_access_url: null,
  },

  availability: {
    kind: 'opening_hours',
    opening_hours: [
      { day: 'mon', opens: '09:00', closes: '17:00' },
      { day: 'tue', opens: '09:00', closes: '17:00' },
      { day: 'wed', opens: '09:00', closes: '17:00' },
      { day: 'thu', opens: '09:00', closes: '17:00' },
      { day: 'fri', opens: '09:00', closes: '17:00' },
      { day: 'sat', opens: '08:00', closes: '18:00' },
      { day: 'sun', opens: '08:00', closes: '18:00' },
    ],
    special_hours: [],
    operating_days: [],
    departure_times: [],
    duration_minutes: 0,
    seasonal: { from: '', to: '' },
    event_dates: { start: '', end: '' },
    sessions: [],
    recurrence: '',
    min_nights: 0,
    checkin_time: '',
    checkout_time: '',
    advance_booking_required: false,
    // Not applicable — hire duration is chosen per booking (1 hour to full
    // day), not fixed like a tour's runtime.
    typical_duration_minutes: 0,
  },

  pricing: {
    from: 45,
    to: 120,
    currency: 'AUD',
    band: '$$',
    is_free: false,
    unit: 'per_hour',
    concessions: [],
    inclusions: ['Safety briefing', 'Life jacket', 'Waterproof storage bag'],
    exclusions: [],
    cancellation_policy: 'Free cancellation up to 24 hours before your booking.',
  },

  trust: {
    aggregate_rating: 4.9,
    review_count: 1870,
    review_excerpts: [
      { author: 'Ryan C.', text: 'Middle Harbour is stunning by kayak — quiet bays, great gear.', source: 'TripAdvisor', date: '2026-07-01' },
      { author: 'Nina D.', text: 'Free intro course made this approachable for total beginners.', source: 'Google', date: '2026-06-18' },
    ],
    review_source: 'TripAdvisor',
    review_licence: 'Displayed under TripAdvisor Content API terms',
    accreditations: [],
    aboriginal_owned: false,
    awards: [{ name: 'NSW Tourism Hall of Fame', year: 2021, awarding_body: 'NSW Tourism Awards' }],
  },

  getting_there: {
    nearest_transport: [
      { mode: 'bus', name: 'The Spit Junction, Route 178', walking_minutes: 5 },
    ],
    parking: { available: true, cost: 'Free 2-hour street parking near The Spit', distance_minutes: 2 },
    travel_time_from_cbd_minutes: 25,
    pickup_point: null,
  },

  live_availability: {
    next_sessions: [],
    remaining_capacity: 8, // kayaks remaining for the next available hour
    sold_out: false,
    booking_partner: 'Rezdy',
  },

  suitability: {
    suitable_for: ['couples', 'solo', 'groups', 'families'],
    age_guidance: 'Suitable for ages 8+, adult supervision required for minors',
    dietary_options: [],
    languages_offered: ['English'],
    fitness_level: 'moderate',
    pet_policy: 'Not permitted on hired craft',
    group_size: { min: 1, max: 10 },
    weather_dependency: 'outdoor_weather_dependent',
  },

  practical: {
    what_to_bring: ['Sun protection', 'A change of clothes and swimwear', 'Water bottle'],
    on_site_facilities: ['Changing area', 'Equipment storage', 'Retail shop'],
    best_time_to_visit: 'Weekday mornings for calmer water and shorter waits',
  },

  faqs: [
    { question: 'Do I need kayaking experience?', answer: 'No, stable beginner-friendly kayaks are available and a free introductory course is offered.' },
    { question: 'What should I bring?', answer: 'Sun protection, a change of clothes and swimwear. Life jackets and safety equipment are provided.' },
  ],

  place_ref: 'mosman',
  operator_ref: 'sydney-harbour-kayaks',
  parent_ref: null,
  last_verified: '2026-08-01',

  extension: {
    _confirmed: false,
    items: [
      { name: 'Single sea kayak', from: 45, unit: 'per_hour' },
      { name: 'Double sea kayak', from: 65, unit: 'per_hour' },
      { name: 'Surf ski', from: 55, unit: 'per_hour' },
    ],
    hire_periods: ['1 hour', 'Half day', 'Full day'],
    requirements: ['Ability to swim', 'Signed liability waiver'],
    min_age: 8,
    min_height_cm: 120,
    deposit_required: true,
    equipment_included: ['Life jacket', 'Paddle', 'Waterproof storage bag'],
  },
};
