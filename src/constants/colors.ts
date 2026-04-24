import type { ContentPriority, GapSeverity } from '../types';

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

export const SITE_ACCENT: Record<'visitnsw' | 'sydney', { bg: string; text: string; light: string }> = {
  visitnsw: { bg: 'bg-green-80', text: 'text-green-80', light: 'bg-green-10' },
  sydney:   { bg: 'bg-blue-70',  text: 'text-blue-70',  light: 'bg-blue-10'  },
};
