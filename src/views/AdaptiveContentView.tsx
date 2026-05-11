import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { AdaptiveContent } from '../types';

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
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-base text-blue-80 uppercase tracking-wide mb-0.5">{rule.content_type}</p>
            <p className="text-base text-blue-80 mt-0.5 capitalize">{rule.segment}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-blue-10 hover:bg-blue-20 flex items-center justify-center text-blue-80 text-base shrink-0"
          >
            ✕
          </button>
        </div>
        <p className="text-base leading-relaxed text-blue-90">{rule.content}</p>
      </div>
    </div>
  );
}

export default function AdaptiveContentView() {
  const { data, siteFilter } = useAppContext();
  const [selectedRule, setSelectedRule] = useState<AdaptiveContent | null>(null);

  if (!data) return null;

  const { adaptiveContent } = data;

  const filtered = useMemo(() =>
    adaptiveContent.filter(r =>
      siteFilter === 'both' || r.site === siteFilter || r.site === 'both'
    ), [adaptiveContent, siteFilter]);

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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-90">Adaptive Content</h1>
        <p className="text-base text-blue-90/60 mt-0.5">Content rules mapped by type and audience segment. Each cell defines what changes for a given context.</p>
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
                  {contentType}
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
                        className="relative w-full text-left rounded-md px-3 py-4 bg-white text-blue-90 hover:bg-blue-10 transition-all"
                      >
                        <span className="absolute top-1.5 right-1.5 opacity-30 pointer-events-none">
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="5.5,1 9,1 9,4.5" />
                            <line x1="5.5" y1="4.5" x2="9" y2="1" />
                            <polyline points="4.5,9 1,9 1,5.5" />
                            <line x1="4.5" y1="5.5" x2="1" y2="9" />
                          </svg>
                        </span>
                        <p className="text-base leading-snug pr-3 line-clamp-5">{rule.content}</p>
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
