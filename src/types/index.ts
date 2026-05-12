// ── Site / filter ─────────────────────────────────────────────────────────────
export type Site = 'visitnsw' | 'sydney';
export type CjmSite = Site | 'both';
export type SiteFilter = 'visitnsw' | 'sydney' | 'both';

// ── Personas ──────────────────────────────────────────────────────────────────
export interface Persona {
  persona_id: string;
  site: Site;
  name: string;
  segment: string;
  description: string;
  goals: string;
  frustrations: string;
  tech_comfort: string;
  planning_horizon: string;
  travel_party: string;
  budget_range: string;
  source_evidence: string;
}

// ── Journey Stages ────────────────────────────────────────────────────────────
export interface JourneyStage {
  stage_id: string;
  stage_name: string;
  stage_order: number;
  description: string;
}

// ── CJM grid entries ──────────────────────────────────────────────────────────
export type CjmRowType = 'Pain Point' | 'Delight' | 'Touchpoint' | 'Device' | 'Opportunity';

export interface CjmEntry {
  stage_id: string;
  row_type: CjmRowType;
  site: CjmSite;
  segment: string;
  content: string;
}

// ── USM grid entries ──────────────────────────────────────────────────────────
export type SupportRating = 'owned' | 'partial' | 'gap';

export interface UsmEntry {
  stage:             string;
  stage_description: string;
  activity:          string;
  site:              CjmSite;
  segment:           string;
  step:              string;
  support_rating:    SupportRating;
  support_rationale: string;
}

// ── UJM grid entries ──────────────────────────────────────────────────────────
export type UjmRowType =
  | 'Goals'
  | 'Actions'
  | 'Mindset'
  | 'Touchpoints'
  | 'Pain Points'
  | 'Delights'
  | 'Opportunities';

export type UjmLayer =
  | 'universal'
  | 'day-out'
  | 'weekend-away'
  | 'road-trip'
  | 'intl-multi-stop';

export type UjmDevice = 'desktop' | 'mobile' | 'both';

export interface UjmEntry {
  stage:             string;
  stage_description: string;
  row_type:          UjmRowType;
  layer:             UjmLayer;
  segment:           string;
  content:           string;
  device:            UjmDevice | '';
  image_url:         string;
}

// ── Adaptive Content ──────────────────────────────────────────────────────────
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface AdaptiveContent {
  content_type:     string;
  site:             CjmSite;
  segment:          string;
  variant_guidance: string;
  rationale:        string;
  confidence:       ConfidenceLevel;
}

// ── Gaps ──────────────────────────────────────────────────────────────────────
export type GapSeverity = 'High' | 'Medium' | 'Low';

export interface Gap {
  gap_id: string;
  site: Site;
  persona_id: string;
  stage_id: string;
  journey_id: string;
  gap_type: string;
  description: string;
  severity: GapSeverity;
  recommended_action: string;
}

// ── Sitemap ───────────────────────────────────────────────────────────────────
export type SitemapGroup =
  | 'main-nav'
  | 'destination'
  | 'accommodation'
  | 'products'
  | 'articles'
  | 'utility';

export interface SitemapNode {
  id:          string;
  parent_id:   string;
  level:       number;
  page_name:   string;
  url:         string;
  parent_page: string;
  page_type:   string;
  description: string;
  group:       SitemapGroup;
}

// ── Full data bundle ──────────────────────────────────────────────────────────
export interface SheetData {
  personas:        Persona[];
  stages:          JourneyStage[];
  cjmEntries:      CjmEntry[];
  usmEntries:      UsmEntry[];
  ujmEntries:      UjmEntry[];
  adaptiveContent: AdaptiveContent[];
  gaps:            Gap[];
  sitemapNodes:    SitemapNode[];
}
