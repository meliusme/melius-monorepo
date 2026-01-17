'use client';

import { useState } from 'react';
import { DocCard } from '../docCard/docCard';
import type { components } from '@/generated/openapi';
import styles from './docCardList.module.scss';

type SearchMatchResult = components['schemas']['SearchMatchesResultDto'];

type DocCardListProps = {
  docs: SearchMatchResult[];
  onSlotSelect?: (slotId: number) => void;
  emptyStateLabel: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
  getIndicatorAriaLabel: (index: number) => string;
};

export default function DocCardList({
  docs,
  onSlotSelect,
  emptyStateLabel,
  prevAriaLabel,
  nextAriaLabel,
  getIndicatorAriaLabel,
}: DocCardListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : docs.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < docs.length - 1 ? prev + 1 : 0));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  if (docs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{emptyStateLabel}</p>
      </div>
    );
  }

  return (
    <div className={styles.docCardList}>
      <div className={styles.carouselContainer}>
        <button
          className={styles.navButton}
          onClick={handlePrev}
          aria-label={prevAriaLabel}
        >
          ←
        </button>

        <div
          className={styles.cardWrapper}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <DocCard doc={docs[currentIndex]} onSlotSelect={onSlotSelect} />
        </div>

        <button
          className={styles.navButton}
          onClick={handleNext}
          aria-label={nextAriaLabel}
        >
          →
        </button>
      </div>

      <div className={styles.indicators}>
        {docs.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.indicatorActive : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={getIndicatorAriaLabel(index)}
          />
        ))}
      </div>

      <div className={styles.counter}>
        {currentIndex + 1} / {docs.length}
      </div>
    </div>
  );
}
