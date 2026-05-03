import { useEffect, useMemo, useState } from 'react';
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

function QuoteCard({
  quote,
  activeTheme,
  onThemeClick,
}: {
  quote: QuoteEntry;
  activeTheme: string;
  onThemeClick: (theme: string) => void;
}) {
  const themes = quote.themes
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  return (
    <div className="bg-white rounded-xl p-5 flex flex-col gap-4">
      {/* Quote */}
      <blockquote className="text-blue-90 text-base leading-relaxed">
        "{quote.quote}"
      </blockquote>

      {/* Context */}
      {quote.trip_context && (
        <p className="text-base text-blue-90">
          <span className="font-bold">Context: </span>{quote.trip_context}
        </p>
      )}

      {/* Theme tags */}
      {themes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {themes.map(theme => (
            <button
              key={theme}
              type="button"
              onClick={() => onThemeClick(theme)}
              className={`text-base px-2.5 py-1 rounded-full transition-all ${
                activeTheme === theme
                  ? 'bg-blue-80 text-white'
                  : 'bg-grey-10 text-blue-90 hover:bg-grey-20'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      )}

      {/* Metadata strip */}
      {(quote.segment || quote.stage || quote.travel_party || quote.sentiment) && (
        <div className="border-t border-grey-20 pt-3 flex flex-wrap gap-x-4 gap-y-2 text-base text-blue-90">
          {quote.segment      && <span><span className="font-bold">Segment: </span>{quote.segment}</span>}
          {quote.stage        && <span><span className="font-bold">Stage: </span>{quote.stage}</span>}
          {quote.travel_party && <span><span className="font-bold">Travel party: </span>{quote.travel_party}</span>}
          {quote.sentiment    && <span><span className="font-bold">Sentiment: </span>{quote.sentiment}</span>}
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
        <p className="text-base text-blue-90/60 mt-0.5"><span className="font-bold">{quotes.length}</span> Participant quotes from user research.</p>
      </div>

      {/* Filters */}
      <div className="sticky top-[139px] z-20 bg-blue-10 -mx-10 px-10 py-3 mb-5">
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-base text-blue-90">Segment</span>
            <div className="flex gap-2 flex-wrap">
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
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-base text-blue-90">Sentiment</span>
            <div className="flex gap-2">
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
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-base text-blue-90">Theme</span>
              <div className="flex items-center gap-2">
                <span className="bg-blue-80 text-white text-base px-2.5 py-1 rounded-full">
                  {themeFilter}
                </span>
                <button
                  type="button"
                  onClick={() => setThemeFilter('')}
                  className="text-base text-blue-80 hover:text-blue-90 underline"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
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
