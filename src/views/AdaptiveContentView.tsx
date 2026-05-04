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

  const segments = useMemo(() =>
    [...new Set(filtered.map(r => r.segment.trim().toLowerCase()))].sort(),
    [filtered]);

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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed text-base">
            <thead>
              <tr className="bg-blue-20 text-blue-90">
                <th className="text-left px-4 py-3 sticky left-0 bg-blue-20 z-10 w-48 min-w-48" />
                {segments.map(seg => (
                  <th key={seg} className="text-center px-3 py-3 text-base font-semibold whitespace-nowrap capitalize min-w-[180px]">
                    {seg}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contentTypes.map(contentType => (
                <tr key={contentType}>
                  <td className="px-4 py-3 font-medium text-blue-90 sticky left-0 border-r border-blue-20 w-48 min-w-48 align-top">
                    {contentType}
                  </td>
                  {segments.map(seg => {
                    const rule = ruleMap[`${contentType}||${seg}`];
                    if (!rule) {
                      return (
                        <td key={seg} className="px-3 py-3 text-center text-blue-30 text-base align-top">
                          —
                        </td>
                      );
                    }
                    return (
                      <td key={seg} className="px-3 py-2 align-top">
                        <button
                          onClick={() => setSelectedRule(rule)}
                          className="relative w-full text-left rounded px-2 py-3 bg-blue-20 text-blue-90 hover:bg-blue-30 transition-all"
                        >
                          <span className="absolute top-1.5 right-1.5 opacity-30 pointer-events-none">
                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="5.5,1 9,1 9,4.5" />
                              <line x1="5.5" y1="4.5" x2="9" y2="1" />
                              <polyline points="4.5,9 1,9 1,5.5" />
                              <line x1="4.5" y1="5.5" x2="1" y2="9" />
                            </svg>
                          </span>
                          <p className="text-base leading-snug pr-3 line-clamp-4">{rule.content}</p>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRule && (
        <CellPopover rule={selectedRule} onClose={() => setSelectedRule(null)} />
      )}
    </div>
  );
}
