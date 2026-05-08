import { useState, useMemo, type ReactNode } from 'react';
import { useAppContext } from '../context/AppContext';
import type { UjmEntry, UjmLayer, UjmRowType } from '../types';
import { DeviceIcon } from '../icons/DeviceIcon';
import { SiInstagram, SiGoogle, SiPinterest, SiBookingdotcom, SiAirbnb, SiFacebook, SiReddit, SiTripadvisor } from '@icons-pack/react-simple-icons';
import { Star, MessageCircle, MousePointer2, Mail, SignpostBig, Home, Key, Map, Globe, Bell, Plug, Newspaper, StickyNote, Table2, Sparkles } from 'lucide-react';

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
  'Mindset',
  'Goals',
  'Actions',
  'Touchpoints',
  'Pain Points',
  // 'Delights',
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
  headerBg: '#f0f6ff',
  headerBorder: '#b3d4ff',
  headerColor: '#062e66',
  stageColors: ['#0d479a', '#0d479a', '#0d479a', '#0d479a', '#0d479a', '#0d479a'],
  stageTextDark: '#062e66',
  darkTextFromIndex: 6,
  cellEven: '#ffffff',
  cellOdd: '#ffffff',
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
    stageColors: ['#c02158', '#c02158', '#c02158', '#c02158', '#c02158', '#c02158'],
    stageTextDark: '#c02158',
    darkTextFromIndex: 6,
    cellEven: '#ffffff',
    cellOdd: '#ffffff',
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
  'day-out':         { bg: '#fffae3', color: '#9e3900' },
  'weekend-away':    { bg: '#EDE9FE', color: '#5B21B6' },
  'road-trip':       { bg: '#D1FAE5', color: '#065F46' },
  'intl-multi-stop': { bg: '#CFFAFE', color: '#164E63' },
};

const TRIP_LAYERS: UjmLayer[] = ['day-out', 'weekend-away', 'road-trip', 'intl-multi-stop'];

// ── Touchpoint icon helper ────────────────────────────────────────────────────

function getTouchpointIcon(content: string) {
  const c = content.toLowerCase();
  // Specific brands first
  if (c.includes('booking.com'))                                                     return <SiBookingdotcom size={14} />;
  if (c.includes('airbnb'))                                                          return <SiAirbnb size={14} />;
  if (c.includes('stayz'))                                                           return <Home size={14} />;
  if (c.includes('direct property') || c.includes('direct booking'))                return <Key size={14} />;
  if (c.includes('chatgpt') || c.includes('openai') || c.includes('gpt'))          return <Sparkles size={14} />;
  if (c.includes('lonely planet'))                                                   return <Globe size={14} />;
  if (c.includes('reddit'))                                                          return <SiReddit size={14} />;
  if (c.includes('tripadvisor'))                                                     return <SiTripadvisor size={14} />;
  if (c.includes('google maps') || c.includes('maps'))                              return <Map size={14} />;
  if (c.includes('facebook'))                                                        return <SiFacebook size={14} />;
  if (c.includes('pinterest'))                                                       return <SiPinterest size={14} />;
  if (c.includes('instagram') || c.includes('social media') || c.includes('tiktok') || c.includes('youtube'))
                                                                                     return <SiInstagram size={14} />;
  if (c.includes('google') || c.includes('search engine') || c.includes('search')) return <SiGoogle size={14} />;
  if (c.includes('review') || c.includes('rating') || c.includes('star'))          return <Star size={14} />;
  if (c.includes('word of mouth') || c.includes('word-of-mouth') || c.includes('wom') || c.includes('recommendation') || c.includes('referred'))
                                                                                     return <MessageCircle size={14} />;
  if (c.includes('signage'))                                                         return <SignpostBig size={14} />;
  if (c.includes('email'))                                                           return <Mail size={14} />;
  if (c.includes('concierge'))                                                       return <Bell size={14} />;
  if (c.includes('ev charging') || c.includes('charging app'))                      return <Plug size={14} />;
  if (c.includes('time out') || c.includes('broadsheet') || c.includes('concrete playground'))
                                                                                     return <Newspaper size={14} />;
  if (c.includes('notes app') || c.includes('notes app'))                           return <StickyNote size={14} />;
  if (c.includes('excel') || c.includes('google sheets') || c.includes('spreadsheet'))
                                                                                     return <Table2 size={14} />;
  return <MousePointer2 size={14} />;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PillButton({
  label,
  active,
  onClick,
  activeStyle,
  className: extraClass = '',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  activeStyle?: { bg: string; color: string };
  className?: string;
}) {
  const inlineStyle = active && activeStyle
    ? { backgroundColor: activeStyle.bg, color: activeStyle.color, borderColor: `${activeStyle.color}80` }
    : undefined;
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      style={inlineStyle}
      className={`text-base px-4 py-1 rounded-full border border-[#d0e5ff] transition-all ${active && !activeStyle ? 'bg-blue-30 text-blue-90' : !active ? 'bg-white text-blue-90' : ''} ${extraClass}`}
    >
      {label}
    </button>
  );
}

