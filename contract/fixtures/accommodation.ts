// Live fixture — Ingenia Holidays Sydney Hills (accommodation).
//
// Source: full saved-HTML export of the real sydney.com page, parsed
// directly for this fixture (breadcrumb, Overview, Highlights, contact
// links, social links, FAQ, Deals). Only fields marked `live` in
// docs/product-data-contract.md are populated; every field marked `gap`
// is null, not filled with a plausible guess. `deals` (contract §15) is
// the one exception to the usual accommodation-record shape: it's `live`
// here, not `gap` — this record is where that field group was first
// observed.

import type { AccommodationProduct } from '../types/product';

export const ingeniaHolidaysSydneyHillsLive: AccommodationProduct = {
  id: 'ingenia-holidays-sydney-hills',
  type: 'accommodation',
  title: 'Ingenia Holidays Sydney Hills',
  overview:
    'Escape from the city or take a break during the road trip at Ingenia Holidays Sydney Hills! Located only 30 kilometres north-west of Sydney in the suburb of Dural, Ingenia Holidays Sydney Hills offers a range of accommodation, from camping and caravanning sites to cottages or cabins, suited to every guest.\n\n' +
    'Ingenia Holidays Sydney Hills is the perfect option if you are going to a concert at Sydney Olympic Park, with major event buses running directly between Ingenia Sydney Hills to Olympic Park - there is even a bus stop directly at the front of the park, where you can catch a bus to Sydney City.\n\n' +
    'Relax on the landscaped grounds and enjoy the tennis court, swimming pools and BBQ or camp kitchen, or go exploring and walk the trails of the Blue Mountains or picnic along the Hawkesbury River. Keen golfers can also head to the local driving range, walking distance from the park.\n\n' +
    'Book your next stay at Ingenia Holidays Sydney Hills!',

  highlights: {
    items: [
      'Conveniently located 30km from Sydney, ideal for city escapes.',
      'Enjoy on-site amenities like pools, tennis courts, and BBQ facilities.',
      'Easy access to Sydney Olympic Park events with direct bus services.',
    ],
    // The mechanism is confirmed (AI-generated, no visible provenance today);
    // the actual generation date was never surfaced by the export.
    provenance: 'generated',
    generated_at: null,
  },

  // The export confirms "7 photos" but carries no real asset URLs worth
  // treating as stable (they're signed, expiring ATDW CDN URLs).
  gallery: [],

  address: {
    line: '269 New Line Road',
    suburb: 'Dural',
    state: 'NSW',
    postcode: '2158',
    country: 'Australia',
    geo: { lat: -33.699547, lng: 151.027894 },
  },

  contact: {
    phone: '(02) 9651 2555',
    email: 'sydneyhills@ingeniaholidays.com.au',
  },

  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/ingeniaholidays' },
    { platform: 'x', url: 'https://x.com/ingeniaholidays' },
    { platform: 'instagram', url: 'https://www.instagram.com/ingeniaholidays/' },
  ],

  links: {
    booking: 'https://www.ingeniaholidays.com.au/our-parks/new-south-wales/western-sydney/sydney-hills/?utm_source=refferal&utm_medium=atdw&utm_term=park-listing',
    website: 'https://www.ingeniaholidays.com.au/our-parks/new-south-wales/western-sydney/sydney-hills/?utm_source=refferal&utm_medium=atdw&utm_term=park-listing',
  },

  accessibility: {
    status: 'welcomes',
    detail:
      'Actively welcomes people with access needs. Caters for people with sufficient mobility to climb a few steps but who would benefit from fixtures to aid balance (this includes people using walking frames and mobility aids). Offer multiple options for booking - web, email, phone.',
    // No structured feature list exists today — the source is free-text FAQ copy.
    features: [],
    operator_access_url: null,
  },

  venue_facilities: null,
  availability: null,
  pricing: null,
  trust: null,
  getting_there: null,
  live_availability: null,
  suitability: null,
  practical: null,

  // Live — contract §15. All three deals and their terms are copied
  // verbatim from the real page's Drupal field export.
  deals: [
    {
      id: 'DE0044599',
      type: 'Discount',
      label: 'Stay 4 Nights and Save 20%',
      description: 'Save 20% on your booking when you stay 4 nights!',
      valid_from: '2026-03-27',
      valid_to: '2026-11-30',
      comment: 'Save 20%',
      terms:
        'A first night deposit is required at booking. You may cancel or amend until 2pm the day before arrival for a full refund; after this, the deposit is retained. No-shows are cancelled without refund. The reservation name must match the payment card, which must be presented at check in. No refunds or credits apply once your stay begins.',
      image: null,
      link: 'https://www.ingeniaholidays.com.au/deals',
    },
    {
      id: 'DE0044600',
      type: 'Discount',
      label: 'Early Bird',
      description:
        'The early bird catches the best deals! Receive up to 15% off* the cost of your entire stay at any of the Ingenia Holiday Parks when you make your booking in advance.',
      valid_from: '2026-03-27',
      valid_to: '2026-11-30',
      comment: 'Up to 15% off',
      terms:
        'Full payment is required at booking and is non-refundable. Bookings cannot be changed or cancelled. No-shows are cancelled without refund or credit. This offer cannot be combined with other discounts. The reservation name must match the payment card, and the cardholder must be present at check-in. No refunds for unused nights. Subject to availability and conditions.',
      image: null,
      link: 'https://www.ingeniaholidays.com.au/deals',
    },
    {
      id: 'DE0044601',
      type: 'Discount',
      label: 'Midweek Special',
      description: 'Enjoy a midweek getaway and save 15% when you stay two nights or more.',
      valid_from: '2026-03-27',
      valid_to: '2026-09-24',
      comment: 'Save 15%',
      terms:
        'A first night deposit is required at booking. Cancel or amend by 2pm the day before arrival for a full refund; after this, the deposit is retained. No-shows are cancelled without refund or credit. The reservation name must match the payment card, which must be shown at check-in. No refunds for unused nights. Blackout dates may apply.',
      image: null,
      link: 'https://www.ingeniaholidays.com.au/our-parks/new-south-wales/ingenia-holidays-sydney-hills',
    },
  ],

  faqs: [],

  place_ref: null,
  operator_ref: null,
  parent_ref: null,
  last_verified: null,

  extension: null,
};
