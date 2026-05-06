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

// ── Row-type themes (mirrors CJM, extended to 6 stages) ──────────────────────

type SwimLaneTheme = {
  emoji: string;
  headerBg: string;
  headerBorder: string;
  headerColor: string;
  stageColors: string[];
  stageTextDark: string;
  darkTextFromIndex: number;
  cellEven: string;
  cellOdd: string;
  cellText: string;
};

const BLUE_THEME: Omit<SwimLaneTheme, 'emoji'> = {
  headerBg: '#d8e7ff',
  headerBorder: '#b3d4ff',
  headerColor: '#062e66',
  stageColors: ['#062e66', '#0d479a', '#115ac1', '#2273e3', '#4e95fa', '#b3d4ff'],
  stageTextDark: '#062e66',
  darkTextFromIndex: 5,
  cellEven: 'rgba(179,212,255,0.1)',
  cellOdd: 'rgba(34,115,227,0.1)',
  cellText: '#062e66',
};

const ROW_THEMES: Record<UjmRowType, SwimLaneTheme> = {
  'Goals':         { emoji: '🎯', ...BLUE_THEME },
  'Actions':       { emoji: '⚡', ...BLUE_THEME },
  'Mindset':       { emoji: '💭', ...BLUE_THEME },
  'Touchpoints':   { emoji: '👆', ...BLUE_THEME },
  'Pain Points': {
    emoji: '😣',
    headerBg: '#f9e5ec',
    headerBorder: '#f9b6b6',
    headerColor: '#c02158',
    stageColors: ['#c02158', '#d4326a', '#dc477b', '#e887a9', '#f5c7d7', '#f7d4e0'],
    stageTextDark: '#c02158',
    darkTextFromIndex: 4,
    cellEven: '#f9e5ec',
    cellOdd: '#fbf1f4',
    cellText: '#2f0011',
  },
  'Delights': {
    emoji: '🙂',
    headerBg: '#e5faea',
    headerBorder: '#52c290',
    headerColor: '#146727',
    stageColors: ['#146727', '#186e2a', '#1c9138', '#24bc48', '#3ad960', '#90eaa5'],
    stageTextDark: '#112c17',
    darkTextFromIndex: 4,
    cellEven: '#e5faea',
    cellOdd: '#f2fbf4',
    cellText: '#011606',
  },
  'Opportunities': { emoji: '💡', ...BLUE_THEME },
};

// ── Layer config ──────────────────────────────────────────────────────────────

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

function EntryCard({ entry, cellText, bulleted }: { entry: UjmEntry; cellText: string; bulleted?: boolean }) {
  const { bg, color } = LAYER_PILL_STYLE[entry.layer];
  const hasMeta = entry.layer !== 'universal' || !!entry.device;
  return (
    <div className="text-base leading-snug" style={{ color: cellText }}>
      {hasMeta && (
        <div className="mb-1">
          {entry.layer !== 'universal' && (
            <span
              className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mr-1"
              style={{ backgroundColor: bg, color }}
            >
              {LAYER_PILL_LABELS[entry.layer]}
            </span>
          )}
          {entry.device && (
            <span className="text-sm">{DEVICE_ICON[entry.device]}</span>
          )}
        </div>
      )}
      {bulleted ? (
        <div className="flex items-start gap-1">
          <span className="shrink-0">•</span>
          <span className="flex-1 min-w-0">{entry.content}</span>
        </div>
      ) : (
        entry.content
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function UserJourneyMapView() {
  const { data } = useAppContext();

  const [activeLayer, setActiveLayer] = useState<UjmLayer | null>(null);
  const [segmentFilter] = useState<string>('all');

  if (!data) return null;
  const { ujmEntries } = data;

  function toggleLayer(layer: UjmLayer) {
    setActiveLayer(prev => (prev === layer ? null : layer));
  }

  const filtered = useMemo(() =>
    ujmEntries.filter(e => {
      const layerMatch = e.layer === 'universal' || e.layer === activeLayer;
      if (!layerMatch) return false;
      if (segmentFilter === 'all') return true;
      const seg = e.segment.toLowerCase();
      return seg === 'all' || seg === segmentFilter;
    }),
    [ujmEntries, activeLayer, segmentFilter]
  );

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
          <div className="flex items-center gap-4">
            <span className="text-base text-blue-90 shrink-0 w-20">Layer</span>
            <div className="flex gap-2 flex-wrap">
              <PillButton label="Universal" active disabled onClick={() => {}} />
              {TRIP_LAYERS.map(layer => (
                <PillButton
                  key={layer}
                  label={LAYER_LABELS[layer]}
                  active={activeLayer === layer}
                  onClick={() => toggleLayer(layer)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="overflow-x-auto pb-4">
        <div className="flex flex-col gap-[72px]">
          {UJM_ROW_TYPES.map(rowType => {
            const theme = ROW_THEMES[rowType];
            return (
              <div key={rowType}>
                {/* Swim lane header */}
                <div
                  className="px-4 py-3 border-t text-[20px] font-bold"
                  style={{
                    backgroundColor: theme.headerBg,
                    borderColor: theme.headerBorder,
                    color: theme.headerColor,
                  }}
                >
                  {theme.emoji} {rowType}
                </div>

                {/* Stage headers */}
                <div className="flex">
                  {UJM_STAGES.map((stage, i) => {
                    const bg = theme.stageColors[i] ?? theme.stageColors[theme.stageColors.length - 1];
                    const color = i < theme.darkTextFromIndex ? '#f0f6ff' : theme.stageTextDark;
                    return (
                      <div
                        key={stage}
                        className="flex-1 min-w-[200px] h-[26px] flex items-center justify-center text-base font-bold"
                        style={{ backgroundColor: bg, color }}
                      >
                        {stage}
                      </div>
                    );
                  })}
                </div>

                {/* Content rows — grouped for Goals/Actions, per-entry for all others */}
                {(() => {
                  const isGrouped = rowType === 'Goals' || rowType === 'Actions';

                  if (isGrouped) {
                    return (
                      <div className="border-b flex" style={{ borderColor: theme.headerBorder }}>
                        {UJM_STAGES.map((stage, i) => {
                          const entries = grid[rowType][stage] ?? [];
                          const bg = i % 2 === 0 ? theme.cellEven : theme.cellOdd;
                          return (
                            <div
                              key={stage}
                              className="flex-1 min-w-[200px] px-4 py-1 flex flex-col"
                              style={{ backgroundColor: bg }}
                            >
                              {entries.map((entry, idx) => (
                                <EntryCard key={idx} entry={entry} cellText={theme.cellText} bulleted />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  const maxRows = Math.max(0, ...UJM_STAGES.map(s => (grid[rowType][s] ?? []).length));
                  return (
                    <div className="border-b" style={{ borderColor: theme.headerBorder }}>
                      {Array.from({ length: maxRows }).map((_, rowIdx) => (
                        <div key={rowIdx} className="flex">
                          {UJM_STAGES.map((stage, i) => {
                            const entry = (grid[rowType][stage] ?? [])[rowIdx];
                            const bg = i % 2 === 0 ? theme.cellEven : theme.cellOdd;
                            return (
                              <div
                                key={stage}
                                className="flex-1 min-w-[200px] px-4 py-1"
                                style={{ backgroundColor: bg }}
                              >
                                {entry && <EntryCard entry={entry} cellText={theme.cellText} bulleted={false} />}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
