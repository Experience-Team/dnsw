import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import TouchpointCard from '../components/TouchpointCard';
import TouchpointModal from '../components/TouchpointModal';
import EmotionArc from '../components/EmotionArc';
import type { Touchpoint, JourneyStage } from '../types';

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-grey-50 shrink-0">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border border-grey-20 rounded-lg px-3 py-1.5 text-sm text-grey-80 bg-white
                   focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function JourneyMapView() {
  const { data, siteFilter } = useAppContext();
  const [personaFilter, setPersonaFilter]   = useState('');
  const [segmentFilter, setSegmentFilter]   = useState('');
  const [selectedTp, setSelectedTp]         = useState<Touchpoint | null>(null);

  if (!data) return null;

  const { stages, touchpoints, personas } = data;

  // Build persona & segment options
  const personaOptions = useMemo(() => {
    const opts = [{ label: 'All personas', value: '' }];
    personas
      .filter(p => siteFilter === 'both' || p.site === siteFilter)
      .forEach(p => opts.push({ label: p.name, value: p.persona_id }));
    return opts;
  }, [personas, siteFilter]);

  const segmentOptions = useMemo(() => {
    const segs = [...new Set(personas.map(p => p.segment).filter(Boolean))].sort();
    return [
      { label: 'All segments', value: '' },
      ...segs.map(s => ({ label: s, value: s })),
    ];
  }, [personas]);

  // Filter touchpoints
  const filtered = useMemo(() => {
    return touchpoints.filter(tp => {
      if (siteFilter !== 'both' && tp.site !== siteFilter) return false;
      if (personaFilter && !tp.persona_ids.includes(personaFilter)) return false;
      if (segmentFilter) {
        const matchedPersonas = personas.filter(
          p => tp.persona_ids.includes(p.persona_id) && p.segment === segmentFilter
        );
        if (matchedPersonas.length === 0) return false;
      }
      return true;
    });
  }, [touchpoints, siteFilter, personaFilter, segmentFilter, personas]);

  // Group by stage
  const touchpointsByStage = useMemo(() => {
    const map: Record<string, Touchpoint[]> = {};
    stages.forEach(s => { map[s.stage_id] = []; });
    filtered.forEach(tp => {
      if (!map[tp.stage_id]) map[tp.stage_id] = [];
      map[tp.stage_id].push(tp);
    });
    return map;
  }, [filtered, stages]);

  const emotionLegend = [
    { label: 'Positive',   bg: 'bg-green-40'  },
    { label: 'Neutral',    bg: 'bg-grey-30'   },
    { label: 'Negative',   bg: 'bg-yellow-40' },
    { label: 'Frustrated', bg: 'bg-red-40'    },
  ];

  return (
    <div>
      {/* Title + filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="mr-2">
          <h1 className="text-2xl font-bold text-grey-90">Journey Map</h1>
          <p className="text-sm text-grey-50 mt-0.5">Each column is a journey stage. Cards show touchpoints colour-coded by traveller emotion.</p>
        </div>
        <FilterSelect
          label="Persona:"
          value={personaFilter}
          onChange={setPersonaFilter}
          options={personaOptions}
        />
        <FilterSelect
          label="Segment:"
          value={segmentFilter}
          onChange={setSegmentFilter}
          options={segmentOptions}
        />

        {/* Legend */}
        <div className="flex items-center gap-3 ml-auto">
          {emotionLegend.map(e => (
            <span key={e.label} className="flex items-center gap-1.5 text-xs text-grey-50">
              <span className={`w-2.5 h-2.5 rounded-full ${e.bg}`} />
              {e.label}
            </span>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-grey-40">
          No touchpoints match the current filters.
        </div>
      ) : (
        <SwimLane
          stages={stages}
          touchpointsByStage={touchpointsByStage}
          onSelect={setSelectedTp}
        />
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

function SwimLane({
  stages,
  touchpointsByStage,
  onSelect,
}: {
  stages: JourneyStage[];
  touchpointsByStage: Record<string, Touchpoint[]>;
  onSelect: (tp: Touchpoint) => void;
}) {
  const colWidth = Math.max(200, Math.floor(900 / Math.max(stages.length, 1)));

  return (
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
            {stage.description && (
              <p className="text-xs text-grey-40 mt-0.5 leading-snug line-clamp-2">
                {stage.description}
              </p>
            )}
          </div>
        ))}

        {/* Emotion arc row — spans all columns */}
        <div
          className="bg-white col-span-full px-2 border-b border-grey-20"
          style={{ gridColumn: `1 / -1` }}
        >
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
                  onClick={() => onSelect(tp)}
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
  );
}
