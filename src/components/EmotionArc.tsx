import type { JourneyStage, Touchpoint, Emotion } from '../types';
import { EMOTION_SCORE } from '../constants/colors';

interface Props {
  stages: JourneyStage[];
  touchpointsByStage: Record<string, Touchpoint[]>;
}

// SVG viewBox dimensions
const VB_W = 100;
const VB_H = 40;
const PAD_X = 2;
const PAD_Y = 5;

function emotionScore(emotion: Emotion): number {
  return EMOTION_SCORE[emotion];
}

export default function EmotionArc({ stages, touchpointsByStage }: Props) {
  if (stages.length === 0) return null;

  // Calculate average emotion score per stage, skip stages with no touchpoints
  const points: Array<{ x: number; y: number; emotion: Emotion | null; hasData: boolean }> =
    stages.map((stage, i) => {
      const tps = touchpointsByStage[stage.stage_id] ?? [];
      const x = PAD_X + (i + 0.5) * ((VB_W - 2 * PAD_X) / stages.length);

      if (tps.length === 0) {
        return { x, y: VB_H / 2, emotion: null, hasData: false };
      }

      const avg = tps.reduce((sum, tp) => sum + emotionScore(tp.user_emotion), 0) / tps.length;
      // avg 0-3, invert so positive = top of SVG
      const y = PAD_Y + (1 - avg / 3) * (VB_H - 2 * PAD_Y);
      const dominantEmotion = tps.reduce((acc, tp) => {
        const existing = emotionScore(acc.user_emotion);
        return emotionScore(tp.user_emotion) < existing ? tp : acc;
      }).user_emotion;

      return { x, y, emotion: dominantEmotion, hasData: true };
    });

  // Build polyline from points that have data; skip gaps gracefully
  const linePoints = points.filter(p => p.hasData);

  if (linePoints.length === 0) return null;

  const polylineStr = linePoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="w-full px-0" style={{ height: 56 }}>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Reference grid lines */}
        {[0, 1, 2, 3].map(score => {
          const y = PAD_Y + (1 - score / 3) * (VB_H - 2 * PAD_Y);
          return (
            <line
              key={score}
              x1={PAD_X}
              y1={y}
              x2={VB_W - PAD_X}
              y2={y}
              stroke="#EBEBEB"
              strokeWidth="0.5"
              strokeDasharray="1,1"
            />
          );
        })}

        {/* Emotion trajectory line */}
        <polyline
          points={polylineStr}
          fill="none"
          stroke="#FF4D25"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {linePoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.8"
            fill="white"
            stroke="#FF4D25"
            strokeWidth="1.2"
          />
        ))}
      </svg>
    </div>
  );
}
