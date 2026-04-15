import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PRIORITY_COLORS } from '../constants/colors';
import type { AdaptiveContent, ContentPriority } from '../types';

const SEGMENTS = [
  'Local',
  'Intrastate',
  'Interstate',
  'Short-haul International',
  'Long-haul International',
];

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
            <p className="text-xs text-grey-40 uppercase tracking-wide mb-0.5">{rule.page_type}</p>
            <h3 className="font-semibold text-grey-90">{rule.content_element}</h3>
            <p className="text-xs text-grey-50 mt-0.5">{rule.segment}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_COLORS[rule.priority]}`}>
              {rule.priority}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-grey-10 hover:bg-grey-20 flex items-center justify-center text-grey-50 text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <DetailRow label="Default" value={rule.default_variant} />
          <DetailRow label="Adapted variant" value={rule.adapted_variant} accent />
          <DetailRow label="Rationale" value={rule.rationale} />
          {rule.source_evidence && (
            <DetailRow label="Evidence" value={rule.source_evidence} />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-grey-40 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm leading-relaxed ${accent ? 'text-grey-90 font-medium' : 'text-grey-60'}`}>
        {value}
      </p>
    </div>
  );
}

export default function AdaptiveContentView() {
  const { data, siteFilter } = useAppContext();
  const [stageFilter, setStageFilter]   = useState('');
  const [selectedRule, setSelectedRule] = useState<AdaptiveContent | null>(null);

  if (!data) return null;

  const { adaptiveContent, stages } = data;

  const stageOptions = [
    { label: 'All stages', value: '' },
    ...stages.map(s => ({ label: s.stage_name, value: s.stage_id })),
  ];

  const filtered = useMemo(() =>
    adaptiveContent.filter(r => {
      if (siteFilter !== 'both' && r.site !== siteFilter) return false;
      if (stageFilter && r.stage_id !== stageFilter) return false;
      return true;
    }), [adaptiveContent, siteFilter, stageFilter]);

  // Derive unique page_types (rows)
  const pageTypes = useMemo(() =>
    [...new Set(filtered.map(r => r.page_type))].sort(),
    [filtered]);

  // Build lookup: page_type + segment → rule
  const ruleMap = useMemo(() => {
    const map: Record<string, AdaptiveContent> = {};
    filtered.forEach(r => {
      map[`${r.page_type}||${r.segment}`] = r;
    });
    return map;
  }, [filtered]);

  const priorityLegend: { label: ContentPriority; cls: string }[] = [
    { label: 'MVP',     cls: PRIORITY_COLORS['MVP']     },
    { label: 'Phase 2', cls: PRIORITY_COLORS['Phase 2'] },
    { label: 'Phase 3', cls: PRIORITY_COLORS['Phase 3'] },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-grey-90">Adaptive Content</h1>
          <p className="text-sm text-grey-50 mt-0.5">Content rules mapped by page type and audience segment. Each cell defines what changes for a given context.</p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-grey-50">Stage:</span>
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="border border-grey-20 rounded-lg px-3 py-1.5 text-sm text-grey-80 bg-white
                       focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {stageOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        {/* Priority legend */}
        <div className="flex items-center gap-3 ml-auto">
          {priorityLegend.map(p => (
            <span key={p.label} className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.cls}`}>
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {pageTypes.length === 0 ? (
        <div className="py-16 text-center text-grey-40">
          No adaptive content rules for the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-grey-90 text-white">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-tl-xl sticky left-0 bg-grey-90 z-10">
                  Page type
                </th>
                {SEGMENTS.map(seg => (
                  <th key={seg} className="text-center px-3 py-3 text-xs font-semibold whitespace-nowrap">
                    {seg}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageTypes.map((pageType, rowIdx) => (
                <tr
                  key={pageType}
                  className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-grey-10'}
                >
                  <td className="px-4 py-3 font-medium text-grey-80 sticky left-0 bg-inherit border-r border-grey-20 min-w-40">
                    {pageType}
                  </td>
                  {SEGMENTS.map(seg => {
                    const rule = ruleMap[`${pageType}||${seg}`];
                    if (!rule) {
                      return (
                        <td key={seg} className="px-3 py-3 text-center text-grey-30 text-xs">
                          —
                        </td>
                      );
                    }
                    return (
                      <td key={seg} className="px-3 py-2">
                        <button
                          onClick={() => setSelectedRule(rule)}
                          className={`
                            w-full text-left rounded-lg px-2.5 py-2
                            hover:ring-2 hover:ring-accent/30 transition-all
                            ${PRIORITY_COLORS[rule.priority]}
                          `}
                        >
                          <p className="text-xs font-medium leading-snug">{rule.content_element}</p>
                          {rule.adapted_variant && (
                            <p className="text-xs opacity-70 mt-0.5 line-clamp-1">
                              {rule.adapted_variant}
                            </p>
                          )}
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
