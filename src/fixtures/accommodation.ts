// Live fixture — InterContinental Sydney (accommodation).
//
// Source: full saved-HTML export of the real sydney.com page, parsed
// directly for this fixture (breadcrumb, Overview, Highlights, contact
// links, social links, FAQ). Only fields marked `live` in
// docs/product-data-contract.md are populated; every field marked `gap`
// is null, not filled with a plausible guess.

import type { AccommodationProduct } from '../types/product';

export const interContinentalSydneyLive: AccommodationProduct = {
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
    // The mechanism is confirmed (AI-generated, no visible provenance today);
    // the actual generation date was never surfaced by the export.
    provenance: 'generated',
    generated_at: null,
  },

  // The export confirms "10 photos" but carries no real asset URLs.
  gallery: [],

  address: {
    line: '117 Macquarie Street',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: null,
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
    // No structured feature list exists today — the source is one free-text field.
    features: [],
    operator_access_url: null,
  },

  availability: null,
  pricing: null,
  faqs: [],

  place_ref: null,
  operator_ref: null,
  parent_ref: null,
  last_verified: null,

  extension: null,
};
