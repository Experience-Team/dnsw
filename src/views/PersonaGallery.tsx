import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { UsmEntry } from '../types';


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
  const { data, siteFilter } = useAppContext();
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

  const segments = useMemo(() =>
    [...new Set(usmEntries.flatMap(e =>
      e.segment ? e.segment.split(',').map(s => s.trim()).filter(s => s && s.toLowerCase() !== 'all') : []
    ))].sort(),
    [usmEntries]
  );

  const stageData = useMemo(() => buildStageData(filtered), [filtered]);

  return (
    <div>
      {/* Filters */}
      <div className="sticky top-14 z-20 bg-blue-10 -mx-10 px-10 py-3 mb-5">
        <div className="flex items-center gap-8">
          {/* Site filter hidden
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
          */}
          <div className="flex items-center gap-4">
            <span className="text-base text-blue-90 shrink-0">Audience</span>
            <div className="flex gap-2 flex-wrap">
              <PillButton
                label="All"
                active={audienceFilter === ''}
                onClick={() => setAudienceFilter('')}
              />
              {segments.map(seg => (
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
      <div className="relative -mr-10">
      <div className="overflow-x-auto pb-4">
        <table className="border-collapse">
          <thead>
            {/* Row 1: stage headers spanning their activity sub-columns */}
            <tr>
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
                    <p className="text-[12px] font-light text-blue-90 leading-[15.5px] mt-1 text-left">
                      {s.description}
                    </p>
                  )}
                </th>
              ))}
            </tr>
            {/* Row 2: one sub-column header per activity */}
            <tr>
              {stageData.flatMap(s =>
                s.activities.map(a => (
                  <th
                    key={`${s.stage}-${a.name}`}
                    className="align-top min-w-[220px] px-[2px] pb-2 font-normal"
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
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-r from-transparent to-blue-10" />
      </div>
    </div>
  );
}
