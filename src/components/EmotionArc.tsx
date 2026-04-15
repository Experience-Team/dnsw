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

// Generate a smooth cubic bezier path through points using Catmull-Rom interpolation
function generateSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const path: string[] = [];
  path.push(`M ${points[0].x} ${points[0].y}`);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    // Catmull-Rom tangent vectors
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`);
  }

  return path.join(' ');
}

interface Point {
  x: number;
  y: number;
  emotion: Emotion | null;
  hasData: boolean;
  stageId: string;
  touchpoints: Touchpoint[];
}

export default function EmotionArc({ stages, touchpointsByStage }: Props) {
  if (stages.length === 0) return null;

  // Calculate average emotion score per stage, skip stages with no touchpoints
  const points: Point[] = stages.map((stage, i) => {
    const tps = touchpointsByStage[stage.stage_id] ?? [];
    const x = PAD_X + (i + 0.5) * ((VB_W - 2 * PAD_X) / stages.length);

    if (tps.length === 0) {
      return { x, y: VB_H / 2, emotion: null, hasData: false, stageId: stage.stage_id, touchpoints: [] };
    }

    const avg = tps.reduce((sum, tp) => sum + emotionScore(tp.user_emotion), 0) / tps.length;
    // avg 0-3, invert so positive = top of SVG
    const y = PAD_Y + (1 - avg / 3) * (VB_H - 2 * PAD_Y);
    const dominantEmotion = tps.reduce((acc, tp) => {
      const existing = emotionScore(acc.user_emotion);
      return emotionScore(tp.user_emotion) < existing ? tp : acc;
    }).user_emotion;

    return { x, y, emotion: dominantEmotion, hasData: true, stageId: stage.stage_id, touchpoints: tps };
  });

  // Build smooth curve from points that have data
  const curvePoints = points.filter(p => p.hasData);

  if (curvePoints.length === 0) return null;

  const pathData = generateSmoothPath(curvePoints);

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

        {/* Smooth emotion trajectory curve */}
        <path
          d={pathData}
          fill="none"
          stroke="#FF4D25"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points with tooltips */}
        {curvePoints.map((p) => {
          const touchpointNames = p.touchpoints.map(tp => tp.touchpoint_name).join(', ');
          return (
            <g key={p.stageId}>
              <circle
                cx={p.x}
                cy={p.y}
                r="1.8"
                fill="white"
                stroke="#FF4D25"
                strokeWidth="1.2"
                style={{ cursor: 'pointer' }}
              />
              <title>{touchpointNames}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
