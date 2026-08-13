// Live fixture — Disney's The Lion King (event).
//
// Source: full saved-HTML export of the real sydney.com page, parsed
// directly for this fixture (a prior session had only a Figma screenshot
// and pasted overview text — the fields that were null because of that gap
// are now filled from the confirmed export; see inline notes for what
// changed).
//
// Only fields marked `live` in docs/product-data-contract.md are populated.
// Every field marked `gap` is null, not filled with a plausible guess.

import type { EventProduct } from '../types/product';

export const lionKingLive: EventProduct = {
  id: 'disneys-the-lion-king',
  type: 'event',
  title: "Disney's The Lion King",
  overview:
    "Disney's The Lion King is is now playing at the Capitol Theatre!\n\n" +
    'Prepare for a spectacle far beyond your imagination as you follow the powerful story of Simba as he journeys from wide-eyed cub to his destined role as King of the Pridelands.\n\n' +
    "Seen by over 124 million people worldwide, this landmark musical combines breathtaking visual artistry, unforgettable music, and a deeply moving story that has captured hearts across generations.\n\n" +
    'Winner of six Tony Awards® including Best Musical, this is a spectacular theatrical experience you will never forget.',

  // `highlights` is absent on events per the contract ("Absent on events only").
  highlights: null,

  // No real image URLs were ever captured — the wireframe only recorded a
  // "5 photos" count against gray placeholders.
  gallery: [],

  address: {
    // The real page shows the venue name "Capitol Theatre" ahead of the
    // street address. The contract's shared record has no field for a venue
    // name today (see §3, place_ref — a nullable `venue` object is proposed
    // but not confirmed). Not invented here; line holds the street address only.
    line: '13 Campbell St',
    suburb: 'Haymarket',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: null,
  },

  // Confirmed empty — the export's "Get in touch" panel carries no phone
  // or email for this record.
  contact: { phone: null, email: null },

  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/thelionkingAU/' },
    { platform: 'instagram', url: 'https://www.instagram.com/thelionkingau/' },
  ],

  links: {
    // Decoded from the page's ATDW booking redirect.
    booking: 'https://www.ticketmaster.com.au/disney-presents-the-lion-king-australia-tickets/artist/21441',
    // Confirmed real destination — the page's own "Visit website" button
    // points at this Ticketmaster affiliate link, not a plain ticketmaster.com.au
    // URL, so that's what's captured here rather than unwrapped further.
    website: 'https://ticketmaster.evyy.net/c/2023802/1965672/24024?subId1=sydney&subId2=lionking&u=https%3A%2F%2Fwww.ticketmaster.com.au%2Fdisney-presents-the-lion-king-australia-tickets%2Fartist%2F21441',
  },

  accessibility: {
    status: 'welcomes',
    detail: 'Actively welcomes people with access needs.',
    features: [],
    operator_access_url: null,
  },

  // The real page confirms a start date, end date and a "DAILY event"
  // display string — no performance time or structured RRULE, so `kind`
  // is `event_dates` and `recurrence` stays empty rather than guessing a
  // schedule the page doesn't state. See contract §4.
  venue_facilities: null,
  availability: {
    kind: 'event_dates',
    opening_hours: [],
    special_hours: [],
    operating_days: [],
    departure_times: [],
    duration_minutes: 0,
    seasonal: { from: '', to: '' },
    event_dates: { start: '2026-08-11', end: '2026-10-04' },
    sessions: [],
    recurrence: '',
    min_nights: 0,
    checkin_time: '',
    checkout_time: '',
    advance_booking_required: false,
    typical_duration_minutes: 0,
  },

  // Gap on every type (contract §5).
  pricing: null,

  trust: null,
  getting_there: null,
  live_availability: null,
  suitability: null,
  practical: null,

  // Every audited page's FAQ block holds no actual questions — accessibility
  // occupies the slot instead. Confirmed empty, not unknown.
  deals: [],
  faqs: [],

  place_ref: null,
  operator_ref: null,
  parent_ref: null,
  last_verified: null,

  // Empty for every type today (contract §6).
  extension: null,
};
