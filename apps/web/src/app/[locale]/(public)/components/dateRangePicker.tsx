'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  format,
  addDays as addDaysFns,
  startOfDay,
  endOfDay,
  nextMonday,
} from 'date-fns';
import styles from './dateRangePicker.module.scss';
import Icon from '@/components/atoms/icon/icon';
import CalendarIcon from '@/assets/icons/calendar.svg';
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

export function DateRangePicker({
  value,
  onChange,
  maxRangeDays = 30,
}: DateRangePickerProps) {
  const t = useTranslations('DateRangePicker');

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  // Derive current state from value prop (controlled) or default to today
  // Fresh Date() here ensures midnight rollover works correctly if page stays open
  const current = useMemo<DateRangeValue>(() => {
    if (value) return value;
    const today = toISODate(new Date());
    return { preset: 'today', fromISO: today, toISO: today };
  }, [value]);

  const { preset, fromISO, toISO } = current;

  // Sync external value changes to input elements (for RHF integration)
  useEffect(() => {
    if (fromInputRef.current && fromInputRef.current.value !== fromISO) {
      fromInputRef.current.value = fromISO;
    }
    if (toInputRef.current && toInputRef.current.value !== toISO) {
      toInputRef.current.value = toISO;
    }
  }, [fromISO, toISO]);

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

    // range: keep current values
    return emit('range', fromISO, toISO);
  }

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
        <div className={styles.range}>
          <label className={styles.field}>
            <span className={styles.label}>{t('from')}</span>
            <div className={styles.inputWrapper}>
              <input
                ref={fromInputRef}
                className={styles.input}
                type="date"
                defaultValue={fromISO}
                onBlur={(e) => {
                  const v = e.target.value;
                  if (v && v.length === 10 && v !== fromISO) {
                    emit('range', v, toISO);
                  }
                }}
                max={toISO}
              />
              <Icon src={CalendarIcon} className={styles.icon} />
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{t('to')}</span>
            <div className={styles.inputWrapper}>
              <input
                ref={toInputRef}
                className={styles.input}
                type="date"
                defaultValue={toISO}
                onBlur={(e) => {
                  const v = e.target.value;
                  if (v && v.length === 10 && v !== toISO) {
                    emit('range', fromISO, v);
                  }
                }}
                min={fromISO}
              />
              <Icon src={CalendarIcon} className={styles.icon} />
            </div>
          </label>
        </div>
      ) : null}
    </div>
  );
}
