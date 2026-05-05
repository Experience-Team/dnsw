import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { CjmRowType } from '../types';

const ROW_TYPES: CjmRowType[] = ['Pain Point', 'Delight', 'Touchpoint', 'Device', 'Opportunity'];

const ROW_LABELS: Record<CjmRowType, string> = {
  'Pain Point':  'Pain Points',
  'Delight':     'Delights',
  'Touchpoint':  'Touchpoints',
  'Device':      'Device',
  'Opportunity': 'Opportunities',
};

const SEGMENTS = [
  'Local',
  'Intrastate',
  'Interstate',
  'Short-haul International',
  'Long-haul International',
];

type RowTheme = {
  emoji: string;
  headerBg: string;
  headerBorder: string;
  stageColors: string[];
  stageTextDark: string;
  darkTextFromIndex: number;
  cellEven: string;
  cellOdd: string;
  cellText: string;
  cellAlign?: 'center';
};

const ROW_THEMES: Record<CjmRowType, RowTheme> = {
  'Pain Point': {
    emoji: '😣',
    headerBg: '#f9e5ec',
    headerBorder: '#f9b6b6',
    stageColors: ['#c02158', '#dc477b', '#e887a9', '#f5c7d7', '#f7d4e0'],
    stageTextDark: '#c02158',
    darkTextFromIndex: 3,
    cellEven: '#f9e5ec',
    cellOdd: '#fbf1f4',
    cellText: '#2f0011',
  },
  'Delight': {
    emoji: '🙂',
    headerBg: '#e5faea',
    headerBorder: '#52c290',
    stageColors: ['#146727', '#1c9138', '#24bc48', '#3ad960', '#90eaa5'],
    stageTextDark: '#112c17',
    darkTextFromIndex: 3,
    cellEven: '#e5faea',
    cellOdd: '#f2fbf4',
    cellText: '#011606',
  },
  'Touchpoint': {
    emoji: '👆',
    headerBg: '#d8e7ff',
    headerBorder: '#2273e3',
    stageColors: ['#062e66', '#0d479a', '#115ac1', '#2273e3', '#b3d4ff'],
    stageTextDark: '#062e66',
    darkTextFromIndex: 4,
    cellEven: 'rgba(179,212,255,0.1)',
    cellOdd: 'rgba(34,115,227,0.1)',
    cellText: '#062e66',
  },
  'Device': {
    emoji: '📱',
    headerBg: '#d8e7ff',
    headerBorder: '#2273e3',
    stageColors: ['#062e66', '#0d479a', '#115ac1', '#2273e3', '#b3d4ff'],
    stageTextDark: '#062e66',
    darkTextFromIndex: 4,
    cellEven: 'rgba(179,212,255,0.1)',
    cellOdd: 'rgba(34,115,227,0.1)',
    cellText: '#062e66',
    cellAlign: 'center',
  },
  'Opportunity': {
    emoji: '💡',
    headerBg: '#d8e7ff',
    headerBorder: '#2273e3',
    stageColors: ['#062e66', '#0d479a', '#115ac1', '#2273e3', '#b3d4ff'],
    stageTextDark: '#062e66',
    darkTextFromIndex: 4,
    cellEven: 'rgba(179,212,255,0.1)',
    cellOdd: 'rgba(34,115,227,0.1)',
    cellText: '#062e66',
  },
};

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

  const grid = useMemo(() => {
    const g: Record<CjmRowType, Record<string, string[]>> = {
      'Pain Point':  {},
      'Delight':     {},
      'Touchpoint':  {},
      'Device':      {},
      'Opportunity': {},
    };
    filtered.forEach(e => {
      if (!g[e.row_type][e.stage_id]) g[e.row_type][e.stage_id] = [];
      g[e.row_type][e.stage_id].push(e.content);
    });
    return g;
  }, [filtered]);

  return (
    <div>
      {/* Filters */}
      <div className="sticky top-14 z-20 bg-blue-10 -mx-10 px-10 py-3 mb-5">
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
        <div className="flex flex-col gap-[72px]">
          {ROW_TYPES.map(rt => {
            const theme = ROW_THEMES[rt];
            return (
              <div key={rt}>
                {/* Category header */}
                <div
                  className="px-4 py-3 border-t text-[20px] font-bold text-blue-90"
                  style={{ backgroundColor: theme.headerBg, borderColor: theme.headerBorder }}
                >
                  {theme.emoji} {ROW_LABELS[rt]}
                </div>

                {/* Stage header row */}
                <div className="flex">
                  {stages.map((s, i) => {
                    const bg = theme.stageColors[i] ?? theme.stageColors[theme.stageColors.length - 1];
                    const color = i < theme.darkTextFromIndex ? '#f0f6ff' : theme.stageTextDark;
                    return (
                      <div
                        key={s.stage_id}
                        className="flex-1 min-w-[200px] h-[26px] flex items-center justify-center text-base font-bold"
                        style={{ backgroundColor: bg, color }}
                      >
                        {s.stage_name}
                      </div>
                    );
                  })}
                </div>

                {/* Content rows — items align across stages */}
                {(() => {
                  const maxRows = Math.max(0, ...stages.map(s => (grid[rt][s.stage_id] ?? []).length));
                  return (
                    <div className="border-b" style={{ borderColor: theme.headerBorder }}>
                      {Array.from({ length: maxRows }).map((_, rowIdx) => (
                        <div key={rowIdx} className="flex">
                          {stages.map((s, i) => {
                            const content = (grid[rt][s.stage_id] ?? [])[rowIdx];
                            const bg = i % 2 === 0 ? theme.cellEven : theme.cellOdd;
                            return (
                              <div
                                key={s.stage_id}
                                className={`flex-1 min-w-[200px] px-4 py-5${theme.cellAlign === 'center' ? ' text-center' : ''}`}
                                style={{ backgroundColor: bg, color: theme.cellText }}
                              >
                                {content && <p className="text-base leading-snug">{content}</p>}
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
