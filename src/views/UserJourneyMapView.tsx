import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { UjmEntry, UjmLayer, UjmRowType } from '../types';

// ── Constants ─────────────────────────────────────────────────────────────────

const UJM_STAGES = [
  'Awareness',
  'Consideration',
  'Plan',
  'Book',
  'Experience',
  'Post-experience',
];

const UJM_ROW_TYPES: UjmRowType[] = [
  'Goals',
  'Actions',
  'Mindset',
  'Touchpoints',
  'Pain Points',
  'Delights',
  'Opportunities',
];

const LAYER_LABELS: Record<UjmLayer, string> = {
  'universal':       'Universal',
  'day-out':         'Day out / event in Sydney',
  'weekend-away':    'Short break / weekend away',
  'road-trip':       'Multi-day road trip',
  'intl-multi-stop': 'International multi-stop holiday',
};

const LAYER_PILL_LABELS: Record<UjmLayer, string> = {
  'universal':       '',
  'day-out':         'Day out',
  'weekend-away':    'Weekend away',
  'road-trip':       'Road trip',
  'intl-multi-stop': 'International',
};

// Accent colour per trip-type layer
const LAYER_PILL_STYLE: Record<UjmLayer, { bg: string; color: string }> = {
  'universal':       { bg: '',        color: ''        },
  'day-out':         { bg: '#FEF3C7', color: '#92400E' },
  'weekend-away':    { bg: '#EDE9FE', color: '#5B21B6' },
  'road-trip':       { bg: '#D1FAE5', color: '#065F46' },
  'intl-multi-stop': { bg: '#CFFAFE', color: '#164E63' },
};

const DEVICE_ICON: Record<string, string> = {
  desktop: '💻',
  mobile:  '📱',
  both:    '💻 📱',
};

const SEGMENTS = [
  { value: 'all',          label: 'All' },
  { value: 'local',        label: 'Local' },
  { value: 'intrastate',   label: 'Intrastate' },
  { value: 'interstate',   label: 'Interstate' },
  { value: 'intl-short-haul', label: 'Short-haul international' },
  { value: 'intl-long-haul',  label: 'Long-haul international' },
];

const TRIP_LAYERS: UjmLayer[] = ['day-out', 'weekend-away', 'road-trip', 'intl-multi-stop'];

// ── Sub-components ────────────────────────────────────────────────────────────

function PillButton({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`
        text-base text-blue-90 px-4 py-1 rounded-full transition-all
        ${active ? 'bg-blue-30' : 'bg-white'}
        ${disabled ? 'opacity-60 cursor-default' : ''}
      `}
    >
      {label}
    </button>
  );
}

function LayerPill({ layer }: { layer: UjmLayer }) {
  if (layer === 'universal') return null;
  const { bg, color } = LAYER_PILL_STYLE[layer];
  return (
    <span
      className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1.5"
      style={{ backgroundColor: bg, color }}
    >
      {LAYER_PILL_LABELS[layer]}
    </span>
  );
}

