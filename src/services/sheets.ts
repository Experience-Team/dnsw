import type {
  SheetData, Persona, JourneyStage,
  AdaptiveContent, Gap, Site,
  ContentPriority, GapSeverity,
  CjmEntry, CjmRowType,
} from '../types';

const CSV_BASE_URL =
  'https://docs.google.com/spreadsheets/d/e/' +
  '2PACX-1vRCmy7LngYdLDf4L_v1zDGH0eSYJHgd73PZn1uWVombvSnSFgCeyKq8RVev1cox4XBh1RjSlVCR_jlC' +
  '/pub?output=csv&single=true';

const TABS = {
  cjm:             167369858,
  usm:             1829750647,
  adaptiveContent: 1130418870,
  quoteBank:       1133768074,
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

function parseSite(val: string | undefined): Site {
  return (val ?? '').trim().toLowerCase() === 'sydney' ? 'sydney' : 'visitnsw';
}

function parsePriority(val: string | undefined): ContentPriority {
  const v = (val ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (v === 'mvp')     return 'MVP';
  if (v === 'phase 2') return 'Phase 2';
  if (v === 'phase 3') return 'Phase 3';
  return 'Phase 2';
}

function parseGapSeverity(val: string | undefined): GapSeverity {
  const v = (val ?? '').trim().toLowerCase();
  if (v === 'high')   return 'High';
  if (v === 'medium') return 'Medium';
  return 'Low';
}

function parseCjmRowType(val: string | undefined): CjmRowType {
  const v = (val ?? '').trim();
  if (v === 'Pain Point' || v === 'Delight' || v === 'Touchpoint' || v === 'Opportunity') return v;
  return 'Pain Point';
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
  const seen = new Set<string>();
  return rowsToObjects(rows)
    .filter(r => {
      const id = r.stage_id ?? '';
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map(r => ({
      stage_id:    r.stage_id    ?? '',
      stage_name:  r.stage_name  ?? '',
      stage_order: parseInt(r.stage_order ?? '0', 10) || 0,
      description: r.stage_description ?? r.description ?? '',
    }))
    .sort((a, b) => a.stage_order - b.stage_order);
}

function parseCjmEntries(rows: string[][]): CjmEntry[] {
  return rowsToObjects(rows)
    .filter(r => (r.row_type ?? '').trim() && (r.content ?? '').trim())
    .map(r => ({
      stage_id: r.stage_id ?? '',
      row_type: parseCjmRowType(r.row_type),
      site:     parseSite(r.site),
      segment:  r.segment ?? '',
      content:  r.content ?? '',
    }));
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

// ── Orchestrator ──────────────────────────────────────────────────────────────

export async function fetchAllSheetData(): Promise<SheetData> {
  const [
    stageRows,
    personaRows,
    adaptiveRows,
    gapRows,
  ] = await Promise.all([
    fetchTab(TABS.cjm),
    fetchTab(TABS.usm),
    fetchTab(TABS.adaptiveContent),
    fetchTab(TABS.quoteBank),
  ]);

  return {
    personas:        parsePersonas(personaRows),
    stages:          parseStages(stageRows),
    cjmEntries:      parseCjmEntries(stageRows),
    adaptiveContent: parseAdaptiveContent(adaptiveRows),
    gaps:            parseGaps(gapRows),
  };
}
