import type {
  SheetData, JourneyStage,
  AdaptiveContent, Gap, Site, CjmSite,
  GapSeverity,
  CjmEntry, CjmRowType, UsmEntry,
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
      // Normalise header: lowercase + collapse spaces to underscore
        obj[h.trim().toLowerCase().replace(/\s+/g, '_')] = (row[i] ?? '').trim();
      });
      return obj;
    });
}

function parseSite(val: string | undefined): Site {
  return (val ?? '').trim().toLowerCase() === 'sydney' ? 'sydney' : 'visitnsw';
}

function parseCjmSite(val: string | undefined): CjmSite {
  const v = (val ?? '').trim().toLowerCase();
  if (v === 'sydney') return 'sydney';
  if (v === 'both')   return 'both';
  return 'visitnsw';
}


function parseGapSeverity(val: string | undefined): GapSeverity {
  const v = (val ?? '').trim().toLowerCase();
  if (v === 'high')   return 'High';
  if (v === 'medium') return 'Medium';
  return 'Low';
}

function parseCjmRowType(val: string | undefined): CjmRowType {
  const v = (val ?? '').trim();
  if (v === 'Pain Point'  || v === 'Pain Points')   return 'Pain Point';
  if (v === 'Delight'     || v === 'Delights')      return 'Delight';
  if (v === 'Touchpoint'  || v === 'Touchpoints')   return 'Touchpoint';
  if (v === 'Opportunity' || v === 'Opportunities') return 'Opportunity';
  return 'Pain Point';
}

// ── Per-tab parsers ───────────────────────────────────────────────────────────


function parseStages(rows: string[][]): JourneyStage[] {
  const seen = new Set<string>();
  const result: JourneyStage[] = [];
  rowsToObjects(rows).forEach(r => {
    const name = (r.stage ?? '').trim();
    if (!name || seen.has(name)) return;
    seen.add(name);
    result.push({
      stage_id:    name,
      stage_name:  name,
      stage_order: result.length,
      description: (r.stage_description ?? '').trim(),
    });
  });
  return result;
}

function parseCjmEntries(rows: string[][]): CjmEntry[] {
  return rowsToObjects(rows)
    .filter(r => (r.row_type ?? '').trim() && (r.content ?? '').trim())
    .map(r => ({
      stage_id: (r.stage ?? '').trim(),
      row_type: parseCjmRowType(r.row_type),
      site:     parseCjmSite(r.site),
      segment:  r.segment ?? '',
      content:  r.content ?? '',
    }));
}

function parseUsmEntries(rows: string[][]): UsmEntry[] {
  let lastStage = '';
  let lastStageDesc = '';
  return rowsToObjects(rows)
    .map(r => {
      if (r.stage?.trim()) {
        lastStage     = r.stage.trim();
        lastStageDesc = (r.stage_description ?? '').trim();
      }
      return {
        stage:             lastStage,
        stage_description: lastStageDesc,
        activity:          (r.activity ?? '').trim(),
        site:              parseCjmSite(r.site),
        segment:           (r.segment ?? '').trim(),
        step:              (r.step ?? '').trim(),
      };
    })
    .filter(e => e.stage && e.step);
}

function parseAdaptiveContent(rows: string[][]): AdaptiveContent[] {
  return rowsToObjects(rows)
    .filter(r => (r.content_type ?? '').trim() && (r.content ?? '').trim())
    .map(r => ({
      content_type: (r.content_type ?? '').trim(),
      site:         parseCjmSite(r.site),
      segment:      (r.segment ?? '').trim(),
      content:      (r.content ?? '').trim(),
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

// ── Quote Bank ────────────────────────────────────────────────────────────────

export interface QuoteEntry {
  quote_id:     string;
  quote:        string;
  segment:      string;
  sentiment:    string;
  themes:       string;
  stage:        string;
  site:         string;
  travel_party: string;
  trip_context: string;
}

function parseQuotes(rows: string[][]): QuoteEntry[] {
  return rowsToObjects(rows)
    .filter(r => (r.quote ?? '').trim())
    .map(r => ({
      quote_id:     r.quote_id     ?? '',
      quote:        r.quote        ?? '',
      segment:      r.segment      ?? '',
      sentiment:    r.sentiment    ?? '',
      themes:       r.themes       ?? '',
      stage:        r.stage        ?? '',
      site:         r.site         ?? '',
      travel_party: r.travel_party ?? '',
      trip_context: r.trip_context ?? '',
    }));
}

export async function fetchQuotes(): Promise<QuoteEntry[]> {
  const rows = await fetchTab(TABS.quoteBank);
  return parseQuotes(rows);
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

export async function fetchAllSheetData(): Promise<SheetData> {
  const [
    cjmRows,
    usmRows,
    adaptiveRows,
    quoteRows,
  ] = await Promise.all([
    fetchTab(TABS.cjm),
    fetchTab(TABS.usm),
    fetchTab(TABS.adaptiveContent),
    fetchTab(TABS.quoteBank),
  ]);

  return {
    personas:        [],
    stages:          parseStages(cjmRows),
    cjmEntries:      parseCjmEntries(cjmRows),
    usmEntries:      parseUsmEntries(usmRows),
    adaptiveContent: parseAdaptiveContent(adaptiveRows),
    gaps:            parseGaps(quoteRows),
  };
}