function EntryCard({ entry }: { entry: UjmEntry }) {
  return (
    <div className="bg-white rounded px-3 py-3 text-base text-blue-90 leading-snug">
      <LayerPill layer={entry.layer} />
      {entry.device && (
        <span className="text-sm mr-1.5">{DEVICE_ICON[entry.device]}</span>
      )}
      {entry.content}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function UserJourneyMapView() {
  const { data } = useAppContext();

  const [activeLayers, setActiveLayers] = useState<Set<UjmLayer>>(new Set());
  const [segmentFilter, setSegmentFilter] = useState<string>('all');

  if (!data) return null;
  const { ujmEntries } = data;

  // Build stage → description map from data
  const stageDescriptions = useMemo(() => {
    const map: Record<string, string> = {};
    ujmEntries.forEach(e => {
      if (e.stage_description && !map[e.stage]) {
        map[e.stage] = e.stage_description;
      }
    });
    return map;
  }, [ujmEntries]);

  function toggleLayer(layer: UjmLayer) {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer); else next.add(layer);
      return next;
    });
  }

  const filtered = useMemo(() =>
    ujmEntries.filter(e => {
      // Layer: universal always shown; others shown only if toggled on
      const layerMatch = e.layer === 'universal' || activeLayers.has(e.layer);
      if (!layerMatch) return false;

      // Segment: 'all' → only segment=all rows; specific → segment=all OR exact match
      const seg = e.segment.toLowerCase();
      const segmentMatch =
        segmentFilter === 'all'
          ? seg === 'all'
          : seg === 'all' || seg === segmentFilter;
      return segmentMatch;
    }),
    [ujmEntries, activeLayers, segmentFilter]
  );

  // grid[rowType][stage] = UjmEntry[]
  const grid = useMemo(() => {
    const g: Record<UjmRowType, Record<string, UjmEntry[]>> = {
      'Goals': {}, 'Actions': {}, 'Mindset': {}, 'Touchpoints': {},
      'Pain Points': {}, 'Delights': {}, 'Opportunities': {},
    };
    filtered.forEach(e => {
      if (!g[e.row_type][e.stage]) g[e.row_type][e.stage] = [];
      g[e.row_type][e.stage].push(e);
    });
    return g;
  }, [filtered]);

  return (
    <div>
      {/* ── Filters ── */}
      <div className="sticky top-14 z-20 bg-blue-10 -mx-10 px-10 py-3 mb-5">
        <div className="flex flex-col gap-2">
          {/* Layer filter */}
          <div className="flex items-center gap-4">
            <span className="text-base text-blue-90 shrink-0 w-20">Layer</span>
            <div className="flex gap-2 flex-wrap">
              {/* Universal — always active, not toggleable */}
              <PillButton
                label="Universal"
                active
                disabled
                onClick={() => {}}
              />
              {TRIP_LAYERS.map(layer => (
                <PillButton
                  key={layer}
                  label={LAYER_LABELS[layer]}
                  active={activeLayers.has(layer)}
                  onClick={() => toggleLayer(layer)}
                />
              ))}
            </div>
          </div>
          {/* Segment filter */}
          <div className="flex items-center gap-4">
            <span className="text-base text-blue-90 shrink-0 w-20">Audience</span>
            <div className="flex gap-2 flex-wrap">
              {SEGMENTS.map(({ value, label }) => (
                <PillButton
                  key={value}
                  label={label}
                  active={segmentFilter === value}
                  onClick={() => setSegmentFilter(value)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="overflow-x-auto pb-4">
        <table className="border-collapse">
          <thead>
            <tr>
              {/* Empty corner above swim lane labels */}
              <th className="sticky left-0 z-20 bg-blue-10 w-28 min-w-28" />
              {UJM_STAGES.map(stage => (
                <th
                  key={stage}
                  className="align-top min-w-[220px] px-[3px] pb-3 font-normal"
                >
                  <div className="bg-blue-20 w-full text-center text-[18px] leading-10 text-blue-90">
                    {stage}
                  </div>
                  {stageDescriptions[stage] && (
                    <p className="text-[12px] font-light text-blue-90 leading-[15.5px] mt-1 text-left">
                      {stageDescriptions[stage]}
                    </p>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {UJM_ROW_TYPES.map((rowType, rowIdx) => (
              <tr key={rowType}>
                {/* Swim lane label — sticky left */}
                <td
                  className={`sticky left-0 z-10 bg-blue-10 pr-4 align-top w-28 min-w-28 ${
                    rowIdx > 0 ? 'pt-16' : ''
                  }`}
                >
                  <span className="text-base text-blue-90 whitespace-nowrap font-medium">
                    {rowType}
                  </span>
                </td>
                {/* Stage cells */}
                {UJM_STAGES.map(stage => {
                  const entries = grid[rowType][stage] ?? [];
                  return (
                    <td
                      key={stage}
                      className={`align-top px-[3px] ${rowIdx > 0 ? 'pt-16' : ''}`}
                    >
                      <div className="flex flex-col gap-2">
                        {entries.map((entry, i) => (
                          <EntryCard key={i} entry={entry} />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
