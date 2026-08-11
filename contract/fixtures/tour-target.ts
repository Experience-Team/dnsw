// ⚠ ILLUSTRATIVE VALUES ONLY — NOT A PROPOSAL, NOT SOURCED DATA ⚠
// Every price, date, duration, URL, phone number and id below is made up
// to show the shape filled in. None of it is a recommendation for what the
// real number should be — if one of these values ends up quoted in a deck
// or a ticket, that's this comment failing, not the number being right.
//
// Target fixtures — tour type: BridgeClimb Sydney (parent), UnderBridge
// Walk (child) and BridgeClimb Summit (child).
//
// Parallels tour.ts. Every field that was null there because it's marked
// `gap` in docs/product-data-contract.md is filled here with a realistic
// value. UnderBridge Walk's and BridgeClimb Summit's `contact`, `socials`,
// `operator_ref` and `place_ref` are set equal to the parent's,
// demonstrating the contract's proposed inheritance defaults (§3: "contact,
// socials, operator_ref, accessibility — inherited, overridable") —
// everywhere else the records still hold genuinely different values, since
// `title`, `overview`, `gallery`, `links` and `availability` are proposed
// as child-only. `accessibility` on both children is carried over unchanged
// from their live fixtures, since that field's real value was already
// confirmed, not a gap. These values are illustrative, not sourced — do not
// treat any URL, phone number, id or date below as real, except where noted
// as carried over from a confirmed live record.

import type { TourProduct } from '../types/product';

export const bridgeClimbSydneyTarget: TourProduct = {
  id: 'bridgeclimb-sydney',
  type: 'tour',
  title: 'BridgeClimb Sydney',
  overview:
    "BridgeClimb Sydney is an iconic Australian experience that takes you on a journey on the nation's most famous and celebrated structure, the Sydney Harbour Bridge.\n\n" +
    "As you ascend to the Summit of the world's largest steel arch, you'll experience breathtaking moments, spectacular 360-degree views, and fascinating facts from expert Bridge Tour Guides into the engineering and cultural history of this world-famous icon, while keeping you safe and secure every step of the way.",

  highlights: {
    items: [
      'Climb to the summit of the iconic Sydney Harbour Bridge',
      'Enjoy 360° views with expert commentary on history and engineering',
      'Safe, guided adventure offering a unique and memorable experience',
    ],
    provenance: 'approved',
    generated_at: '2026-07-15',
  },

  gallery: [
    { url: 'https://images.sydney.com/products/bridgeclimb-sydney/summit.jpg', alt: 'Climbers at the summit of the Sydney Harbour Bridge at sunrise', credit: 'BridgeClimb Sydney' },
    { url: 'https://images.sydney.com/products/bridgeclimb-sydney/group.jpg', alt: 'Climb group ascending the upper arch in matching climb suits', credit: 'BridgeClimb Sydney' },
    { url: 'https://images.sydney.com/products/bridgeclimb-sydney/harbour-view.jpg', alt: 'View across Sydney Harbour and the Opera House from the Bridge', credit: 'BridgeClimb Sydney' },
  ],

  address: {
    line: '3 Cumberland Street',
    suburb: 'The Rocks',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: { lat: -33.8523, lng: 151.2108 },
  },

  contact: { phone: '(02) 8274 7777', email: 'info@bridgeclimb.com' },

  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/BridgeClimbSydney' },
    { platform: 'x', url: 'https://x.com/bridgeclimb' },
    { platform: 'instagram', url: 'https://www.instagram.com/bridgeclimb/' },
  ],

  links: { booking: 'https://www.bridgeclimb.com/book-now', website: 'https://www.bridgeclimb.com/' },

  accessibility: {
    status: 'partial',
    detail:
      'Minimum height and weight requirements apply for all Climb experiences. Guides can discuss individual mobility, health and fitness requirements before booking.',
    features: ['step_free_entry'],
    operator_access_url: 'https://www.bridgeclimb.com/accessibility',
  },

  availability: {
    kind: 'operating_days',
    opening_hours: [],
    special_hours: [],
    operating_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    departure_times: ['07:15', '09:55', '12:35', '15:15', '17:55'],
    duration_minutes: 210,
    seasonal: { from: '', to: '' },
    event_dates: { start: '', end: '' },
    sessions: [],
    recurrence: '',
    min_nights: 0,
    checkin_time: '',
    checkout_time: '',
    advance_booking_required: true,
    typical_duration_minutes: 210,
  },

  pricing: {
    from: 168,
    to: 468,
    currency: 'AUD',
    band: '$$$$',
    is_free: false,
    unit: 'per_person',
    concessions: [{ type: 'child', from: 98 }],
    inclusions: ['All safety equipment', 'Professional Climb Leader', 'Certificate and group photo'],
    exclusions: ['Personal photography during the Climb'],
    cancellation_policy: 'Free rescheduling up to 24 hours before your Climb.',
  },

  faqs: [
    { question: 'What should I wear?', answer: 'BridgeClimb provides a one-piece climb suit; wear comfortable enclosed shoes underneath.' },
    { question: 'Is there a weight or height limit?', answer: 'Yes, minimum and maximum height and weight requirements apply for safety harness fitting — contact BridgeClimb directly to confirm eligibility.' },
  ],

  place_ref: 'sydney-harbour-bridge',
  operator_ref: 'bridgeclimb-sydney-operator',
  parent_ref: null, // this is the parent
  last_verified: '2026-08-01',

  extension: {
    itinerary: [
      { order: 1, title: 'Breathalyser and briefing', description: 'Safety briefing, breathalyser test and climb suit fitting at BridgeClimb Base.', duration_minutes: 45 },
      { order: 2, title: 'Ascend the upper arch', description: 'Guided ascent along the upper arch catwalk to the summit.', duration_minutes: 60 },
      { order: 3, title: 'Summit', description: 'Time at the summit for 360-degree views and photos.', duration_minutes: 20 },
      { order: 4, title: 'Descend', description: 'Guided descent back to BridgeClimb Base.', duration_minutes: 85 },
    ],
    meeting_point: { description: 'BridgeClimb Base, 3 Cumberland Street, The Rocks', geo: { lat: -33.8523, lng: 151.2108 } },
    group_size: { min: 2, max: 14 },
    languages: ['English'],
    fitness_level: 'moderate',
    min_age: 8,
    what_to_bring: ['Comfortable enclosed shoes', 'Photo ID'],
  },
};

