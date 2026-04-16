import type {
  SheetData, Persona, JourneyStage, Touchpoint, Journey,
  AdaptiveContent, Gap, Segment, Site, Emotion, GeoReadiness, AtdwCoverage,
  ContentPriority, GapSeverity,
} from '../types';

const CSV_BASE_URL =
  'https://docs.google.com/spreadsheets/d/e/' +
  '2PACX-1vRCmy7LngYdLDf4L_v1zDGH0eSYJHgd73PZn1uWVombvSnSFgCeyKq8RVev1cox4XBh1RjSlVCR_jlC' +
  '/pub?output=csv&single=true';

const TABS = {
  personas:        1829750647,
  stages:          167369858,
  touchpoints:     1659333997,
  journeys:        956844268,
  adaptiveContent: 1130418870,
  gaps:            1133768074,
  segments:        869617616,
} as const;

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  let i = 0;

  while (i < lines.length) {
    const ch = lines[i];
    if (inQuotes) {
      if (ch === '"') {
        if (lines[i + 1] === '"') {
          // escaped double-quote inside quoted field
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(cell);
        cell = '';
      } else if (ch === '\n') {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }
    i++;
  }

  // flush last cell / row
  row.push(cell);
  if (row.some(c => c !== '')) rows.push(row);

  return rows;
}

// ── Fetch a single tab ────────────────────────────────────────────────────────

async function fetchTab(gid: number): Promise<string[][]> {
  const url = `${CSV_BASE_URL}&gid=${gid}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error(
      'Could not load data from Google Sheet. Check the sheet is published and the URL is correct.'
    );
  }

  if (!res.ok) {
    throw new Error(
      'Could not load data from Google Sheet. Check the sheet is published and the URL is correct.'
    );
  }

  const text = await res.text();
  return parseCsv(text);
}

// ── Row-to-object parser ──────────────────────────────────────────────────────

function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];
  const [headers, ...dataRows] = rows;
  return dataRows
    .filter(row => row.some(cell => cell.trim() !== ''))
    .map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        // Normalise header to lowercase so column names are case-insensitive
        obj[h.trim().toLowerCase()] = (row[i] ?? '').trim();
      });
      return obj;
    });
}

function parseList(val: string | undefined): string[] {
  if (!val) return [];
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

function parseSite(val: string): Site {
  return val.trim().toLowerCase() === 'sydney' ? 'sydney' : 'visitnsw';
}

function parseEmotion(val: string): Emotion {
  const v = val.trim().toLowerCase();
  if (v === 'positive')   return 'Positive';
  if (v === 'negative')   return 'Negative';
  if (v === 'frustrated') return 'Frustrated';
  return 'Neutral';
}

function parseGeoReadiness(val: string): GeoReadiness {
  const v = val.trim().toLowerCase();
  if (v === 'yes')     return 'Yes';
  if (v === 'partial') return 'Partial';
  return 'No';
}

function parseAtdwCoverage(val: string): AtdwCoverage {
  const v = val.trim().toLowerCase();
  if (v === 'strong')  return 'Strong';
  if (v === 'partial') return 'Partial';
  if (v === 'weak')    return 'Weak';
  return 'None';
}

function parsePriority(val: string): ContentPriority {
  const v = val.trim().toLowerCase().replace(/\s+/g, ' ');
  if (v === 'mvp')     return 'MVP';
  if (v === 'phase 2') return 'Phase 2';
  if (v === 'phase 3') return 'Phase 3';
  return 'Phase 2';
}

function parseGapSeverity(val: string): GapSeverity {
  const v = val.trim().toLowerCase();
  if (v === 'high')   return 'High';
  if (v === 'medium') return 'Medium';
  return 'Low';
}

// ── Per-tab parsers ───────────────────────────────────────────────────────────

function parsePersonas(rows: string[][]): Persona[] {
  return rowsToObjects(rows).map(r => ({
    persona_id:       r.persona_id       ?? '',
    site:             parseSite(r.site),
    name:             r.name             ?? '',
    segment:          r.segment          ?? '',
    description:      r.description      ?? '',
    goals:            r.goals            ?? '',
    frustrations:     r.frustrations     ?? '',
    tech_comfort:     r.tech_comfort     ?? '',
    planning_horizon: r.planning_horizon ?? '',
    travel_party:     r.travel_party     ?? '',
    budget_range:     r.budget_range     ?? '',
    source_evidence:  r.source_evidence  ?? '',
  }));
}

function parseStages(rows: string[][]): JourneyStage[] {
  return rowsToObjects(rows)
    .map(r => ({
      stage_id:    r.stage_id    ?? '',
      stage_name:  r.stage_name  ?? '',
      stage_order: parseInt(r.stage_order ?? '0', 10) || 0,
      description: r.description ?? '',
    }))
    .sort((a, b) => a.stage_order - b.stage_order);
}

function parseTouchpoints(rows: string[][]): Touchpoint[] {
  return rowsToObjects(rows).map(r => ({
    touchpoint_id:   r.touchpoint_id   ?? '',
    site:            parseSite(r.site),
    stage_id:        r.stage_id        ?? '',
    persona_ids:     parseList(r.persona_id),
    journey_ids:     parseList(r.journey_id),
    channel:         r.channel         ?? '',
    touchpoint_name: r.touchpoint_name ?? '',
    description:     r.description     ?? '',
    user_emotion:    parseEmotion(r.user_emotion),
    pain_points:     r.pain_points      ?? '',
    opportunities:   r.opportunities    ?? '',
    current_content: r.current_content  ?? '',
    content_gap:     r.content_gap      ?? '',
    geo_readiness:   parseGeoReadiness(r.geo_readiness),
    experiment_id:   r.experiment_id    ?? '',
    atdw_coverage:   parseAtdwCoverage(r.atdw_coverage),
    source_evidence: r.source_evidence  ?? '',
  }));
}

function parseJourneys(rows: string[][]): Journey[] {
  return rowsToObjects(rows).map(r => {
    const siteVal = r.site?.trim().toLowerCase();
    const site: Site | 'both' = siteVal === 'sydney' ? 'sydney' : siteVal === 'visitnsw' ? 'visitnsw' : 'both';
    return {
      journey_id:       r.journey_id       ?? '',
      site,
      journey_name:     r.journey_name     ?? '',
      description:      r.description      ?? '',
      typical_personas: parseList(r.typical_personas),
      typical_duration: r.typical_duration ?? '',
      key_stages:       parseList(r.key_stages),
      source_evidence:  r.source_evidence  ?? '',
    };
  });
}

function parseAdaptiveContent(rows: string[][]): AdaptiveContent[] {
  return rowsToObjects(rows).map(r => ({
    content_rule_id: r.content_rule_id  ?? '',
    site:            parseSite(r.site),
    stage_id:        r.stage_id         ?? '',
    segment:         r.segment          ?? '',
    page_type:       r.page_type        ?? '',
    content_element: r.content_element  ?? '',
    default_variant: r.default_variant  ?? '',
    adapted_variant: r.adapted_variant  ?? '',
    rationale:       r.rationale        ?? '',
    priority:        parsePriority(r.priority),
    source_evidence: r.source_evidence  ?? '',
  }));
}

function parseGaps(rows: string[][]): Gap[] {
  return rowsToObjects(rows).map(r => ({
    gap_id:             r.gap_id             ?? '',
    site:               parseSite(r.site),
    persona_id:         r.persona_id         ?? '',
    stage_id:           r.stage_id           ?? '',
    journey_id:         r.journey_id         ?? '',
    gap_type:           r.gap_type           ?? '',
    description:        r.description        ?? '',
    severity:           parseGapSeverity(r.severity),
    recommended_action: r.recommended_action ?? '',
  }));
}

function parseSegments(rows: string[][]): Segment[] {
  return rowsToObjects(rows);
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

export async function fetchAllSheetData(): Promise<SheetData> {
  const [
    personaRows,
    stageRows,
    touchpointRows,
    journeyRows,
    adaptiveRows,
    gapRows,
    segmentRows,
  ] = await Promise.all([
    fetchTab(TABS.personas),
    fetchTab(TABS.stages),
    fetchTab(TABS.touchpoints),
    fetchTab(TABS.journeys),
    fetchTab(TABS.adaptiveContent),
    fetchTab(TABS.gaps),
    fetchTab(TABS.segments),
  ]);

  return {
    personas:        parsePersonas(personaRows),
    stages:          parseStages(stageRows),
    touchpoints:     parseTouchpoints(touchpointRows),
    journeys:        parseJourneys(journeyRows),
    adaptiveContent: parseAdaptiveContent(adaptiveRows),
    gaps:            parseGaps(gapRows),
    segments:        parseSegments(segmentRows),
  };
}
