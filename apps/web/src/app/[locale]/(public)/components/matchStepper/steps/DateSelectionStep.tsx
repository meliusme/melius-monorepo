import type { DateRangeValue } from '@/lib/types/date';
import DateRangePicker from '../../dateRangePicker/dateRangePicker';
import Button from '@/components/atoms/button/button';
import IconButton from '@/components/atoms/iconButton/iconButton';
import { Search } from 'lucide-react';
import StepWrapper from './StepWrapper';
import styles from '../matchStepper.module.scss';

type DateSelectionStepProps = {
  dateRange: DateRangeValue | null;
  onDateRangeChange: (value: DateRangeValue) => void;
  onBack: () => void;
  onNext: () => void;
  error: string | null;
  loading: boolean;
  backLabel: string;
  nextLabel: string;
  searchingLabel: string;
  image: string;
};

export default function DateSelectionStep({
  dateRange,
  onDateRangeChange,
  onBack,
  onNext,
  error,
  loading,
  backLabel,
  nextLabel,
  searchingLabel,
  image,
}: DateSelectionStepProps) {
  return (
    <StepWrapper stepNumber={2} image={image}>
      <DateRangePicker
        value={dateRange || undefined}
        onChange={onDateRangeChange}
        maxRangeDays={30}
      />
      <div className={styles.buttonContainer}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonGroup}>
          <IconButton ariaLabel={backLabel} onClick={onBack} disabled={loading} />
          <Button
            label={loading ? searchingLabel : nextLabel}
            onClick={onNext}
            disabled={
              dateRange === null || !dateRange.fromISO || !dateRange.toISO || loading
            }
            fullWidth
            large
            rounded
            icon={<Search size={16} />}
          />
        </div>
      </div>
    </StepWrapper>
  );
}
