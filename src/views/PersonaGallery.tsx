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
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      className={`
        text-base text-blue-90 px-4 py-1 rounded-full transition-all
        ${active ? 'bg-blue-30' : 'bg-white'}
      `}
    >
      {label}
    </button>
  );
}

interface ActivityData {
  name: string;
  steps: string[];
}

interface StageData {
  stage: string;
  description: string;
  activities: ActivityData[];
}

function buildStageData(entries: UsmEntry[]): StageData[] {
  const stageMap = new Map<string, { description: string; activities: Map<string, string[]> }>();
  const stageOrder: string[] = [];

  entries.forEach(e => {
    if (!stageMap.has(e.stage)) {
      stageMap.set(e.stage, { description: e.stage_description ?? '', activities: new Map() });
      stageOrder.push(e.stage);
    }
    const stage = stageMap.get(e.stage)!;
    if (e.activity && !stage.activities.has(e.activity)) {
      stage.activities.set(e.activity, []);
    }
    if (e.activity && e.step) {
      stage.activities.get(e.activity)!.push(e.step);
    }
  });

  return stageOrder.map(s => {
    const { description, activities } = stageMap.get(s)!;
    return {
      stage: s,
      description,
      activities: [...activities.entries()].map(([name, steps]) => ({ name, steps })),
    };
  });
}

export default function PersonaGallery() {
  const { data, siteFilter, setSiteFilter } = useAppContext();
  const [audienceFilter, setAudienceFilter] = useState('');

  if (!data) return null;
  const { usmEntries } = data;

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

  const stageData = useMemo(() => buildStageData(filtered), [filtered]);

  return (
    <div>
      {/* Filters */}
      <div className="sticky top-[139px] z-20 bg-blue-10 -mx-10 px-10 py-3 mb-5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-base text-blue-90">Site</span>
            <div className="flex gap-2">
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
            <span className="text-base text-blue-90 shrink-0">Audience</span>
            <div className="flex gap-2 flex-wrap">
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
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-4">
        <table className="border-collapse">
          <thead>
            {/* Row 1: stage headers spanning their activity sub-columns */}
            <tr>
              <th className="sticky left-0 z-20 bg-blue-10 w-28 min-w-28" />
              {stageData.map(s => (
                <th
                  key={s.stage}
                  colSpan={s.activities.length || 1}
                  className="align-top px-[2px] pb-1 font-normal"
                >
                  <div className="bg-blue-20 w-full text-center text-[18px] leading-10 text-blue-90">
                    {s.stage}
                  </div>
                  {s.description && (
                    <p className="text-[13px] font-normal text-blue-60 leading-[1.3] mt-1 text-left">
                      {s.description}
                    </p>
                  )}
                </th>
              ))}
            </tr>
            {/* Row 2: one sub-column header per activity */}
            <tr>
              <th className="sticky left-0 z-20 bg-blue-10 w-28 min-w-28 align-bottom pb-2 font-normal">
                <span className="text-base text-blue-90 whitespace-nowrap">Activity</span>
              </th>
              {stageData.flatMap(s =>
                s.activities.map(a => (
                  <th
                    key={`${s.stage}-${a.name}`}
                    className="align-top min-w-[285px] px-[2px] pb-2 font-normal"
                  >
                    <div className="bg-blue-80 px-2 py-3 text-base font-bold text-white rounded text-left">
                      {a.name}
                    </div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {/* Steps: one cell per activity */}
            <tr>
              <td className="sticky left-0 z-10 bg-blue-10 pr-4 align-top w-28 min-w-28">
                <span className="text-base text-blue-90 whitespace-nowrap">Steps</span>
              </td>
              {stageData.flatMap(s =>
                s.activities.map(a => (
                  <td key={`${s.stage}-${a.name}`} className="align-top px-[2px]">
                    <div className="flex flex-col gap-1">
                      {a.steps.map((step, i) => (
                        <div
                          key={i}
                          className="bg-white px-2 py-3 text-base text-blue-90 leading-snug rounded"
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                  </td>
                ))
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
