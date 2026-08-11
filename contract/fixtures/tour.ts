// Live fixtures — tour type: BridgeClimb Sydney (parent), UnderBridge Walk
// (child) and BridgeClimb Summit (child).
//
// UnderBridge Walk and BridgeClimb Summit sources: full saved-HTML exports
// of the real sydney.com pages, parsed directly. BridgeClimb Sydney source:
// a Figma screenshot of the real parent operator page (an HTML export was
// supplied alongside it but turned out to be for the "BridgeClimb Summit"
// child page instead — that export is now used for its own record below,
// not for the parent) — see the inline notes for exactly what the
// screenshot did and didn't confirm.
//
// Only fields marked `live` in docs/product-data-contract.md are populated.
// Every field marked `gap` is null, not filled with a plausible guess.

import type { TourProduct } from '../types/product';

export const bridgeClimbSydneyLive: TourProduct = {
  id: 'bridgeclimb-sydney',
  type: 'tour',
  title: 'BridgeClimb Sydney',
  overview:
    "BridgeClimb Sydney is an iconic Australian experience that takes you on a journey on the nation's most famous and celebrated structure, the Sydney Harbour Bridge.\n\n" +
    // The second paragraph is reproduced only up to the point the screenshot
    // itself was truncated. The wireframe build earlier completed this
    // sentence as a placeholder — that completion is not reused here.
    "As you ascend to the Summit of the world's largest steel arch, you'll experience breathtaking moments, spectacular 360-degree views, and fascinating facts from expert Bridge Tour Guides into the engineering and cultural history of this world-famous icon, while keeping you safe and…",

  highlights: {
    items: [
      'Climb to the summit of the iconic Sydney Harbour Bridge',
      'Enjoy 360° views with expert commentary on history and engineering',
      'Safe, guided adventure offering a unique and memorable experience',
    ],
    provenance: 'generated',
    generated_at: null,
  },

  // The screenshot confirms "6 photos" but carries no real asset URLs.
  gallery: [],

  address: {
    line: '3 Cumberland Street',
    suburb: 'The Rocks',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: null,
  },

  // Never confirmed. The wireframe build used a placeholder phone number
  // here — flagged as unverified in the components library at the time —
  // and that placeholder is not carried into this fixture.
  contact: { phone: null, email: null },

  // Facebook, X and Instagram icons are visible in the screenshot, but no
  // destination URL was ever captured for any of them.
  socials: [],

  // Both "Booking details" and "Visit website" buttons are visible on the
  // real page; neither URL was captured.
  links: { booking: null, website: null },

  // Never confirmed for the parent record specifically — distinct from
  // UnderBridge Walk's own accessibility answer below, since contact and
  // accessibility do not inherit from parent to child today.
  accessibility: { status: 'not_stated', features: [], detail: null, operator_access_url: null },

  availability: null,
  pricing: null,

  // The real page has no FAQ section at all (confirmed absent, not just
  // empty of questions).
  faqs: [],

  place_ref: null,
  operator_ref: null,
  parent_ref: null, // this is the parent
  last_verified: null,

  extension: null,
};

export const underBridgeWalkLive: TourProduct = {
  id: 'underbridge-walk',
  type: 'tour',
  title: 'UnderBridge Walk',
  overview:
    "Weave beneath the Bridge's immense structure before ascending a short section of simple stairs to a lower vantage point on the Bridge, looking up at the awe-inspiring 'cathedral of steel' above you.\n\n" +
    "A 2-hour total experience, with one hour on the Bridge, this experience is designed for curious explorers. You may not reach the Summit, but you'll still uncover a side of the Bridge few ever get to see — one that celebrates its incredible scale, hidden stories, and striking beauty from beneath.",

  // Confirmed absent — the real page has no Highlights section at all,
  // matching the contract's own note about this exact record.
  highlights: null,

  // The export confirms "3 photos" but carries no real asset URLs.
  gallery: [],

  // The child page authors its own address copy (labelled "Physical
  // Address") rather than inheriting the parent's — same real street
  // address, but populated here as this record's own live value.
  address: {
    line: '3 Cumberland Street',
    suburb: 'The Rocks',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: null,
  },

  // Confirmed empty: the child's sidebar shows no phone or email at all,
  // despite being the same business at the same address as its parent —
  // exactly the non-inheritance gap the contract calls out.
  contact: { phone: null, email: null },

  // Confirmed empty: no social icons appear on the child's sidebar.
  socials: [],

  links: {
    // Confirmed real destination, decoded from the page's ATDW booking
    // redirect link.
    booking: 'https://www.bridgeclimb.com/experiences/underbridge-walk',
    // Confirmed absent — only "Booking details" appears on this page, no
    // separate "Visit website" link.
    website: null,
  },

  accessibility: {
    status: 'does_not_cater',
    detail: 'Does not cater for people with access needs.',
    features: [],
    operator_access_url: null,
  },

  availability: null,
  pricing: null,
  faqs: [],

  place_ref: null,
  operator_ref: null,
  // Confirmed live for tours: this child's breadcrumb and the parent's
  // reciprocal "Our Tours" listing both settle the relationship.
  parent_ref: 'bridgeclimb-sydney',
  last_verified: null,

  extension: null,
};

export const bridgeClimbSummitLive: TourProduct = {
  id: 'bridgeclimb-summit',
  type: 'tour',
  title: 'BridgeClimb Summit',
  overview:
    "Experience the breath taking 360-degree panoramic views of Sydney, whilst scaling the iconic Sydney Harbour Bridge on BridgeClimb's original Climb experience. Feel on top of the world as you journey along the upper arch to the peak of an Australian icon, soaking in the stories from your expert Climb Leader and the sights of the Harbour and the City skyline that surround you.",

  // Confirmed absent — the real page has no Highlights section at all,
  // same as UnderBridge Walk.
  highlights: null,

  // The export confirms "8 photos" but carries no real asset URLs.
  gallery: [],

  // The child page authors its own address copy (labelled "Physical
  // Address") rather than inheriting the parent's — same real street
  // address, but populated here as this record's own live value.
  address: {
    line: '3 Cumberland Street',
    suburb: 'The Rocks',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: null,
  },

  // Confirmed empty — the "Get in touch" modal on this page has no phone
  // or email content, despite the modal itself being present.
  contact: { phone: null, email: null },

  // Confirmed empty: no social icons appear on this page.
  socials: [],

  links: {
    // Decoded from the page's ATDW booking redirect.
    booking: 'https://www.bridgeclimb.com/climbs-prices/summit',
    // Confirmed absent — only "Booking details" appears on this page, no
    // separate "Visit website" link, same pattern as UnderBridge Walk.
    website: null,
  },

  accessibility: {
    // "Disabled access available, contact operator for details" doesn't
    // actively welcome or flatly decline — `partial` fits better than
    // `welcomes` here.
    status: 'partial',
    detail: 'Disabled access available, contact operator for details.',
    features: [],
    operator_access_url: null,
  },

  availability: null,
  pricing: null,

  // Confirmed absent — the "FAQs" tab on this page contains only the
  // accessibility content above, no Q&A pairs.
  faqs: [],

  place_ref: null,
  operator_ref: null,
  // Confirmed live: this child's breadcrumb reads "BridgeClimb Sydney >
  // BridgeClimb Summit", and its own URL sits under
  // .../tours/bridgeclimb-sydney/bridgeclimb-summit.
  parent_ref: 'bridgeclimb-sydney',
  last_verified: null,

  extension: null,
};

export const tourFixturesLive: TourProduct[] = [bridgeClimbSydneyLive, underBridgeWalkLive, bridgeClimbSummitLive];
