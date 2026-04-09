'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { differenceInMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { enUS, pl } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { Clock, Tag, ChevronRight, CalendarCheck } from 'lucide-react';
import type { components } from '@/generated/openapi';
import Button from '@/components/atoms/button/button';
import Avatar from '@/components/atoms/avatar/avatar';
import Label from '@/components/atoms/label/label';
import { Rate } from '@/components/atoms/rate/rate';
import styles from './docCard.module.scss';

type SearchMatchResult = components['schemas']['SearchMatchesResultDto'];
type Slot = components['schemas']['AvailabilitySlotEntity'];

type DocCardProps = {
  doc: SearchMatchResult;
  selectedSlotId: number | null;
  onSlotSelect: (slotId: number) => void;
  hideAvatar?: boolean;
};

export function formatDate(
  isoString: string,
  dfLocale: Locale,
  timeZone: string,
  t: (key: string) => string,
): string {
  const slotDate = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const slotDateOnly = formatInTimeZone(slotDate, timeZone, 'yyyy-MM-dd', {
    locale: dfLocale,
  });
  const todayDateOnly = formatInTimeZone(today, timeZone, 'yyyy-MM-dd', {
    locale: dfLocale,
  });
  const tomorrowDateOnly = formatInTimeZone(tomorrow, timeZone, 'yyyy-MM-dd', {
    locale: dfLocale,
  });

  if (slotDateOnly === todayDateOnly) {
    return t('today');
  }
  if (slotDateOnly === tomorrowDateOnly) {
    return t('tomorrow');
  }

  return formatInTimeZone(slotDate, timeZone, 'EEEE, dd.MM', {
    locale: dfLocale,
  });
}

export function formatShortDate(
  isoString: string,
  dfLocale: Locale,
  timeZone: string,
  t: (key: string) => string,
): { dayName: string; date: string } {
  const slotDate = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const slotDateOnly = formatInTimeZone(slotDate, timeZone, 'yyyy-MM-dd', {
    locale: dfLocale,
  });
  const todayDateOnly = formatInTimeZone(today, timeZone, 'yyyy-MM-dd', {
    locale: dfLocale,
  });
  const tomorrowDateOnly = formatInTimeZone(tomorrow, timeZone, 'yyyy-MM-dd', {
    locale: dfLocale,
  });

  if (slotDateOnly === todayDateOnly) {
    return {
      dayName: t('today'),
      date: formatInTimeZone(slotDate, timeZone, 'dd.MM', { locale: dfLocale }),
    };
  }
  if (slotDateOnly === tomorrowDateOnly) {
    return {
      dayName: t('tomorrow'),
      date: formatInTimeZone(slotDate, timeZone, 'dd.MM', { locale: dfLocale }),
    };
  }

  return {
    dayName: formatInTimeZone(slotDate, timeZone, 'EEE', { locale: dfLocale }),
    date: formatInTimeZone(slotDate, timeZone, 'dd.MM', { locale: dfLocale }),
  };
}

export function formatTime(
  isoString: string,
  dfLocale: Locale,
  timeZone: string,
): string {
  return formatInTimeZone(new Date(isoString), timeZone, 'HH:mm', { locale: dfLocale });
}

export function calculateSessionDuration(startTime: string, endTime: string): number {
  return differenceInMinutes(new Date(endTime), new Date(startTime));
}

