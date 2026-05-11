import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import type { SupportRating, UsmEntry } from '../types';


const RATING_COLOR: Record<SupportRating, string> = {
  owned:   '#04A069',
  partial: '#FFD400',
  gap:     '#FA0057',
};

const RATING_LABEL: Record<SupportRating, string> = {
  owned: 'Owned', partial: 'Partial', gap: 'Gap',
};

const RATING_BLURB: Record<SupportRating, string> = {
  owned:   'Meaningfully supported by the sites',
  partial: 'Partially supported by the sites',
  gap:     'Not meaningfully supported by the sites',
};

const RATING_ORDER: SupportRating[] = ['owned', 'partial', 'gap'];

const AUDIENCE_LABEL: Record<string, string> = {
  'intrastate':       'Intrastate',
  'interstate':       'Interstate',
  'intl-short-haul':  'International Short Haul',
  'intl-long-haul':   'International Long Haul',
  'local':            'Local',
  'all':              'All audiences',
};

function parseSegments(raw: string | undefined | null): string[] {
  if (!raw) return [];
  const parts = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (parts.includes('all')) return ['all'];
  return [...new Set(parts)];
}


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

function StepPopover({ entry, onClose }: { entry: UsmEntry; onClose: () => void }) {
  const segments = parseSegments(entry.segment);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-2">
        <div className="flex items-start gap-2 w-full">
          <div className="flex-1 min-w-0 flex flex-col gap-1 text-base text-blue-90 leading-[22px]">
            <p><span className="font-bold">Step:</span> {entry.step}</p>
            <p><span className="font-bold">Phase:</span> {entry.stage}</p>
            <p><span className="font-bold">Activity:</span> <span className="capitalize">{entry.activity}</span></p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-blue-10 hover:bg-blue-20 flex items-center justify-center text-blue-80 text-base shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {segments.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-base text-blue-90">
            <span className="font-bold shrink-0">Audience:</span>
            {segments.map(seg => (
              <span
                key={seg}
                className="text-base text-blue-90 px-4 py-1 rounded-full bg-blue-10"
              >
                {AUDIENCE_LABEL[seg] ?? seg}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-1 w-full">
          <h4 className="pt-3 text-base font-bold text-blue-90 leading-6">Why this rating</h4>
          <div className="flex items-center gap-1.5 pt-1 text-sm text-blue-90 leading-5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: RATING_COLOR[entry.support_rating] }}
            />
            <span><strong>{RATING_LABEL[entry.support_rating]}:</strong> {RATING_BLURB[entry.support_rating]}</span>
          </div>
          <p className="text-base text-blue-90 leading-[22px]">{entry.support_rationale}</p>
        </div>
      </div>
    </div>
  );
}

interface ActivityData {
  name: string;
  steps: UsmEntry[];
}

interface StageData {
  stage: string;
  description: string;
  activities: ActivityData[];
}

function buildStageData(entries: UsmEntry[]): StageData[] {
  const stageMap = new Map<string, { description: string; activities: Map<string, UsmEntry[]> }>();
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
      stage.activities.get(e.activity)!.push(e);
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

export default function UserStoryMap() {
  const { data, siteFilter } = useAppContext();
  const [audienceFilter, setAudienceFilter] = useState('');
  const [activeRatings, setActiveRatings] = useState<Set<SupportRating>>(
    () => new Set(RATING_ORDER)
  );
  const [selectedStep, setSelectedStep] = useState<UsmEntry | null>(null);

  if (!data) return null;
  const { usmEntries } = data;

  function toggleRating(r: SupportRating) {
    setActiveRatings(prev => {
      if (prev.size === 1 && prev.has(r)) return new Set(RATING_ORDER);
      return new Set([r]);
    });
  }

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
      const ratingMatch = activeRatings.has(e.support_rating);
      return siteMatch && segmentMatch && ratingMatch;
    }),
    [usmEntries, siteFilter, audienceFilter, activeRatings]
  );

  const segments = useMemo(() =>
    [...new Set(usmEntries.flatMap(e =>
      e.segment ? e.segment.split(',').map(s => s.trim()).filter(s => s && s.toLowerCase() !== 'all') : []
    ))].sort(),
    [usmEntries]
  );

  const stageData = useMemo(() => buildStageData(filtered), [filtered]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setShowFade(el.scrollWidth - el.clientWidth - el.scrollLeft > 1);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener('scroll', update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, [stageData]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-90">User Story Map</h1>
        <p className="text-base text-blue-90/60 mt-0.5">Each step is rated by how well our sites support it, making gaps and strengths visible to guide feature prioritisation.</p>
      </div>

      {/* Filters */}
      <div className="sticky top-14 z-20 bg-blue-10 -mx-10 px-10 py-3 mb-5">
        <div className="flex items-center gap-8 flex-wrap">
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
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <span className="text-base text-blue-90 shrink-0 mr-1">Website features</span>
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => setActiveRatings(new Set(RATING_ORDER))}
              className={`text-base text-blue-90 px-4 py-1 rounded-full transition-all flex items-center gap-1.5 ${activeRatings.size === RATING_ORDER.length ? 'bg-blue-30' : 'bg-white'}`}
            >
              <span className="flex items-center gap-0.5">
                {RATING_ORDER.map(r => (
                  <span key={r} className="w-2 h-2 rounded-full" style={{ backgroundColor: RATING_COLOR[r] }} />
                ))}
              </span>
              All
            </button>
            {RATING_ORDER.map(r => {
              const active = activeRatings.size === 1 && activeRatings.has(r);
              return (
                <button
                  key={r}
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => toggleRating(r)}
                  className={`text-base text-blue-90 px-4 py-1 rounded-full transition-all flex items-center gap-1.5 ${active ? 'bg-blue-30' : 'bg-white'}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RATING_COLOR[r] }} />
                  {RATING_LABEL[r]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="relative -mr-10">
      <div ref={scrollRef} className="overflow-x-auto pb-4">
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
                  <div className="group relative bg-blue-20 w-full text-center text-[18px] leading-10 text-blue-90 cursor-default rounded-md">
                    {s.stage}
                    {s.description && (
                      <div
                        role="tooltip"
                        className="invisible group-hover:visible pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 w-[180px] p-2.5 bg-blue-20 text-blue-90 text-[13px] leading-snug text-left rounded-md shadow-md z-30"
                      >
                        {s.description}
                      </div>
                    )}
                  </div>
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
                    <div className="bg-blue-80 px-2 py-3 text-base font-bold text-white rounded-md text-left">
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
                      {a.steps.map((entry, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedStep(entry)}
                          className="relative w-full text-left rounded-md px-3 py-4 bg-white text-blue-90 hover:bg-white hover:shadow-md transition-shadow"
                        >
                          <span
                            className="absolute top-2 left-2 w-2 h-2 rounded-full pointer-events-none"
                            style={{ backgroundColor: RATING_COLOR[entry.support_rating] }}
                          />
                          <span className="absolute top-1.5 right-1.5 opacity-30 pointer-events-none">
                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="5.5,1 9,1 9,4.5" />
                              <line x1="5.5" y1="4.5" x2="9" y2="1" />
                              <polyline points="4.5,9 1,9 1,5.5" />
                              <line x1="4.5" y1="5.5" x2="1" y2="9" />
                            </svg>
                          </span>
                          <p className="text-base leading-snug pl-4 pr-3">{entry.step}</p>
                        </button>
                      ))}
                    </div>
                  </td>
                ))
              )}
            </tr>
          </tbody>
        </table>
      </div>
      {showFade && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-r from-transparent to-blue-10 opacity-50" />
      )}
      </div>

      {selectedStep && (
        <StepPopover entry={selectedStep} onClose={() => setSelectedStep(null)} />
      )}
    </div>
  );
}
