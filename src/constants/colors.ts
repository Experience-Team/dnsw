import type { Emotion, ContentPriority, GapSeverity, GeoReadiness, AtdwCoverage } from '../types';

export const EMOTION_COLORS: Record<Emotion, { bg: string; text: string; border: string; dot: string }> = {
  Positive:   { bg: 'bg-green-10',   text: 'text-green-70',   border: 'border-green-30',   dot: '#05684A' },
  Neutral:    { bg: 'bg-grey-10',    text: 'text-grey-60',    border: 'border-grey-30',    dot: '#757575' },
  Negative:   { bg: 'bg-yellow-20',  text: 'text-yellow-80',  border: 'border-yellow-40',  dot: '#7A5E00' },
  Frustrated: { bg: 'bg-red-10',     text: 'text-red-70',     border: 'border-red-30',     dot: '#D10047' },
};

export const EMOTION_SCORE: Record<Emotion, number> = {
  Positive:   3,
  Neutral:    2,
  Negative:   1,
  Frustrated: 0,
};

export const PRIORITY_COLORS: Record<ContentPriority, string> = {
  'MVP':     'bg-green-20 text-green-80',
  'Phase 2': 'bg-yellow-20 text-yellow-80',
  'Phase 3': 'bg-grey-20 text-grey-60',
};

export const SEVERITY_COLORS: Record<GapSeverity, string> = {
  High:   'bg-red-10 text-red-70 border border-red-30',
  Medium: 'bg-yellow-20 text-yellow-80 border border-yellow-40',
  Low:    'bg-grey-10 text-grey-60 border border-grey-30',
};

export const GEO_COLORS: Record<GeoReadiness, string> = {
  Yes:     'bg-green-20 text-green-80',
  Partial: 'bg-yellow-20 text-yellow-80',
  No:      'bg-red-10 text-red-70',
};

export const ATDW_COLORS: Record<AtdwCoverage, string> = {
  Strong:  'bg-green-20 text-green-80',
  Partial: 'bg-yellow-20 text-yellow-80',
  Weak:    'bg-orange-20 text-orange-80',
  None:    'bg-grey-10 text-grey-60',
};

// Hex values for SVG drawing (can't use Tailwind classes in SVG attributes)
export const EMOTION_HEX: Record<Emotion, string> = {
  Positive:   '#05684A',
  Neutral:    '#757575',
  Negative:   '#7A5E00',
  Frustrated: '#D10047',
};

export const SITE_ACCENT: Record<'visitnsw' | 'sydney', { bg: string; text: string; light: string }> = {
  visitnsw: { bg: 'bg-green-80', text: 'text-green-80', light: 'bg-green-10' },
  sydney:   { bg: 'bg-blue-70',  text: 'text-blue-70',  light: 'bg-blue-10'  },
};
