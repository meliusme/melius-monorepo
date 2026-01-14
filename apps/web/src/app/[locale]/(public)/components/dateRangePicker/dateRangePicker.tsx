'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  format,
  addDays as addDaysFns,
  startOfDay,
  endOfDay,
  nextMonday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  isSameDay,
  isWithinInterval,
  isBefore,
  isAfter,
} from 'date-fns';
import { enUS, pl } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import styles from './dateRangePicker.module.scss';
import Button from '@/components/atoms/button/button';

export type RangePreset = 'today' | 'tomorrow' | 'nextWeek' | 'range';

export type DateRangeValue = {
  preset: RangePreset;
  fromISO: string; // YYYY-MM-DD
  toISO: string; // YYYY-MM-DD
};

type DateRangePickerProps = {
  value?: DateRangeValue;
  onChange: (val: DateRangeValue) => void;
  maxRangeDays?: number; // e.g. 30
};

function toISODate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function addDays(d: Date, days: number): Date {
  return addDaysFns(d, days);
}

function parseLocalDate(isoString: string): Date {
  // Parse YYYY-MM-DD locally to avoid timezone shifts
  const [y, m, d] = isoString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Convert YYYY-MM-DD to start of day in local timezone, then to UTC
 * @example toStartOfDayISO('2026-01-13') => '2026-01-12T23:00:00.000Z' (when local is UTC+1)
 */
export function toStartOfDayISO(dateISO: string): string {
  return startOfDay(parseLocalDate(dateISO)).toISOString();
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

function startOfNextWeek(d: Date): Date {
  return nextMonday(d);
}

function endOfWeekFromMonday(monday: Date): Date {
  return addDays(monday, 6);
}

function clampRange(fromISO: string, toISO: string, maxDays: number) {
  const from = parseLocalDate(fromISO);
  const to = parseLocalDate(toISO);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()))
    return { fromISO, toISO };

  // swap if user reversed
  let a = from;
  let b = to;
  if (a > b) [a, b] = [b, a];

  const maxTo = addDays(a, maxDays);
  if (b > maxTo) b = maxTo;

  return { fromISO: toISODate(a), toISO: toISODate(b) };
}

function getCalendarDays(referenceDate: Date, weekStartsOn: 0 | 1 = 1) {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

  const days: Date[] = [];
  let current = calendarStart;
  while (current <= calendarEnd) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}

