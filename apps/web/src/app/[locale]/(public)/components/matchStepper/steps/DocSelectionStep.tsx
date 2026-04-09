'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarCheck } from 'lucide-react';
import type { SearchWithSlotsResponse } from '@/lib/types/api';
import DocCardList from '../../docCardList/docCardList';
import StepWrapper from './StepWrapper';
import StepButtonGroup from './StepButtonGroup';

type DocSelectionStepProps = {
  docs: SearchWithSlotsResponse;
  onSlotSelect: (slotId: number) => void;
  onBack: () => void;
  backLabel: string;
  emptyStateLabel: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
  getDotAriaLabel: (index: number) => string;
  image: string;
};

export default function DocSelectionStep({
  docs,
  onSlotSelect,
  onBack,
  backLabel,
  emptyStateLabel,
  prevAriaLabel,
  nextAriaLabel,
  getDotAriaLabel,
  image,
}: DocSelectionStepProps) {
  const t = useTranslations('DocCard');
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSlotClick = (slotId: number) => {
    setSelectedSlotId(slotId);
  };

  const handleBookSession = () => {
    if (selectedSlotId) {
      onSlotSelect(selectedSlotId);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? docs.length - 1 : prev - 1));
    setSelectedSlotId(null);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === docs.length - 1 ? 0 : prev + 1));
    setSelectedSlotId(null);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setSelectedSlotId(null);
  };

  return (
    <StepWrapper
      stepNumber={3}
      image={image}
      variables={{ count: docs.length }}
      footer={
        <StepButtonGroup
          backLabel={backLabel}
          onBack={onBack}
          primaryLabel={t('bookSession')}
          onPrimary={handleBookSession}
          primaryDisabled={selectedSlotId === null}
          primaryIcon={<CalendarCheck size={16} />}
        />
      }
    >
      <DocCardList
        docs={docs}
        selectedSlotId={selectedSlotId}
        onSlotSelect={handleSlotClick}
        emptyStateLabel={emptyStateLabel}
        currentIndex={currentIndex}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onDotClick={handleDotClick}
        prevAriaLabel={prevAriaLabel}
        nextAriaLabel={nextAriaLabel}
        getDotAriaLabel={getDotAriaLabel}
      />
    </StepWrapper>
  );
}
