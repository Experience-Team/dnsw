// Live fixture — Royal Botanic Garden and the Domain (attraction).
//
// Source: full saved-HTML export of the real sydney.com page, parsed
// directly for this fixture. Only fields marked `live` in
// docs/product-data-contract.md are populated; every field marked `gap`
// is null, not filled with a plausible guess.
//
// extension stays null: the page carries no attraction-specific field
// (no admission tier, no facility list, no suitability tag) — everything
// present maps to the shared record, accessibility, or links blocks.
// AttractionExtension is still `_confirmed: false` in the contract; this
// record doesn't change that, it just confirms the block has nothing to
// confirm for this page.

import type { AttractionProduct } from '../types/product';

export const royalBotanicGardenLive: AttractionProduct = {
  id: 'royal-botanic-garden-and-the-domain',
  type: 'attraction',
  title: 'Royal Botanic Garden and the Domain',
  overview:
    'Welcome to the Royal Botanic Garden Sydney, an oasis of 30-hectares in the heart of the city.\n\n' +
    "Wrapped around Sydney Harbour and adjacent to the Sydney Opera House, the gardens occupy one of Sydney's most spectacular positions. It is one of Sydney's most beautiful and alluring destinations, where everyone is welcome to come and enjoy the abundant natural beauty.\n\n" +
    'Established in 1816, it is the oldest scientific institution in the country and is home to an outstanding collection of plants from Australia and overseas.\n\n' +
    'From the provocative rare and threatened plants of the world to the romantic rose garden, the themed garden areas show the diverse beauty of nature.\n\n' +
    "Special features include Cadi Jam Ora: First Encounters, a garden display that remembers and acknowledges the Cadigal - the original inhabitants of Sydney's city centre - and their relationship with this land.\n\n" +
    'The Royal Botanic Garden offers a number of tour experiences, including the Aboriginal Heritage Tour, a free guided walk and bespoke heritage tours. Online bookings are essential.\n\n' +
    'Free Wi-Fi is available throughout the Royal Botanic Garden Sydney. Download the free app for self-guided audio walking tours, garden maps and information on the latest events.',

  highlights: {
    items: [
      'Stunning harbourfront location beside the Sydney Opera House',
      'Explore themed gardens and rare global plant collections',
      'Join unique Aboriginal Heritage and guided walking tours',
    ],
    provenance: 'generated',
    generated_at: null,
  },

  // The page confirms "6 photos" but every image alt attribute is empty —
  // no captions or credits are authored, so no real asset data to carry over.
  gallery: [],

  address: {
    line: 'Mrs Macquaries Road',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: null,
  },

  contact: { phone: '(02) 9231 8111', email: null },

  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/BotanicSydney/' },
    { platform: 'x', url: 'https://x.com/BotanicSydney' },
    { platform: 'instagram', url: 'https://www.instagram.com/botanicsydney/' },
  ],

  links: {
    booking: null,
    website: 'https://www.botanicgardens.org.au/',
  },

  accessibility: {
    status: 'welcomes',
    detail:
      'Actively welcomes people with access needs. Caters for people who use a wheelchair. Has an accessible public toilet. Has wheelchair accessible parking. Has step free access to restaurant, lounge and bar. Has step free outdoor pathways. Has wheelchair accessible transport options available nearby.',
    // No structured feature list exists today — the source is one free-text field.
    features: [],
    operator_access_url: 'https://www.botanicgardens.org.au/royal-botanic-garden-sydney/plan-your-visit/accessibility',
  },

  venue_facilities: null,
  availability: null,
  pricing: null,
  trust: null,
  getting_there: null,
  live_availability: null,
  suitability: null,
  practical: null,

  // Confirmed absent — the "FAQs" tab on the real page contains only the
  // accessibility statement above, no Q&A pairs.
  deals: [],
  faqs: [],

  place_ref: null,
  operator_ref: null,
  parent_ref: null,
  last_verified: null,

  extension: null,
};
