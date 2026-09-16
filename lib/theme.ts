import { Platform } from 'react-native';

export const C = {
  bg: '#F4F5FB',
  card: '#FFFFFF',
  ink: '#131426',
  sub: '#6B7280',
  faint: '#9AA0B5',
  line: '#E8E9F2',
  primary: '#4F46E5',
  primaryDark: '#4038C7',
  primarySoft: '#EEF0FE',
  accent: '#F59E0B',
  accentSoft: '#FEF3E2',
  danger: '#EF4444',
  dangerSoft: '#FEEBEB',
  success: '#10B981',
  successSoft: '#E7F8F1',
  navy: '#0B1120',
  navy2: '#151B34',
};

export const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
  display: 'PlayfairDisplay_700Bold',
  displayX: 'PlayfairDisplay_800ExtraBold',
  mono: Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }) as string,
};

export const GRADIENTS: Record<string, [string, string]> = {
  indigo: ['#4F46E5', '#7C3AED'],
  ocean: ['#0EA5E9', '#2563EB'],
  sunset: ['#F97316', '#EF4444'],
  forest: ['#059669', '#34D399'],
  rose: ['#EC4899', '#F43F5E'],
  gold: ['#F59E0B', '#D97706'],
  night: ['#111827', '#374151'],
  grape: ['#8B5CF6', '#D946EF'],
};

export const GRADIENT_KEYS = Object.keys(GRADIENTS);

export interface CatMeta {
  key: string;
  icon: string;
  color: string;
  soft: string;
}

export const CATEGORIES: CatMeta[] = [
  { key: 'General', icon: 'megaphone', color: '#4F46E5', soft: '#EEF0FE' },
  { key: 'Exams', icon: 'school', color: '#EF4444', soft: '#FEEBEB' },
  { key: 'Events', icon: 'calendar', color: '#8B5CF6', soft: '#F3EDFE' },
  { key: 'Sports', icon: 'basketball', color: '#F59E0B', soft: '#FEF3E2' },
  { key: 'Holidays', icon: 'sunny', color: '#10B981', soft: '#E7F8F1' },
  { key: 'Clubs', icon: 'people', color: '#0EA5E9', soft: '#E6F5FE' },
];

export const catMeta = (key: string): CatMeta =>
  CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];

export const PRIORITY_META: Record<string, { label: string; color: string; soft: string; icon: string }> = {
  normal: { label: 'Normal', color: '#6B7280', soft: '#F1F2F7', icon: 'remove-outline' },
  important: { label: 'Important', color: '#F59E0B', soft: '#FEF3E2', icon: 'alert-circle' },
  urgent: { label: 'Urgent', color: '#EF4444', soft: '#FEEBEB', icon: 'warning' },
};

export const AVATAR_COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export const ROLE_META: Record<string, { label: string; color: string; soft: string; icon: string }> = {
  student: { label: 'Student', color: '#0EA5E9', soft: '#E6F5FE', icon: 'book' },
  teacher: { label: 'Teacher', color: '#10B981', soft: '#E7F8F1', icon: 'easel' },
  admin: { label: 'Admin', color: '#F59E0B', soft: '#FEF3E2', icon: 'shield-checkmark' },
};

export const STOCK_IMAGES = [
  'https://picsum.photos/seed/crest-lab/900/600',
  'https://picsum.photos/seed/crest-books/900/600',
  'https://picsum.photos/seed/crest-field/900/600',
  'https://picsum.photos/seed/crest-hall/900/600',
  'https://picsum.photos/seed/crest-art/900/600',
  'https://picsum.photos/seed/crest-music/900/600',
  'https://picsum.photos/seed/crest-sport/900/600',
  'https://picsum.photos/seed/crest-trip/900/600',
  'https://picsum.photos/seed/crest-fair/900/600',
  'https://picsum.photos/seed/crest-grad/900/600',
  'https://picsum.photos/seed/crest-club/900/600',
  'https://picsum.photos/seed/crest-campus/900/600',
];

export const timeAgo = (ts: number): string => {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const fullDate = (ts: number): string =>
  new Date(ts).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
  ' · ' +
  new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

export const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
