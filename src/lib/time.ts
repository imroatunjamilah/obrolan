import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

// "5 menit lalu", "baru saja", etc. Falls back gracefully if input is invalid.
export function relativeTime(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  if (!(date instanceof Date) || isNaN(date.getTime())) return 'baru saja';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return 'baru saja';
  try {
    return formatDistanceToNow(date, { addSuffix: true, locale: idLocale });
  } catch {
    return 'baru saja';
  }
}
