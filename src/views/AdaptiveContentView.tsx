import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { AdaptiveContent, ConfidenceLevel } from '../types';

type AdaptiveSite = 'sydney' | 'visitnsw';

const SITE_STORAGE_KEY = 'dnsw.adaptiveContent.site';

const SITE_LABEL: Record<AdaptiveSite, string> = {
  sydney:   'sydney.com',
  visitnsw: 'visitnsw.com',
};

const SITE_ORDER: AdaptiveSite[] = ['sydney', 'visitnsw'];

const CONTENT_TYPE_ICON: Record<string, string> = {
  'geographic context':              '🗺️',
  'cultural & contextual knowledge': '💡',
  'transport & getting there':       '🚗',
  'accommodation prompts':           '🛏️',
  'framing & tone':                  '🪂',
  'price & value framing':           '💰',
  'seasonal & temporal signals':     '📅',
  'trust & credibility signals':     '🛡️',
  'travel party considerations':     '👥',
  'booking confidence signals':      '✅',
};

function iconFor(contentType: string): string {
  return CONTENT_TYPE_ICON[contentType.trim().toLowerCase()] ?? '📄';
}

const CONFIDENCE_COLOR: Record<ConfidenceLevel, string> = {
  high:   '#04A069',
  medium: '#FFD400',
  low:    '#FA0057',
};

const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  high: 'High', medium: 'Medium', low: 'Low',
};

const CONFIDENCE_BLURB: Record<ConfidenceLevel, string> = {
  high:   'Strongly evidenced by research',
  medium: 'Moderately evidenced by research',
  low:    'Lightly evidenced — treat as a hypothesis',
};

const CONFIDENCE_ORDER: ConfidenceLevel[] = ['high', 'medium', 'low'];

