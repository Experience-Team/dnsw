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
export interface UsmEntry {
  stage:             string;
  stage_description: string;
  activity:          string;
  site:              CjmSite;
  segment:           string;
  step:              string;
}

// ── Adaptive Content ──────────────────────────────────────────────────────────
export interface AdaptiveContent {
  content_type: string;
  site: CjmSite;
  segment: string;
  content: string;
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

// ── Full data bundle ──────────────────────────────────────────────────────────
export interface SheetData {
  personas:        Persona[];
  stages:          JourneyStage[];
  cjmEntries:      CjmEntry[];
  usmEntries:      UsmEntry[];
  adaptiveContent: AdaptiveContent[];
  gaps:            Gap[];
}
