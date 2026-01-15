import type { SearchWithSlotsResponse } from '@/lib/types/api';
import DocCardList from '../../docCardList/docCardList';
import Button from '@/components/atoms/button/button';
import styles from '../matchStepper.module.scss';

type DocSelectionStepProps = {
  docs: SearchWithSlotsResponse;
  onSlotSelect: (slotId: number) => void;
  onBack: () => void;
  backLabel: string;
  emptyStateLabel: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
  getIndicatorAriaLabel: (index: number) => string;
};

export default function DocSelectionStep({
  docs,
  onSlotSelect,
  onBack,
  backLabel,
  emptyStateLabel,
  prevAriaLabel,
  nextAriaLabel,
  getIndicatorAriaLabel,
}: DocSelectionStepProps) {
  return (
    <>
      <DocCardList
        docs={docs}
        onSlotSelect={onSlotSelect}
        emptyStateLabel={emptyStateLabel}
        prevAriaLabel={prevAriaLabel}
        nextAriaLabel={nextAriaLabel}
        getIndicatorAriaLabel={getIndicatorAriaLabel}
      />
      <div className={styles.buttonContainer}>
        <Button label={backLabel} onClick={onBack} variant="secondary" />
      </div>
    </>
  );
}
