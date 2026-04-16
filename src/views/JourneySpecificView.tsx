import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import TouchpointCard from '../components/TouchpointCard';
import TouchpointModal from '../components/TouchpointModal';
import EmotionArc from '../components/EmotionArc';
import PillSelect from '../components/PillSelect';
import type { Touchpoint, Journey } from '../types';

export default function JourneySpecificView() {
  const { data, siteFilter } = useAppContext();
  const [selectedJourneyId, setSelectedJourneyId] = useState('');
  const [selectedTp, setSelectedTp] = useState<Touchpoint | null>(null);

  if (!data) return null;

  const { stages, touchpoints, personas, journeys } = data;

  const availableJourneys = useMemo(() =>
    journeys.filter(j =>
      siteFilter === 'both' || j.site === siteFilter || j.site === 'both'
    ), [journeys, siteFilter]);

  // Auto-select first journey if none selected
  const journeyId = selectedJourneyId || availableJourneys[0]?.journey_id || '';
  const selectedJourney = journeys.find(j => j.journey_id === journeyId);

  // Find touchpoints for this journey
  const filtered = useMemo(() => {
    if (!journeyId) return [];
    return touchpoints.filter(tp => {
      if (siteFilter !== 'both' && tp.site !== siteFilter) return false;
      return tp.journey_ids.includes(journeyId);
    });
  }, [touchpoints, journeyId, siteFilter]);

  // Count how many journeys each touchpoint appears in (for "shared" indicator)
  const touchpointJourneyCount = useMemo(() => {
    const map: Record<string, number> = {};
    touchpoints.forEach(tp => { map[tp.touchpoint_id] = tp.journey_ids.length; });
    return map;
  }, [touchpoints]);

  const touchpointsByStage = useMemo(() => {
    const map: Record<string, Touchpoint[]> = {};
    stages.forEach(s => { map[s.stage_id] = []; });
    filtered.forEach(tp => {
      if (!map[tp.stage_id]) map[tp.stage_id] = [];
      map[tp.stage_id].push(tp);
    });
    return map;
  }, [filtered, stages]);

  const colWidth = Math.max(200, Math.floor(900 / Math.max(stages.length, 1)));

  return (
    <div>
      <div className="flex flex-wrap items-start gap-4 mb-6">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl font-bold text-grey-90">Journey View</h1>
          <p className="text-sm text-grey-50 mt-0.5">All touchpoints scoped to a single customer journey, from first awareness through to post-trip.</p>
        </div>

        {/* Journey picker */}
        <PillSelect
          label="Journey"
          value={journeyId}
          onChange={setSelectedJourneyId}
          options={availableJourneys.map(j => ({ label: j.journey_name, value: j.journey_id }))}
        />
      </div>

      {/* Journey meta panel */}
      {selectedJourney && (
        <JourneyMeta journey={selectedJourney} />
      )}

      {!journeyId || availableJourneys.length === 0 ? (
        <div className="py-16 text-center text-grey-40">
          No journeys available for the current filter.
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-grey-40">
          No touchpoints mapped to this journey yet.
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div
            className="inline-grid gap-px bg-grey-20 rounded-xl overflow-hidden border border-grey-20"
            style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(${colWidth}px, 1fr))` }}
          >
            {/* Stage headers */}
            {stages.map(stage => (
              <div key={stage.stage_id} className="bg-grey-90 px-4 py-3">
                <p className="text-xs font-semibold text-white uppercase tracking-wider">
                  {stage.stage_name}
                </p>
              </div>
            ))}

            {/* Emotion arc */}
            <div className="bg-white col-span-full px-2 border-b border-grey-20" style={{ gridColumn: '1 / -1' }}>
              <EmotionArc stages={stages} touchpointsByStage={touchpointsByStage} />
            </div>

            {/* Touchpoint columns */}
            {stages.map(stage => {
              const tps = touchpointsByStage[stage.stage_id] ?? [];
              return (
                <div key={stage.stage_id} className="bg-white p-3 space-y-2 min-h-24">
                  {tps.map(tp => (
                    <TouchpointCard
                      key={tp.touchpoint_id}
                      touchpoint={tp}
                      onClick={() => setSelectedTp(tp)}
                      isShared={(touchpointJourneyCount[tp.touchpoint_id] ?? 1) > 1}
                    />
                  ))}
                  {tps.length === 0 && (
                    <p className="text-xs text-grey-30 text-center py-4">—</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedTp && (
        <TouchpointModal
          touchpoint={selectedTp}
          stages={stages}
          personas={personas}
          onClose={() => setSelectedTp(null)}
        />
      )}
    </div>
  );
}

function JourneyMeta({ journey }: { journey: Journey }) {
  return (
    <div className="mb-6 p-4 bg-white border border-grey-20 rounded-xl">
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <p className="text-xs text-grey-40 uppercase tracking-wide mb-0.5">Duration</p>
          <p className="text-sm text-grey-70">{journey.typical_duration || '—'}</p>
        </div>
        {journey.description && (
          <div className="w-full">
            <p className="text-xs text-grey-40 uppercase tracking-wide mb-0.5">About</p>
            <p className="text-sm text-grey-60 leading-relaxed">{journey.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