function EntryCard({ entry, cellText, bulleted, showLayerPill = true, icon, hideDevice = false, showImage = false }: { entry: UjmEntry; cellText: string; bulleted?: boolean; showLayerPill?: boolean; icon?: ReactNode; hideDevice?: boolean; showImage?: boolean }) {
  const { bg, color } = LAYER_PILL_STYLE[entry.layer];
  const showDevice = !!entry.device && !icon && !hideDevice;
  const hasMeta = (showLayerPill && entry.layer !== 'universal') || showDevice;
  return (
    <div className="text-base leading-snug" style={{ color: cellText }}>
      {showImage && entry.image_url && (
        <img
          src={entry.image_url}
          alt=""
          loading="lazy"
          className="w-full aspect-square object-cover rounded-lg mb-2"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      {hasMeta && (
        <div className="mb-1">
          {showLayerPill && entry.layer !== 'universal' && (
            <span
              className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mr-1"
              style={{ backgroundColor: bg, color }}
            >
              {LAYER_PILL_LABELS[entry.layer]}
            </span>
          )}
          {showDevice && (
            <span className="flex items-center gap-0.5 text-current">
              <DeviceIcon device={entry.device} size={14} />
            </span>
          )}
        </div>
      )}
      {bulleted ? (
        <div className="flex items-start gap-1">
          <span className="shrink-0">•</span>
          <span className="flex-1 min-w-0">{entry.content}</span>
        </div>
      ) : icon ? (
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 opacity-60">{icon}</span>
          <span>{entry.content}</span>
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
  const [segmentFilter, setSegmentFilter] = useState<string>('');

  if (!data) return null;
  const { ujmEntries } = data;

  function toggleLayer(layer: UjmLayer) {
    setActiveLayer(prev => (prev === layer ? null : layer));
  }

  const HIDDEN_SEGMENTS = new Set(['interstate', 'intl-long-haul']);
  const segments = useMemo(() =>
    [...new Set(ujmEntries.map(e => e.segment).filter(s => s && s !== 'all' && !HIDDEN_SEGMENTS.has(s)))].sort(),
    [ujmEntries]
  );

  const filtered = useMemo(() =>
    ujmEntries.filter(e => {
      const layerMatch = e.layer === 'universal' || e.layer === activeLayer;
      if (!layerMatch) return false;
      return e.segment === 'all' || e.segment === segmentFilter;
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
    <div className="bg-white -mx-10 -my-6 px-10 py-6 min-h-[calc(100vh-3.5rem)]">
      {/* ── Description (non-sticky, scrolls away) ── */}
      <p className="text-base text-blue-90 mb-0">
        Choose a user group to explore their goals and actions. The universal journey applies to everyone, regardless of group.
      </p>

      {/* ── Filters (sticky) ── */}
      <div className="sticky top-14 z-20 bg-white -mx-10 px-10 py-3 mb-5 flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="text-base px-4 py-1 rounded-full border border-[#d0e5ff] bg-blue-30 text-blue-90 opacity-60 cursor-default"
          >
            Universal
          </button>
          {TRIP_LAYERS.map(layer => (
            <PillButton
              key={layer}
              label={LAYER_LABELS[layer]}
              active={activeLayer === layer}
              activeStyle={LAYER_PILL_STYLE[layer]}
              onClick={() => toggleLayer(layer)}
            />
          ))}
        </div>
        {segments.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {segments.map(seg => (
              <PillButton
                key={seg}
                label={seg.charAt(0).toUpperCase() + seg.slice(1)}
                active={segmentFilter === seg}
                onClick={() => setSegmentFilter(prev => prev === seg ? '' : seg)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div className="overflow-x-auto pb-4">
        <div className="flex flex-col gap-8">
          {UJM_ROW_TYPES.map(rowType => {
            const theme = ROW_THEMES[rowType];
            return (
              <div key={rowType} className="rounded-2xl overflow-hidden">
                {/* Swim lane header */}
                <div
                  className="px-4 py-3 text-[20px] font-bold"
                  style={{
                    backgroundColor: theme.headerBg,
                    borderColor: theme.headerBorder,
                    color: theme.headerColor,
                  }}
                >
                  {theme.emoji} {rowType}
                </div>

                {/* Stage headers */}
                <div className="flex gap-px">
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

                {/* Content rows — universal row + optional active-layer row */}
                {(() => {
                  const isBulleted = rowType === 'Goals' || rowType === 'Actions';
                  const hasLayerRow = activeLayer && UJM_STAGES.some(
                    s => (grid[rowType][s] ?? []).some(e => e.layer === activeLayer)
                  );
                  return (
                    <>
                      {/* Universal row */}
                      <div className="flex">
                        {UJM_STAGES.map((stage, i) => {
                          const entries = (grid[rowType][stage] ?? []).filter(e => e.layer === 'universal');
                          const bg = i % 2 === 0 ? theme.cellEven : theme.cellOdd;
                          return (
                            <div
                              key={stage}
                              className="flex-1 min-w-[200px] px-4 py-5 flex flex-col gap-2"
                              style={{ backgroundColor: bg }}
                            >
                              {entries.map((entry, idx) => (
                                <EntryCard key={idx} entry={entry} cellText={theme.cellText} bulleted={isBulleted} showLayerPill={false} icon={rowType === 'Touchpoints' ? getTouchpointIcon(entry.content) : undefined} hideDevice={rowType === 'Pain Points'} showImage={rowType === 'Mindset'} />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                      {/* Active layer row */}
                      {hasLayerRow && activeLayer && (
                        <div className="flex">
                          {UJM_STAGES.map(stage => {
                            const entries = (grid[rowType][stage] ?? []).filter(e => e.layer === activeLayer);
                            const layerStyle = LAYER_PILL_STYLE[activeLayer];
                            return (
                              <div
                                key={stage}
                                className="flex-1 min-w-[200px] px-4 py-5 flex flex-col gap-2"
                                style={{ backgroundColor: layerStyle.bg }}
                              >
                                {entries.map((entry, idx) => (
                                  <EntryCard key={idx} entry={entry} cellText={layerStyle.color} bulleted={isBulleted} showLayerPill={false} icon={rowType === 'Touchpoints' ? getTouchpointIcon(entry.content) : undefined} hideDevice={rowType === 'Pain Points'} showImage={rowType === 'Mindset'} />
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
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
