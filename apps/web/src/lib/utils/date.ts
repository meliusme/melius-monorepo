import { format, startOfDay, endOfDay } from 'date-fns';
import type { DateRangeValue } from '@/lib/types/date';

/**
 * Convert Date to YYYY-MM-DD string
 */
export function toISODate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/**
 * Parse YYYY-MM-DD string to Date in local timezone (no timezone shift)
 * @example parseLocalDate('2026-01-15') => Date(2026, 0, 15) in local time
 */
export function parseLocalDate(isoString: string): Date {
  const [y, m, d] = isoString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Convert YYYY-MM-DD to start of day in local timezone, then to UTC
 * For today's date, use current time to ensure it's in the future for backend validation
 * @example toStartOfDayISO('2026-01-15') => '2026-01-15T10:30:00.000Z' (if today at 10:30) or '2026-01-15T00:00:00.000Z'
 */
export function toStartOfDayISO(dateISO: string): string {
  const parsed = parseLocalDate(dateISO);
  const today = new Date();
  const todayISO = format(today, 'yyyy-MM-dd');

  // If selecting today, use current time to ensure it's in the future
  if (dateISO === todayISO) {
    return today.toISOString();
  }

  return startOfDay(parsed).toISOString();
}

/**
 * Convert YYYY-MM-DD to end of day in local timezone, then to UTC
 * @example toEndOfDayISO('2026-01-13') => '2026-01-13T22:59:59.999Z' (when local is UTC+1)
 */
export function toEndOfDayISO(dateISO: string): string {
  return endOfDay(parseLocalDate(dateISO)).toISOString();
}

/**
 * Convert DateRangeValue to API-ready date range with full ISO 8601 timestamps
 * Converts local dates to UTC preserving the user's timezone context
 * @example toAPIDateRange({ preset: 'today', fromISO: '2026-01-13', toISO: '2026-01-13' })
 *   => { from: '2026-01-12T23:00:00.000Z', to: '2026-01-13T22:59:59.999Z' } (when in UTC+1)
 */
export function toAPIDateRange(value: DateRangeValue) {
  return {
    from: toStartOfDayISO(value.fromISO),
    to: toEndOfDayISO(value.toISO),
  };
}
