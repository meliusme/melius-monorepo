'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DocCard } from '../docCard/docCard';
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
  getDotAriaLabel,
}: DocCardListProps) {
  if (docs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{emptyStateLabel}</p>
      </div>
    );
  }

  return (
    <div className={styles.docCardList}>
      <DocCard
        doc={docs[currentIndex]}
        selectedSlotId={selectedSlotId}
        onSlotSelect={onSlotSelect}
      />
      {docs.length > 1 && (
        <div className={styles.navigation}>
          <button
            type="button"
            onClick={onPrevious}
            aria-label={prevAriaLabel}
            className={styles.navButton}
          >
            <ChevronLeft size={20} />
          </button>
          <div className={styles.dotsContainer}>
            {docs.map((doc, index) => (
              <button
                key={`${doc.id}-${index}`}
                type="button"
                onClick={() => onDotClick(index)}
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                aria-label={getDotAriaLabel(index + 1)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onNext}
            aria-label={nextAriaLabel}
            className={styles.navButton}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
