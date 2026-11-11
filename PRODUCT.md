# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two deliverables in one repository, two audiences:

- **End users of the designs:** international and domestic Rugby World Cup 2027 fans, and general visitors to sydney.com and visitnsw.com, planning a trip around fixed events (their team's matches). They arrive with practical questions: how far is it, what can I do between matches, is it open, will I have enough time and money. Many already use AI chatbots.
- **Readers of the work itself:** Destination NSW (DNSW) stakeholders reviewing direction, and a separate UI designer who takes the wireframes into visual design.

## Product Purpose

- **`public/wireframes/`**: static, low-fidelity HTML/CSS/JS wireframes and prototypes of DNSW's live sites (sydney.com, visitnsw.com). Used for a design-consistency audit, to prototype new page templates (event, accommodation, food and drink, attraction, hire, tour) against the product data contract, and to prototype the Rugby World Cup "Plan your 3rd half" trip planner and its phone-sized concepts (`concepts.html`). Success: stakeholders can see and click through how a page or feature behaves, and the UI designer has an unambiguous structure to design on.
- **`src/`**: the "DNSW Design and Research Hub", a React app that presents user journey maps, a customer journey map, a user story map, adaptive-content and gaps dashboards, and a sitemap view, read from a published Google Sheet. It is the CJM and research tool.

The two share no code and are separate deliverables (see CLAUDE.md). Product page code never goes in `src/`.

## Positioning

The trip planner does not generate a whole trip. It places the fan's matches on a timeline, shows the free time around them, and offers options that fit using real DNSW listings, opening hours on those dates and travel times. The fan chooses what goes in. What a generic AI itinerary cannot truthfully copy: real, neutral DNSW listings checked against the fan's actual dates.

## Operating Context

- Host cities in NSW: Sydney and Newcastle. Some of a fan's matches may be outside NSW (for example Perth or Brisbane).
- Fans keep plans outside the site: research shows they rarely use the save function and prefer notes apps, spreadsheets or pen and paper. Plans must be easy to copy, download, print or share, with no account needed.
- Wireframes are reviewed on Vercel preview deployments; the phone prototypes are judged at 390 x 844.
- The planner's name is "Plan your 3rd half" (in rugby, the third half is the social part after the game).

## Capabilities and Constraints

- **Government neutrality:** DNSW is a government agency. No business is favoured, there are no bookings on site, and the sites link out to partners.
- **Wireframe fidelity:** low fidelity, greyscale, plain system font, images and maps as grey placeholder boxes, placeholder names where real ones are not supplied. Themed accent colours per site only where the wireframe system already uses them. Visual design is the UI designer's job, not this repo's.
- **No AI-itinerary feel:** no chat box, no "Generate with AI" button, no sparkle icons, no long generated paragraphs. Everything is a card, a time or a map. The fan can swap, remove or lock any item.
- **Data:** use realistic data when possible. If it is not available, ask before making it up. `docs/product-data-contract.md` is the source of truth for product page fields; `gap` fields render from fixtures with the pink marker, and `unverified` fields are not built against until confirmed (CLAUDE.md).
- **Stack (existing):** `public/wireframes/` is hand-authored static HTML, one shared stylesheet (`shared.css`) and vanilla JS, with no build step. `src/` is React 18, TypeScript, Vite and Tailwind. One Vercel project deploys both.
- **Language:** UK English, no em dashes in copy, AUD for currency, Sydney time.

## Evidence on Hand

- Fixture list for the 44 Rugby World Cup 2027 matches: `public/wireframes/pages/rugby-world-cup.html` (`#rwc-fixtures`), trimmed in `public/wireframes/concepts-fixtures.js`.
- Research finding on saving behaviour (notes apps, spreadsheets, pen and paper): recorded in `public/wireframes/planner-brief.md`.
- Product data contract and its audit of six live product pages: `docs/product-data-contract.md`.
- Journey maps and research content for `src/`: the published Google Sheet read by `src/services/sheets.ts`.
- Absent and not to be fabricated: real stop and listing data for the concepts prototype (placeholders today), opening hours, prices, travel times, testimonials and usage metrics.

## Product Principles

1. Matches are fixed; the free time around them is what the fan plans.
2. Real, neutral listings only, each with a one-line reason it fits (for example "Open Saturday, free, 10 min from the stadium").
3. The fan decides. Nothing is added to a plan without them choosing it.
4. A plan leaves the site easily: copy, print, download or share, no account.
5. Show structure and behaviour plainly so the UI designer and stakeholders can judge them; do not dress wireframes up.