function CellPopover({
  rule,
  onClose,
}: {
  rule: AdaptiveContent;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <p className="text-base text-blue-80 uppercase tracking-[0.4px] leading-6">{rule.content_type}</p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-blue-10 hover:bg-blue-20 flex items-center justify-center text-blue-80 text-base shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-1 pt-3">
          <h4 className="text-base font-bold text-blue-90 leading-6 capitalize">{rule.segment}</h4>
          <p className="text-base text-blue-90 leading-[26px]">{rule.variant_guidance}</p>
        </div>
        {rule.rationale && (
          <div className="flex flex-col gap-1 pt-3">
            <h4 className="text-base font-bold text-blue-90 leading-6">Why this variant</h4>
            <p className="text-base text-blue-90 leading-[22px]">{rule.rationale}</p>
          </div>
        )}
        <div className="flex items-center gap-1.5 pt-3 text-sm text-blue-90 leading-5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: CONFIDENCE_COLOR[rule.confidence] }}
          />
          <span><strong>{CONFIDENCE_LABEL[rule.confidence]} confidence:</strong> {CONFIDENCE_BLURB[rule.confidence]}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdaptiveContentView() {
  const { data } = useAppContext();
  const [selectedRule, setSelectedRule] = useState<AdaptiveContent | null>(null);
  const [activeConfidence, setActiveConfidence] = useState<Set<ConfidenceLevel>>(
    () => new Set(CONFIDENCE_ORDER)
  );
  const [site, setSite] = useState<AdaptiveSite>(() => {
    if (typeof window === 'undefined') return 'sydney';
    const stored = window.localStorage.getItem(SITE_STORAGE_KEY);
    return stored === 'visitnsw' || stored === 'sydney' ? stored : 'sydney';
  });

  useEffect(() => {
    window.localStorage.setItem(SITE_STORAGE_KEY, site);
  }, [site]);

  if (!data) return null;

  const { adaptiveContent } = data;

  function toggleConfidence(c: ConfidenceLevel) {
    setActiveConfidence(prev => {
      if (prev.size === 1 && prev.has(c)) return new Set(CONFIDENCE_ORDER);
      return new Set([c]);
    });
  }

  const filtered = useMemo(() =>
    adaptiveContent.filter(r =>
      (r.site === site || r.site === 'both') &&
      activeConfidence.has(r.confidence)
    ), [adaptiveContent, site, activeConfidence]);

  const segments = useMemo(() => {
    const order = ['local', 'intrastate', 'interstate', 'international short haul', 'international long haul'];
    const present = [...new Set(filtered.map(r => r.segment.trim().toLowerCase()))];
    const ranked = present.filter(s => order.includes(s)).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const extras = present.filter(s => !order.includes(s)).sort();
    return [...ranked, ...extras];
  }, [filtered]);

  const contentTypes = useMemo(() =>
    [...new Set(filtered.map(r => r.content_type.trim()))].sort(),
    [filtered]);

  const ruleMap = useMemo(() => {
    const map: Record<string, AdaptiveContent> = {};
    filtered.forEach(r => {
      const key = `${r.content_type.trim()}||${r.segment.trim().toLowerCase()}`;
      if (!map[key]) map[key] = r;
    });
    return map;
  }, [filtered]);

  return (
    <div
      data-theme={site === 'visitnsw' ? 'nsw' : undefined}
      className="-mx-10 -my-6 px-10 py-6 bg-blue-10 min-h-[calc(100vh-3.5rem)]"
    >
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-blue-90">Adaptive Content</h1>
        <p className="text-base text-blue-90/60 mt-0.5">Content rules mapped by type and audience segment. Each cell defines what changes for a given context.</p>
      </div>

      <div className="mb-5 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-base text-blue-90 shrink-0">Site</span>
          <div className="flex gap-2 flex-wrap">
            {SITE_ORDER.map(s => {
              const active = site === s;
              return (
                <button
                  key={s}
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => setSite(s)}
                  className={`text-base text-blue-90 px-4 py-1 rounded-full transition-all ${active ? 'bg-blue-30' : 'bg-white'}`}
                >
                  {SITE_LABEL[s]}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="text-base text-blue-90 shrink-0 mr-1">Confidence</span>
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => setActiveConfidence(new Set(CONFIDENCE_ORDER))}
            className={`text-base text-blue-90 px-4 py-1 rounded-full transition-all flex items-center gap-1.5 ${activeConfidence.size === CONFIDENCE_ORDER.length ? 'bg-blue-30' : 'bg-white'}`}
          >
            <span className="flex items-center gap-0.5">
              {CONFIDENCE_ORDER.map(c => (
                <span key={c} className="w-2 h-2 rounded-full" style={{ backgroundColor: CONFIDENCE_COLOR[c] }} />
              ))}
            </span>
            All
          </button>
          {CONFIDENCE_ORDER.map(c => {
            const active = activeConfidence.size === 1 && activeConfidence.has(c);
            return (
              <button
                key={c}
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => toggleConfidence(c)}
                className={`text-base text-blue-90 px-4 py-1 rounded-full transition-all flex items-center gap-1.5 ${active ? 'bg-blue-30' : 'bg-white'}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CONFIDENCE_COLOR[c] }} />
                {CONFIDENCE_LABEL[c]}
              </button>
            );
          })}
        </div>
      </div>

      {contentTypes.length === 0 ? (
        <div className="py-16 text-center text-blue-90/40">
          No adaptive content rules for the current filters.
        </div>
      ) : (
        <table className="w-full border-collapse table-fixed text-base">
          <thead>
            <tr>
              <th className="sticky top-14 left-0 z-30 bg-blue-10 w-36 min-w-36" />
              {segments.map(seg => (
                <th
                  key={seg}
                  className="sticky top-14 z-20 bg-blue-10 px-0.5 pb-2 min-w-[180px] font-normal"
                >
                  <div className="bg-blue-20 h-10 flex items-center justify-center text-base font-bold text-blue-90 leading-6 capitalize whitespace-nowrap rounded-md">
                    {seg}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contentTypes.map(contentType => (
              <tr key={contentType}>
                <td className="pr-4 py-3 font-medium text-blue-90 sticky left-0 bg-blue-10 w-36 min-w-36 align-top">
                  <div className="flex items-start gap-1.5 leading-6">
                    <span aria-hidden="true" className="shrink-0">{iconFor(contentType)}</span>
                    <span>{contentType}</span>
                  </div>
                </td>
                {segments.map(seg => {
                  const rule = ruleMap[`${contentType}||${seg}`];
                  if (!rule) {
                    return (
                      <td key={seg} className="px-1.5 py-2 text-center text-blue-30 text-base align-top">
                        —
                      </td>
                    );
                  }
                  return (
                    <td key={seg} className="px-1.5 py-2 align-top">
                      <button
                        onClick={() => setSelectedRule(rule)}
                        className="relative w-full text-left rounded-md px-3 py-4 bg-white text-blue-90 hover:bg-white hover:shadow-md transition-shadow"
                      >
                        <span
                          className="absolute top-2 left-2 w-2 h-2 rounded-full pointer-events-none"
                          style={{ backgroundColor: CONFIDENCE_COLOR[rule.confidence] }}
                        />
                        <span className="absolute top-1.5 right-1.5 opacity-30 pointer-events-none">
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="5.5,1 9,1 9,4.5" />
                            <line x1="5.5" y1="4.5" x2="9" y2="1" />
                            <polyline points="4.5,9 1,9 1,5.5" />
                            <line x1="4.5" y1="5.5" x2="1" y2="9" />
                          </svg>
                        </span>
                        <p className="text-base leading-snug pl-4 pr-3">{rule.summary || rule.variant_guidance}</p>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedRule && (
        <CellPopover rule={selectedRule} onClose={() => setSelectedRule(null)} />
      )}
    </div>
  );
}
