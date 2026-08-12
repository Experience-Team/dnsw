// ⚠ ILLUSTRATIVE VALUES ONLY — NOT A PROPOSAL, NOT SOURCED DATA ⚠
// Every price, date, duration, URL, phone number and id below is made up
// to show the shape filled in. None of it is a recommendation for what the
// real number should be — if one of these values ends up quoted in a deck
// or a ticket, that's this comment failing, not the number being right.
//
// Target fixture — InterContinental Sydney (accommodation).
//
// Parallels accommodation.ts. Every field that was null there because it's
// marked `gap` in docs/product-data-contract.md is filled here with a
// realistic value. These values are illustrative, not sourced — do not
// treat any URL, price, id or date below as real, except where noted as
// carried over from the confirmed live record (e.g. `total_capacity.rooms`).

import type { AccommodationProduct } from '../types/product';

export const interContinentalSydneyTarget: AccommodationProduct = {
  id: 'intercontinental-sydney',
  type: 'accommodation',
  title: 'InterContinental Sydney',
  overview:
    'Welcome the height of luxury, where heritage wonder and contemporary flair collide. Centrally positioned in the heart of Circular Quay, InterContinental Sydney extends breathtaking panoramic views of the Sydney Opera House and Sydney Harbour Bridge.\n\n' +
    "Set within the beautifully restored Treasury Building of 1851, InterContinental Sydney is renowned as one of the city's prized icons with 509 guest rooms including 28 luxury suites, an award-winning and world-class Club InterContinental lounge and vibrant dining venues.\n\n" +
    'With an AUD120 million refurbishment in 2022, the elevating rooms, public spaces, bars and restaurants, provide a new era of luxury.',

  highlights: {
    items: [
      'Stunning views of the Sydney Opera House and Harbour Bridge.',
      'Luxurious rooms and award-winning Club InterContinental lounge.',
      'Centrally located in Circular Quay, close to major attractions.',
    ],
    provenance: 'approved',
    generated_at: '2026-07-15',
  },

  gallery: [
    { url: 'https://images.sydney.com/products/intercontinental-sydney/exterior.jpg', alt: 'InterContinental Sydney Treasury Building exterior', credit: 'InterContinental Hotels Group' },
    { url: 'https://images.sydney.com/products/intercontinental-sydney/lobby.jpg', alt: 'Hotel lobby beneath the heritage sandstone atrium', credit: 'InterContinental Hotels Group' },
    { url: 'https://images.sydney.com/products/intercontinental-sydney/suite.jpg', alt: 'Harbour-view suite bedroom', credit: 'InterContinental Hotels Group' },
    { url: 'https://images.sydney.com/products/intercontinental-sydney/lounge.jpg', alt: 'Club InterContinental lounge', credit: 'InterContinental Hotels Group' },
  ],

  address: {
    line: '117 Macquarie Street',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: { lat: -33.8622, lng: 151.2119 },
  },

  contact: {
    phone: '(02) 9253 9000',
    email: 'intercontinental.sydney@ihg.com',
  },

  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/InterContinentalSydney' },
    { platform: 'instagram', url: 'https://www.instagram.com/intercontinentalsydney/' },
  ],

  links: {
    booking:
      'https://www.ihg.com/intercontinental/hotels/us/en/find-hotels/select-roomrate?fromRedirect=true&qSrt=sBR&qSlH=SYDHA&qRms=1&qAdlt=2&qCiD=21&qCiMy=052021&qCoD=24&qCoMy=052021&qAAR=IYAPE&qRtP=IYAPE&setPMCookies=true&qSHBrC=IC&qDest=117%20Macquarie%20Street%2c%20Sydney%2c%20NSW%2c%20AU&srb_u=1&qChAge=',
    website: 'https://www.sydney.intercontinental.com/',
  },

  accessibility: {
    status: 'welcomes',
    detail:
      'Actively welcomes people with access needs. Caters for people who use a wheelchair. Caters for people with allergies and intolerances.',
    features: ['wheelchair_access', 'accessible_parking', 'accessible_bathroom', 'step_free_entry'],
    operator_access_url: 'https://www.ihg.com/intercontinental/hotels/us/en/accessibility',
  },

  venue_facilities: ['Concierge desk', 'Business centre', 'Valet parking', 'Lobby lounge'],
  availability: {
    kind: 'stay_dates',
    opening_hours: [],
    special_hours: [],
    operating_days: [],
    departure_times: [],
    duration_minutes: 0,
    seasonal: { from: '', to: '' },
    event_dates: { start: '', end: '' },
    sessions: [],
    recurrence: '',
    min_nights: 1,
    checkin_time: '15:00',
    checkout_time: '11:00',
    advance_booking_required: false,
    typical_duration_minutes: 0,
  },

  pricing: {
    from: 450,
    to: 1200,
    currency: 'AUD',
    band: '$$$$',
    is_free: false,
    unit: 'per_night',
    concessions: [],
    inclusions: ['Complimentary WiFi', 'Access to Club InterContinental lounge (select room types)'],
    exclusions: ['Breakfast (unless selected at booking)'],
    cancellation_policy: 'Free cancellation up to 48 hours before arrival for standard rate bookings.',
  },

  trust: {
    aggregate_rating: 4.6,
    review_count: 5108,
    review_excerpts: [
      { author: 'Grace M.', text: 'The Opera House view from our room was unreal. Faultless service.', source: 'TripAdvisor', date: '2026-07-18' },
      { author: 'David N.', text: 'Historic building, modern comfort. Club lounge breakfast alone is worth the upgrade.', source: 'Google', date: '2026-06-30' },
    ],
    review_source: 'TripAdvisor',
    review_licence: 'Displayed under TripAdvisor Content API terms',
    accreditations: ['AAA Tourism 5 Star (self-declared, pending accreditation check)'],
    aboriginal_owned: false,
    awards: [{ name: 'Best Luxury Hotel — NSW', year: 2025, awarding_body: 'Australian Hotels Association' }],
  },

  getting_there: {
    nearest_transport: [
      { mode: 'train', name: 'Circular Quay Station', walking_minutes: 4 },
      { mode: 'ferry', name: 'Circular Quay Ferry Wharf', walking_minutes: 5 },
    ],
    parking: { available: true, cost: '$65 per night valet', distance_minutes: 0 },
    travel_time_from_cbd_minutes: 3,
    pickup_point: null,
  },

  live_availability: {
    next_sessions: [],
    remaining_capacity: 14, // rooms remaining for the next 30 nights
    sold_out: false,
    booking_partner: 'IHG Direct Booking',
  },

  suitability: {
    suitable_for: ['couples', 'solo', 'groups'],
    age_guidance: null,
    dietary_options: [],
    languages_offered: ['English', 'Mandarin', 'Japanese'],
    fitness_level: null,
    pet_policy: 'Not accepted, except registered assistance animals',
    group_size: null,
    weather_dependency: 'all_weather',
  },

  practical: {
    what_to_bring: ['Photo ID for check-in', 'Credit card for incidentals hold'],
    on_site_facilities: ['Swimming pool', 'Fitness centre', 'Club InterContinental lounge', 'Multiple restaurants and bars'],
    best_time_to_visit: 'Year-round; book Club InterContinental rooms early for Vivid Sydney season',
  },

  faqs: [
    { question: 'What time is check-in and check-out?', answer: 'Check-in is from 3:00pm and check-out is by 11:00am. Early check-in and late check-out may be available on request.' },
    { question: 'Is parking available?', answer: 'Valet parking is available on-site for an additional nightly fee.' },
    { question: 'Are pets allowed?', answer: 'InterContinental Sydney does not accept pets, with the exception of registered assistance animals.' },
  ],

  place_ref: 'treasury-building-sydney',
  operator_ref: 'ihg-hotels-resorts',
  parent_ref: null,
  last_verified: '2026-08-01',

  extension: {
    category: 'hotel',
    star_rating: { value: 5, source: 'self_declared' },
    total_capacity: { rooms: 509, sites: 0, beds: 0 }, // room count is the confirmed live figure from the Overview copy
    room_types_ref: [],
    facilities: ['Swimming pool', 'Fitness centre', 'Club InterContinental lounge', 'Multiple restaurants and bars'],
    in_room_amenities: ['Air conditioning', 'Minibar', 'Smart TV', 'Nespresso machine'],
    self_catering: [],
    bathroom: 'private',
    sites: { powered: 0, unpowered: 0 },
    parking: { available: true, cost: '$65 per night', type: 'Valet' },
    pets_allowed: false,
    smoking_allowed: false,
    children: { cots: true, extra_beds: true, free_under_age: 12 },
    meals_included: [],
    brand: 'InterContinental Hotels & Resorts',
  },
};
