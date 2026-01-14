'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { differenceInMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { enUS, pl } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import type { components } from '@/generated/openapi';
import Card from '@/components/atoms/card/card';
import Button from '@/components/atoms/button/button';
import Avatar from '@/components/atoms/avatar/avatar';
import { Rate } from '@/components/atoms/rate/rate';
import styles from './docCard.module.scss';

type SearchMatchResult = components['schemas']['SearchMatchesResultDto'];
type Slot = components['schemas']['AvailabilitySlotEntity'];

type DocCardProps = {
  doc: SearchMatchResult;
  onSlotSelect?: (slotId: number) => void;
};

function formatDate(isoString: string, dfLocale: Locale, timeZone: string): string {
  return formatInTimeZone(new Date(isoString), timeZone, 'EEE dd.MM', {
    locale: dfLocale,
  });
}

function formatTime(isoString: string, dfLocale: Locale, timeZone: string): string {
  return formatInTimeZone(new Date(isoString), timeZone, 'HH:mm', { locale: dfLocale });
}

function calculateSessionDuration(startTime: string, endTime: string): number {
  return differenceInMinutes(new Date(endTime), new Date(startTime));
}

function formatPrice(amount: number, currency: string): string {
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

export function DocCard({ doc, onSlotSelect }: DocCardProps) {
  const t = useTranslations('DocCard');
  const locale = useLocale();
  const dfLocale = locale === 'pl' ? pl : enUS;

  // Auto-detect user's timezone
  const [timeZone, setTimeZone] = useState<string>('UTC');

  useEffect(() => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimeZone(userTimeZone);
  }, []);

  const sessionDuration = useMemo(() => {
    if (doc.slots.length > 0) {
      return calculateSessionDuration(doc.slots[0].startTime, doc.slots[0].endTime);
    }
    return 50; // default
  }, [doc.slots]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, Slot[]>();
    doc.slots.forEach((slot) => {
      const dateKey = formatDate(slot.startTime, dfLocale, timeZone);
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(slot);
    });
    return grouped;
  }, [doc.slots, dfLocale, timeZone]);

  const dates = useMemo(() => Array.from(slotsByDate.keys()), [slotsByDate]);
  const [activeDate, setActiveDate] = useState<string>(dates[0] || '');

  const professionLabel = doc.profession ? t(doc.profession) : '';
  const fullName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
  const hasRating = doc.rate !== null && doc.ratesLot !== null && doc.ratesLot > 0;

  return (
    <Card padding={2}>
      <div className={styles.root}>
        <div className={styles.header}>
          <Avatar avatarUrl={doc.avatar?.url} name={fullName} sizeRem={8} />
          {hasRating && (
            <div className={styles.rating}>
              <Rate rate={doc.rate!} ratesLot={doc.ratesLot!} compact />
            </div>
          )}
        </div>

        <div className={styles.info}>
          <h3 className={styles.name}>{fullName}</h3>
          <p className={styles.profession}>{professionLabel}</p>
          <p className={styles.sessionInfo}>
            {sessionDuration} min / {formatPrice(doc.unitAmount || 0, doc.currency)}
          </p>
        </div>

        {/* Desktop: show all dates vertically */}
        <div className={styles.slotsDesktop}>
          {Array.from(slotsByDate.entries()).map(([date, dateSlots]) => (
            <div key={date} className={styles.dateGroup}>
              <div className={styles.dateHeader}>{date}</div>
              <div className={styles.timeSlots}>
                {dateSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    label={formatTime(slot.startTime, dfLocale, timeZone)}
                    onClick={() => onSlotSelect?.(slot.id)}
                    variant="primary"
                    className={styles.slotButton}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: horizontal date scroll + 3-column grid */}
        <div className={styles.slotsMobile}>
          <div className={styles.dateScroll}>
            {dates.map((date) => (
              <button
                key={date}
                className={`${styles.dateChip} ${activeDate === date ? styles.dateChipActive : ''}`}
                onClick={() => setActiveDate(date)}
              >
                {date}
              </button>
            ))}
          </div>

          {activeDate && slotsByDate.has(activeDate) && (
            <div className={styles.timeSlotsGrid}>
              {slotsByDate.get(activeDate)!.map((slot) => (
                <Button
                  key={slot.id}
                  label={formatTime(slot.startTime, dfLocale, timeZone)}
                  onClick={() => onSlotSelect?.(slot.id)}
                  variant="primary"
                  className={styles.slotButton}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
