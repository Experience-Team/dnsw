import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { UsmEntry } from '../types';

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

function getActivities(entries: UsmEntry[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  entries.forEach(e => {
    if (e.activity && !seen.has(e.activity)) {
      seen.add(e.activity);
      result.push(e.activity);
    }
  });
  return result;
}

function getSteps(entries: UsmEntry[]): string[] {
  const map = new Map<string, string[]>();
  const order: string[] = [];
  entries.forEach(e => {
    if (!map.has(e.activity)) { map.set(e.activity, []); order.push(e.activity); }
    if (e.step) map.get(e.activity)!.push(e.step);
  });
  return order.flatMap(a => map.get(a)!);
}

export default function PersonaGallery() {
  const { data, siteFilter, setSiteFilter } = useAppContext();
  const [audienceFilter, setAudienceFilter] = useState('');

  if (!data) return null;
  const { usmEntries } = data;

  const stages = useMemo(() => {
    const seen = new Set<string>();
    const descriptions = new Map<string, string>();
    const order: string[] = [];
    usmEntries.forEach(e => {
      if (!seen.has(e.stage)) { seen.add(e.stage); order.push(e.stage); }
      if (!descriptions.get(e.stage) && e.stage_description)
        descriptions.set(e.stage, e.stage_description);
    });
    return order.map(s => ({ stage: s, description: descriptions.get(s) ?? '' }));
  }, [usmEntries]);

  const filtered = useMemo(() =>
    usmEntries.filter(e => {
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
    [usmEntries, siteFilter, audienceFilter]
  );

  const stageMap = useMemo(() => {
    const m: Record<string, UsmEntry[]> = {};
    filtered.forEach(e => {
      if (!m[e.stage]) m[e.stage] = [];
      m[e.stage].push(e);
    });
    return m;
  }, [filtered]);

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
            <PillButton
              label="All"
              active={audienceFilter === ''}
              onClick={() => setAudienceFilter('')}
            />
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
              <th className="sticky left-0 z-20 bg-blue-10 w-28 min-w-28" />
              {stages.map(s => (
                <th
                  key={s.stage}
                  className="align-top w-60 min-w-[200px] px-[3px] pb-3 font-normal"
                >
                  <div className="bg-blue-20 w-full text-center text-[18px] leading-10 text-blue-90">
                    {s.stage}
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
            {/* Activity row */}
            <tr>
              <td className="sticky left-0 z-10 bg-blue-10 pr-4 align-top w-28 min-w-28">
                <span className="text-base text-blue-90 whitespace-nowrap">Activity</span>
              </td>
              {stages.map(s => {
                const activities = getActivities(stageMap[s.stage] ?? []);
                return (
                  <td key={s.stage} className="align-top px-[3px]">
                    {activities.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {activities.map(activity => (
                          <div
                            key={activity}
                            className="bg-blue-20 px-2 py-2 text-sm font-semibold text-blue-90 rounded"
                          >
                            {activity}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded px-2 py-3 min-h-[48px]" />
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Steps row */}
            <tr>
              <td className="sticky left-0 z-10 bg-blue-10 pr-4 align-top w-28 min-w-28 pt-16">
                <span className="text-base text-blue-90 whitespace-nowrap">Steps</span>
              </td>
              {stages.map(s => {
                const steps = getSteps(stageMap[s.stage] ?? []);
                return (
                  <td key={s.stage} className="align-top px-[3px] pt-16">
                    {steps.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {steps.map((step, i) => (
                          <div
                            key={i}
                            className="bg-white px-2 py-2 text-sm text-blue-90 leading-snug rounded"
                          >
                            {step}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded px-2 py-3 min-h-[48px]" />
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