export function formatPrice(amount: number, currency: string): string {
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

export function DocCard({
  doc,
  selectedSlotId,
  onSlotSelect,
  hideAvatar = false,
}: DocCardProps) {
  const t = useTranslations('DocCard');
  const locale = useLocale();
  const dfLocale = locale === 'pl' ? pl : enUS;
  const dayScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const timeZone = useMemo(() => {
    if (typeof window !== 'undefined') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return 'UTC';
  }, []);

  const sessionDuration = useMemo(() => {
    if (doc.slots.length > 0) {
      return calculateSessionDuration(doc.slots[0].startTime, doc.slots[0].endTime);
    }
    return 50;
  }, [doc.slots]);

  const slotsByDate = useMemo(() => {
    const grouped = new Map<
      string,
      { slots: Slot[]; dateKey: string; displayData: { dayName: string; date: string } }
    >();
    doc.slots.forEach((slot) => {
      const dateKey = formatInTimeZone(new Date(slot.startTime), timeZone, 'yyyy-MM-dd', {
        locale: dfLocale,
      });
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, {
          slots: [],
          dateKey,
          displayData: formatShortDate(slot.startTime, dfLocale, timeZone, t),
        });
      }
      grouped.get(dateKey)!.slots.push(slot);
    });
    return Array.from(grouped.values());
  }, [doc.slots, dfLocale, timeZone, t]);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    slotsByDate.length > 0 ? slotsByDate[0].dateKey : '',
  );

  const selectedDaySlots = useMemo(() => {
    const dayData = slotsByDate.find((d) => d.dateKey === selectedDateKey);
    return dayData?.slots || [];
  }, [slotsByDate, selectedDateKey]);

  // Find the selected slot for the booking confirmation strip
  const selectedSlot = useMemo(() => {
    if (selectedSlotId === null) return null;
    return doc.slots.find((s) => s.id === selectedSlotId) || null;
  }, [doc.slots, selectedSlotId]);

  const confirmLabel = useMemo(() => {
    if (!selectedSlot) return null;
    const date = formatDate(selectedSlot.startTime, dfLocale, timeZone, t);
    const time = formatTime(selectedSlot.startTime, dfLocale, timeZone);
    return t('confirmSlot', { date, time });
  }, [selectedSlot, dfLocale, timeZone, t]);

  const professionLabel = doc.profession ? t(doc.profession) : '';
  const fullName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
  const hasRating = doc.rate !== null && doc.ratesLot !== null && doc.ratesLot > 0;

  useEffect(() => {
    const checkScroll = () => {
      if (dayScrollRef.current) {
        const { scrollWidth, clientWidth } = dayScrollRef.current;
        setCanScrollRight(scrollWidth > clientWidth);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [slotsByDate]);

  const handleScrollRight = () => {
    if (dayScrollRef.current) {
      dayScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.infoSection}>
        <div className={`${styles.infoRow} ${hideAvatar ? styles.infoRowNoAvatar : ''}`}>
          {!hideAvatar && (
            <Avatar avatarUrl={doc.avatar?.url} name={fullName} sizeRem={6} />
          )}
          <div className={styles.infoDetails}>
            <h3 className={styles.name}>{fullName}</h3>
            <p className={styles.profession}>{professionLabel}</p>
            {hasRating && <Rate rate={doc.rate!} ratesLot={doc.ratesLot!} compact />}
            <div className={styles.sessionDetails}>
              <div className={styles.sessionItem}>
                <Clock size={16} />
                <span>{sessionDuration} min</span>
              </div>
              <div className={styles.sessionItem}>
                <Tag size={16} />
                <span>{formatPrice(doc.unitAmount || 0, doc.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Label text={t('availableSlots')} />
      <div className={styles.slotsSection}>
        <div className={styles.daySelector}>
          <div className={styles.dayScrollContainer} ref={dayScrollRef}>
            {slotsByDate.map((dayData) => (
              <button
                key={dayData.dateKey}
                className={`${styles.dayButton} ${selectedDateKey === dayData.dateKey ? styles.selected : ''}`}
                onClick={() => setSelectedDateKey(dayData.dateKey)}
              >
                <span className={styles.dayName}>{dayData.displayData.dayName}</span>
                <span className={styles.dayDate}>{dayData.displayData.date}</span>
              </button>
            ))}
          </div>
          {canScrollRight && (
            <button className={styles.scrollButton} onClick={handleScrollRight}>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
        <div className={styles.timeSlots}>
          {selectedDaySlots.map((slot) => (
            <Button
              key={slot.id}
              label={formatTime(slot.startTime, dfLocale, timeZone)}
              onClick={() => onSlotSelect(slot.id)}
              variant="preset"
              selected={selectedSlotId === slot.id}
              className={styles.slotButton}
            />
          ))}
        </div>
      </div>

      {/* Mobile booking confirmation strip */}
      <div
        className={`${styles.bookingStrip} ${selectedSlot ? styles.bookingStripVisible : ''}`}
      >
        <CalendarCheck size={16} className={styles.bookingStripIcon} />
        <span className={styles.bookingStripLabel}>{confirmLabel}</span>
      </div>
    </div>
  );
}
