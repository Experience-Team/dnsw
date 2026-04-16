// ── Site / filter ─────────────────────────────────────────────────────────────
export type Site = 'visitnsw' | 'sydney';
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

// ── Touchpoints ───────────────────────────────────────────────────────────────
export type Emotion = 'Positive' | 'Neutral' | 'Negative' | 'Frustrated';
export type GeoReadiness = 'Yes' | 'Partial' | 'No';
export type AtdwCoverage = 'Strong' | 'Partial' | 'Weak' | 'None';

export interface Touchpoint {
  touchpoint_id: string;
  site: Site;
  stage_id: string;
  persona_ids: string[];
  journey_ids: string[];
  channel: string;
  touchpoint_name: string;
  description: string;
  user_emotion: Emotion;
  pain_points: string;
  opportunities: string;
  current_content: string;
  content_gap: string;
  geo_readiness: GeoReadiness;
  experiment_id: string;
  atdw_coverage: AtdwCoverage;
  source_evidence: string;
}

// ── Journeys ──────────────────────────────────────────────────────────────────
export interface Journey {
  journey_id: string;
  site: Site | 'both';
  journey_name: string;
  description: string;
  typical_personas: string[];
  typical_duration: string;
  key_stages: string[];
  source_evidence: string;
}

// ── Adaptive Content ──────────────────────────────────────────────────────────
export type ContentPriority = 'MVP' | 'Phase 2' | 'Phase 3';

export interface AdaptiveContent {
  content_rule_id: string;
  site: Site;
  stage_id: string;
  segment: string;
  page_type: string;
  content_element: string;
  default_variant: string;
  adapted_variant: string;
  rationale: string;
  priority: ContentPriority;
  source_evidence: string;
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

// ── Audience Segments ─────────────────────────────────────────────────────────
export type Segment = Record<string, string>;

// ── Full data bundle ──────────────────────────────────────────────────────────
export interface SheetData {
  personas: Persona[];
  stages: JourneyStage[];
  touchpoints: Touchpoint[];
  journeys: Journey[];
  adaptiveContent: AdaptiveContent[];
  gaps: Gap[];
  segments: Segment[];
}
