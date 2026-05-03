import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { fetchQuotes } from '../services/sheets';
import type { QuoteEntry } from '../services/sheets';

const SEGMENTS = [
  'Local',
  'Intrastate',
  'Interstate',
  'Short-haul international',
  'Long-haul international',
];

const SENTIMENTS = ['All', 'Positive', 'Neutral', 'Negative'] as const;

function sentenceCase(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function FilterPill({
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
      className={`text-base text-blue-90 px-4 py-1 rounded-full transition-all ${
        active ? 'bg-blue-30' : 'bg-grey-10 hover:bg-grey-20'
      }`}
    >
      {label}
    </button>
  );
}

function FilterSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-base text-blue-90">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
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
      <blockquote className="text-blue-90 text-base leading-relaxed">
        "{quote.quote}"
      </blockquote>

      {quote.trip_context && (
        <p className="text-base text-blue-90">
          <span className="font-bold">Context: </span>{quote.trip_context}
        </p>
      )}

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

      {(quote.segment || quote.stage || quote.travel_party || quote.sentiment) && (
        <div className="border-t border-grey-20 pt-3 flex flex-wrap gap-x-4 gap-y-2 text-base text-blue-90">
          {quote.segment      && <span><span className="font-bold">Segment: </span>{sentenceCase(quote.segment)}</span>}
          {quote.stage        && <span><span className="font-bold">Stage: </span>{quote.stage}</span>}
          {quote.travel_party && <span><span className="font-bold">Travel party: </span>{quote.travel_party}</span>}
          {quote.sentiment    && <span><span className="font-bold">Sentiment: </span>{quote.sentiment}</span>}
        </div>
      )}
    </div>
  );
}

