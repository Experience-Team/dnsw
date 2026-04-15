import { useState } from 'react';
import type { Persona } from '../types';
import { SITE_ACCENT } from '../constants/colors';

interface Props {
  persona: Persona;
}

export default function PersonaCard({ persona }: Props) {
  const [expanded, setExpanded] = useState(false);
  const accent = SITE_ACCENT[persona.site];

  return (
    <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
      {/* Colour-coded top strip */}
      <div className={`h-1 ${accent.bg}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-grey-90 leading-tight">{persona.name}</p>
            <p className="text-xs text-grey-50 mt-0.5">{persona.travel_party} · {persona.segment}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${accent.bg} text-white`}>
            {persona.site === 'visitnsw' ? 'NSW' : 'Sydney'}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-grey-60 leading-relaxed mb-3">{persona.description}</p>

        {/* Quick attributes */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Pill label="Tech" value={persona.tech_comfort} />
          <Pill label="Planning" value={persona.planning_horizon} />
          <Pill label="Budget" value={persona.budget_range} />
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs font-medium text-grey-50 hover:text-grey-90 transition-colors flex items-center gap-1"
        >
          {expanded ? 'Show less' : 'Show more'}
          <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 space-y-3 border-t border-grey-20 pt-4">
            <DetailRow label="Goals" value={persona.goals} />
            <DetailRow label="Frustrations" value={persona.frustrations} />
            {persona.source_evidence && (
              <DetailRow label="Evidence" value={persona.source_evidence} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <span className="text-xs bg-grey-10 text-grey-60 px-2.5 py-1 rounded-full">
      <span className="text-grey-40">{label}:</span> {value}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-grey-40 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-grey-70 leading-relaxed">{value}</p>
    </div>
  );
}
