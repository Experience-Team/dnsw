import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { CjmRowType } from '../types';

const ROW_TYPES: CjmRowType[] = ['Pain Point', 'Delight', 'Touchpoint', 'Opportunity'];

const ROW_LABELS: Record<CjmRowType, string> = {
  'Pain Point':  'Pain Points',
  'Delight':     'Delights',
  'Touchpoint':  'Touchpoints',
  'Opportunity': 'Opportunities',
};

const SEGMENTS = [
  'Local',
  'Intrastate',
  'Interstate',
  'Short-haul International',
  'Long-haul International',
];

function PillButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        text-sm text-blue-90 px-4 py-2.5 rounded-full transition-all
        ${active ? 'bg-blue-30' : 'bg-white'}
      `}
    >
      {label}
    </button>
  );
}

export default function CustomerJourneyMapView() {
  const { data, siteFilter, setSiteFilter } = useAppContext();
  const [audienceFilter, setAudienceFilter] = useState('');

  if (!data) return null;

  const { stages, cjmEntries } = data;

  const filtered = useMemo(() =>
    cjmEntries.filter(e => {
      const siteMatch =
        siteFilter === 'both' ||
        e.site === siteFilter ||
        e.site === 'both';
      const segmentMatch =
        audienceFilter === '' ||
        e.segment.trim().toLowerCase() === 'all' ||
        e.segment.split(',').map(s => s.trim().toLowerCase()).includes(audienceFilter.toLowerCase());
      return siteMatch && segmentMatch;
    }),
    [cjmEntries, siteFilter, audienceFilter]
  );

  // Build lookup: rowType → stageId → content[]
  const grid = useMemo(() => {
    const g: Record<CjmRowType, Record<string, string[]>> = {
      'Pain Point':  {},
      'Delight':     {},
      'Touchpoint':  {},
      'Opportunity': {},
    };
    filtered.forEach(e => {
      if (!g[e.row_type][e.stage_id]) g[e.row_type][e.stage_id] = [];
      g[e.row_type][e.stage_id].push(e.content);
    });
    return g;
  }, [filtered]);

  // Max cell count per row type section (ensures row heights stay uniform across columns)
  const maxRows = useMemo(() =>
    ROW_TYPES.reduce((acc, rt) => {
      acc[rt] = stages.reduce(
        (m, s) => Math.max(m, (grid[rt][s.stage_id] ?? []).length),
        0
      );
      return acc;
    }, {} as Record<CjmRowType, number>),
    [grid, stages]
  );

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-90 w-20 shrink-0 leading-10">Site</span>
          <div className="flex gap-4">
            <PillButton
              label="Visit"
              active={siteFilter === 'visitnsw'}
              onClick={() => setSiteFilter(siteFilter === 'visitnsw' ? 'both' : 'visitnsw')}
            />
            <PillButton
              label="Sydney"
              active={siteFilter === 'sydney'}
              onClick={() => setSiteFilter(siteFilter === 'sydney' ? 'both' : 'sydney')}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-90 w-20 shrink-0 leading-10">Audience</span>
          <div className="flex gap-4 flex-wrap">
            {SEGMENTS.map(seg => (
              <PillButton
                key={seg}
                label={seg}
                active={audienceFilter === seg}
                onClick={() => setAudienceFilter(v => v === seg ? '' : seg)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-4">
        <table className="border-collapse">
          <thead>
            <tr>
              {/* Corner spacer */}
              <th className="sticky left-0 z-20 bg-blue-10 w-28 min-w-28" />
              {stages.map(s => (
                <th
                  key={s.stage_id}
                  className="align-top w-60 min-w-[200px] px-[3px] pb-3 font-normal"
                >
                  <div className="bg-blue-20 w-full text-center text-[18px] leading-10 text-blue-90">
                    {s.stage_name}
                  </div>
                  {s.description && (
                    <p className="text-xs italic font-light text-blue-90 leading-relaxed mt-1 text-left">
                      {s.description}
                    </p>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROW_TYPES.map((rt, rtIdx) => {
              const total = Math.max(maxRows[rt], 1);
              return (
                <tr key={rt}>
                  <td
                    className={`sticky left-0 z-10 bg-blue-10 pr-4 align-top w-28 min-w-28 ${
                      rtIdx > 0 ? 'pt-16' : ''
                    }`}
                  >
                    <span className="text-base text-blue-90 whitespace-nowrap">
                      {ROW_LABELS[rt]}
                    </span>
                  </td>
                  {stages.map(s => {
                    const items = grid[rt][s.stage_id] ?? [];
                    return (
                      <td
                        key={s.stage_id}
                        className={`align-top px-[3px] ${rtIdx > 0 ? 'pt-16' : ''}`}
                      >
                        <div className="flex flex-col gap-2">
                          {Array.from({ length: total }).map((_, i) => {
                            const content = items[i];
                            return (
                              <div
                                key={i}
                                className={`rounded px-2 py-3 text-base text-blue-90 leading-snug ${
                                  content ? 'bg-blue-20' : 'bg-white'
                                }`}
                              >
                                {content ?? ' '}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