export default function GapsDashboard() {
  const [quotes, setQuotes]                 = useState<QuoteEntry[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [panelOpen, setPanelOpen]           = useState(false);
  const [segmentFilter, setSegmentFilter]   = useState('');
  const [sentimentFilter, setSentiment]     = useState('All');
  const [stageFilter, setStageFilter]       = useState('');
  const [travelPartyFilter, setTravelParty] = useState('');
  const [themeFilter, setThemeFilter]       = useState('');

  useEffect(() => {
    fetchQuotes()
      .then(setQuotes)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load quotes.'))
      .finally(() => setLoading(false));
  }, []);

  const stages = useMemo(() =>
    [...new Set(quotes.flatMap(q => q.stage ? [q.stage.trim()] : []))].sort(),
    [quotes]
  );

  const travelParties = useMemo(() =>
    [...new Set(quotes.flatMap(q =>
      q.travel_party ? q.travel_party.split(',').map(s => s.trim()).filter(Boolean) : []
    ))].sort(),
    [quotes]
  );

  const allThemes = useMemo(() =>
    [...new Set(quotes.flatMap(q =>
      q.themes ? q.themes.split(',').map(t => t.trim()).filter(Boolean) : []
    ))].sort(),
    [quotes]
  );

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
      const stageMatch =
        stageFilter === '' ||
        q.stage.trim().toLowerCase() === stageFilter.toLowerCase();
      const travelPartyMatch =
        travelPartyFilter === '' ||
        q.travel_party.split(',').map(s => s.trim().toLowerCase()).includes(travelPartyFilter.toLowerCase());
      return segmentMatch && sentimentMatch && themeMatch && stageMatch && travelPartyMatch;
    }),
    [quotes, segmentFilter, sentimentFilter, themeFilter, stageFilter, travelPartyFilter]
  );

  const handleThemeClick = (theme: string) =>
    setThemeFilter(v => v === theme ? '' : theme);

  const clearAllFilters = () => {
    setSegmentFilter('');
    setSentiment('All');
    setStageFilter('');
    setTravelParty('');
    setThemeFilter('');
  };

  if (loading) return (
    <div className="py-16 text-center text-blue-90/40">Loading quotes…</div>
  );

  if (error) return (
    <div className="py-16 text-center text-red-60">{error}</div>
  );

  return (
    <div>
      {/* Sticky top bar */}
      <div className="sticky top-[139px] z-20 bg-blue-10 -mx-10 px-10 py-3 mb-5">
        <div className="relative flex items-center h-8">
          <button
            type="button"
            onClick={() => setPanelOpen(v => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-blue-80 bg-white text-blue-80 text-xs font-bold transition-colors hover:bg-blue-10"
          >
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
              <path d="M0.5 1h11M3 5h6M5 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            FILTERS
          </button>
          <p className="absolute left-1/2 -translate-x-1/2 text-base text-blue-90 whitespace-nowrap">
            <span className="font-bold">{filtered.length}</span> Participant quotes from user research
          </p>
        </div>
      </div>

      {/* Filter panel */}
      {panelOpen && (
        <>
          {/* Backdrop — click outside to close */}
          <div className="fixed inset-0 z-[15]" onClick={() => setPanelOpen(false)} />
          {/* Panel */}
          <div className="fixed top-[195px] left-10 z-[16] w-[300px] max-h-[calc(100vh-195px)] bg-white rounded-xl shadow-[10px_4px_44px_0px_rgba(0,0,0,0.15)] flex flex-col">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-md border border-blue-80 bg-white text-blue-80 text-sm hover:bg-blue-10 transition-colors"
              aria-label="Close filters"
            >
              ✕
            </button>

            {/* Scrollable filter sections */}
            <div className="overflow-y-auto flex-1 px-6 py-6">
              <div className="flex flex-col gap-8 pr-10">
                <FilterSection label="Segment">
                  <FilterPill label="All" active={segmentFilter === ''} onClick={() => setSegmentFilter('')} />
                  {SEGMENTS.map(seg => (
                    <FilterPill
                      key={seg}
                      label={seg}
                      active={segmentFilter === seg}
                      onClick={() => setSegmentFilter(v => v === seg ? '' : seg)}
                    />
                  ))}
                </FilterSection>

                <FilterSection label="Sentiment">
                  {SENTIMENTS.map(s => (
                    <FilterPill
                      key={s}
                      label={s}
                      active={sentimentFilter === s}
                      onClick={() => setSentiment(s)}
                    />
                  ))}
                </FilterSection>

                {stages.length > 0 && (
                  <FilterSection label="Stage">
                    <FilterPill label="All" active={stageFilter === ''} onClick={() => setStageFilter('')} />
                    {stages.map(s => (
                      <FilterPill
                        key={s}
                        label={s}
                        active={stageFilter === s}
                        onClick={() => setStageFilter(v => v === s ? '' : s)}
                      />
                    ))}
                  </FilterSection>
                )}

                {travelParties.length > 0 && (
                  <FilterSection label="Travel party">
                    <FilterPill label="All" active={travelPartyFilter === ''} onClick={() => setTravelParty('')} />
                    {travelParties.map(tp => (
                      <FilterPill
                        key={tp}
                        label={tp}
                        active={travelPartyFilter === tp}
                        onClick={() => setTravelParty(v => v === tp ? '' : tp)}
                      />
                    ))}
                  </FilterSection>
                )}

                {allThemes.length > 0 && (
                  <FilterSection label="Theme">
                    <FilterPill label="All" active={themeFilter === ''} onClick={() => setThemeFilter('')} />
                    {allThemes.map(t => (
                      <FilterPill
                        key={t}
                        label={t}
                        active={themeFilter === t}
                        onClick={() => setThemeFilter(v => v === t ? '' : t)}
                      />
                    ))}
                  </FilterSection>
                )}
              </div>
            </div>

            {/* Clear all footer */}
            <div className="px-6 py-4 border-t border-grey-20 shrink-0">
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-base font-bold text-blue-80 hover:text-blue-90 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        </>
      )}

      {/* Cards grid */}
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
