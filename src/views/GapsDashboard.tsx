import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import InfoButton from '../components/InfoButton';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
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

const PLACEHOLDER_IMAGE = 'https://res.cloudinary.com/driwnxikm/image/upload/q_auto/f_auto/v1779366388/Boris_kiwdl2.png';

function sentenceCase(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function filterQuotes(
  quotes: QuoteEntry[],
  segment: string,
  sentiment: string,
  stage: string,
  travelParty: string,
  theme: string,
): QuoteEntry[] {
  return quotes.filter(q => {
    const segmentMatch =
      segment === '' ||
      q.segment.trim().toLowerCase() === 'all' ||
      q.segment.split(',').map(s => s.trim().toLowerCase()).includes(segment.toLowerCase());
    const sentimentMatch = sentiment === 'All' || q.sentiment === sentiment;
    const themeMatch = theme === '' || q.themes.split(',').map(t => t.trim()).includes(theme);
    const stageMatch = stage === '' || q.stage.trim().toLowerCase() === stage.toLowerCase();
    const travelPartyMatch =
      travelParty === '' ||
      q.travel_party.split(',').map(s => s.trim().toLowerCase()).includes(travelParty.toLowerCase());
    return segmentMatch && sentimentMatch && themeMatch && stageMatch && travelPartyMatch;
  });
}

function FilterPill({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
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
      {count !== undefined ? `${label} (${count})` : label}
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
    <div className="bg-white rounded-xl px-5 pt-5 pb-[22px] flex flex-col gap-4">
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

      <div className="border-t border-grey-20 pt-[17px] flex gap-4">
        <img
          src={quote.image_url || PLACEHOLDER_IMAGE}
          alt=""
          className="w-20 h-20 rounded shrink-0 object-cover"
        />
        <div className="flex flex-col gap-1 text-sm text-blue-90">
          {(quote.alias || quote.participant) && <p><span className="font-bold">Participant: </span>{quote.alias || quote.participant}</p>}
          {quote.segment      && <p><span className="font-bold">Segment: </span>{sentenceCase(quote.segment)}</p>}
          {quote.stage        && <p><span className="font-bold">Stage: </span>{quote.stage}</p>}
          {quote.travel_party && <p><span className="font-bold">Travel party: </span>{quote.travel_party}</p>}
          {quote.sentiment    && <p><span className="font-bold">Sentiment: </span>{quote.sentiment}</p>}
        </div>
      </div>
    </div>
  );
}

export default function GapsDashboard() {
  const [quotes, setQuotes]                 = useState<QuoteEntry[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [segmentFilter, setSegmentFilter]   = useState('');
  const [sentimentFilter, setSentiment]     = useState('All');
  const [stageFilter, setStageFilter]       = useState('');
  const [travelPartyFilter, setTravelParty] = useState('');
  const [themeFilter, setThemeFilter]       = useState('');
  const [shuffleSeed, setShuffleSeed]       = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchQuotes()
      .then(setQuotes)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load quotes.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    filterQuotes(quotes, segmentFilter, sentimentFilter, stageFilter, travelPartyFilter, themeFilter),
    [quotes, segmentFilter, sentimentFilter, stageFilter, travelPartyFilter, themeFilter]
  );

  const displayed = useMemo(() => {
    if (shuffleSeed === 0) return filtered;
    const result = [...filtered];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }, [filtered, shuffleSeed]);

  // Base sets per dimension (all other filters applied) for faceted counts
  const segBase  = useMemo(() => filterQuotes(quotes, '',           sentimentFilter, stageFilter, travelPartyFilter, themeFilter), [quotes, sentimentFilter, stageFilter, travelPartyFilter, themeFilter]);
  const senBase  = useMemo(() => filterQuotes(quotes, segmentFilter, 'All',          stageFilter, travelPartyFilter, themeFilter), [quotes, segmentFilter, stageFilter, travelPartyFilter, themeFilter]);
  const stgBase  = useMemo(() => filterQuotes(quotes, segmentFilter, sentimentFilter, '',         travelPartyFilter, themeFilter), [quotes, segmentFilter, sentimentFilter, travelPartyFilter, themeFilter]);
  const tpBase   = useMemo(() => filterQuotes(quotes, segmentFilter, sentimentFilter, stageFilter, '',              themeFilter), [quotes, segmentFilter, sentimentFilter, stageFilter, themeFilter]);
  const thmBase  = useMemo(() => filterQuotes(quotes, segmentFilter, sentimentFilter, stageFilter, travelPartyFilter, ''),        [quotes, segmentFilter, sentimentFilter, stageFilter, travelPartyFilter]);

  const segCount = (seg: string) => seg === ''
    ? segBase.length
    : segBase.filter(q => q.segment.trim().toLowerCase() === 'all' || q.segment.split(',').map(s => s.trim().toLowerCase()).includes(seg.toLowerCase())).length;
  const senCount = (s: string) => s === 'All' ? senBase.length : senBase.filter(q => q.sentiment === s).length;
  const stgCount = (s: string) => s === '' ? stgBase.length : stgBase.filter(q => q.stage.trim().toLowerCase() === s.toLowerCase()).length;
  const tpCount  = (tp: string) => tp === '' ? tpBase.length : tpBase.filter(q => q.travel_party.split(',').map(s => s.trim().toLowerCase()).includes(tp.toLowerCase())).length;
  const thmCount = (t: string) => t === '' ? thmBase.length : thmBase.filter(q => q.themes.split(',').map(s => s.trim()).includes(t)).length;

  const handleThemeClick = (theme: string) =>
    setThemeFilter(v => v === theme ? '' : theme);

  const clearAllFilters = () => {
    setSegmentFilter('');
    setSentiment('All');
    setStageFilter('');
    setTravelParty('');
    setThemeFilter('');
  };

  if (loading) return <LoadingState />;

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      {/* Filter panel — always visible */}
      <div className="fixed top-[80px] left-10 z-[26] w-[300px] max-h-[calc(100vh-104px)] bg-white rounded-xl flex flex-col">
        {/* Scrollable filter sections */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <div className="flex flex-col gap-8">
            <p className="text-base text-blue-90 shrink-0">
              <span className="font-bold">{filtered.length}</span> Participant quotes from user research
            </p>
                <FilterSection label="Segment">
                  <FilterPill label="All" active={segmentFilter === ''} onClick={() => setSegmentFilter('')} count={segCount('')} />
                  {SEGMENTS.map(seg => (
                    <FilterPill
                      key={seg}
                      label={seg}
                      active={segmentFilter === seg}
                      onClick={() => setSegmentFilter(v => v === seg ? '' : seg)}
                      count={segCount(seg)}
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
                      count={senCount(s)}
                    />
                  ))}
                </FilterSection>

                {stages.length > 0 && (
                  <FilterSection label="Stage">
                    <FilterPill label="All" active={stageFilter === ''} onClick={() => setStageFilter('')} count={stgCount('')} />
                    {stages.map(s => (
                      <FilterPill
                        key={s}
                        label={s}
                        active={stageFilter === s}
                        onClick={() => setStageFilter(v => v === s ? '' : s)}
                        count={stgCount(s)}
                      />
                    ))}
                  </FilterSection>
                )}

                {travelParties.length > 0 && (
                  <FilterSection label="Travel party">
                    <FilterPill label="All" active={travelPartyFilter === ''} onClick={() => setTravelParty('')} count={tpCount('')} />
                    {travelParties.map(tp => (
                      <FilterPill
                        key={tp}
                        label={tp}
                        active={travelPartyFilter === tp}
                        onClick={() => setTravelParty(v => v === tp ? '' : tp)}
                        count={tpCount(tp)}
                      />
                    ))}
                  </FilterSection>
                )}

                {allThemes.length > 0 && (
                  <FilterSection label="Theme">
                    <FilterPill label="All" active={themeFilter === ''} onClick={() => setThemeFilter('')} count={thmCount('')} />
                    {allThemes.map(t => (
                      <FilterPill
                        key={t}
                        label={t}
                        active={themeFilter === t}
                        onClick={() => setThemeFilter(v => v === t ? '' : t)}
                        count={thmCount(t)}
                      />
                    ))}
                  </FilterSection>
                )}
          </div>
        </div>

        {/* Clear all footer */}
        <div className="border-t border-grey-20 shrink-0 flex justify-center py-8 drop-shadow-[0px_0px_21px_rgba(0,0,0,0.65)]">
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-lg font-bold text-blue-90 hover:text-blue-80 transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="ml-[316px]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-90 inline-flex items-center gap-2">
              Quote Bank
              <InfoButton
                title="Quote Bank"
                bullets={['Direct quotes from user research', 'Filter by segment, sentiment, and theme', 'Sourced and attributed for evidence']}
                useFor="backing a recommendation or insight with real user voice."
              />
            </h1>
            <p className="text-base text-blue-90/60 mt-0.5">Direct quotes from user research. Filter by segment, sentiment, and theme to focus the view.</p>
          </div>
          <button
            type="button"
            onClick={() => setShuffleSeed(Date.now())}
            disabled={filtered.length < 2}
            className="shrink-0 text-base text-blue-90 px-4 py-1.5 rounded-full bg-white hover:bg-blue-10 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2.5 4h2.2l1.6 2M13.5 4h-2.2L6 12H4.7l-2.2 0M13.5 12h-2.2l-1.6-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.8 2.5L13.5 4l-1.7 1.5M11.8 10.5L13.5 12l-1.7 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Shuffle
          </button>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-blue-90/40">
            No quotes match the current filters.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {displayed.map(q => (
              <div key={q.quote_id || q.quote} className="break-inside-avoid mb-4">
                <QuoteCard
                  quote={q}
                  activeTheme={themeFilter}
                  onThemeClick={handleThemeClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
