'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  format,
  addDays,
  startOfDay,
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
import Item from '@/components/atoms/item/item';
import { toISODate, parseLocalDate, toAPIDateRange } from '@/lib/utils/date';
import type { DateRangeValue, RangePreset } from '@/lib/types/date';

type DateRangePickerProps = {
  value?: DateRangeValue;
  onChange: (val: DateRangeValue) => void;
  maxRangeDays?: number; // e.g. 30
};

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

export default function DateRangePicker({
  value,
  onChange,
  maxRangeDays = 30,
}: DateRangePickerProps) {
  const t = useTranslations('DateRangePicker');
  const locale = useLocale();
  const dfLocale: Locale = locale === 'pl' ? pl : enUS;
  // Week starts on Monday (1) for PL, Sunday (0) for EN
  const weekStartsOn = locale === 'pl' ? 1 : 0;

  // If no value provided, nothing is selected initially
  const preset = value?.preset ?? null;
  const fromISO = value?.fromISO ?? '';
  const toISO = value?.toISO ?? '';

  // Calendar state
  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    if (fromISO) return parseLocalDate(fromISO);
    return new Date();
  });
  const [selectingFrom, setSelectingFrom] = useState<Date | null>(null);

  // Remember last range selection to restore when switching back to 'range'
  const [lastRangeSelection, setLastRangeSelection] = useState<{
    fromISO: string;
    toISO: string;
  } | null>(preset === 'range' && fromISO && toISO ? { fromISO, toISO } : null);

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

    // range: restore last range selection if exists, otherwise start fresh
    setSelectingFrom(null);
    if (lastRangeSelection && lastRangeSelection.fromISO && lastRangeSelection.toISO) {
      // Restore previous range selection
      setDisplayMonth(parseLocalDate(lastRangeSelection.fromISO));
      return onChange({
        preset: 'range',
        fromISO: lastRangeSelection.fromISO,
        toISO: lastRangeSelection.toISO,
      });
    }
    // No previous selection - start fresh
    setDisplayMonth(new Date());
    return onChange({ preset: 'range', fromISO: '', toISO: '' });
  }

  function handleDayClick(day: Date) {
    const dayISO = toISODate(day);

    if (!selectingFrom) {
      // First click - start selection
      setSelectingFrom(day);
      emit('range', dayISO, dayISO);
    } else {
      // Second click - complete selection and save to lastRangeSelection
      const fromDate = selectingFrom;
      const toDate = day;

      let finalFrom: string;
      let finalTo: string;

      if (isBefore(toDate, fromDate)) {
        // If user clicked earlier date, swap them
        finalFrom = toISODate(toDate);
        finalTo = toISODate(fromDate);
      } else {
        finalFrom = toISODate(fromDate);
        finalTo = toISODate(toDate);
      }

      // Save this selection for later restoration
      setLastRangeSelection({ fromISO: finalFrom, toISO: finalTo });
      emit('range', finalFrom, finalTo);
      setSelectingFrom(null);
    }
  }

  const calendarDays = useMemo(
    () => getCalendarDays(displayMonth, weekStartsOn),
    [displayMonth, weekStartsOn],
  );

  // Calculate today once per day (not per render) to avoid infinite re-renders in useMemo
  const today = useMemo(() => {
    const now = new Date();
    return startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);

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
          <Item
            key={p}
            title={t(p)}
            selected={preset === p}
            onClick={() => applyPreset(p)}
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
              const fromDate = fromISO ? parseLocalDate(fromISO) : null;
              const toDate = toISO ? parseLocalDate(toISO) : null;
              const isSelected =
                (fromDate && isSameDay(day, fromDate)) ||
                (toDate && isSameDay(day, toDate));
              const isInRange =
                fromDate &&
                toDate &&
                !isSameDay(day, fromDate) &&
                !isSameDay(day, toDate) &&
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

          {(selectingFrom !== null || (fromISO && toISO)) && (
            <div className={styles.selectedRange}>
              <span className={styles.rangeLabel}>{t('from')}:</span>
              <span className={styles.rangeValue}>
                {format(fromISO ? parseLocalDate(fromISO) : displayMonth, dateFormat, {
                  locale: dfLocale,
                })}
              </span>
              <span className={styles.rangeLabel}>{t('to')}:</span>
              <span className={styles.rangeValue}>
                {format(toISO ? parseLocalDate(toISO) : displayMonth, dateFormat, {
                  locale: dfLocale,
                })}
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
