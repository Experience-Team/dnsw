// ⚠ ILLUSTRATIVE VALUES ONLY — NOT A PROPOSAL, NOT SOURCED DATA ⚠
// Every price, date, duration, URL, phone number and id below is made up
// to show the shape filled in. None of it is a recommendation for what the
// real number should be — if one of these values ends up quoted in a deck
// or a ticket, that's this comment failing, not the number being right.
//
// Target fixture — Royal Botanic Garden and the Domain (attraction).
//
// Parallels attraction.ts. Every field that was null there because it's
// marked `gap` in docs/product-data-contract.md is filled here with a
// realistic value. `extension` stays null even here — the real page carries
// no attraction-specific field, so there is nothing to illustrate for
// AttractionExtension without inventing a field the contract doesn't
// support. It stays `_confirmed: false` in the contract; this fixture
// doesn't change that.

import type { AttractionProduct } from '../types/product';

export const royalBotanicGardenTarget: AttractionProduct = {
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
    provenance: 'approved',
    generated_at: '2026-07-15',
  },

  gallery: [
    { url: 'https://images.sydney.com/products/royal-botanic-garden-and-the-domain/harbour-view.jpg', alt: 'View across the gardens toward Sydney Harbour', credit: 'Royal Botanic Garden Sydney' },
    { url: 'https://images.sydney.com/products/royal-botanic-garden-and-the-domain/rose-garden.jpg', alt: 'The Rose Garden in full bloom', credit: 'Royal Botanic Garden Sydney' },
    { url: 'https://images.sydney.com/products/royal-botanic-garden-and-the-domain/palm-grove.jpg', alt: 'Palm Grove walking path', credit: 'Royal Botanic Garden Sydney' },
  ],

  address: {
    line: 'Mrs Macquaries Road',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: { lat: -33.8642, lng: 151.2166 },
  },

  contact: { phone: '(02) 9231 8111', email: 'info@rbgsyd.nsw.gov.au' },

  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/BotanicSydney/' },
    { platform: 'x', url: 'https://x.com/BotanicSydney' },
    { platform: 'instagram', url: 'https://www.instagram.com/botanicsydney/' },
  ],

  links: { booking: null, website: 'https://www.botanicgardens.org.au/' },

  accessibility: {
    status: 'welcomes',
    detail:
      'Actively welcomes people with access needs. Caters for people who use a wheelchair. Has an accessible public toilet. Has wheelchair accessible parking. Has step free access to restaurant, lounge and bar. Has step free outdoor pathways. Has wheelchair accessible transport options available nearby.',
    features: [],
    operator_access_url: 'https://www.botanicgardens.org.au/royal-botanic-garden-sydney/plan-your-visit/accessibility',
  },

  availability: {
    kind: 'opening_hours',
    opening_hours: [
      { day: 'mon', opens: '07:00', closes: '18:00' },
      { day: 'tue', opens: '07:00', closes: '18:00' },
      { day: 'wed', opens: '07:00', closes: '18:00' },
      { day: 'thu', opens: '07:00', closes: '18:00' },
      { day: 'fri', opens: '07:00', closes: '18:00' },
      { day: 'sat', opens: '07:00', closes: '18:00' },
      { day: 'sun', opens: '07:00', closes: '18:00' },
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
    typical_duration_minutes: 90,
  },

  pricing: {
    from: 0,
    to: null,
    currency: 'AUD',
    band: '$',
    is_free: true,
    unit: 'per_person',
    concessions: [],
    inclusions: [],
    exclusions: [],
    cancellation_policy: null, // not applicable — free general admission, nothing to cancel
  },

  faqs: [
    { question: 'Is entry to the Garden free?', answer: 'Yes, general entry is free. Some guided tours and special events may have a charge.' },
    { question: 'Are dogs allowed?', answer: 'Only assistance animals are permitted within the Garden.' },
  ],

  place_ref: 'sydney-city',
  operator_ref: 'royal-botanic-garden-sydney', // Botanic Gardens of Sydney, the operating trust
  parent_ref: null,
  last_verified: '2026-08-01',

  extension: null,
};
