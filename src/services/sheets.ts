import type {
  SheetData, JourneyStage,
  AdaptiveContent, ConfidenceLevel, Gap, Site, CjmSite,
  GapSeverity,
  CjmEntry, CjmRowType, UsmEntry, SupportRating,
  UjmEntry, UjmRowType, UjmLayer, UjmDevice,
  SitemapNode, SitemapGroup,
  QuoteEntry,
} from '../types';

const CSV_BASE_URL =
  'https://docs.google.com/spreadsheets/d/e/' +
  '2PACX-1vRCmy7LngYdLDf4L_v1zDGH0eSYJHgd73PZn1uWVombvSnSFgCeyKq8RVev1cox4XBh1RjSlVCR_jlC' +
  '/pub?output=csv&single=true';

const TABS = {
  cjm:               167369858,
  usm:               1829750647,
  adaptiveContent:   1130418870,
  quoteBank:         1133768074,
  ujm:               1039846540,
  sitemap:           795825564,
  participantImages: 967421101,
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

  row.push(cell);
  if (row.some(c => c !== '')) rows.push(row);

  return rows;
}

// ── Fetch a single tab ────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 20000;

async function fetchTab(gid: number): Promise<string[][]> {
  const url = `${CSV_BASE_URL}&gid=${gid}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        'Timed out loading data from Google Sheet. Please try again.'
      );
    }
    throw new Error(
      'Could not load data from Google Sheet. Check the sheet is published and the URL is correct.'
    );
  } finally {
    clearTimeout(timeout);
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
  if (v === 'Device')                               return 'Device';
  if (v === 'Opportunity' || v === 'Opportunities') return 'Opportunity';
  return 'Pain Point';
}

function parseUjmRowType(val: string | undefined): UjmRowType {
  const v = (val ?? '').trim().toLowerCase();
  if (v === 'goals' || v === 'goal')                return 'Goals';
  if (v === 'actions' || v === 'action')            return 'Actions';
  if (v === 'mindset')                              return 'Mindset';
  if (v === 'touchpoints' || v === 'touchpoint')    return 'Touchpoints';
  if (v === 'pain points' || v === 'pain point')    return 'Pain Points';
  if (v === 'delights' || v === 'delight')          return 'Delights';
  if (v === 'opportunities' || v === 'opportunity') return 'Opportunities';
  return 'Goals';
}

function parseUjmLayer(val: string | undefined): UjmLayer {
  // Normalise spaces→hyphens so "Day out" matches "day-out" etc.
  const v = (val ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  if (v === 'day-out')                            return 'day-out';
  if (v === 'weekend-away')                       return 'weekend-away';
  if (v === 'road-trip')                          return 'road-trip';
  if (v === 'intl-multi-stop' || v === 'intl'
      || v === 'international' || v === 'multi-stop') return 'intl-multi-stop';
  return 'universal';
}

function parseUjmDevice(val: string | undefined): UjmDevice | '' {
  const v = (val ?? '').trim().toLowerCase();
  if (v === 'desktop') return 'desktop';
  if (v === 'mobile')  return 'mobile';
  if (v === 'both')    return 'both';
  return '';
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

function parseSupportRating(v: string | undefined): SupportRating {
  const s = (v ?? '').trim().toLowerCase();
  return s === 'owned' || s === 'partial' ? s : 'gap';
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
        support_rating:    parseSupportRating(r.support_rating),
        support_rationale: (r.support_rationale ?? '').trim(),
      };
    })
    .filter(e => e.stage && e.step);
}

function parseUjmEntries(rows: string[][]): UjmEntry[] {
  return rowsToObjects(rows)
    .filter(r => (r.stage ?? '').trim() && (r.content ?? '').trim())
    .map(r => ({
      stage:             (r.stage ?? '').trim(),
      stage_description: (r.stage_description ?? '').trim(),
      row_type:          parseUjmRowType(r.row_type),
      layer:             parseUjmLayer(r.layer),
      segment:           (r.segment ?? '').trim().toLowerCase() || 'all',
      content:           (r.content ?? '').trim(),
      device:            parseUjmDevice(r.device),
      image_url:         (r.image_url ?? '').trim(),
    }));
}

function parseConfidence(val: string | undefined): ConfidenceLevel {
  const v = (val ?? '').trim().toLowerCase();
  if (v === 'high')   return 'high';
  if (v === 'low')    return 'low';
  return 'medium';
}

function parseAdaptiveContent(rows: string[][]): AdaptiveContent[] {
  return rowsToObjects(rows)
    .filter(r => (r.content_type ?? '').trim() && (r.variant_guidance ?? '').trim())
    .map(r => ({
      content_type:     (r.content_type ?? '').trim(),
      site:             parseCjmSite(r.site),
      segment:          (r.segment ?? '').trim(),
      summary:          (r.summary ?? '').trim(),
      variant_guidance: (r.variant_guidance ?? '').trim(),
      rationale:        (r.rationale ?? '').trim(),
      confidence:       parseConfidence(r.confidence),
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

// ── Sitemap ───────────────────────────────────────────────────────────────────

function classifySitemapGroup(pageType: string): SitemapGroup {
  const v = pageType.toLowerCase();
  if (/accommodation|hotel|motel|hostel|b&b|cabin|apartment|villa|resort/.test(v)) return 'accommodation';
  if (/destination|neighbourhood|neighborhood|region|suburb|area|place/.test(v)) return 'destination';
  if (/tour|attraction|food|drink|restaurant|hire|rental|event|product|experience|activity/.test(v)) return 'products';
  if (/article|tag|blog|story|guide|inspiration/.test(v)) return 'articles';
  if (/main\s*nav|primary\s*nav|hub|landing|home|category/.test(v)) return 'main-nav';
  return 'utility';
}

function parseSitemapNodes(rows: string[][]): SitemapNode[] {
  return rowsToObjects(rows)
    .filter(r => (r.id ?? '').trim() && (r.page_name ?? '').trim())
    .map(r => {
      const pageType = (r.page_type ?? '').trim();
      const levelNum = parseInt((r.level ?? '').trim(), 10);
      return {
        id:          (r.id ?? '').trim(),
        parent_id:   (r.parent_id ?? '').trim(),
        level:       Number.isFinite(levelNum) ? levelNum : 0,
        page_name:   (r.page_name ?? '').trim(),
        url:         (r.url ?? '').trim(),
        parent_page: (r.parent_page ?? '').trim(),
        page_type:   pageType,
        description: (r.description ?? '').trim(),
        group:       classifySitemapGroup(pageType),
      };
    });
}

// ── Quote Bank ────────────────────────────────────────────────────────────────

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
      participant:  r.participant  ?? '',
      alias:        '',
      image_url:    '',
    }));
}

function normalizeName(s: string): string {
  return (s ?? '')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

interface ParticipantInfo {
  imageUrl: string;
  alias:    string;
}

function parseParticipantImages(rows: string[][]): Map<string, ParticipantInfo> {
  const map = new Map<string, ParticipantInfo>();
  rowsToObjects(rows).forEach(r => {
    const name = normalizeName(r.name ?? '');
    if (!name) return;
    map.set(name, {
      imageUrl: (r.image_url ?? '').trim(),
      alias:    (r.alias ?? '').trim(),
    });
  });
  return map;
}

function buildQuotes(quoteRows: string[][], imageRows: string[][]): QuoteEntry[] {
  const images = parseParticipantImages(imageRows);
  return parseQuotes(quoteRows).map(q => {
    const info = images.get(normalizeName(q.participant));
    return {
      ...q,
      alias:     info?.alias ?? '',
      image_url: info?.imageUrl ?? '',
    };
  });
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

async function fetchTabSafe(gid: number, name: string): Promise<string[][]> {
  try {
    return await fetchTab(gid);
  } catch (e) {
    console.warn(`Could not load the "${name}" sheet tab (gid ${gid}); continuing without it.`, e);
    return [];
  }
}

export async function fetchAllSheetData(): Promise<SheetData> {
  const [
    cjmRows,
    usmRows,
    adaptiveRows,
    quoteRows,
    ujmRows,
    sitemapRows,
    participantImageRows,
  ] = await Promise.all([
    fetchTabSafe(TABS.cjm, 'Customer Journey Map'),
    fetchTabSafe(TABS.usm, 'User Story Map'),
    fetchTabSafe(TABS.adaptiveContent, 'Adaptive Content'),
    fetchTabSafe(TABS.quoteBank, 'Quote Bank'),
    fetchTabSafe(TABS.ujm, 'User Journey Map'),
    fetchTabSafe(TABS.sitemap, 'Sitemap'),
    fetchTabSafe(TABS.participantImages, 'Participant Images'),
  ]);

  return {
    personas:        [],
    stages:          parseStages(cjmRows),
    cjmEntries:      parseCjmEntries(cjmRows),
    usmEntries:      parseUsmEntries(usmRows),
    ujmEntries:      parseUjmEntries(ujmRows),
    adaptiveContent: parseAdaptiveContent(adaptiveRows),
    gaps:            parseGaps(quoteRows),
    sitemapNodes:    parseSitemapNodes(sitemapRows),
    quotes:          buildQuotes(quoteRows, participantImageRows),
  };
}
