import { useEffect } from 'react';
import type { Touchpoint, JourneyStage, Persona } from '../types';
import { EMOTION_COLORS, GEO_COLORS, ATDW_COLORS } from '../constants/colors';

interface Props {
  touchpoint: Touchpoint;
  stages: JourneyStage[];
  personas: Persona[];
  onClose: () => void;
}

export default function TouchpointModal({ touchpoint, stages, personas, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const colors = EMOTION_COLORS[touchpoint.user_emotion];
  const stage = stages.find(s => s.stage_id === touchpoint.stage_id);
  const linkedPersonas = personas.filter(p => touchpoint.persona_ids.includes(p.persona_id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 ${colors.bg} rounded-t-2xl border-b ${colors.border}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60 ${colors.text}`}>
                  {touchpoint.user_emotion}
                </span>
                {stage && (
                  <span className="text-xs text-grey-50 bg-white/60 px-2 py-0.5 rounded-full">
                    {stage.stage_name}
                  </span>
                )}
                <span className="text-xs text-grey-50 bg-white/60 px-2 py-0.5 rounded-full">
                  {touchpoint.channel}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-grey-90 leading-tight">
                {touchpoint.touchpoint_name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-grey-60 hover:text-grey-90 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {touchpoint.description && (
            <Section label="Description" content={touchpoint.description} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {touchpoint.pain_points && (
              <Section label="Pain points" content={touchpoint.pain_points} accent="red" />
            )}
            {touchpoint.opportunities && (
              <Section label="Opportunities" content={touchpoint.opportunities} accent="green" />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {touchpoint.current_content && (
              <Section label="Current content" content={touchpoint.current_content} />
            )}
            {touchpoint.content_gap && (
              <Section label="Content gap" content={touchpoint.content_gap} accent="yellow" />
            )}
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-3 pt-1">
            <BadgeGroup
              label="GEO readiness"
              value={touchpoint.geo_readiness}
              className={GEO_COLORS[touchpoint.geo_readiness]}
            />
            <BadgeGroup
              label="ATDW coverage"
              value={touchpoint.atdw_coverage}
              className={ATDW_COLORS[touchpoint.atdw_coverage]}
            />
            {touchpoint.experiment_id && (
              <BadgeGroup
                label="Experiment"
                value={touchpoint.experiment_id}
                className="bg-purple-10 text-purple-70"
              />
            )}
          </div>

          {/* Linked personas */}
          {linkedPersonas.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-grey-40 uppercase tracking-wide mb-2">
                Linked personas
              </p>
              <div className="flex flex-wrap gap-2">
                {linkedPersonas.map(p => (
                  <span key={p.persona_id} className="text-xs bg-grey-10 text-grey-60 px-2.5 py-1 rounded-full">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          {touchpoint.source_evidence && (
            <div>
              <p className="text-xs font-semibold text-grey-40 uppercase tracking-wide mb-1">Source evidence</p>
              <p className="text-xs text-grey-50 leading-relaxed">{touchpoint.source_evidence}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  content,
  accent,
}: {
  label: string;
  content: string;
  accent?: 'red' | 'green' | 'yellow';
}) {
  const borderClass = accent === 'red'
    ? 'border-l-2 border-red-30 pl-3'
    : accent === 'green'
    ? 'border-l-2 border-green-30 pl-3'
    : accent === 'yellow'
    ? 'border-l-2 border-yellow-40 pl-3'
    : '';

  return (
    <div className={borderClass}>
      <p className="text-xs font-semibold text-grey-40 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-grey-70 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function BadgeGroup({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-grey-40 uppercase tracking-wide">{label}</span>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>{value}</span>
    </div>
  );
}
