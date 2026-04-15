import type { Touchpoint } from '../types';
import { EMOTION_COLORS } from '../constants/colors';

interface Props {
  touchpoint: Touchpoint;
  onClick: () => void;
  isShared?: boolean;
}

export default function TouchpointCard({ touchpoint, onClick, isShared = false }: Props) {
  const colors = EMOTION_COLORS[touchpoint.user_emotion];

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full text-left rounded-lg border p-3 cursor-pointer
        transition-all hover:shadow-md hover:-translate-y-0.5
        ${colors.bg} ${colors.border}
      `}
    >
      {/* Expand icon */}
      <span className="absolute top-2 right-2 opacity-30 pointer-events-none">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5.5,1 9,1 9,4.5" />
          <line x1="5.5" y1="4.5" x2="9" y2="1" />
          <polyline points="4.5,9 1,9 1,5.5" />
          <line x1="4.5" y1="5.5" x2="1" y2="9" />
        </svg>
      </span>

      {/* Emotion + channel row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`text-xs font-semibold ${colors.text}`}>
          {touchpoint.user_emotion}
        </span>
        {isShared && (
          <span className="text-xs bg-grey-20 text-grey-60 px-1.5 py-0.5 rounded">
            shared
          </span>
        )}
      </div>

      {/* Name */}
      <p className="text-sm font-medium text-grey-90 leading-snug mb-1">
        {touchpoint.touchpoint_name}
      </p>

      {/* Channel */}
      <p className="text-xs text-grey-50">{touchpoint.channel}</p>

      {/* Pain point preview */}
      {touchpoint.pain_points && (
        <p className="text-xs text-grey-60 mt-2 line-clamp-4 leading-relaxed">
          {touchpoint.pain_points}
        </p>
      )}
    </button>
  );
}