export const underBridgeWalkTarget: TourProduct = {
  id: 'underbridge-walk',
  type: 'tour',
  title: 'UnderBridge Walk',
  overview:
    "Weave beneath the Bridge's immense structure before ascending a short section of simple stairs to a lower vantage point on the Bridge, looking up at the awe-inspiring 'cathedral of steel' above you.\n\n" +
    "A 2-hour total experience, with one hour on the Bridge, this experience is designed for curious explorers. You may not reach the Summit, but you'll still uncover a side of the Bridge few ever get to see — one that celebrates its incredible scale, hidden stories, and striking beauty from beneath.",

  // Resolves the contract's own open question ("nothing in the record says
  // whether that was a choice") in favour of treating this as a gap to fill,
  // not a structural omission like an event's highlights.
  highlights: {
    items: [
      'A more accessible way to experience the Bridge, with fewer stairs than a full Climb',
      "See the Bridge's underside engineering up close",
      'Shorter, 2-hour experience suited to curious first-timers',
    ],
    provenance: 'generated',
    generated_at: '2026-07-20',
  },

  gallery: [
    { url: 'https://images.sydney.com/products/underbridge-walk/underside.jpg', alt: "Group looking up at the Bridge's underside steelwork", credit: 'BridgeClimb Sydney' },
    { url: 'https://images.sydney.com/products/underbridge-walk/vantage-point.jpg', alt: 'Lower vantage point platform on the Bridge', credit: 'BridgeClimb Sydney' },
    { url: 'https://images.sydney.com/products/underbridge-walk/guide.jpg', alt: 'Guide pointing out a rivet detail to the group', credit: 'BridgeClimb Sydney' },
  ],

  address: {
    line: '3 Cumberland Street',
    suburb: 'The Rocks',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: { lat: -33.8523, lng: 151.2108 }, // same site as the parent
  },

  // Inherited from the parent per the contract's proposed default.
  contact: { phone: '(02) 8274 7777', email: 'info@bridgeclimb.com' },

  // Inherited from the parent per the contract's proposed default.
  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/BridgeClimbSydney' },
    { platform: 'x', url: 'https://x.com/bridgeclimb' },
    { platform: 'instagram', url: 'https://www.instagram.com/bridgeclimb/' },
  ],

  links: {
    booking: 'https://www.bridgeclimb.com/experiences/underbridge-walk', // confirmed real, carried over from the live fixture
    website: 'https://www.bridgeclimb.com/experiences/underbridge-walk',
  },

  // Confirmed real value from the live fixture — not a gap, so unchanged here.
  accessibility: {
    status: 'does_not_cater',
    detail: 'Does not cater for people with access needs.',
    features: [],
    operator_access_url: null,
  },

  availability: {
    kind: 'operating_days',
    opening_hours: [],
    special_hours: [],
    operating_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    departure_times: ['10:30', '13:30', '16:00'],
    duration_minutes: 120, // matches the confirmed "2-hour total experience" copy
    seasonal: { from: '', to: '' },
    event_dates: { start: '', end: '' },
    sessions: [],
    recurrence: '',
    min_nights: 0,
    checkin_time: '',
    checkout_time: '',
    advance_booking_required: true,
    typical_duration_minutes: 120,
  },

  pricing: {
    from: 98,
    to: 158,
    currency: 'AUD',
    band: '$$$',
    is_free: false,
    unit: 'per_person',
    concessions: [{ type: 'child', from: 68 }],
    inclusions: ['Safety briefing', 'Professional guide'],
    exclusions: [],
    cancellation_policy: 'Free rescheduling up to 24 hours before your Walk.',
  },

  faqs: [
    { question: 'How is this different from a full Climb?', answer: "UnderBridge Walk stays beneath the Bridge's lower vantage point and doesn't reach the Summit, with fewer stairs and a shorter, 2-hour experience." },
    { question: 'What should I wear?', answer: 'Comfortable enclosed walking shoes are recommended; no climb suit is required for this experience.' },
  ],

  place_ref: 'sydney-harbour-bridge', // inherited from the parent
  operator_ref: 'bridgeclimb-sydney-operator', // inherited from the parent
  parent_ref: 'bridgeclimb-sydney', // confirmed real relationship, carried over from the live fixture
  last_verified: '2026-08-01',

  extension: {
    itinerary: [
      { order: 1, title: 'Briefing', description: 'Safety briefing and equipment fitting at BridgeClimb Base.', duration_minutes: 20 },
      { order: 2, title: 'Underside walk', description: "Guided walk beneath the Bridge's arch structure.", duration_minutes: 40 },
      { order: 3, title: 'Lower vantage point', description: 'Ascend a short staircase to a lower vantage point on the Bridge.', duration_minutes: 40 },
      { order: 4, title: 'Return', description: 'Guided return to BridgeClimb Base.', duration_minutes: 20 },
    ],
    meeting_point: { description: 'BridgeClimb Base, 3 Cumberland Street, The Rocks', geo: { lat: -33.8523, lng: 151.2108 } },
    group_size: { min: 2, max: 20 },
    languages: ['English'],
    fitness_level: 'easy',
    min_age: 6,
    what_to_bring: ['Comfortable enclosed shoes'],
  },
};

