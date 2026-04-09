'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DocCard } from '../docCard/docCard';
import Avatar from '@/components/atoms/avatar/avatar';
import type { components } from '@/generated/openapi';
import styles from './docCardList.module.scss';

type SearchMatchResult = components['schemas']['SearchMatchesResultDto'];

type DocCardListProps = {
  docs: SearchMatchResult[];
  selectedSlotId: number | null;
  onSlotSelect: (slotId: number) => void;
  emptyStateLabel: string;
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
  prevAriaLabel: string;
  nextAriaLabel: string;
  getDotAriaLabel: (index: number) => string;
};

export default function DocCardList({
  docs,
  selectedSlotId,
  onSlotSelect,
  emptyStateLabel,
  currentIndex,
  onPrevious,
  onNext,
  onDotClick,
  prevAriaLabel,
  nextAriaLabel,
}: DocCardListProps) {
  const t = useTranslations('DocCard');
  const touchStartX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) onPrevious();
    else if (deltaX < -50) onNext();
  };

  if (docs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{emptyStateLabel}</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: single card, swipe gesture, counter */}
      <div className={styles.mobileLayout}>
        {docs.length > 1 && (
          <div className={styles.mobileNav}>
            <button
              type="button"
              onClick={onPrevious}
              aria-label={prevAriaLabel}
              className={styles.navButton}
            >
              <ChevronLeft size={18} />
            </button>
            <span className={styles.counter}>
              {t('therapistCount', { current: currentIndex + 1, total: docs.length })}
            </span>
            <button
              type="button"
              onClick={onNext}
              aria-label={nextAriaLabel}
              className={styles.navButton}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
        <div
          className={styles.swipeArea}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <DocCard
            doc={docs[currentIndex]}
            selectedSlotId={selectedSlotId}
            onSlotSelect={onSlotSelect}
          />
        </div>
      </div>

      {/* Desktop: avatar chips row + selected therapist card */}
      <div className={styles.desktopLayout}>
        {docs.length > 1 && (
          <div className={styles.chipsRow}>
            {docs.map((doc, index) => {
              const fullName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
              const firstName = doc.firstName || fullName;
              return (
                <button
                  key={doc.id}
                  type="button"
                  className={`${styles.chip} ${index === currentIndex ? styles.chipActive : ''}`}
                  onClick={() => onDotClick(index)}
                >
                  <span className={styles.chipAvatar}>
                    <Avatar avatarUrl={doc.avatar?.url} name={fullName} sizeRem={4.8} />
                  </span>
                  <span className={styles.chipName}>{firstName}</span>
                </button>
              );
            })}
          </div>
        )}
        <DocCard
          doc={docs[currentIndex]}
          selectedSlotId={selectedSlotId}
          onSlotSelect={onSlotSelect}
          hideAvatar
        />
      </div>
    </>
  );
}