export function DateRangePicker({
  value,
  onChange,
  maxRangeDays = 30,
}: DateRangePickerProps) {
  const t = useTranslations('DateRangePicker');
  const locale = useLocale();
  const dfLocale: Locale = locale === 'pl' ? pl : enUS;
  // Week starts on Monday (1) for PL, Sunday (0) for EN
  const weekStartsOn = locale === 'pl' ? 1 : 0;

  // Derive current state from value prop (controlled) or default to today
  // Fresh Date() here ensures midnight rollover works correctly if page stays open
  const current = useMemo<DateRangeValue>(() => {
    if (value) return value;
    const today = toISODate(new Date());
    return { preset: 'today', fromISO: today, toISO: today };
  }, [value]);

  const { preset, fromISO, toISO } = current;

  // Calendar state
  const [displayMonth, setDisplayMonth] = useState<Date>(() => parseLocalDate(fromISO));
  const [selectingFrom, setSelectingFrom] = useState<Date | null>(null);

  function emit(nextPreset: RangePreset, nextFrom: string, nextTo: string) {
    const clamped = clampRange(nextFrom, nextTo, maxRangeDays);
    onChange({ preset: nextPreset, fromISO: clamped.fromISO, toISO: clamped.toISO });
  }

  function applyPreset(p: RangePreset) {
    // Fresh Date() on each click handles midnight rollover correctly
    const now = new Date();
    const today = toISODate(now);

    if (p === 'today') return emit('today', today, today);

    if (p === 'tomorrow') {
      const t = toISODate(addDays(now, 1));
      return emit('tomorrow', t, t);
    }

    if (p === 'nextWeek') {
      const mon = startOfNextWeek(now);
      const sun = endOfWeekFromMonday(mon);
      return emit('nextWeek', toISODate(mon), toISODate(sun));
    }

    // range: reset selection state and wait for user to select range
    setSelectingFrom(null);
    setDisplayMonth(parseLocalDate(fromISO));
    return emit('range', fromISO, toISO);
  }

  function handleDayClick(day: Date) {
    const dayISO = toISODate(day);

    if (!selectingFrom) {
      // First click - start selection
      setSelectingFrom(day);
      emit('range', dayISO, dayISO);
    } else {
      // Second click - complete selection
      const fromDate = selectingFrom;
      const toDate = day;

      if (isBefore(toDate, fromDate)) {
        // If user clicked earlier date, swap them
        emit('range', toISODate(toDate), toISODate(fromDate));
      } else {
        emit('range', toISODate(fromDate), toISODate(toDate));
      }
      setSelectingFrom(null);
    }
  }

  const calendarDays = useMemo(
    () => getCalendarDays(displayMonth, weekStartsOn),
    [displayMonth, weekStartsOn],
  );
  const fromDate = parseLocalDate(fromISO);
  const toDate = parseLocalDate(toISO);
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => addDays(today, maxRangeDays - 1), [today, maxRangeDays]);

  // Check if navigation buttons should be disabled
  const isPrevMonthDisabled = useMemo(() => {
    const prevMonth = addMonths(displayMonth, -1);
    return endOfMonth(prevMonth) < today;
  }, [displayMonth, today]);

  const isNextMonthDisabled = useMemo(() => {
    const nextMonth = addMonths(displayMonth, 1);
    return startOfMonth(nextMonth) > maxDate;
  }, [displayMonth, maxDate]);

  const dateFormat = locale === 'pl' ? 'd MMM yyyy' : 'MMM d, yyyy';
  const monthYearFormat = locale === 'pl' ? 'LLLL yyyy' : 'MMMM yyyy';

  return (
    <div className={styles.root}>
      <div className={styles.presets}>
        {(['today', 'tomorrow', 'nextWeek', 'range'] as const).map((p) => (
          <Button
            key={p}
            type="button"
            label={t(p)}
            onClick={() => applyPreset(p)}
            variant={preset === p ? 'primary' : 'secondary'}
            fullWidth
          />
        ))}
      </div>

      {preset === 'range' ? (
        <div className={`${styles.calendar} ${selectingFrom ? styles.selecting : ''}`}>
          <div className={styles.calendarHeader}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setDisplayMonth(addMonths(displayMonth, -1))}
              disabled={isPrevMonthDisabled}
              aria-label="Previous month"
            >
              ←
            </button>
            <span className={styles.monthYear}>
              {format(displayMonth, monthYearFormat, { locale: dfLocale })}
            </span>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
              disabled={isNextMonthDisabled}
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <div className={styles.weekDays}>
            {Array.from({ length: 7 }, (_, i) => {
              const date = addDays(startOfWeek(displayMonth, { weekStartsOn }), i);
              return (
                <div key={i} className={styles.weekDay}>
                  {format(date, 'EEE', { locale: dfLocale })}
                </div>
              );
            })}
          </div>

          <div className={styles.days}>
            {calendarDays.map((day, idx) => {
              // Show selection when:
              // - not in range mode, OR
              // - selection started (selectingFrom is set), OR
              // - range was already selected (from !== to or selection completed)
              const showSelection =
                preset !== 'range' || selectingFrom !== null || fromISO !== toISO;
              const isSelected =
                showSelection && (isSameDay(day, fromDate) || isSameDay(day, toDate));
              const isInRange =
                showSelection &&
                fromDate &&
                toDate &&
                isWithinInterval(day, { start: fromDate, end: toDate });
              const isOutsideMonth =
                day < startOfMonth(displayMonth) || day > endOfMonth(displayMonth);
              const isToday = isSameDay(day, today);
              const isDisabled =
                isOutsideMonth || isBefore(day, today) || isAfter(day, maxDate);
              const isSelectingStart = selectingFrom && isSameDay(day, selectingFrom);

              return (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.day} ${isSelected ? styles.daySelected : ''} ${isInRange && !isSelected ? styles.dayInRange : ''} ${isDisabled ? styles.dayDisabled : ''} ${isToday ? styles.dayToday : ''} ${isSelectingStart && !isSelected ? styles.daySelecting : ''}`}
                  onClick={() => handleDayClick(day)}
                  disabled={isDisabled}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {(selectingFrom !== null || fromISO !== toISO) && (
            <div className={styles.selectedRange}>
              <span className={styles.rangeLabel}>{t('from')}:</span>
              <span className={styles.rangeValue}>
                {format(fromDate, dateFormat, { locale: dfLocale })}
              </span>
              <span className={styles.rangeLabel}>{t('to')}:</span>
              <span className={styles.rangeValue}>
                {format(toDate, dateFormat, { locale: dfLocale })}
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