export const bridgeClimbSummitTarget: TourProduct = {
  id: 'bridgeclimb-summit',
  type: 'tour',
  title: 'BridgeClimb Summit',
  overview:
    "Experience the breath taking 360-degree panoramic views of Sydney, whilst scaling the iconic Sydney Harbour Bridge on BridgeClimb's original Climb experience. Feel on top of the world as you journey along the upper arch to the peak of an Australian icon, soaking in the stories from your expert Climb Leader and the sights of the Harbour and the City skyline that surround you.",

  highlights: {
    items: [
      "Climb BridgeClimb's original route to the very top of the Bridge",
      'Sweeping 360° views across the Harbour, Opera House and city skyline',
      'Expert Climb Leader commentary throughout the ascent',
    ],
    provenance: 'generated',
    generated_at: '2026-07-20',
  },

  gallery: [
    { url: 'https://images.sydney.com/products/bridgeclimb-summit/arch.jpg', alt: 'Climbers on the upper arch of the Sydney Harbour Bridge', credit: 'BridgeClimb Sydney' },
    { url: 'https://images.sydney.com/products/bridgeclimb-summit/summit-group.jpg', alt: 'Climb group posing at the Summit', credit: 'BridgeClimb Sydney' },
    { url: 'https://images.sydney.com/products/bridgeclimb-summit/skyline.jpg', alt: 'City skyline view from the top of the Bridge', credit: 'BridgeClimb Sydney' },
  ],

  address: {
    line: '3 Cumberland Street',
    suburb: 'The Rocks',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: { lat: -33.8523, lng: 151.2108 }, // same site as the parent
  },

  // Inherited from the parent per the contract's proposed default.
  contact: { phone: '(02) 8274 7777', email: 'info@bridgeclimb.com' },

  // Inherited from the parent per the contract's proposed default.
  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/BridgeClimbSydney' },
    { platform: 'x', url: 'https://x.com/bridgeclimb' },
    { platform: 'instagram', url: 'https://www.instagram.com/bridgeclimb/' },
  ],

  links: {
    booking: 'https://www.bridgeclimb.com/climbs-prices/summit', // confirmed real, carried over from the live fixture
    website: 'https://www.bridgeclimb.com/climbs-prices/summit',
  },

  // Confirmed real value from the live fixture — not a gap, so unchanged here.
  accessibility: {
    status: 'partial',
    detail: 'Disabled access available, contact operator for details.',
    features: [],
    operator_access_url: null,
  },

  availability: {
    kind: 'operating_days',
    opening_hours: [],
    special_hours: [],
    operating_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    departure_times: ['07:15', '09:55', '12:35', '15:15', '17:55'],
    duration_minutes: 210,
    seasonal: { from: '', to: '' },
    event_dates: { start: '', end: '' },
    sessions: [],
    recurrence: '',
    min_nights: 0,
    checkin_time: '',
    checkout_time: '',
    advance_booking_required: true,
    typical_duration_minutes: 210,
  },

  pricing: {
    from: 268,
    to: 468,
    currency: 'AUD',
    band: '$$$$',
    is_free: false,
    unit: 'per_person',
    concessions: [{ type: 'child', from: 178 }],
    inclusions: ['All safety equipment', 'Professional Climb Leader', 'Certificate and group photo'],
    exclusions: ['Personal photography during the Climb'],
    cancellation_policy: 'Free rescheduling up to 24 hours before your Climb.',
  },

  faqs: [
    { question: 'How is Summit different from other BridgeClimb experiences?', answer: "Summit is BridgeClimb's original route, taking you all the way to the top of the Bridge via the upper arch." },
    { question: 'What should I wear?', answer: 'BridgeClimb provides a one-piece climb suit; wear comfortable enclosed shoes underneath.' },
  ],

  place_ref: 'sydney-harbour-bridge', // inherited from the parent
  operator_ref: 'bridgeclimb-sydney-operator', // inherited from the parent
  parent_ref: 'bridgeclimb-sydney', // confirmed real relationship, carried over from the live fixture
  last_verified: '2026-08-01',

  extension: {
    itinerary: [
      { order: 1, title: 'Breathalyser and briefing', description: 'Safety briefing, breathalyser test and climb suit fitting at BridgeClimb Base.', duration_minutes: 45 },
      { order: 2, title: 'Ascend the upper arch', description: 'Guided ascent along the upper arch catwalk to the summit.', duration_minutes: 60 },
      { order: 3, title: 'Summit', description: 'Time at the summit for 360-degree views and photos.', duration_minutes: 20 },
      { order: 4, title: 'Descend', description: 'Guided descent back to BridgeClimb Base.', duration_minutes: 85 },
    ],
    meeting_point: { description: 'BridgeClimb Base, 3 Cumberland Street, The Rocks', geo: { lat: -33.8523, lng: 151.2108 } },
    group_size: { min: 2, max: 14 },
    languages: ['English'],
    fitness_level: 'moderate',
    min_age: 8,
    what_to_bring: ['Comfortable enclosed shoes', 'Photo ID'],
  },
};

export const tourFixturesTarget: TourProduct[] = [bridgeClimbSydneyTarget, underBridgeWalkTarget, bridgeClimbSummitTarget];
