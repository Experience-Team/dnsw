import { useState, useEffect, useMemo } from 'react';
import { fetchQuotes } from '../services/sheets';
import type { QuoteEntry } from '../services/sheets';

const SEGMENTS = [
  'Local',
  'Intrastate',
  'Interstate',
  'Short-haul International',
  'Long-haul International',
];

const SENTIMENTS = ['All', 'Positive', 'Neutral', 'Negative'] as const;

const SENTIMENT_BADGE: Record<string, string> = {
  Positive: 'bg-green-20 text-green-80',
  Neutral:  'bg-grey-20 text-grey-70',
  Negative: 'bg-red-20 text-red-70',
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

function QuoteCard({
  quote,
  activeTheme,
  onThemeClick,
}: {
  quote: QuoteEntry;
  activeTheme: string;
  onThemeClick: (theme: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const themes = quote.themes
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  return (
    <div className="bg-blue-20 rounded-xl p-5 relative flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="absolute top-4 right-4 text-blue-80 text-xs leading-none select-none"
        aria-label={expanded ? 'Collapse' : 'Expand'}
      >
        {expanded ? '▲' : '▼'}
      </button>

      {/* Quote */}
      <blockquote className="text-blue-90 text-base leading-relaxed pr-6 italic">
        "{quote.quote}"
      </blockquote>

      {/* Sentiment badge */}
      {quote.sentiment && (
        <span
          className={`self-start text-xs font-medium px-2.5 py-1 rounded-full ${
            SENTIMENT_BADGE[quote.sentiment] ?? 'bg-blue-10 text-blue-90'
          }`}
        >
          {quote.sentiment}
        </span>
      )}

      {/* Theme tags */}
      {themes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {themes.map(theme => (
            <button
              key={theme}
              type="button"
              onClick={() => onThemeClick(theme)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                activeTheme === theme
                  ? 'bg-blue-80 text-white'
                  : 'bg-white text-blue-90 hover:bg-blue-30'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-blue-30 pt-3 flex flex-col gap-1.5 text-sm text-blue-90">
          {quote.segment     && <div><span className="font-semibold">Segment: </span>{quote.segment}</div>}
          {quote.stage       && <div><span className="font-semibold">Stage: </span>{quote.stage}</div>}
          {quote.travel_party && <div><span className="font-semibold">Travel party: </span>{quote.travel_party}</div>}
          {quote.trip_context && <div><span className="font-semibold">Trip context: </span>{quote.trip_context}</div>}
        </div>
      )}
    </div>
  );
}

export default function GapsDashboard() {
  const [quotes, setQuotes]               = useState<QuoteEntry[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [segmentFilter, setSegmentFilter] = useState('');
  const [sentimentFilter, setSentiment]   = useState('All');
  const [themeFilter, setThemeFilter]     = useState('');

  useEffect(() => {
    fetchQuotes()
      .then(setQuotes)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load quotes.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    quotes.filter(q => {
      const segmentMatch =
        segmentFilter === '' ||
        q.segment.trim().toLowerCase() === 'all' ||
        q.segment.split(',').map(s => s.trim().toLowerCase()).includes(segmentFilter.toLowerCase());
      const sentimentMatch =
        sentimentFilter === 'All' || q.sentiment === sentimentFilter;
      const themeMatch =
        themeFilter === '' ||
        q.themes.split(',').map(t => t.trim()).includes(themeFilter);
      return segmentMatch && sentimentMatch && themeMatch;
    }),
    [quotes, segmentFilter, sentimentFilter, themeFilter]
  );

  const handleThemeClick = (theme: string) =>
    setThemeFilter(v => v === theme ? '' : theme);

  if (loading) return (
    <div className="py-16 text-center text-blue-90/40">Loading quotes…</div>
  );

  if (error) return (
    <div className="py-16 text-center text-red-60">{error}</div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-90">Quote Bank</h1>
        <p className="text-sm text-blue-90/60 mt-0.5">Participant quotes from user research.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-90 w-20 shrink-0 leading-10">Segment</span>
          <div className="flex gap-4 flex-wrap">
            <PillButton
              label="All"
              active={segmentFilter === ''}
              onClick={() => setSegmentFilter('')}
            />
            {SEGMENTS.map(seg => (
              <PillButton
                key={seg}
                label={seg}
                active={segmentFilter === seg}
                onClick={() => setSegmentFilter(v => v === seg ? '' : seg)}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-90 w-20 shrink-0 leading-10">Sentiment</span>
          <div className="flex gap-4 flex-wrap">
            {SENTIMENTS.map(s => (
              <PillButton
                key={s}
                label={s}
                active={sentimentFilter === s}
                onClick={() => setSentiment(s)}
              />
            ))}
          </div>
        </div>
        {themeFilter && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-90 w-20 shrink-0">Theme</span>
            <div className="flex items-center gap-2">
              <span className="bg-blue-80 text-white text-xs px-2.5 py-1 rounded-full">
                {themeFilter}
              </span>
              <button
                type="button"
                onClick={() => setThemeFilter('')}
                className="text-xs text-blue-80 hover:text-blue-90 underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-blue-90/40">
          No quotes match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(q => (
            <QuoteCard
              key={q.quote_id || q.quote}
              quote={q}
              activeTheme={themeFilter}
              onThemeClick={handleThemeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
